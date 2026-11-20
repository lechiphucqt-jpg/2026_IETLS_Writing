import { useState } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Plus,
  ArrowRight,
  Edit3,
} from 'lucide-react';
import type { Assignment, Classroom, StudentSubmission, UserRole } from '../types/ielts';
import { exportToMoodleGradebookCsv } from '../utils/exportEngine';

const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'c1',
    name: 'IELTS Intensive Target 8.0 - Khoá 14',
    code: 'IELTS-INT-14',
    teacherName: 'Thầy David Hoàng (Examiner Trained)',
    createdDate: '2026-02-15',
    moodleCourseId: 'MDL-ENG-801',
  },
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    classroomId: 'c1',
    promptId: 't2-ai-jobs',
    promptTitle: 'Impact of AI on Modern Employment',
    taskType: 'Task 2',
    promptText: 'Some people believe that artificial intelligence will create more jobs than it destroys. To what extent do you agree or disagree?',
    dueDate: '2026-03-25',
    targetBand: 7.5,
    instructions: 'Yêu cầu: Viết tối thiểu 250 từ, sử dụng ít nhất 3 cấu trúc câu phức (Inversion hoặc Cleft Sentence) và trích dẫn dẫn chứng xác đáng.',
  },
];

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub1',
    assignmentId: 'a1',
    studentId: 'STU_1001',
    studentName: 'Nguyễn Văn An',
    submittedAt: '2026-03-20 14:30',
    essayText: 'The rapid ascension of artificial intelligence has precipitated intense debates concerning future employment landscapes...',
    outline: {
      introOrThesis: 'AI brings disruption but also fosters novel high-skilled sectors.',
      body1: 'Automation diminishes repetitive manual labor.',
      body2: 'Emergence of AI oversight, engineering, and data science industries.',
      conclusion: 'Net positive employment outcome provided training is instituted.',
    },
    wordCount: 284,
    aiBandScores: { tr: 7.5, cc: 7.0, lr: 8.0, gra: 7.5, overall: 7.5 },
    analysisMarkdown: 'Đạt yêu cầu tốt về Task Response. Cần lưu ý sự đa dạng liên kết ở Body 1.',
    status: 'graded',
    teacherFeedback: {
      approvedScores: { tr: 7.5, cc: 7.5, lr: 8.0, gra: 7.5, overall: 7.5 },
      teacherNotes: 'Bài viết rất sắc bén! Thầy đánh giá cao cách dùng cụm từ "precipitated intense debates". Tiếp tục phát huy nhé!',
      reviewedAt: '2026-03-21 09:15',
    },
  },
  {
    id: 'sub2',
    assignmentId: 'a1',
    studentId: 'STU_1002',
    studentName: 'Trần Thị Mai',
    submittedAt: '2026-03-21 16:45',
    essayText: 'Nowadays, artificial intelligence is developing very fast. Many workers worry about losing their jobs because machines can do work better...',
    outline: {
      introOrThesis: 'Disagree that AI creates more jobs.',
      body1: 'Factories replacing humans with robots.',
      body2: 'Older workers cannot learn coding.',
      conclusion: 'AI causes serious unemployment.',
    },
    wordCount: 242,
    aiBandScores: { tr: 6.0, cc: 6.0, lr: 6.0, gra: 6.0, overall: 6.0 },
    analysisMarkdown: 'Bài viết chưa đạt đủ độ dài 250 từ (242 words). Từ vựng còn tương đối phổ thông, cần bổ sung academic collocations.',
    status: 'pending_review',
  },
];

interface ClassroomViewProps {
  onGoWorkspaceWithPrompt?: (promptText: string, taskType: 'Task 1' | 'Task 2') => void;
}

