---
title: 解决codex acp使用第三方中转站url的问题
date: 2026-06-08
summary: 无需修改源码，指定鉴权网关地址即可
tags: [ide]
category: ide
lang: zh-CN
---
git clone https://github.com/agentclientprotocol/codex-acp# 到本地  
``` npm config set registry https://registry.npmmirror.com ``` 安装依赖   
在idea的acp配置里添加  
```json
{
  "agent_servers": {
    "Codex Acp": {
      "command": "npx",
      "args": [
        "npm",
        "run",
        "start",
        "--prefix",
        "源码位置"
      ],
      "env": {
        "CODEX_PATH": "node_modules/.bin/codex",
        "APP_SERVER_LOGS": "自己指定一个日志位置",
        "DEFAULT_AUTH_REQUEST": "{\"methodId\":\"gateway\",\"_meta\":{\"gateway\":{\"baseUrl\":\"中转站url\",\"providerName\":\"MyGateway\",\"headers\":{\"Authorization\":\"Bearer api-key\"}}}}"
      }
    }
  }
}
```   
然后就可以正常使用了
