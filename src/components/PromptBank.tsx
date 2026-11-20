import { useMemo, useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import type { IeltsPrompt, TaskType } from '../types/ielts';

interface PromptBankProps {
  prompts: IeltsPrompt[];
  activePromptId: string;
  onSelectPrompt: (prompt: IeltsPrompt) => void;
}

export function PromptBank({ prompts, activePromptId, onSelectPrompt }: PromptBankProps) {
  const [filter, setFilter] = useState<'All' | TaskType>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prompts.filter((p) => {
      if (filter !== 'All' && p.taskType !== filter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q)
      );
    });
  }, [prompts, filter, query]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-slate-900 sm:text-3xl">
            IELTS Academic Prompt Bank
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Select an authentic Task 1 visual report or Task 2 academic essay prompt to launch in the split-screen workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(['All', 'Task 2', 'Task 1'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'All' ? 'All Prompts' : tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topic or type..."
              className="w-56 rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-700">No prompts match your search.</p>
          <button
            type="button"
            onClick={() => {
              setFilter('All');
              setQuery('');
            }}
            className="mt-3 text-sm font-medium text-blue-800 hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((item) => {
            const isCurrent = item.id === activePromptId;
            return (
              <article
                key={item.id}
                className={`flex flex-col justify-between rounded-lg border bg-white p-5 transition-colors ${
                  isCurrent ? 'border-blue-700' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-blue-900">{item.taskType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{item.recommendedMinutes} min</span>
                  </div>

                  <h2 className="mt-2 font-serif text-lg font-semibold text-slate-900">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">
                    {item.prompt}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    Min {item.minWords} words
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectPrompt(item)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-900 hover:text-blue-700 whitespace-nowrap shrink-0"
                  >
                    <span>{isCurrent ? 'Continue in Workspace' : 'Practice Prompt'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
