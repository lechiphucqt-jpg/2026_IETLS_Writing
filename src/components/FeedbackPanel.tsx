import { useState } from 'react';
import {
  Check,
  Copy,
  BookmarkCheck,
  BookmarkPlus,
  Send,
  ArrowLeft,
  FileDown,
  Presentation,
  Sparkles,
  Bot,
  AlertCircle,
} from 'lucide-react';
import type { AdvisorMessage, AgentStepStatus, BandScores, OutlineState, TaskType } from '../types/ielts';
import { MarkdownReport } from './MarkdownReport';
import { exportToPowerPointPresentation, exportToWordDocument } from '../utils/exportEngine';

interface FeedbackPanelProps {
  markdown: string;
  bandScores: BandScores;
  isAnalyzing: boolean;
  error: string | null;
  taskType: TaskType;
  promptTitle?: string;
  promptText: string;
  outline: OutlineState;
  essayText: string;
  onSaveToHistory: () => void;
  isSaved: boolean;
  onBackToEditor: () => void;
  agentSteps?: AgentStepStatus[];
}

function bandDescriptor(score: number | null): string {
  if (score === null) return 'Pending';
  if (score >= 8.5) return 'Very Good / Expert User';
  if (score >= 7.5) return 'Very Good User';
  if (score >= 7.0) return 'Good User';
  if (score >= 6.0) return 'Competent User';
  return 'Modest User';
}

