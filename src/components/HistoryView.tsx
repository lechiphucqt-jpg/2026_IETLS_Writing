import { Trash2, ArrowUpRight, FileDown, Presentation } from 'lucide-react';
import type { PracticeHistoryItem } from '../types/ielts';
import { exportToPowerPointPresentation, exportToWordDocument } from '../utils/exportEngine';

interface HistoryViewProps {
  items: PracticeHistoryItem[];
  onReopen: (item: PracticeHistoryItem) => void;
  onDelete: (id: string) => void;
  onGoWorkspace: () => void;
}

export function HistoryView({ items, onReopen, onDelete, onGoWorkspace }: HistoryViewProps) {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-serif text-2xl font-semibold text-slate-900 sm:text-3xl">
          Practice History
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Review your saved essays, outlines, and IELTS Writing Master AI evaluations stored in this browser.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-10 text-center">
          <h2 className="font-serif text-lg font-semibold text-slate-900">
            No saved evaluations yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Complete an essay analysis in the Workspace and click &ldquo;Save Attempt&rdquo; to track your progress across TR, CC, LR, and GRA.
          </p>
          <button
            type="button"
            onClick={onGoWorkspace}
            className="mt-5 inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Go to Workspace
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Task & Prompt</th>
                <th className="px-4 py-3 text-right">Words</th>
                <th className="px-4 py-3 text-right">TR</th>
                <th className="px-4 py-3 text-right">CC</th>
                <th className="px-4 py-3 text-right">LR</th>
                <th className="px-4 py-3 text-right">GRA</th>
                <th className="px-4 py-3 text-right">Overall</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-500 tabular-nums whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs font-medium text-emerald-800">{item.taskType}</div>
                    <div className="font-medium text-slate-900 line-clamp-1">
                      {item.promptTitle}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-700 tabular-nums">
                    {item.wordCount}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-700 tabular-nums">
                    {item.bandScores.tr?.toFixed(1) ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-700 tabular-nums">
                    {item.bandScores.cc?.toFixed(1) ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-700 tabular-nums">
                    {item.bandScores.lr?.toFixed(1) ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-700 tabular-nums">
                    {item.bandScores.gra?.toFixed(1) ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-950 tabular-nums">
                    {item.bandScores.overall?.toFixed(1) ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          exportToWordDocument({
                            taskType: item.taskType,
                            promptTitle: item.promptTitle,
                            promptText: item.promptText,
                            essayText: item.essayText,
                            outline: item.outline,
                            wordCount: item.wordCount,
                            bandScores: item.bandScores,
                            analysisMarkdown: item.analysisMarkdown,
                          })
                        }
                        title="Xuất file Word (.doc) có Track Changes"
                        className="rounded-md p-1.5 text-emerald-700 hover:bg-emerald-50"
                      >
                        <FileDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          exportToPowerPointPresentation({
                            taskType: item.taskType,
                            promptTitle: item.promptTitle,
                            promptText: item.promptText,
                            essayText: item.essayText,
                            outline: item.outline,
                            wordCount: item.wordCount,
                            bandScores: item.bandScores,
                            analysisMarkdown: item.analysisMarkdown,
                          })
                        }
                        title="Xuất bài giảng PowerPoint / Slide"
                        className="rounded-md p-1.5 text-amber-800 hover:bg-amber-50"
                      >
                        <Presentation className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onReopen(item)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap"
                      >
                        <span>Review</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        aria-label={`Delete ${item.promptTitle}`}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
