# ptc-creative-cordis — PTC-创造 混合模式

> 融合 **PTC (Code)** 与 **创造模式**：既能用 Code SDK 一次组合多步工具，又能动态定义 / 修改 Cordis 插件（`cordis_define` / `cordis_run`）。

本目录是一个 **dsh agent preset**：安装后与官方 `standard` / `code` / `cordis` 预设并列，可在新建会话时选择。
它与 dsh 的启动方式无关——`dsh web`、命令行、或任何第三方启动器启动的 dsh 均可使用。

## 组成

- `agent.cordis.yml` — 在 `code` 预设之上叠加 `tool-presentation` 与 Cordis 创造能力
- `preset.yml` — `name: PTC-创造 混合模式`
- `skills/cordis-plugin-development/` / `skills/editing-cordis-compositions/`

## 安装与启用

```bash
# 安装为用户级 preset（preset id = 目录名，必须保持为 ptc-creative-cordis）
mkdir -p ~/.dsh/.agent-presets
cp -R ptc-creative-cordis ~/.dsh/.agent-presets/
# 或软链接，跟随仓库更新：
# ln -s "$(pwd)/ptc-creative-cordis" ~/.dsh/.agent-presets/ptc-creative-cordis
```

然后启动 `dsh web`（或重启已经在跑的 dsh）：在新建会话界面选择「PTC-创造 混合模式」，或在 General 设置中把它设为默认。

> ⚠️ 如果你还需要同时使用官方 `cordis` 预设，请先完成下一节的补丁，否则本预设会挂载失败。

---

## 与官方 cordis 预设共存：需要打补丁

同一进程中先挂载了带 `dsh-tool-cordis` 的预设（如官方 `cordis`）、再挂载本预设时：

- 第二个预设挂载失败，GUI 会话秒退回 `standard`
- 报错：`Host Cordis inspect provider ... already registered`

### 根因

- `dsh-tool-cordis` 的 `apply()` 会向进程全局单例 `ctx.cordisInspect` 注册一组 **Host inspect provider**。
- 该注册表是 **进程全局单例**（`dsh-cordis-host-runner`），同 `id` 多次 `register()` 直接抛异常，而非幂等。
- `cordis_define` 等工具与提示是按 `scope` 分层注册的，只有 **Host inspect provider** 这一层是全局的。

因此需要对 `@deepseek-ai/dsh-tool-cordis` 的 `lib/index.js` 打**幂等补丁**：注册前先列出已注册的 host provider，同 id 跳过。

### 触发条件：什么叫「同时使用」

「同时使用」**不要求两个会话同时开着**，实际机制是：

- 预设的挂载是**常驻挂载**（standing mount）：同一 dsh 进程内，某个预设的 composition 只在第一次被会话使用时完整挂载一次（执行其中的 `apply()`），随后进程存活期间一直驻留内存；同预设的后续会话直接复用，`apply()` 不重跑。
- 因此冲突发生在**同一进程内先后用过两个不同的、都带 `dsh-tool-cordis` 的预设**：先挂载的注册成功，后挂载的注册同 id provider 时抛 `already registered`。
- 谁的预设先被使用谁赢；**关掉会话不会清理**（常驻挂载只在进程退出时释放），唯一重置方式是**重启 dsh 进程**。
- 官方随附预设（`standard` / `code` / `minimal` / `cordis`）中只有 `cordis` 带 `dsh-tool-cordis`。所以：只用 `ptc-creative-cordis` 单一预设不会触发冲突；同一进程内先后用过 `cordis` 与 `ptc-creative-cordis`，第二次挂载即失败，需要本补丁。

### 补丁内容

**原始代码（`lib/index.js` 中）**

```js
	for (const provider of hostInspectProviders(ctx)) ctx.effect(() => ctx.cordisInspect.register(provider), `tool-cordis: inspect ${provider.manifest.id}`);
```

**补丁后（幂等跳过）**

```js
	// PATCH: inspect provider 注册表是进程全局单例（dsh-cordis-host-runner），
	// 同 id 已被其他预设（如 cordis / ptc-creative-cordis）注册时直接抛
	// "already registered"，导致第二个带 tool-cordis 的预设挂载失败。
	const existingHostInspect = new Set(ctx.cordisInspect.list().filter(p => p.platform === "host").map(p => p.id));
	for (const provider of hostInspectProviders(ctx)) {
		if (existingHostInspect.has(provider.manifest.id)) continue;
		ctx.effect(() => ctx.cordisInspect.register(provider), `tool-cordis: inspect ${provider.manifest.id}`);
	}
```

### 一键应用脚本（与启动方式无关）

脚本自动定位全局安装中的 `dsh-tool-cordis`（兼容扁平 / 嵌套 / pnpm 布局），无需手工指定路径；幂等，可重复运行。

