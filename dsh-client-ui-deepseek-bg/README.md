# dsh-client-ui-deepseek-bg

DeepSeek 官网风格深色皮肤插件：**极光背景 + 粒子鲸鱼 + 星座网格**，以及**侧边栏 / 输入框 / 消息气泡 / 代码块**的玻璃拟态材质，**1.3.0 Border Beam 状态机**（`beam.jakubantalik.com` 移植，执行彩虹/Plan橙黄，打字内缩震动，`0.8x`）。

- **深色/浅色**：极光与玻璃（仅深色）不变，输入框 `md` 全边框环绕：**执行**彩虹/`Plan`橙黄（`0.8x 2.45s`）仅**点箭头后**才转，打字为内缩震动（键盘触发）
- 纯客户端插件，不需要改任何构建文件。

## 效果预览
- 🐋 中央粒子化鲸鱼：光线跟随鼠标、粒子随光点亮、入场组装动画（官网 HeroDigitileR3F 同款实现）
- 🌌 深蓝流体极光背景 + 白色星座网格（仅深色）
- 🧊 侧边栏、底部输入框、你的消息气泡、助手输出的代码块：半透明磨砂玻璃（blur 12px + 官方 ds-glass 令牌，仅深色）
- ✨ **Border Beam 状态机**：`hairline(空闲)` → `typing(键盘触发 内缩震动)` → `executing(彩虹2.45s)` / `planning(橙黄2.45s，仅Plan模式+执行)` → `pulse 0.8s` → `hairline`；`typing` 800ms无键回落

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
  - `document.querySelector('[data-beam="dsh-composer"]')` 应指向输入框卡片；执行时 `data-active` 存在且 `animation` 转动，空闲仅 `hairline`
  - 控制台 `window.__dshDeepSeekBg.beam` 提供 `state / isExecuting / isTyping / setStrength / disable / enable / refresh / update` 调试句柄

## Border Beam 调试与开关

- 关闭：`http://127.0.0.1:3080/?beam=0` 或 `?nobeam` 或 `localStorage.setItem('dsh-beam-disabled','1')`
- 状态：`window.__dshDeepSeekBg.beam.state` → `hairline | typing | planning | executing | pulse`
- 调试：`__dshDeepSeekBg.beam.isExecuting`、`isTyping`，`update()` 强制刷新
- 主题：跟随 `state.dark`，执行彩虹 `colorful`，输入 `mono`，规划 `sunset` 橙黄，均 `0.8x`（`2.45s`）

## 致谢

- Border Beam 效果移植自 [beam.jakubantalik.com](https://beam.jakubantalik.com) — Copyright (c) Jakub Antalik, MIT — https://github.com/Jakubantalik/Libraries/tree/main/packages/border-beam
