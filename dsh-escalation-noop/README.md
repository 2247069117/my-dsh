# dsh-escalation-noop

根治 dsh 工具调用报错的零依赖插件方案（**升级免疫**），以可分发的 **dsh bundle** 形式发布：

```
Error: sandbox escalation to "danger-full-access" is not strictly wider than this call's current "danger-full-access" mode
```

## 安装

包已发布到 npm：**`dsh-escalation-noop`**（`https://www.npmjs.com/package/dsh-escalation-noop`）。一条命令：

```bash
# WebUI（dsh web）安装：自动装依赖 + 自动写入 dsh.profile.bundles
dsh plugin --profile web add dsh-escalation-noop

# 然后重启 dsh 一次
```

> 备注：如也使用 headless profile（终端一次性任务 `dsh --profile headless "..."`），用同样的命令加装：`dsh plugin --profile headless add dsh-escalation-noop`。

### 可选配置

在用户级 patch 层（`~/.dsh/cordis.patch.yml`）覆盖该行：

```yaml
- id: escalation-noop
  config:
    intervalMs: 600000   # 周期巡检间隔（毫秒），0 关闭；默认 300000
```

## 背景

- 会话沙箱模式为 `danger-full-access`（`~/.dsh/settings.yaml` → `permission.defaultPreset`）时本来就不受限，但 `bash` / `fs` 等工具的 schema 仍暴露 `sandbox_permissions` 参数，模型（尤其 gpt-5.6-luna）会反复传它。
- `@deepseek-ai/dsh-sandbox` 的 `approveEscalation()` 对「请求模式 == 当前模式」（同模式，非严格更宽）直接抛上述错误，导致每次工具调用失败。
- 纯提示词（系统提示词、preset persona 禁令）拦不住 luna（实测 3/3 照传），必须从代码/schema 层根治。

## 方案架构

1. **代码补丁（根治，覆盖所有工具）**：把 `approveEscalation` 中"非严格更宽即抛错"的一行改为——同模式请求直接返回（no-op 放行），真实升级仍走审批，降级仍拒绝。补丁内容：

```diff
- if (!(WIDER_MODES[effectiveMode] ?? []).includes(mode)) throw new Error(`sandbox escalation to "${mode}" is not strictly wider than this call's current "${effectiveMode}" mode`);
+ if (!(WIDER_MODES[effectiveMode] ?? []).includes(mode)) {
+ 	// local patch (user): a request for the mode the call already runs under is a
+ 	// no-op grant — nothing widens, so it never prompts a human. Prevents models
+ 	// that habitually pass sandbox_permissions from hard-failing every call.
+ 	if (mode === effectiveMode) return mode;
+ 	throw new Error(`sandbox escalation to "${mode}" is not strictly wider than this call's current "${effectiveMode}" mode`);
+ }
```

   marker 检测字符串：`local patch (user)`（存在即视为已补丁，跳过）。

2. **自愈插件（升级免疫）**：`index.js` 是零依赖 Cordis 插件（只 import `node:fs` / `node:module` / `node:path`），在**启动时、进程退出时、周期巡检**三个时机：
   - 用 `createRequire(import.meta.url).resolve('@deepseek-ai/dsh-sandbox/package.json')` 定位真实文件（跟随 symlink 到全局安装）；
   - 含 marker → 打印 `already patched` 跳过；缺补丁 → 先备份到 `~/.dsh/patches/dsh-sandbox.index.js.bak`，再做精确字符串替换 + 括号配平校验 + 原子写回（tmp + rename）；
   - 任何异常只打印警告，**绝不让 dsh 启动失败**。

3. **挂载（升级免疫）**：本包声明 `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }`，是标准 dsh bundle——加入 profile 的 `dsh.profile.bundles` 即自动成为一个组合层（与 `@deepseek-ai/dsh-base` 同机制），dsh 升级不会覆盖它。注意：新行必须包在 `insert:` 里——裸 `- id: ...` 行是"覆盖已有行"语义，目标不存在会被静默跳过。

## 文件

| 文件 | 作用 |
|---|---|
| `index.js` | 插件本体（零依赖、自愈、幂等、优雅失败） |
| `package.json` | 包清单（`type: module`，`dsh.bundle` 声明） |
| `cordis.patch.yml` | **包内 bundle 补丁层**：挂载 `escalation-noop` 行 |
| `README.md` | 本文档 |

## 验证

```bash
# 组合正确合入
dsh --profile web --dump-config | grep -A1 escalation-noop

# 行为矩阵（直接调已补丁的 approveEscalation）
#   同模式 danger->danger          → 返回该 mode（no-op 放行）
#   真实升级 workspace->danger     → 仍要求审批
#   降级 danger->workspace         → 仍抛 "not strictly wider"

# 升级模拟：用 ~/.dsh/patches/dsh-sandbox.index.js.orig 还原后重启，
# 插件应自动重打补丁（日志出现 "patch applied — restart dsh once"）。
```

## 升级后的行为

`npm update -g @deepseek-ai/dsh` 等升级会抹掉 node_modules 里的手工改动。插件在三个时机自愈：

1. **启动时**：检测到补丁丢失立即重打（日志醒目提示 `patch applied — restart dsh once`）；
2. **退出时**：进程干净退出前再打一次——**升级时如果 dsh 正在运行，下一次启动已是干净状态，零手动重启**；
3. **周期巡检**（默认 5 分钟，`config.intervalMs` 可调，0 关闭）：覆盖进程被杀/崩溃、或应用运行期间文件被外部改动的情况。

**唯一仍需一次手动重启的场景**：升级发生在 dsh 完全停止期间（如升级后才启动应用）。此时第一次启动必然先加载未补丁模块（ESM 缓存 + 工具参数在 registry 层被 deep-freeze 无法进程内拦截 + host 层的 sandbox-policy/fs-sandbox 等行在插件行之前就静态 import 了 dsh-sandbox——均经代码与实测验证），随后插件补好文件并打日志，重启一次即恢复。

## 回滚

```bash
# 从 WebUI 移除（会同时清理依赖与 bundles 条目）
dsh plugin --profile web remove dsh-escalation-noop

# 还原 vendor 补丁文件
cp ~/.dsh/patches/dsh-sandbox.index.js.orig \
   $(node -e "console.log(require('node:module').createRequire(process.cwd()+'/x.js').resolve('@deepseek-ai/dsh-sandbox/package.json'))" | sed 's|package.json|lib/index.js|')
```

> 若 headless 也装过，用同样的命令移除：`dsh plugin --profile headless remove dsh-escalation-noop`。

> 提示：`dsh-sandbox.index.js.orig`（补丁前的原文件）需要在本机打补丁前自行备份；本仓库不包含 vendor 文件副本。
