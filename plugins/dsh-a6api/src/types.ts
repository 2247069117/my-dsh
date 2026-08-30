export interface A6ApiConfig {
  baseURL: string;
  apiKey: string;
  accessToken?: string;
  userId?: string;
  activeModels: string[];
  lastSelectedBaseUrl?: string;
  customBaseURL?: string;
  /** backward compatibility */
  sessionCookie?: string;
}

export interface A6ApiModelMeta {
  id: string;
  name: string;
  brand: string;
  contextWindow: number;
  maxTokens: number;
  modalities: ('text' | 'image')[];
  reasoningEfforts?: Record<string, string>;
  thinkingFormat?: string;
  officialPriceMicros?: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
}

export interface OfficialPrices {
  input_cny: string;
  output_cny: string;
  cache_read_cny: string;
  cache_write_cny: string;
  input_price_micros?: number;
  output_price_micros?: number;
  cache_read_price_micros?: number;
  cache_write_price_micros?: number;
}

export interface SuccessBucketItem {
  sample_count?: number;
  success_count?: number;
  success_rate: number;
}

export interface Bucket24hItem {
  s?: number;
  k?: number;
  r: number;
  t?: number;
  d?: number;
  f?: number;
  c?: number;
}

export interface Bucket7dItem {
  s?: number;
  k?: number;
  r?: number;
  t?: number;
  d?: number;
  f?: number;
  c?: number;
}

export interface MerchantChannelInfo {
  listing_id?: number;
  channel_id: number;
  channel_name: string;
  supplier_name: string;
  supplier_id?: number;
  model_name: string;
  brand: string;
  description: string;
  charge_type?: string;
  charge_type_text?: string;
  sample_count?: number;
  sample_count_text?: string;
  input_price_micros: number;
  output_price_micros: number;
  cache_read_price_micros: number;
  cache_write_price_micros: number;
  input_price_cny: string;
  output_price_cny: string;
  cache_read_price_cny: string;
  cache_write_price_cny: string;
  official_price?: OfficialPrices;
  realtime_ratio_cny: number;
  realtime_ratio_formatted: string;
  recent_success_rate_pct: number;
  success_rate_24h_pct: number;
  success_rate_7d_pct?: number;
  success_buckets?: SuccessBucketItem[];
  b24?: Bucket24hItem[];
  b7d?: Bucket7dItem[];
  sr_24h_state?: string;
  sr_7d_state?: string;
  p50_ttft_ms?: number;
  recent_p50_ms: number;
  cache_hit_rate_pct: number;
  labels: string[];
  last_success_at: number;
  last_success_text: string;
  authenticity_guaranteed: boolean;
  authenticity_badge?: string;
  is_pinned?: boolean;
  user_channel_disabled?: boolean;
  supplier_channel_disabled?: boolean;
  raw?: any;
}

export interface ModelCardData {
  model_name: string;
  brand: string;
  contextWindow: number;
  maxTokens: number;
  modalities: ('text' | 'image')[];
  hasReasoning: boolean;
  inDsh: boolean;
  merchant?: MerchantChannelInfo;
  probeStatus: 'idle' | 'probing' | 'success' | 'error';
  probeError?: string;
  probeLatencyMs?: number;
  lastProbedAt?: number;
}

export interface BalanceInfo {
  hasAccountAuth: boolean;
  accountBalanceUsd: number;
  accountBalanceFormatted: string;
  accountBalanceCnyFormatted: string;
  usedUsd: number;
  usedFormatted: string;
  requestCount: number;
  username?: string;
  userId?: string | number;
  isLow: boolean;
  updatedAt: number;
}

export interface ApiRoutingLogItem {
  id: number | string;
  created_at: number;
  model_name: string;
  channel?: number | string;
  channel_name?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  use_time?: number;
  quota?: number;
  cost_usd?: number;
  cost_formatted?: string;
  token_name?: string;
  status: 'success' | 'error';
  other?: string;
  raw?: any;
}

export interface A6ApiStateResponse {
  config: A6ApiConfig;
  balance: BalanceInfo | null;
  models: ModelCardData[];
  dshConfiguredModels: string[];
  recentLogs?: ApiRoutingLogItem[];
}
