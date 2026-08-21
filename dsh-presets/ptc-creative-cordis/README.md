# ptc-creative-cordis — PTC-创造 混合模式

> 融合 **PTC (Code)** 与 **创造模式**：既能用 Code SDK 一次组合多步工具，又能动态定义 / 修改 Cordis 插件（`cordis_define` / `cordis_run`）。

本预设目录同时存在于两处（同一内容）：
- 仓库源：`/Users/tny/Desktop/work/my-dsh/dsh-presets/ptc-creative-cordis`（即 GitHub `https://github.com/tttnny/my-dsh` 的子文件夹 `dsh-presets/ptc-creative-cordis`）
- 已安装预设：`/Users/tny/.dsh/.agent-presets/ptc-creative-cordis`（`trust: user`，原名 `ptc-cordis`，已重命名）

组成：
- `agent.cordis.yml` — 在 `code` 预设之上叠加 `tool-presentation` 与 Cordis 创造能力
- `preset.yml` — `name: PTC-创造 混合模式`
- `skills/cordis-plugin-development` / `skills/editing-cordis-compositions`

---

## ⚠️ 为什么需要补丁（不打补丁无法正常使用）

直接使用本预设（或与官方 `cordis` / `standard` 同时存在时）会出现：
- 第二个带 `dsh-tool-cordis` 的预设挂载失败，GUI 会话秒退回 `standard`
- 报错：`Host Cordis inspect provider ... already registered`

### 根因
- `dsh-tool-cordis` 的 `apply()` 会向进程全局单例 `ctx.cordisInspect` 注册一组 **Host inspect provider**。
- 该注册表是 **进程全局单例**（`dsh-cordis-host-runner`），同 `id` 多次 `register()` 直接抛异常，而非幂等。
- 第一个预设（如 `cordis`）已注册后，第二个预设（如 `ptc-creative-cordis`）再注册同名 provider 即触发 `already registered`。
- `cordis_define` 等工具与提示是按 `scope` 分层注册的，只有 **Host inspect provider** 这一层是全局的。

因此需要对 `@deepseek-ai/dsh-tool-cordis` 的 `lib/index.js` 打 **幂等补丁**。

补丁的权威实现就在本机的 **DSH 启动器**：
- `/Users/tny/Desktop/work/ds_test/dsh-mac-app/tools/patch-tool-cordis.sh`
- `/Users/tny/Desktop/work/ds_test/dsh-mac-app/Sources/main.swift` 中的 `dshToolCordisIndexPath()` / `applyToolCordisPatchIfNeeded()` / `startService()`

---

## 补丁做了什么

### 原始代码（`lib/index.js` 中）
```js
	for (const provider of hostInspectProviders(ctx)) ctx.effect(() => ctx.cordisInspect.register(provider), `tool-cordis: inspect ${provider.manifest.id}`);
```

### 补丁后（幂等跳过）
```js
	// PATCH: inspect provider 注册表是进程全局单例（dsh-cordis-host-runner），
	// 同 id 已被其他预设（如 cordis / ptc-cordis）注册时直接抛
	// "already registered"，导致第二个带 tool-cordis 的预设挂载失败。
	const existingHostInspect = new Set(ctx.cordisInspect.list().filter(p => p.platform === "host").map(p => p.id));
	for (const provider of hostInspectProviders(ctx)) {
		if (existingHostInspect.has(provider.manifest.id)) continue;
		ctx.effect(() => ctx.cordisInspect.register(provider), `tool-cordis: inspect ${provider.manifest.id}`);
	}
```

---

## 目标文件定位

**Swift 版**（`dshToolCordisIndexPath()`）按优先级探测：
1. 扁平全局布局：`<nodePrefix>/lib/node_modules/@deepseek-ai/dsh-tool-cordis/lib/index.js`
2. dsh 嵌套依赖：`<nodePrefix>/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-tool-cordis/lib/index.js`
3. pnpm 布局：`<nodePrefix>/lib/node_modules/@deepseek-ai/dsh/node_modules/.pnpm/@deepseek-ai+dsh-tool-cordis@*/node_modules/@deepseek-ai/dsh-tool-cordis/lib/index.js`

**Shell 脚本版**仅覆盖 fnm 两种常见路径（见完整脚本）。

---

## 自动应用（DSH Launcher）

启动器在每次 `startService()` 拉起 `dsh web --port 3080` 之前都会调用 `applyToolCordisPatchIfNeeded()`：

