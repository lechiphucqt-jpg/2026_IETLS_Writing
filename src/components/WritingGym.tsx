import { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Puzzle,
  Layers,
} from 'lucide-react';
import type { CollocationGameItem, GymGameStats, SyntaxPuzzleItem } from '../types/ielts';

const GYM_STORAGE_KEY = 'ielts_writing_gym_stats_v1';

const INITIAL_STATS: GymGameStats = {
  xp: 120,
  streakDays: 3,
  lastPlayedDate: new Date().toISOString().slice(0, 10),
  gamesPlayed: 5,
  correctAnswers: 18,
  unlockedBadgeIds: ['badge_first_step', 'badge_collocation_novice'],
};

const COLLOCATION_POOL: CollocationGameItem[] = [
  { id: '1', verb: 'mitigate', noun: 'environmental degradation', meaningVi: 'giảm thiểu suy thoái môi trường', topic: 'Environment' },
  { id: '2', verb: 'foster', noun: 'innovation and creativity', meaningVi: 'nuôi dưỡng sự đổi mới và sáng tạo', topic: 'Education' },
  { id: '3', verb: 'exert', noun: 'a detrimental influence on', meaningVi: 'gây ảnh hưởng có hại lên...', topic: 'Society' },
  { id: '4', verb: 'pave', noun: 'the way for breakthroughs', meaningVi: 'mở đường cho các bước đột phá', topic: 'Technology' },
  { id: '5', verb: 'bridge', noun: 'the socio-economic divide', meaningVi: 'thu hẹp khoảng cách kinh tế xã hội', topic: 'Society' },
  { id: '6', verb: 'curb', noun: 'the proliferation of crime', meaningVi: 'kiểm soát sự gia tăng của tội phạm', topic: 'Crime' },
  { id: '7', verb: 'instill', noun: 'moral values into children', meaningVi: 'thấm nhuần giá trị đạo đức cho trẻ', topic: 'Education' },
  { id: '8', verb: 'stimulate', noun: 'economic growth and trade', meaningVi: 'kích thích tăng trưởng kinh tế', topic: 'Economy' },
];

const SYNTAX_PUZZLES: SyntaxPuzzleItem[] = [
  {
    id: 'syn1',
    targetPattern: 'Đảo ngữ phủ định (Negative Inversion)',
    fragments: ['Not only', 'does modern technology', 'enhance productivity,', 'but it also', 'fosters global connectivity.'],
    correctOrder: ['Not only', 'does modern technology', 'enhance productivity,', 'but it also', 'fosters global connectivity.'],
    fullSentence: 'Not only does modern technology enhance productivity, but it also fosters global connectivity.',
    explanation: 'Cấu trúc đảo ngữ: Not only + trợ động từ + S + V..., but S also... giúp nâng điểm Grammatical Range lên Band 8.0+.',
  },
  {
    id: 'syn2',
    targetPattern: 'Câu chẻ nhấn mạnh (Cleft Sentence)',
    fragments: ['It is', 'through concerted governmental policies', 'that carbon emissions', 'can be drastically mitigated.'],
    correctOrder: ['It is', 'through concerted governmental policies', 'that carbon emissions', 'can be drastically mitigated.'],
    fullSentence: 'It is through concerted governmental policies that carbon emissions can be drastically mitigated.',
    explanation: 'Cấu trúc câu chẻ: It is + cụm trạng từ/chủ ngữ + that... nhấn mạnh đối tượng chịu trách nhiệm chính.',
  },
  {
    id: 'syn3',
    targetPattern: 'Mệnh đề phân từ hoàn thành (Perfect Participle Clause)',
    fragments: ['Having acknowledged', 'the environmental consequences,', 'policymakers must now', 'implement stringent regulations.'],
    correctOrder: ['Having acknowledged', 'the environmental consequences,', 'policymakers must now', 'implement stringent regulations.'],
    fullSentence: 'Having acknowledged the environmental consequences, policymakers must now implement stringent regulations.',
    explanation: 'Mệnh đề phân từ "Having + V3/ed" rút gọn một mệnh đề trạng ngữ chỉ thời gian/nguyên nhân trước đó.',
  },
];

