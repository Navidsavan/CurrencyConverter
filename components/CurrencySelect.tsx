'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CurrencyInfo } from '@/lib/currency/currency.types';
import { Search, ChevronDown, Check, Globe } from 'lucide-react';

interface CurrencySelectProps {
  label: string;
  value: string;
  onChange: (code: string) => void;
  currencies: Record<string, CurrencyInfo>;
  disabled?: boolean;
  idPrefix?: string;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
  label,
  value,
  onChange,
  currencies,
  disabled = false,
  idPrefix = 'currency-select',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCurrency = currencies[value] || {
    code: value,
    name: value,
    symbol: value,
    flag: '🌐',
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const currencyList = useMemo(() => {
    return Object.values(currencies);
  }, [currencies]);

  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return currencyList;
    return currencyList.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.countries?.some((country) => country.toLowerCase().includes(q))
    );
  }, [currencyList, searchQuery]);

  const popularCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'INR'];

  return (
    <div className="relative w-full" ref={dropdownRef} id={`${idPrefix}-container`}>
      <label
        htmlFor={`${idPrefix}-trigger`}
        className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
      >
        {label}
      </label>

      {/* Trigger Button */}
      <button
        id={`${idPrefix}-trigger`}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 min-h-[48px] rounded-xl border bg-white text-left transition-all duration-200 ${
          isOpen
            ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'cursor-pointer'}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl leading-none flex-shrink-0" role="img" aria-label={selectedCurrency.name}>
            {selectedCurrency.flag || '🌐'}
          </span>
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base">{selectedCurrency.code}</span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                {selectedCurrency.symbol}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{selectedCurrency.name}</p>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
          id={`${idPrefix}-menu`}
        >
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                id={`${idPrefix}-search`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search currency, code or country..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Quick chips if no search */}
            {!searchQuery && (
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none">
                <span className="text-[10px] font-semibold uppercase text-slate-600 flex-shrink-0">
                  Quick:
                </span>
                {popularCodes.map((code) => {
                  const curr = currencies[code];
                  if (!curr) return null;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        onChange(code);
                        setIsOpen(false);
                      }}
                      className={`text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1 transition-colors flex-shrink-0 ${
                        value === code
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{curr.flag}</span>
                      <span>{code}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Currency List */}
          <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-slate-50">
            {filteredCurrencies.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm">
                <Globe className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                No currencies found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredCurrencies.map((c) => {
                const isSelected = c.code === value;
                return (
                  <button
                    key={c.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    id={`${idPrefix}-opt-${c.code}`}
                    onClick={() => {
                      onChange(c.code);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors min-h-[44px] ${
                      isSelected
                        ? 'bg-blue-50 text-blue-950 font-medium'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl flex-shrink-0">{c.flag || '🌐'}</span>
                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900">{c.code}</span>
                          <span className="text-xs text-slate-500 font-mono">({c.symbol})</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{c.name}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
