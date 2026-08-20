'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { ConversionHistoryItem, ConversionResult } from '@/lib/currency/currency.types';

const STORAGE_KEY = 'currency_converter_history_records';

let memoryHistory: ConversionHistoryItem[] = [];
let isInitialized = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function loadHistoryFromStorage(): ConversionHistoryItem[] {
  if (typeof window === 'undefined') return [];
  if (!isInitialized) {
    isInitialized = true;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          memoryHistory = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load conversion history from localStorage:', e);
    }
  }
  return memoryHistory;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      try {
        if (e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            memoryHistory = parsed;
          }
        } else {
          memoryHistory = [];
        }
      } catch {
        memoryHistory = [];
      }
      notify();
    }
  };

  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

const serverSnapshot: ConversionHistoryItem[] = [];

function getServerSnapshot() {
  return serverSnapshot;
}

export function useConversionHistory() {
  const history = useSyncExternalStore(subscribe, loadHistoryFromStorage, getServerSnapshot);

  const saveToStorage = useCallback((records: ConversionHistoryItem[]) => {
    memoryHistory = records;
    notify();
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      } catch (e) {
        console.error('Failed to persist conversion history to localStorage:', e);
      }
    }
  }, []);

  const addRecord = useCallback(
    (result: ConversionResult) => {
      // Prevent immediate duplicate entries
      if (
        memoryHistory.length > 0 &&
        memoryHistory[0].fromCurrency === result.fromCurrency &&
        memoryHistory[0].toCurrency === result.toCurrency &&
        memoryHistory[0].fromAmount === result.fromAmount &&
        memoryHistory[0].dateUsed === result.dateUsed &&
        Math.abs(Date.now() - new Date(memoryHistory[0].timestamp).getTime()) < 3000
      ) {
        return;
      }

      const newItem: ConversionHistoryItem = {
        ...result,
      };

      const updated = [newItem, ...memoryHistory.slice(0, 99)]; // Max 100 items
      saveToStorage(updated);
    },
    [saveToStorage]
  );

  const removeRecord = useCallback(
    (id: string) => {
      const updated = memoryHistory.filter((item) => item.id !== id);
      saveToStorage(updated);
    },
    [saveToStorage]
  );

  const clearAllHistory = useCallback(() => {
    memoryHistory = [];
    notify();
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear storage:', e);
      }
    }
  }, []);

  const exportAsJSON = useCallback(() => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `currency-conversion-history-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [history]);

  const exportAsCSV = useCallback(() => {
    if (history.length === 0) return;
    const headers = [
      'ID',
      'Date',
      'Time',
      'From Currency',
      'From Amount',
      'To Currency',
      'To Amount',
      'Exchange Rate',
      'Inverse Rate',
      'Rate Type',
      'Historical Date Used',
    ];
    const rows = history.map((item) => [
      `"${item.id}"`,
      `"${item.formattedDate}"`,
      `"${item.formattedTime}"`,
      `"${item.fromCurrency}"`,
      item.fromAmount,
      `"${item.toCurrency}"`,
      item.toAmount,
      item.rate,
      item.inverseRate,
      `"${item.isHistorical ? 'Historical' : 'Live'}"`,
      `"${item.dateUsed || 'N/A'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `currency-conversions-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [history]);

  return {
    history,
    isLoaded: true,
    addRecord,
    removeRecord,
    clearAllHistory,
    exportAsJSON,
    exportAsCSV,
    totalRecords: history.length,
  };
}
