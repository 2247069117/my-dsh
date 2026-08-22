# dsh-client-ui-deepseek-glass

DeepSeek 官网风格**界面皮肤层**插件：玻璃拟态（侧边栏/输入框/消息气泡/代码块/计划/任务/提问/审批卡片）+ Border Beam 状态机 + Thinking Orbs 动态指示器 + Pulse 任务清单框 + 发送按钮微动效。

**背景引擎**（极光背景 / 粒子鲸鱼 / 星座网格 / 鼠标跟随交互）在 `dsh-client-ui-deepseek-bg` 插件中，两插件配合使用还原完整效果。

- **深色主题**：全部界面覆盖生效（`body[data-ds-dark-theme]`）。
- **浅色主题**：恢复 DSH **官方原版**外观——全部覆盖规则仅在深色生效，浅色零覆盖。

## 安装

```bash
dsh plugin --profile web add dsh-client-ui-deepseek-bg
dsh plugin --profile web add dsh-client-ui-deepseek-glass
```

重启后打开 http://127.0.0.1:3080 即可。

> 需 DSH ≥0.1.0-rc.8，Web profile 已含 `@deepseek-ai/dsh-web-app`。

## 设置

设置 → 界面特效：Border Beam 光效开关、玻璃拟态开关、玻璃模糊强度（6/8/10/12px），即时生效并自动保存（localStorage `dsh-bg-glass-settings`）。Thinking Orbs 为核心交互特性，始终开启。

> 背景引擎相关设置（极光/鲸鱼/星座/鼠标跟随/分辨率/帧率）在 dsh-client-ui-deepseek-bg 的设置页「背景特效」。

## 开发

```bash
node scripts/build.mjs
node scripts/build.mjs --check
```

## 致谢

本插件基于 **B站 @爱玩蛛的少年（UID: 564770445）** 提供的主题二次开发，在此特别感谢原作者的创意与分享。

---

MIT — Border Beam © Jakub Antalik, Thinking Orbs © Jakub Antalik
