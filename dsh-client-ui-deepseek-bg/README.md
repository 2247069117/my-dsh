# dsh-client-ui-deepseek-bg

DeepSeek 官网风格深色皮肤插件：极光背景 + 粒子鲸鱼 + 星座网格 + 侧边栏/输入框/消息气泡/代码块玻璃拟态 + Border Beam 状态机 + Thinking Orbs 动态指示器 + Pulse 任务清单框。全主题统一深色（#0a0a0a）。

## 安装

```bash
dsh plugin --profile web add dsh-client-ui-deepseek-bg
```

重启后打开 http://127.0.0.1:3080 即可（浅色/深色均显示深色主题效果）。

> 需 DSH ≥0.1.0-rc.8，Web profile 已含 `@deepseek-ai/dsh-web-app`。

## 设置

设置 → 背景特效：全特效/均衡/节能、GPU 负载、6 项特效开关、高级滑杆（极光分辨率/帧率/模糊/跟手/光线），即时生效。默认即为全特效（下载后无需设置）。

> v1.10.0 已移除「低电量自动节能」功能，简化设置面板。

## 开发

```bash
node scripts/build.mjs
node scripts/build.mjs --check
```

## 致谢

本插件基于 **B站 @爱玩蛛的少年（UID: 564770445）** 提供的主题二次开发，在此特别感谢原作者的创意与分享。

---

MIT — Border Beam © Jakub Antalik, Thinking Orbs © Jakub Antalik
