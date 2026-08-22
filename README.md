# my-dsh

DeepSeek Harness 插件/补丁/preset 合集 · Collection of DSH plugins, patches & presets

## 插件（plugins/）

| 插件 | 类型 | 说明 | 安装 |
| --- | --- | --- | --- |
| [dsh-client-ui-deepseek-bg](./dsh-client-ui-deepseek-bg) | `dsh.bundle` + `dsh.client/web` | 仿 DeepSeek Harness 官网风格深色皮肤：极光/粒子鲸鱼/星座网格 + 玻璃拟态 + Border Beam + Thinking Orbs + Pulse 任务框，内置「背景特效」GPU 调优面板 | `dsh plugin --profile web add dsh-client-ui-deepseek-bg` |
| [dsh-workspace-tree](./dsh-workspace-tree) | `dsh.bundle` + `dsh.client/web` | 工作区树：左侧栏工作区从单层升级为多级文件夹树——文件夹任意嵌套、会话可归入任意文件夹，附带新建/重命名/删除/移动管理 | `dsh plugin --profile web add dsh-workspace-tree` |

## agent presets

> preset 不是插件，不装进 DSH 的插件目录，而是放入 `~/.dsh/.agent-presets/<preset-id>/`，一个目录一个 preset。

| preset | 说明 |
| --- | --- |
| [ptc-creative-cordis](./dsh-presets/ptc-creative-cordis) | PTC 创造·混合模式：融合 PTC `code` 能力与动态 Cordis 插件编辑（`preset.yml`+`agent.cordis.yml`），放入 `~/.dsh/.agent-presets/` 或 preset 市场 |

## scripts/ 本地补丁脚本

| 目录 | 说明 |
| --- | --- |
| [patch-dsh-finish-reason](./scripts/patch-dsh-finish-reason/) | DSH 本地补丁：修复「流结束不带 `finish_reason`」导致的报错、内容丢弃与整轮重试（`openai-completions` 协议的通用检查，对所有手写声明的自定义路由默认生效，如 opencode.ai zen/go、各类中转网关）。详情见其目录内 [README](./scripts/patch-dsh-finish-reason/README.md) |
| [patch-dsh-escalation-noop](./scripts/patch-dsh-escalation-noop/) | DSH 本地补丁：`dsh-sandbox` 同模式 `sandbox_permissions` 升级 no-op 放行（`danger→danger` 不再报错，真实升级仍审批、降级仍拒绝）。详情见其目录内 [README](./scripts/patch-dsh-escalation-noop/README.md) |