### 完整 Swift 实现（`Sources/main.swift` 769–870 行）

```swift
func dshToolCordisIndexPath() -> String? {
    let node = resolveNodePath()
    let nodeDir = (node as NSString).deletingLastPathComponent
    guard nodeDir != "/usr/bin" else { return nil }
    let globalScope = (nodeDir as NSString).deletingLastPathComponent + "/lib/node_modules/@deepseek-ai"
    // 候选 1：扁平全局布局 node_modules/@deepseek-ai/dsh-tool-cordis/lib/index.js
    let flat = "\(globalScope)/dsh-tool-cordis/lib/index.js"
    if fs.fileExists(atPath: flat) { return flat }
    // 候选 2：dsh 嵌套依赖 node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-tool-cordis/lib/index.js
    let nested = "\(globalScope)/dsh/node_modules/@deepseek-ai/dsh-tool-cordis/lib/index.js"
    if fs.fileExists(atPath: nested) { return nested }
    // 候选 3：pnpm 布局 node_modules/@deepseek-ai/dsh/node_modules/.pnpm/@deepseek-ai+dsh-tool-cordis@*/node_modules/@deepseek-ai/dsh-tool-cordis/lib/index.js
    let pnpmDir = "\(globalScope)/dsh/node_modules/.pnpm"
    if let entries = try? fs.contentsOfDirectory(atPath: pnpmDir) {
        for e in entries where e.hasPrefix("@deepseek-ai+dsh-tool-cordis@") {
            let cand = "\(pnpmDir)/\(e)/node_modules/@deepseek-ai/dsh-tool-cordis/lib/index.js"
            if fs.fileExists(atPath: cand) { return cand }
        }
    }
    return nil
}

/// 适配「创造模式」多预设共存：给 @deepseek-ai/dsh-tool-cordis 打幂等补丁。
///
/// 背景：dsh-tool-cordis 挂载时向进程全局单例 cordisInspect 注册一组 Host
/// inspect provider（Service/Event/Builtin/Tool）。第二个带 tool-cordis 的 agent
/// preset（如「PTC-创造 混合模式」ptc-cordis 与「创造模式」cordis 并存）再挂载时，
/// 注册表已含同名 provider，抛 "Host Cordis inspect provider ... already registered"，
/// 导致第二个预设挂载失败、Web 会话秒退为标准模式。
///
/// 修复：apply() 注册前先列出已注册的 host provider，同 id 幂等跳过。
/// provider 是同一包的静态目录描述，重复注册无意义也无害；
/// 工具（cordis_define 等）与提示按 scope 分层各自注册，不受影响。
///
/// dsh 升级（npm install -g）会覆盖 node_modules 使补丁丢失，因此每次
/// 启动/重启服务前自动检查并重打，保证「创造模式」始终可用。
/// @returns true=本次应用了补丁；false=无需应用（已打过 / dsh 缺失 / 结构不匹配）。
func applyToolCordisPatchIfNeeded() -> Bool {
    let marker = "PATCH: inspect provider 注册表是进程全局单例"
    let oldLine = "\tfor (const provider of hostInspectProviders(ctx)) ctx.effect(() => ctx.cordisInspect.register(provider), `tool-cordis: inspect ${provider.manifest.id}`);"
    let newBlock = """
    \t// PATCH: inspect provider 注册表是进程全局单例（dsh-cordis-host-runner），
    \t// 同 id 已被其他预设（如 cordis / ptc-cordis）注册时直接抛
    \t// "already registered"，导致第二个带 tool-cordis 的预设挂载失败。
    \t// provider 是同一包的静态目录描述，重复注册无意义也无害；
    \t// 工具与提示仍按 scope 分层各自注册，不受影响。这里幂等跳过。
    \tconst existingHostInspect = new Set(ctx.cordisInspect.list().filter(p => p.platform === "host").map(p => p.id));
    \tfor (const provider of hostInspectProviders(ctx)) {
    \t\tif (existingHostInspect.has(provider.manifest.id)) continue;
    \t\tctx.effect(() => ctx.cordisInspect.register(provider), `tool-cordis: inspect ${provider.manifest.id}`);
    \t}
    """
    guard let target = dshToolCordisIndexPath() else { return false }
    guard let content = try? String(contentsOfFile: target, encoding: .utf8) else { return false }
    if content.contains(marker) { return false } // 已打过补丁，幂等跳过
    guard content.contains(oldLine) else {
        appendToServiceLog("tool-cordis 补丁：未匹配到注册行（dsh 版本结构可能已变化），跳过，创造模式多预设可能不可用")
        return false
    }
    let backup = target + ".bak"
    try? fs.removeItem(atPath: backup)
    try? fs.copyItem(atPath: target, toPath: backup)
    let patched = content.replacingOccurrences(of: oldLine, with: newBlock)
    do {
        try patched.write(toFile: target, atomically: true, encoding: .utf8)
        return true
    } catch {
        appendToServiceLog("tool-cordis 补丁写入失败：\(error.localizedDescription)")
        return false
    }
}

func startService() -> Bool {
    // 适配创造模式：每次启动/重启服务前检查并应用 dsh-tool-cordis 幂等补丁
    // （dsh 升级覆盖 node_modules 后自动重打，保证 cordis / ptc-cordis 多预设共存）
    if applyToolCordisPatchIfNeeded() {
        appendToServiceLog("已应用 dsh-tool-cordis 幂等补丁（适配创造模式多预设共存）")
    }
    guard let program = buildProgram() else { return false }
    try? fs.createDirectory(at: logDir, withIntermediateDirectories: true)
    // 轮转服务日志（launchd 的 StandardOutPath 无限增长，防止磁盘被日志占满）
    rotateLogIfNeeded(logFile)
    let env = serviceEnvironment(nodePath: resolveNodePath())
    guard writePlist(servicePlistURL, servicePlistXML(program: program, workspace: workspacePath(), env: env)) else { return false }
    if serviceLoaded() {
        // bootout 是异步卸载：必须等旧任务彻底消失再 bootstrap，
        // 否则 bootstrap 会因时序冲突失败（Bootstrap failed: 5: Input/output error）。
        launchctl(["bootout", "\(guiDomain)/\(serviceLabel)"])
        for _ in 0..<10 where serviceLoaded() { usleep(100_000) } // 最多等 1 秒
    }
    if !serviceLoaded() {
        let (code, _) = launchctl(["bootstrap", guiDomain, servicePlistURL.path])
        if code != 0 { return false }
    }
    if !serviceRunning() {
        // RunAtLoad 恒为 false（不做登录自启），bootstrap 只注册不启动，需 kickstart 手动拉起
        let (code, _) = launchctl(["kickstart", "\(guiDomain)/\(serviceLabel)"])
        if code != 0 { return false }
    }
    return true
}

```