export function ClassroomView({ onGoWorkspaceWithPrompt }: ClassroomViewProps) {
  const [role, setRole] = useState<UserRole>('teacher');
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  // Teacher grading modal state
  const [editingScores, setEditingScores] = useState({
    tr: 7.0,
    cc: 7.0,
    lr: 7.0,
    gra: 7.0,
    overall: 7.0,
  });
  const [teacherNotes, setTeacherNotes] = useState('');

  const handleOpenReview = (sub: StudentSubmission) => {
    setSelectedSubmission(sub);
    const base = sub.teacherFeedback?.approvedScores || sub.aiBandScores;
    setEditingScores({
      tr: base.tr ?? 6.5,
      cc: base.cc ?? 6.5,
      lr: base.lr ?? 6.5,
      gra: base.gra ?? 6.5,
      overall: base.overall ?? 6.5,
    });
    setTeacherNotes(sub.teacherFeedback?.teacherNotes || '');
  };

  const handleSaveTeacherReview = () => {
    if (!selectedSubmission) return;
    const updated = submissions.map((s) => {
      if (s.id === selectedSubmission.id) {
        return {
          ...s,
          status: 'graded' as const,
          teacherFeedback: {
            approvedScores: { ...editingScores },
            teacherNotes,
            reviewedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          },
        };
      }
      return s;
    });
    setSubmissions(updated);
    setSelectedSubmission(null);
  };

  const handleExportMoodle = () => {
    const rows = submissions.map((s) => ({
      studentId: s.studentId,
      studentName: s.studentName,
      taskType: 'Task 2',
      promptTitle: 'Impact of AI on Modern Employment',
      tr: s.teacherFeedback?.approvedScores.tr ?? s.aiBandScores.tr,
      cc: s.teacherFeedback?.approvedScores.cc ?? s.aiBandScores.cc,
      lr: s.teacherFeedback?.approvedScores.lr ?? s.aiBandScores.lr,
      gra: s.teacherFeedback?.approvedScores.gra ?? s.aiBandScores.gra,
      overall: s.teacherFeedback?.approvedScores.overall ?? s.aiBandScores.overall,
      date: s.submittedAt,
    }));
    exportToMoodleGradebookCsv(rows);
  };

  return (
    <div className="mx-auto max-w-[1250px] px-4 py-8 sm:px-6">
      {/* Header & Role Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-900 mb-2">
            <GraduationCap className="h-3.5 w-3.5 text-emerald-700" />
            <span>Classroom & LMS Integration</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
            Lớp Học & Cổng Giáo Viên (Moodle Compatible)
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Quản lý bài nộp của học sinh, can thiệp duyệt điểm (Human-in-the-loop) và xuất Sổ điểm Moodle CSV.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setRole('teacher')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              role === 'teacher' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Chế độ Giáo Viên
          </button>
          <button
            onClick={() => setRole('student')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              role === 'student' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Chế độ Học Sinh
          </button>
        </div>
      </div>

      {/* Classroom Info Banner */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-slate-900">{INITIAL_CLASSROOMS[0].name}</h2>
            <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-700">
              {INITIAL_CLASSROOMS[0].code}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
              Moodle ID: {INITIAL_CLASSROOMS[0].moodleCourseId}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Giảng viên phụ trách: {INITIAL_CLASSROOMS[0].teacherName}</p>
        </div>

        {role === 'teacher' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMoodle}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <Download className="h-4 w-4" />
              Xuất Sổ Điểm Moodle (.CSV)
            </button>
          </div>
        )}
      </div>

      {/* Teacher View: Submissions Queue */}
      {role === 'teacher' && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Danh Sách Bài Nộp Của Học Sinh ({submissions.length})
            </h3>
            <span className="text-xs text-slate-500">
              * Giáo viên có quyền điều chỉnh điểm AI và phê duyệt kết quả cuối cùng
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3.5">Mã SV / Tên Học Sinh</th>
                  <th className="px-4 py-3.5">Thời Gian Nộp</th>
                  <th className="px-4 py-3.5 text-right">Số Từ</th>
                  <th className="px-4 py-3.5 text-right">Điểm AI</th>
                  <th className="px-4 py-3.5 text-right">Điểm Duyệt</th>
                  <th className="px-4 py-3.5 text-center">Trạng Thái</th>
                  <th className="px-4 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {submissions.map((sub) => {
                  const isGraded = sub.status === 'graded';
                  const finalOverall = sub.teacherFeedback?.approvedScores.overall ?? sub.aiBandScores.overall;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{sub.studentName}</div>
                        <div className="text-xs font-mono text-slate-400">{sub.studentId}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-mono">{sub.submittedAt}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-700">{sub.wordCount} words</td>
                      <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-600">
                        {sub.aiBandScores.overall?.toFixed(1) ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-800">
                        {finalOverall?.toFixed(1) ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isGraded ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Đã Duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            <Clock className="h-3 w-3" />
                            Chờ Giáo Viên Duyệt
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenReview(sub)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-slate-50 shadow-xs"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>{isGraded ? 'Xem lại / Sửa' : 'Chấm & Duyệt'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student View: Assigned Tasks */}
      {role === 'student' && (
        <div className="mt-8">
          <h3 className="font-serif text-lg font-bold text-slate-900 mb-4">
            Bài Tập Được Giao Từ Giáo Viên
          </h3>

          <div className="space-y-4">
            {INITIAL_ASSIGNMENTS.map((asg) => (
              <div
                key={asg.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-800">
                      {asg.taskType}
                    </span>
                    <h4 className="font-serif text-base font-bold text-slate-900">{asg.promptTitle}</h4>
                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                      Mục tiêu Band {asg.targetBand}+
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 font-serif italic max-w-3xl">"{asg.promptText}"</p>
                  <p className="mt-2 text-xs text-slate-500">📌 {asg.instructions}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Hạn nộp: {asg.dueDate}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onGoWorkspaceWithPrompt?.(asg.promptText, asg.taskType)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-800 shrink-0 shadow-xs"
                >
                  <span>Làm bài ngay</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Human-in-the-Loop Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Phê Duyệt Điểm & Lời Phê Cho: {selectedSubmission.studentName}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Mã SV: {selectedSubmission.studentId} • Độ dài: {selectedSubmission.wordCount} words
                </span>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bài làm học sinh:</h4>
                <div className="mt-1.5 rounded-lg bg-slate-50 p-4 text-xs font-serif leading-relaxed text-slate-800 border border-slate-200">
                  {selectedSubmission.essayText}
                </div>
              </div>

              {/* Score Overrides */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3">
                  Điều chỉnh Band Score (Human-in-the-Loop)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">TR/TA:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingScores.tr}
                      onChange={(e) => setEditingScores({ ...editingScores, tr: Number(e.target.value) })}
                      className="mt-1 w-full rounded border border-slate-300 p-1.5 text-center font-mono font-bold text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">CC:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingScores.cc}
                      onChange={(e) => setEditingScores({ ...editingScores, cc: Number(e.target.value) })}
                      className="mt-1 w-full rounded border border-slate-300 p-1.5 text-center font-mono font-bold text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">LR:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingScores.lr}
                      onChange={(e) => setEditingScores({ ...editingScores, lr: Number(e.target.value) })}
                      className="mt-1 w-full rounded border border-slate-300 p-1.5 text-center font-mono font-bold text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">GRA:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingScores.gra}
                      onChange={(e) => setEditingScores({ ...editingScores, gra: Number(e.target.value) })}
                      className="mt-1 w-full rounded border border-slate-300 p-1.5 text-center font-mono font-bold text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-emerald-800">OVERALL:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9"
                      value={editingScores.overall}
                      onChange={(e) => setEditingScores({ ...editingScores, overall: Number(e.target.value) })}
                      className="mt-1 w-full rounded border-2 border-emerald-600 p-1.5 text-center font-mono font-extrabold text-sm bg-white text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              {/* Teacher Remarks */}
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Lời phê và hướng dẫn sửa của giáo viên:
                </label>
                <textarea
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  rows={4}
                  placeholder="Nhận xét điểm mạnh, điểm cần khắc phục và định hướng cho học sinh..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveTeacherReview}
                className="rounded-lg bg-emerald-700 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 shadow-xs"
              >
                Xác Nhận & Xuất Bản Điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
