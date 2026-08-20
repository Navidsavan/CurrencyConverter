'use client';

import React, { useState, useMemo } from 'react';
import { ConversionHistoryItem, CurrencyInfo } from '@/lib/currency/currency.types';
import {
  History,
  Trash2,
  Download,
  Search,
  RotateCcw,
  Calendar,
  Zap,
  ArrowRight,
  Database,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface ConversionHistoryProps {
  history: ConversionHistoryItem[];
  isLoaded: boolean;
  currencies: Record<string, CurrencyInfo>;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onReapplyConversion: (item: ConversionHistoryItem) => void;
}

export const ConversionHistory: React.FC<ConversionHistoryProps> = ({
  history,
  isLoaded,
  currencies,
  onRemoveItem,
  onClearAll,
  onExportJSON,
  onExportCSV,
  onReapplyConversion,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'live' | 'historical'>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredHistory = useMemo(() => {
    let list = history;

    if (filterType === 'live') {
      list = list.filter((item) => !item.isHistorical);
    } else if (filterType === 'historical') {
      list = list.filter((item) => item.isHistorical);
    }

    if (!filterQuery.trim()) return list;

    const q = filterQuery.toLowerCase().trim();
    return list.filter(
      (item) =>
        item.fromCurrency.toLowerCase().includes(q) ||
        item.toCurrency.toLowerCase().includes(q) ||
        item.formattedDate.toLowerCase().includes(q) ||
        item.formattedTime.toLowerCase().includes(q) ||
        item.fromAmount.toString().includes(q) ||
        item.toAmount.toString().includes(q)
    );
  }, [history, filterQuery, filterType]);

  const getCurrencyMeta = (code: string) => {
    return currencies[code] || {
      code,
      name: code,
      symbol: code,
      flag: '🌐',
    };
  };

  return (
    <div
      id="conversion-history-container"
      className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Conversion History</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {history.length}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Persisted across reloads</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {history.length > 0 && (
            <>
              <button
                type="button"
                id="btn-export-csv"
                onClick={onExportCSV}
                title="Export as CSV spreadsheet"
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1 transition-colors min-h-[36px]"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                type="button"
                id="btn-export-json"
                onClick={onExportJSON}
                title="Export as JSON"
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1 transition-colors min-h-[36px]"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">JSON</span>
              </button>

              <button
                type="button"
                id="btn-clear-all-history"
                onClick={() => setShowConfirmClear(true)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 font-medium flex items-center gap-1 transition-colors min-h-[36px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Clear All */}
      {showConfirmClear && (
        <div
          id="confirm-clear-dialog"
          className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-slate-800 animate-in fade-in"
        >
          <p className="text-xs font-bold text-rose-900 mb-1">
            Are you sure you want to delete all {history.length} conversion records?
          </p>
          <p className="text-xs text-rose-700 mb-3">
            This action cannot be undone. Stored records in your browser will be erased.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-confirm-delete-yes"
              onClick={() => {
                onClearAll();
                setShowConfirmClear(false);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors min-h-[36px]"
            >
              Yes, Delete All
            </button>
            <button
              type="button"
              id="btn-confirm-delete-cancel"
              onClick={() => setShowConfirmClear(false)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors min-h-[36px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {history.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="history-search-input"
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search history by currency or date..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold flex-shrink-0">
            <button
              type="button"
              id="history-filter-all"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              id="history-filter-live"
              onClick={() => setFilterType('live')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterType === 'live'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live
            </button>
            <button
              type="button"
              id="history-filter-historical"
              onClick={() => setFilterType('historical')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterType === 'historical'
                  ? 'bg-white text-amber-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Historical
            </button>
          </div>
        </div>
      )}

      {/* History Items List */}
      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
        {!isLoaded ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Loading saved conversions...
          </div>
        ) : history.length === 0 ? (
          /* Empty State */
          <div
            id="history-empty-state"
            className="py-10 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">No Conversions Yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Perform your first currency conversion above. Every transaction will be
              automatically logged with its exact date and time.
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No history records match your search query.
          </div>
        ) : (
          filteredHistory.map((item) => {
            const fromMeta = getCurrencyMeta(item.fromCurrency);
            const toMeta = getCurrencyMeta(item.toCurrency);

            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                className="group p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70 transition-all duration-150 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  {/* Timestamp & Type Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <span>{item.formattedDate}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-700">{item.formattedTime}</span>
                    </span>

                    {item.isHistorical ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Hist: {item.dateUsed}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>Live Rate</span>
                      </span>
                    )}
                  </div>

                  {/* Actions: Re-apply & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id={`btn-reuse-${item.id}`}
                      onClick={() => onReapplyConversion(item)}
                      title="Load this conversion into the converter"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors text-xs font-medium flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Use</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-delete-${item.id}`}
                      onClick={() => onRemoveItem(item.id)}
                      title="Delete record"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Conversion Flow */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1 font-bold text-slate-900 text-sm sm:text-base">
                      <span>{fromMeta.flag}</span>
                      <span>
                        {fromMeta.symbol}
                        {item.fromAmount.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 font-mono">
                        {item.fromCurrency}
                      </span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

                    <div className="flex items-center gap-1 font-extrabold text-blue-700 text-sm sm:text-base">
                      <span>{toMeta.flag}</span>
                      <span>
                        {toMeta.symbol}
                        {item.toAmount.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 font-mono">
                        {item.toCurrency}
                      </span>
                    </div>
                  </div>

                  {/* Rate info */}
                  <div className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    1 {item.fromCurrency} = {item.rate.toFixed(4)} {item.toCurrency}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
