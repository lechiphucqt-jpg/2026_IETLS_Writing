import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Upload,
  FileText,
  ScanText,
  X,
  Eye,
  EyeOff,
  ListChecks,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import type {
  AgentStepStatus,
  BandScores,
  IeltsPrompt,
  OutlineState,
  TaskType,
} from '../types/ielts';
import { countWords, formatDuration } from '../utils/bandParser';
import { Task1Chart } from './Task1Chart';
import { MarkdownReport } from './MarkdownReport';
import { FeedbackPanel } from './FeedbackPanel';
import { AmbientFocus } from './AmbientFocus';

interface WorkspaceProps {
  prompts: IeltsPrompt[];
  activePrompt: IeltsPrompt;
  isCustomPrompt: boolean;
  customTaskType: TaskType;
  customPromptText: string;
  onSelectPromptId: (id: string) => void;
  onToggleCustomPrompt: (custom: boolean) => void;
  onCustomTaskTypeChange: (t: TaskType) => void;
  onCustomPromptTextChange: (text: string) => void;
  outline: OutlineState;
  onOutlineChange: (outline: OutlineState) => void;
  essayText: string;
  onEssayTextChange: (text: string) => void;
  rightMode: 'editor' | 'feedback';
  onRightModeChange: (mode: 'editor' | 'feedback') => void;
  analysisMarkdown: string;
  bandScores: BandScores;
  isAnalyzing: boolean;
  analysisError: string | null;
  agentSteps?: AgentStepStatus[];
  onRunAnalysis: (options?: {
    imageBase64?: string;
    mimeType?: string;
    chartImageBase64?: string;
    chartMimeType?: string;
  }) => void;
  onSaveToHistory: () => void;
  isSaved: boolean;
  onBrowsePrompts: () => void;
}

