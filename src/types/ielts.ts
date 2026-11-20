export type TaskType = 'Task 1' | 'Task 2';

export type NavTab =
  | 'workspace'
  | 'prompts'
  | 'samples'
  | 'history'
  | 'analytics'
  | 'gym'
  | 'vocab'
  | 'classroom';

export type UserRole = 'student' | 'teacher';

export type GeminiModelId =
  | 'gemini-3-flash-preview'
  | 'gemini-3-pro-preview'
  | 'gemini-2.5-flash';

export interface AiSettings {
  apiKey: string;
  selectedModel: GeminiModelId;
  autoFallback: boolean;
}

export interface OutlineState {
  introOrThesis: string;
  body1: string;
  body2: string;
  conclusion: string;
}

export interface BandScores {
  tr: number | null;
  cc: number | null;
  lr: number | null;
  gra: number | null;
  overall: number | null;
}

export interface ChartSeries {
  name: string;
  color: string;
  values: number[];
}

export type Task1ChartData =
  | {
      kind: 'line';
      title: string;
      unit: string;
      xLabels: string[];
      series: ChartSeries[];
    }
  | {
      kind: 'bar';
      title: string;
      unit: string;
      xLabels: string[];
      series: ChartSeries[];
    }
  | {
      kind: 'table';
      title: string;
      headers: string[];
      rows: Array<Array<string | number>>;
    };

export interface IeltsPrompt {
  id: string;
  taskType: TaskType;
  category: string;
  topic: string;
  title: string;
  prompt: string;
  recommendedMinutes: number;
  minWords: number;
  chartData?: Task1ChartData;
  sampleEssay: string;
  examinerNotes: string;
  sampleCollocations: Array<{ phrase: string; meaningVi: string }>;
  starterDraft: string;
}

export interface PracticeHistoryItem {
  id: string;
  createdAt: string;
  promptId: string;
  promptTitle: string;
  taskType: TaskType;
  promptText: string;
  essayText: string;
  outline: OutlineState;
  wordCount: number;
  analysisMarkdown: string;
  bandScores: BandScores;
  // Multi-agent breakdown
  trAnalysis?: string;
  ccAnalysis?: string;
  lrAnalysis?: string;
  graAnalysis?: string;
  // Teacher review
  teacherReviewed?: boolean;
  teacherScoreAdjustment?: number;
  teacherNotes?: string;
}

export interface AdvisorMessage {
  role: 'user' | 'model';
  text: string;
}

// Multi-Agent Pipeline Types
export type AgentStepId = 'ocr' | 'tr_agent' | 'cc_agent' | 'lr_gra_agent' | 'synthesizer_agent';

export interface AgentStepStatus {
  id: AgentStepId;
  name: string;
  roleDescription: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  modelUsed?: string;
  error?: string;
  result?: string;
}

// Vocabulary Bank Types
export interface VocabItem {
  id: string;
  word: string;
  phonetic?: string;
  bandLevel: 'B2' | 'C1' | 'C2';
  definitionVi: string;
  definitionEn: string;
  collocations: string[];
  exampleSentence: string;
  topic: string;
  dateAdded: string;
  mastered: boolean;
}

// Gamification / Writing Gym Types
export interface GymGameStats {
  xp: number;
  streakDays: number;
  lastPlayedDate: string;
  gamesPlayed: number;
  correctAnswers: number;
  unlockedBadgeIds: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'milestone';
  unlockedAt?: string;
}

export interface CollocationGameItem {
  id: string;
  verb: string;
  noun: string;
  meaningVi: string;
  topic: string;
}

export interface SyntaxPuzzleItem {
  id: string;
  targetPattern: string; // e.g., 'Inversion', 'Cleft Sentence', 'Participle Clause'
  fragments: string[];
  correctOrder: string[];
  fullSentence: string;
  explanation: string;
}

// Classroom & Teacher Types (Moodle Compatible)
export interface Classroom {
  id: string;
  name: string;
  code: string;
  teacherName: string;
  createdDate: string;
  moodleCourseId?: string;
}

export interface Assignment {
  id: string;
  classroomId: string;
  promptId: string;
  promptTitle: string;
  taskType: TaskType;
  promptText: string;
  dueDate: string;
  targetBand: number;
  instructions: string;
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  essayText: string;
  outline: OutlineState;
  wordCount: number;
  aiBandScores: BandScores;
  analysisMarkdown: string;
  status: 'pending_review' | 'graded';
  teacherFeedback?: {
    approvedScores: BandScores;
    teacherNotes: string;
    reviewedAt: string;
  };
}
