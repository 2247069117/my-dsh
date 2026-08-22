# patch-dsh-finish-reason

修复 DSH「`Stream ended without finish_reason`」报错的本地补丁脚本。

## 背景

一些 OpenAI 兼容端点（如 opencode.ai zen/go 的 `ox-alpha-free`）在 SSE 流结束时
**从不发送 `finish_reason` 字段**——流正常结束（甚至已发完 usage），但没有终结标记。
DSH 内置的 pi-ai（≤0.82）把这种情况当作协议违规，无条件抛出
`Stream ended without finish_reason`（`openai-completions` 适配器）。于是 DSH 判定
失败并整轮重试，已生成的一大段推理链/输出被全部丢弃、重新开始生成。

同一端点上的其他模型（如 `deepseek-v4-flash`）会正常发送 `finish_reason`，所以
只有个别模型报错。

## 修复方案

pi-ai ≥0.83 为此场景新增了官方开关 `compat.supportsFinishReason: false` ——
流自然结束时按 `stop`/`toolUse` 正常收尾，**保留已生成内容**。
DSH 0.1.1-rc.2（含当前 npm 最新发布版）还不认识该字段，故需三层配合：

1. **升级 pi-ai → 0.84.2**（全局 DSH 安装内，公开导出面与 0.82.1 完全一致，兼容性已验证）；
2. **给 `dsh-llm-pi-ai` 打补丁**：把 `supportsFinishReason` 加入
   `COMPLETIONS_COMPAT_GATE`（标记 `offer`）与 `compatProfile` 的 z.object 模式
   （编译产物 `lib/index.js` 中各一行）；
3. **配置层**：`~/.dsh/settings.yaml` 的目标模型声明：

   ```yaml
   compat:
     supportsFinishReason: false
   ```

## 用法

```bash
bash patch-dsh-finish-reason.sh            # 自动定位全局 DSH
DSH_ROOT=/path/to/dsh bash patch-dsh-finish-reason.sh   # 或显式指定
```

脚本幂等，可重复执行；**DSH 每次升级/重装后重跑一次**即可（settings.yaml 的
`compat` 声明保留不动）。执行完成后重启 `dsh web` 服务使新代码加载
（退出 DSH Launcher 或 kill 掉 `dsh web` 进程后重新打开）。

## 验证

已用真实安装的 pi-ai 0.84.2 模拟该端点行为（只发内容分片 + 空 choices 的 usage
收尾分片，流结束且从不发 `finish_reason`/`[DONE]`）实测：

| 场景 | 结果 |
| --- | --- |
| 旧行为（无 compat） | `error: Stream ended without finish_reason`，内容+思考链全部作废 |
| 新行为（`supportsFinishReason: false`） | `done, reason: stop`，内容与思考链完整保留 |

## 注意

- `supportsFinishReason: false` 意味着**真正被截断的流也会被静默接受**——这是该
  开关的固有代价，对本端点是利大于弊的取舍。
- 若其他模型报同样的错，把 `compat` 块加到对应模型即可；若整个 provider 路由
  都不发 `finish_reason`，也可把 `compat` 提到 provider 路由层（一键覆盖全部模型）。