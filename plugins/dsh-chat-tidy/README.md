# @lynn123411/dsh-chat-tidy

Codex 级对话排版与工具调用标题智能翻译扩展插件。将 DeepSeek Harness Web 对话界面对齐专业级编码客户端的阅读节奏与信息密度，并提供轻量纯渲染层工具调用动作标题中文翻译，不污染会话上下文。

## 特性

- **Codex 级对话排版**：精准对齐桌面客户端的字体比例阶梯、行高、代码块间距与紧凑排版，阅读信息密度提升 20%。
- **工具调用标题智能翻译**：仅在渲染层将工具调用动作描述（如 `Locate DSH home directory structure`、`Inspect DSH home directory layout`）自动中文覆盖，严格不触碰 Think 思考块与消息正文。
- **纯渲染劫持，零上下文占用**：翻译结果仅作用于 DOM 展示，不写入会话历史 JSON，不占用模型上下文窗口；历史会话打开时自动实时渲染。
- **多通道高可用翻译引擎**：
  - 支持硅基流动（SiliconFlow Qwen2.5-7B）与智谱 AI（Zhipu glm-4-flash 免费模型）双在线通道。
  - 支持谷歌翻译（GTX 免费接口，免 Key）与 MyMemory 免费机器翻译（免 Key）双兜底通道，以及离线技术词典（0ms 极速兜底）。
- **智能调度与熔断保护**：支持通道优先级拖拽排序、1–6 动态并发限流队列、2000ms 硬超时强中断、连续失败 3 次触发 30s 熔断快速转移、在途相同请求 Promise 合并去重。
- **视口懒加载与双级缓存**：历史长会话滚动时仅对可视区域卡片触发翻译；结合 Client 端 `localStorage` 与 Host 端 L1 内存 / L2 磁盘双重缓存，页面刷新 0ms 瞬间渲染。
- **设置页集成**：在 DSH「设置 - 聊天排版」中提供一键总开关、API Key 密码配置与测试连接、并发数滑块与通道优先级调整。

## 安装

```bash
dsh plugin --profile web add dsh-chat-tidy
```
