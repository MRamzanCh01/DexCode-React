import React, { useState } from 'react';
import { Search, Replace, CaseSensitive, WholeWord, Regex, FileCode, ArrowRight } from 'lucide-react';
import { DexCodeTheme, SearchResult } from '../../types';

interface GlobalSearchProps {
  theme: DexCodeTheme;
  onOpenResult: (filePath: string, line: number) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ theme, onOpenResult }) => {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Perform mock search across workspace
    const mockResults: SearchResult[] = [
      {
        filePath: 'src/App.tsx',
        fileName: 'App.tsx',
        line: 12,
        content: `export default function DexCodeApp() {`,
        matchIndex: 25,
        matchLength: query.length,
      },
      {
        filePath: 'server.ts',
        fileName: 'server.ts',
        line: 28,
        content: `console.log('🚀 DexCode Server listening on http://0.0.0.0:3000');`,
        matchIndex: 12,
        matchLength: query.length,
      },
      {
        filePath: 'README.md',
        fileName: 'README.md',
        line: 1,
        content: `# DexCode - Cross-Platform Code Editor`,
        matchIndex: 2,
        matchLength: query.length,
      },
    ];

    setResults(mockResults);
  };

  return (
    <div className="flex flex-col h-full text-xs select-none">
      <div
        className="px-3 py-2 border-b font-bold tracking-wider text-[11px] uppercase flex items-center justify-between"
        style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
      >
        <span>Search & Replace</span>
        <button
          onClick={() => setIsReplaceOpen(!isReplaceOpen)}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${isReplaceOpen ? 'text-sky-400' : ''}`}
          title="Toggle Replace"
        >
          <Replace className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-2 border-b" style={{ borderColor: theme.colors.border }}>
        {/* Search Input Box */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch();
            }}
            placeholder="Search across workspace..."
            className="w-full bg-black/40 border border-gray-700 rounded pl-2 pr-20 py-1.5 text-xs text-white outline-none focus:border-sky-500"
          />
          <div className="absolute right-1 flex items-center gap-1 text-gray-400">
            <button
              onClick={() => setMatchCase(!matchCase)}
              className={`p-1 rounded hover:text-white ${matchCase ? 'bg-sky-500/30 text-sky-300' : ''}`}
              title="Match Case"
            >
              <CaseSensitive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMatchWholeWord(!matchWholeWord)}
              className={`p-1 rounded hover:text-white ${matchWholeWord ? 'bg-sky-500/30 text-sky-300' : ''}`}
              title="Match Whole Word"
            >
              <WholeWord className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setUseRegex(!useRegex)}
              className={`p-1 rounded hover:text-white ${useRegex ? 'bg-sky-500/30 text-sky-300' : ''}`}
              title="Use Regular Expression"
            >
              <Regex className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Replace Input Box */}
        {isReplaceOpen && (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="Replace with..."
              className="w-full bg-black/40 border border-gray-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-sky-500"
            />
            <button
              className="px-2 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-semibold text-[11px] shrink-0"
            >
              Replace All
            </button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {results.length > 0 ? (
          <div>
            <div className="text-[10px] text-gray-400 font-bold mb-2">
              FOUND {results.length} RESULTS IN WORKSPACE
            </div>
            {results.map((res, idx) => (
              <div
                key={idx}
                onClick={() => onOpenResult(res.filePath, res.line)}
                className="p-2 rounded bg-white/5 hover:bg-sky-500/20 border border-gray-800 hover:border-sky-500/30 cursor-pointer transition-all space-y-1 mb-1.5"
              >
                <div className="flex items-center justify-between text-sky-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" /> {res.fileName}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Ln {res.line}</span>
                </div>
                <div className="font-mono text-[11px] text-gray-300 truncate bg-black/30 p-1 rounded">
                  {res.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 space-y-2">
            <Search className="w-8 h-8 opacity-40" />
            <p>Type to search all files in workspace</p>
          </div>
        )}
      </div>
    </div>
  );
};
