import React, { useRef, useEffect, useState, Component, ErrorInfo } from 'react';
import MonacoEditor, { DiffEditor, useMonaco } from '@monaco-editor/react';
import { TabItem, DexCodeSettings, DexCodeTheme } from '../../types';
import { TabBar } from './TabBar';
import { BreadcrumbBar } from './BreadcrumbBar';
import { Code2, AlertTriangle, FileCode } from 'lucide-react';

interface EditorContainerProps {
  theme: DexCodeTheme;
  settings: DexCodeSettings;
  tabs: TabItem[];
  activeTab: TabItem | null;
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onContentChange: (content: string) => void;
  onCursorChange: (line: number, col: number) => void;
  onSaveFile: () => void;
  isDiffMode?: boolean;
  diffOriginal?: string;
  diffModified?: string;
}

// React Error Boundary to catch Monaco CDN or initialization failures
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class MonacoErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Monaco Editor Initialization Error caught by DexCode Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Lightweight, resilient Code Textarea fallback when Monaco CDN is unreachable
interface FallbackEditorProps {
  value: string;
  onChange: (val: string) => void;
  onCursorChange: (line: number, col: number) => void;
  onSaveFile: () => void;
  settings: DexCodeSettings;
  theme: DexCodeTheme;
}

const FallbackCodeEditor: React.FC<FallbackEditorProps> = ({
  value,
  onChange,
  onCursorChange,
  onSaveFile,
  settings,
  theme,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = value.split('\n');
  const lineCount = lines.length;

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSelectionChange = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart || 0;
    const textUpToCursor = value.substring(0, pos);
    const line = textUpToCursor.split('\n').length;
    const lastLineBreak = textUpToCursor.lastIndexOf('\n');
    const col = pos - (lastLineBreak === -1 ? 0 : lastLineBreak + 1) + 1;
    onCursorChange(line, col);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      onSaveFile();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!textareaRef.current) return;
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const spaces = ' '.repeat(settings.tabSize || 2);
      const newValue = value.substring(0, start) + spaces + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + spaces.length;
        }
      }, 0);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden font-mono text-xs relative select-none" style={{ backgroundColor: theme.colors.editorBackground }}>
      {/* Line Numbers Column */}
      <div
        ref={lineNumbersRef}
        className="w-12 py-3 pr-3 text-right overflow-hidden select-none border-r border-gray-800 shrink-0 text-gray-500 bg-black/20"
        style={{ fontSize: `${settings.fontSize}px`, lineHeight: '1.5rem' }}
      >
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Main Code Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyUp={handleSelectionChange}
        onClick={handleSelectionChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="flex-1 h-full w-full p-3 bg-transparent outline-none resize-none overflow-auto font-mono text-gray-100 whitespace-pre"
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: '1.5rem',
          color: theme.colors.textPrimary,
          tabSize: settings.tabSize || 2,
        }}
      />
    </div>
  );
};

export const EditorContainer: React.FC<EditorContainerProps> = ({
  theme,
  settings,
  tabs,
  activeTab,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onContentChange,
  onCursorChange,
  onSaveFile,
  isDiffMode = false,
  diffOriginal = '',
  diffModified = '',
}) => {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const [monacoFailed, setMonacoFailed] = useState(false);

  // Define custom Monaco themes to match DexCode active theme
  useEffect(() => {
    if (!monaco) return;

    try {
      monaco.editor.defineTheme('dexcode-monaco-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
          { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
          { token: 'string', foreground: 'ce9178' },
          { token: 'type', foreground: '4ec9b0' },
          { token: 'function', foreground: 'dcdcaa' },
        ],
        colors: {
          'editor.background': theme.colors.editorBackground,
          'editor.foreground': theme.colors.textPrimary,
          'editor.lineHighlightBackground': theme.colors.lineHighlight,
          'editorCursor.foreground': theme.colors.accent,
          'editor.selectionBackground': theme.colors.selection,
        },
      });

      monaco.editor.setTheme('dexcode-monaco-dark');
    } catch (err) {
      console.warn('Monaco theme setup fallback', err);
    }
  }, [monaco, theme]);

  const handleEditorMount = (editor: any, monacoInstance: any) => {
    editorRef.current = editor;

    // Track cursor position changes
    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange(e.position.lineNumber, e.position.column);
    });

    // Custom Save Keybinding (Ctrl+S / Cmd+S)
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      onSaveFile();
    });
  };

  const fallbackEditor = activeTab ? (
    <FallbackCodeEditor
      value={activeTab.content}
      onChange={onContentChange}
      onCursorChange={onCursorChange}
      onSaveFile={onSaveFile}
      settings={settings}
      theme={theme}
    />
  ) : null;

  return (
    <div
      className="flex flex-col flex-1 h-full overflow-hidden"
      style={{ backgroundColor: theme.colors.editorBackground }}
    >
      {/* Multi-Tab Navigation Bar */}
      <TabBar
        theme={theme}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={onSelectTab}
        onCloseTab={onCloseTab}
        onNewTab={onNewTab}
      />

      {/* Breadcrumb Path Bar */}
      {activeTab && <BreadcrumbBar theme={theme} path={activeTab.path} />}

      {/* Editor Body */}
      <div className="flex-1 relative overflow-hidden">
        {isDiffMode ? (
          <MonacoErrorBoundary fallback={fallbackEditor}>
            <DiffEditor
              height="100%"
              language={activeTab?.language || 'typescript'}
              original={diffOriginal}
              modified={diffModified}
              theme="dexcode-monaco-dark"
              options={{
                fontSize: settings.fontSize,
                fontFamily: settings.fontFamily,
                renderSideBySide: true,
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          </MonacoErrorBoundary>
        ) : activeTab ? (
          monacoFailed ? (
            fallbackEditor
          ) : (
            <MonacoErrorBoundary fallback={fallbackEditor}>
              <MonacoEditor
                height="100%"
                language={activeTab.language}
                value={activeTab.content}
                theme="dexcode-monaco-dark"
                onChange={(val) => onContentChange(val || '')}
                onMount={handleEditorMount}
                loading={
                  <div className="flex flex-col items-center justify-center h-full space-y-2 text-sky-400 font-mono text-xs">
                    <Code2 className="w-6 h-6 animate-spin" />
                    <span>Loading DexCode Monaco Core...</span>
                  </div>
                }
                options={{
                  fontSize: settings.fontSize,
                  fontFamily: settings.fontFamily,
                  tabSize: settings.tabSize,
                  insertSpaces: settings.insertSpaces,
                  wordWrap: settings.wordWrap,
                  minimap: { enabled: settings.minimap },
                  lineNumbers: settings.lineNumbers,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </MonacoErrorBoundary>
          )
        ) : (
          /* Empty Workspace Welcome Screen */
          <div className="flex flex-col items-center justify-center h-full text-center select-none space-y-4 p-6">
            <div className="p-4 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Code2 className="w-12 h-12 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black tracking-wide text-white">DexCode Editor</h2>
              <p className="text-xs text-gray-400 max-w-sm">
                A cross-platform desktop & web code editor. Open a file from the explorer or create a new tab to start coding.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onNewTab}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
              >
                New Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

