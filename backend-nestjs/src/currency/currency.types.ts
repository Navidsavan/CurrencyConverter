export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  name_plural?: string;
  symbol_native?: string;
  decimal_digits?: number;
  rounding?: number;
  flag?: string;
}

export interface FreeCurrencyStatusResponse {
  quotas?: {
    month?: {
      total: number;
      used: number;
      remaining: number;
    };
  };
}

export interface FreeCurrencyRatesResponse {
  data: Record<string, number>;
}

export interface FreeCurrencyHistoricalResponse {
  data: Record<string, Record<string, number>>;
}

export interface ConversionRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  date?: string;
  customApiKey?: string;
}

export interface ConversionResult {
  id: string;
  timestamp: string;
  formattedDate: string;
  formattedTime: string;
  fromCurrency: string;
  fromAmount: number;
  toCurrency: string;
  toAmount: number;
  rate: number;
  inverseRate: number;
  isHistorical: boolean;
  dateUsed?: string;
  source: 'api' | 'fallback';
}

export interface ApiStatusInfo {
  status: 'active' | 'rate_limited' | 'invalid_key' | 'offline';
  message: string;
  quotaRemaining?: number;
  quotaTotal?: number;
  quotaUsed?: number;
}
