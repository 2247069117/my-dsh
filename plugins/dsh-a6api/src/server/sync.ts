import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import { getCatalogEntry } from './catalog.js';
import type { A6ApiConfig } from '../types.js';

/**
 * DSH 原生配置整合（消除插件独立配置文件 dsh-a6api-config.json）：
 * - 凭据（API Key / 系统访问令牌 / userId）→ ~/.dsh/.credentials.yaml（refs，0600）
 * - 非机密状态（baseURL / 模型列表）→ ~/.dsh/settings.yaml 的 llm-pi-ai.providers.a6api 块
 * - 读写优先走 DSH 原生缝 ctx.credentials / ctx.settings（env 优先语义、串行写队列、schema 校验、
 *   热发布）；原生服务缺失或写入失败时回退到直接读写两个文件（格式与 DSH 原生一致）。
 * - 旧版独立配置文件在启动时自动迁移（只填空不覆盖）并归档为 dsh-a6api-config.json.bak。
 */

export const A6API_CRED_REF = 'A6API_API_KEY';
export const A6API_TOKEN_REF = 'A6API_ACCESS_TOKEN';
export const A6API_USER_REF = 'A6API_USER_ID';

/** 环境变量遮蔽类错误特征（DSH credentials-local 的 assertUnshadowed 文案）：env 值优先，写入无意义 */
const ENV_SHADOW_RE = /supplied read-only by the launching environment|would be shadowed/;

/**
 * 从 JWT 形态的系统访问令牌 payload 解析用户 ID。
 * new-api 系「系统访问令牌」是携带 id claim 的 JWT；Web 控制台 API 以
 * Authorization + New-Api-User（用户 ID）双头鉴权，缺 New-Api-User 会被 401 拒绝，
 * 导致「仅配置令牌、尚未持久化 userId」时 /api/user/self 永远失败（鸡生蛋问题：
 * 发现 userId 需要鉴权，鉴权又需要 userId）。令牌本身即可零请求解码出用户 ID，
 * 打破该循环。非 JWT（原始会话 Cookie 等）返回 undefined，保持原「接口自动发现」路径。
 */
export function deriveUserIdFromAccessToken(token: string | undefined): string | undefined {
  const t = (token || '').trim();
  if (!t || t.startsWith('session=') || t.includes(';')) return undefined;
  const parts = t.split('.');
  if (parts.length !== 3) return undefined;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const id = Number(payload?.id ?? payload?.user_id ?? payload?.userId ?? payload?.sub);
    if (Number.isInteger(id) && id > 0) return String(id);
  } catch {}
  return undefined;
}

const SETTINGS_NS = 'llm-pi-ai';
const PROVIDER_KEY = 'a6api';
const DEFAULT_BASE_URL = 'https://api.a6api.com';
const LEGACY_CONFIG_NAME = 'dsh-a6api-config.json';

/** 原子写入：先写临时文件（0600/0644）再 rename，避免崩溃截断与权限位泄露 */
async function atomicWriteFile(filePath: string, content: string, mode = 0o600): Promise<void> {
  const dir = path.dirname(filePath);
  await fsp.mkdir(dir, { recursive: true });
  const tmpPath = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
  await fsp.writeFile(tmpPath, content, { mode });
  await fsp.rename(tmpPath, filePath);
}

function dshHome(): string {
  return process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
}

function legacyConfigFile(): string {
  return path.join(dshHome(), LEGACY_CONFIG_NAME);
}

function credentialsFile(): string {
  return path.join(dshHome(), '.credentials.yaml');
}

function settingsFile(): string {
  return path.join(dshHome(), 'settings.yaml');
}

/** 可选地取 DSH 原生服务；缺失时返回 undefined（调用方回退到文件直读写） */
function getCredentials(ctx: any) {
  try {
    if (ctx && typeof ctx.get === 'function') return ctx.get('credentials');
  } catch {}
  return undefined;
}

function getSettings(ctx: any) {
  try {
    if (ctx && typeof ctx.get === 'function') return ctx.get('settings');
  } catch {}
  return undefined;
}

/** 去掉 OpenAI 兼容端点的 /v1 后缀，还原插件 API 调用所用的裸地址 */
function stripV1(baseURL: string): string {
  return baseURL.replace(/\/v1\/?$/, '');
}

