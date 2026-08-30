import React, { useState, useEffect } from 'react';
import { store, type StoreState } from '../store.js';
import { MerchantCard } from './MerchantCard.js';
import { AccountPanel } from './BalanceCard.js';
import { ConfigPanel } from './ConfigPanel.js';

type TabKey = 'models' | 'account' | 'config';

export const A6ApiSettingsPanel: React.FC = () => {
  const [state, setState] = useState<StoreState>(store.getState());
  const [activeTab, setActiveTab] = useState<TabKey>('models');
  const [filterMode, setFilterMode] = useState<'all' | 'enabled' | 'probed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [probingAll, setProbingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    store.fetchState();
    return unsub;
  }, []);

  const handleProbeAll = async () => {
    setProbingAll(true);
    await store.probeAll();
    setProbingAll(false);
  };

  const handleRefreshState = async () => {
    setRefreshing(true);
    await store.fetchState();
    setRefreshing(false);
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 2000);
  };

  const inDshCount = state.models.filter((m) => m.inDsh).length;
  const probedCount = state.models.filter((m) => Boolean(m.merchant)).length;

  const filteredModels = state.models.filter((m) => {
    if (filterMode === 'enabled' && !m.inDsh) return false;
    if (filterMode === 'probed' && !m.merchant) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        m.model_name.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        (m.merchant?.supplier_name && m.merchant.supplier_name.toLowerCase().includes(q)) ||
        (m.merchant?.channel_name && m.merchant.channel_name.toLowerCase().includes(q)) ||
        (m.merchant?.description && m.merchant.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // 固定模型位置：启用的排在最前面，未启用的排在后面；组内按模型名称字母绝对稳定排序
  const sortedModels = [...filteredModels].sort((a, b) => {
    if (a.inDsh !== b.inDsh) {
      return a.inDsh ? -1 : 1;
    }
    return a.model_name.localeCompare(b.model_name);
  });

  return (
    <div className="dsh-a6-container">
      {/* 1. Header Title & Description */}
      <div className="dsh-a6-main-header">
        <div className="dsh-a6-header-text">
          <h2 className="dsh-a6-main-title">A6API 聚合站</h2>
          <p className="dsh-a6-main-subtitle">
            聚合全球主流与高性价比模型，实时监控商户指标、价格倍率与账户资产。
          </p>
        </div>

        {state.balance?.hasAccountAuth && (
          <div
            className="dsh-a6-header-balance-badge"
            onClick={() => setActiveTab('account')}
            title="点击切换至「账户资产」页面"
          >
            <span className="dsh-a6-hb-label">账户余额:</span>
            <span className="dsh-a6-hb-amount">{state.balance.accountBalanceFormatted}</span>
          </div>
        )}
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="dsh-a6-nav-tabs">
        <button
          type="button"
          className={`dsh-a6-nav-tab ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => setActiveTab('models')}
        >
          <span>可用模型</span>
          <span className="dsh-a6-tab-badge">{state.models.length}</span>
        </button>

        <button
          type="button"
          className={`dsh-a6-nav-tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <span>账户资产</span>
          {state.balance?.hasAccountAuth && (
            <span className="dsh-a6-tab-badge success">
              {state.balance.accountBalanceFormatted}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`dsh-a6-nav-tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          <span>基础配置</span>
        </button>
      </div>

      {/* 3. Tab Content Pages */}
      {activeTab === 'models' && (
        <div className="dsh-a6-tab-page models-page">
          {/* Models Section Toolbar */}
          <div className="dsh-a6-section-header">
            <div className="dsh-a6-filter-group">
              <button
                type="button"
                className={`dsh-a6-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                全部 ({state.models.length})
              </button>
              <button
                type="button"
                className={`dsh-a6-filter-btn ${filterMode === 'enabled' ? 'active' : ''}`}
                onClick={() => setFilterMode('enabled')}
              >
                已启用 ({inDshCount})
              </button>
              <button
                type="button"
                className={`dsh-a6-filter-btn ${filterMode === 'probed' ? 'active' : ''}`}
                onClick={() => setFilterMode('probed')}
              >
                已探测 ({probedCount})
              </button>
            </div>

            <div className="dsh-a6-toolbar-right">
              <div className="dsh-a6-search-wrapper">
                <input
                  type="text"
                  className="dsh-a6-input dsh-a6-search-input"
                  placeholder="搜索模型 / 供应商 / 渠道..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="dsh-a6-clear-btn"
                    onClick={() => setSearchQuery('')}
                    title="清空搜索"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="button"
                className={`dsh-a6-btn dsh-a6-btn-secondary dsh-a6-btn-sm ${refreshSuccess ? 'dsh-a6-btn-refresh-ok' : ''}`}
                onClick={handleRefreshState}
                disabled={refreshing}
                data-tooltip="重新向 A6API 接口拉取当前令牌的可用模型列表及已缓存商户指标（不消耗 Token）"
                data-tooltip-pos="down"
              >
                {refreshing ? '刷新中...' : refreshSuccess ? '已刷新 ✓' : '刷新列表'}
              </button>

              <button
                type="button"
                className="dsh-a6-btn dsh-a6-btn-primary dsh-a6-btn-sm"
                onClick={handleProbeAll}
                disabled={probingAll || state.models.length === 0}
                data-tooltip="对当前令牌支持的所有模型逐个发送一次请求，批量捕获商户路由与最新行情（每个模型消耗少量Token）"
                data-tooltip-pos="down-left"
              >
                {probingAll ? '全量探测中...' : '一键全量探测'}
              </button>
            </div>
          </div>

          {/* Model Cards List */}
          <div className="dsh-a6-cards-list">
            {state.loading && state.models.length === 0 ? (
              <div className="dsh-a6-empty-state">
                <div className="dsh-a6-spinner" />
                <span>正在连接 A6API 聚合站并加载模型行情...</span>
              </div>
            ) : sortedModels.length > 0 ? (
              sortedModels.map((m) => (
                <MerchantCard key={m.model_name} model={m} />
              ))
            ) : (
              <div className="dsh-a6-empty-state">
                {searchQuery ? (
                  <span>未搜索到匹配「{searchQuery}」的模型</span>
                ) : filterMode === 'enabled' ? (
                  <span>
                    当前尚未在 DSH 中启用任何 A6API 模型，点击模型卡片右侧「添加到 DSH」即可启用。
                  </span>
                ) : filterMode === 'probed' ? (
                  <span>
                    尚未探测任何模型商户线路，点击模型卡片上的「探测商家」或上方「一键全量探测」即可开始。
                  </span>
                ) : !state.config.apiKey ? (
                  <span>
                    请前往「基础配置」页面填入您的 A6API 令牌 (API Key) 并保存，即可自动加载可用模型列表。
                  </span>
                ) : (
                  <span>当前令牌暂无可用模型，请检查 A6API 控制台中的令牌限制设置。</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="dsh-a6-tab-page account-page">
          <AccountPanel
            balance={state.balance}
            config={state.config}
            recentLogs={state.recentLogs}
            onNavigateToConfig={() => setActiveTab('config')}
          />
        </div>
      )}

      {activeTab === 'config' && (
        <div className="dsh-a6-tab-page config-page">
          <ConfigPanel
            config={state.config}
            dshConfiguredModels={state.dshConfiguredModels}
          />
        </div>
      )}
    </div>
  );
};
