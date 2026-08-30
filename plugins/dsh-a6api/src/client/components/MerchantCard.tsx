import React, { useState } from 'react';
import { store } from '../store.js';
import type { ModelCardData } from '../../types.js';

export const MerchantCard: React.FC<{
  model: ModelCardData;
}> = ({ model }) => {
  // 进入后默认不展开
  const [expanded, setExpanded] = useState(false);

  const isProbing = model.probeStatus === 'probing';
  const merchant = model.merchant;

  const handleProbe = (e: React.MouseEvent) => {
    e.stopPropagation();
    store.probeModel(model.model_name);
  };

  const handleToggleDsh = (e: React.MouseEvent) => {
    e.stopPropagation();
    store.toggleDshModel(model.model_name);
  };

  // Success Rate Dot Generators
  const renderRealtimeDots = () => {
    if (merchant?.success_buckets && merchant.success_buckets.length > 0) {
      return merchant.success_buckets.slice(0, 10).map((b, i) => {
        const rate = b.success_rate;
        let colorClass = 'green';
        if (rate < 8000) colorClass = 'red';
        else if (rate < 9500) colorClass = 'yellow';
        return <div key={i} className={`dsh-a6-rate-dot ${colorClass}`} />;
      });
    }
    const count = 10;
    const greenCount = merchant ? Math.round((merchant.recent_success_rate_pct / 100) * count) : 10;
    return Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`dsh-a6-rate-dot ${i < greenCount ? 'green' : 'empty'}`} />
    ));
  };

  const render24hDots = () => {
    if (merchant?.b24 && merchant.b24.length > 0) {
      return merchant.b24.slice(0, 12).map((b, i) => {
        if (!b.s || b.s === 0) {
          return <div key={i} className="dsh-a6-rate-dot empty" />;
        }
        let colorClass = 'green';
        if (b.r < 8000) colorClass = 'red';
        else if (b.r < 9500) colorClass = 'yellow';
        return <div key={i} className={`dsh-a6-rate-dot ${colorClass}`} />;
      });
    }
    const count = 12;
    const greenCount = merchant ? Math.round((merchant.success_rate_24h_pct / 100) * count) : 12;
    return Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`dsh-a6-rate-dot ${i < greenCount ? 'green' : 'empty'}`} />
    ));
  };

  const render7dDots = () => {
    if (merchant?.b7d && merchant.b7d.length > 0) {
      return merchant.b7d.slice(0, 7).map((b, i) => {
        if (!b.s || b.s === 0) {
          return <div key={i} className="dsh-a6-rate-dot empty" />;
        }
        let colorClass = 'green';
        if (b.r && b.r < 8000) colorClass = 'red';
        else if (b.r && b.r < 9500) colorClass = 'yellow';
        return <div key={i} className={`dsh-a6-rate-dot ${colorClass}`} />;
      });
    }
    return Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className={`dsh-a6-rate-dot ${i >= 4 ? 'green' : 'empty'}`} />
    ));
  };

  // Smart tag styling
  const getTagClass = (tag: string) => {
    if (tag.includes('保真')) return 'tag-guarantee';
    if (tag.includes('稳定')) return 'tag-stable';
    if (tag.includes('低价')) return 'tag-cheap';
    if (tag.includes('高速')) return 'tag-fast';
    if (tag.includes('高质')) return 'tag-quality';
    return '';
  };

  // Realtime ratio pill
  const ratioText = merchant?.realtime_ratio_formatted || '0.0341';

  // Latency & Cache hit
  const latencySec = merchant
    ? ((merchant.p50_ttft_ms || merchant.recent_p50_ms || 2340) / 1000).toFixed(2) + 's'
    : model.probeLatencyMs
      ? (model.probeLatencyMs / 1000).toFixed(2) + 's'
      : '2.34s';
  const cacheHitPct = merchant ? merchant.cache_hit_rate_pct : 72.0;

  return (
    <div className={`dsh-a6-official-card ${model.inDsh ? 'in-dsh' : ''}`}>
      {/* 1. Main Top Row */}
      <div className="dsh-a6-card-main-bar" onClick={() => setExpanded(!expanded)}>
        {/* Col 1: Model Title & Subtitle */}
        <div className="dsh-a6-bar-identity">
          <div className="dsh-a6-title-col">
            <div className="dsh-a6-title-line">
              <span className="dsh-a6-name-text">{model.model_name}</span>
              {merchant?.channel_id && (
                <>
                  <span className="dsh-a6-dot-sep">·</span>
                  <span className="dsh-a6-merchant-id-text">
                    商户ID {merchant.channel_id}
                  </span>
                </>
              )}
            </div>
            {merchant?.description && (
              <div className="dsh-a6-sub-desc">{merchant.description}</div>
            )}
          </div>
        </div>

        {/* Col 2: Pricing Summary + Ratio Tag */}
        {merchant ? (
          <div className="dsh-a6-bar-pricing">
            <div className="dsh-a6-price-col">
              <span className="dsh-a6-price-top" title="输入价 (1M)">
                {merchant.input_price_cny}
              </span>
              <span className="dsh-a6-price-btm" title="缓存读 (1M)">
                {merchant.cache_read_price_cny}
              </span>
            </div>
            <div className="dsh-a6-price-col">
              <span className="dsh-a6-price-top" title="输出价 (1M)">
                {merchant.output_price_cny}
              </span>
              <span className="dsh-a6-price-btm" title="缓存写 (1M)">
                {merchant.cache_write_price_cny}
              </span>
            </div>
            <div className="dsh-a6-ratio-pill" title="实时倍率比官方价">
              {ratioText}
            </div>
          </div>
        ) : (
          <div className="dsh-a6-bar-pricing unprobed">
            <div
              className={`dsh-a6-unprobed-hint ${model.probeError ? 'error' : ''}`}
              data-tooltip={model.probeError || undefined}
              data-tooltip-pos="down"
            >
              {isProbing ? '商家探测中...' : model.probeError ? '探测失败' : '尚未探测商家'}
            </div>
          </div>
        )}

        {/* Col 3: Status / Health Bars (实时, 24h, 7d) */}
        <div className="dsh-a6-bar-uptime">
          <div className="dsh-a6-uptime-row">
            <span className="dsh-a6-uptime-label">实时</span>
            <div className="dsh-a6-dots-track">{renderRealtimeDots()}</div>
            <span className="dsh-a6-uptime-val">
              {merchant ? `${merchant.recent_success_rate_pct.toFixed(1)}%` : '100.0%'}
            </span>
          </div>
          <div className="dsh-a6-uptime-row">
            <span className="dsh-a6-uptime-label">24h</span>
            <div className="dsh-a6-dots-track">{render24hDots()}</div>
            <span className="dsh-a6-uptime-val">
              {merchant ? `${merchant.success_rate_24h_pct.toFixed(1)}%` : '99.3%'}
            </span>
          </div>
          <div className="dsh-a6-uptime-row">
            <span className="dsh-a6-uptime-label">7d</span>
            <div className="dsh-a6-dots-track">{render7dDots()}</div>
            <span className="dsh-a6-uptime-val">
              {merchant?.sr_7d_state === 'no_data'
                ? '-'
                : merchant?.success_rate_7d_pct
                  ? `${merchant.success_rate_7d_pct.toFixed(1)}%`
                  : '-'}
            </span>
          </div>
        </div>

        {/* Col 4: Speed / Latency & Cache Hit Bar */}
        <div className="dsh-a6-bar-perf">
          <div className="dsh-a6-perf-row">
            <span className="dsh-a6-latency-text">{latencySec}</span>
            <span className="dsh-a6-cache-hit-text">{cacheHitPct.toFixed(1)}%</span>
            <div className="dsh-a6-hit-track">
              <div
                className="dsh-a6-hit-fill"
                style={{ width: `${Math.min(100, Math.max(0, cacheHitPct))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Col 5: Smart Tags */}
        <div className="dsh-a6-bar-tags">
          {(merchant?.labels || ['稳定', '低价', '高速', '高质']).map((lbl, idx) => (
            <span key={idx} className={`dsh-a6-smart-pill ${getTagClass(lbl)}`}>
              {lbl}
            </span>
          ))}
        </div>

        {/* Col 6: Right Action & Status Group */}
        <div className="dsh-a6-bar-actions" onClick={(e) => e.stopPropagation()}>
          <span
            className="dsh-a6-time-ago"
            data-tooltip="该商户路线全网最近一次成功响应时间"
          >
            {merchant?.last_success_text || '刚刚'}
          </span>

          <button
            type="button"
            className="dsh-a6-btn dsh-a6-btn-secondary dsh-a6-btn-sm"
            onClick={handleProbe}
            disabled={isProbing}
            data-tooltip="向该模型发送一次请求以探测并捕获其实际命中的商户 ID、价格及健康度指标（消耗少量Token）"
          >
            {isProbing ? '探测中...' : '探测商家'}
          </button>

          <button
            type="button"
            className={`dsh-a6-btn dsh-a6-btn-sm ${model.inDsh ? 'dsh-a6-btn-in-dsh' : 'dsh-a6-btn-primary'}`}
            onClick={handleToggleDsh}
            data-tooltip={model.inDsh ? '已加入 DSH 模型选择器 (点击移除)' : '添加至 DSH 模型选择器'}
          >
            {model.inDsh ? '移除模型' : '添加模型'}
          </button>

          <button
            type="button"
            className={`dsh-a6-expand-toggle-btn ${expanded ? 'open' : ''}`}
            onClick={() => setExpanded(!expanded)}
            data-tooltip={expanded ? '收起价格详情' : '展开官方基准价与商户实时价对比表'}
            data-tooltip-pos="left"
          >
            {expanded ? '收起' : '详情'}
          </button>
        </div>
      </div>

      {/* 2. Bottom Detailed Price Comparison Table (Only when expanded) */}
      {expanded && (
        <div className="dsh-a6-detail-container">
          <div className="dsh-a6-detail-top-row">
            <div className="dsh-a6-dt-left">
              <span className="dsh-a6-dt-label">渠道说明</span>
              <span className="dsh-a6-dt-desc">
                {merchant?.description || '高并发 主打便宜 稳定'}
              </span>
            </div>
            {merchant?.channel_name && (
              <div className="dsh-a6-dt-right">
                <span className="dsh-a6-dt-label">命中线路</span>
                <span className="dsh-a6-dt-channel-name">
                  {merchant.channel_name} (ID: {merchant.channel_id})
                </span>
              </div>
            )}
          </div>

          <div className="dsh-a6-dt-divider" />

          {/* Clean Price Comparison Table */}
          <div className="dsh-a6-dt-table-col">
            <table className="dsh-a6-price-table">
              <thead>
                <tr>
                  <th className="dsh-a6-th-blank"></th>
                  <th>输入价 (1M)</th>
                  <th>输出价 (1M)</th>
                  <th>缓存读 (1M)</th>
                  <th>缓存写 (1M)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="dsh-a6-tr-official">
                  <td className="dsh-a6-td-label">官方价</td>
                  <td>{merchant?.official_price?.input_cny || '¥26.884'}</td>
                  <td>{merchant?.official_price?.output_cny || '¥134.418'}</td>
                  <td>{merchant?.official_price?.cache_read_cny || '¥2.688'}</td>
                  <td>{merchant?.official_price?.cache_write_cny || '¥33.605'}</td>
                </tr>
                <tr className="dsh-a6-tr-merchant">
                  <td className="dsh-a6-td-label">商户价</td>
                  <td className="dsh-a6-td-bold">{merchant?.input_price_cny || '¥0.1364'}</td>
                  <td className="dsh-a6-td-bold">{merchant?.output_price_cny || '¥0.6822'}</td>
                  <td className="dsh-a6-td-bold">{merchant?.cache_read_price_cny || '¥0.0136'}</td>
                  <td className="dsh-a6-td-bold">{merchant?.cache_write_price_cny || '¥0.1705'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