export function Workspace({
  prompts,
  activePrompt,
  isCustomPrompt,
  customTaskType,
  customPromptText,
  onSelectPromptId,
  onToggleCustomPrompt,
  onCustomTaskTypeChange,
  onCustomPromptTextChange,
  outline,
  onOutlineChange,
  essayText,
  onEssayTextChange,
  rightMode,
  onRightModeChange,
  analysisMarkdown,
  bandScores,
  isAnalyzing,
  analysisError,
  agentSteps,
  onRunAnalysis,
  onSaveToHistory,
  isSaved,
  onBrowsePrompts,
}: WorkspaceProps) {
  const [leftTab, setLeftTab] = useState<'prompt' | 'outline' | 'sample'>('prompt');
  const [revealSample, setRevealSample] = useState(false);
  const [spellCheck, setSpellCheck] = useState(false);
  const [examMode, setExamMode] = useState(false);

  // Exam timer state
  const effectiveTaskType: TaskType = isCustomPrompt ? customTaskType : activePrompt.taskType;
  const defaultSeconds = effectiveTaskType === 'Task 1' ? 20 * 60 : 40 * 60;
  const minWords = effectiveTaskType === 'Task 1' ? 150 : 250;
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [timerRunning, setTimerRunning] = useState(false);

  // Outline evaluation state
  const [outlineFeedback, setOutlineFeedback] = useState('');
  const [isEvaluatingOutline, setIsEvaluatingOutline] = useState(false);
  const [outlineError, setOutlineError] = useState<string | null>(null);

  // Handwritten OCR image state
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [ocrImageBase64, setOcrImageBase64] = useState<string | undefined>(undefined);
  const [ocrMimeType, setOcrMimeType] = useState<string | undefined>(undefined);
  const [ocrFileName, setOcrFileName] = useState<string>('');
  const [isDigitizing, setIsDigitizing] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const ocrInputRef = useRef<HTMLInputElement | null>(null);

  // Custom Task 1 chart upload state
  const [chartPreview, setChartPreview] = useState<string | null>(null);
  const [chartBase64, setChartBase64] = useState<string | undefined>(undefined);
  const [chartMimeType, setChartMimeType] = useState<string | undefined>(undefined);
  const chartInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSecondsLeft(effectiveTaskType === 'Task 1' ? 20 * 60 : 40 * 60);
    setTimerRunning(false);
    setRevealSample(false);
    setOutlineFeedback('');
    setOutlineError(null);
  }, [activePrompt.id, isCustomPrompt, effectiveTaskType]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const wordCount = countWords(essayText);
  const effectivePromptText = isCustomPrompt ? customPromptText : activePrompt.prompt;

  const readFileAsDataUrl = (file: File): Promise<{ dataUrl: string; base64: string; mime: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const commaIdx = result.indexOf(',');
        const base64 = commaIdx >= 0 ? result.slice(commaIdx + 1) : result;
        resolve({ dataUrl: result, base64, mime: file.type || 'image/png' });
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });

  const handleOcrFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrError(null);
    try {
      const { dataUrl, base64, mime } = await readFileAsDataUrl(file);
      setOcrImagePreview(dataUrl);
      setOcrImageBase64(base64);
      setOcrMimeType(mime);
      setOcrFileName(file.name);
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : 'Unable to load image.');
    }
  };

  const handleChartFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, base64, mime } = await readFileAsDataUrl(file);
      setChartPreview(dataUrl);
      setChartBase64(base64);
      setChartMimeType(mime);
    } catch {
      // Ignore invalid image read
    }
  };

  const handleDigitizeToEditor = async () => {
    if (!ocrImageBase64 || !ocrMimeType) return;
    setIsDigitizing(true);
    setOcrError(null);
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: ocrImageBase64,
          mimeType: ocrMimeType,
          taskType: effectiveTaskType,
          promptText: effectivePromptText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OCR digitization failed.');
      }
      if (data.digitizedText) {
        onEssayTextChange(data.digitizedText);
        onRightModeChange('editor');
      }
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : 'OCR request failed.');
    } finally {
      setIsDigitizing(false);
    }
  };

  const handleEvaluateOutline = async () => {
    if (!effectivePromptText.trim()) {
      setOutlineError('Please enter or select a prompt first.');
      return;
    }
    if (
      !outline.introOrThesis.trim() &&
      !outline.body1.trim() &&
      !outline.body2.trim() &&
      !outline.conclusion.trim()
    ) {
      setOutlineError('Please fill in at least one outline section before evaluating.');
      return;
    }

    setIsEvaluatingOutline(true);
    setOutlineError(null);
    try {
      const res = await fetch('/api/evaluate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: effectiveTaskType,
          promptText: effectivePromptText,
          outline,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Outline evaluation failed.');
      }
      setOutlineFeedback(data.feedback);
    } catch (err) {
      setOutlineError(err instanceof Error ? err.message : 'Outline evaluation failed.');
    } finally {
      setIsEvaluatingOutline(false);
    }
  };

  const clearOcrImage = () => {
    setOcrImagePreview(null);
    setOcrImageBase64(undefined);
    setOcrMimeType(undefined);
    setOcrFileName('');
    setOcrError(null);
    if (ocrInputRef.current) ocrInputRef.current.value = '';
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6">
      {/* Workspace Utility Strip (below TopBar) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="flex items-center gap-1 rounded-md bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => onToggleCustomPrompt(false)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                !isCustomPrompt
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Exam Bank
            </button>
            <button
              type="button"
              onClick={() => onToggleCustomPrompt(true)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isCustomPrompt
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Prompt
            </button>
          </div>

          {!isCustomPrompt ? (
            <div className="flex items-center gap-2 text-xs text-slate-600 min-w-0">
              <span className="font-semibold text-emerald-800 whitespace-nowrap">
                {activePrompt.taskType}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[260px] sm:max-w-[360px] font-medium text-slate-800">
                {activePrompt.title}
              </span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline text-slate-500 whitespace-nowrap">
                {activePrompt.category}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-emerald-800">{customTaskType}</span>
              <span aria-hidden="true">·</span>
              <span>Custom Prompt Mode</span>
            </div>
          )}
        </div>

        {/* Exam Timer & Word Counter (Tabular Numerals) */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Words:</span>
            <span
              className={`font-mono font-semibold tabular-nums ${
                wordCount >= minWords ? 'text-emerald-700' : 'text-slate-900'
              }`}
            >
              {wordCount} / {minWords}
            </span>
            <span className="hidden md:inline text-slate-500">
              {wordCount >= minWords ? '· Target met' : `· ${minWords - wordCount} remaining`}
            </span>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <span
              className={`font-mono text-sm font-semibold tabular-nums ${
                secondsLeft <= 300 ? 'text-amber-700' : 'text-slate-900'
              }`}
            >
              {formatDuration(secondsLeft)}
            </span>
            <button
              type="button"
              onClick={() => setTimerRunning((v) => !v)}
              aria-label={timerRunning ? 'Pause timer' : 'Start timer'}
              className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setSecondsLeft(defaultSeconds);
              }}
              aria-label="Reset timer"
              className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Split-Screen Core Workspace */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        {/* LEFT PANE: Question, Outlining & Reference */}
        <section
          aria-label="Prompt and Outlining Pane"
          className="lg:col-span-5 flex flex-col rounded-lg border border-slate-200 bg-white lg:max-h-[calc(100vh-152px)]"
        >
          {/* Left Pane Segmented Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setLeftTab('prompt')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  leftTab === 'prompt'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Question
              </button>
              <button
                type="button"
                onClick={() => setLeftTab('outline')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  leftTab === 'outline'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Outline Builder
              </button>
              {!isCustomPrompt && (
                <button
                  type="button"
                  onClick={() => setLeftTab('sample')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    leftTab === 'sample'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sample Ref
                </button>
              )}
            </div>

            {!isCustomPrompt && (
              <button
                type="button"
                onClick={onBrowsePrompts}
                className="text-xs font-medium text-emerald-700 hover:underline whitespace-nowrap shrink-0"
              >
                All Prompts
              </button>
            )}
          </div>

          <div className="academic-scroll flex-1 overflow-y-auto p-5 space-y-5">
            {leftTab === 'prompt' && (
              <>
                {!isCustomPrompt ? (
                  <>
                    <div>
                      <label
                        htmlFor="prompt-quick-select"
                        className="block text-xs font-medium text-slate-500 mb-1.5"
                      >
                        Switch Active Question
                      </label>
                      <select
                        id="prompt-quick-select"
                        value={activePrompt.id}
                        onChange={(e) => onSelectPromptId(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                      >
                        {prompts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.taskType} — {p.title} ({p.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-emerald-800">{activePrompt.taskType}</span>
                        <span aria-hidden="true">·</span>
                        <span>{activePrompt.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {activePrompt.recommendedMinutes} min
                        </span>
                      </div>
                      <p className="font-serif text-[16px] leading-[1.65] text-slate-900">
                        {activePrompt.prompt}
                      </p>
                      <p className="mt-3 border-t border-slate-200 pt-2.5 text-xs text-slate-600">
                        Write at least <span className="font-semibold">{activePrompt.minWords} words</span>. Spend the first 3–5 minutes planning your structure in the Outline Builder.
                      </p>
                    </div>

                    {activePrompt.chartData && <Task1Chart data={activePrompt.chartData} />}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-medium text-slate-600 mb-1.5">
                        Task Type
                      </span>
                      <div className="inline-flex rounded-lg bg-slate-100 p-1">
                        {(['Task 2', 'Task 1'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => onCustomTaskTypeChange(t)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                              customTaskType === t
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="custom-prompt-input"
                        className="block text-xs font-medium text-slate-600 mb-1.5"
                      >
                        Enter IELTS Question / Prompt
                      </label>
                      <textarea
                        id="custom-prompt-input"
                        rows={5}
                        value={customPromptText}
                        onChange={(e) => onCustomPromptTextChange(e.target.value)}
                        placeholder="Paste your IELTS Writing Task 1 or Task 2 question here..."
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                      />
                    </div>

                    {customTaskType === 'Task 1' && (
                      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-slate-700">
                            Optional: Attach Task 1 Chart / Diagram Image
                          </span>
                          <input
                            ref={chartInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleChartFileChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => chartInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload Chart</span>
                          </button>
                        </div>
                        {chartPreview && (
                          <div className="mt-3 relative">
                            <img
                              src={chartPreview}
                              alt="Uploaded Task 1 chart"
                              referrerPolicy="no-referrer"
                              className="max-h-48 w-full rounded border border-slate-200 object-contain bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setChartPreview(null);
                                setChartBase64(undefined);
                                setChartMimeType(undefined);
                              }}
                              aria-label="Remove chart image"
                              className="absolute right-2 top-2 rounded-md bg-white/90 p-1 text-slate-600 border border-slate-200 hover:text-red-700"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {leftTab === 'outline' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Structured Outlining ({effectiveTaskType})
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-600">
                      Lập dàn ý trước khi viết giúp tối ưu Task Response và Coherence & Cohesion.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEvaluateOutline}
                    disabled={isEvaluatingOutline}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0"
                  >
                    <ListChecks className="h-3.5 w-3.5" />
                    <span>{isEvaluatingOutline ? 'Reviewing...' : 'Evaluate Outline'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {effectiveTaskType === 'Task 1'
                        ? '1. Paraphrase & Key Overview (2 Main Trends)'
                        : '1. Introduction & Thesis Statement'}
                    </label>
                    <textarea
                      rows={2}
                      value={outline.introOrThesis}
                      onChange={(e) =>
                        onOutlineChange({ ...outline, introOrThesis: e.target.value })
                      }
                      placeholder={
                        effectiveTaskType === 'Task 1'
                          ? 'Overall upward trend in..., highest vs lowest...'
                          : 'Paraphrase topic + clear personal stance...'
                      }
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {effectiveTaskType === 'Task 1'
                        ? '2. Body Paragraph 1 (Data Group A)'
                        : '2. Body Paragraph 1 (Main Idea + Explanation + Example)'}
                    </label>
                    <textarea
                      rows={3}
                      value={outline.body1}
                      onChange={(e) => onOutlineChange({ ...outline, body1: e.target.value })}
                      placeholder="Topic sentence + supporting reasoning / key data figures..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {effectiveTaskType === 'Task 1'
                        ? '3. Body Paragraph 2 (Data Group B)'
                        : '3. Body Paragraph 2 (Main Idea + Explanation + Example)'}
                    </label>
                    <textarea
                      rows={3}
                      value={outline.body2}
                      onChange={(e) => onOutlineChange({ ...outline, body2: e.target.value })}
                      placeholder="Contrasting / reinforcing argument + specific evidence..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {effectiveTaskType === 'Task 1'
                        ? '4. Optional Closing / Key Comparisons Note'
                        : '4. Conclusion (Restate Thesis + Final Insight)'}
                    </label>
                    <textarea
                      rows={2}
                      value={outline.conclusion}
                      onChange={(e) =>
                        onOutlineChange({ ...outline, conclusion: e.target.value })
                      }
                      placeholder="Synthesize main arguments without adding new claims..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {outlineError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {outlineError}
                  </p>
                )}

                {outlineFeedback && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
                    <div className="mb-2 text-xs font-semibold text-emerald-800">
                      Outline Feedback (TR & CC Advisor)
                    </div>
                    <MarkdownReport content={outlineFeedback} />
                  </div>
                )}
              </div>
            )}

            {leftTab === 'sample' && !isCustomPrompt && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Topic Academic Collocations
                  </h3>
                  <ul className="mt-2.5 divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {activePrompt.sampleCollocations.map((col) => (
                      <li key={col.phrase} className="px-3.5 py-2.5 text-sm">
                        <div className="font-medium text-emerald-950">{col.phrase}</div>
                        <div className="text-xs text-slate-600">{col.meaningVi}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      Band 8.5 Model Essay Reference
                    </span>
                    <button
                      type="button"
                      onClick={() => setRevealSample((v) => !v)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      {revealSample ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Hide Essay</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Reveal Essay</span>
                        </>
                      )}
                    </button>
                  </div>

                  {revealSample ? (
                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-800">
                      {activePrompt.sampleEssay.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                      <p className="border-t border-slate-200 pt-2.5 text-xs text-slate-600">
                        {activePrompt.examinerNotes}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Keep hidden while drafting to simulate authentic exam conditions, or reveal anytime to compare structure and phrasing.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANE: Essay Editor + Handwritten OCR + AI Assessment */}
        <section
          aria-label="Writing Editor and Assessment Pane"
          className="lg:col-span-7 flex flex-col rounded-lg border border-slate-200 bg-white lg:max-h-[calc(100vh-152px)]"
        >
          {/* Right Pane Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => onRightModeChange('editor')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  rightMode === 'editor'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Essay & OCR Editor
              </button>
              <button
                type="button"
                onClick={() => onRightModeChange('feedback')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  rightMode === 'feedback'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AI Assessment {analysisMarkdown ? '· Ready' : ''}
              </button>
            </div>

            {rightMode === 'editor' && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExamMode((v) => !v)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    examMode
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Chế độ thi tập trung không xao nhãng (Distraction-free Exam Mode)"
                >
                  {examMode ? <Minimize2 className="h-3.5 w-3.5 text-amber-700" /> : <Maximize2 className="h-3.5 w-3.5 text-emerald-600" />}
                  <span>{examMode ? 'Thoát Focus' : 'Focus Mode'}</span>
                </button>
                {!isCustomPrompt && (
                  <button
                    type="button"
                    onClick={() => onEssayTextChange(activePrompt.starterDraft)}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                  >
                    Load Band 6.0 Sample Draft
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSpellCheck((v) => !v)}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                >
                  Spellcheck: {spellCheck ? 'On' : 'Off'}
                </button>
                {essayText && (
                  <button
                    type="button"
                    onClick={() => onEssayTextChange('')}
                    className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:text-red-700 whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="academic-scroll relative flex-1 overflow-y-auto p-5">
            <AmbientFocus active={examMode} />
            {rightMode === 'editor' ? (
              <div className="flex flex-col gap-4">
                {/* Handwritten OCR Digitization Strip */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <ScanText className="h-4 w-4 text-emerald-800 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          Handwritten Essay OCR
                        </div>
                        <div className="text-xs text-slate-500">
                          Upload a photo of your handwritten IELTS sheet to digitize with [?] markers or grade directly.
                        </div>
                      </div>
                    </div>

                    <div>
                      <input
                        ref={ocrInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleOcrFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => ocrInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Handwriting</span>
                      </button>
                    </div>
                  </div>

                  {ocrImagePreview && (
                    <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={ocrImagePreview}
                          alt="Handwritten essay preview"
                          referrerPolicy="no-referrer"
                          className="h-14 w-20 rounded border border-slate-200 object-cover bg-white shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-slate-800">
                            {ocrFileName}
                          </div>
                          <div className="text-xs text-slate-500">
                            Ready for OCR digitization or direct Band assessment
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleDigitizeToEditor}
                          disabled={isDigitizing || isAnalyzing}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-50"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>{isDigitizing ? 'Digitizing...' : 'Digitize to Editor'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onRunAnalysis({
                              imageBase64: ocrImageBase64,
                              mimeType: ocrMimeType,
                              chartImageBase64: chartBase64,
                              chartMimeType: chartMimeType,
                            })
                          }
                          disabled={isAnalyzing || isDigitizing}
                          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                        >
                          <span>Analyze Image Directly</span>
                        </button>
                        <button
                          type="button"
                          onClick={clearOcrImage}
                          aria-label="Remove uploaded handwriting image"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {ocrError && (
                    <p className="mt-2 text-xs text-red-700">{ocrError}</p>
                  )}
                </div>

                {/* Main Essay Writing Surface */}
                <div>
                  <label htmlFor="ielts-essay-editor" className="sr-only">
                    IELTS Essay Editor
                  </label>
                  <textarea
                    id="ielts-essay-editor"
                    value={essayText}
                    onChange={(e) => onEssayTextChange(e.target.value)}
                    spellCheck={spellCheck}
                    placeholder={`Begin drafting your ${effectiveTaskType} response here...\n\nTip: Use the Outline Builder on the left to verify your thesis and paragraph logic before writing.`}
                    className="min-h-[380px] w-full resize-y rounded-lg border border-slate-200 bg-white p-5 text-[15.5px] leading-[1.75] text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="text-xs text-slate-500">
                    Bilingual Anh–Việt feedback evaluates TR, CC, LR & GRA on official 0.0–9.0 bands.
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onRunAnalysis({
                        imageBase64: ocrImageBase64,
                        mimeType: ocrMimeType,
                        chartImageBase64: chartBase64,
                        chartMimeType: chartMimeType,
                      })
                    }
                    disabled={isAnalyzing || (!essayText.trim() && !ocrImageBase64)}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                  >
                    {isAnalyzing ? 'Evaluating Response...' : 'Submit for Band Assessment'}
                  </button>
                </div>
              </div>
            ) : (
              <FeedbackPanel
                markdown={analysisMarkdown}
                bandScores={bandScores}
                isAnalyzing={isAnalyzing}
                error={analysisError}
                taskType={effectiveTaskType}
                promptTitle={isCustomPrompt ? 'Custom IELTS Essay' : activePrompt.title}
                promptText={effectivePromptText}
                outline={outline}
                essayText={essayText}
                onSaveToHistory={onSaveToHistory}
                isSaved={isSaved}
                onBackToEditor={() => onRightModeChange('editor')}
                agentSteps={agentSteps}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
