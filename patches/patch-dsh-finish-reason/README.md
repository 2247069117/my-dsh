# patch-dsh-finish-reason

修复 DSH「`Stream ended without finish_reason`」报错的本地补丁脚本。

## 背景

不少 OpenAI 兼容网关在 SSE 流结束时**不带 `finish_reason` 终止标记**——有的
（如 opencode.ai zen/go 的 `ox-alpha-free`）是**长生成流被服务端硬截断**：直连
curl 实测，短请求（~4s）会正常发 `finish_reason`+`[DONE]`，而长任务（思考/输出
超过 ~30 秒）流会在任意位置掐断——最后一帧完整写出后连接直接关闭，不发
`finish_reason`、不发 `[DONE]`、不带 usage（31s/39s/78s 三次实测均如此）。
DSH 内置的 pi-ai（≤0.82）把「流结束但无终止标记」一律当作协议违规，无条件抛出
`Stream ended without finish_reason`（`openai-completions` 适配器的**通用检查**，
任何该协议路由都可能触发，不只某一家）。于是 DSH 判定失败并整轮重试，已生成的
一大段推理链/输出被全部丢弃、重新开始生成；而放宽后若不加区分地接受，截断结果
又会静默当成功——两者都是同一服务端问题的两种症状，DSH 侧无法根治，只能选择
「可见的报错+重试」或「静默收下截断结果」。

## 修复方案

pi-ai ≥0.83 为此场景新增了官方开关 `compat.supportsFinishReason: false` ——
流自然结束时按 `stop`/`toolUse` 正常收尾，**保留已生成内容**。
DSH 0.1.1-rc.2（含当前 npm 最新发布版）还不认识该字段，故需三步补丁：

1. **升级 pi-ai → 0.84.2**（全局 DSH 安装内，公开导出面与 0.82.1 完全一致，兼容性已验证）；
2. **给 `dsh-llm-pi-ai` 打补丁**：把 `supportsFinishReason` 加入
   `COMPLETIONS_COMPAT_GATE`（标记 `offer`）与 `compatProfile` 的 z.object 模式
   （编译产物 `lib/index.js` 中各一行）；
3. **默认值注入**：`resolveModelCompat` 中，手写声明的自定义路由模型
   （不在 pi-ai 内置 catalog，`base` 为空）且协议为 `openai-completions` 时，
   默认补上 `supportsFinishReason: false`——**对所有自定义路由一次性生效**，
   无需逐个模型/路由声明。catalog 内置路由保持 pi-ai 的严格检测。

`~/.dsh/settings.yaml` 里的显式声明仍有效但已非必需：

```yaml
compat:
  supportsFinishReason: false   # 明确声明该路由容忍(可选)
compat:
  supportsFinishReason: true    # 覆盖默认值,恢复严格检测(可选)
```

## 用法

```bash
bash patch-dsh-finish-reason.sh            # 自动定位全局 DSH
DSH_ROOT=/path/to/dsh bash patch-dsh-finish-reason.sh   # 或显式指定
```

脚本幂等（三步各自检测 marker），可重复执行；**DSH 每次升级/重装后重跑一次**即可
（settings.yaml 里的显式 `compat` 声明保留不动）。执行完成后重启 `dsh web` 服务
使新代码加载（退出 DSH Launcher 或 kill 掉 `dsh web` 进程后重新打开）。

## 验证

已用真实安装的 pi-ai 0.84.2 模拟该端点行为（只发内容分片 + 空 choices 的 usage
收尾分片，流结束且从不发 `finish_reason`/`[DONE]`）实测：

| 场景 | 结果 |
| --- | --- |
| 旧行为（无 compat） | `error: Stream ended without finish_reason`，内容+思考链全部作废 |
| 新行为（`supportsFinishReason: false`） | `done, reason: stop`，内容与思考链完整保留 |

## 注意

- `supportsFinishReason: false` 意味着**真正被截断的流也会被静默接受**——这是该
  开关的固有代价。默认值只作用于自定义路由；catalog 内置路由（如 DeepSeek 官方）
  仍保持严格检测，显式声明 `supportsFinishReason: true` 可随时恢复严格。