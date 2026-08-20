import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_API_KEY,
  FALLBACK_USD_RATES,
  FREECURRENCY_BASE_URL,
  SUPPORTED_CURRENCIES,
} from './currency.constants';
import {
  ApiStatusInfo,
  ConversionRequest,
  ConversionResult,
  CurrencyInfo,
  FreeCurrencyHistoricalResponse,
  FreeCurrencyRatesResponse,
  FreeCurrencyStatusResponse,
} from './currency.types';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  constructor(private readonly configService: ConfigService) {}

  private getEffectiveApiKey(customKey?: string): string {
    return (
      customKey?.trim() ||
      this.configService.get<string>('FREECURRENCY_API_KEY')?.trim() ||
      DEFAULT_API_KEY
    );
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data as T;
    }
    return null;
  }

  private setCache<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  public async getStatus(apiKey?: string): Promise<ApiStatusInfo> {
    const key = this.getEffectiveApiKey(apiKey);
    try {
      const res = await fetch(`${FREECURRENCY_BASE_URL}/status?apikey=${key}`, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        if (res.status === 429) {
          return {
            status: 'rate_limited',
            message: 'API rate quota reached. Please provide a custom API key.',
            quotaRemaining: 0,
          };
        }
        if (res.status === 401 || res.status === 403) {
          return {
            status: 'invalid_key',
            message: 'Invalid API key provided.',
            quotaRemaining: 0,
          };
        }
        return {
          status: 'offline',
          message: `API responded with HTTP ${res.status}`,
        };
      }

      const json = (await res.json()) as FreeCurrencyStatusResponse;
      const quotas = json.quotas?.month;
      return {
        status: 'active',
        message: 'FreeCurrencyAPI is active and operational',
        quotaRemaining: quotas?.remaining,
        quotaTotal: quotas?.total,
        quotaUsed: quotas?.used,
      };
    } catch (e: any) {
      this.logger.error(`Status check error: ${e.message}`);
      return {
        status: 'offline',
        message: 'Could not connect to FreeCurrencyAPI. Using built-in rates.',
      };
    }
  }

  public async getCurrencies(apiKey?: string): Promise<{
    currencies: CurrencyInfo[];
    source: 'api' | 'fallback';
  }> {
    const cacheKey = `currencies_${apiKey || 'default'}`;
    const cached = this.getCache<CurrencyInfo[]>(cacheKey);
    if (cached) {
      return { currencies: cached, source: 'api' };
    }

    const key = this.getEffectiveApiKey(apiKey);
    try {
      const res = await fetch(`${FREECURRENCY_BASE_URL}/currencies?apikey=${key}`, {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data as Record<
          string,
          {
            code: string;
            name: string;
            symbol: string;
            name_plural?: string;
            symbol_native?: string;
            decimal_digits?: number;
            rounding?: number;
          }
        >;

        const list: CurrencyInfo[] = Object.values(data).map((item) => {
          const matched = SUPPORTED_CURRENCIES.find((c) => c.code === item.code);
          return {
            code: item.code,
            name: item.name,
            symbol: item.symbol || item.symbol_native || item.code,
            name_plural: item.name_plural,
            symbol_native: item.symbol_native,
            decimal_digits: item.decimal_digits,
            rounding: item.rounding,
            flag: matched?.flag || '🌐',
          };
        });

        this.setCache(cacheKey, list, 1000 * 60 * 60); // 1 hour cache
        return { currencies: list, source: 'api' };
      }
    } catch (e: any) {
      this.logger.warn(`Could not fetch dynamic currencies from API: ${e.message}`);
    }

    return { currencies: SUPPORTED_CURRENCIES, source: 'fallback' };
  }

  public async getLatestRates(
    baseCurrency: string = 'USD',
    currencies?: string[],
    apiKey?: string,
  ): Promise<{
    rates: Record<string, number>;
    source: 'api' | 'fallback';
    baseCurrency: string;
  }> {
    const upperBase = baseCurrency.toUpperCase();
    const currenciesParam = currencies && currencies.length > 0 ? currencies.join(',') : '';
    const cacheKey = `latest_${upperBase}_${currenciesParam}_${apiKey || 'default'}`;

    const cached = this.getCache<Record<string, number>>(cacheKey);
    if (cached) {
      return { rates: cached, source: 'api', baseCurrency: upperBase };
    }

    const key = this.getEffectiveApiKey(apiKey);
    try {
      let url = `${FREECURRENCY_BASE_URL}/latest?apikey=${key}&base_currency=${upperBase}`;
      if (currenciesParam) {
        url += `&currencies=${currenciesParam}`;
      }

      const res = await fetch(url, { headers: { Accept: 'application/json' } });

      if (res.ok) {
        const json = (await res.json()) as FreeCurrencyRatesResponse;
        if (json.data) {
          const ratesWithBase = { ...json.data, [upperBase]: 1.0 };
          this.setCache(cacheKey, ratesWithBase, 1000 * 60 * 15); // 15 mins cache
          return { rates: ratesWithBase, source: 'api', baseCurrency: upperBase };
        }
      }
    } catch (e: any) {
      this.logger.warn(`Latest rates fetch error: ${e.message}`);
    }

    const fallbackRates = this.calculateFallbackRates(upperBase);
    return { rates: fallbackRates, source: 'fallback', baseCurrency: upperBase };
  }

  public async getHistoricalRates(
    date: string,
    baseCurrency: string = 'USD',
    currencies?: string[],
    apiKey?: string,
  ): Promise<{
    rates: Record<string, number>;
    source: 'api' | 'fallback';
    date: string;
    baseCurrency: string;
  }> {
    const upperBase = baseCurrency.toUpperCase();
    const currenciesParam = currencies && currencies.length > 0 ? currencies.join(',') : '';
    const cacheKey = `hist_${date}_${upperBase}_${currenciesParam}_${apiKey || 'default'}`;

    const cached = this.getCache<Record<string, number>>(cacheKey);
    if (cached) {
      return { rates: cached, source: 'api', date, baseCurrency: upperBase };
    }

    const key = this.getEffectiveApiKey(apiKey);
    try {
      let url = `${FREECURRENCY_BASE_URL}/historical?apikey=${key}&date=${date}&base_currency=${upperBase}`;
      if (currenciesParam) {
        url += `&currencies=${currenciesParam}`;
      }

      const res = await fetch(url, { headers: { Accept: 'application/json' } });

      if (res.ok) {
        const json = (await res.json()) as FreeCurrencyHistoricalResponse;
        if (json.data && json.data[date]) {
          const rates = { ...json.data[date], [upperBase]: 1.0 };
          this.setCache(cacheKey, rates, 1000 * 60 * 60 * 24); // 24 hours
          return { rates, source: 'api', date, baseCurrency: upperBase };
        }
      }
    } catch (e: any) {
      this.logger.warn(`Historical rates fetch error: ${e.message}`);
    }

    const fallbackRates = this.calculateFallbackRates(upperBase);
    return { rates: fallbackRates, source: 'fallback', date, baseCurrency: upperBase };
  }

  public async convertCurrency(request: ConversionRequest): Promise<ConversionResult> {
    const { fromCurrency, toCurrency, amount, date, customApiKey } = request;
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    let rate = 1.0;
    let source: 'api' | 'fallback' = 'api';
    const isHistorical = Boolean(date && date.trim().length > 0);

    if (from === to) {
      rate = 1.0;
    } else {
      if (isHistorical && date) {
        const histResult = await this.getHistoricalRates(date, from, [to], customApiKey);
        source = histResult.source;
        if (histResult.rates[to]) {
          rate = histResult.rates[to];
        } else {
          rate = this.deriveRateFromFallback(from, to);
        }
      } else {
        const latestResult = await this.getLatestRates(from, [to], customApiKey);
        source = latestResult.source;
        if (latestResult.rates[to]) {
          rate = latestResult.rates[to];
        } else {
          rate = this.deriveRateFromFallback(from, to);
        }
      }
    }

    const convertedAmount = Math.round(amount * rate * 10000) / 10000;
    const inverseRate = rate > 0 ? Math.round((1 / rate) * 1000000) / 1000000 : 0;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: now.toISOString(),
      formattedDate,
      formattedTime,
      fromCurrency: from,
      fromAmount: amount,
      toCurrency: to,
      toAmount: convertedAmount,
      rate: Math.round(rate * 1000000) / 1000000,
      inverseRate,
      isHistorical,
      dateUsed: date,
      source,
    };
  }

  private calculateFallbackRates(base: string): Record<string, number> {
    const usdToBase = FALLBACK_USD_RATES[base] || 1.0;
    const result: Record<string, number> = {};
    for (const [code, usdToTarget] of Object.entries(FALLBACK_USD_RATES)) {
      result[code] = Math.round((usdToTarget / usdToBase) * 1000000) / 1000000;
    }
    return result;
  }

  private deriveRateFromFallback(from: string, to: string): number {
    const fromUsd = FALLBACK_USD_RATES[from] || 1.0;
    const toUsd = FALLBACK_USD_RATES[to] || 1.0;
    return Math.round((toUsd / fromUsd) * 1000000) / 1000000;
  }
}
