import { Key, Sparkles } from 'lucide-react';
import type { NavTab } from '../types/ielts';

interface TopBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onPrimaryAnalyze: () => void;
  isAnalyzing: boolean;
  canAnalyze: boolean;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

const NAV_ITEMS: Array<{ id: NavTab; label: string }> = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'prompts', label: 'Prompt Bank' },
  { id: 'samples', label: 'Sample Library' },
  { id: 'history', label: 'History' },
  { id: 'analytics', label: 'Analytics (D3)' },
  { id: 'gym', label: 'Writing Gym' },
  { id: 'vocab', label: 'Vocab Vault' },
  { id: 'classroom', label: 'Classroom' },
];

export function TopBar({
  activeTab,
  onSelectTab,
  onPrimaryAnalyze,
  isAnalyzing,
  canAnalyze,
  onOpenSettings,
  hasApiKey,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('workspace')}
          className="font-serif text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 rounded-sm"
        >
          IELTS Writing Master
        </button>

        {/* Zone 2: Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  isActive
                    ? 'text-blue-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-800"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Settings with red reminder & Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Settings Button with Red Prompt Text */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="group flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1.5 transition-all hover:bg-red-100"
            title="Cấu hình Google Gemini API Key & Model AI"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
              <Key className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Lấy API key để sử dụng app</span>
              <span className="md:hidden">API Key</span>
            </div>
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onPrimaryAnalyze}
            disabled={isAnalyzing || !canAnalyze}
            className="inline-flex items-center justify-center rounded-lg bg-blue-900 px-3.5 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 shadow-xs"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                Analyzing...
              </span>
            ) : (
              'Analyze Essay'
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