// ===== .credentials.yaml 手写读写（原生缝缺失时的兜底，格式与 DSH 一致：version:1 + refs） =====

/** Read a key from .credentials.yaml */
export async function readCredentialKey(refKey: string): Promise<string | null> {
  try {
    const yaml = await fsp.readFile(credentialsFile(), 'utf8');
    let inRefs = false;
    for (const line of yaml.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const indent = line.match(/^\s*/)?.[0].length ?? 0;
      if (indent === 0) {
        inRefs = trimmed.startsWith('refs:');
        continue;
      }
      if (!inRefs) continue;
      const m = /^([A-Za-z0-9_.\-]+):\s*(.*)$/.exec(trimmed);
      if (m && m[1] === refKey) {
        let val = m[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        return val || null;
      }
    }
  } catch {}
  return null;
}

/**
 * Write/update a key in .credentials.yaml。
 * DSH credentials-local 对空 ref 值整体拒收文档（parseRefs 抛错），因此
 * 空串/undefined = 删除该键行（与原生 unset 语义一致），绝不写入空值。
 */
export async function writeCredentialKey(refKey: string, value: string): Promise<void> {
  const cFile = credentialsFile();
  let yaml = '';
  try {
    yaml = await fsp.readFile(cFile, 'utf8');
  } catch {
    yaml = 'version: 1\nrefs:\n';
  }

  const lines = yaml.split(/\r?\n/);
  let inRefs = false;
  let refsLineIdx = -1;
  let foundIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (indent === 0) {
      if (trimmed.startsWith('refs:')) {
        inRefs = true;
        refsLineIdx = i;
      } else {
        inRefs = false;
      }
      continue;
    }
    if (inRefs) {
      const m = /^([A-Za-z0-9_.\-]+):/.exec(trimmed);
      if (m && m[1] === refKey) {
        foundIdx = i;
        break;
      }
    }
  }

  if (value === '') {
    // 删除语义：移除该键行（refs 下无其他键时保留空的 refs: 骨架，是合法空存储）
    if (foundIdx >= 0) lines.splice(foundIdx, 1);
  } else {
    if (foundIdx >= 0) {
      lines[foundIdx] = `  ${refKey}: ${JSON.stringify(value)}`;
    } else {
      if (refsLineIdx >= 0) {
        lines.splice(refsLineIdx + 1, 0, `  ${refKey}: ${JSON.stringify(value)}`);
      } else {
        lines.push('refs:', `  ${refKey}: ${JSON.stringify(value)}`);
      }
    }
  }

  await atomicWriteFile(cFile, lines.join('\n'), 0o600);
}

/**
 * 修复凭据文件松散权限（group/other 位置位时收回到 0600）。
 * DSH 原生 credentials-local 对可被其他用户读取的文档整体拒写（fail loud，
 * 报 "readable beyond its owner"）；容器/沙箱文件系统可能产生异常权限位（如 007），
 * 一旦发生，用户在设置页保存的凭据会被原生缝拒绝——此前插件把该失败静默吞掉，
 * 造成「显示保存成功、令牌实际丢失」。这里在每次写入前主动收紧权限位：
 * 只移除访问位、绝不放宽，安全且幂等；收紧后原生缝即可正常写入。
 */
async function healCredentialsFileMode(): Promise<void> {
  const cFile = credentialsFile();
  try {
    const st = await fsp.stat(cFile);
    if (st.mode & 0o077) {
      await fsp.chmod(cFile, 0o600);
      console.warn('[dsh-a6api] 已将凭据文件权限收紧为 0600（此前 group/other 位被置位，原生凭据服务因此拒绝写入）');
    }
  } catch {
    // 文件不存在等：无需处理（原生缝会走创建路径，mode 0600）
  }
}

// ===== settings.yaml 手写读写（原生缝缺失/写入失败时的兜底） =====

