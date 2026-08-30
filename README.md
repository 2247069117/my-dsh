# my-dsh

DeepSeek Harness 插件/补丁/preset 合集 · Collection of DSH plugins, patches & presets

## 插件（plugins/）

| 插件 | 类型 | 说明 | 安装 |
| --- | --- | --- | --- |
| [@lynn123411/dsh-ui-deepseek-bg](./plugins/dsh-ui-deepseek-bg) | `dsh.bundle` + `dsh.client/web` | 仿 DeepSeek Harness 官网风格背景引擎：极光/粒子鲸鱼/星座网格/鼠标跟随交互，内置「背景特效」GPU 调优面板 | `dsh plugin --profile web add @lynn123411/dsh-ui-deepseek-bg` |
| [@lynn123411/dsh-ui-beam-orbs](./plugins/dsh-ui-beam-orbs) | `dsh.bundle` + `dsh.client/web` | 官网风格界面皮肤层：玻璃拟态 + Border Beam + Thinking Orbs + Pulse 任务框 + 发送按钮微动效，内置「界面特效」面板 | `dsh plugin --profile web add @lynn123411/dsh-ui-beam-orbs` |
| [@lynn123411/dsh-workspace-tree](./plugins/dsh-workspace-tree) | `dsh.bundle` + `dsh.client/web` | 工作区树：文件系统推导多级树（文件夹/工作区双模式，环境严格隔离）+ 快捷在外部 IDE（VS Code、CodeBuddy、Cursor、Windsurf、Trae、JetBrains 等）打开工作区 + 全局会话重命名与物理归档删除管理 | `dsh plugin --profile web add @lynn123411/dsh-workspace-tree` |
| [@lynn123411/dsh-oil-sticky-prompt](./plugins/dsh-oil-sticky-prompt) | `dsh.bundle` + `dsh.client/web` | 对话吸顶提示：将最近的用户 Prompt 悬浮固定在对话流顶部，点击平滑回滚至对应消息 | `dsh plugin --profile web add @lynn123411/dsh-oil-sticky-prompt` |
| [@lynn123411/dsh-chat-translate](./plugins/dsh-chat-translate) | `dsh.bundle` + `dsh.client/web` | 工具调用与思考摘要自动翻译（仅当前会话，正文不翻）：OpenAI 兼容 AI 通道（可配 Base URL/模型，Key 存 `~/.dsh/.credentials.yaml`）+ 免 Key Bing 兜底双通道，内置「聊天翻译」设置面板 | `dsh plugin --profile web add @lynn123411/dsh-chat-translate` |
| [@lynn123411/dsh-a6api](./plugins/dsh-a6api) | `dsh.bundle` + `dsh.client/web` | A6API 多模型聚合站接入：原生 LLM 提供商注册、账户实时余额监控、Token 模型白名单同步、商户线路实时探测与全景指标卡片 | `dsh plugin --profile web add @lynn123411/dsh-a6api` |

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
| [dsh-message-edit-log-compat](./scripts/dsh-message-edit-log-compat/) | DSH 本地补丁：修复第三方插件 `dsh-message-edit` 写入自定义事件 `message-edit/version` 导致的历史会话加载失败问题。详情见其目录内 [README](./scripts/dsh-message-edit-log-compat/README.md) |