---
title: 在idea中使用中转站的claude code
date: 2026-04-28
summary: 解决中转站在idea内的使用问题
tags: [ide]
category: ide
lang: zh-CN
---
这里使用的是ikun中转站
先在本地安装claude code cli
在用户主目录下找到 ~/.claude.json 文件，在末尾添加 "hasCompletedOnboarding": true 字段：

```json
{
  "installMethod": "unknown",
  "autoUpdates": true,
  "firstStartTime": "2025-07-14T06:11:03.877Z",
  "userID": "xxxx",
  "projects": {
    "/home/your-user": {
      "allowedTools": [],
      "history": [],
      "mcpContextUris": [],
      "mcpServers": {},
      "enabledMcpjsonServers": [],
      "disabledMcpjsonServers": [],
      "hasTrustDialogAccepted": false,
      "projectOnboardingS[settings.json](../../../../../../.claude/settings.json)eenCount": 0,
      "hasClaudeMdExternalIncludesApproved": false,
      "hasClaudeMdExternalIncludesWarningShown": false
    }
  },  // 这里要加英文逗号
  "hasCompletedOnboarding": true  // 新增此字段
}
```
用户目录下的.claude文件夹下有个 settings.json ，加入：  
```json

{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "$apikey",
    "ANTHROPIC_BASE_URL": "$baseurl",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1
  },
  //.....
}
然后  PowerShell：
```shell
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "sk-xxx", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://api.ikuncode.cc", "User")
```
最后idea内使用，右上角 选择 添加自定义智能体
![img.png](assets/img2.png)
进入 acp配置，添加
```json
{
  "agent_servers": {
    "Claude Code": {
      "command": "claude-agent-acp.cmd",
      "args": ["--hide-claude-auth"],
    }
  }
}
```