import React, { useState } from 'react';
import { Sparkles, Send, Copy, Check, Code, Bug, Lightbulb, FileCheck2, Loader2 } from 'lucide-react';
import { DexCodeTheme } from '../../types';

interface AiAssistantPanelProps {
  theme: DexCodeTheme;
  activeCode: string;
  activeLanguage: string;
  onApplyCode: (newCode: string) => void;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  theme,
  activeCode,
  activeLanguage,
  onApplyCode,
}) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runAiAction = async (mode: 'explain' | 'refactor' | 'fix' | 'test' | 'custom') => {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          code: activeCode,
          prompt,
          language: activeLanguage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.text);
      } else {
        setResponse(`Error: ${data.error || 'Gemini API call failed'}`);
      }
    } catch (err: any) {
      setResponse(`Error connecting to DexCode AI Server: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extractCodeBlock = (text: string): string => {
    const match = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    return match ? match[1] : text;
  };

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Header */}
      <div
        className="px-3 py-2 border-b font-bold tracking-wider text-[11px] uppercase flex items-center justify-between"
        style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
      >
        <span className="flex items-center gap-1.5 text-purple-400">
          <Sparkles className="w-3.5 h-3.5" /> DexCode Gemini AI Assistant
        </span>
      </div>

      {/* Action Preset Buttons */}
      <div className="p-3 border-b space-y-2" style={{ borderColor: theme.colors.border }}>
        <div className="text-[10px] text-gray-400 font-bold uppercase">Quick AI Code Actions</div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => runAiAction('explain')}
            disabled={loading}
            className="p-2 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-medium border border-purple-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" /> Explain Code
          </button>

          <button
            onClick={() => runAiAction('refactor')}
            disabled={loading}
            className="p-2 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-medium border border-sky-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" /> Refactor
          </button>

          <button
            onClick={() => runAiAction('fix')}
            disabled={loading}
            className="p-2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-medium border border-amber-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bug className="w-3.5 h-3.5" /> Fix Bugs
          </button>

          <button
            onClick={() => runAiAction('test')}
            disabled={loading}
            className="p-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5" /> Unit Tests
          </button>
        </div>

        {/* Custom prompt input */}
        <div className="relative flex items-center pt-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runAiAction('custom');
            }}
            placeholder="Ask DexCode AI anything..."
            className="w-full bg-black/40 border border-gray-700 rounded pl-2 pr-8 py-1.5 text-xs text-white outline-none focus:border-purple-500"
          />
          <button
            onClick={() => runAiAction('custom')}
            disabled={loading || !prompt.trim()}
            className="absolute right-1.5 p-1 rounded hover:bg-purple-500/30 text-purple-400 disabled:opacity-30 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Response Display Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 font-sans">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-2 text-purple-400">
            <Loader2 className="w-7 h-7 animate-spin" />
            <p className="text-xs font-semibold animate-pulse">DexCode AI is analyzing code...</p>
          </div>
        ) : response ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-purple-400 font-bold uppercase">Gemini Response</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1 text-[10px]"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => onApplyCode(extractCodeBlock(response))}
                  className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px]"
                >
                  Apply to Editor
                </button>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-gray-800 text-gray-200 leading-relaxed font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
              {response}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 space-y-2 text-center">
            <Sparkles className="w-8 h-8 opacity-30 text-purple-400" />
            <p className="max-w-xs text-xs">
              Select an action above or type a prompt to generate, refactor, or explain code in your active editor file.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
