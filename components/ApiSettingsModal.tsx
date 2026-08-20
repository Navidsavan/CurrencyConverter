'use client';

import React, { useState, useEffect } from 'react';
import { ApiStatusInfo } from '@/lib/currency/currency.types';
import { X, Key, CheckCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customApiKey: string;
  onSaveApiKey: (key: string) => void;
  onRefreshCurrencies: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  customApiKey,
  onSaveApiKey,
  onRefreshCurrencies,
}) => {
  const [inputKey, setInputKey] = useState(customApiKey);
  const [statusInfo, setStatusInfo] = useState<ApiStatusInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const checkStatus = async (keyToCheck?: string) => {
    setIsChecking(true);
    try {
      const active = keyToCheck !== undefined ? keyToCheck : inputKey;
      const res = await fetch(
        active ? `/api/status?apikey=${encodeURIComponent(active)}` : '/api/status'
      );
      const data = await res.json();
      setStatusInfo(data);
    } catch (e) {
      console.warn('Status check error:', e);
      setStatusInfo({
        status: 'error',
        message: 'Could not connect to API status endpoint',
        source: 'fallback',
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!isOpen) return;

    async function loadStatus() {
      setIsChecking(true);
      try {
        const res = await fetch(
          customApiKey
            ? `/api/status?apikey=${encodeURIComponent(customApiKey)}`
            : '/api/status'
        );
        const data = await res.json();
        if (isMounted) {
          setStatusInfo(data);
        }
      } catch (e) {
        console.warn('Status check error:', e);
        if (isMounted) {
          setStatusInfo({
            status: 'error',
            message: 'Could not connect to API status endpoint',
            source: 'fallback',
          });
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    }

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, [isOpen, customApiKey]);

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSaveSuccess(true);
    onRefreshCurrencies();
    checkStatus(inputKey.trim());
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetToDefault = () => {
    setInputKey('');
    onSaveApiKey('');
    setSaveSuccess(true);
    onRefreshCurrencies();
    checkStatus('');
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      id="api-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">API Configuration</h3>
              <p className="text-xs text-slate-500">FreeCurrencyAPI Backend Settings</p>
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

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Status Badge Block */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                API Endpoint Status
              </span>
              <button
                type="button"
                onClick={() => checkStatus()}
                disabled={isChecking}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Re-check</span>
              </button>
            </div>

            {isChecking ? (
              <div className="text-xs text-slate-500 flex items-center gap-2 py-1">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Querying FreeCurrencyAPI status...</span>
              </div>
            ) : statusInfo?.status === 'online' ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>FreeCurrencyAPI is Live & Connected</span>
                </div>
                {statusInfo.quotas?.month && (
                  <div className="text-xs text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-200">
                    Monthly Quota: {statusInfo.quotas.month.used} / {statusInfo.quotas.month.total} used (
                    {statusInfo.quotas.month.remaining} remaining)
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1 text-xs text-amber-800">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{statusInfo?.message || 'Using smart fallback rates.'}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  If the default shared free key reached its request limit, you can paste your own
                  free key below.
                </p>
              </div>
            )}
          </div>

          {/* Custom API Key Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Custom FreeCurrencyAPI Key (Optional)
            </label>
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="e.g. 4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2"
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:border-blue-600 focus:outline-none text-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
              <span>Saved locally in browser and sent securely via backend header.</span>
              <a
                href="https://freecurrencyapi.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {saveSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>API settings updated and validated!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline px-2 py-1"
          >
            Reset to Default
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
