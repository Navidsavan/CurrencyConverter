'use client';

import React, { useState, useMemo } from 'react';
import { CurrencyInfo } from '@/lib/currency/currency.types';
import { X, Search, TrendingUp, RefreshCw } from 'lucide-react';

interface RatesTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseCurrency: string;
  onSelectBaseCurrency: (code: string) => void;
  currencies: Record<string, CurrencyInfo>;
  rates: Record<string, number>;
  ratesSource: 'api' | 'fallback';
}

export const RatesTableModal: React.FC<RatesTableModalProps> = ({
  isOpen,
  onClose,
  baseCurrency,
  onSelectBaseCurrency,
  currencies,
  rates,
  ratesSource,
}) => {
  const [search, setSearch] = useState('');

  const baseMeta = currencies[baseCurrency] || {
    code: baseCurrency,
    name: baseCurrency,
    symbol: '$',
    flag: '🌐',
  };

  const currencyList = useMemo(() => {
    return Object.values(currencies);
  }, [currencies]);

  const filteredRates = useMemo(() => {
    const q = search.toLowerCase().trim();
    return currencyList.filter((c) => {
      if (c.code === baseCurrency) return false;
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.countries?.some((co) => co.toLowerCase().includes(q))
      );
    });
  }, [currencyList, baseCurrency, search]);

  if (!isOpen) return null;

  return (
    <div
      id="rates-table-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Live Exchange Rates
              </h3>
              <p className="text-xs text-slate-500">
                Base: 1 {baseMeta.flag} {baseMeta.code} ({baseMeta.name})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Base Selector Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or country name..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Base:
            </label>
            <select
              value={baseCurrency}
              onChange={(e) => onSelectBaseCurrency(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              {Object.keys(currencies).map((code) => (
                <option key={code} value={code}>
                  {code} - {currencies[code].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rates Table List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-slate-100">
          {filteredRates.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No currencies match your filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredRates.map((c) => {
                const rateVal = rates[c.code];
                const inverseRate = rateVal ? (1 / rateVal).toFixed(4) : null;

                return (
                  <div
                    key={c.code}
                    className="p-3 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl flex-shrink-0">{c.flag || '🌐'}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900">{c.code}</span>
                          <span className="text-xs text-slate-500 font-mono">({c.symbol})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{c.name}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-extrabold text-slate-900 font-mono">
                        {rateVal !== undefined ? rateVal.toFixed(4) : '--'}
                      </div>
                      {inverseRate && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          1 {c.code} = {inverseRate} {baseCurrency}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Source: {ratesSource === 'api' ? 'FreeCurrency API' : 'Fallback Rates'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
