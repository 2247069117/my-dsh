import { useState, useEffect } from 'react';
import * as React from 'react';
import { settingsStore, CHANNEL_NAMES, type ClientSettingsState } from './store.ts';
import { SETTINGS_CSS } from './styles.ts';

let stylesInjected = false;
function ensureSettingsStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.dataset.tidySettings = 'true';
  el.textContent = SETTINGS_CSS;
  document.head.appendChild(el);
  stylesInjected = true;
}

export function TidySettingsPanel(): React.ReactElement {
  ensureSettingsStyles();

  const [state, setState] = useState<ClientSettingsState>(() => settingsStore.getState());
  const [sfKeyInput, setSfKeyInput] = useState<string>('');
  const [zpKeyInput, setZpKeyInput] = useState<string>('');
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  useEffect(() => {
    return settingsStore.subscribe(() => {
      setState(settingsStore.getState());
    });
  }, []);

  const handleToggleEnabled = (): void => {
    settingsStore.update({ enabled: !state.enabled });
  };

  const handleSaveSfKey = (): void => {
    if (sfKeyInput.trim()) {
      settingsStore.update({ siliconflowKey: sfKeyInput.trim() });
      setSfKeyInput('');
    }
  };

  const handleSaveZpKey = (): void => {
    if (zpKeyInput.trim()) {
      settingsStore.update({ zhipuKey: zpKeyInput.trim() });
      setZpKeyInput('');
    }
  };

  const handleTest = async (channel: string): Promise<void> => {
    setTestingChannel(channel);
    setTestResults((prev: Record<string, string>) => ({ ...prev, [channel]: '测试中...' }));
    const res = await settingsStore.testChannel(channel);
    if (res.ok) {
      setTestResults((prev: Record<string, string>) => ({ ...prev, [channel]: `成功 (${res.latencyMs}ms)` }));
    } else {
      setTestResults((prev: Record<string, string>) => ({ ...prev, [channel]: `失败: ${res.error || '连接超时'}` }));
    }
    setTestingChannel(null);
  };

  const handleMoveChannel = (index: number, direction: 'up' | 'down'): void => {
    const newChannels = [...state.channels];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newChannels.length) return;
    const temp = newChannels[index];
    newChannels[index] = newChannels[targetIndex];
    newChannels[targetIndex] = temp;
    settingsStore.update({ channels: newChannels });
  };

  const handleConcurrencyChange = (val: number): void => {
    settingsStore.update({ concurrency: val });
  };

  return (
    <div className="dsh-tidy-settings">
      {/* 1. 总开关卡片 */}
      <div className="dsh-tidy-card">
        <div className="dsh-tidy-title">
          <span>工具调用标题翻译</span>
          <button
            type="button"
            className="dsh-tidy-switch"
            role="switch"
            aria-checked={state.enabled}
            onClick={handleToggleEnabled}
            aria-label="启用工具调用标题翻译"
          />
        </div>
        <div className="dsh-tidy-desc">
          仅在渲染层将工具调用动作描述（如 <code>Locate DSH home directory structure</code>）自动翻译覆盖为简洁中文。不触碰正文与思考块，不占上下文窗口。
        </div>
      </div>

      {state.enabled && (
        <>
          {/* 2. API Key 配置卡片 */}
          <div className="dsh-tidy-card">
            <div className="dsh-tidy-title">
              <span>翻译通道 API 密钥</span>
            </div>

            {/* 硅基流动 */}
            <div className="dsh-tidy-input-group">
              <div className="dsh-tidy-label">
                <span>硅基流动 (SiliconFlow Qwen2.5-7B)</span>
                <span className={state.hasSiliconflowKey ? 'dsh-tidy-badge dsh-tidy-badge-ok' : 'dsh-tidy-badge dsh-tidy-badge-none'}>
                  {state.hasSiliconflowKey ? '已配置' : '未配置'}
                </span>
              </div>
              <div className="dsh-tidy-input-row">
                <input
                  type="password"
                  className="dsh-tidy-input"
                  placeholder={state.hasSiliconflowKey ? '输入新密钥以覆盖...' : 'sk-... (免费额度充足)'}
                  value={sfKeyInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSfKeyInput(e.target.value)}
                  onBlur={handleSaveSfKey}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="dsh-tidy-btn"
                  disabled={!state.hasSiliconflowKey && !sfKeyInput}
                  onClick={() => handleTest('siliconflow')}
                >
                  {testingChannel === 'siliconflow' ? '测试中...' : '测试连接'}
                </button>
              </div>
              {testResults.siliconflow && (
                <div className="dsh-tidy-desc" style={{ color: testResults.siliconflow.startsWith('成功') ? '#22c55e' : '#ef4444' }}>
                  {testResults.siliconflow}
                </div>
              )}
            </div>

            {/* 智谱 AI */}
            <div className="dsh-tidy-input-group" style={{ marginTop: '8px' }}>
              <div className="dsh-tidy-label">
                <span>智谱开放平台 (Zhipu glm-4-flash)</span>
                <span className={state.hasZhipuKey ? 'dsh-tidy-badge dsh-tidy-badge-ok' : 'dsh-tidy-badge dsh-tidy-badge-none'}>
                  {state.hasZhipuKey ? '已配置' : '未配置'}
                </span>
              </div>
              <div className="dsh-tidy-input-row">
                <input
                  type="password"
                  className="dsh-tidy-input"
                  placeholder={state.hasZhipuKey ? '输入新密钥以覆盖...' : 'API Key (个人免费调用)'}
                  value={zpKeyInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setZpKeyInput(e.target.value)}
                  onBlur={handleSaveZpKey}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="dsh-tidy-btn"
                  disabled={!state.hasZhipuKey && !zpKeyInput}
                  onClick={() => handleTest('zhipu')}
                >
                  {testingChannel === 'zhipu' ? '测试中...' : '测试连接'}
                </button>
              </div>
              {testResults.zhipu && (
                <div className="dsh-tidy-desc" style={{ color: testResults.zhipu.startsWith('成功') ? '#22c55e' : '#ef4444' }}>
                  {testResults.zhipu}
                </div>
              )}
            </div>
          </div>

          {/* 3. 通道优先级与降级调度 */}
          <div className="dsh-tidy-card">
            <div className="dsh-tidy-title">
              <span>通道优先级与降级顺序</span>
            </div>
            <div className="dsh-tidy-desc">
              遇到通道未配置 Key、限流 (429)、故障或超时 (2s) 时，系统将自动依序向后平滑降级。
            </div>
            <div className="dsh-tidy-priority-list">
              {state.channels.map((ch: string, idx: number) => (
                <div key={ch} className="dsh-tidy-priority-item">
                  <div className="dsh-tidy-priority-name">
                    <span className="dsh-tidy-order-badge">{idx + 1}</span>
                    <span>{CHANNEL_NAMES[ch] || ch}</span>
                  </div>
                  <div className="dsh-tidy-btn-group">
                    <button
                      type="button"
                      className="dsh-tidy-icon-btn"
                      disabled={idx === 0}
                      onClick={() => handleMoveChannel(idx, 'up')}
                      title="上移优先级"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="dsh-tidy-icon-btn"
                      disabled={idx === state.channels.length - 1}
                      onClick={() => handleMoveChannel(idx, 'down')}
                      title="下移优先级"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 并发控制 */}
          <div className="dsh-tidy-card">
            <div className="dsh-tidy-row">
              <div className="dsh-tidy-row-info">
                <div className="dsh-tidy-row-title">最大翻译并发数</div>
                <div className="dsh-tidy-row-desc">
                  控制历史会话滚动与多工具卡片时的最大并行请求数（推荐 3）。
                </div>
              </div>
              <select
                className="dsh-tidy-select"
                value={state.concurrency}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleConcurrencyChange(parseInt(e.target.value, 10))}
              >
                {[1, 2, 3, 4, 5, 6].map((n: number) => (
                  <option key={n} value={n}>
                    {n} 个并发
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function setupSettingsUi(ctx: any): void {
  if (typeof window === 'undefined') return;
  try {
    const slots = ctx?.get ? ctx.get('slots') : null;
    if (!slots || typeof slots.inject !== 'function') return;

    slots.inject('settings.section', () => {
      return slots.register(
        {
          name: 'settings.section',
          id: 'dsh-chat-tidy',
          order: 5,
          label: () => '聊天排版',
        },
        TidySettingsPanel
      );
    });
  } catch (err) {
    console.warn('[dsh-chat-tidy] Failed to inject settings section:', err);
  }
}