export function WritingGym() {
  const [activeMode, setActiveMode] = useState<'collocation' | 'syntax'>('collocation');

  const [stats, setStats] = useState<GymGameStats>(() => {
    try {
      const raw = localStorage.getItem(GYM_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(GYM_STORAGE_KEY, JSON.stringify(stats));
    } catch {}
  }, [stats]);

  // Collocation game state
  const [collocIndex, setCollocIndex] = useState(0);
  const [selectedNoun, setSelectedNoun] = useState<string | null>(null);
  const [collocFeedback, setCollocFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [shuffledNouns, setShuffledNouns] = useState<string[]>([]);

  const currentColloc = COLLOCATION_POOL[collocIndex % COLLOCATION_POOL.length];

  useEffect(() => {
    // Generate 4 noun choices including the correct one
    const correct = currentColloc.noun;
    const others = COLLOCATION_POOL.filter((c) => c.noun !== correct)
      .map((c) => c.noun)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setShuffledNouns([correct, ...others].sort(() => 0.5 - Math.random()));
    setSelectedNoun(null);
    setCollocFeedback(null);
  }, [collocIndex]);

  const handleSelectNoun = (noun: string) => {
    if (collocFeedback !== null) return;
    setSelectedNoun(noun);
    if (noun === currentColloc.noun) {
      setCollocFeedback('correct');
      setStats((prev) => ({
        ...prev,
        xp: prev.xp + 20,
        correctAnswers: prev.correctAnswers + 1,
        gamesPlayed: prev.gamesPlayed + 1,
      }));
    } else {
      setCollocFeedback('wrong');
      setStats((prev) => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
      }));
    }
  };

  // Syntax puzzle state
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const currentPuzzle = SYNTAX_PUZZLES[puzzleIndex % SYNTAX_PUZZLES.length];
  const [chosenOrder, setChosenOrder] = useState<string[]>([]);
  const [availableFragments, setAvailableFragments] = useState<string[]>([]);
  const [puzzleSubmitted, setPuzzleSubmitted] = useState(false);
  const [puzzleIsCorrect, setPuzzleIsCorrect] = useState(false);

  useEffect(() => {
    setAvailableFragments([...currentPuzzle.fragments].sort(() => 0.5 - Math.random()));
    setChosenOrder([]);
    setPuzzleSubmitted(false);
  }, [puzzleIndex]);

  const handlePickFragment = (frag: string) => {
    if (puzzleSubmitted) return;
    setChosenOrder([...chosenOrder, frag]);
    setAvailableFragments(availableFragments.filter((f) => f !== frag));
  };

  const handleRemoveFragment = (frag: string) => {
    if (puzzleSubmitted) return;
    setChosenOrder(chosenOrder.filter((f) => f !== frag));
    setAvailableFragments([...availableFragments, frag]);
  };

  const checkPuzzle = () => {
    const isOk = chosenOrder.join(' ') === currentPuzzle.correctOrder.join(' ');
    setPuzzleSubmitted(true);
    setPuzzleIsCorrect(isOk);
    if (isOk) {
      setStats((prev) => ({
        ...prev,
        xp: prev.xp + 35,
        correctAnswers: prev.correctAnswers + 1,
        gamesPlayed: prev.gamesPlayed + 1,
      }));
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-900 mb-2">
            <Zap className="h-3.5 w-3.5 text-amber-600" />
            <span>Gamified Writing Gym</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
            Writing Gym & Micro-Skill Training
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Luyện tập phản xạ collocations C1/C2 và cấu trúc câu phức Band 8.0+ dưới dạng minigames hàng ngày.
          </p>
        </div>

        {/* User Progress Badges */}
        <div className="flex items-center gap-4 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Daily Streak</div>
              <div className="font-mono text-base font-bold">{stats.streakDays} Days</div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Total XP</div>
              <div className="font-mono text-base font-bold">{stats.xp} pts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="mt-8 flex gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveMode('collocation')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeMode === 'collocation'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          Minigame 1: Collocation Matcher
        </button>
        <button
          onClick={() => setActiveMode('syntax')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeMode === 'syntax'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Puzzle className="h-4 w-4" />
          Minigame 2: Syntax Puzzle (Cấu trúc câu phức)
        </button>
      </div>

      {/* Mode 1: Collocation Matcher */}
      {activeMode === 'collocation' && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Chủ đề: {currentColloc.topic}
              </span>
              <h2 className="mt-1 font-serif text-xl font-bold text-slate-900">
                Chọn cụm danh từ thích hợp đi cùng động từ học thuật:
              </h2>
            </div>
            <span className="font-mono text-xs font-medium text-slate-500">
              Câu {((collocIndex) % COLLOCATION_POOL.length) + 1} / {COLLOCATION_POOL.length}
            </span>
          </div>

          {/* Big Verb Card */}
          <div className="my-8 flex flex-col items-center justify-center rounded-xl bg-blue-50/60 border border-blue-100 py-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Academic Verb</span>
            <div className="mt-2 font-serif text-4xl font-extrabold text-blue-950 tracking-wide">
              {currentColloc.verb} ...
            </div>
            <div className="mt-2 text-sm text-slate-600 italic">
              Nghĩa tiếng Việt gợi ý: "{currentColloc.meaningVi}"
            </div>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {shuffledNouns.map((noun) => {
              const isSelected = selectedNoun === noun;
              const isCorrect = noun === currentColloc.noun;

              let btnStyle = 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-slate-800';
              if (collocFeedback !== null) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                } else if (isSelected) {
                  btnStyle = 'border-red-400 bg-red-50 text-red-900';
                } else {
                  btnStyle = 'opacity-40 border-slate-200';
                }
              }

              return (
                <button
                  key={noun}
                  onClick={() => handleSelectNoun(noun)}
                  disabled={collocFeedback !== null}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${btnStyle}`}
                >
                  <span className="font-medium">{noun}</span>
                  {collocFeedback !== null && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  )}
                  {collocFeedback !== null && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          {collocFeedback !== null && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2">
                {collocFeedback === 'correct' ? (
                  <>
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-semibold text-emerald-700">
                      Chính xác! +20 XP • Collocation chuẩn Band 8.0: <em>{currentColloc.verb} {currentColloc.noun}</em>
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-700">
                      Chưa chính xác. Đáp án đúng là: <strong>{currentColloc.verb} {currentColloc.noun}</strong>
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={() => setCollocIndex((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                <span>Cụm tiếp theo</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Syntax Puzzle */}
      {activeMode === 'syntax' && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">
              Mẫu câu mục tiêu: {currentPuzzle.targetPattern}
            </span>
            <h2 className="mt-1 font-serif text-xl font-bold text-slate-900">
              Sắp xếp các mảnh ghép câu dưới đây thành một câu học thuật hoàn chỉnh:
            </h2>
          </div>

          {/* Assembly Board */}
          <div className="my-6 min-h-[120px] rounded-xl border-2 border-dashed border-blue-200 bg-slate-50/80 p-5 flex flex-wrap items-center gap-2">
            {chosenOrder.length === 0 ? (
              <span className="text-sm text-slate-400 italic">Nhấp vào các mảnh ghép bên dưới để xếp vào đây...</span>
            ) : (
              chosenOrder.map((frag) => (
                <button
                  key={frag}
                  onClick={() => handleRemoveFragment(frag)}
                  disabled={puzzleSubmitted}
                  className="rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-medium text-white shadow-xs hover:bg-blue-800 transition-colors"
                >
                  {frag} ✕
                </button>
              ))
            )}
          </div>

          {/* Fragments to pick */}
          <div className="flex flex-wrap gap-2 mb-6">
            {availableFragments.map((frag) => (
              <button
                key={frag}
                onClick={() => handlePickFragment(frag)}
                disabled={puzzleSubmitted}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 hover:border-blue-500 hover:bg-blue-50/50 shadow-xs transition-colors"
              >
                + {frag}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <button
              onClick={() => {
                setAvailableFragments([...currentPuzzle.fragments].sort(() => 0.5 - Math.random()));
                setChosenOrder([]);
                setPuzzleSubmitted(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Đặt lại (Reset)
            </button>

            {!puzzleSubmitted ? (
              <button
                onClick={checkPuzzle}
                disabled={chosenOrder.length !== currentPuzzle.fragments.length}
                className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
              >
                Kiểm tra câu
              </button>
            ) : (
              <button
                onClick={() => setPuzzleIndex((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                <span>Câu đố tiếp theo</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Puzzle Explanation */}
          {puzzleSubmitted && (
            <div className={`mt-6 rounded-xl p-5 border ${puzzleIsCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2 font-semibold">
                {puzzleIsCorrect ? (
                  <span className="text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Chính xác! +35 XP
                  </span>
                ) : (
                  <span className="text-red-800 flex items-center gap-1.5">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Thứ tự chưa chuẩn.
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-800 font-serif">
                <strong>Câu chuẩn:</strong> {currentPuzzle.fullSentence}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                💡 <strong>Giải thích ngữ pháp:</strong> {currentPuzzle.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
