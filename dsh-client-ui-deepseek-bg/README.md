# dsh-client-ui-deepseek-bg

DeepSeek 官网风格深色皮肤插件：**极光背景 + 粒子鲸鱼 + 星座网格**，以及**侧边栏 / 输入框 / 消息气泡 / 代码块**的玻璃拟态材质，**1.3.2 Border Beam 状态机**（`beam.jakubantalik.com` 移植）与 **Thinking Orbs 动态活动指示器**（`orbs.jakubantalik.com` 移植）。

- **深色/浅色**：极光与玻璃（仅深色）不变，输入框 `md` 全边框环绕：**执行**彩虹/`Plan`橙黄（`0.8x 2.45s`）仅**点箭头后**才转，打字为边缘呼吸发光（键盘触发）
- **Thinking Orbs**：智能体执行与思考时在状态栏动态渲染 3D 粒子点阵轨道球（完整移植 9 种数学 Orb 形态：`working` / `searching` / `solving` / `listening` / `connecting` / `weaving` / `composing` / `breathing` / `shaping`），精准响应各个工具调用与模式，并动态更新状态文字（如 `Reading file…`、`Writing file…`、`Running command…`、`Searching web…`，以 `Working…` 兜底）。
- 纯客户端插件，不需要改任何构建文件。

## 效果预览
- 🐋 中央粒子化鲸鱼：光线跟随鼠标、粒子随光点亮、入场组装动画（官网 HeroDigitileR3F 同款实现）
- 🌌 深蓝流体极光背景 + 白色星座网格（仅深色）
- 🧊 侧边栏、底部输入框、你的消息气泡、助手输出的代码块：半透明磨砂玻璃（blur 12px + 官方 ds-glass 令牌，仅深色）
- ✨ **Border Beam 状态机**：`hairline(空闲)` → `typing(键盘触发 边缘呼吸发光 mono)` → `executing(彩虹2.45s)` / `planning(橙黄8°静止 仅Plan+执行)` → `pulse 0.8s` → `hairline`
- 🔮 **Thinking Orbs**：生成中实时呈现 3D 旋转点阵球，与当前执行模式（彩虹/暖橙）色调及光效完全统一。

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
  - `document.getElementById('dsh-ds-bg')?.dataset.version` 应返回版本号（当前 `26`）；`undefined` 说明插件未加载
  - `document.querySelector('[data-beam="dsh-composer"]')` 应指向输入框卡片；执行时 `data-active` 存在且 `animation` 转动，空闲仅 `hairline`
  - 控制台 `window.__dshDeepSeekBg.beam` 提供 `state / isExecuting / isTyping / setStrength / disable / enable / refresh / update` 调试句柄

## 设置页「背景特效」面板（v1.7.0）

打开 **设置 → 背景特效**（侧边栏底部设置齿轮 → 左侧导航「背景特效」），所有调整**即时生效并自动保存**（localStorage `dsh-bg-settings`）：

- **性能档位**：`全特效` / `均衡` / `节能` 一键切换
  - 全特效：所有特效**拉满**（极光分辨率 1.0x、玻璃模糊 12px、30fps、鼠标跟随开）
  - 均衡：关闭鲸鱼与 Orbs（极光 0.55x、24fps）
  - 节能：仅保留玻璃拟态与静态深色背景（20fps、blur 6px）
- **估算 GPU 负载**：按 分辨率 × 帧率 × 模糊半径 实时估算的负载条（绿/黄/红三档）
- **特效开关**：极光背景 / 粒子鲸鱼 / 星座网格 / **鼠标跟随交互**（极光笔刷流场、鲸鱼光线与粒子扭曲、星座斥力——关闭后三处全部静止，另省下极光 flowmap pass）/ Border Beam / 玻璃拟态 / Thinking Orbs 独立开关（带负载标签；手动调整后档位自动变为「自定义」）
- **渲染质量（高级）**：极光分辨率滑杆（0.4x–1.0x）、动画帧率上限（20/24/30fps）、玻璃模糊强度（6/8/10/12px）、**低电量自动节能**（Battery API：电量 ≤20% 未充电时自动切「节能」，恢复后还原原档位）
- **当前极光画布**：实时显示实际渲染分辨率（验证降档效果）
- **恢复默认**：一键回到全特效

