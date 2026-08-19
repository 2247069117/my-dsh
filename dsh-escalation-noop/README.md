# dsh-escalation-noop

根治 dsh 工具调用报错的零依赖插件方案（**升级免疫**）：

```
Error: sandbox escalation to "danger-full-access" is not strictly wider than this call's current "danger-full-access" mode
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

2. **自愈插件（升级免疫）**：`index.js` 是零依赖 Cordis 插件（只 import `node:fs` / `node:module` / `node:path`），每次 dsh 启动时：
   - 用 `createRequire(import.meta.url).resolve('@deepseek-ai/dsh-sandbox/package.json')` 定位真实文件（跟随 symlink 到全局安装）；
   - 含 marker → 打印 `already patched` 跳过；缺补丁 → 先备份到 `~/.dsh/patches/dsh-sandbox.index.js.bak`，再做精确字符串替换 + 括号配平校验 + 原子写回（tmp + rename）；
   - 任何异常只打印警告，**绝不让 dsh 启动失败**。

3. **挂载（升级免疫）**：`cordis.patch.yml` 是用户级组合 patch（`~/.dsh/cordis.patch.yml`），对所有 profile 生效、应用顺序在 bundle 与 profile 层之后，dsh 升级不会覆盖它。注意：新行必须包在 `insert:` 里——裸 `- id: ...` 行是"覆盖已有行"语义，目标不存在会被静默跳过。

## 文件

| 文件 | 作用 |
|---|---|
| `index.js` | 插件本体（复制到 `~/.dsh/profiles/web/plugins/dsh-escalation-noop/`） |
| `package.json` | 插件包清单（`type: module`，零依赖） |
| `cordis.patch.yml` | 用户级组合 patch 示例（即 `~/.dsh/cordis.patch.yml` 全文） |
| `README.md` | 本文档 |

## 安装

```bash
# 1. 插件包放进 web profile
mkdir -p ~/.dsh/profiles/web/plugins
cp -R dsh-escalation-noop ~/.dsh/profiles/web/plugins/   # 取 index.js + package.json 即可

# 2. web profile 声明依赖（先备份 package.json）
cd ~/.dsh/profiles/web
# 在 package.json 的 dependencies 加 "dsh-escalation-noop": "file:./plugins/dsh-escalation-noop"
pnpm install

# 3. （可选）其他 profile 共享解析：链接进共享 fallback 目录
ln -s ~/.dsh/profiles/web/plugins/dsh-escalation-noop ~/.dsh/profiles/node_modules/dsh-escalation-noop

# 4. 用户级 patch 挂载（所有 profile 生效）
#    把 cordis.patch.yml 内容写入 ~/.dsh/cordis.patch.yml（不存在则新建）

# 5. 重启 dsh 一次
```

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

`npm update -g @deepseek-ai/dsh` 等升级会抹掉 node_modules 里的手工改动，但：

1. 升级后第一次启动，插件自动检测到补丁丢失并重打（日志醒目提示 `restart dsh once`）；
2. 用户再重启一次即恢复（ESM 缓存约束：文件改动对当前进程无效，只对下次启动生效）。

## 回滚

```bash
# 1. 移除挂载：删除 ~/.dsh/cordis.patch.yml 中的 insert 行（或整个文件）
# 2. 移除依赖：恢复 web/package.json 备份并 pnpm install
# 3. 删除插件与链接：
rm -rf ~/.dsh/profiles/web/plugins/dsh-escalation-noop
rm -f ~/.dsh/profiles/node_modules/dsh-escalation-noop
# 4. 还原补丁文件：
cp ~/.dsh/patches/dsh-sandbox.index.js.orig \
   $(node -e "console.log(require('node:module').createRequire(process.cwd()+'/x.js').resolve('@deepseek-ai/dsh-sandbox/package.json'))" | sed 's|package.json|lib/index.js|')
```

> 提示：`dsh-sandbox.index.js.orig`（补丁前的原文件）需要在本机打补丁前自行备份；本仓库不包含 vendor 文件副本。
