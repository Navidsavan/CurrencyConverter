'use client';

import React, { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ConverterCard } from '@/components/ConverterCard';
import { ConversionHistory } from '@/components/ConversionHistory';
import { RatesTableModal } from '@/components/RatesTableModal';
import { ApiSettingsModal } from '@/components/ApiSettingsModal';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';
import { useConversionHistory } from '@/hooks/use-conversion-history';
import { ConversionHistoryItem, ConversionResult } from '@/lib/currency/currency.types';
import {
  Zap,
  Calendar,
  History,
  ShieldCheck,
  Globe2,
  TrendingUp,
} from 'lucide-react';

export default function Home() {
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<'converter' | 'history'>('converter');

  const {
    history,
    isLoaded: isHistoryLoaded,
    addRecord,
    removeRecord,
    clearAllHistory,
    exportAsJSON,
    exportAsCSV,
  } = useConversionHistory();

  // Handle conversion record logging
  const handleConversionSuccess = useCallback(
    (result: ConversionResult) => {
      addRecord(result);
    },
    [addRecord]
  );

  const {
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
    latestRates,
    ratesSource,
    customApiKey,
    saveCustomApiKey,
    executeConversion,
    swapCurrencies,
    refreshCurrencies,
  } = useCurrencyConverter(handleConversionSuccess);

  // Manual convert trigger
  const handleManualConvert = () => {
    executeConversion(undefined, true);
  };

  // Re-apply history item
  const handleReapplyConversion = (item: ConversionHistoryItem) => {
    setFromCurrency(item.fromCurrency);
    setToCurrency(item.toCurrency);
    setAmount(item.fromAmount);
    if (item.isHistorical && item.dateUsed) {
      setMode('historical');
      setHistoricalDate(item.dateUsed);
    } else {
      setMode('live');
    }
    // Switch to converter tab on mobile
    setActiveMobileView('converter');
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-16 sm:pb-8">
      {/* Navigation Header */}
      <Header
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenRates={() => setIsRatesModalOpen(true)}
        ratesSource={ratesSource}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* Mobile View Toggle Bar (Only visible on small screens) */}
        <div className="sm:hidden mb-4 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-2 gap-1">
          <button
            type="button"
            id="mobile-tab-converter"
            onClick={() => setActiveMobileView('converter')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[44px] ${
              activeMobileView === 'converter'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Converter</span>
          </button>

          <button
            type="button"
            id="mobile-tab-history"
            onClick={() => setActiveMobileView('history')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[44px] ${
              activeMobileView === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History ({history.length})</span>
          </button>
        </div>

        {/* Feature Highlights Banner */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Globe2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {Object.keys(currencies).length} Currencies
              </div>
              <div className="text-[10px] text-slate-500 truncate">Dynamic list</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">Live Rates</div>
              <div className="text-[10px] text-slate-500 truncate">Real-time sync</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">Historical Rates</div>
              <div className="text-[10px] text-slate-500 truncate">Pick any past date</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">Backend Proxy</div>
              <div className="text-[10px] text-slate-500 truncate">API Key protected</div>
            </div>
          </div>
        </div>

        {/* Primary Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Primary Column: Converter Card */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              activeMobileView === 'converter' ? 'block' : 'hidden sm:block'
            }`}
          >
            <ConverterCard
              currencies={currencies}
              isCurrenciesLoading={isCurrenciesLoading}
              isConverting={isConverting}
              error={error}
              fromCurrency={fromCurrency}
              setFromCurrency={setFromCurrency}
              toCurrency={toCurrency}
              setToCurrency={setToCurrency}
              amount={amount}
              setAmount={setAmount}
              mode={mode}
              setMode={setMode}
              historicalDate={historicalDate}
              setHistoricalDate={setHistoricalDate}
              result={result}
              swapCurrencies={swapCurrencies}
              onConvert={handleManualConvert}
              onOpenRatesTable={() => setIsRatesModalOpen(true)}
            />

            {/* Quick Currency Pair Shortcuts */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hidden sm:block">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Popular Pairs</span>
                <span className="text-[10px] font-normal text-slate-400">Click to switch</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs font-semibold">
                {[
                  ['USD', 'EUR'],
                  ['EUR', 'USD'],
                  ['GBP', 'USD'],
                  ['USD', 'JPY'],
                  ['USD', 'CAD'],
                  ['AUD', 'USD'],
                ].map(([from, to]) => (
                  <button
                    key={`${from}-${to}`}
                    type="button"
                    onClick={() => {
                      setFromCurrency(from);
                      setToCurrency(to);
                    }}
                    className={`px-2 py-1.5 rounded-xl border text-center transition-colors ${
                      fromCurrency === from && toCurrency === to
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {from}/{to}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Persistent Conversion History */}
          <div
            className={`lg:col-span-5 ${
              activeMobileView === 'history' ? 'block' : 'hidden sm:block'
            }`}
          >
            <ConversionHistory
              history={history}
              isLoaded={isHistoryLoaded}
              currencies={currencies}
              onRemoveItem={removeRecord}
              onClearAll={clearAllHistory}
              onExportJSON={exportAsJSON}
              onExportCSV={exportAsCSV}
              onReapplyConversion={handleReapplyConversion}
            />
          </div>
        </div>
      </main>

      {/* Rates Table Explorer Modal */}
      <RatesTableModal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
        baseCurrency={fromCurrency}
        onSelectBaseCurrency={(code) => setFromCurrency(code)}
        currencies={currencies}
        rates={latestRates}
        ratesSource={ratesSource}
      />

      {/* API Key Configuration Modal */}
      <ApiSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        customApiKey={customApiKey}
        onSaveApiKey={saveCustomApiKey}
        onRefreshCurrencies={refreshCurrencies}
      />
    </div>
  );
}
