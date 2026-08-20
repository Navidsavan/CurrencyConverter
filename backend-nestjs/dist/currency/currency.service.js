"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CurrencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const currency_constants_1 = require("./currency.constants");
let CurrencyService = CurrencyService_1 = class CurrencyService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CurrencyService_1.name);
        this.cache = new Map();
    }
    getEffectiveApiKey(customKey) {
        return (customKey?.trim() ||
            this.configService.get('FREECURRENCY_API_KEY')?.trim() ||
            currency_constants_1.DEFAULT_API_KEY);
    }
    getCache(key) {
        const entry = this.cache.get(key);
        if (entry && entry.expiry > Date.now()) {
            return entry.data;
        }
        return null;
    }
    setCache(key, data, ttlMs) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttlMs,
        });
    }
    async getStatus(apiKey) {
        const key = this.getEffectiveApiKey(apiKey);
        try {
            const res = await fetch(`${currency_constants_1.FREECURRENCY_BASE_URL}/status?apikey=${key}`, {
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
            const json = (await res.json());
            const quotas = json.quotas?.month;
            return {
                status: 'active',
                message: 'FreeCurrencyAPI is active and operational',
                quotaRemaining: quotas?.remaining,
                quotaTotal: quotas?.total,
                quotaUsed: quotas?.used,
            };
        }
        catch (e) {
            this.logger.error(`Status check error: ${e.message}`);
            return {
                status: 'offline',
                message: 'Could not connect to FreeCurrencyAPI. Using built-in rates.',
            };
        }
    }
    async getCurrencies(apiKey) {
        const cacheKey = `currencies_${apiKey || 'default'}`;
        const cached = this.getCache(cacheKey);
        if (cached) {
            return { currencies: cached, source: 'api' };
        }
        const key = this.getEffectiveApiKey(apiKey);
        try {
            const res = await fetch(`${currency_constants_1.FREECURRENCY_BASE_URL}/currencies?apikey=${key}`, {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const json = await res.json();
                const data = json.data;
                const list = Object.values(data).map((item) => {
                    const matched = currency_constants_1.SUPPORTED_CURRENCIES.find((c) => c.code === item.code);
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
                this.setCache(cacheKey, list, 1000 * 60 * 60);
                return { currencies: list, source: 'api' };
            }
        }
        catch (e) {
            this.logger.warn(`Could not fetch dynamic currencies from API: ${e.message}`);
        }
        return { currencies: currency_constants_1.SUPPORTED_CURRENCIES, source: 'fallback' };
    }
    async getLatestRates(baseCurrency = 'USD', currencies, apiKey) {
        const upperBase = baseCurrency.toUpperCase();
        const currenciesParam = currencies && currencies.length > 0 ? currencies.join(',') : '';
        const cacheKey = `latest_${upperBase}_${currenciesParam}_${apiKey || 'default'}`;
        const cached = this.getCache(cacheKey);
        if (cached) {
            return { rates: cached, source: 'api', baseCurrency: upperBase };
        }
        const key = this.getEffectiveApiKey(apiKey);
        try {
            let url = `${currency_constants_1.FREECURRENCY_BASE_URL}/latest?apikey=${key}&base_currency=${upperBase}`;
            if (currenciesParam) {
                url += `&currencies=${currenciesParam}`;
            }
            const res = await fetch(url, { headers: { Accept: 'application/json' } });
            if (res.ok) {
                const json = (await res.json());
                if (json.data) {
                    const ratesWithBase = { ...json.data, [upperBase]: 1.0 };
                    this.setCache(cacheKey, ratesWithBase, 1000 * 60 * 15);
                    return { rates: ratesWithBase, source: 'api', baseCurrency: upperBase };
                }
            }
        }
        catch (e) {
            this.logger.warn(`Latest rates fetch error: ${e.message}`);
        }
        const fallbackRates = this.calculateFallbackRates(upperBase);
        return { rates: fallbackRates, source: 'fallback', baseCurrency: upperBase };
    }
    async getHistoricalRates(date, baseCurrency = 'USD', currencies, apiKey) {
        const upperBase = baseCurrency.toUpperCase();
        const currenciesParam = currencies && currencies.length > 0 ? currencies.join(',') : '';
        const cacheKey = `hist_${date}_${upperBase}_${currenciesParam}_${apiKey || 'default'}`;
        const cached = this.getCache(cacheKey);
        if (cached) {
            return { rates: cached, source: 'api', date, baseCurrency: upperBase };
        }
        const key = this.getEffectiveApiKey(apiKey);
        try {
            let url = `${currency_constants_1.FREECURRENCY_BASE_URL}/historical?apikey=${key}&date=${date}&base_currency=${upperBase}`;
            if (currenciesParam) {
                url += `&currencies=${currenciesParam}`;
            }
            const res = await fetch(url, { headers: { Accept: 'application/json' } });
            if (res.ok) {
                const json = (await res.json());
                if (json.data && json.data[date]) {
                    const rates = { ...json.data[date], [upperBase]: 1.0 };
                    this.setCache(cacheKey, rates, 1000 * 60 * 60 * 24);
                    return { rates, source: 'api', date, baseCurrency: upperBase };
                }
            }
        }
        catch (e) {
            this.logger.warn(`Historical rates fetch error: ${e.message}`);
        }
        const fallbackRates = this.calculateFallbackRates(upperBase);
        return { rates: fallbackRates, source: 'fallback', date, baseCurrency: upperBase };
    }
    async convertCurrency(request) {
        const { fromCurrency, toCurrency, amount, date, customApiKey } = request;
        const from = fromCurrency.toUpperCase();
        const to = toCurrency.toUpperCase();
        let rate = 1.0;
        let source = 'api';
        const isHistorical = Boolean(date && date.trim().length > 0);
        if (from === to) {
            rate = 1.0;
        }
        else {
            if (isHistorical && date) {
                const histResult = await this.getHistoricalRates(date, from, [to], customApiKey);
                source = histResult.source;
                if (histResult.rates[to]) {
                    rate = histResult.rates[to];
                }
                else {
                    rate = this.deriveRateFromFallback(from, to);
                }
            }
            else {
                const latestResult = await this.getLatestRates(from, [to], customApiKey);
                source = latestResult.source;
                if (latestResult.rates[to]) {
                    rate = latestResult.rates[to];
                }
                else {
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
    calculateFallbackRates(base) {
        const usdToBase = currency_constants_1.FALLBACK_USD_RATES[base] || 1.0;
        const result = {};
        for (const [code, usdToTarget] of Object.entries(currency_constants_1.FALLBACK_USD_RATES)) {
            result[code] = Math.round((usdToTarget / usdToBase) * 1000000) / 1000000;
        }
        return result;
    }
    deriveRateFromFallback(from, to) {
        const fromUsd = currency_constants_1.FALLBACK_USD_RATES[from] || 1.0;
        const toUsd = currency_constants_1.FALLBACK_USD_RATES[to] || 1.0;
        return Math.round((toUsd / fromUsd) * 1000000) / 1000000;
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = CurrencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map