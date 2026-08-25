import type { ITranslationAdapter, PluginConfig } from './base.ts';

const SYSTEM_PROMPT =
  '你是一个专业的技术工具动作简短标题翻译器。请将给出的工具调用描述或标题翻译为极其简练的中文动宾短语（保留命令名、参数、文件路径、URL、标识符原样）。只返回翻译后的纯中文短语，不要包含任何解释、额外标点、前缀、引号或 Markdown 格式。';

export class SiliconFlowAdapter implements ITranslationAdapter {
  readonly id = 'siliconflow';
  readonly name = '硅基流动 (Qwen2.5-7B)';

  isAvailable(config: PluginConfig): boolean {
    return !!(config.siliconflowKey && config.siliconflowKey.trim().length > 0);
  }

  async translate(text: string, signal: AbortSignal, config: PluginConfig): Promise<string> {
    const key = config.siliconflowKey?.trim();
    if (!key) {
      throw new Error('SiliconFlow API key is not configured');
    }

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
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
      throw new Error(`SiliconFlow API responded with ${response.status}: ${errText}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('SiliconFlow returned empty translation');
    }

    return content;
  }
}
