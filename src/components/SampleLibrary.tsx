import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { IeltsPrompt } from '../types/ielts';
import { Task1Chart } from './Task1Chart';

interface SampleLibraryProps {
  prompts: IeltsPrompt[];
  onPracticePrompt: (prompt: IeltsPrompt) => void;
}

export function SampleLibrary({ prompts, onPracticePrompt }: SampleLibraryProps) {
  const [selectedId, setSelectedId] = useState(prompts[0]?.id ?? '');
  const selected = prompts.find((p) => p.id === selectedId) ?? prompts[0];

  if (!selected) return null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-serif text-2xl font-semibold text-slate-900 sm:text-3xl">
          Band 8.5+ Sample Reference Library
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Examine high-band academic structure, topic-specific collocations, and examiner commentary for every prompt.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Topic Index */}
        <div className="lg:col-span-4 space-y-2">
          {prompts.map((item) => {
            const active = item.id === selected.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                  active
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-emerald-800">{item.taskType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.category}</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{item.title}</div>
              </button>
            );
          })}
        </div>

        {/* Right Full Model Essay */}
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-emerald-800">{selected.taskType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selected.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selected.topic}</span>
                </div>
                <h2 className="mt-1 font-serif text-xl font-semibold text-slate-900">
                  {selected.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onPracticePrompt(selected)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-800 whitespace-nowrap shrink-0"
              >
                <span>Practice This Topic</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
              {selected.prompt}
            </div>

            {selected.chartData && (
              <div className="mt-4">
                <Task1Chart data={selected.chartData} />
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">Band 8.5 Model Essay</h3>
              <div className="mt-3 space-y-4 text-[15px] leading-[1.75] text-slate-800">
                {selected.sampleEssay.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-900">Examiner Benchmark Notes</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                {selected.examinerNotes}
              </p>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Key Academic Collocations (English & Vietnamese)
              </h3>
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
                      <th className="px-3.5 py-2.5">Collocation / Phrase</th>
                      <th className="px-3.5 py-2.5">Nghĩa học thuật (Tiếng Việt)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selected.sampleCollocations.map((col) => (
                      <tr key={col.phrase}>
                        <td className="px-3.5 py-2.5 font-medium text-emerald-950">{col.phrase}</td>
                        <td className="px-3.5 py-2.5 text-slate-700">{col.meaningVi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
