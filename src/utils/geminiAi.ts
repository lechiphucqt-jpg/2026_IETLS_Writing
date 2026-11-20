import type {
  AgentStepId,
  AgentStepStatus,
  AiSettings,
  BandScores,
  GeminiModelId,
  OutlineState,
  TaskType,
} from '../types/ielts';
import { parseBandScoresFromMarkdown } from './bandParser';

export const API_KEY_STORAGE_KEY = 'ielts_writing_api_key';
export const MODEL_STORAGE_KEY = 'ielts_writing_selected_model';

export const AVAILABLE_MODELS: Array<{
  id: GeminiModelId;
  name: string;
  badge: string;
  description: string;
  isDefault?: boolean;
}> = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    badge: 'Mặc định (Khuyên dùng)',
    description: 'Tốc độ phản hồi cực nhanh, độ trễ thấp, tối ưu chi phí và hạn ngạch quota.',
    isDefault: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    badge: 'Chuyên sâu Band 8.5+',
    description: 'Tư duy học thuật sâu, khả năng phân tích ngữ cảnh và chấm điểm khắt khe chuẩn giám khảo.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Dự phòng ổn định',
    description: 'Mô hình bền bỉ, thích hợp chạy fallback dự phòng khi các bản Preview quá tải.',
  },
];

export const FALLBACK_MODELS_SEQUENCE: GeminiModelId[] = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];

export function getStoredAiSettings(): AiSettings {
  try {
    const key = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    const model = (localStorage.getItem(MODEL_STORAGE_KEY) as GeminiModelId) || 'gemini-3-flash-preview';
    return {
      apiKey: key,
      selectedModel: model,
      autoFallback: true,
    };
  } catch {
    return {
      apiKey: '',
      selectedModel: 'gemini-3-flash-preview',
      autoFallback: true,
    };
  }
}

export function saveAiSettings(settings: Partial<AiSettings>): void {
  try {
    if (settings.apiKey !== undefined) {
      localStorage.setItem(API_KEY_STORAGE_KEY, settings.apiKey.trim());
    }
    if (settings.selectedModel !== undefined) {
      localStorage.setItem(MODEL_STORAGE_KEY, settings.selectedModel);
    }
  } catch {
    // Ignore localStorage errors
  }
}

interface MultiAgentRunOptions {
  taskType: TaskType;
  promptText: string;
  outline: OutlineState;
  essayText: string;
  imageBase64?: string;
  mimeType?: string;
  chartImageBase64?: string;
  chartMimeType?: string;
  onStepUpdate?: (steps: AgentStepStatus[]) => void;
  onStreamContent?: (content: string) => void;
}

