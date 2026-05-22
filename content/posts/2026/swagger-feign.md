---
title: 关于spring-openapi的get请求 query字段问题
date: 2026-05-22
summary: 解决再knife4j中和feign client中的冲突
tags: [web,spring]
category: spring
lang: zh-CN
---
首先遇到了生成open feign的client包时，get请求的参数如果是自定义类型不会携带 `@SpringQueryMap`  
这种情况需要调整 打client包的 useSpringQueryMap 相关设置

get请求的自定义类型，再knife4j上会很奇怪，这是作者的答复
https://doc.xiaominfo.com/docs/faq/v4/knife4j-parameterobject-flat-param  
但是如果添加 `@ParameterObject`,client包的参数也会被拆分，这个时候需要扩展一些信息,例如：
```java
 private OperationCustomizer queryDtoOperationCustomizerInner() {
        return (operation, handlerMethod) -> {
            MethodParameter[] methodParameters = handlerMethod.getMethodParameters();

            for (MethodParameter methodParameter : methodParameters) {
                QueryDto queryDto = methodParameter.getParameterAnnotation(QueryDto.class);
                ParameterObject parameterObject = methodParameter.getParameterAnnotation(ParameterObject.class);

                if (queryDto != null && parameterObject != null) {
                    Class<?> dtoType = methodParameter.getParameterType();
                    List<String> fields = Arrays.stream(dtoType.getDeclaredFields())
                        .filter(field -> !Modifier.isStatic(field.getModifiers())).map(Field::getName).toList();

                    Map<String, Object> extension = new LinkedHashMap<>();
                    extension.put("name", queryDto.value());
                    extension.put("schema", dtoType.getSimpleName());
                    extension.put("fields", fields);

                    operation.addExtension("x-query-dto", extension);
                }
            }
            return operation;
        };
    }
```
```java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface QueryDto {
    String value() default "dto";
}
```
然后client打包的时候，找寻这些扩展信息，完成把拆开的 @RequestParam 合并成类（Schem）
```perl
perl - "${openapi_input}" "${client_openapi_input}" <<'PERL'
use strict;
use warnings;
use utf8;
use JSON::PP;

my ($input, $output) = @ARGV;
if (!$input) {
    die "Usage: merge-query-dto <input-openapi.json> [output-openapi.json]\n";
}

$output ||= $input;

open my $in, '<:encoding(UTF-8)', $input or die "Cannot read $input: $!";
local $/;
my $json = <$in>;
close $in;

my $doc = JSON::PP->new->decode($json);
my $paths = $doc->{paths} || {};
my @http_methods = qw(get put post delete patch options head trace);

for my $path (values %{$paths}) {
    next if ref($path) ne 'HASH';

    for my $method (@http_methods) {
        my $operation = $path->{$method};
        next if ref($operation) ne 'HASH';

        my $query_dto = $operation->{'x-query-dto'};
        next if ref($query_dto) ne 'HASH';

        my $dto_name = $query_dto->{name} || 'dto';
        my $schema_name = resolve_schema_name($query_dto->{schema} || $query_dto->{schemaName});
        die "x-query-dto.schema is required for operation $operation->{operationId}\n" if !$schema_name;

        $schema_name =~ s{^#/components/schemas/}{};

        my @fields = resolve_fields($query_dto->{fields});
        my %field_names = map { $_ => 1 } @fields;
        die "x-query-dto.fields is required for operation $operation->{operationId}\n" if !%field_names;

        my @parameters = grep { ref($_) eq 'HASH' } @{ $operation->{parameters} || [] };
        my @dto_fields;
        my @kept_parameters;

        for my $parameter (@parameters) {
            if (($parameter->{in} || '') eq 'query' && $field_names{$parameter->{name} || ''}) {
                push @dto_fields, $parameter;
                next;
            }

            push @kept_parameters, $parameter;
        }

        next if !@dto_fields;

        ensure_query_dto_schema($doc, $schema_name, \@dto_fields);

        push @kept_parameters, {
            name => $dto_name,
            in => 'query',
            required => JSON::PP::false,
            schema => {
                '$ref' => "#/components/schemas/$schema_name",
            },
        };

        $operation->{parameters} = \@kept_parameters;
        print "Merged query dto for operation " . ($operation->{operationId} || '<unknown>') . ": $schema_name $dto_name\n";
    }
}

open my $out, '>:encoding(UTF-8)', $output or die "Cannot write $output: $!";
print {$out} JSON::PP->new->utf8(0)->pretty->canonical->encode($doc);
close $out;

sub ensure_query_dto_schema {
    my ($doc, $schema_name, $dto_fields) = @_;

    $doc->{components} ||= {};
    $doc->{components}->{schemas} ||= {};

    return if exists $doc->{components}->{schemas}->{$schema_name};

    my %properties;
    my @required;

    for my $field (@{$dto_fields}) {
        my $name = $field->{name};
        next if !$name;

        my $schema = $field->{schema} || { type => 'string' };
        $properties{$name} = $schema;

        push @required, $name if $field->{required};
    }

    my $schema = {
        type => 'object',
        properties => \%properties,
    };

    $schema->{required} = \@required if @required;
    $doc->{components}->{schemas}->{$schema_name} = $schema;
}

sub resolve_schema_name {
    my ($schema) = @_;

    return undef if !defined $schema;
    return $schema if !ref($schema);

    if (ref($schema) eq 'HASH') {
        return $schema->{'$ref'} if $schema->{'$ref'};
        return $schema->{ref} if $schema->{ref};
        return $schema->{name} if $schema->{name};
        return $schema->{schema} if $schema->{schema} && !ref($schema->{schema});
    }

    return undef;
}

sub resolve_fields {
    my ($fields) = @_;

    return () if !defined $fields;

    if (ref($fields) eq 'ARRAY') {
        return grep { defined $_ && $_ ne '' } map { "$_" } @{$fields};
    }

    if (!ref($fields)) {
        my $text = "$fields";
        $text =~ s/^\s*\[//;
        $text =~ s/\]\s*$//;
        return grep { $_ ne '' } map {
            my $field = $_;
            $field =~ s/^\s+|\s+$//g;
            $field =~ s/^['"]|['"]$//g;
            $field;
        } split /,/, $text;
    }

    return ();
}
PERL
```
