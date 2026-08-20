'use client';

import React, { useState } from 'react';
import { CurrencySelect } from './CurrencySelect';
import { CurrencyInfo, ConversionResult } from '@/lib/currency/currency.types';
import {
  ArrowUpDown,
  Calendar,
  Zap,
  RefreshCw,
  Clock,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { getYesterdayDateString, formatDateISO } from '@/hooks/use-currency-converter';

interface ConverterCardProps {
  currencies: Record<string, CurrencyInfo>;
  isCurrenciesLoading: boolean;
  isConverting: boolean;
  error: string | null;
  fromCurrency: string;
  setFromCurrency: (val: string) => void;
  toCurrency: string;
  setToCurrency: (val: string) => void;
  amount: number | string;
  setAmount: (val: number | string) => void;
  mode: 'live' | 'historical';
  setMode: (val: 'live' | 'historical') => void;
  historicalDate: string;
  setHistoricalDate: (val: string) => void;
  result: ConversionResult | null;
  swapCurrencies: () => void;
  onConvert: () => void;
  onOpenRatesTable?: () => void;
}

export const ConverterCard: React.FC<ConverterCardProps> = ({
  currencies,
  isCurrenciesLoading,
  isConverting,
  error,
  fromCurrency,
  setFromCurrency,
  toCurrency,
  setToCurrency,
  amount,
  setAmount,
  mode,
  setMode,
  historicalDate,
  setHistoricalDate,
  result,
  swapCurrencies,
  onConvert,
  onOpenRatesTable,
}) => {
  const [isSwapping, setIsSwapping] = useState(false);

  const fromInfo = currencies[fromCurrency] || {
    code: fromCurrency,
    name: fromCurrency,
    symbol: '$',
    flag: '🌐',
    decimal_digits: 2,
  };

  const toInfo = currencies[toCurrency] || {
    code: toCurrency,
    name: toCurrency,
    symbol: '€',
    flag: '🌐',
    decimal_digits: 2,
  };

  const handleSwap = () => {
    setIsSwapping(true);
    swapCurrencies();
    setTimeout(() => setIsSwapping(false), 300);
  };

  const presetAmounts = [10, 50, 100, 500, 1000];

  // Helper date presets
  const setHistoricalPreset = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setHistoricalDate(formatDateISO(d));
    setMode('historical');
  };

  const todayStr = formatDateISO(new Date());

  return (
    <div
      id="converter-card"
      className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 transition-all duration-200"
    >
      {/* Top Mode Selector Tabs */}
      <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-100">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold" role="tablist">
          <button
            type="button"
            id="tab-live-mode"
            role="tab"
            aria-selected={mode === 'live'}
            onClick={() => setMode('live')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all min-h-[36px] ${
              mode === 'live'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Live Rates</span>
          </button>

          <button
            type="button"
            id="tab-historical-mode"
            role="tab"
            aria-selected={mode === 'historical'}
            onClick={() => setMode('historical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all min-h-[36px] ${
              mode === 'historical'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Historical Rate</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
              Bonus
            </span>
          </button>
        </div>

        {onOpenRatesTable && (
          <button
            type="button"
            id="btn-view-all-rates"
            onClick={onOpenRatesTable}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 min-h-[36px]"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Explore Rates</span>
          </button>
        )}
      </div>

      {/* Historical Date Selection Banner (When Historical Mode Active) */}
      {mode === 'historical' && (
        <div
          id="historical-date-panel"
          className="mb-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-amber-700" />
                Select Historical Date
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Conversion will use the exchange rate recorded on this date.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="historical-date-picker"
                type="date"
                max={getYesterdayDateString()}
                min="2010-01-01"
                value={historicalDate}
                onChange={(e) => setHistoricalDate(e.target.value || getYesterdayDateString())}
                className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[40px]"
              />
            </div>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-amber-200/50 overflow-x-auto pb-0.5">
            <span className="text-[11px] font-semibold text-amber-900 flex-shrink-0">
              Presets:
            </span>
            <button
              type="button"
              id="date-preset-yesterday"
              onClick={() => setHistoricalPreset(1)}
              className="text-xs px-2 py-1 rounded-md bg-white border border-amber-200 hover:bg-amber-100/50 text-amber-900 font-medium transition-colors flex-shrink-0"
            >
              Yesterday
            </button>
            <button
              type="button"
              id="date-preset-30d"
              onClick={() => setHistoricalPreset(30)}
              className="text-xs px-2 py-1 rounded-md bg-white border border-amber-200 hover:bg-amber-100/50 text-amber-900 font-medium transition-colors flex-shrink-0"
            >
              1 Mo Ago
            </button>
            <button
              type="button"
              id="date-preset-1y"
              onClick={() => setHistoricalPreset(365)}
              className="text-xs px-2 py-1 rounded-md bg-white border border-amber-200 hover:bg-amber-100/50 text-amber-900 font-medium transition-colors flex-shrink-0"
            >
              1 Yr Ago
            </button>
            <button
              type="button"
              id="date-preset-2y"
              onClick={() => setHistoricalPreset(730)}
              className="text-xs px-2 py-1 rounded-md bg-white border border-amber-200 hover:bg-amber-100/50 text-amber-900 font-medium transition-colors flex-shrink-0"
            >
              2 Yrs Ago
            </button>
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div className="mb-4">
        <label
          htmlFor="amount-input"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
        >
          Amount to Convert
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">
            {fromInfo.symbol}
          </span>
          <input
            id="amount-input"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full pl-9 pr-14 py-3 text-lg font-bold text-slate-900 bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
            {fromInfo.code}
          </span>
        </div>

        {/* Quick Amount Chips */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-medium text-slate-400 flex-shrink-0">Presets:</span>
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              id={`amount-preset-${preset}`}
              onClick={() => setAmount(preset)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors flex-shrink-0 min-h-[30px] ${
                Number(amount) === preset
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {fromInfo.symbol}
              {preset.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Currency Dropdowns with Swap Button */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-2.5 mb-5 relative">
        {/* From Dropdown */}
        <CurrencySelect
          idPrefix="from-currency"
          label="From Currency"
          value={fromCurrency}
          onChange={setFromCurrency}
          currencies={currencies}
          disabled={isCurrenciesLoading}
        />

        {/* Swap Button */}
        <div className="flex justify-center md:pt-5">
          <button
            type="button"
            id="btn-swap-currencies"
            onClick={handleSwap}
            title="Swap Currencies"
            aria-label="Swap from and to currencies"
            className={`w-11 h-11 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer ${
              isSwapping ? 'rotate-180 scale-110' : ''
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* To Dropdown */}
        <CurrencySelect
          idPrefix="to-currency"
          label="To Currency"
          value={toCurrency}
          onChange={setToCurrency}
          currencies={currencies}
          disabled={isCurrenciesLoading}
        />
      </div>

      {/* Error Notice */}
      {error && (
        <div
          id="converter-error-banner"
          className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Conversion Note:</span> {error}
          </div>
          <button
            type="button"
            onClick={onConvert}
            className="text-xs font-bold text-rose-700 underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Dynamic Conversion Result Display */}
      <div
        id="conversion-result-panel"
        className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-5 shadow-sm relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-300">
                {Number(amount || 0).toLocaleString(undefined, {
                  maximumFractionDigits: fromInfo.decimal_digits || 2,
                })}{' '}
                {fromInfo.code} =
              </span>
            </div>

            {/* Mode & Timestamp Badge */}
            <div className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
              {mode === 'historical' ? (
                <>
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>Historical ({historicalDate})</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>Real-time Rate</span>
                </>
              )}
            </div>
          </div>

          {/* Big Converted Result Amount */}
          <div className="flex items-baseline gap-2 flex-wrap min-h-[44px]">
            {isConverting ? (
              <div className="flex items-center gap-2 py-1 text-slate-300">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                <span className="text-xl font-medium tracking-tight">Calculating exchange...</span>
              </div>
            ) : result ? (
              <>
                <span
                  id="converted-amount-display"
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono"
                >
                  {toInfo.symbol}
                  {result.toAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: toInfo.decimal_digits || 4,
                  })}
                </span>
                <span className="text-lg sm:text-xl font-bold text-blue-300">
                  {toInfo.code}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-slate-400">Enter amount</span>
            )}
          </div>

          {/* Rate and Inverse Rate Details */}
          {result && !isConverting && (
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-300">
              <div>
                <span className="text-slate-400">1 {fromCurrency} = </span>
                <span className="font-semibold text-white font-mono">
                  {result.rate.toFixed(4)} {toCurrency}
                </span>
                <span className="mx-2 text-slate-500">•</span>
                <span className="text-slate-400">1 {toCurrency} = </span>
                <span className="font-semibold text-white font-mono">
                  {result.inverseRate.toFixed(4)} {fromCurrency}
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                Updated {result.formattedTime}
              </div>
            </div>
          )}
        </div>

        {/* Decorative subtle background gradient */}
        <div className="absolute right-0 bottom-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Manual Refresh / Re-calculate Button */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          id="btn-recalculate-conversion"
          disabled={isConverting}
          onClick={onConvert}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all min-h-[48px] cursor-pointer disabled:opacity-50"
        >
          {isConverting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Fetching Latest Rate...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Convert & Save to Record</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