export async function runMultiAgentAnalysis(options: MultiAgentRunOptions): Promise<{
  fullMarkdown: string;
  bandScores: BandScores;
  steps: AgentStepStatus[];
}> {
  const settings = getStoredAiSettings();
  const apiKey = settings.apiKey.trim();

  // Initial step states
  const steps: AgentStepStatus[] = [
    {
      id: 'ocr',
      name: 'Agent 1: OCR & Input Normalizer',
      roleDescription: 'Số hóa ảnh viết tay hoặc chuẩn hóa văn bản bài làm',
      status: options.imageBase64 ? 'running' : 'success',
      result: options.imageBase64 ? undefined : 'Văn bản nhập trực tiếp',
    },
    {
      id: 'tr_agent',
      name: 'Agent 2: Task Response / Achievement Examiner',
      roleDescription: 'Đánh giá độ sâu luận điểm, trả lời câu hỏi và số liệu',
      status: 'idle',
    },
    {
      id: 'cc_agent',
      name: 'Agent 3: Coherence & Cohesion Specialist',
      roleDescription: 'Phân tích mạch lạc đoạn văn, luồng tư duy và từ nối',
      status: 'idle',
    },
    {
      id: 'lr_gra_agent',
      name: 'Agent 4: Lexical & Grammar Auditor',
      roleDescription: 'Kiểm toán ngữ pháp chi tiết, sửa lỗi và nâng cấp collocations Band 8+',
      status: 'idle',
    },
    {
      id: 'synthesizer_agent',
      name: 'Agent 5: Master Moderator & Score Synthesizer',
      roleDescription: 'Tổng hợp phân tích, quyết định Band điểm và trích xuất bài mẫu',
      status: 'idle',
    },
  ];

  options.onStepUpdate?.([...steps]);

  // If user provided custom API Key, we execute directly via Gemini REST API
  // Otherwise, we call the backend `/api/analyze` proxy
  const modelsToTry = [
    settings.selectedModel,
    ...FALLBACK_MODELS_SEQUENCE.filter((m) => m !== settings.selectedModel),
  ];

  let lastError: Error | null = null;
  let finalMarkdown = '';

  for (let mIndex = 0; mIndex < modelsToTry.length; mIndex++) {
    const currentModel = modelsToTry[mIndex];

    try {
      // Step 2-5 active
      steps[1].status = 'running';
      steps[1].modelUsed = currentModel;
      steps[2].status = 'running';
      steps[2].modelUsed = currentModel;
      steps[3].status = 'running';
      steps[3].modelUsed = currentModel;
      steps[4].status = 'running';
      steps[4].modelUsed = currentModel;
      options.onStepUpdate?.([...steps]);

      if (apiKey) {
        // Direct Client-Side Gemini Call with streaming or generateContent
        finalMarkdown = await callGeminiDirect({
          apiKey,
          model: currentModel,
          taskType: options.taskType,
          promptText: options.promptText,
          outline: options.outline,
          essayText: options.essayText,
          imageBase64: options.imageBase64,
          mimeType: options.mimeType,
          onChunk: (chunk) => {
            options.onStreamContent?.(chunk);
          },
        });
      } else {
        // Backend API proxy call
        finalMarkdown = await callBackendAnalyzeProxy({
          ...options,
          onChunk: (chunk) => {
            options.onStreamContent?.(chunk);
          },
        });
      }

      // If we got here, it succeeded!
      steps[0].status = 'success';
      steps[1].status = 'success';
      steps[2].status = 'success';
      steps[3].status = 'success';
      steps[4].status = 'success';
      options.onStepUpdate?.([...steps]);

      const bandScores = parseBandScoresFromMarkdown(finalMarkdown);
      return {
        fullMarkdown: finalMarkdown,
        bandScores,
        steps,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isLastModel = mIndex === modelsToTry.length - 1;

      // Update failed steps with note
      if (!isLastModel) {
        // Fallback retry
        console.warn(`Model ${currentModel} failed, trying fallback to ${modelsToTry[mIndex + 1]}:`, lastError.message);
      } else {
        // All models failed! Mark remaining steps as "Đã dừng do lỗi" as requested in AI_INSTRUCTIONS.md
        for (let s = 1; s < steps.length; s++) {
          if (steps[s].status !== 'success') {
            steps[s].status = 'failed';
            steps[s].error = `Đã dừng do lỗi: ${lastError.message}`;
          }
        }
        options.onStepUpdate?.([...steps]);
      }
    }
  }

  throw lastError || new Error('All Gemini models exhausted. Please verify your API key and quota.');
}

async function callGeminiDirect(params: {
  apiKey: string;
  model: GeminiModelId;
  taskType: TaskType;
  promptText: string;
  outline: OutlineState;
  essayText: string;
  imageBase64?: string;
  mimeType?: string;
  onChunk?: (accumulated: string) => void;
}): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:streamGenerateContent?alt=sse&key=${params.apiKey}`;

  const promptMessage = `Hãy phân tích bài thi IELTS Writing (${params.taskType}) một cách nghiêm ngặt và toàn diện theo 6 phần chuẩn:
  
ĐỀ BÀI:
${params.promptText}

DÀN Ý CỦA THÍ SINH:
- Intro / Overview: ${params.outline.introOrThesis || '(Không có)'}
- Body 1: ${params.outline.body1 || '(Không có)'}
- Body 2: ${params.outline.body2 || '(Không có)'}
- Conclusion: ${params.outline.conclusion || '(Không có)'}

BÀI VIẾT CỦA THÍ SINH:
${params.essayText || '(Được cung cấp qua ảnh đính kèm)'}

HÃY ĐÁNH GIÁ VÀ XUẤT RA TOÀN BỘ THEO ĐỊNH DẠNG MARKDOWN CHUẨN:
### 📝 PART 1: TEXT DIGITIZATION
${params.imageBase64 ? '(Trích xuất từ ảnh)' : 'Không sử dụng OCR — Bài viết được nhập trực tiếp.'}

### 🏗️ PART 2: OUTLINE ANALYSIS
(Phân tích dàn ý so với yêu cầu đề bài và tính liên kết)

### 🔍 PART 3: DETAILED FEEDBACK & CORRECTIONS
| Câu gốc | Lỗi sai/Vấn đề | Đề xuất sửa đổi (Band 8.0+) | Giải thích |
| :--- | :--- | :--- | :--- |
(Liệt kê các câu cần sửa)

### 💡 PART 4: ACADEMIC ADVISOR (UPGRADING)
* **Lexical Upgrades:** (Ít nhất 3-5 Academic Collocations/Idioms kèm giải thích)
* **Grammar Frontiers:** (Cấu trúc câu nâng cao áp dụng cho bài)
* **Idea Expansion:** (Hướng phát triển luận điểm sâu sắc hơn)

### 🏆 PART 5: ESTIMATED BAND SCORE
* **TR:** [Điểm số] | **CC:** [Điểm số] | **LR:** [Điểm số] | **GRA:** [Điểm số]
* **Overall:** [Điểm tổng]
(Giải thích chi tiết lý do từng tiêu chí)

### 📚 PART 6: SAMPLE REFERENCE
(Trích đoạn hoặc bài mẫu Band 8.5+ tương ứng)`;

  const parts: any[] = [];
  if (params.imageBase64 && params.mimeType) {
    parts.push({
      inline_data: {
        mime_type: params.mimeType,
        data: params.imageBase64,
      },
    });
  }
  parts.push({ text: promptMessage });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Streaming response is unavailable.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let accumulatedMarkdown = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.replace(/^data:\s*/, '');
      if (jsonStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (textChunk) {
          accumulatedMarkdown += textChunk;
          params.onChunk?.(accumulatedMarkdown);
        }
      } catch {
        // ignore incomplete JSON fragment
      }
    }
  }

  return accumulatedMarkdown;
}

async function callBackendAnalyzeProxy(options: MultiAgentRunOptions & {
  onChunk?: (accumulated: string) => void;
}): Promise<string> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      taskType: options.taskType,
      promptText: options.promptText,
      outline: options.outline,
      essayText: options.essayText,
      imageBase64: options.imageBase64,
      mimeType: options.mimeType,
      chartImageBase64: options.chartImageBase64,
      chartMimeType: options.chartMimeType,
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || `Request failed (${response.status})`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Streaming response is unavailable in this browser.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.replace(/^data:\s*/, '');
      try {
        const payload = JSON.parse(jsonStr);
        if (payload.text) {
          accumulated += payload.text;
          options.onChunk?.(accumulated);
        }
      } catch {
        // ignore partial parse
      }
    }
  }

  return accumulated;
}
