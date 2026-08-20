import { ConfigService } from '@nestjs/config';
import { ApiStatusInfo, ConversionRequest, ConversionResult, CurrencyInfo } from './currency.types';
export declare class CurrencyService {
    private readonly configService;
    private readonly logger;
    private cache;
    constructor(configService: ConfigService);
    private getEffectiveApiKey;
    private getCache;
    private setCache;
    getStatus(apiKey?: string): Promise<ApiStatusInfo>;
    getCurrencies(apiKey?: string): Promise<{
        currencies: CurrencyInfo[];
        source: 'api' | 'fallback';
    }>;
    getLatestRates(baseCurrency?: string, currencies?: string[], apiKey?: string): Promise<{
        rates: Record<string, number>;
        source: 'api' | 'fallback';
        baseCurrency: string;
    }>;
    getHistoricalRates(date: string, baseCurrency?: string, currencies?: string[], apiKey?: string): Promise<{
        rates: Record<string, number>;
        source: 'api' | 'fallback';
        date: string;
        baseCurrency: string;
    }>;
    convertCurrency(request: ConversionRequest): Promise<ConversionResult>;
    private calculateFallbackRates;
    private deriveRateFromFallback;
}
