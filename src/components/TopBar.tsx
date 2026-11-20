import { Key, Sparkles, GraduationCap, BookOpen, Layers, History, BarChart3, Dumbbell, Users } from 'lucide-react';
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

const NAV_ITEMS: Array<{ id: NavTab; label: string; icon: any }> = [
  { id: 'workspace', label: 'Workspace', icon: Layers },
  { id: 'prompts', label: 'Prompt Bank', icon: BookOpen },
  { id: 'samples', label: 'Sample Library', icon: BookOpen },
  { id: 'history', label: 'History', icon: History },
  { id: 'analytics', label: 'Analytics (D3)', icon: BarChart3 },
  { id: 'gym', label: 'Writing Gym', icon: Dumbbell },
  { id: 'vocab', label: 'Vocab Bank', icon: BookOpen },
  { id: 'classroom', label: 'Classroom', icon: Users },
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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-xs">
      {/* Primary Brand & Navigation Row (Image 1 top header style) */}
      <div className="mx-auto flex h-16 max-w-[1540px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Group with Green Badge Icon */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('workspace')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            {/* Emerald Green Icon Badge matching Image 1 */}
            <div className="h-10 w-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-800 transition-colors">
              <GraduationCap className="h-6 w-6" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                  IELTS MASTER • ACADEMIC
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400">
                  v2.5
                </span>
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                IELTS Writing Master
              </span>
            </div>
          </button>
        </div>

        {/* Pill Navigation Links (Style matching Image 1: rounded pill tabs) */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onPrimaryAnalyze}
            disabled={isAnalyzing || !canAnalyze}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Analyze Essay</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* High-Contrast Action Banner (Image 1 dark bar style with yellow/gold accent pills) */}
      <div className="bg-[#111827] text-white border-t border-slate-800 px-4 py-2 sm:px-6">
        <div className="mx-auto flex max-w-[1540px] flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Quick Academic Status or Tag */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="rounded-lg bg-amber-400 px-2 py-0.5 font-bold uppercase tracking-wider text-slate-950 text-[10px]">
              CRITERIA
            </span>
            <span className="font-semibold text-slate-200 text-xs hidden sm:inline">
              British Council & IDP Academic Band 0.0 - 9.0
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-emerald-400 font-mono text-[11px]">
              TR • CC • LR • GRA
            </span>
          </div>

          {/* Right: API Key Setting Button (Mandated red/amber reminder from AI_INSTRUCTIONS) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/90 hover:bg-amber-400 px-3 py-1 font-bold text-slate-950 transition-colors shadow-xs"
              title="Cấu hình Google Gemini API Key & Model AI"
            >
              <Key className="h-3.5 w-3.5" />
              <span>Lấy API key để sử dụng app</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
