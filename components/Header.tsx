'use client';

import React from 'react';
import {
  Coins,
  Settings,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenRates: () => void;
  ratesSource: 'api' | 'fallback';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenRates,
  ratesSource,
}) => {
  return (
    <header
      id="main-header"
      className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 transition-all"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                Currency Converter
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                <Zap className="w-3 h-3" />
                FreeCurrency API
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate hidden xs:block">
              Real-time & historical exchange rates
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Rate Explorer Button */}
          <button
            type="button"
            id="btn-header-rates"
            onClick={onOpenRates}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors min-h-[40px]"
            title="Explore Exchange Rates Table"
          >
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="hidden md:inline">Live Rates</span>
          </button>

          {/* API Settings / Quota Modal */}
          <button
            type="button"
            id="btn-header-settings"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors min-h-[40px]"
            title="API Status and Configuration"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">API Config</span>
            {ratesSource === 'api' ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="API Online" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="Fallback Mode" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
