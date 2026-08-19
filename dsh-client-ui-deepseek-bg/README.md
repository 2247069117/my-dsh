# dsh-client-ui-deepseek-bg

DeepSeek 官网风格深色皮肤插件：**极光背景 + 粒子鲸鱼 + 星座网格**，以及**侧边栏 / 输入框 / 消息气泡 / 代码块**的玻璃拟态材质，**1.1.0 新增 Border Beam 流动边框**（`beam.jakubantalik.com` 移植，深浅双主题）。

- **深色**：极光 + 玻璃 + 输入框流动边框（彩虹 `hue-rotate` 漂移）均生效
- **浅色**：极光与玻璃保持原版，**仅输入框黑线流动边框生效**（`strength 0.5`，不加玻璃）
- 纯客户端插件，不需要改任何构建文件。

## 效果预览
- 🐋 中央粒子化鲸鱼：光线跟随鼠标、粒子随光点亮、入场组装动画（官网 HeroDigitileR3F 同款实现）
- 🌌 深蓝流体极光背景 + 白色星座网格（仅深色）
- 🧊 侧边栏、底部输入框、你的消息气泡、助手输出的代码块：半透明磨砂玻璃（blur 12px + 官方 ds-glass 令牌，仅深色）
- ✨ **Border Beam**：底部输入框 `line` 扫光（`duration 3.1s`，`colorful hueRange 13°`），常驻 `0.65/0.5` + `focus/hover 1.0`，失焦淡出；`pulse` 呼吸变体延后按需开启

## 安装（约 1 分钟）

1. 解压本压缩包到任意位置，比如桌面：`C:\Users\你的用户名\Desktop\dsh-client-ui-deepseek-bg`

2. 打开 PowerShell，运行（把路径换成你的实际路径）：
   ```
   dsh plugin --profile web add "C:\Users\你的用户名\Desktop\dsh-client-ui-deepseek-bg"
   ```

3. 编辑配置文件：`C:\Users\你的用户名\.dsh\profiles\web\package.json`
   在 `dsh.profile.bundles` 数组里加一行（注意上一行末尾加逗号）：
   ```json
   {
     "name": "dsh-profile-web",
     "private": true,
     "dependencies": {},
     "dsh": {
       "profile": {
         "bundles": [
           "@deepseek-ai/dsh-base",
           "@deepseek-ai/dsh-web-app",
           "dsh-client-ui-deepseek-bg"
         ]
       }
     }
   }
   ```

4. 重启 Web 界面：
   ```
   dsh --profile web
   ```
   然后打开 http://127.0.0.1:3080 （深色主题下即可看到效果）

## 卸载
```
dsh plugin --profile web remove dsh-client-ui-deepseek-bg
```
再把 package.json 的 bundles 里那一行删掉即可。

## 注意事项
- 玻璃材质的选择器与 DSH 构建版本相关。如果装上后**背景生效但玻璃没生效**，说明你的 DSH 版本与作者构建不同，把 `lib/client.js` 里的类名（如 `.uV2eYG_card`、`.gdEzaW_bubble`、`._block_10eou_7` 等）换成你版本的即可，或者反馈给作者更新。
- 主题切换实时生效；若切换后残留异常，刷新一次页面即可。
- 排查：
  - `document.getElementById('dsh-ds-bg')?.dataset.version` 应返回版本号（当前 `24`）；`undefined` 说明插件未加载
  - `document.querySelector('[data-beam="dsh-composer"]')` 应指向输入框卡片；`null` 说明 beam 未挂载（检查是否加了 `?beam=0` 或 `localStorage['dsh-beam-disabled']==='1'`）
  - 控制台 `window.__dshDeepSeekBg.beam` 提供 `setStrength(0.2)` / `disable()` / `enable()` / `refresh()` 调试句柄

## Border Beam 调试与开关

- 关闭：`http://127.0.0.1:3080/?beam=0` 或 `?nobeam` 或 `localStorage.setItem('dsh-beam-disabled','1')`
- 强度：`window.__dshDeepSeekBg.beam.setStrength(0.8)`，`setIdleStrength(0.3)` / `setFocusStrength(1)`
- 主题：跟随 DSH `state.dark`（`body[data-ds-dark-theme]`），深 `0.65` 浅 `0.5` 常驻，聚焦 `1.0`
- 预留：`?beam=all`（未来全量玻璃卡片）

## 致谢

- Border Beam 效果移植自 [beam.jakubantalik.com](https://beam.jakubantalik.com) — Copyright (c) Jakub Antalik, MIT — https://github.com/Jakubantalik/Libraries/tree/main/packages/border-beam
