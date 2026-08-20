export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  symbol_native?: string;
  decimal_digits: number;
  rounding?: number;
  name_plural?: string;
  countries?: string[];
  flag?: string;
}

export interface CurrenciesResponse {
  data: Record<string, CurrencyInfo>;
}

export interface RatesResponse {
  data: Record<string, number>;
}

export interface HistoricalRatesResponse {
  data: Record<string, Record<string, number>>; // date -> { EUR: 0.92, ... }
}

export interface ConversionRequest {
  from: string;
  to: string;
  amount: number;
  date?: string; // Format: YYYY-MM-DD
  apiKey?: string;
}

export interface ConversionResult {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  inverseRate: number;
  dateUsed?: string;
  isHistorical: boolean;
  timestamp: string; // ISO string
  formattedDate: string; // "Aug 20, 2026"
  formattedTime: string; // "11:45:30 AM"
}

export interface ConversionHistoryItem extends ConversionResult {
  notes?: string;
}

export interface ApiStatusInfo {
  status: 'online' | 'rate_limited' | 'error';
  quotas?: {
    month?: {
      total: number;
      used: number;
      remaining: number;
    };
    grace?: {
      total: number;
      used: number;
      remaining: number;
    };
  };
  message?: string;
  source: 'api' | 'fallback';
}
