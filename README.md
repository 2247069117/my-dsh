# my-dsh

DeepSeek Harness 插件合集 · Collection of DSH plugins

| 插件 | 类型 | 说明 | 安装 |
| --- | --- | --- | --- |
| [dsh-client-ui-deepseek-bg](./dsh-client-ui-deepseek-bg) | `dsh.bundle` + `dsh.client/web` | 仿 DeepSeek Harness 官网风格深色皮肤：极光/粒子鲸鱼/星座网格 + 玻璃拟态 + Border Beam + Thinking Orbs + Pulse 任务框，内置「背景特效」GPU 调优面板 | `dsh plugin --profile web add dsh-client-ui-deepseek-bg` |
| [dsh-workspace-tree](./dsh-workspace-tree) | `dsh.bundle` + `dsh.client/web` | 工作区树：左侧栏工作区从单层升级为多级文件夹树——文件夹任意嵌套、会话可归入任意文件夹，附带新建/重命名/删除/移动管理 | `dsh plugin --profile web add dsh-workspace-tree` |
| [dsh-escalation-noop](./dsh-escalation-noop) | 手工补丁文档（无 bundle） | 同模式 `sandbox_permissions` 升级错误的本地代码补丁说明（`local patch (user)`） | 按 `README` 手动 patch `@deepseek-ai/dsh-sandbox` |
| [dsh-presets/ptc-creative-cordis](./dsh-presets/ptc-creative-cordis) | `agent preset` (`preset.yml`+`agent.cordis.yml`) | PTC 创造·混合模式：融合 PTC `code` 能力与动态 Cordis 插件编辑 | 放入 `~/.dsh/.agent-presets/` 或 preset 市场 |