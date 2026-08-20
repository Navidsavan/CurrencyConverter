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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyController = void 0;
const common_1 = require("@nestjs/common");
const currency_service_1 = require("./currency.service");
const convert_currency_dto_1 = require("./dto/convert-currency.dto");
const get_rates_dto_1 = require("./dto/get-rates.dto");
let CurrencyController = class CurrencyController {
    constructor(currencyService) {
        this.currencyService = currencyService;
    }
    async getStatus(apiKey) {
        return this.currencyService.getStatus(apiKey);
    }
    async getCurrencies(apiKey) {
        return this.currencyService.getCurrencies(apiKey);
    }
    async getLatestRates(query) {
        const currenciesArray = query.currencies
            ? query.currencies.split(',').map((c) => c.trim().toUpperCase())
            : undefined;
        return this.currencyService.getLatestRates(query.baseCurrency || 'USD', currenciesArray, query.customApiKey);
    }
    async getHistoricalRates(query) {
        const currenciesArray = query.currencies
            ? query.currencies.split(',').map((c) => c.trim().toUpperCase())
            : undefined;
        return this.currencyService.getHistoricalRates(query.date, query.baseCurrency || 'USD', currenciesArray, query.customApiKey);
    }
    async convertCurrency(dto) {
        return this.currencyService.convertCurrency({
            fromCurrency: dto.fromCurrency,
            toCurrency: dto.toCurrency,
            amount: dto.amount,
            date: dto.date,
            customApiKey: dto.customApiKey,
        });
    }
};
exports.CurrencyController = CurrencyController;
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Query)('apikey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('currencies'),
    __param(0, (0, common_1.Query)('apikey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "getCurrencies", null);
__decorate([
    (0, common_1.Get)('rates/latest'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_rates_dto_1.GetLatestRatesDto]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "getLatestRates", null);
__decorate([
    (0, common_1.Get)('rates/historical'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_rates_dto_1.GetHistoricalRatesDto]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "getHistoricalRates", null);
__decorate([
    (0, common_1.Post)('convert'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [convert_currency_dto_1.ConvertCurrencyDto]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "convertCurrency", null);
exports.CurrencyController = CurrencyController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [currency_service_1.CurrencyService])
], CurrencyController);
//# sourceMappingURL=currency.controller.js.map