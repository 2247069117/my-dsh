import React, { useState, useEffect } from 'react';
import { store } from '../store.js';
import type { A6ApiConfig } from '../../types.js';

export const ConfigPanel: React.FC<{
  config: A6ApiConfig;
  dshConfiguredModels: string[];
}> = ({ config, dshConfiguredModels }) => {
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [accessToken, setAccessToken] = useState(
    config.accessToken || config.sessionCookie || '',
  );
  const [selectedNode, setSelectedNode] = useState(
    config.baseURL || 'https://api.a6api.com',
  );
  const [customNode, setCustomNode] = useState(config.customBaseURL || '');
  const [isCustom, setIsCustom] = useState(
    config.baseURL !== 'https://api.a6api.com' && config.baseURL !== 'https://a6.a6api.com',
  );
  const [showKey, setShowKey] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setApiKey(config.apiKey || '');
    setAccessToken(config.accessToken || config.sessionCookie || '');
    setSelectedNode(config.baseURL || 'https://api.a6api.com');
    setCustomNode(config.customBaseURL || '');
    setIsCustom(
      config.baseURL !== 'https://api.a6api.com' && config.baseURL !== 'https://a6.a6api.com',
    );
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    const finalBaseUrl = isCustom ? customNode.trim() || 'https://api.a6api.com' : selectedNode;
    const ok = await store.saveConfig({
      apiKey: apiKey.trim(),
      accessToken: accessToken.trim(),
      sessionCookie: accessToken.trim(),
      baseURL: finalBaseUrl,
      customBaseURL: customNode.trim(),
    });
    setSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  return (
    <div className="dsh-a6-config-page">
      {/* 1. API Gateway Node Selection */}
      <div className="dsh-a6-config-section">
        <div className="dsh-a6-section-heading">
          <span className="dsh-a6-heading-title">API 接入节点 (Base URL)</span>
          <span className="dsh-a6-heading-desc">
            选择离您最近的 A6API 聚合网关接入点，支持 CDN 节点与直连备用节点。
          </span>
        </div>

        <div className="dsh-a6-node-picker">
          <button
            type="button"
            className={`dsh-a6-node-pill ${!isCustom && selectedNode === 'https://api.a6api.com' ? 'active' : ''}`}
            onClick={() => {
              setIsCustom(false);
              setSelectedNode('https://api.a6api.com');
            }}
          >
            https://api.a6api.com (CDN 推荐)
          </button>
          <button
            type="button"
            className={`dsh-a6-node-pill ${!isCustom && selectedNode === 'https://a6.a6api.com' ? 'active' : ''}`}
            onClick={() => {
              setIsCustom(false);
              setSelectedNode('https://a6.a6api.com');
            }}
          >
            https://a6.a6api.com (直连备用)
          </button>
          <button
            type="button"
            className={`dsh-a6-node-pill ${isCustom ? 'active' : ''}`}
            onClick={() => setIsCustom(true)}
          >
            自定义节点
          </button>
        </div>

        {isCustom && (
          <input
            type="text"
            className="dsh-a6-input"
            placeholder="https://your-custom-gateway.com"
            value={customNode}
            onChange={(e) => setCustomNode(e.target.value)}
            style={{ marginTop: '8px' }}
          />
        )}
      </div>

      {/* 2. Authentication Tokens */}
      <div className="dsh-a6-config-section">
        <div className="dsh-a6-section-heading">
          <span className="dsh-a6-heading-title">访问鉴权与令牌凭据</span>
          <span className="dsh-a6-heading-desc">
            配置模型调用 API Key 以及用于同步账户余额与商户行情的系统访问令牌。
          </span>
        </div>

        <div className="dsh-a6-config-fields-grid">
          {/* API Key */}
          <div className="dsh-a6-field">
            <div className="dsh-a6-field-header">
              <label className="dsh-a6-label">A6API 令牌 (API Key)</label>
              <button
                type="button"
                className="dsh-a6-btn-text"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? '隐藏' : '显示'}
              </button>
            </div>
            <div className="dsh-a6-input-wrapper">
              <input
                type={showKey ? 'text' : 'password'}
                className="dsh-a6-input"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <span className="dsh-a6-field-hint">
              用于向 A6API 发起模型对话请求与拉取白名单模型。
            </span>
          </div>

          {/* System Access Token */}
          <div className="dsh-a6-field">
            <div className="dsh-a6-field-header">
              <label className="dsh-a6-label">系统访问令牌 (Access Token)</label>
              <button
                type="button"
                className="dsh-a6-btn-text"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? '隐藏' : '显示'}
              </button>
            </div>
            <div className="dsh-a6-input-wrapper">
              <input
                type={showToken ? 'text' : 'password'}
                className="dsh-a6-input"
                placeholder="在控制台安全设置中复制，例如 eyJhbGciOi..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>
            <div className="dsh-a6-field-footer">
              <span className="dsh-a6-field-hint">
                用于免失效同步账户真实余额与商户指标。
              </span>
              <button
                type="button"
                className="dsh-a6-btn-text"
                onClick={() => setShowHelp(!showHelp)}
                style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
              >
                {showHelp ? '收起教程' : '获取教程'}
              </button>
            </div>
          </div>
        </div>

        {/* Tutorial Drawer */}
        {showHelp && (
          <div className="dsh-a6-help-drawer">
            <div className="dsh-a6-help-title">系统访问令牌获取步骤（永久有效）：</div>
            <ol className="dsh-a6-help-list">
              <li>
                在浏览器打开并登录{' '}
                <a href="https://a6api.com/console/personal" target="_blank" rel="noreferrer">
                  a6api.com/console/personal
                </a>{' '}
                （个人设置 - 安全设置）
              </li>
              <li>在「系统访问令牌」栏目直接点击复制令牌字符串（例如 <code>eyJhbGciOi...</code>）</li>
              <li>粘贴到上方的「系统访问令牌」输入框中并点击下方「保存配置」即可自动同步余额！</li>
            </ol>
          </div>
        )}
      </div>

      {/* 3. DSH LLM Provider Integration Overview */}
      <div className="dsh-a6-config-section">
        <div className="dsh-a6-section-heading">
          <span className="dsh-a6-heading-title">DSH 原生 LLM 提供商集成状态</span>
          <span className="dsh-a6-heading-desc">
            插件已将 A6API 注册为 DSH 原生模型提供商 (<code>a6api</code>)。在「可用模型」中启用的模型将自动写入 DSH 配置文件。
          </span>
        </div>

        <div className="dsh-a6-integration-card">
          <div className="dsh-a6-int-row">
            <span className="dsh-a6-int-key">提供商标识</span>
            <span className="dsh-a6-int-val"><code>a6api</code> (OpenAI-compatible)</span>
          </div>
          <div className="dsh-a6-int-row">
            <span className="dsh-a6-int-key">当前已启用模型</span>
            <div className="dsh-a6-int-tags">
              {dshConfiguredModels.length > 0 ? (
                dshConfiguredModels.map((m) => (
                  <span key={m} className="dsh-a6-model-chip">
                    {m}
                  </span>
                ))
              ) : (
                <span className="dsh-a6-empty-hint">暂未启用任何模型，请前往「可用模型」页面点击「添加到 DSH」</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Save Action Bar */}
      <div className="dsh-a6-save-bar">
        <div className="dsh-a6-save-status">
          {saveSuccess && (
            <span className="dsh-a6-success-msg">
              配置已成功保存并同步
            </span>
          )}
        </div>
        <button
          type="button"
          className="dsh-a6-btn dsh-a6-btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ minWidth: '100px' }}
        >
          {saving ? '正在保存...' : '保存配置'}
        </button>
      </div>
    </div>
  );
};
