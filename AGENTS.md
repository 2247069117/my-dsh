# AGENTS.md
## 项目概述

`my-dsh` 是 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)(DSH)的插件/补丁/preset合集

## 补丁脚本约定(`scripts/<patch-name>/`)

每个补丁目录包含 `<patch-name>.sh` + `README.md`

## 插件要求(`dsh-<name>/`)

一个插件一个目录,目录名 = 包名(`dsh-*`)，每个目录包含 `README.md`

## preset 要求(`<preset-id>/`,入 `~/.dsh/.agent-presets/`)

一个 preset 一个目录,**目录名 = preset id**，每个目录包含 `README.md`