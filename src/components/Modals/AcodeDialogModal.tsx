import React, { useState } from 'react';
import { X, HelpCircle, Check, AlertCircle } from 'lucide-react';
import { DexCodeTheme, AcodeDialogState } from '../../types';

interface AcodeDialogModalProps {
  theme: DexCodeTheme;
  dialog: AcodeDialogState | null;
  onClose: () => void;
}

export const AcodeDialogModal: React.FC<AcodeDialogModalProps> = ({ theme, dialog, onClose }) => {
  const [inputValue, setInputValue] = useState(dialog?.defaultValue || '');
  const [selectedOption, setSelectedOption] = useState(dialog?.options?.[0]?.value || '');

  if (!dialog || !dialog.isOpen) return null;

  const handleConfirm = () => {
    if (dialog.type === 'prompt') {
      if (dialog.onConfirm) dialog.onConfirm(inputValue);
    } else if (dialog.type === 'select') {
      if (dialog.onConfirm) dialog.onConfirm(selectedOption);
    } else {
      if (dialog.onConfirm) dialog.onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (dialog.onCancel) dialog.onCancel();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-md rounded-xl shadow-2xl border overflow-hidden flex flex-col text-xs animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: theme.colors.sidebarBackground,
          borderColor: theme.colors.border,
          color: theme.colors.textPrimary,
        }}
      >
        {/* Dialog Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-black/30">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-sky-500/20 text-sky-400">
              <HelpCircle className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold tracking-wide text-white">{dialog.title}</span>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-4 space-y-3">
          {dialog.message && (
            <p className="text-gray-300 leading-relaxed text-xs whitespace-pre-wrap">{dialog.message}</p>
          )}

          {/* Prompt input field */}
          {dialog.type === 'prompt' && (
            <div className="space-y-1 pt-1">
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500 font-mono"
              />
            </div>
          )}

          {/* Select options dropdown / radio */}
          {dialog.type === 'select' && dialog.options && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {dialog.options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setSelectedOption(opt.value)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedOption === opt.value
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                      : 'bg-black/30 border-gray-800 text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <span>{opt.text}</span>
                  {selectedOption === opt.value && <Check className="w-4 h-4 text-sky-400" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dialog Footer Actions */}
        <div className="flex items-center justify-end gap-2 p-3 border-t border-gray-800 bg-black/20">
          {(dialog.type === 'confirm' || dialog.type === 'prompt' || dialog.type === 'select') && (
            <button
              onClick={handleCancel}
              className="px-3.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {dialog.type === 'alert' ? 'OK' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
