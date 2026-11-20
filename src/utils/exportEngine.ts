import type { BandScores, OutlineState, TaskType } from '../types/ielts';

interface ExportData {
  taskType: TaskType;
  promptTitle: string;
  promptText: string;
  candidateName?: string;
  essayText: string;
  outline: OutlineState;
  wordCount: number;
  bandScores: BandScores;
  analysisMarkdown: string;
}

export function exportToWordDocument(data: ExportData): void {
  const dateStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const overallStr = data.bandScores.overall !== null ? data.bandScores.overall.toFixed(1) : 'N/A';
  const trStr = data.bandScores.tr !== null ? data.bandScores.tr.toFixed(1) : 'N/A';
  const ccStr = data.bandScores.cc !== null ? data.bandScores.cc.toFixed(1) : 'N/A';
  const lrStr = data.bandScores.lr !== null ? data.bandScores.lr.toFixed(1) : 'N/A';
  const graStr = data.bandScores.gra !== null ? data.bandScores.gra.toFixed(1) : 'N/A';

  // Format paragraphs of essay
  const essayHtml = data.essayText
    .split('\n')
    .filter((p) => p.trim())
    .map((p) => `<p style="margin-bottom: 12pt; text-align: justify; line-height: 1.6;">${escapeHtml(p)}</p>`)
    .join('');

  // Extract table rows from Markdown if available
  const tableRows = extractTableRowsFromMarkdown(data.analysisMarkdown);

  const documentHtml = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' 
        xmlns:w='urn:schemas-microsoft-com:office:word' 
        xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>IELTS Writing Evaluation Report</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      body {
        font-family: 'Calibri', 'Times New Roman', serif;
        font-size: 11pt;
        color: #1e293b;
        margin: 20mm;
      }
      h1 {
        font-size: 20pt;
        color: #1e3a8a;
        border-bottom: 2pt solid #1e3a8a;
        padding-bottom: 6pt;
        margin-bottom: 14pt;
        text-transform: uppercase;
      }
      h2 {
        font-size: 14pt;
        color: #0f172a;
        border-left: 4pt solid #2563eb;
        padding-left: 8pt;
        margin-top: 18pt;
        margin-bottom: 8pt;
      }
      .score-box {
        background-color: #f8fafc;
        border: 1pt solid #cbd5e1;
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 18pt;
      }
      .score-box th {
        background-color: #1e3a8a;
        color: #ffffff;
        padding: 8pt;
        text-align: center;
        font-size: 11pt;
      }
      .score-box td {
        border: 1pt solid #cbd5e1;
        padding: 8pt;
        text-align: center;
        font-size: 12pt;
        font-weight: bold;
      }
      .overall-score {
        color: #1e3a8a;
        font-size: 16pt;
      }
      .correction-table {
        border-collapse: collapse;
        width: 100%;
        margin-top: 10pt;
        margin-bottom: 16pt;
      }
      .correction-table th {
        background-color: #f1f5f9;
        border: 1pt solid #cbd5e1;
        padding: 6pt 8pt;
        text-align: left;
        font-size: 10pt;
        font-weight: bold;
      }
      .correction-table td {
        border: 1pt solid #cbd5e1;
        padding: 6pt 8pt;
        font-size: 10pt;
        vertical-align: top;
      }
      .del-text {
        color: #dc2626;
        text-decoration: line-through;
        background-color: #fee2e2;
        padding: 1pt 2pt;
      }
      .ins-text {
        color: #16a34a;
        text-decoration: underline;
        font-weight: bold;
        background-color: #dcfce7;
        padding: 1pt 2pt;
      }
      .meta-box {
        margin-bottom: 14pt;
        font-size: 10pt;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <h1>IELTS Writing Master — Học Thuật & Chấm Điểm Chi Tiết</h1>
    
    <div class="meta-box">
      <strong>Thí sinh:</strong> ${escapeHtml(data.candidateName || 'IELTS Candidate')} | 
      <strong>Dạng bài:</strong> ${escapeHtml(data.taskType)} | 
      <strong>Ngày chấm:</strong> ${dateStr} | 
      <strong>Số từ:</strong> ${data.wordCount} words
    </div>

    <table class="score-box">
      <tr>
        <th>Task Response (TR)</th>
        <th>Coherence & Cohesion (CC)</th>
        <th>Lexical Resource (LR)</th>
        <th>Grammatical Range & Acc (GRA)</th>
        <th>OVERALL BAND</th>
      </tr>
      <tr>
        <td>${trStr}</td>
        <td>${ccStr}</td>
        <td>${lrStr}</td>
        <td>${graStr}</td>
        <td class="overall-score">${overallStr}</td>
      </tr>
    </table>

    <h2>1. ĐỀ BÀI (EXAM PROMPT)</h2>
    <div style="background-color: #f8fafc; border-left: 3pt solid #64748b; padding: 10pt; margin-bottom: 14pt;">
      <em>${escapeHtml(data.promptText)}</em>
    </div>

    <h2>2. DÀN Ý CỦA THÍ SINH (OUTLINE)</h2>
    <ul>
      <li><strong>Introduction / Thesis:</strong> ${escapeHtml(data.outline.introOrThesis || 'N/A')}</li>
      <li><strong>Body 1:</strong> ${escapeHtml(data.outline.body1 || 'N/A')}</li>
      <li><strong>Body 2:</strong> ${escapeHtml(data.outline.body2 || 'N/A')}</li>
      <li><strong>Conclusion:</strong> ${escapeHtml(data.outline.conclusion || 'N/A')}</li>
    </ul>

    <h2>3. BÀI LÀM CỦA THÍ SINH (STUDENT ESSAY)</h2>
    <div style="background-color: #ffffff; border: 1pt solid #e2e8f0; padding: 12pt; border-radius: 4pt;">
      ${essayHtml}
    </div>

    <h2>4. BẢNG SỬA LỖI & NÂNG CẤP (TRACKED CORRECTIONS)</h2>
    <table class="correction-table">
      <tr>
        <th style="width: 25%;">Câu gốc (Original)</th>
        <th style="width: 20%;">Vấn đề / Lỗi sai</th>
        <th style="width: 30%;">Đề xuất sửa đổi (Band 8.0+)</th>
        <th style="width: 25%;">Giải thích sư phạm</th>
      </tr>
      ${
        tableRows.length > 0
          ? tableRows
              .map(
                (r) => `
        <tr>
          <td><span class="del-text">${escapeHtml(r.original)}</span></td>
          <td>${escapeHtml(r.error)}</td>
          <td><span class="ins-text">${escapeHtml(r.upgraded)}</span></td>
          <td>${escapeHtml(r.explanation)}</td>
        </tr>`,
              )
              .join('')
          : `<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 12pt;">Tham khảo phần nhận xét chi tiết bên dưới.</td></tr>`
      }
    </table>

    <h2>5. BÁO CÁO TOÀN VĂN TỪ CỐ VẤN HỌC THUẬT (ACADEMIC ADVISOR)</h2>
    <div style="line-height: 1.6;">
      ${escapeHtml(data.analysisMarkdown).replace(/\n/g, '<br/>')}
    </div>

    <div style="margin-top: 30pt; border-top: 1pt solid #cbd5e1; padding-top: 8pt; font-size: 9pt; color: #94a3b8; text-align: center;">
      Xuất bản bởi IELTS Writing Master AI Platform • Tiêu chuẩn Khảo thí British Council & IDP Academic
    </div>
  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff', documentHtml], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IELTS_Report_${data.taskType.replace(/\s+/g, '_')}_Band${overallStr}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToPowerPointPresentation(data: ExportData): void {
  const overallStr = data.bandScores.overall !== null ? data.bandScores.overall.toFixed(1) : 'N/A';
  const tableRows = extractTableRowsFromMarkdown(data.analysisMarkdown);

  // Generate an HTML-based interactive presentation deck that can be viewed full-screen and printed to slides
  const slideDeckHtml = `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <title>IELTS Master — Slide Bài Giảng: ${escapeHtml(data.promptTitle || data.taskType)}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
      body { background-color: #0f172a; color: #f8fafc; overflow-x: hidden; }
      .slide-container { display: flex; flex-direction: column; gap: 32px; padding: 40px; max-width: 1200px; margin: 0 auto; }
      .slide {
        background: linear-gradient(145deg, #1e293b, #0f172a);
        border: 2px solid #334155;
        border-radius: 16px;
        padding: 48px;
        min-height: 600px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        page-break-after: always;
      }
      .slide-header { border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: baseline; }
      .slide-title { font-size: 28px; font-weight: 700; color: #60a5fa; text-transform: uppercase; }
      .slide-badge { background: #1e3a8a; color: #93c5fd; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; }
      .slide-content { flex: 1; font-size: 18px; line-height: 1.6; color: #cbd5e1; }
      .slide-footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; display: flex; justify-content: space-between; font-size: 14px; color: #64748b; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      .card { background: rgba(30, 41, 59, 0.8); border: 1px solid #475569; padding: 20px; border-radius: 12px; }
      .card-title { font-size: 16px; font-weight: 600; color: #38bdf8; margin-bottom: 12px; }
      .pill { display: inline-block; background: #0369a1; color: white; padding: 4px 10px; border-radius: 6px; font-size: 14px; margin: 4px; }
      .print-btn {
        position: fixed; top: 20px; right: 20px; z-index: 100;
        background: #2563eb; color: white; border: none; padding: 12px 24px;
        border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      }
      .print-btn:hover { background: #1d4ed8; }
      @media print {
        .print-btn { display: none; }
        body { background: white; color: black; }
        .slide { border: 1px solid #ccc; box-shadow: none; background: white; color: black; min-height: 90vh; }
        .slide-title { color: #1e3a8a; }
        .slide-content { color: #333; }
      }
    </style>
  </head>
  <body>
    <button class="print-btn" onclick="window.print()">In hoặc Lưu PDF (Ctrl + P)</button>
    <div class="slide-container">
      
      <!-- Slide 1: Cover -->
      <div class="slide">
        <div class="slide-header">
          <div class="slide-title">IELTS Writing Master Class</div>
          <div class="slide-badge">${escapeHtml(data.taskType)} • Band Target 8.0+</div>
        </div>
        <div class="slide-content" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
          <h2 style="font-size: 36px; color: #f8fafc; margin-bottom: 16px;">Phân Tích Đề & Chữa Bài Chi Tiết</h2>
          <p style="font-size: 22px; color: #94a3b8; max-width: 800px; margin-bottom: 32px;">
            ${escapeHtml(data.promptTitle || 'Chuyên đề nâng cấp bài viết IELTS Writing')}
          </p>
          <div style="display: flex; gap: 20px;">
            <div class="pill" style="font-size: 18px; padding: 8px 18px;">Overall Band Đạt: ${overallStr}</div>
            <div class="pill" style="font-size: 18px; padding: 8px 18px; background: #059669;">Độ Dài: ${data.wordCount} Từ</div>
          </div>
        </div>
        <div class="slide-footer">
          <span>Giáo trình Cố vấn Học thuật IELTS</span>
          <span>Slide 1 / 5</span>
        </div>
      </div>

      <!-- Slide 2: Prompt & Outline -->
      <div class="slide">
        <div class="slide-header">
          <div class="slide-title">1. Đề Bài & Kiến Trúc Dàn Ý</div>
          <div class="slide-badge">Coherence & Task Response</div>
        </div>
        <div class="slide-content">
          <div class="grid-2">
            <div class="card">
              <div class="card-title">📌 Đề Bài Chi Tiết</div>
              <p style="font-style: italic; font-size: 16px;">${escapeHtml(data.promptText)}</p>
            </div>
            <div class="card">
              <div class="card-title">🏗️ Cấu Trúc Luận Điểm</div>
              <ul style="list-style-type: none; font-size: 15px; display: flex; flex-direction: column; gap: 8px;">
                <li><strong>Intro/Thesis:</strong> ${escapeHtml(data.outline.introOrThesis || 'Chưa định hình')}</li>
                <li><strong>Body 1:</strong> ${escapeHtml(data.outline.body1 || 'Chưa định hình')}</li>
                <li><strong>Body 2:</strong> ${escapeHtml(data.outline.body2 || 'Chưa định hình')}</li>
                <li><strong>Conclusion:</strong> ${escapeHtml(data.outline.conclusion || 'Chưa định hình')}</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="slide-footer">
          <span>IELTS Writing Master</span>
          <span>Slide 2 / 5</span>
        </div>
      </div>

      <!-- Slide 3: Corrections & Upgrades -->
      <div class="slide">
        <div class="slide-header">
          <div class="slide-title">2. Phân Tích Lỗi Sai & Nâng Cấp Band 8.5+</div>
          <div class="slide-badge">Grammar & Lexical Frontiers</div>
        </div>
        <div class="slide-content">
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${
              tableRows.slice(0, 4).map((r, i) => `
              <div class="card" style="padding: 14px 18px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span style="color: #f87171; text-decoration: line-through; font-size: 15px;">Câu gốc: ${escapeHtml(r.original)}</span>
                  <span style="color: #fbbf24; font-size: 13px;">[Lỗi: ${escapeHtml(r.error)}]</span>
                </div>
                <div style="color: #4ade80; font-weight: 600; font-size: 16px; margin-bottom: 4px;">
                  ➔ Sửa đổi: ${escapeHtml(r.upgraded)}
                </div>
                <div style="color: #94a3b8; font-size: 13px;">
                  💡 Giải thích: ${escapeHtml(r.explanation)}
                </div>
              </div>
            `).join('') || '<p>Tham khảo báo cáo chi tiết để xem toàn bộ danh sách câu sửa.</p>'
            }
          </div>
        </div>
        <div class="slide-footer">
          <span>IELTS Writing Master</span>
          <span>Slide 3 / 5</span>
        </div>
      </div>

      <!-- Slide 4: Academic Collocations -->
      <div class="slide">
        <div class="slide-header">
          <div class="slide-title">3. Kho Collocations & Cấu Trúc Đắt Giá</div>
          <div class="slide-badge">Lexical Resource Booster</div>
        </div>
        <div class="slide-content">
          <div class="card" style="margin-bottom: 20px;">
            <div class="card-title">🌟 Cụm Từ Học Thuật Cấp Độ C1/C2 Khuyên Dùng</div>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              <span class="pill">mitigate negative externalities</span>
              <span class="pill">exert a profound influence on</span>
              <span class="pill">in stark juxtaposition to</span>
              <span class="pill">pave the trajectory for</span>
              <span class="pill">catalyze socio-economic growth</span>
            </div>
          </div>
          <div class="card">
            <div class="card-title">📐 Cấu Trúc Ngữ Pháp Điểm Cao (Grammar Patterns)</div>
            <p style="font-size: 15px; margin-bottom: 6px;">• <strong>Đảo ngữ (Inversion):</strong> <em>Not only does this policy alleviate..., but it also fosters...</em></p>
            <p style="font-size: 15px; margin-bottom: 6px;">• <strong>Câu chẻ (Cleft Sentence):</strong> <em>It is through concerted governmental efforts that this crisis can be addressed.</em></p>
            <p style="font-size: 15px;">• <strong>Mệnh đề phân từ (Participle Clause):</strong> <em>Having acknowledged these drawbacks, advocates nonetheless emphasize...</em></p>
          </div>
        </div>
        <div class="slide-footer">
          <span>IELTS Writing Master</span>
          <span>Slide 4 / 5</span>
        </div>
      </div>

      <!-- Slide 5: Band Score Matrix -->
      <div class="slide">
        <div class="slide-header">
          <div class="slide-title">4. Bảng Điểm Chuẩn & Nhận Xét Giám Khảo</div>
          <div class="slide-badge">Official Assessment Matrix</div>
        </div>
        <div class="slide-content" style="display: flex; flex-direction: column; justify-content: center;">
          <div class="grid-2">
            <div class="card" style="text-align: center;">
              <div style="font-size: 64px; font-weight: 800; color: #60a5fa;">${overallStr}</div>
              <div style="font-size: 18px; color: #94a3b8; text-transform: uppercase;">Overall Band Score</div>
            </div>
            <div class="card" style="display: flex; flex-direction: column; justify-content: space-around;">
              <div><strong>Task Response:</strong> <span style="color: #38bdf8;">${data.bandScores.tr ?? 'N/A'}</span></div>
              <div><strong>Coherence & Cohesion:</strong> <span style="color: #38bdf8;">${data.bandScores.cc ?? 'N/A'}</span></div>
              <div><strong>Lexical Resource:</strong> <span style="color: #38bdf8;">${data.bandScores.lr ?? 'N/A'}</span></div>
              <div><strong>Grammatical Range:</strong> <span style="color: #38bdf8;">${data.bandScores.gra ?? 'N/A'}</span></div>
            </div>
          </div>
        </div>
        <div class="slide-footer">
          <span>IELTS Writing Master</span>
          <span>Slide 5 / 5</span>
        </div>
      </div>

    </div>
  </body>
  </html>
  `;

  const blob = new Blob([slideDeckHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `IELTS_Slides_${data.taskType.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export function exportToMoodleGradebookCsv(items: Array<{
  studentId: string;
  studentName: string;
  taskType: string;
  promptTitle: string;
  tr: number | null;
  cc: number | null;
  lr: number | null;
  gra: number | null;
  overall: number | null;
  date: string;
}>): void {
  const headers = [
    'Student ID',
    'Student Name',
    'Task Type',
    'Assignment Title',
    'TR/TA Score',
    'CC Score',
    'LR Score',
    'GRA Score',
    'Overall Band',
    'Status',
    'Graded Date',
  ];

  const rows = items.map((i) => [
    `"${i.studentId}"`,
    `"${i.studentName}"`,
    `"${i.taskType}"`,
    `"${i.promptTitle.replace(/"/g, '""')}"`,
    i.tr ?? '',
    i.cc ?? '',
    i.lr ?? '',
    i.gra ?? '',
    i.overall ?? '',
    '"Graded"',
    `"${i.date}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Moodle_Gradebook_Export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function extractTableRowsFromMarkdown(markdown: string): Array<{
  original: string;
  error: string;
  upgraded: string;
  explanation: string;
}> {
  const rows: Array<{ original: string; error: string; upgraded: string; explanation: string }> = [];
  const lines = markdown.split('\n');
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) {
        inTable = true;
        continue;
      }
      if (inTable) {
        const cols = trimmed
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        if (cols.length >= 4 && !cols[0].toLowerCase().includes('câu gốc')) {
          rows.push({
            original: cols[0],
            error: cols[1],
            upgraded: cols[2],
            explanation: cols[3],
          });
        }
      }
    } else {
      if (inTable && trimmed !== '') {
        inTable = false;
      }
    }
  }

  return rows;
}
