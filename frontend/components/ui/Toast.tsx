'use client';

import { useEffect, useState, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timeoutId?: NodeJS.Timeout;
}

let toastId = 0;
const toasts: Toast[] = [];
const listeners: Array<() => void> = [];

export const toast = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error'),
  info: (message: string) => showToast(message, 'info'),
  warning: (message: string) => showToast(message, 'warning'),
};

function showToast(message: string, type: ToastType) {
  const id = `toast-${++toastId}`;
  
  // Les erreurs restent affichées beaucoup plus longtemps (15 secondes) pour être bien lues
  const duration = type === 'error' ? 15000 : 5000;
  
  const timeoutId = setTimeout(() => {
    removeToast(id);
  }, duration);
  
  const toast: Toast = { id, message, type, timeoutId };
  toasts.push(toast);
  notifyListeners();
}

function removeToast(id: string) {
  const index = toasts.findIndex(t => t.id === id);
  if (index > -1) {
    const toast = toasts[index];
    // Annuler le timeout si il existe
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }
    toasts.splice(index, 1);
    notifyListeners();
  }
}

function pauseToast(id: string) {
  const toast = toasts.find(t => t.id === id);
  if (toast && toast.timeoutId) {
    clearTimeout(toast.timeoutId);
    toast.timeoutId = undefined;
  }
}

function resumeToast(id: string, duration: number) {
  const toast = toasts.find(t => t.id === id);
  if (toast && !toast.timeoutId) {
    toast.timeoutId = setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function ToastContainer() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useEffect(() => {
    const updateToasts = () => setToastList([...toasts]);
    listeners.push(updateToasts);
    updateToasts();

    return () => {
      const index = listeners.indexOf(updateToasts);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const getToastStyles = (type: ToastType) => {
    const styles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };
    return styles[type];
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastList.map((toastItem) => {
        const duration = toastItem.type === 'error' ? 15000 : 5000;
        return (
          <div
            key={toastItem.id}
            className={`min-w-[300px] max-w-md p-4 rounded-lg border shadow-lg animate-slide-in ${getToastStyles(toastItem.type)}`}
            onMouseEnter={() => pauseToast(toastItem.id)}
            onMouseLeave={() => resumeToast(toastItem.id, duration)}
          >
            <div className="flex items-start">
              <span className="text-xl mr-3">{getIcon(toastItem.type)}</span>
              <div className="flex-1">
                <p className="font-medium">{toastItem.message}</p>
              </div>
              <button
                onClick={() => removeToast(toastItem.id)}
                className="ml-4 text-gray-500 hover:text-gray-700 font-bold text-lg"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
