import { useEffect, useMemo, useState } from 'react';
import { IELTS_PROMPTS } from './data/ieltsPrompts';
import type {
  AgentStepStatus,
  BandScores,
  IeltsPrompt,
  NavTab,
  OutlineState,
  PracticeHistoryItem,
  TaskType,
} from './types/ielts';
import { countWords, parseBandScoresFromMarkdown } from './utils/bandParser';
import { TopBar } from './components/TopBar';
import { Workspace } from './components/Workspace';
import { PromptBank } from './components/PromptBank';
import { SampleLibrary } from './components/SampleLibrary';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { WritingGym } from './components/WritingGym';
import { VocabularyBank } from './components/VocabularyBank';
import { ClassroomView } from './components/ClassroomView';
import { SettingsModal } from './components/SettingsModal';
import { getStoredAiSettings, runMultiAgentAnalysis } from './utils/geminiAi';

const HISTORY_STORAGE_KEY = 'ielts_writing_master_history_v1';

const EMPTY_OUTLINE: OutlineState = {
  introOrThesis: '',
  body1: '',
  body2: '',
  conclusion: '',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('workspace');
  const [activePromptId, setActivePromptId] = useState<string>(IELTS_PROMPTS[0].id);
  const [isCustomPrompt, setIsCustomPrompt] = useState(false);
  const [customTaskType, setCustomTaskType] = useState<TaskType>('Task 2');
  const [customPromptText, setCustomPromptText] = useState('');

  const [outline, setOutline] = useState<OutlineState>(EMPTY_OUTLINE);
  const [essayText, setEssayText] = useState('');
  const [rightMode, setRightMode] = useState<'editor' | 'feedback'>('editor');

  const [analysisMarkdown, setAnalysisMarkdown] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [agentSteps, setAgentSteps] = useState<AgentStepStatus[]>([]);

  // Settings & API Key modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => Boolean(getStoredAiSettings().apiKey));

  const [history, setHistory] = useState<PracticeHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PracticeHistoryItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota errors
    }
  }, [history]);

  const activePrompt = useMemo(
    () => IELTS_PROMPTS.find((p) => p.id === activePromptId) ?? IELTS_PROMPTS[0],
    [activePromptId],
  );

  const bandScores: BandScores = useMemo(
    () => parseBandScoresFromMarkdown(analysisMarkdown),
    [analysisMarkdown],
  );

  const effectiveTaskType: TaskType = isCustomPrompt ? customTaskType : activePrompt.taskType;
  const effectivePromptText = isCustomPrompt ? customPromptText : activePrompt.prompt;

  const handleSelectPromptFromBank = (prompt: IeltsPrompt) => {
    setIsCustomPrompt(false);
    setActivePromptId(prompt.id);
    setOutline(EMPTY_OUTLINE);
    setEssayText('');
    setAnalysisMarkdown('');
    setAnalysisError(null);
    setIsSaved(false);
    setRightMode('editor');
    setActiveTab('workspace');
  };

  const handleGoWorkspaceWithCustomPrompt = (promptText: string, taskType: TaskType) => {
    setIsCustomPrompt(true);
    setCustomTaskType(taskType);
    setCustomPromptText(promptText);
    setOutline(EMPTY_OUTLINE);
    setEssayText('');
    setAnalysisMarkdown('');
    setAnalysisError(null);
    setIsSaved(false);
    setRightMode('editor');
    setActiveTab('workspace');
  };

  const handleRunAnalysis = async (options?: {
    imageBase64?: string;
    mimeType?: string;
    chartImageBase64?: string;
    chartMimeType?: string;
  }) => {
    if (!effectivePromptText.trim()) {
      setActiveTab('workspace');
      setRightMode('feedback');
      setAnalysisError('Vui lòng chọn hoặc nhập đề thi IELTS trước khi phân tích.');
      return;
    }

    if (!essayText.trim() && !options?.imageBase64) {
      setActiveTab('workspace');
      setRightMode('editor');
      return;
    }

    setActiveTab('workspace');
    setRightMode('feedback');
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisMarkdown('');
    setIsSaved(false);

    try {
      const result = await runMultiAgentAnalysis({
        taskType: effectiveTaskType,
        promptText: effectivePromptText,
        outline,
        essayText,
        imageBase64: options?.imageBase64,
        mimeType: options?.mimeType,
        chartImageBase64: options?.chartImageBase64,
        chartMimeType: options?.chartMimeType,
        onStepUpdate: (steps) => {
          setAgentSteps(steps);
        },
        onStreamContent: (accumulated) => {
          setAnalysisMarkdown(accumulated);
        },
      });

      setAnalysisMarkdown(result.fullMarkdown);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Quá trình phân tích bài viết gặp lỗi.';
      setAnalysisError(msg);
      // If error indicates key or quota issue, prompt user to check settings
      if (msg.includes('API key') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        // Do not force-open modal immediately, keep error banner with button
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!analysisMarkdown || isSaved) return;
    const item: PracticeHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      promptId: isCustomPrompt ? 'custom' : activePrompt.id,
      promptTitle: isCustomPrompt
        ? customPromptText.slice(0, 72) || 'Custom IELTS Prompt'
        : activePrompt.title,
      taskType: effectiveTaskType,
      promptText: effectivePromptText,
      essayText,
      outline,
      wordCount: countWords(essayText),
      analysisMarkdown,
      bandScores,
    };
    setHistory((prev) => [item, ...prev]);
    setIsSaved(true);
  };

  const handleReopenHistory = (item: PracticeHistoryItem) => {
    if (item.promptId === 'custom') {
      setIsCustomPrompt(true);
      setCustomTaskType(item.taskType);
      setCustomPromptText(item.promptText);
    } else {
      setIsCustomPrompt(false);
      setActivePromptId(item.promptId);
    }
    setOutline(item.outline);
    setEssayText(item.essayText);
    setAnalysisMarkdown(item.analysisMarkdown);
    setAnalysisError(null);
    setIsSaved(true);
    setRightMode('feedback');
    setActiveTab('workspace');
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onPrimaryAnalyze={() => handleRunAnalysis()}
        isAnalyzing={isAnalyzing}
        canAnalyze={Boolean(essayText.trim()) || Boolean(effectivePromptText.trim())}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={hasApiKey}
      />

      <main>
        {activeTab === 'workspace' && (
          <Workspace
            prompts={IELTS_PROMPTS}
            activePrompt={activePrompt}
            isCustomPrompt={isCustomPrompt}
            customTaskType={customTaskType}
            customPromptText={customPromptText}
            onSelectPromptId={(id) => {
              setActivePromptId(id);
              setOutline(EMPTY_OUTLINE);
              setAnalysisMarkdown('');
              setAnalysisError(null);
              setIsSaved(false);
            }}
            onToggleCustomPrompt={(custom) => {
              setIsCustomPrompt(custom);
              setAnalysisMarkdown('');
              setAnalysisError(null);
              setIsSaved(false);
            }}
            onCustomTaskTypeChange={setCustomTaskType}
            onCustomPromptTextChange={setCustomPromptText}
            outline={outline}
            onOutlineChange={setOutline}
            essayText={essayText}
            onEssayTextChange={(val) => {
              setEssayText(val);
              setIsSaved(false);
            }}
            rightMode={rightMode}
            onRightModeChange={setRightMode}
            analysisMarkdown={analysisMarkdown}
            bandScores={bandScores}
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
            agentSteps={agentSteps}
            onRunAnalysis={handleRunAnalysis}
            onSaveToHistory={handleSaveToHistory}
            isSaved={isSaved}
            onBrowsePrompts={() => setActiveTab('prompts')}
          />
        )}

        {activeTab === 'prompts' && (
          <PromptBank
            prompts={IELTS_PROMPTS}
            activePromptId={activePrompt.id}
            onSelectPrompt={handleSelectPromptFromBank}
          />
        )}

        {activeTab === 'samples' && (
          <SampleLibrary
            prompts={IELTS_PROMPTS}
            onPracticePrompt={handleSelectPromptFromBank}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            items={history}
            onReopen={handleReopenHistory}
            onDelete={handleDeleteHistory}
            onGoWorkspace={() => setActiveTab('workspace')}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            history={history}
            onGoWorkspace={() => setActiveTab('workspace')}
          />
        )}

        {activeTab === 'gym' && <WritingGym />}

        {activeTab === 'vocab' && <VocabularyBank />}

        {activeTab === 'classroom' && (
          <ClassroomView
            onGoWorkspaceWithPrompt={(prompt, taskType) => {
              handleGoWorkspaceWithCustomPrompt(prompt, taskType);
            }}
          />
        )}
      </main>

      {/* Settings Modal (API Key & Model Selection) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={() => {
          setHasApiKey(Boolean(getStoredAiSettings().apiKey));
        }}
      />
    </div>
  );
}
