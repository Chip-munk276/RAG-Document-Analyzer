import React from 'react';
import { AlertTriangle, X, RefreshCw, CheckCircle2, Info } from 'lucide-react';

export function ErrorBanner({ title = "Error", message, onRetry, onClose }) {
  if (!message) return null;

  return (
    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start justify-between gap-3 text-red-300 text-xs animate-fade-in shadow-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-red-400 text-sm">{title}</h5>
          <p className="mt-0.5 opacity-90">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[11px] font-semibold transition"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry Request</span>
            </button>
          )}
        </div>
      </div>

      {onClose && (
        <button onClick={onClose} className="text-red-400 hover:text-red-200">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function ToastNotification({ type = 'success', message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl glass-panel border shadow-2xl animate-slide-up text-xs font-medium">
      {type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
      {type === 'error' && <AlertTriangle className="h-4 w-4 text-red-400" />}
      {type === 'info' && <Info className="h-4 w-4 text-indigo-400" />}

      <span className="text-slate-100">{message}</span>

      {onClose && (
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-200">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