```bash
#!/bin/bash
# 重新应用 dsh-tool-cordis 幂等补丁（dsh 升级会覆盖 node_modules，需重跑本脚本）。
# 与启动方式无关：dsh web / CLI / 任何启动器启动的 dsh 均适用。
set -euo pipefail

# 自动定位全局 node_modules（npm 或 pnpm 全局安装）
ROOT="$(npm root -g 2>/dev/null || true)"
[ -n "$ROOT" ] || ROOT="$(pnpm root -g 2>/dev/null || true)"
[ -n "$ROOT" ] || { echo "未找到全局 node_modules，请确认 dsh 已通过 npm/pnpm 全局安装" >&2; exit 1; }

TARGET="$(find "$ROOT" -type f -path '*dsh-tool-cordis/lib/index.js' 2>/dev/null | head -n 1 || true)"
[ -n "$TARGET" ] || { echo "未找到 dsh-tool-cordis lib/index.js，请检查 dsh 安装位置" >&2; exit 1; }

MARKER="PATCH: inspect provider 注册表是进程全局单例"
if grep -q "$MARKER" "$TARGET"; then
  echo "补丁已存在，跳过：$TARGET"
  exit 0
fi

cp "$TARGET" "$TARGET.bak"

# 用 node 做精确替换（避免 sed 转义地狱）。
# 注意：old/neu 用双引号字符串拼接，${...} 是字面量而非插值。
node -e '
const fs = require("fs");
const p = process.argv[1];
let s = fs.readFileSync(p, "utf8");
const old = "\tfor (const provider of hostInspectProviders(ctx)) ctx.effect(() => ctx.cordisInspect.register(provider), `tool-cordis: inspect ${provider.manifest.id}`);";
const neu =
  "\t// PATCH: inspect provider 注册表是进程全局单例（dsh-cordis-host-runner），\n" +
  "\t// 同 id 已被其他预设（如 cordis / ptc-creative-cordis）注册时直接抛\n" +
  "\t// \"already registered\"，导致第二个带 tool-cordis 的预设挂载失败。\n" +
  "\t// provider 是同一包的静态目录描述，重复注册无意义也无害；\n" +
  "\t// 工具与提示仍按 scope 分层各自注册，不受影响。这里幂等跳过。\n" +
  "\tconst existingHostInspect = new Set(ctx.cordisInspect.list().filter(p => p.platform === \"host\").map(p => p.id));\n" +
  "\tfor (const provider of hostInspectProviders(ctx)) {\n" +
  "\t\tif (existingHostInspect.has(provider.manifest.id)) continue;\n" +
  "\t\tctx.effect(() => ctx.cordisInspect.register(provider), `tool-cordis: inspect ${provider.manifest.id}`);\n" +
  "\t}";
if (!s.includes(old)) { console.error("未匹配到待替换代码，请检查 dsh 版本"); process.exit(2); }
s = s.replace(old, neu);
fs.writeFileSync(p, s);
console.log("补丁已应用：", p);
' "$TARGET"
node --check "$TARGET" && echo "语法校验通过"
echo "完成：重启 dsh（如 dsh web）后生效。"
```

保存为 `patch-tool-cordis.sh` 后 `bash patch-tool-cordis.sh`，然后重启 dsh。

### 幂等、备份与校验

- **Marker**：`PATCH: inspect provider 注册表是进程全局单例`，已打则跳过。
- **备份**：`lib/index.js.bak`。回滚：`cp lib/index.js.bak lib/index.js` 后重启 dsh。
- **语法校验**：脚本执行 `node --check "$TARGET"`。
- **结构不匹配**：`oldLine` 未命中时脚本 `exit 2`，不破坏文件。

### dsh 升级后需重打

`npm install -g @deepseek-ai/dsh` 会重写 `node_modules`，补丁丢失。升级后重跑一次本脚本，再重启 dsh。

---

## 验证

1. 补丁确认（已打则输出 `patched`）：

   ```bash
   TARGET="$(find "$(npm root -g)" -type f -path '*dsh-tool-cordis/lib/index.js' 2>/dev/null | head -n 1)"
   grep -q "PATCH: inspect provider" "$TARGET" && echo patched || echo "not patched"
   ```

   （直接重跑应用脚本也可：输出 "补丁已存在，跳过" 即已生效。）

2. 功能验证：同时启用官方 `cordis` 与 `ptc-creative-cordis`，分别新开会话，确认两个会话都正常挂载、不再秒退回 `standard`。

---

## 目录结构

```
ptc-creative-cordis/
├── agent.cordis.yml
├── preset.yml
├── README.md
└── skills/
    ├── cordis-plugin-development/
    └── editing-cordis-compositions/
```

---

## 相关

- 仓库：`https://github.com/tttnny/my-dsh` → `dsh-presets/ptc-creative-cordis/`
- 安装位置：`~/.dsh/.agent-presets/ptc-creative-cordis/`
- 原 `ptc-cordis` 已重命名为 `ptc-creative-cordis`（preset id = 目录名）