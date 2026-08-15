import React, { useState, useEffect } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { acodeRuntime } from '../services/acodeRuntime';

export const AcodeToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<{ id: string; message: string; duration?: number }[]>([]);

  useEffect(() => {
    const unsub = acodeRuntime.subscribeToasts((currentToasts) => {
      setToasts(currentToasts);
    });
    return () => unsub();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-6 z-50 flex flex-col gap-2 pointer-events-none select-none max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900/95 border border-sky-500/30 text-white text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto"
        >
          <div className="p-1 rounded bg-sky-500/20 text-sky-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-[11px] text-gray-200 leading-tight">{t.message}</span>
        </div>
      ))}
    </div>
  );
};
