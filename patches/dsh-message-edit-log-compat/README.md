# dsh-message-edit-log-compat

修复因第三方插件 `dsh-message-edit` 写入会话日志导致的 **历史加载失败**：

```
SessionFormatUnsupportedError: session "..." contains event type
"message-edit/version" (seq 293) unknown to this harness and not marked
ignorable; refusing to interpret the log — it was likely written by a newer harness
(raw log: .../session.jsonl.zstd)
```

## 问题根因

[`dsh-message-edit`](https://www.npmjs.com/package/dsh-message-edit)（Moeblack/dsh-message-edit，基于事件溯源的「消息编辑 / Reroll / Retry」插件）在每次编辑时**分支出一个新会话版本**：新会话的 seed 中含有一个插件自定义事件 `message-edit/version`（记录 `effect` 编辑效果与 `inverse` 恢复目标）。

DSH 会话持久化读取路径（`PersistenceCoordinator.assertEventsSupported`）只接受 **harness 自身已知的事件类型**（`KNOWN_SESSION_EVENT_TYPES`）或带 `ignorable: true` 标记的事件；插件事件不在核心目录内、也没有标记 ignorable，因此加载任一含该事件的已存储会话时直接拒绝（同「由更新版本 harness 写入」的诊断）。写入路径不设此闸门，所以分支创建时一切正常，失败只出现在**读取/恢复**时——包括页面刷新后 GUI 重新加载会话历史。

上游 master（deepseek-harness，2026-08）目录同样不含 `message-edit/version`，且契约明确「插件自定义事件在目录之外，注册面延后」。因此正确修复点是：

1. 写入侧：插件把自定义事件标记为 `ignorable: true`（符合 `SessionEvent.ignorable` 信封契约，官方 harness 也接受）；
2. 读取侧：本机安装的 `@deepseek-ai/dsh-session` 目录中加入 `message-edit/version`（该事件仅为日志元数据，不参与消息重建，接受它语义安全），使**存量**日志无需改写任何字节即可加载。

## 修复内容

| 文件 | 改动 |
| --- | --- |
| `<global>/node_modules/@deepseek-ai/dsh-session/lib/index.js` | `KNOWN_SESSION_EVENT_TYPES` 增加 `"message-edit/version"`（带 LOCAL PATCH 注释） |
| `<global>/node_modules/@deepseek-ai/dsh-session/lib/types/known-event-types.js` | 同上（生成目录的独立副本，保持同步） |
| `~/.dsh/profiles/*/node_modules/dsh-message-edit/index.mjs` | `appendLogSeedEvent` 对 `message-edit/version` 附加 `ignorable: true` |

> 两个改动都是**幂等的**：脚本检测到已应用即跳过；升级 harness / 插件后重新运行本脚本即可。
> **不修改任何会话日志字节**：存量事件保持原样，只是读取侧现在认识该类型。

## 使用

```bash
patches/dsh-message-edit-log-compat/dsh-message-edit-log-compat.sh            # 应用（幂等）
patches/dsh-message-edit-log-compat/dsh-message-edit-log-compat.sh check      # 校验补丁是否在位
patches/dsh-message-edit-log-compat/dsh-message-edit-log-compat.sh verify     # 用真实读取路径加载全部会话
patches/dsh-message-edit-log-compat/dsh-message-edit-log-compat.sh verify <session-id>  # 指定会话
patches/dsh-message-edit-log-compat/dsh-message-edit-log-compat.sh revert     # 撤销
```

应用/撤销后**必须重启 `dsh web`**（运行中的进程仍持有旧代码），例如：停止当前服务（Ctrl-C 或 DSH Launcher）后重新 `dsh web`。

环境变量：`DSH_GLOBAL_DIR`（不含时自动推导）、`DSH_SESSIONS_ROOT`（默认 `~/.dsh/sessions`）。

验证脚本 `verify-session-load.mjs` 在全新 Node 进程中走真实链路：
`JsonlSessionPersistence` 后端 → `PersistenceCoordinator.load` → `adoptStoredEvents` → `assertEventsSupported` → `Session.fromRestore`，
即 Web 服务恢复会话历史的完全相同路径；可 `node verify-session-load.mjs <session-id>` 单独运行（需要能解析到全局 `@deepseek-ai/*` 包的环境）。

## 验证记录（本机）

- 修复前：`session-3af87397-7cb3-4590-bb64-7f16819f7a40` 复现 `SessionFormatUnsupportedError ..."message-edit/version" (seq 293)...`。
- 修复后：7 个已存储会话全部 `LOAD OK`，seq 连续，`message-edit/version` 事件（seq 293）原样保留在事件流中，`seedLength`/`parentSession` 谱系信息完好。
- 补丁脚本对插件文件 `node --check` 语法校验通过。

## 已知边界

- 本目录是本地补丁集合：`@deepseek-ai/dsh-session` 是生成文件，harness 升级会覆盖目录（插件升级会覆盖插件文件）——升级后重跑本脚本即可。
- 未改动 session 日志本身。若未来想把日志写成「完全符合官方信封契约」，理想做法是插件作者在发布侧让 `message-edit/version` 携带 `ignorable: true`（本补丁的插件侧改动即该行为，仅作用于本地安装副本）。