# @lynn123411/dsh-ui-beam-orbs

DSH Web 界面皮肤层与交互动效插件：在深色主题下提供全局玻璃拟态（侧边栏/输入框/消息气泡/代码块/计划/任务/提问/审批卡片）、Border Beam 边框流光状态机、Thinking Orbs 动态几何思维指示器、Pulse 任务清单流光与发送按钮微动效，浅色主题优雅恢复官方原版外观。

## 特性

- **全局玻璃拟态**：为侧边对话栏、消息输入框、消息气泡、代码块及各类交互卡片赋予半透明与磨砂毛玻璃质感，支持 0~24px 模糊度调节与一键关闭玻璃实体底色回退。
- **Border Beam 边框流光**：输入框与任务清单搭载待机细线（hairline）、打字呼吸（typing）、计划（planning）、执行（executing）、发送脉冲（pulse）五种智能状态流光，自适应容器圆角与 IME 输入法组合事件锁。
- **Thinking Orbs 思维光球**：基于纯 2D Canvas 实时渲染点阵 3D 几何数学模型，提供经纬扫描（globe）、声波起伏（wave）、流光缎带（ribbon）、旋转魔方（rubik）、网络拓扑（web）、几何变形（morph）、双螺旋编织（braid）、光晕呼吸（ring）等 8 种形态与工具调用及思考流联动。
- **专属设置页与图标**：深度接入 DSH 设置页，配备专属 Sparkles 闪烁星芒光效图标，提供 GPU 负载估算仪表、特效独立开关、模糊强度滑块与 localStorage 持久化。
- **交互微动效**：发送按钮悬停发光放大、点击弹性反馈，任务清单卡片脉冲展开与状态切换动效。
- **主题严格门控**：深色主题（`body[data-ds-dark-theme]`）全面生效，浅色主题自动清理 DOM 增强标记并恢复官方原版外观；自动响应系统 `prefers-reduced-motion` 减弱动效偏好。

## 安装

```bash
dsh plugin --profile web add @lynn123411/dsh-ui-beam-orbs
```
