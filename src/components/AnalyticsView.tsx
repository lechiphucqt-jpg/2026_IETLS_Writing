import { useMemo, useState } from 'react';
import type { PracticeHistoryItem } from '../types/ielts';
import { Target, TrendingUp, Award, Zap, AlertTriangle, BookOpen } from 'lucide-react';

interface AnalyticsViewProps {
  history: PracticeHistoryItem[];
  onGoWorkspace: () => void;
}

export function AnalyticsView({ history, onGoWorkspace }: AnalyticsViewProps) {
  const [targetBand, setTargetBand] = useState<number>(7.5);

  // Compute metrics
  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        avgOverall: 0,
        avgTr: 0,
        avgCc: 0,
        avgLr: 0,
        avgGra: 0,
        totalWords: 0,
        completedEssays: 0,
      };
    }

    let trSum = 0, ccSum = 0, lrSum = 0, graSum = 0, overallSum = 0, wordsSum = 0;
    let scoredCount = 0;

    for (const item of history) {
      wordsSum += item.wordCount;
      if (item.bandScores.overall !== null) {
        trSum += item.bandScores.tr ?? item.bandScores.overall;
        ccSum += item.bandScores.cc ?? item.bandScores.overall;
        lrSum += item.bandScores.lr ?? item.bandScores.overall;
        graSum += item.bandScores.gra ?? item.bandScores.overall;
        overallSum += item.bandScores.overall;
        scoredCount++;
      }
    }

    const count = scoredCount || 1;
    return {
      avgOverall: Number((overallSum / count).toFixed(2)),
      avgTr: Number((trSum / count).toFixed(2)),
      avgCc: Number((ccSum / count).toFixed(2)),
      avgLr: Number((lrSum / count).toFixed(2)),
      avgGra: Number((graSum / count).toFixed(2)),
      totalWords: wordsSum,
      completedEssays: history.length,
    };
  }, [history]);

  // Radar chart mathematical coordinates (D3 radial projection in SVG)
  // 4 axes: Top (TR), Right (CC), Bottom (LR), Left (GRA)
  const radarCenter = { x: 180, y: 180 };
  const maxRadius = 130;
  const maxBand = 9.0;

  const getCoordinates = (value: number, axisIndex: number) => {
    // 0: TR (Top, -90deg), 1: CC (Right, 0deg), 2: LR (Bottom, 90deg), 3: GRA (Left, 180deg)
    const angle = (axisIndex * Math.PI) / 2 - Math.PI / 2;
    const r = (Math.min(9, Math.max(0, value)) / maxBand) * maxRadius;
    return {
      x: radarCenter.x + r * Math.cos(angle),
      y: radarCenter.y + r * Math.sin(angle),
    };
  };

  // Current user polygon
  const userPoints = [
    getCoordinates(stats.avgTr || 5.0, 0),
    getCoordinates(stats.avgCc || 5.0, 1),
    getCoordinates(stats.avgLr || 5.0, 2),
    getCoordinates(stats.avgGra || 5.0, 3),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  // Target polygon
  const targetPoints = [
    getCoordinates(targetBand, 0),
    getCoordinates(targetBand, 1),
    getCoordinates(targetBand, 2),
    getCoordinates(targetBand, 3),
  ]
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  // Progression Line Points
  const chronologicalHistory = useMemo(() => {
    return [...history].reverse();
  }, [history]);

  // Identify weakest criterion
  const weakestCriterion = useMemo(() => {
    const list = [
      { name: 'Task Response (TR)', score: stats.avgTr, code: 'TR', tip: 'Cần mở rộng dẫn chứng cụ thể hơn, tránh đưa ra nhận định chung chung.' },
      { name: 'Coherence & Cohesion (CC)', score: stats.avgCc, code: 'CC', tip: 'Hãy đa dạng hóa phương thức liên kết thay vì chỉ dùng từ nối cơ bản (Furthermore, Moreover).' },
      { name: 'Lexical Resource (LR)', score: stats.avgLr, code: 'LR', tip: 'Bổ sung các cụm Academic Collocations C1/C2 và tránh lặp từ bằng các phép paraphrase chuẩn xác.' },
      { name: 'Grammar Range & Accuracy (GRA)', score: stats.avgGra, code: 'GRA', tip: 'Luyện tập các cấu trúc câu phức (Inversion, Cleft Sentence, Participle Clauses) để bứt phá lên Band 8+.' },
    ];
    list.sort((a, b) => a.score - b.score);
    return list[0];
  }, [stats]);

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
            Learning Analytics & Band Diagnostics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Trực quan hóa D3.js theo dõi tiến trình 4 tiêu chí chấm thi chính thức của British Council & IDP.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Target Band:
          </label>
          <select
            value={targetBand}
            onChange={(e) => setTargetBand(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-900 shadow-sm focus:border-blue-700 focus:outline-none"
          >
            <option value={6.5}>Band 6.5 (Competent)</option>
            <option value={7.0}>Band 7.0 (Good User)</option>
            <option value={7.5}>Band 7.5 (Advanced)</option>
            <option value={8.0}>Band 8.0 (Very Good)</option>
            <option value={8.5}>Band 8.5 (Expert)</option>
          </select>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <TrendingUp className="h-4 w-4 text-blue-700" />
            <span>Average Band</span>
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-blue-950">
            {stats.avgOverall > 0 ? stats.avgOverall.toFixed(1) : '—'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {stats.avgOverall >= targetBand ? '🎉 Đạt mục tiêu đề ra' : `Còn thiếu ${(targetBand - stats.avgOverall).toFixed(1)} điểm`}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>Completed Essays</span>
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-slate-900">
            {stats.completedEssays}
          </div>
          <div className="mt-1 text-xs text-slate-500">Bài thi đã lưu & phân tích</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <BookOpen className="h-4 w-4 text-purple-600" />
            <span>Total Words Written</span>
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-slate-900">
            {stats.totalWords.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500">Khối lượng tích lũy</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Target className="h-4 w-4 text-amber-600" />
            <span>Target Distance</span>
          </div>
          <div className="mt-2 font-serif text-3xl font-bold text-slate-900">
            {targetBand.toFixed(1)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Mục tiêu hiện tại</div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h3 className="font-serif text-lg font-semibold text-slate-900">Chưa có dữ liệu bài viết để phân tích</h3>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Hãy hoàn thành bài viết đầu tiên tại Workspace và nhấn "Save Attempt" để hệ thống tính toán biểu đồ D3.js.
          </p>
          <button
            onClick={onGoWorkspace}
            className="mt-5 rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Đến Workspace làm bài ngay
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Radar Chart (D3 Spider Web in SVG) - 5 cols */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-serif text-base font-bold text-slate-900">
                1. Biểu Đồ Mạng Nhện 4 Tiêu Chí (Radar Chart)
              </h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-medium text-blue-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-700"></span> Điểm Bạn
                </span>
                <span className="flex items-center gap-1 font-medium text-amber-600">
                  <span className="h-2.5 w-2.5 rounded-full border border-amber-600 bg-amber-100"></span> Mục Tiêu
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center">
              <svg width="360" height="360" className="overflow-visible">
                {/* Concentric grid circles for Band 3, 5, 7, 9 */}
                {[3, 5, 7, 9].map((band) => {
                  const r = (band / maxBand) * maxRadius;
                  return (
                    <g key={band}>
                      <circle
                        cx={radarCenter.x}
                        cy={radarCenter.y}
                        r={r}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeDasharray={band === 9 ? '0' : '3,3'}
                      />
                      <text
                        x={radarCenter.x + 4}
                        y={radarCenter.y - r + 12}
                        fontSize="10"
                        fill="#94a3b8"
                        className="font-mono"
                      >
                        B{band}
                      </text>
                    </g>
                  );
                })}

                {/* 4 Axis Cross Lines */}
                <line
                  x1={radarCenter.x}
                  y1={radarCenter.y - maxRadius}
                  x2={radarCenter.x}
                  y2={radarCenter.y + maxRadius}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <line
                  x1={radarCenter.x - maxRadius}
                  y1={radarCenter.y}
                  x2={radarCenter.x + maxRadius}
                  y2={radarCenter.y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />

                {/* Axis Labels */}
                <text x={radarCenter.x} y={radarCenter.y - maxRadius - 12} textAnchor="middle" className="text-xs font-semibold fill-slate-800">
                  Task Response (TR)
                </text>
                <text x={radarCenter.x + maxRadius + 14} y={radarCenter.y + 4} textAnchor="start" className="text-xs font-semibold fill-slate-800">
                  Coherence (CC)
                </text>
                <text x={radarCenter.x} y={radarCenter.y + maxRadius + 20} textAnchor="middle" className="text-xs font-semibold fill-slate-800">
                  Lexical (LR)
                </text>
                <text x={radarCenter.x - maxRadius - 14} y={radarCenter.y + 4} textAnchor="end" className="text-xs font-semibold fill-slate-800">
                  Grammar (GRA)
                </text>

                {/* Target Band Polygon */}
                <polygon
                  points={targetPoints}
                  fill="rgba(245, 158, 11, 0.12)"
                  stroke="#d97706"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />

                {/* User Current Performance Polygon */}
                <polygon
                  points={userPoints}
                  fill="rgba(30, 58, 138, 0.25)"
                  stroke="#1e3a8a"
                  strokeWidth="2.5"
                />

                {/* Data Points on User Polygon */}
                {[
                  { val: stats.avgTr, idx: 0, label: 'TR' },
                  { val: stats.avgCc, idx: 1, label: 'CC' },
                  { val: stats.avgLr, idx: 2, label: 'LR' },
                  { val: stats.avgGra, idx: 3, label: 'GRA' },
                ].map((pt) => {
                  const coord = getCoordinates(pt.val || 5.0, pt.idx);
                  return (
                    <g key={pt.label}>
                      <circle cx={coord.x} cy={coord.y} r="5" fill="#1e3a8a" stroke="#ffffff" strokeWidth="2" />
                      <text
                        x={coord.x + (pt.idx === 1 ? 8 : pt.idx === 3 ? -8 : 0)}
                        y={coord.y + (pt.idx === 2 ? 14 : pt.idx === 0 ? -8 : 4)}
                        textAnchor={pt.idx === 1 ? 'start' : pt.idx === 3 ? 'end' : 'middle'}
                        className="font-mono text-[11px] font-bold fill-blue-900"
                      >
                        {pt.val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <span className="text-slate-500">TR/TA Average:</span>
                <span className="ml-1 font-bold text-slate-900 font-mono">{stats.avgTr.toFixed(1)}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <span className="text-slate-500">CC Average:</span>
                <span className="ml-1 font-bold text-slate-900 font-mono">{stats.avgCc.toFixed(1)}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <span className="text-slate-500">LR Average:</span>
                <span className="ml-1 font-bold text-slate-900 font-mono">{stats.avgLr.toFixed(1)}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <span className="text-slate-500">GRA Average:</span>
                <span className="ml-1 font-bold text-slate-900 font-mono">{stats.avgGra.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Progress Chart & Weakness Analysis - 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            {/* Progression Line Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                2. Đường Tiến Bộ Qua Các Lần Viết (Band Score Progression)
              </h2>

              <div className="mt-4 h-48 w-full">
                {chronologicalHistory.length === 1 ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500 italic">
                    Cần tối thiểu 2 bài viết để dựng đường xu hướng tiến bộ.
                  </div>
                ) : (
                  <svg className="h-full w-full overflow-visible" viewBox="0 0 500 160">
                    {/* Horizontal reference lines for 6.0, 7.0, 8.0 */}
                    {[6.0, 7.0, 8.0].map((b) => {
                      const y = 140 - ((b - 4.0) / 5.0) * 120;
                      return (
                        <g key={b}>
                          <line x1="30" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                          <text x="5" y={y + 3} fontSize="9" fill="#94a3b8" className="font-mono">
                            {b.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Polyline for Overall Band */}
                    {(() => {
                      const points = chronologicalHistory
                        .map((item, idx) => {
                          const x = 40 + (idx / (chronologicalHistory.length - 1)) * 430;
                          const score = item.bandScores.overall ?? 5.0;
                          const y = 140 - ((score - 4.0) / 5.0) * 120;
                          return `${x},${y}`;
                        })
                        .join(' ');

                      return (
                        <>
                          <polyline
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={points}
                          />
                          {chronologicalHistory.map((item, idx) => {
                            const x = 40 + (idx / (chronologicalHistory.length - 1)) * 430;
                            const score = item.bandScores.overall ?? 5.0;
                            const y = 140 - ((score - 4.0) / 5.0) * 120;
                            return (
                              <g key={item.id}>
                                <circle cx={x} cy={y} r="4" fill="#1e3a8a" stroke="#ffffff" strokeWidth="2" />
                                <text x={x} y={y - 8} fontSize="10" textAnchor="middle" className="font-mono font-bold fill-blue-900">
                                  {score.toFixed(1)}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                )}
              </div>
            </div>

            {/* Diagnostic Alert: Weakest Link */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">
                    Tiêu chí cần tập trung cải thiện nhất: {weakestCriterion.name} ({weakestCriterion.score.toFixed(1)})
                  </h3>
                  <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                    {weakestCriterion.tip}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={onGoWorkspace}
                      className="inline-flex items-center gap-1.5 rounded-md bg-amber-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-900"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Luyện tập cải thiện ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
