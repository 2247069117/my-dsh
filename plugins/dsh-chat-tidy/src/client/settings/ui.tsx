import { useState, useEffect } from 'react';
import * as React from 'react';
import { settingsStore, type ClientSettingsState } from './store.ts';
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

  useEffect(() => {
    return settingsStore.subscribe(() => {
      setState(settingsStore.getState());
    });
  }, []);

  const handleToggleEnabled = (): void => {
    settingsStore.update({ enabled: !state.enabled });
  };

  const handleConcurrencyChange = (val: number): void => {
    if (Number.isNaN(val)) return;
    settingsStore.update({ concurrency: Math.min(Math.max(val, 1), 100) });
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
          {/* 4. 并发控制 */}
          <div className="dsh-tidy-card">
            <div className="dsh-tidy-row">
              <div className="dsh-tidy-row-info">
                <div className="dsh-tidy-row-title">最大翻译并发数</div>
                <div className="dsh-tidy-row-desc">
                  控制历史会话滚动与多工具卡片时的最大并行请求数（推荐 3）。
                </div>
              </div>
              <input
                type="number"
                className="dsh-tidy-input"
                min={1}
                max={100}
                step={1}
                value={state.concurrency}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConcurrencyChange(parseInt(e.target.value, 10))
                }
                style={{ width: '88px' }}
                aria-label="最大翻译并发数"
              />
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
    const slots = ctx?.slots || (ctx?.get ? ctx.get('slots') : null);
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
