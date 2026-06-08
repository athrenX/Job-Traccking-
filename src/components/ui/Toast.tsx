'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: ((message: string, type: ToastType) => void)[] = [];

export const showToast = (message: string, type: ToastType = 'info') => {
  toastListeners.forEach(listener => listener(message, type));
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (message: string, type: ToastType) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };

    toastListeners.push(handleToast);
    return () => {
      toastListeners = toastListeners.filter(listener => listener !== handleToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl pointer-events-auto animate-slide-in transform transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            {getIcon(t.type)}
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
