# dsh-llm-opencode-zen

DSH harness 插件：自动探测并注册 **OpenCode Zen 免费模型**（`*-free` 系列）到 harness LLM 目录，让免费模型与其他供应商（freellm/a6/DeepSeek 等）一样，在 Web GUI 聊天界面的模型选择器中直接可选可用。

## 功能

- **自动探测**：启动时 + 每 6 小时（可配置）自动拉取 OpenCode Zen `/models` 目录，筛选 `*-free` 免费模型并逐个探测可用性（匿名无 Key 调用 `/v1/chat/completions`，仅需网络可达，无需任何 API Key）。
- **新增自动添加**：探测发现的新免费模型自动写入缓存并注册进 LLM 目录（模型选择器下次打开即可见）。
- **失效自动移除**：探测失败（模型下架/失效）的模型自动从缓存与 LLM 目录移除；探测缓存 24h 过期自动重探。
- **模型只读**：配置界面没有模型编辑字段——用户只能看到自动获取的模型，不能手动新增/修改/删除（避免手动配置的假模型或失效模型）。
- **供应商一键关闭**：Web 设置 → 插件 → 插件配置 → **OpenCode Zen（免费模型）卡片**中的开关（`enabled`），关闭后该供应商及其模型立即从 LLM 目录移除，聊天选择器不再出现；重新打开立即恢复。
- **思考强度可选**：推理模型支持 5 档思考强度（关闭/低/中/高/最大），与全局默认档位兼容，可在聊天界面与其他供应商一样选择。
- **可选 Key 模式**：配置 `apiKey` 后切换为带 Key 的全量目录模式（跳过探测，直接使用官方全部模型，仍只读）。

## GUI 操作

- **供应商开关**：设置 → 插件 → **插件配置** 标签页 → **OpenCode Zen（免费模型）** 卡片 → 启用/停用 开关。
  - 模型列表只读：自动探测/同步，无新增、修改、删除入口。
  - 开关旁说明：停用隐藏供应商与模型，重新启用恢复最近探测结果；模型失效自动移除、新增自动添加。
- **模型选择**：聊天界面模型选择器 → 供应商 **OpenCode Zen** → 选择任意 `*-free` 模型（与其他供应商一致）。
- **思考强度**：模型选择器内选择思考强度档位：关闭 / 低 / 中 / 高 / 最大（推理模型有效；非推理模型自动忽略）。
- 插件自带的浏览器半侧（`dsh.client` 声明 + `lib/client.js`）由 client 模块系统在 **DSH 重启后**扫描装配——修改插件后需重启容器生效。

## 安装

### GitHub 源（推荐，免 npm 发布）

```sh
dsh plugin --profile web add github:2247069117/dsh-llm-opencode-zen
```

> lib/ 构建产物随仓库提交，无 prepare 构建脚本，安装即用，不触发 pnpm 构建脚本拦截；重启 DSH 后插件装配（含浏览器半侧 GUI 卡片）。

### 本地构建装配

```bash
# 在插件目录构建
bash scripts/build.sh

# 装配进 profile（双路径：bundle 装配 + 运行时热装配）
# bundles 数组加入 @dsh-external/dsh-llm-opencode-zen（package.json 已声明 dsh.bundle.patch）
# 依赖 junction：profile/node_modules/@dsh-external/dsh-llm-opencode-zen → 插件目录
```

重启 DSH 后插件随 bundles 正式装配。

## 配置（设置区：OpenCode Zen）

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `enabled` | `true` | 供应商总开关；关闭即从 LLM 目录移除 |
| `apiKey` | `""` | 留空 = 匿名免费模式（自动探测）；填写 = Key 模式（全量目录） |
| `baseURL` | `https://opencode.ai/zen/v1` | Zen API 端点 |
| `refreshIntervalMs` | `6h` | 定时同步间隔（最小 60s） |
| `extraSlugs` | `[]` | 额外免费模型 slug（Key 模式跳过探测时兜底） |

> 无 `models` 字段：模型列表完全由自动探测维护，用户不可编辑。

## 状态与缓存

- 缓存：`~/.dsh/opencode-zen-free-models.json`（原子写入，含探测时间与模型元数据）。
- 日志：插件通过 harness 日志输出每次同步的 `+added / -removed` 明细。

## 验证

- 模型出现在 GUI 聊天模型选择器（供应商 `OpenCode Zen`）。
- 关闭 `enabled` 后选择器不再出现该供应商；重新开启后恢复。
- 缓存中注入失效模型后，下一次同步自动移除。

## 插件市场导出兼容（可移植部署）

默认 `link:/dsh-llm-opencode-zen` 是**绝对路径** spec：插件市场「高级 → 导出备份 → 导入其他环境」时会被 dshmarket 判为不可移植（`unportableDeps`），恢复机没有该路径导致重装失败。**一键切换为可移植形态**：

```bash
bash scripts/make-vendor.sh /dsh-llm-opencode-zen          # 本插件；默认 profile /root/.dsh/profiles/web
# 通用：任何 DSH 本地插件均可处理（routing-suite-updater / super-injector 已同法转换）
# bash scripts/make-vendor.sh <插件目录> [profile目录]
```

脚本完成：构建 → 同步插件到 `<profile>/vendor/<短包名>` → 依赖 spec 改为相对 `link:./vendor/<短包名>` → 重建 node_modules 链接 → 按 dshmarket 语义校验（备份体积 < 2MB、vendor 文件随备份携带、本插件 unportableDeps 为空）。之后：

- **导出**：插件市场 → 高级 → 导出备份（本环境三个插件 vendor 目录共 54 个文件随备份走，约 1.76MB）
- **导入**：新环境导入备份 → 按清单重装（相对 spec 随 profile 目录重建）→ 重启 DSH 即运行

> 说明：全局 `~/.dsh/settings.yaml`（含 `llm-opencode-zen.enabled` 等配置）不随 profile 备份走，迁移配置时手动复制对应段落即可（默认 `enabled: true`，不迁移也能跑）。
> 插件更新流程：改代码 → 构建 → `bash scripts/make-vendor.sh <插件目录>` → 重启 DSH。

## 许可证

BSD-3-Clause
