import { SUPPORTED_CURRENCIES } from './currency.constants';
import {
  ConversionResult,
  CurrencyInfo,
} from './currency.types';

/**
 * Browser-side client for the NestJS backend.
 *
 * The FreeCurrencyAPI key never leaves the server: this client only ever talks to
 * our own NestJS service, which holds the key and proxies the upstream calls.
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:4000/api';

/** Shape returned by the backend for a single currency. */
interface BackendCurrency {
  code: string;
  name: string;
  symbol?: string;
  symbol_native?: string;
  name_plural?: string;
  decimal_digits?: number;
  rounding?: number;
  flag?: string;
}

function buildUrl(path: string, params: Record<string, string | undefined> = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);

  if (!res.ok) {
    // NestJS error envelope: { statusCode, error, message: string | string[] }
    let detail = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (Array.isArray(body.message)) detail = body.message.join('. ');
      else if (body.message) detail = body.message;
    } catch {
      // response had no JSON body; keep the status message
    }
    throw new Error(detail);
  }

  return (await res.json()) as T;
}

/**
 * The backend returns a flat list; the UI indexes currencies by code. Local
 * metadata supplies the flags and country names the upstream API does not carry.
 */
function toCurrencyMap(list: BackendCurrency[]): Record<string, CurrencyInfo> {
  const mapped: Record<string, CurrencyInfo> = {};

  list.forEach((item) => {
    const local = SUPPORTED_CURRENCIES[item.code];
    mapped[item.code] = {
      code: item.code,
      name: item.name || local?.name || item.code,
      symbol: item.symbol || local?.symbol || item.code,
      symbol_native: item.symbol_native || local?.symbol_native,
      decimal_digits: item.decimal_digits ?? local?.decimal_digits ?? 2,
      rounding: item.rounding ?? local?.rounding ?? 0,
      name_plural: item.name_plural || local?.name_plural,
      countries: local?.countries || [],
      flag: local?.flag || item.flag || '🌐',
    };
  });

  return mapped;
}

export async function fetchCurrencies(customApiKey?: string): Promise<{
  currencies: Record<string, CurrencyInfo>;
  source: 'api' | 'fallback';
}> {
  const data = await request<{ currencies: BackendCurrency[]; source: 'api' | 'fallback' }>(
    buildUrl('/currencies', { apikey: customApiKey })
  );

  return {
    currencies: toCurrencyMap(data.currencies || []),
    source: data.source,
  };
}

export async function fetchLatestRates(
  baseCurrency: string,
  customApiKey?: string
): Promise<{ rates: Record<string, number>; source: 'api' | 'fallback' }> {
  const data = await request<{
    rates: Record<string, number>;
    source: 'api' | 'fallback';
  }>(buildUrl('/rates/latest', { baseCurrency, customApiKey }));

  return { rates: data.rates || {}, source: data.source };
}

export async function convertCurrency(params: {
  from: string;
  to: string;
  amount: number;
  date?: string;
  customApiKey?: string;
}): Promise<ConversionResult> {
  return request<ConversionResult>(`${API_BASE_URL}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromCurrency: params.from,
      toCurrency: params.to,
      amount: params.amount,
      date: params.date,
      customApiKey: params.customApiKey,
    }),
  });
}
