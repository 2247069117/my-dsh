import type { ITranslationAdapter, PluginConfig } from './base.ts';

const SYSTEM_PROMPT =
  '你是一个专业的技术工具动作简短标题翻译器。请将给出的工具调用描述或标题翻译为极其简练的中文动宾短语（保留命令名、参数、文件路径、URL、标识符原样）。只返回翻译后的纯中文短语，不要包含任何解释、额外标点、前缀、引号或 Markdown 格式。';

export class ZhipuAdapter implements ITranslationAdapter {
  readonly id = 'zhipu';
  readonly name = '智谱 AI (glm-4-flash)';

  isAvailable(config: PluginConfig): boolean {
    return !!(config.zhipuKey && config.zhipuKey.trim().length > 0);
  }

  async translate(text: string, signal: AbortSignal, config: PluginConfig): Promise<string> {
    const key = config.zhipuKey?.trim();
    if (!key) {
      throw new Error('Zhipu API key is not configured');
    }

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.0,
        max_tokens: 60,
        stream: false,
      }),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Zhipu API responded with ${response.status}: ${errText}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Zhipu returned empty translation');
    }

    return content;
  }
}