旧版逃生舱仍然有效：`?beam=0` / `?nowhale` / `localStorage 'dsh-beam-disabled'`。

## GPU 优化（v1.6.0）

在**不削弱显示效果**的前提下最大程度降低 GPU 占用：

- **极光（WebGL2 流体/粒子）**：内部分辨率默认按 `min(DPR, 1.5) × 0.75` 渲染（均衡档），由 CSS 放大到全屏——柔和渐变背景肉眼无差，fragment 像素量约降 **44% ~ 75%**（本插件最大 GPU 开销）；「全特效」档可拉满到 **1.0x**（等效原始 1.5x DPR 全分辨率），「节能」档最低 0.4x
- **无鼠标笔刷平台**（Windows / 触屏 / reduced-motion）：流场恒为中性态，整帧跳过 flowmap pass，画面逐像素一致
- **粒子鲸鱼**：分辨率上限 1.5x → **1.25x**（像素 -30%），关闭 MSAA（点精灵本就不走多边形抗锯齿）、`powerPreference: "low-power"`
- **星座网格**：2D canvas 上限 2x → **1.5x**（填充面积 -44%）
- **玻璃拟态 blur**：侧边栏 / 气泡 / 代码块 12→8px，输入框卡片 12→10px（其背后有滚动文字、模糊最可见），计划/任务/提问 16→10px，审批 20→12px——背后都是平滑极光，观感无差
- **Thinking Orbs**：状态 DOM 扫描由每帧改为每 300ms 一次（切换延迟 ≤300ms）

验证：`?dshtest=1` 打开诊断面板可看 `canvas: WxH`（极光画布宽高明显变小）；GPU 占用可用系统工具（任务管理器/活动监视器）对比。

## Border Beam 调试与开关

- 关闭：`http://127.0.0.1:3080/?beam=0` 或 `?nobeam` 或 `localStorage.setItem('dsh-beam-disabled','1')`
- 状态：`window.__dshDeepSeekBg.beam.state` → `hairline | typing | planning | executing | pulse`
- 调试：`__dshDeepSeekBg.beam.isExecuting`、`isTyping`，`update()` 强制刷新
- 主题：跟随 `state.dark`，执行彩虹 `colorful`，输入 `mono`，规划 `sunset` 橙黄，均 `0.8x`（`2.45s`）

## Thinking Orbs 状态机与映射

- **状态栏图标**：完整支持 https://orbs.jakubantalik.com/ 的 9 种几何动力学点阵 Orb 动画。
- **状态与工具映射**：
  - `searching` (globe 经纬扫描球)：`grep`, `glob`, `web_search`, `find_dsh_plugin` → `Searching files…` / `Searching web…`
  - `listening` (wave 环状共振波)：`read`, `read_image`, `skill`, `get_goal` → `Reading file…` / `Inspecting image…`
  - `composing` (ribbon 多轨流动带)：`write`, `edit` → `Writing file…` / `Editing file…`
  - `solving` (rubik 魔方轴向旋转)：`bash` → `Running command…`
  - `connecting` (web 空间拓扑网络)：`subagent`, `subagent_fork`, `workflow`, `ralph`, `job_*` → `Connecting subagent…` / `Delegating task…`
  - `shaping` (morph 几何多边形变幻)：`todo_write`, `create_goal`, `update_goal`, `exit_plan_mode` → `Updating tasks…` / `Finalizing plan…`
  - `weaving` (braid 螺旋三股编织链)：`cordis_*` 动态插件生命周期 → `Weaving plugin…`
  - `breathing` (ring 光晕呼吸环)：`ask_user_question`, Plan 规划模式 → `Asking question…` / `Planning…`
  - `working` (orbits 多轨道星系粒子)：兜底状态 → `Working…`
- **控制台句柄**：`window.__dshDeepSeekBg.orbs` 提供 `active` / `state` / `resolveState()` / `getPreset(state, size)` 等调试接口。

## 致谢

- Border Beam 效果移植自 [beam.jakubantalik.com](https://beam.jakubantalik.com) — Copyright (c) Jakub Antalik, MIT — https://github.com/Jakubantalik/Libraries/tree/main/packages/border-beam
- Thinking Orbs 效果移植自 [orbs.jakubantalik.com](https://orbs.jakubantalik.com) — Copyright (c) Jakub Antalik, MIT — https://github.com/Jakubantalik/thinking-orbs
