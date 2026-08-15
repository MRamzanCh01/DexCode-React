import React, { useEffect, useRef } from 'react';
import { AcodeSidebarApp, DexCodeTheme } from '../../types';
import { Blocks, X } from 'lucide-react';

interface AcodeSidebarAppHostProps {
  theme: DexCodeTheme;
  app: AcodeSidebarApp;
  onClose?: () => void;
}

export const AcodeSidebarAppHost: React.FC<AcodeSidebarAppHostProps> = ({ theme, app, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && app.mount) {
      containerRef.current.innerHTML = '';
      app.mount(containerRef.current);
    }

    return () => {
      if (containerRef.current && app.unmount) {
        app.unmount(containerRef.current);
      }
    };
  }, [app]);

  return (
    <div className="flex flex-col h-full text-xs overflow-hidden">
      {/* Header */}
      <div
        className="px-3 py-2 border-b font-bold tracking-wider text-[11px] uppercase flex items-center justify-between shrink-0"
        style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
      >
        <span className="flex items-center gap-1.5 text-sky-400">
          <Blocks className="w-3.5 h-3.5" />
          {app.title}
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dynamic DOM Container for Acode Plugin */}
      <div ref={containerRef} className="flex-1 overflow-y-auto w-full h-full" />
    </div>
  );
};
