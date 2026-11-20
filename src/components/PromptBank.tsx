import { useMemo, useState, useRef } from 'react';
import {
  Search,
  ArrowRight,
  Upload,
  Plus,
  FileJson,
  FileSpreadsheet,
  Download,
  Trash2,
  CheckCircle2,
  Sparkles,
  X,
  HelpCircle,
  Tag,
  Clock,
} from 'lucide-react';
import type { IeltsPrompt, TaskType } from '../types/ielts';

interface PromptBankProps {
  prompts: IeltsPrompt[];
  activePromptId: string;
  onSelectPrompt: (prompt: IeltsPrompt) => void;
  onImportPrompts?: (newPrompts: IeltsPrompt[]) => void;
  onDeletePrompt?: (id: string) => void;
}

export function PromptBank({
  prompts,
  activePromptId,
  onSelectPrompt,
  onImportPrompts,
  onDeletePrompt,
}: PromptBankProps) {
  const [filter, setFilter] = useState<'All' | TaskType | 'Custom'>('All');
  const [query, setQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Import Modal state
  const [importMode, setImportMode] = useState<'manual' | 'file' | 'smart'>('manual');

  // Manual Form State
  const [manualTaskType, setManualTaskType] = useState<TaskType>('Task 2');
  const [manualTitle, setManualTitle] = useState('');
  const [manualTopic, setManualTopic] = useState('Technology');
  const [manualPrompt, setManualPrompt] = useState('');
  const [manualMinutes, setManualMinutes] = useState(40);
  const [manualMinWords, setManualMinWords] = useState(250);
  const [manualSample, setManualSample] = useState('');
  const [manualCollocations, setManualCollocations] = useState('');

  // File Upload State
  const [fileError, setFileError] = useState<string | null>(null);
  const [parsedPreviewPrompts, setParsedPreviewPrompts] = useState<IeltsPrompt[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Smart Paste State
  const [smartPasteText, setSmartPasteText] = useState('');
  const [smartDetectedTask, setSmartDetectedTask] = useState<TaskType>('Task 2');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prompts.filter((p) => {
      if (filter === 'Custom') {
        if (!p.isCustomImported) return false;
      } else if (filter !== 'All' && p.taskType !== filter) {
        return false;
      }

      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q)
      );
    });
  }, [prompts, filter, query]);

  // Handle Manual Submit
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualPrompt.trim()) return;

    const collocationsList = manualCollocations
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.split(':');
        return {
          phrase: parts[0]?.trim() || line.trim(),
          meaningVi: parts[1]?.trim() || 'Cụm từ học thuật C1/C2',
        };
      });

    const newPrompt: IeltsPrompt = {
      id: `imported-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      taskType: manualTaskType,
      category: manualTaskType === 'Task 1' ? 'Visual Report' : 'Discursive Essay',
      topic: manualTopic.trim() || 'General Academic',
      title: manualTitle.trim(),
      prompt: manualPrompt.trim(),
      recommendedMinutes: manualMinutes || (manualTaskType === 'Task 1' ? 20 : 40),
      minWords: manualMinWords || (manualTaskType === 'Task 1' ? 150 : 250),
      sampleEssay: manualSample.trim() || 'Chưa cung cấp bài viết mẫu.',
      examinerNotes: 'Đề thi do người dùng tự nhập vào hệ thống.',
      sampleCollocations: collocationsList,
      starterDraft: '',
      isCustomImported: true,
    };

    onImportPrompts?.([newPrompt]);
    setShowImportModal(false);
    resetManualForm();
  };

  const resetManualForm = () => {
    setManualTitle('');
    setManualPrompt('');
    setManualSample('');
    setManualCollocations('');
    setParsedPreviewPrompts([]);
    setFileError(null);
    setSmartPasteText('');
  };

  // Handle File Upload (JSON or CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          const validatedPrompts: IeltsPrompt[] = list.map((item, idx) => ({
            id: `imported-json-${Date.now()}-${idx}`,
            taskType: item.taskType === 'Task 1' ? 'Task 1' : 'Task 2',
            category: item.category || (item.taskType === 'Task 1' ? 'Visual Report' : 'Discursive Essay'),
            topic: item.topic || 'General Academic',
            title: item.title || `Imported Prompt #${idx + 1}`,
            prompt: item.prompt || item.text || item.content || '',
            recommendedMinutes: item.recommendedMinutes || (item.taskType === 'Task 1' ? 20 : 40),
            minWords: item.minWords || (item.taskType === 'Task 1' ? 150 : 250),
            sampleEssay: item.sampleEssay || '',
            examinerNotes: item.examinerNotes || 'Imported via JSON.',
            sampleCollocations: Array.isArray(item.sampleCollocations) ? item.sampleCollocations : [],
            starterDraft: item.starterDraft || '',
            isCustomImported: true,
          })).filter((p) => p.prompt.trim().length > 0);

          if (validatedPrompts.length === 0) {
            throw new Error('Tệp JSON không chứa đề thi hợp lệ hoặc thiếu trường "prompt".');
          }
          setParsedPreviewPrompts(validatedPrompts);
        } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          // Basic CSV Parsing (title, taskType, topic, prompt)
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          const promptsFromCsv: IeltsPrompt[] = [];

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
            if (cols.length >= 2) {
              const taskType: TaskType = cols[1]?.toLowerCase().includes('task 1') ? 'Task 1' : 'Task 2';
              promptsFromCsv.push({
                id: `imported-csv-${Date.now()}-${i}`,
                taskType,
                category: taskType === 'Task 1' ? 'Visual Report' : 'Discursive Essay',
                topic: cols[2] || 'General Academic',
                title: cols[0] || `Đề CSV số ${i}`,
                prompt: cols[3] || cols[0] || '',
                recommendedMinutes: taskType === 'Task 1' ? 20 : 40,
                minWords: taskType === 'Task 1' ? 150 : 250,
                sampleEssay: '',
                examinerNotes: 'Imported via CSV file.',
                sampleCollocations: [],
                starterDraft: '',
                isCustomImported: true,
              });
            }
          }
          if (promptsFromCsv.length === 0) {
            throw new Error('Không đọc được đề thi từ tệp CSV. Vui lòng kiểm tra định dạng.');
          }
          setParsedPreviewPrompts(promptsFromCsv);
        } else {
          throw new Error('Chỉ hỗ trợ tệp .json hoặc .csv.');
        }
      } catch (err) {
        setFileError(err instanceof Error ? err.message : 'Lỗi khi đọc tệp tin.');
      }
    };
    reader.readAsText(file);
  };

  // Confirm File Import
  const handleConfirmFileImport = () => {
    if (parsedPreviewPrompts.length === 0) return;
    onImportPrompts?.(parsedPreviewPrompts);
    setShowImportModal(false);
    resetManualForm();
  };

  // Handle Smart Paste
  const handleSmartPasteDetect = () => {
    const raw = smartPasteText.trim();
    if (!raw) return;

    const isT1 =
      raw.toLowerCase().includes('task 1') ||
      raw.toLowerCase().includes('chart') ||
      raw.toLowerCase().includes('graph') ||
      raw.toLowerCase().includes('diagram') ||
      raw.toLowerCase().includes('summarise the information');

    const detectedType: TaskType = isT1 ? 'Task 1' : 'Task 2';
    setSmartDetectedTask(detectedType);

    // Extract title (first line)
    const lines = raw.split('\n').filter((l) => l.trim().length > 0);
    const titleCandidate = lines[0]?.slice(0, 70) || 'Đề thi IELTS Mới';

    const newPrompt: IeltsPrompt = {
      id: `imported-smart-${Date.now()}`,
      taskType: detectedType,
      category: detectedType === 'Task 1' ? 'Visual Report' : 'Discursive Essay',
      topic: 'Smart Paste',
      title: titleCandidate,
      prompt: raw,
      recommendedMinutes: detectedType === 'Task 1' ? 20 : 40,
      minWords: detectedType === 'Task 1' ? 150 : 250,
      sampleEssay: '',
      examinerNotes: 'Imported via Smart Paste.',
      sampleCollocations: [],
      starterDraft: '',
      isCustomImported: true,
    };

    onImportPrompts?.([newPrompt]);
    setShowImportModal(false);
    resetManualForm();
  };

  // Sample JSON Template Download
  const handleDownloadSampleJson = () => {
    const sample = [
      {
        taskType: 'Task 2',
        title: 'Technology and Human Relationships',
        topic: 'Technology',
        prompt: 'Some people believe that modern communication technology is making people more isolated. To what extent do you agree or disagree?',
        recommendedMinutes: 40,
        minWords: 250,
        sampleEssay: '',
        sampleCollocations: [
          { phrase: 'exert a detrimental influence on', meaningVi: 'gây ảnh hưởng xấu' },
          { phrase: 'virtual interactions', meaningVi: 'tương tác ảo' },
        ],
      },
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_ielts_prompts_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-8 sm:px-6">
      {/* Header Banner - Emerald Green & Cream Reference Styling (Image 1 & Image 2) */}
      <div className="rounded-2xl bg-emerald-800 p-6 sm:p-8 text-white shadow-md border border-emerald-900 mb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-emerald-700/80 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-200 border border-emerald-600">
                Cambridge & Authentic Exam Materials
              </span>
              <span className="text-xs text-emerald-300">
                • {prompts.length} đề thi sẵn có
              </span>
            </div>
            <h1 className="font-serif text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              IELTS Academic Prompt Bank
            </h1>
            <p className="mt-2 text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Select an authentic Task 1 visual report or Task 2 academic essay prompt to launch in the split-screen workspace, hoặc nhập thêm đề thi mới của riêng bạn.
            </p>
          </div>

          {/* Action Button: Import Prompts (Request 2) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-sm hover:bg-amber-300 transition-all active:scale-95"
            >
              <Upload className="h-4 w-4" />
              <span>Import Đề Thi Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1">
          {(['All', 'Task 2', 'Task 1', 'Custom'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'All' ? 'Tất Cả Đề' : tab === 'Custom' ? 'Đề Đã Import ⭐' : tab}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo chủ đề, dạng bài, từ khóa..."
            className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
          />
        </div>
      </div>

      {/* Prompts Cards Grid */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-700">Không tìm thấy đề thi phù hợp với bộ lọc.</p>
          <p className="mt-1 text-xs text-slate-500">
            Bạn có thể thử tìm từ khóa khác hoặc nhấn vào nút "Import Đề Thi Mới" ở trên để bổ sung đề.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter('All');
              setQuery('');
            }}
            className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((item) => {
            const isCurrent = item.id === activePromptId;
            return (
              <article
                key={item.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-6 transition-all hover:shadow-md ${
                  isCurrent
                    ? 'border-emerald-600 ring-2 ring-emerald-600/10'
                    : 'border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold text-emerald-800">
                        {item.taskType}
                      </span>
                      <span className="font-semibold text-slate-600">{item.topic}</span>
                      {item.isCustomImported && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                          Custom
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{item.recommendedMinutes} mins</span>
                    </div>
                  </div>

                  <h2 className="font-serif text-lg font-bold text-slate-900 line-clamp-1">
                    {item.title}
                  </h2>

                  <p className="mt-2.5 text-xs sm:text-sm text-slate-700 font-serif leading-relaxed line-clamp-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    "{item.prompt}"
                  </p>

                  {item.sampleCollocations && item.sampleCollocations.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.sampleCollocations.slice(0, 3).map((col, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-emerald-50/80 px-2 py-0.5 text-[11px] font-medium text-emerald-800"
                        >
                          {col.phrase}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="text-xs text-slate-400 font-mono">
                    Tối thiểu {item.minWords} từ
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isCustomImported && onDeletePrompt && (
                      <button
                        type="button"
                        onClick={() => onDeletePrompt(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Xóa đề thi này"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectPrompt(item)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                        isCurrent
                          ? 'bg-emerald-800 text-white'
                          : 'bg-emerald-700 text-white hover:bg-emerald-800'
                      }`}
                    >
                      <span>{isCurrent ? 'Đang Luyện Đề Này' : 'Luyện Viết Ngay'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* IMPORT PROMPTS MODAL (Request 2 Implementation) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    Import Đề Thi IELTS Vào Hệ Thống
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bổ sung đề thi từ Cambridge IELTS, IELTS Liz, hoặc tệp riêng của bạn.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="mt-5 flex gap-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setImportMode('manual')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  importMode === 'manual'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>1. Nhập Bằng Tay (Form)</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode('file')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  importMode === 'file'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileJson className="h-3.5 w-3.5" />
                <span>2. Tải Tệp (JSON/CSV)</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode('smart')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  importMode === 'smart'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>3. Dán Thông Minh (Smart Paste)</span>
              </button>
            </div>

            {/* Mode 1: Manual Form */}
            {importMode === 'manual' && (
              <form onSubmit={handleManualAdd} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Dạng bài (*):</label>
                    <select
                      value={manualTaskType}
                      onChange={(e) => {
                        const t = e.target.value as TaskType;
                        setManualTaskType(t);
                        setManualMinutes(t === 'Task 1' ? 20 : 40);
                        setManualMinWords(t === 'Task 1' ? 150 : 250);
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="Task 2">IELTS Writing Task 2 (Essay)</option>
                      <option value="Task 1">IELTS Writing Task 1 (Report/Chart)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Chủ đề (Topic):</label>
                    <input
                      type="text"
                      value={manualTopic}
                      onChange={(e) => setManualTopic(e.target.value)}
                      placeholder="Ví dụ: Education, Environment, AI..."
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Tiêu đề đề bài (*):</label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ví dụ: Impact of Artificial Intelligence on Employment"
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Nội dung đề bài (*):</label>
                  <textarea
                    required
                    rows={4}
                    value={manualPrompt}
                    onChange={(e) => setManualPrompt(e.target.value)}
                    placeholder="Dán toàn văn đề bài IELTS vào đây (ví dụ: Some people believe that... To what extent do you agree or disagree?)..."
                    className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-serif leading-relaxed focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Bài viết mẫu Band 8.5+ (Tùy chọn):
                  </label>
                  <textarea
                    rows={3}
                    value={manualSample}
                    onChange={(e) => setManualSample(e.target.value)}
                    placeholder="Dán bài mẫu nếu có để tham khảo đối chiếu..."
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-serif focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Collocations học thuật (Tùy chọn - mỗi dòng 1 cụm, định dạng `cụm từ : nghĩa`):
                  </label>
                  <textarea
                    rows={2}
                    value={manualCollocations}
                    onChange={(e) => setManualCollocations(e.target.value)}
                    placeholder="mitigate environmental impacts : giảm thiểu tác động môi trường&#10;exert pressure on : tạo áp lực lên"
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm"
                  >
                    Lưu & Thêm Vào Kho Đề
                  </button>
                </div>
              </form>
            )}

            {/* Mode 2: File Upload (JSON/CSV) */}
            {importMode === 'file' && (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-8 text-center">
                  <FileJson className="mx-auto h-10 w-10 text-emerald-700" />
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Chọn tệp JSON hoặc CSV chứa danh sách đề thi
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Hỗ trợ tệp <code>.json</code> hoặc <code>.csv</code> chuẩn cấu trúc.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="mt-4 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs"
                    >
                      Chọn Tệp Từ Máy Tính
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadSampleJson}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Tải Tệp JSON Mẫu
                    </button>
                  </div>
                </div>

                {fileError && (
                  <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
                    ⚠️ {fileError}
                  </div>
                )}

                {parsedPreviewPrompts.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-emerald-900">
                        ✓ Đã nhận diện thành công: {parsedPreviewPrompts.length} đề thi
                      </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {parsedPreviewPrompts.map((p, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-white p-2.5 text-xs border border-slate-200 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{p.title}</span>
                            <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
                              {p.taskType}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-600 line-clamp-1 italic">"{p.prompt}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    disabled={parsedPreviewPrompts.length === 0}
                    onClick={handleConfirmFileImport}
                    className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50 shadow-sm"
                  >
                    Xác Nhận Import ({parsedPreviewPrompts.length} đề)
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: Smart Paste */}
            {importMode === 'smart' && (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-200 text-xs text-amber-900">
                  💡 <strong>Hướng dẫn:</strong> Sao chép toàn bộ nội dung đề bài tiếng Anh từ sách Cambridge IELTS hoặc các trang luyện thi và dán vào bên dưới. Hệ thống sẽ tự nhận dạng Task 1 hay Task 2.
                </div>

                <textarea
                  rows={6}
                  value={smartPasteText}
                  onChange={(e) => setSmartPasteText(e.target.value)}
                  placeholder="Dán toàn bộ đề thô vào đây (ví dụ: You should spend about 40 minutes on this task. Write about the following topic...)..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs font-serif leading-relaxed focus:border-emerald-600 focus:outline-none"
                />

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    disabled={!smartPasteText.trim()}
                    onClick={handleSmartPasteDetect}
                    className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50 shadow-sm"
                  >
                    Nhận Diện & Thêm Đề
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
