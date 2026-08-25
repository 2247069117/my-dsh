export interface TranslateItemResult {
  original: string;
  translated: string;
  channel: string;
  cached: boolean;
}

const EXACT_PATTERNS: Record<string, string> = {
  'list files in current directory': '列出当前目录文件',
  'show working tree status': '查看 Git 工作区状态',
  'check git status': '查看 Git 状态',
  'check working tree status': '查看工作区状态',
  'check workspace structure': '检查工作区目录结构',
  'list plugins': '列出插件列表',
  'run build': '执行项目构建',
  'run tests': '运行测试',
  'run linter': '代码风格检查',
  'typecheck project': 'TypeScript 类型检查',
};

const PREFIX_PATTERNS: Array<[RegExp, (match: RegExpExecArray) => string]> = [
  [/^locate\s+(.+)$/i, (m) => `定位 ${m[1]}`],
  [/^inspect\s+(.+)$/i, (m) => `检查 ${m[1]}`],
  [/^explore\s+(.+)$/i, (m) => `浏览 ${m[1]}`],
  [/^read\s+file\s*(.*)$/i, (m) => `读取文件 ${m[1]}`.trim()],
  [/^read\s+(.+)$/i, (m) => `读取 ${m[1]}`],
  [/^write\s+file\s*(.*)$/i, (m) => `写入文件 ${m[1]}`.trim()],
  [/^write\s+(.+)$/i, (m) => `写入 ${m[1]}`],
  [/^edit\s+file\s*(.*)$/i, (m) => `编辑文件 ${m[1]}`.trim()],
  [/^edit\s+(.+)$/i, (m) => `编辑 ${m[1]}`],
  [/^create\s+file\s*(.*)$/i, (m) => `创建文件 ${m[1]}`.trim()],
  [/^create\s+(.+)$/i, (m) => `创建 ${m[1]}`],
  [/^delete\s+file\s*(.*)$/i, (m) => `删除文件 ${m[1]}`.trim()],
  [/^delete\s+(.+)$/i, (m) => `删除 ${m[1]}`],
  [/^search\s+files?\s*(.*)$/i, (m) => `搜索文件 ${m[1]}`.trim()],
  [/^search\s+(.+)$/i, (m) => `搜索 ${m[1]}`],
  [/^find\s+files?\s*(.*)$/i, (m) => `查找文件 ${m[1]}`.trim()],
  [/^find\s+(.+)$/i, (m) => `查找 ${m[1]}`],
  [/^grep\s+(.+)$/i, (m) => `检索文本 ${m[1]}`],
  [/^check\s+(.+)$/i, (m) => `检查 ${m[1]}`],
  [/^run\s+command:\s*(.+)$/i, (m) => `运行命令: ${m[1]}`],
  [/^run\s+(.+)$/i, (m) => `运行 ${m[1]}`],
  [/^execute\s+(.+)$/i, (m) => `执行 ${m[1]}`],
  [/^install\s+(.+)$/i, (m) => `安装 ${m[1]}`],
  [/^build\s+(.+)$/i, (m) => `构建 ${m[1]}`],
  [/^verify\s+(.+)$/i, (m) => `验证 ${m[1]}`],
  [/^test\s+(.+)$/i, (m) => `测试 ${m[1]}`],
  [/^stage\s+(.+)$/i, (m) => `暂存 ${m[1]}`],
  [/^commit\s+(.+)$/i, (m) => `提交 ${m[1]}`],
  [/^list\s+(.+)$/i, (m) => `列出 ${m[1]}`],
  [/^clean\s+(.+)$/i, (m) => `清理 ${m[1]}`],
  [/^update\s+(.+)$/i, (m) => `更新 ${m[1]}`],
  [/^fetch\s+(.+)$/i, (m) => `获取 ${m[1]}`],
  [/^expand\s+(.+)$/i, (m) => `展开 ${m[1]}`],
];

function fallbackTranslateLocal(text: string): string {
  const raw = text.trim();
  const lower = raw.toLowerCase();
  if (EXACT_PATTERNS[lower]) return EXACT_PATTERNS[lower];
  for (const [pattern, formatter] of PREFIX_PATTERNS) {
    const match = pattern.exec(raw);
    if (match) return formatter(match);
  }
  return raw;
}

async function fallbackTranslateMyMemory(text: string): Promise<string> {
  const local = fallbackTranslateLocal(text);
  if (local !== text) return local;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const json = await res.json();
    const trans = json?.responseData?.translatedText?.trim();
    if (trans && !trans.startsWith('MYMEMORY WARNING:')) {
      return trans;
    }
  } catch {}
  return text;
}

export async function requestTranslateBatch(
  texts: string[]
): Promise<TranslateItemResult[]> {
  if (texts.length === 0) return [];
  try {
    const res = await fetch('/api/dsh-chat-tidy/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts }),
    });

    if (res.ok) {
      const data = (await res.json()) as { ok: boolean; results?: TranslateItemResult[] };
      if (data.ok && Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch {}

  // Client-side fallback if host route not reached
  const results = await Promise.all(
    texts.map(async (t) => {
      const translated = await fallbackTranslateMyMemory(t);
      return {
        original: t,
        translated: translated || t,
        channel: 'fallback-client',
        cached: false,
      };
    })
  );
  return results;
}

export async function fetchServerConfig(): Promise<any> {
  try {
    const res = await fetch('/api/dsh-chat-tidy/config');
    if (!res.ok) return null;
    const json = await res.json();
    return json.config;
  } catch {
    return null;
  }
}

export async function updateServerConfig(updates: any): Promise<any> {
  try {
    const res = await fetch('/api/dsh-chat-tidy/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.config;
  } catch {
    return null;
  }
}

export async function testServerChannel(channel: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  try {
    const res = await fetch('/api/dsh-chat-tidy/test-channel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel }),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, latencyMs: 0, error: err?.message || String(err) };
  }
}
