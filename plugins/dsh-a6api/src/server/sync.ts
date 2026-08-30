import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import { resolveModelMeta } from './catalog.js';
import type { A6ApiConfig } from '../types.js';

export const A6API_CRED_REF = 'A6API_API_KEY';

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

function configFile(): string {
  return path.join(dshHome(), 'dsh-a6api-config.json');
}

function credentialsFile(): string {
  return path.join(dshHome(), '.credentials.yaml');
}

function settingsFile(): string {
  return path.join(dshHome(), 'settings.yaml');
}

/** Read plugin dedicated config */
export async function readPluginConfig(): Promise<A6ApiConfig> {
  const filePath = configFile();
  let raw = '';
  try {
    raw = await fsp.readFile(filePath, 'utf8');
  } catch {
    // try reading default credential if exists
    const apiKey = (await readCredentialKey(A6API_CRED_REF)) || '';
    return {
      baseURL: 'https://api.a6api.com',
      apiKey,
      userId: '',
      activeModels: [],
    };
  }

  try {
    const parsed = JSON.parse(raw);
    const apiKey = parsed.apiKey || (await readCredentialKey(A6API_CRED_REF)) || '';
    const accessToken = parsed.accessToken || parsed.systemAccessToken || parsed.sessionCookie || '';
    return {
      baseURL: parsed.baseURL || 'https://api.a6api.com',
      apiKey,
      accessToken,
      userId: parsed.userId || '',
      sessionCookie: accessToken,
      activeModels: Array.isArray(parsed.activeModels) ? parsed.activeModels : [],
      customBaseURL: parsed.customBaseURL,
    };
  } catch {
    return {
      baseURL: 'https://api.a6api.com',
      apiKey: '',
      accessToken: '',
      userId: '',
      activeModels: [],
    };
  }
}

/** Save plugin dedicated config（密钥单一真相源在 ~/.dsh/.credentials.yaml，配置 JSON 不再冗余明文） */
export async function savePluginConfig(config: A6ApiConfig): Promise<void> {
  const filePath = configFile();
  const { apiKey: _apiKey, ...safeConfig } = config;
  await atomicWriteFile(filePath, JSON.stringify(safeConfig, null, 2));

  // Also sync credential
  if (config.apiKey && config.apiKey.trim()) {
    await writeCredentialKey(A6API_CRED_REF, config.apiKey.trim());
  }
}

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
        return val;
      }
    }
  } catch {}
  return null;
}

/** Write/update a key in .credentials.yaml */
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
  let found = false;

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
        lines[i] = `  ${refKey}: ${JSON.stringify(value)}`;
        found = true;
        break;
      }
    }
  }

  if (!found) {
    if (refsLineIdx >= 0) {
      lines.splice(refsLineIdx + 1, 0, `  ${refKey}: ${JSON.stringify(value)}`);
    } else {
      lines.push('refs:', `  ${refKey}: ${JSON.stringify(value)}`);
    }
  }

  await atomicWriteFile(cFile, lines.join('\n'), 0o600);
}

/** Sync active models to DSH settings.yaml under llm-pi-ai.providers.a6api */
export async function syncToDshSettings(baseURL: string, modelIds: string[]): Promise<void> {
  const sFile = settingsFile();
  let yaml = '';
  try {
    yaml = await fsp.readFile(sFile, 'utf8');
  } catch {
    yaml = 'llm-pi-ai:\n  providers:\n';
  }

  // Build the YAML block for models
  const modelEntries = modelIds.map((id) => {
    const meta = resolveModelMeta(id);
    const lines = [
      `        - id: ${meta.id}`,
      `          name: ${meta.name}`,
      `          contextWindow: ${meta.contextWindow}`,
      `          maxTokens: ${meta.maxTokens}`,
      `          input:`,
      ...meta.modalities.map((m) => `            - ${m}`),
    ];
    if (meta.reasoningEfforts) {
      lines.push(`          reasoningEfforts:`);
      for (const [k, v] of Object.entries(meta.reasoningEfforts)) {
        if (v) lines.push(`            ${k}: ${v}`);
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
    ...(modelEntries.length > 0 ? modelEntries : [`        []`]),
  ];

  // Look for `llm-pi-ai:` -> `providers:` -> `a6api:`
  const lines = yaml.split(/\r?\n/);
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

/** Get currently configured model IDs in DSH settings for a6api */
export async function getDshConfiguredModels(): Promise<string[]> {
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
