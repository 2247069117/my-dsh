# dsh-ui-deepseek-bg

仿 DeepSeek Harness 官网风格的**背景引擎**插件：极光背景 + 粒子鲸鱼 + 星座网格 + 鼠标跟随交互（极光/鲸鱼/星座跟随光标），内置设置页「背景特效」GPU 调优面板。

**界面皮肤层**（玻璃拟态 / Border Beam / Thinking Orbs / 任务清单 Pulse / 发送按钮微动效）已在 `dsh-ui-beam-orbs` 插件（v1.13.0 起拆分），两插件配合使用还原完整效果。

- **深色主题**：全特效深色背景版（#0a0a0a 极光 + 鲸鱼 + 星座 + 鼠标跟随）。
- **浅色主题**：恢复 DSH **官方原版**外观——背景层隐藏（`#dsh-ds-bg:not(.dsh-ds-dark)`）与全部覆盖规则仅在深色生效（`body[data-ds-dark-theme]`），浅色零覆盖。

主题切换（设置 → 外观 / 系统深浅色切换）实时生效，无需刷新页面。

## 安装

```bash
dsh plugin --profile web add dsh-ui-deepseek-bg
dsh plugin --profile web add dsh-ui-beam-orbs
```

重启后打开 http://127.0.0.1:3080 即可（深色主题显示本插件背景特效；浅色主题为官方原版）。

> 需 DSH ≥0.1.0-rc.8，Web profile 已含 `@deepseek-ai/dsh-web-app`。

## 设置

设置 → 背景特效：全特效/均衡/节能档位、GPU 负载、极光/鲸鱼/星座/鼠标跟随 4 项开关、高级滑杆（极光分辨率/帧率/跟手/光线），即时生效。默认即为全特效（下载后无需设置）。

> v1.10.0 已移除「低电量自动节能」功能，简化设置面板。
>
> v1.11.3 全特效 GPU 优化（特效与显示完全不变）：极光 WebGL 关闭对全屏渐变无意义的 MSAA；
> 星座网格线条/圆点合并绘制调用；鲸鱼帧循环零分配、常量 uniform 仅上传一次。
>
> v1.12.0 恢复浅色模式为官方原版：主题检测回归（`data-ds-dark-theme` /
> `data-theme` / `html color-scheme` / `prefers-color-scheme`），浅色主题下背景层隐藏、
> 全部覆盖仅深色生效，鲸鱼仅深色显示。
>
> v1.13.0 拆分：玻璃拟态 / Border Beam / Thinking Orbs / 任务清单 Pulse / 发送按钮
> 微动效移至新插件 `dsh-ui-beam-orbs`，本插件仅保留背景引擎四项。

## 开发

```bash
node scripts/build.mjs
node scripts/build.mjs --check
```

## 致谢

本插件基于 **B站 @爱玩蛛的少年（UID: 564770445）** 提供的主题二次开发，在此特别感谢原作者的创意与分享。

---

MIT — Border Beam © Jakub Antalik, Thinking Orbs © Jakub Antalik