/** 解析 settings.yaml 中 llm-pi-ai.providers.a6api 块的模型 ID 列表 */
async function readRawConfiguredModels(): Promise<string[]> {
  try {
    const yaml = await fsp.readFile(settingsFile(), 'utf8');
    const lines = yaml.split(/\r?\n/);
    let inA6 = false;
    let inModels = false;
    const modelIds: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const indent = line.match(/^\s*/)?.[0].length ?? 0;
      if (indent === 4 && trimmed.startsWith('a6api:')) {
        inA6 = true;
        inModels = false;
        continue;
      }
      if (inA6 && indent <= 4 && !trimmed.startsWith('a6api:')) {
        inA6 = false;
        inModels = false;
      }
      if (inA6 && indent === 6 && trimmed.startsWith('models:')) {
        inModels = true;
        continue;
      }
      if (inModels && indent === 8 && trimmed.startsWith('- id:')) {
        const id = trimmed.replace(/^- id:\s*/, '').trim();
        if (id) modelIds.push(id);
      }
    }
    return modelIds;
  } catch {
    return [];
  }
}

/** 解析 settings.yaml 中 a6api 块的 baseURL（含 /v1 后缀） */
async function readRawA6apiBaseURL(): Promise<string> {
  try {
    const yaml = await fsp.readFile(settingsFile(), 'utf8');
    let inA6 = false;
    for (const line of yaml.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const indent = line.match(/^\s*/)?.[0].length ?? 0;
      if (indent === 4 && trimmed.startsWith('a6api:')) {
        inA6 = true;
        continue;
      }
      if (inA6 && indent <= 4 && !trimmed.startsWith('a6api:')) inA6 = false;
      if (inA6 && indent === 6 && trimmed.startsWith('baseURL:')) {
        return trimmed.replace(/^baseURL:\s*/, '').trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {}
  return '';
}

/** 定位 settings.yaml 中 `llm-pi-ai:` -> `providers:` -> `a6api:` 的行区间（供写入/移除共用） */
function scanA6apiBlockRange(lines: string[]): {
  a6Start: number;
  a6End: number;
  providersLineIdx: number;
  llmLineIdx: number;
} {
  let inLlm = false;
  let inProviders = false;
  let inA6 = false;
  let a6Start = -1;
  let a6End = -1;
  let providersLineIdx = -1;
  let llmLineIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = line.match(/^\s*/)?.[0].length ?? 0;

    if (indent === 0) {
      inLlm = trimmed.startsWith('llm-pi-ai:');
      if (inLlm) llmLineIdx = i;
      inProviders = false;
      inA6 = false;
      continue;
    }

    if (inLlm && indent === 2 && trimmed.startsWith('providers:')) {
      inProviders = true;
      providersLineIdx = i;
      inA6 = false;
      continue;
    }

    if (inProviders && indent === 4) {
      if (trimmed.startsWith('a6api:')) {
        inA6 = true;
        a6Start = i;
        a6End = i + 1;
      } else {
        if (inA6) {
          a6End = i;
          inA6 = false;
        }
      }
      continue;
    }

    if (inA6 && indent > 4) {
      a6End = i + 1;
    } else if (inA6 && indent <= 4) {
      a6End = i;
      inA6 = false;
    }
  }

  return { a6Start, a6End, providersLineIdx, llmLineIdx };
}

/** 裸写 a6api 提供商块到 settings.yaml（原生缝写入失败时的兜底，格式与 DSH 原生一致）。
 *  注意：仅以非空模型列表调用（空列表走移除路径）；整块替换会丢弃用户在块内手工添加的
 *  其他字段（如 compat），与原生 update 的 merge 语义有差异，属兜底路径的已知取舍。 */
async function writeRawA6apiBlock(baseURL: string, modelIds: string[]): Promise<void> {
  const sFile = settingsFile();
  let yaml = '';
  try {
    yaml = await fsp.readFile(sFile, 'utf8');
  } catch {
    yaml = 'llm-pi-ai:\n  providers:\n';
  }

  const modelEntries = modelIds.map((id) => {
    // 参数以目录为准：有则写入，缺则省略（llm-pi-ai 用默认值兜底），绝不写推断值
    const entry = getCatalogEntry(id);
    const lines = [`        - id: ${id}`];
    // name 用 JSON 双引号序列化（防 YAML 注入：冒号/#/换行），并去除换行
    if (entry?.name) lines.push(`          name: ${JSON.stringify(String(entry.name).replace(/\r?\n/g, ' '))}`);
    if (entry?.contextWindow != null) lines.push(`          contextWindow: ${entry.contextWindow}`);
    if (entry?.maxTokens != null) lines.push(`          maxTokens: ${entry.maxTokens}`);
    if (entry?.input && entry.input.length > 0) {
      lines.push(`          input:`);
      for (const m of entry.input) lines.push(`            - ${m}`);
    }
    if (entry?.reasoningEfforts && typeof entry.reasoningEfforts === 'object') {
      lines.push(`          reasoningEfforts:`);
      for (const [k, v] of Object.entries(entry.reasoningEfforts)) {
        // null 值输出 valueless 键（如 `off: `，DSH 解析为 supported-send-nothing，与 native 路径语义一致）
        lines.push(v ? `            ${k}: ${v}` : `            ${k}: `);
      }
    }
    return lines.join('\n');
  });

  // Ensure OpenAI compatible endpoints in DSH settings.yaml have the /v1 suffix
  const dshBaseUrl = baseURL.endsWith('/v1') ? baseURL : `${baseURL.replace(/\/+$/, '')}/v1`;

  const a6apiBlockLines = [
    `    a6api:`,
    `      displayName: A6API`,
    `      apiKeyEnv: ${A6API_CRED_REF}`,
    `      api: openai-completions`,
    `      baseURL: ${dshBaseUrl}`,
    `      models:`,
    ...modelEntries,
  ];

  const lines = yaml.split(/\r?\n/);
  const { a6Start, a6End, providersLineIdx, llmLineIdx } = scanA6apiBlockRange(lines);

  if (a6Start >= 0) {
    // Replace existing a6api block
    lines.splice(a6Start, a6End - a6Start, ...a6apiBlockLines);
  } else if (providersLineIdx >= 0) {
    // Insert under providers:
    lines.splice(providersLineIdx + 1, 0, ...a6apiBlockLines);
  } else if (llmLineIdx >= 0) {
    // Insert providers: then a6api
    lines.splice(llmLineIdx + 1, 0, `  providers:`, ...a6apiBlockLines);
  } else {
    // Insert llm-pi-ai: providers: a6api
    lines.push(`llm-pi-ai:`, `  providers:`, ...a6apiBlockLines);
  }

  await atomicWriteFile(sFile, lines.join('\n'), 0o644);
}

/**
 * 裸写移除 a6api 块（原生缝缺失/失败时的兜底）。
 * DSH schema 对手写路由无合法的零模型表示，空模型列表 = 移除整个块；
 * 块移除后顺带清理空壳（providers/llm-pi-ai 下无其他键时一并删除），保持 YAML 合法。
 */
async function removeRawA6apiBlock(): Promise<void> {
  const sFile = settingsFile();
  let yaml = '';
  try {
    yaml = await fsp.readFile(sFile, 'utf8');
  } catch {
    return; // 无文件或不可读，无事可做
  }

  const lines = yaml.split(/\r?\n/);
  const { a6Start, a6End, providersLineIdx, llmLineIdx } = scanA6apiBlockRange(lines);
  if (a6Start < 0) return;

  lines.splice(a6Start, a6End - a6Start);

  // 清理空壳：providers 下无其他 indent-4 provider 键 → 移除 providers 行；llm-pi-ai 下无其他 indent-2 键 → 移除 llm-pi-ai 行
  if (providersLineIdx >= 0) {
    let hasProvider = false;
    for (let i = providersLineIdx + 1; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const indent = lines[i].match(/^\s*/)?.[0].length ?? 0;
      if (indent <= 2) break;
      if (indent === 4) {
        hasProvider = true;
        break;
      }
    }
    if (!hasProvider) lines.splice(providersLineIdx, 1);
  }
  if (llmLineIdx >= 0) {
    let hasLlmKey = false;
    for (let i = llmLineIdx + 1; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const indent = lines[i].match(/^\s*/)?.[0].length ?? 0;
      if (indent === 0) break;
      if (indent === 2) {
        hasLlmKey = true;
        break;
      }
    }
    if (!hasLlmKey) lines.splice(llmLineIdx, 1);
  }

  await atomicWriteFile(sFile, lines.join('\n'), 0o644);
}

// ===== 旧版独立配置文件（dsh-a6api-config.json）读取与规范化 =====

/** 旧字段别名收敛：accessToken / systemAccessToken / sessionCookie 是同一个凭据的历代命名 */
function normalizeLegacy(parsed: any): {
  baseURL: string;
  apiKey: string;
  accessToken: string;
  userId: string;
  activeModels: string[];
} {
  return {
    apiKey: typeof parsed?.apiKey === 'string' ? parsed.apiKey : '',
    accessToken: String(parsed?.accessToken || parsed?.systemAccessToken || parsed?.sessionCookie || ''),
    userId: String(parsed?.userId || ''),
    baseURL: typeof parsed?.baseURL === 'string' && parsed.baseURL ? parsed.baseURL : DEFAULT_BASE_URL,
    activeModels: Array.isArray(parsed?.activeModels) ? parsed.activeModels.filter((m: any) => typeof m === 'string') : [],
  };
}

/** 旧文件读取（迁移未完成/失败时的末级兜底；别名只在读取链上存在） */
async function readLegacyConfig(): Promise<A6ApiConfig | null> {
  try {
    const raw = await fsp.readFile(legacyConfigFile(), 'utf8');
    const legacy = normalizeLegacy(JSON.parse(raw));
    return {
      baseURL: legacy.baseURL,
      apiKey: legacy.apiKey,
      accessToken: legacy.accessToken || undefined,
      userId: legacy.userId || undefined,
      activeModels: legacy.activeModels,
    };
  } catch {
    return null;
  }
}

/** 构建 llm-pi-ai.providers.a6api 块（与 DSH 原生 schema 兼容：openai-completions + /v1 端点）。
 *  参数来自模型目录（getCatalogEntry）：有则写入，缺则省略该字段（llm-pi-ai 默认值兜底）。 */
function buildA6apiBlock(baseURL: string, modelIds: string[]): Record<string, any> {
  const models = modelIds.map((id) => {
    const entry = getCatalogEntry(id);
    const m: Record<string, any> = { id };
    if (entry?.name) m.name = entry.name;
    if (entry?.contextWindow != null) m.contextWindow = entry.contextWindow;
    if (entry?.maxTokens != null) m.maxTokens = entry.maxTokens;
    if (entry?.input && entry.input.length > 0) m.input = [...entry.input];
    if (entry?.reasoningEfforts !== undefined && entry.reasoningEfforts !== null) {
      m.reasoningEfforts = entry.reasoningEfforts;
    }
    return m;
  });
  return {
    displayName: 'A6API',
    apiKeyEnv: A6API_CRED_REF,
    api: 'openai-completions',
    baseURL: baseURL.endsWith('/v1') ? baseURL : `${baseURL.replace(/\/+$/, '')}/v1`,
    models,
  };
}

export interface CredentialWriteFailure {
  /** 凭据 ref 名（A6API_API_KEY / A6API_ACCESS_TOKEN / A6API_USER_ID） */
  ref: string;
  /** 失败原因（面向用户的中文描述） */
  reason: string;
}

export interface ConfigAccess {
  /** 触发（并等待）旧配置文件的自动迁移；幂等，进程内只执行一次，失败不阻塞 */
  ensureMigrated(): Promise<void>;
  /** 读取当前配置：原生缝优先，逐级兜底到旧文件 */
  readConfig(): Promise<A6ApiConfig>;
  /** 写入凭据字段（空串 = 清除，走 unset）；settings 同步请用 syncModels。
   *  返回未落盘成功的字段列表——调用方必须向用户呈现 failures，杜绝「假成功」。 */
  writeConfig(
    parts: Partial<Pick<A6ApiConfig, 'apiKey' | 'accessToken' | 'userId'>>,
  ): Promise<{ failures: CredentialWriteFailure[] }>;
  /** 把模型列表（与 baseURL）同步进 DSH settings.yaml 的 llm-pi-ai.providers.a6api 块 */
  syncModels(baseURL: string, modelIds: string[]): Promise<void>;
  /** 当前 DSH 已配置的 a6api 模型 ID 列表 */
  getDshConfiguredModels(): Promise<string[]>;
}

export function createConfigAccess(ctx: any): ConfigAccess {
  let migration: Promise<void> | null = null;

  const ensureMigrated = (): Promise<void> => {
    if (!migration) {
      // 启动自愈：apply() 即触发本函数。凭据文件在上一进程生命周期内被任何
      // 组件原子重建后，权限位可能停在异常态（本沙箱 FS 强制新文件 007）；
      // 尽早收回 0600 —— 若本插件先于 credentials-local 激活，可让它免于
      // loadInitial 拒载（顺序无保证，晚于它时由读时/写时自愈接管）。
      migration = healCredentialsFileMode()
        .then(() => doMigrate())
        .catch((err: any) => {
          // 迁移失败不阻塞：保留旧文件，readConfig 的末级兜底继续工作，下次启动重试
          console.warn('[dsh-a6api] 旧配置迁移失败（保留旧文件读取兜底）:', err?.message || err);
        });
    }
    return migration;
  };

  /** 读一个凭据 ref：原生 resolve（env 优先）→ 文件直读兜底 */
  const resolveRef = async (creds: any, ref: string): Promise<string> => {
    try {
      if (creds && typeof creds.resolve === 'function') {
        const r = await creds.resolve(ref);
        return r && typeof r.value === 'string' ? r.value : '';
      }
    } catch (err: any) {
      console.warn(`[dsh-a6api] credentials.resolve(${ref}) failed:`, err?.message || err);
    }
    return (await readCredentialKey(ref)) || '';
  };

  /** 读 llm-pi-ai.providers.a6api 块：原生 settings.get 优先 */
  const readA6apiBlock = async (
    settings: any,
  ): Promise<{ baseURL?: string; models: string[] } | null> => {
    try {
      if (settings && typeof settings.get === 'function') {
        const llm = settings.get(SETTINGS_NS);
        const block = llm && llm.providers ? llm.providers[PROVIDER_KEY] : undefined;
        if (block && typeof block === 'object') {
          return {
            baseURL: typeof block.baseURL === 'string' ? block.baseURL : undefined,
            models: Array.isArray(block.models)
              ? block.models
                  .map((m: any) => (typeof m === 'string' ? m : m && typeof m.id === 'string' ? m.id : ''))
                  .filter(Boolean)
              : [],
          };
        }
      }
    } catch (err: any) {
      console.warn('[dsh-a6api] settings.get(llm-pi-ai) failed:', err?.message || err);
    }
    return null;
  };

  const readConfig = async (): Promise<A6ApiConfig> => {
    await ensureMigrated();
    const creds = getCredentials(ctx);
    const settings = getSettings(ctx);

    // 读时自愈：其他组件（浏览器会话等）重写凭据文件同样会触发文件系统的异常
    // 权限位；每次读取顺带收回 0600，让原生缝的 watcher 重载恢复正常、下次
    // 启动 loadInitial 不至于整体拒载。/state 60s 轮询使其成为常驻看护。
    await healCredentialsFileMode();

    // 凭据：原生 resolve（env 优先）→ 文件直读兜底
    const apiKey = await resolveRef(creds, A6API_CRED_REF);
    const accessToken = await resolveRef(creds, A6API_TOKEN_REF);
    const userId = await resolveRef(creds, A6API_USER_REF);

    // 非机密状态：llm-pi-ai.providers.a6api 块（原生解析优先，裸读兜底）
    let baseURL = DEFAULT_BASE_URL;
    let activeModels: string[] = [];
    const block = await readA6apiBlock(settings);
    if (block) {
      if (block.baseURL) baseURL = stripV1(block.baseURL) || DEFAULT_BASE_URL;
      activeModels = block.models;
    } else {
      const rawBase = await readRawA6apiBaseURL();
      if (rawBase) baseURL = stripV1(rawBase) || DEFAULT_BASE_URL;
      activeModels = await readRawConfiguredModels();
    }

    // 末级兜底：原生凭据为空且旧文件仍在（迁移未完成或失败）→ 旧文件只填空字段，
    // 非机密状态始终以原生 settings 为准（避免旧值遮蔽用户迁移失败后新改的节点/模型）
    if (!apiKey && !accessToken && fs.existsSync(legacyConfigFile())) {
      const legacy = await readLegacyConfig();
      if (legacy) {
        const mergedToken = accessToken || legacy.accessToken;
        return {
          baseURL: baseURL || legacy.baseURL,
          apiKey: apiKey || legacy.apiKey,
          accessToken: mergedToken,
          // userId：显式持久化值 → 旧文件值 → 令牌 JWT 派生（New-Api-User 鉴权头需要）
          userId: userId || legacy.userId || deriveUserIdFromAccessToken(mergedToken),
          activeModels: activeModels.length > 0 ? activeModels : legacy.activeModels,
        };
      }
    }

    // userId：显式持久化值优先；缺失时从 JWT 令牌派生（派生值不回写，仅作有效值使用，
    // /state 的自动发现成功后会照常持久化真实值）
    return {
      baseURL,
      apiKey,
      accessToken,
      userId: userId || deriveUserIdFromAccessToken(accessToken),
      activeModels,
    };
  };

  const writeConfig = async (
    parts: Partial<Pick<A6ApiConfig, 'apiKey' | 'accessToken' | 'userId'>>,
  ): Promise<{ failures: CredentialWriteFailure[] }> => {
    // 先等迁移完成，避免 fillRef 的「读→写」两步把迁移值覆盖用户刚写入的新值
    await ensureMigrated();
    const creds = getCredentials(ctx);
    // 写前自愈权限：松散权限位（group/other 可读）会让原生缝整体拒写
    await healCredentialsFileMode();
    const entries: Array<[string, string | undefined]> = [
      [A6API_CRED_REF, parts.apiKey],
      [A6API_TOKEN_REF, parts.accessToken],
      [A6API_USER_REF, parts.userId],
    ];
    const failures: CredentialWriteFailure[] = [];
    for (const [ref, value] of entries) {
      if (value === undefined) continue;
      const v = value.trim();
      try {
        if (creds && typeof creds.set === 'function' && typeof creds.unset === 'function') {
          if (v) await creds.set(ref, v);
          else await creds.unset(ref);
        } else {
          // 兜底路径：writeCredentialKey 对空串执行删除（DSH credentials-local 拒收空 ref 值）
          await writeCredentialKey(ref, v);
        }
      } catch (err: any) {
        const msg = String(err?.message || err);
        // env 遮蔽：环境变量值优先（DSH 原生语义），写入无意义——跳过但记录原因供 UI 呈现
        if (ENV_SHADOW_RE.test(msg)) {
          console.warn(`[dsh-a6api] 写入凭据 ${ref} 被环境变量遮蔽（已跳过）:`, msg);
          failures.push({ ref, reason: '该凭据由启动环境的环境变量提供，文件写入会被遮蔽；如需修改请更新对应环境变量' });
          continue;
        }
        // 其他失败（权限位、写锁超时等）：降级到文件直写兜底（原子写 0600，顺带修复松散权限）
        try {
          await writeCredentialKey(ref, v);
          console.warn(`[dsh-a6api] 原生缝写入 ${ref} 失败，已降级文件直写成功:`, msg);
        } catch (err2: any) {
          console.error(`[dsh-a6api] 写入凭据 ${ref} 彻底失败（原生缝与文件兜底均失败）:`, err2?.message || err2);
          failures.push({ ref, reason: `原生缝与文件兜底均失败：${err2?.message || err2}` });
        }
      }
      // 写后自愈：原生缝与文件兜底都走「原子 rename 重建文件」，会在强制新文件
      // 异常权限位的文件系统上（本沙箱为 007）把 mode 打回松散态——不修的话，
      // 同批下一个写入会被原生缝拒绝（降级兜底救数据），且下次启动 loadInitial
      // 将整体拒载凭据文档（浏览器会话等全部失效）。每写一个字段即收回 0600。
      await healCredentialsFileMode();
    }
    return { failures };
  };

  const syncModels = async (baseURL: string, modelIds: string[]): Promise<void> => {
    const settings = getSettings(ctx);
    if (modelIds.length === 0) {
      // DSH 硬约束：llm-pi-ai 对手写路由（a6api 不在内置 catalog）不存在合法的「零模型」表示，
      // assertServiceable 会拒绝 models: []（"resolves no models..."），写盘将毒化下次启动。
      // 空列表 = 移除整个 a6api 块（路由从 DSH 消失；baseURL 随块一并移除，属 schema 约束下的必然）。
      if (settings && typeof settings.mutate === 'function') {
        try {
          await settings.mutate(SETTINGS_NS, [{ op: 'unset', path: ['providers', PROVIDER_KEY] }]);
          return;
        } catch (err: any) {
          console.warn('[dsh-a6api] settings.mutate(llm-pi-ai) 移除 a6api 块失败，回退裸写 settings.yaml:', err?.message || err);
        }
      }
      await removeRawA6apiBlock();
      return;
    }

    const block = buildA6apiBlock(baseURL, modelIds);
    if (settings && typeof settings.update === 'function') {
      try {
        // 原生缝：命名空间串行写队列 + schema 校验 + 热发布（合并语义，不影响其他 provider）
        await settings.update(SETTINGS_NS, { providers: { [PROVIDER_KEY]: block } });
        return;
      } catch (err: any) {
        console.warn('[dsh-a6api] settings.update(llm-pi-ai) 失败，回退裸写 settings.yaml:', err?.message || err);
      }
    }
    await writeRawA6apiBlock(baseURL, modelIds);
  };

  const getDshConfiguredModels = async (): Promise<string[]> => {
    const block = await readA6apiBlock(getSettings(ctx));
    if (block) return block.models;
    return readRawConfiguredModels();
  };

  /** 只填空：迁移值仅在当前无该 ref（含 env 覆盖）时写入；返回 false = 写入失败（需保留旧文件） */
  const fillRef = async (creds: any, ref: string, value: string): Promise<boolean> => {
    if (!value) return true; // 无值可迁 = 无需写 = 视为成功
    try {
      const current = await resolveRef(creds, ref);
      if (current) return true; // 已有值（含 env 覆盖），无需写
      if (creds && typeof creds.set === 'function') await creds.set(ref, value);
      else await writeCredentialKey(ref, value);
      return true;
    } catch (err: any) {
      console.warn(`[dsh-a6api] 迁移 ${ref} 失败（跳过，保留旧文件）:`, err?.message || err);
      return false;
    }
  };

  const archiveLegacy = async (filePath: string): Promise<void> => {
    try {
      await fsp.rename(filePath, `${filePath}.bak`);
      console.log('[dsh-a6api] 旧配置已迁移至 DSH 原生配置并归档: dsh-a6api-config.json.bak');
    } catch (err: any) {
      console.warn('[dsh-a6api] 旧配置归档失败（迁移值已写入，旧文件保留，下次启动重试）:', err?.message || err);
    }
  };

  const doMigrate = async (): Promise<void> => {
    const filePath = legacyConfigFile();
    let raw = '';
    try {
      raw = await fsp.readFile(filePath, 'utf8');
    } catch {
      return; // 无旧文件，无事可做
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (err: any) {
      console.warn('[dsh-a6api] 旧配置文件损坏，跳过迁移并归档:', err?.message || err);
      await archiveLegacy(filePath);
      return;
    }

    const legacy = normalizeLegacy(parsed);
    const creds = getCredentials(ctx);

    // 凭据：只填空不覆盖（当前已有值或 env 覆盖则不动）；
    // 任一写入失败 → 不归档（决策：全部写成功后才归档），保留旧文件读取兜底与下次启动重试。
    // 顺序执行：兜底路径 writeCredentialKey 是读-改-写同一文件，并发会互相覆盖。
    const fillResults = [
      await fillRef(creds, A6API_CRED_REF, legacy.apiKey),
      await fillRef(creds, A6API_TOKEN_REF, legacy.accessToken),
      await fillRef(creds, A6API_USER_REF, legacy.userId),
    ];
    if (fillResults.some((ok) => !ok)) {
      console.warn('[dsh-a6api] 凭据迁移未全部成功，跳过归档，保留旧文件读取兜底（下次启动重试）');
      return;
    }

    // settings：仅当 a6api 块不存在时回填（绝不覆盖用户当前的 settings.yaml）
    const block = await readA6apiBlock(getSettings(ctx));
    const blockExists = Boolean(block) || (await readRawConfiguredModels()).length > 0;
    if (!blockExists && legacy.activeModels.length > 0) {
      await syncModels(legacy.baseURL, legacy.activeModels);
    }

    await archiveLegacy(filePath);
  };

  return { ensureMigrated, readConfig, writeConfig, syncModels, getDshConfiguredModels };
}
