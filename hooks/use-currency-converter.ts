'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import {
  ConversionResult,
  CurrencyInfo,
} from '@/lib/currency/currency.types';
import { SUPPORTED_CURRENCIES } from '@/lib/currency/currency.constants';
import {
  convertCurrency,
  fetchCurrencies as requestCurrencies,
  fetchLatestRates,
} from '@/lib/currency/api.client';

const CUSTOM_API_KEY_STORAGE = 'freecurrency_custom_api_key';

let memoryApiKey = '';
let isApiKeyInitialized = false;
const apiKeyListeners = new Set<() => void>();

function notifyApiKey() {
  apiKeyListeners.forEach((l) => l());
}

function loadApiKeyFromStorage(): string {
  if (typeof window === 'undefined') return '';
  if (!isApiKeyInitialized) {
    isApiKeyInitialized = true;
    try {
      memoryApiKey = window.localStorage.getItem(CUSTOM_API_KEY_STORAGE) || '';
    } catch {
      memoryApiKey = '';
    }
  }
  return memoryApiKey;
}

function subscribeApiKey(callback: () => void) {
  apiKeyListeners.add(callback);
  return () => {
    apiKeyListeners.delete(callback);
  };
}

function getApiKeyServerSnapshot() {
  return '';
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function formatDateISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function useCurrencyConverter(
  onConversionSuccess?: (result: ConversionResult) => void
) {
  const [currencies, setCurrencies] =
    useState<Record<string, CurrencyInfo>>(SUPPORTED_CURRENCIES);
  const [isCurrenciesLoading, setIsCurrenciesLoading] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [amount, setAmount] = useState<number | string>(100);
  const [mode, setMode] = useState<'live' | 'historical'>('live');
  const [historicalDate, setHistoricalDate] = useState<string>(getYesterdayDateString());

  const [result, setResult] = useState<ConversionResult | null>(null);
  const [latestRates, setLatestRates] = useState<Record<string, number>>({});
  const [ratesSource, setRatesSource] = useState<'api' | 'fallback'>('api');

  const customApiKey = useSyncExternalStore(
    subscribeApiKey,
    loadApiKeyFromStorage,
    getApiKeyServerSnapshot
  );

  const saveCustomApiKey = useCallback((key: string) => {
    memoryApiKey = key;
    notifyApiKey();
    if (typeof window !== 'undefined') {
      try {
        if (key) {
          window.localStorage.setItem(CUSTOM_API_KEY_STORAGE, key);
        } else {
          window.localStorage.removeItem(CUSTOM_API_KEY_STORAGE);
        }
      } catch (e) {
        console.warn('Could not save API key to storage', e);
      }
    }
  }, []);

  // Fetch supported currencies list
  const fetchCurrencies = useCallback(async () => {
    setIsCurrenciesLoading(true);
    setError(null);
    try {
      const { currencies: list } = await requestCurrencies(customApiKey);
      if (Object.keys(list).length > 0) {
        setCurrencies(list);
      }
    } catch (err) {
      console.error('Error fetching currencies:', err);
    } finally {
      setIsCurrenciesLoading(false);
    }
  }, [customApiKey]);

  // Execute currency conversion
  const executeConversion = useCallback(
    async (
      overrideParams?: {
        from?: string;
        to?: string;
        amount?: number | string;
        date?: string;
        mode?: 'live' | 'historical';
      },
      recordToHistory: boolean = true
    ) => {
      const activeFrom = (overrideParams?.from || fromCurrency).toUpperCase();
      const activeTo = (overrideParams?.to || toCurrency).toUpperCase();
      const rawAmount =
        overrideParams?.amount !== undefined ? overrideParams.amount : amount;
      const activeAmount = Number(rawAmount) || 0;
      const activeMode = overrideParams?.mode || mode;
      const activeDate =
        activeMode === 'historical'
          ? overrideParams?.date || historicalDate
          : undefined;

      if (activeAmount < 0) {
        setError('Please enter a valid positive amount.');
        return;
      }

      setIsConverting(true);
      setError(null);

      try {
        const convResult = await convertCurrency({
          from: activeFrom,
          to: activeTo,
          amount: activeAmount,
          date: activeDate,
          customApiKey: customApiKey || undefined,
        });

        setResult(convResult);

        if (recordToHistory && onConversionSuccess) {
          onConversionSuccess(convResult);
        }

        return convResult;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'An error occurred during conversion.';
        setError(msg);
      } finally {
        setIsConverting(false);
      }
    },
    [
      fromCurrency,
      toCurrency,
      amount,
      mode,
      historicalDate,
      customApiKey,
      onConversionSuccess,
    ]
  );

  // Fetch rates table for base currency
  const fetchRatesTable = useCallback(async () => {
    try {
      const { rates, source } = await fetchLatestRates(fromCurrency, customApiKey);
      setLatestRates(rates);
      setRatesSource(source || 'api');
    } catch (e) {
      console.warn('Failed to load rates table', e);
    }
  }, [fromCurrency, customApiKey]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const { currencies: list } = await requestCurrencies(customApiKey);
        if (isMounted && Object.keys(list).length > 0) {
          setCurrencies(list);
        }
      } catch {
        // keep the bundled currency list so the dropdowns still work
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [customApiKey]);

  // Load rates table whenever fromCurrency changes
  useEffect(() => {
    let isMounted = true;
    async function loadRates() {
      try {
        const { rates, source } = await fetchLatestRates(fromCurrency, customApiKey);
        if (isMounted) {
          setLatestRates(rates);
          setRatesSource(source || 'api');
        }
      } catch {
        // ignore — the converter still works without the rates table
      }
    }
    loadRates();
    return () => {
      isMounted = false;
    };
  }, [fromCurrency, customApiKey]);

  // Live preview: re-quote the rate whenever an input changes, but never write
  // to the history log. Records are only saved when the user explicitly converts.
  const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      executeConversion(undefined, false);
      return;
    }

    const timer = setTimeout(() => {
      executeConversion(undefined, false);
    }, 450);

    return () => clearTimeout(timer);
  }, [fromCurrency, toCurrency, amount, mode, historicalDate, executeConversion]);

  // Swap currencies
  const swapCurrencies = useCallback(() => {
    const prevFrom = fromCurrency;
    const prevTo = toCurrency;
    setFromCurrency(prevTo);
    setToCurrency(prevFrom);
  }, [fromCurrency, toCurrency]);

  return {
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
    refreshCurrencies: fetchCurrencies,
    fetchRatesTable,
  };
}
