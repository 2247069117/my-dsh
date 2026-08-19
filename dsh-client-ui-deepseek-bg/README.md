# dsh-client-ui-deepseek-bg

DeepSeek 官网风格深色皮肤插件：**极光背景 + 粒子鲸鱼 + 星座网格**，以及**侧边栏 / 输入框 / 消息气泡 / 代码块**的玻璃拟态材质。

- 仅**深色主题**生效；**浅色主题保持官方原版**，切换主题实时生效。
- 纯客户端插件，不需要改任何构建文件。

## 效果预览
- 🐋 中央粒子化鲸鱼：光线跟随鼠标、粒子随光点亮、入场组装动画（官网 HeroDigitileR3F 同款实现）
- 🌌 深蓝流体极光背景 + 白色星座网格
- 🧊 侧边栏、底部输入框、你的消息气泡、助手输出的代码块：半透明磨砂玻璃（blur 12px + 官方 ds-glass 令牌）

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
- 排查：浏览器控制台执行 `document.getElementById('dsh-ds-bg')?.dataset.version` 应返回版本号；返回 `undefined` 说明插件未加载。
