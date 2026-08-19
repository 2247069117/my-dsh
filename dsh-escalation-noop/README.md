# dsh 同模式沙箱升级 no-op 补丁（纯代码补丁说明）

修复 dsh 工具调用报错，**以手工代码补丁形式提供**（无插件、无 npm 包——包已下架）：

```
Error: sandbox escalation to "danger-full-access" is not strictly wider than this call's current "danger-full-access" mode
```

## 背景

- 会话沙箱模式为 `danger-full-access`（`~/.dsh/settings.yaml` → `permission.defaultPreset`）时本来就不受限，但 `bash` / `fs` 等工具的 schema 仍暴露 `sandbox_permissions` 参数，模型（尤其 gpt-5.6-luna）会反复传它。
- `@deepseek-ai/dsh-sandbox` 的 `approveEscalation()` 对「请求模式 == 当前模式」（同模式，非严格更宽）直接抛上述错误，导致每次工具调用失败。
- 纯提示词（系统提示词、preset persona 禁令）拦不住 luna（实测 3/3 照传），只能从代码层根治。

## 补丁内容

把全局 dsh 安装里 `@deepseek-ai/dsh-sandbox/lib/index.js` 的 `approveEscalation` 中一行改为——**同模式请求直接返回（no-op 放行），真实升级仍走审批，降级仍拒绝**：

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

- marker 检测字符串：`local patch (user)`（文件里已含该字符串 = 已补丁，勿重复打）。
- 行为矩阵：同模式 `danger→danger` 返回该 mode；真实升级 `workspace→danger` 仍要求审批；降级仍抛 "not strictly wider"。

## 升级后需重新应用

`npm update -g @deepseek-ai/dsh` 等升级会抹掉 node_modules 里的手工改动（vendor 文件被还原成官方版），需重新打补丁。

## 回滚

```bash
cp ~/.dsh/patches/dsh-sandbox.index.js.orig \
   "$(node -e "console.log(require('node:module').createRequire(process.cwd()+'/x.js').resolve('@deepseek-ai/dsh-sandbox/package.json'))" | sed 's|package.json|lib/index.js|')"
```

> 提示：`~/.dsh/patches/dsh-sandbox.index.js.orig` 是打补丁前的原文件备份；本仓库不包含 vendor 文件副本。
