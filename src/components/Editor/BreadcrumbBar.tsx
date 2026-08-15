import React from 'react';
import { ChevronRight, FileCode, Folder } from 'lucide-react';
import { DexCodeTheme } from '../../types';

interface BreadcrumbBarProps {
  theme: DexCodeTheme;
  path: string;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({ theme, path }) => {
  if (!path) return null;

  const parts = path.split('/').filter(Boolean);

  return (
    <div
      className="flex items-center gap-1.5 px-3 h-6 text-[11px] border-b select-none font-mono text-gray-400"
      style={{
        backgroundColor: theme.colors.editorBackground,
        borderColor: theme.colors.border,
      }}
    >
      <span className="flex items-center gap-1 text-sky-400 font-semibold">
        <Folder className="w-3 h-3" /> DexCode
      </span>
      {parts.map((part, idx) => {
        const isLast = idx === parts.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className={isLast ? 'text-gray-200 font-bold flex items-center gap-1' : 'text-gray-400'}>
              {isLast && <FileCode className="w-3 h-3 text-sky-400" />}
              {part}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};
