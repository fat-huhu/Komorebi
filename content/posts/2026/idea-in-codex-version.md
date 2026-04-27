---
title: 在idea中更新其托管codex版本
date: 2026-04-25
summary: 解决idea默认覆盖版本问题
tags: [ide]
category: ide
lang: zh-CN
---
idea会默认检查codex版本，其他托管agent应该同理  
首选去GitHub下载新版codex https://github.com/openai/codex/releases/  
codex-x86_64-pc-windows-msvc.exe.zip  
然后替换idea的本地托管文件  
重点来了，在idea内搜索注册表，注册表内搜索codex，修改版本号  
![img.png](assets/img.png)  
重启即可使用新版codex