**说明：**
- `applyToolCordisPatchIfNeeded()` 以 `PATCH: inspect provider 注册表是进程全局单例` 为 marker 幂等，已打则 `return false`。
- 未命中 `oldLine` 则写日志并返回 `false`，不破坏文件。
- 否则备份为 `lib/index.js.bak`，用 `replacingOccurrences` 替换为 `newBlock`，成功返回 `true`。
- `startService()` 中：`if applyToolCordisPatchIfNeeded() { appendToServiceLog(...) }` 再写 LaunchAgent plist 并 `bootstrap` / `kickstart`。

---

## 手工应用

### 一键脚本（推荐）
```bash
bash /Users/tny/Desktop/work/ds_test/dsh-mac-app/tools/patch-tool-cordis.sh
```

### 完整 Shell 脚本源码

```bash
#!/bin/bash
# 重新应用 dsh-tool-cordis 幂等补丁（dsh 升级会覆盖 node_modules，需重跑本脚本）。
#
# 背景：@deepseek-ai/dsh-tool-cordis 挂载时向进程全局单例 cordisInspect 注册
# 一组 Host inspect provider（Service/Event/Builtin/Tool）。第二个带 tool-cordis
# 的 agent preset（例如「PTC-创造 混合模式」ptc-cordis 与「创造模式」cordis 并存）
# 再挂载时，注册表已含同名 provider，抛 "Host Cordis inspect provider ... already
# registered"，导致第二个预设挂载失败、GUI 秒退为标准模式。
#
# 修复：apply() 注册前先列出已注册的 host provider，同 id 幂等跳过。
# provider 是同一包的静态目录描述，重复注册无意义也无害；
# 工具（cordis_define 等）与提示按 scope 分层各自注册，不受影响。
set -euo pipefail

TARGET=""
for cand in \
  "/Users/tny/.local/share/fnm/node-versions/"*/installation/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-tool-cordis/lib/index.js \
  "$HOME/.local/share/fnm/node-versions/"*/installation/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-tool-cordis/lib/index.js
do
  [ -f "$cand" ] && TARGET="$cand" && break
done
if [ -z "$TARGET" ]; then
  echo "未找到 dsh-tool-cordis lib/index.js，请检查 dsh 安装位置" >&2
  exit 1
fi

MARKER="PATCH: inspect provider 注册表是进程全局单例"
if grep -q "$MARKER" "$TARGET"; then
  echo "补丁已存在，跳过：$TARGET"
  exit 0
fi

cp "$TARGET" "$TARGET.bak"

# 用 node 做精确替换（避免 sed 转义地狱）
node -e '
const fs = require("fs");
const p = process.argv[1];
let s = fs.readFileSync(p, "utf8");
const old = `\tfor (const provider of hostInspectProviders(ctx)) ctx.effect(() => ctx.cordisInspect.register(provider), \`tool-cordis: inspect ${provider.manifest.id}\`);`;
const neu = `\t// PATCH: inspect provider 注册表是进程全局单例（dsh-cordis-host-runner），
\t// 同 id 已被其他预设（如 cordis / ptc-cordis）注册时直接抛
\t// "already registered"，导致第二个带 tool-cordis 的预设挂载失败。
\t// provider 是同一包的静态目录描述，重复注册无意义也无害；
\t// 工具与提示仍按 scope 分层各自注册，不受影响。这里幂等跳过。
\tconst existingHostInspect = new Set(ctx.cordisInspect.list().filter(p => p.platform === "host").map(p => p.id));
\tfor (const provider of hostInspectProviders(ctx)) {
\t\tif (existingHostInspect.has(provider.manifest.id)) continue;
\t\tctx.effect(() => ctx.cordisInspect.register(provider), \`tool-cordis: inspect ${provider.manifest.id}\`);
\t}`;
if (!s.includes(old)) { console.error("未匹配到待替换代码，请检查 dsh 版本"); process.exit(2); }
s = s.replace(old, neu);
fs.writeFileSync(p, s);
console.log("补丁已应用：", p);
'
node --check "$TARGET" && echo "语法校验通过"
echo "完成：重新启动 dsh 服务（或等 KeepAlive 自愈）后生效。"
```

---

## 幂等、备份与校验
- **Marker**：`PATCH: inspect provider 注册表是进程全局单例`。
- **备份**：`lib/index.js.bak`。回滚：`cp lib/index.js.bak lib/index.js` 后重启服务。
- **语法校验**：脚本 `node --check "$TARGET"`。
- **结构不匹配**：`oldLine` 未命中时脚本 `exit 2`，Swift 写日志并返回 `false`。

---

## 升级后需重打
`npm install -g @deepseek-ai/dsh` 会重写 `node_modules`，补丁丢失。
- **启动器**：每次 `startService()` 前自动重检重打。
- **无启动器**：升级后手工重跑脚本，再重启 `dsh web`。

---

## 验证
1. `grep -q "PATCH: inspect provider" $(node -e "console.log(require.resolve('@deepseek-ai/dsh-tool-cordis/package.json'))" | sed 's|package.json|lib/index.js|') && echo "patched" || echo "not patched"`
2. `standingKeyFor("ptc-creative-cordis")` 应返回 `mounted OK`。
3. `tail -n 50 ~/Library/Logs/DSHLauncher/dsh-web.log` 查找 `[DSH Launcher] 已应用 dsh-tool-cordis 幂等补丁`。
4. 同时启用 `cordis` 与 `ptc-creative-cordis`，分别新开会话，不再秒退。

---

## 目录结构
```
dsh-presets/ptc-creative-cordis/
├── agent.cordis.yml
├── preset.yml
├── README.md
└── skills/
    ├── cordis-plugin-development/
    └── editing-cordis-compositions/
```

---

## 相关文件
- 启动器：`/Users/tny/Desktop/work/ds_test/dsh-mac-app` (`tools/patch-tool-cordis.sh`, `Sources/main.swift`)
- 本仓库：`https://github.com/tttnny/my-dsh` → `dsh-presets/ptc-creative-cordis/`
- 已安装：`~/.dsh/.agent-presets/ptc-creative-cordis/`
- 目标示例：`~/.local/share/fnm/node-versions/v24.16.0/installation/lib/node_modules/@deepseek-ai/dsh-tool-cordis/lib/index.js`

*最后更新：2026-08-21，由启动器源码自动补充 | 原 `ptc-cordis` 已重命名为 `ptc-creative-cordis`*