import { CurrencyService } from './currency.service';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { GetHistoricalRatesDto, GetLatestRatesDto } from './dto/get-rates.dto';
export declare class CurrencyController {
    private readonly currencyService;
    constructor(currencyService: CurrencyService);
    getStatus(apiKey?: string): Promise<import("./currency.types").ApiStatusInfo>;
    getCurrencies(apiKey?: string): Promise<{
        currencies: import("./currency.types").CurrencyInfo[];
        source: "api" | "fallback";
    }>;
    getLatestRates(query: GetLatestRatesDto): Promise<{
        rates: Record<string, number>;
        source: "api" | "fallback";
        baseCurrency: string;
    }>;
    getHistoricalRates(query: GetHistoricalRatesDto): Promise<{
        rates: Record<string, number>;
        source: "api" | "fallback";
        date: string;
        baseCurrency: string;
    }>;
    convertCurrency(dto: ConvertCurrencyDto): Promise<import("./currency.types").ConversionResult>;
}