export function FeedbackPanel({
  markdown,
  bandScores,
  isAnalyzing,
  error,
  taskType,
  promptTitle,
  promptText,
  outline,
  essayText,
  onSaveToHistory,
  isSaved,
  onBackToEditor,
  agentSteps = [],
}: FeedbackPanelProps) {
  const [copied, setCopied] = useState(false);
  const [advisorHistory, setAdvisorHistory] = useState<AdvisorMessage[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);

  const handleCopy = async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = () => {
    exportToWordDocument({
      taskType,
      promptTitle: promptTitle || taskType,
      promptText,
      essayText,
      outline,
      wordCount: essayText.trim().split(/\s+/).filter(Boolean).length,
      bandScores,
      analysisMarkdown: markdown,
    });
  };

  const handleExportSlides = () => {
    exportToPowerPointPresentation({
      taskType,
      promptTitle: promptTitle || taskType,
      promptText,
      essayText,
      outline,
      wordCount: essayText.trim().split(/\s+/).filter(Boolean).length,
      bandScores,
      analysisMarkdown: markdown,
    });
  };

  const askAdvisor = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || isAsking) return;
    setAdvisorError(null);
    const nextHistory: AdvisorMessage[] = [...advisorHistory, { role: 'user', text: trimmed }];
    setAdvisorHistory(nextHistory);
    setQuestionInput('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          promptText,
          essayText,
          analysisSummary: markdown,
          history: advisorHistory,
          question: trimmed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to reach Academic Advisor.');
      }
      setAdvisorHistory([...nextHistory, { role: 'model', text: data.reply }]);
    } catch (err) {
      setAdvisorError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setIsAsking(false);
    }
  };

  const quickQuestions = [
    'Mở rộng thêm ý cho Body 2 theo hướng Band 8.0+',
    'Viết lại phần Introduction lên Band 8.5',
    'Gợi ý thêm 5 collocations học thuật cho chủ đề này',
  ];

  const criteriaItems = [
    { label: taskType === 'Task 1' ? 'Task Achievement' : 'Task Response', code: 'TR', value: bandScores.tr },
    { label: 'Coherence & Cohesion', code: 'CC', value: bandScores.cc },
    { label: 'Lexical Resource', code: 'LR', value: bandScores.lr },
    { label: 'Grammar Range & Acc.', code: 'GRA', value: bandScores.gra },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top action strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-3.5 bg-slate-50/50">
        <button
          type="button"
          onClick={onBackToEditor}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại Trình Soạn Thảo</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Word Export Button */}
          <button
            type="button"
            onClick={handleExportWord}
            disabled={!markdown}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-slate-50 disabled:opacity-40 shadow-xs"
            title="Xuất file Word (.docx / .doc) với Track Changes và Comments"
          >
            <FileDown className="h-3.5 w-3.5 text-emerald-600" />
            <span>Xuất Word (.doc)</span>
          </button>

          {/* PowerPoint Export Button */}
          <button
            type="button"
            onClick={handleExportSlides}
            disabled={!markdown}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-slate-50 disabled:opacity-40 shadow-xs"
            title="Xuất Slide PowerPoint / HTML giảng dạy"
          >
            <Presentation className="h-3.5 w-3.5 text-amber-600" />
            <span>Xuất Slide (.pptx)</span>
          </button>

          {/* Copy Report */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!markdown}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
          </button>

          {/* Save to History */}
          <button
            type="button"
            onClick={onSaveToHistory}
            disabled={!markdown || isSaved}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors shadow-xs ${
              isSaved
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-500'
            }`}
          >
            {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
            <span>{isSaved ? 'Đã Lưu Bài' : 'Lưu Lịch Sử'}</span>
          </button>
        </div>
      </div>

      {/* Main Feedback Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Error notification */}
        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-950">Lỗi phân tích hoặc hết hạn ngạch Gemini:</p>
                <p className="mt-1 font-mono text-xs text-red-800">{error}</p>
                <p className="mt-2 text-xs text-red-700">
                  Gợi ý: Nhấp vào nút <strong>"Lấy API key để sử dụng app"</strong> trên thanh điều hướng để nhập API key từ Google AI Studio.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Multi-Agent Steps Status (When Running) */}
        {agentSteps.length > 0 && isAnalyzing && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
              <Bot className="h-4 w-4" />
              Tiến trình Multi-Agent Đang Xử Lý:
            </h4>
            <div className="space-y-2">
              {agentSteps.map((step) => (
                <div key={step.id} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                  <div>
                    <span className="font-semibold text-slate-800">{step.name}</span>
                    <p className="text-[11px] text-slate-500">{step.roleDescription}</p>
                  </div>
                  <div>
                    {step.status === 'running' && (
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                        Đang phân tích...
                      </span>
                    )}
                    {step.status === 'success' && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <Check className="h-3.5 w-3.5" />
                        Hoàn tất
                      </span>
                    )}
                    {step.status === 'failed' && (
                      <span className="font-semibold text-red-600">
                        Đã dừng do lỗi
                      </span>
                    )}
                    {step.status === 'idle' && (
                      <span className="text-slate-400">Đang chờ...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estimated Band Scores Matrix */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official IELTS Assessment
              </span>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-serif text-4xl font-extrabold text-emerald-950">
                  {bandScores.overall !== null ? bandScores.overall.toFixed(1) : isAnalyzing ? '...' : '—'}
                </span>
                <span className="font-medium text-sm text-emerald-800">
                  {bandDescriptor(bandScores.overall)}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Tiêu chuẩn khảo thí British Council & IDP Academic
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {criteriaItems.map((crit) => (
              <div key={crit.code} className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{crit.label}</span>
                <div className="mt-1 font-mono text-2xl font-bold text-slate-900">
                  {crit.value !== null ? crit.value.toFixed(1) : isAnalyzing ? '...' : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Markdown Output */}
        {markdown && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <MarkdownReport content={markdown} />
          </div>
        )}

        {/* Academic Advisor Chat (Post-Analysis) */}
        {markdown && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-emerald-200 pb-3">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h3 className="font-serif text-base font-bold text-emerald-950">
                Hỏi Đáp Chuyên Sâu Cùng Cố Vấn Học Thuật (Academic Advisor)
              </h3>
            </div>

            {/* Quick Prompts */}
            <div className="mt-3 flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => askAdvisor(q)}
                  disabled={isAsking}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-50 font-medium transition-colors shadow-2xs disabled:opacity-50"
                >
                  + {q}
                </button>
              ))}
            </div>

            {/* Chat History */}
            {advisorHistory.length > 0 && (
              <div className="mt-4 space-y-3">
                {advisorHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-700 text-white ml-8 font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 mr-8'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
            )}

            {/* Input Box */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAdvisor(questionInput)}
                placeholder="Đặt câu hỏi cho AI (ví dụ: Viết lại đoạn Conclusion theo văn phong trang trọng hơn)..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs focus:border-emerald-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => askAdvisor(questionInput)}
                disabled={isAsking || !questionInput.trim()}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 shadow-xs flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Gửi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
