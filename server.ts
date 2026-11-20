import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { IELTS_SYSTEM_INSTRUCTION } from './server/systemInstruction.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatErrorMessage(err: unknown): { status: number; message: string } {
  if (err instanceof Error) {
    const msg = err.message || 'Unexpected Gemini API error';
    if (msg.includes('GEMINI_API_KEY')) {
      return {
        status: 500,
        message: 'Gemini API key is missing. Please configure GEMINI_API_KEY in Settings > Secrets.',
      };
    }
    if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
      return {
        status: 403,
        message: 'API key permission denied. Please verify your Gemini API key in Settings > Secrets.',
      };
    }
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      return {
        status: 429,
        message: 'Gemini API rate limit reached. Please wait a moment and try again.',
      };
    }
    return { status: 500, message: msg };
  }
  return { status: 500, message: 'Failed to communicate with IELTS Writing Master AI.' };
}

async function createServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '18mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, model: MODEL_NAME });
  });

  // 1. OCR Digitization Endpoint (Handwritten essay -> Digital text preserving errors + [?] markers)
  app.post('/api/ocr', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType, taskType, promptText } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        taskType?: string;
        promptText?: string;
      };

      if (!imageBase64 || !mimeType) {
        res.status(400).json({ error: 'Please provide an image file for OCR digitization.' });
        return;
      }

      const ai = getAiClient();
      const ocrPrompt = `Nhiệm vụ: Số hóa bài viết tay IELTS (${taskType || 'Writing'}) từ ảnh chụp.
Đề bài tham khảo ngữ cảnh: ${promptText || 'Không cung cấp'}

Yêu cầu nghiêm ngặt:
1. Chuyển đổi chính xác toàn bộ nội dung chữ viết tay thành văn bản tiếng Anh thuần túy.
2. GIỮ NGUYÊN mọi lỗi chính tả, lỗi ngữ pháp, thiếu mạo từ hoặc từ dùng sai của người viết (không tự động sửa lỗi).
3. Nếu có từ viết quá mờ hoặc khó đọc, hãy dự đoán từ hợp lý nhất theo ngữ cảnh và gắn ký hiệu [?] ngay sau từ đó (ví dụ: enviroment[?]).
4. Giữ nguyên cấu trúc phân đoạn (paragraphs) của bài viết.
5. Chỉ trả về phần văn bản đã trích xuất, không thêm lời bình luận hay tiêu đề thừa.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            { text: ocrPrompt },
          ],
        },
        config: {
          systemInstruction: IELTS_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const digitizedText = (response.text ?? '').trim();
      res.json({ digitizedText });
    } catch (err) {
      const formatted = formatErrorMessage(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // 2. Outline Evaluation Endpoint (Task Response + Coherence & Cohesion check before writing)
  app.post('/api/evaluate-outline', async (req: Request, res: Response) => {
    try {
      const { taskType, promptText, outline } = req.body as {
        taskType?: string;
        promptText?: string;
        outline?: {
          introOrThesis?: string;
          body1?: string;
          body2?: string;
          conclusion?: string;
        };
      };

      if (!promptText || !outline) {
        res.status(400).json({ error: 'Prompt and outline content are required.' });
        return;
      }

      const ai = getAiClient();
      const userMessage = `Hãy thực hiện Giai đoạn Dàn ý (Outlining Evaluation) cho đề thi IELTS Writing ${taskType || 'Task 2'} dưới đây.

**Đề bài (Prompt):**
${promptText}

**Dàn ý của thí sinh:**
- Introduction / Thesis (hoặc Overview đối với Task 1): ${outline.introOrThesis || '(Chưa nhập)'}
- Body Paragraph 1: ${outline.body1 || '(Chưa nhập)'}
- Body Paragraph 2: ${outline.body2 || '(Chưa nhập)'}
- Conclusion / Final Summary: ${outline.conclusion || '(Chưa nhập)'}

