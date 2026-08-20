import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { GetHistoricalRatesDto, GetLatestRatesDto } from './dto/get-rates.dto';

@Controller()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('status')
  async getStatus(@Query('apikey') apiKey?: string) {
    return this.currencyService.getStatus(apiKey);
  }

  @Get('currencies')
  async getCurrencies(@Query('apikey') apiKey?: string) {
    return this.currencyService.getCurrencies(apiKey);
  }

  @Get('rates/latest')
  async getLatestRates(@Query() query: GetLatestRatesDto) {
    const currenciesArray = query.currencies
      ? query.currencies.split(',').map((c) => c.trim().toUpperCase())
      : undefined;

    return this.currencyService.getLatestRates(
      query.baseCurrency || 'USD',
      currenciesArray,
      query.customApiKey,
    );
  }

  @Get('rates/historical')
  async getHistoricalRates(@Query() query: GetHistoricalRatesDto) {
    const currenciesArray = query.currencies
      ? query.currencies.split(',').map((c) => c.trim().toUpperCase())
      : undefined;

    return this.currencyService.getHistoricalRates(
      query.date,
      query.baseCurrency || 'USD',
      currenciesArray,
      query.customApiKey,
    );
  }

  @Post('convert')
  @HttpCode(HttpStatus.OK)
  async convertCurrency(@Body() dto: ConvertCurrencyDto) {
    return this.currencyService.convertCurrency({
      fromCurrency: dto.fromCurrency,
      toCurrency: dto.toCurrency,
      amount: dto.amount,
      date: dto.date,
      customApiKey: dto.customApiKey,
    });
  }
}
