import React, { useState } from 'react';
import { store } from '../store.js';
import type { BalanceInfo, A6ApiConfig, ApiRoutingLogItem } from '../../types.js';

export const AccountPanel: React.FC<{
  balance: BalanceInfo | null;
  config: A6ApiConfig;
  recentLogs?: ApiRoutingLogItem[];
  onNavigateToConfig?: () => void;
}> = ({ balance, config, recentLogs = [], onNavigateToConfig }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    await store.refreshBalance();
    setRefreshing(false);
  };

  const hasAuth = balance?.hasAccountAuth ?? false;
  const isLow = balance ? balance.isLow : false;

  const formatLogTime = (ts: number) => {
    if (!ts) return '刚刚';
    const d = new Date(ts * 1000);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div className="dsh-a6-account-page">
      {/* 1. Real Balance Banner */}
      <div className={`dsh-a6-balance-banner ${isLow ? 'low-balance' : ''}`}>
        <div className="dsh-a6-balance-header">
          <div className="dsh-a6-balance-left">
            <div className="dsh-a6-balance-main-title">
              <span className="dsh-a6-balance-label">账户真实余额 (实时同步)</span>
              <div className="dsh-a6-balance-num-row">
                <span className={`dsh-a6-balance-amount ${!hasAuth ? 'unauthed' : ''}`}>
                  {hasAuth ? (balance?.accountBalanceFormatted ?? '$0.00') : '未连接'}
                </span>
                {hasAuth && balance?.accountBalanceCnyFormatted && (
                  <span className="dsh-a6-balance-cny">{balance.accountBalanceCnyFormatted}</span>
                )}
                <span className={`dsh-a6-status-pill ${hasAuth ? 'success' : 'warn'}`}>
                  {hasAuth ? '账户已同步' : '未连接系统访问令牌'}
                </span>
              </div>
            </div>

            {isLow && (
              <span className="dsh-a6-low-alert">
                余额较低 (&lt; $0.50)，建议及时充值以保障正常调用
              </span>
            )}
          </div>

          <div className="dsh-a6-balance-actions">
            <button
              type="button"
              className="dsh-a6-btn dsh-a6-btn-secondary dsh-a6-btn-sm"
              onClick={handleRefreshBalance}
              disabled={refreshing}
              data-tooltip="从 A6API 控制台同步获取最新账户真实可用余额与消耗统计（不消耗 Token）"
              data-tooltip-pos="down"
            >
              {refreshing ? '刷新中...' : '刷新余额'}
            </button>
            <a
              href="https://a6api.com/console"
              target="_blank"
              rel="noreferrer"
              className="dsh-a6-btn dsh-a6-btn-primary dsh-a6-btn-sm"
              style={{ textDecoration: 'none' }}
              data-tooltip="在新标签页中打开 A6API 控制台进行在线充值或管理凭据"
              data-tooltip-pos="down-left"
            >
              前往充值 / 控制台
            </a>
          </div>
        </div>

        {/* 2. Statistical KPI Cards */}
        <div className="dsh-a6-stat-cards-grid">
          <div className="dsh-a6-kpi-card">
            <span className="dsh-a6-kpi-label">关联账户</span>
            <span className="dsh-a6-kpi-val">
              {hasAuth ? `${balance?.username || '已认证用户'} (#${balance?.userId || '—'})` : '未绑定'}
            </span>
          </div>
          <div className="dsh-a6-kpi-card">
            <span className="dsh-a6-kpi-label">历史总消耗</span>
            <span className="dsh-a6-kpi-val">
              {hasAuth ? `$${balance?.usedUsd?.toFixed(2) ?? '0.00'}` : '—'}
            </span>
          </div>
          <div className="dsh-a6-kpi-card">
            <span className="dsh-a6-kpi-label">累计请求次数</span>
            <span className="dsh-a6-kpi-val">
              {hasAuth ? `${balance?.requestCount ?? 0} 次` : '—'}
            </span>
          </div>
          <div className="dsh-a6-kpi-card">
            <span className="dsh-a6-kpi-label">实时汇率参考</span>
            <span className="dsh-a6-kpi-val">1 USD ≈ 6.7209 CNY</span>
          </div>
        </div>
      </div>

      {/* 3. Auth Warning Banner if Not Connected */}
      {!hasAuth && (
        <div className="dsh-a6-auth-banner-box">
          <div className="dsh-a6-auth-banner-content">
            <div className="dsh-a6-auth-banner-title">连接系统访问令牌以解锁完整资产监控</div>
            <div className="dsh-a6-auth-banner-desc">
              填入您的 <strong>A6API 系统访问令牌</strong> 后，即可在此实时查看账户真实可用余额、历史消耗、累计请求以及商户路由价格指标。
            </div>
          </div>
          {onNavigateToConfig && (
            <button
              type="button"
              className="dsh-a6-btn dsh-a6-btn-primary dsh-a6-btn-sm"
              onClick={onNavigateToConfig}
            >
              填写系统访问令牌
            </button>
          )}
        </div>
      )}

      {/* 4. Recent Routing Requests Snapshot */}
      <div className="dsh-a6-logs-section">
        <div className="dsh-a6-logs-header">
          <span className="dsh-a6-logs-title">最近路由调用明细 (实时快照)</span>
          <span className="dsh-a6-logs-subtitle">展示通过当前 A6API 接入的近期请求与商户路由耗时</span>
        </div>

        {recentLogs && recentLogs.length > 0 ? (
          <div className="dsh-a6-logs-table-wrapper">
            <table className="dsh-a6-logs-table">
              <thead>
                <tr>
                  <th>调用时间</th>
                  <th>状态</th>
                  <th>商户id</th>
                  <th>请求模型</th>
                  <th>输入/输出</th>
                  <th>花费</th>
                  <th>耗时</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log, idx) => {
                  const isErr =
                    log.status === 'error' ||
                    (log.status as string) === 'failed' ||
                    (log.raw && (
                      log.raw.type !== 2 ||
                      (log.raw.other && (
                        log.raw.other.includes('"request_final_status":"failed"') ||
                        log.raw.other.includes('"request_final_status":"error"') ||
                        log.raw.other.includes('"request_final_status":"upstream_error"')
                      )) ||
                      Boolean(log.raw.content && log.raw.content.startsWith('status_code='))
                    ));

                  const channelNum = Number(log.channel || log.raw?.channel || 0);

                  return (
                    <tr key={log.id || idx}>
                      <td className="dsh-a6-log-time">{formatLogTime(log.created_at)}</td>
                      <td>
                        <span className={`dsh-a6-log-status ${isErr ? 'err' : 'ok'}`}>
                          {isErr ? '失败' : '成功'}
                        </span>
                      </td>
                      <td className="dsh-a6-log-channel">
                        {channelNum > 0 ? (
                          <span className="dsh-a6-log-channel-badge">
                            #{channelNum}
                          </span>
                        ) : (
                          <span className="dsh-a6-log-channel-empty">
                            无
                          </span>
                        )}
                      </td>
                      <td className="dsh-a6-log-model">
                        <code>{log.model_name}</code>
                      </td>
                      <td className="dsh-a6-log-tokens">
                        {log.prompt_tokens || 0} / {log.completion_tokens || 0}
                      </td>
                      <td className="dsh-a6-log-cost">
                        {log.cost_formatted || '$0.00'}
                      </td>
                      <td className="dsh-a6-log-time-use">
                        {log.use_time ? `${log.use_time}s` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dsh-a6-empty-logs">
            <span>暂无近期调用记录。在 DSH 中发起模型对话或点击「探测商家」后，调用明细将在此实时展示。</span>
          </div>
        )}
      </div>
    </div>
  );
};

export { AccountPanel as BalanceCard };