Hãy đánh giá ngắn gọn, súc tích và mang tính xây dựng cao bằng song ngữ Anh - Việt theo cấu trúc:
1. **Task Response & Relevance:** Dàn ý có trả lời đúng trọng tâm câu hỏi / xu hướng chính chưa? Có bị lạc đề hoặc thiếu vế câu hỏi nào không?
2. **Coherence & Logical Progression:** Luận điểm giữa Body 1 và Body 2 có cân xứng và liên kết chặt chẽ không?
3. **Idea Expansion & Band 8.0+ Upgrade Suggestions:** Đề xuất 2-3 hướng đào sâu lập luận (causes, consequences, counter-arguments, hoặc key data comparisons) kèm 4-5 Academic Collocations tiếng Anh phù hợp để thí sinh sử dụng khi viết bài.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: userMessage,
        config: {
          systemInstruction: IELTS_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      });

      res.json({ feedback: (response.text ?? '').trim() });
    } catch (err) {
      const formatted = formatErrorMessage(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // 3. Full IELTS Writing Master AI 6-Part Assessment (SSE Streaming)
  app.post('/api/analyze', async (req: Request, res: Response) => {
    const {
      taskType,
      promptText,
      outline,
      essayText,
      imageBase64,
      mimeType,
      chartImageBase64,
      chartMimeType,
    } = req.body as {
      taskType?: string;
      promptText?: string;
      outline?: {
        introOrThesis?: string;
        body1?: string;
        body2?: string;
        conclusion?: string;
      };
      essayText?: string;
      imageBase64?: string;
      mimeType?: string;
      chartImageBase64?: string;
      chartMimeType?: string;
    };

    if (!promptText) {
      res.status(400).json({ error: 'Please select or enter an IELTS prompt first.' });
      return;
    }

    if (!essayText?.trim() && !imageBase64) {
      res.status(400).json({ error: 'Please write an essay or upload a handwritten essay image.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (payload: Record<string, unknown>) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    try {
      const ai = getAiClient();

      const hasOutline =
        outline &&
        (outline.introOrThesis?.trim() ||
          outline.body1?.trim() ||
          outline.body2?.trim() ||
          outline.conclusion?.trim());

      const outlineSection = hasOutline
        ? `**Dàn ý của thí sinh:**
- Intro / Thesis / Overview: ${outline?.introOrThesis || '(Trống)'}
- Body 1: ${outline?.body1 || '(Trống)'}
- Body 2: ${outline?.body2 || '(Trống)'}
- Conclusion: ${outline?.conclusion || '(Trống)'}`
        : `**Dàn ý của thí sinh:** Không cung cấp dàn ý riêng — hãy phân tích cấu trúc dàn ý ẩn (implicit structure) trực tiếp từ bài viết của thí sinh trong PART 2.`;

      const parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

      if (chartImageBase64 && chartMimeType) {
        parts.push({
          text: 'Ảnh biểu đồ / sơ đồ đề bài IELTS Task 1 đính kèm:',
        });
        parts.push({
          inlineData: {
            mimeType: chartMimeType,
            data: chartImageBase64,
          },
        });
      }

      if (imageBase64 && mimeType) {
        parts.push({
          text: 'Ảnh chụp bài viết tay của thí sinh cần số hóa (OCR) và chấm điểm:',
        });
        parts.push({
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        });
      }

      const instructionPrompt = `Hãy chấm bài và cố vấn học thuật chuyên sâu cho bài thi **IELTS Writing ${taskType || 'Task 2'}** sau đây, tuân thủ TUYỆT ĐỐI cấu trúc Markdown 6 phần (PART 1 đến PART 6) đã quy định trong System Instruction.

**Đề bài (Prompt):**
${promptText}

${outlineSection}

${
  essayText?.trim()
    ? `**Bài viết của thí sinh (Văn bản):**\n${essayText.trim()}`
    : '**Bài viết của thí sinh:** Hãy trích xuất toàn bộ từ ảnh chụp bài viết tay đính kèm vào PART 1 (giữ nguyên lỗi sai và dùng ký hiệu [?] nếu có từ mờ), sau đó thực hiện đầy đủ PART 2 đến PART 6 dựa trên nội dung đã trích xuất.'
}

Lưu ý quan trọng cho PART 3 (Bảng chi tiết): Hãy phân tích ít nhất 5-8 câu tiêu biểu cần sửa hoặc có thể nâng cấp lên Band 8.0+ trong bài viết.
Lưu ý quan trọng cho PART 5 (Estimated Band Score): Luôn ghi đúng định dạng:
* **TR:** X.X | **CC:** X.X | **LR:** X.X | **GRA:** X.X
* **Overall:** X.X
(Điểm làm tròn theo thang 0.5 của IELTS chính thức: 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0).`;

      parts.push({ text: instructionPrompt });

      const stream = await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents: { parts },
        config: {
          systemInstruction: IELTS_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          sendEvent({ type: 'chunk', text });
        }
      }

      sendEvent({ type: 'done' });
      res.end();
    } catch (err) {
      const formatted = formatErrorMessage(err);
      sendEvent({ type: 'error', error: formatted.message });
      res.end();
    }
  });

  // 4. Contextual Follow-Up Academic Advisor Chat
  app.post('/api/advisor-chat', async (req: Request, res: Response) => {
    try {
      const { taskType, promptText, essayText, analysisSummary, history, question } = req.body as {
        taskType?: string;
        promptText?: string;
        essayText?: string;
        analysisSummary?: string;
        history?: Array<{ role: 'user' | 'model'; text: string }>;
        question?: string;
      };

      if (!question?.trim()) {
        res.status(400).json({ error: 'Please enter a question for the Academic Advisor.' });
        return;
      }

      const ai = getAiClient();
      const contextPrefix = `Ngữ cảnh hiện tại (${taskType || 'Task 2'}):
- Đề bài: ${promptText || 'Chưa chọn'}
- Bài viết của học viên: ${essayText ? essayText.slice(0, 3500) : '(Chưa có văn bản)'}
- Tóm tắt đánh giá trước đó: ${analysisSummary ? analysisSummary.slice(0, 2500) : '(Chưa phân tích)'}

Hãy trả lời câu hỏi tiếp theo của học viên với vai trò IELTS Writing Master AI (song ngữ Anh - Việt, học thuật, giải thích logic rõ ràng, đưa ví dụ nâng cấp tiếng Anh chuẩn Band 8.0+).`;

      const contents = [
        { role: 'user' as const, parts: [{ text: contextPrefix }] },
        {
          role: 'model' as const,
          parts: [
            {
              text: 'Tôi đã nắm rõ đề bài, bài viết và phần đánh giá của bạn. Bạn muốn tôi giải thích sâu hơn về câu nào, cấu trúc ngữ pháp nào, hay hướng mở rộng ý tưởng nào?',
            },
          ],
        },
        ...(history || []).map((item) => ({
          role: item.role,
          parts: [{ text: item.text }],
        })),
        { role: 'user' as const, parts: [{ text: question.trim() }] },
      ];

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction: IELTS_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      res.json({ reply: (response.text ?? '').trim() });
    } catch (err) {
      const formatted = formatErrorMessage(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IELTS Writing Master server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
