import { useState, useEffect } from 'react';
import {
  Bookmark,
  Search,
  Plus,
  Trash2,
  Download,
  BookOpen,
  Sparkles,
  ExternalLink,
  Tag,
  Check,
} from 'lucide-react';
import type { VocabItem } from '../types/ielts';

const VOCAB_STORAGE_KEY = 'ielts_writing_vocab_bank_v1';

const DEFAULT_VOCABULARY: VocabItem[] = [
  {
    id: 'v1',
    word: 'mitigate',
    phonetic: '/ˈmɪt.ɪ.ɡeɪt/',
    bandLevel: 'C1',
    definitionEn: 'To make something less harmful, serious, or severe.',
    definitionVi: 'Làm dịu bớt, giảm nhẹ mức độ nghiêm trọng.',
    collocations: ['mitigate environmental damage', 'mitigate the negative impact', 'mitigate risks'],
    exampleSentence: 'Strict governmental regulations can significantly mitigate industrial air pollution.',
    topic: 'Environment',
    dateAdded: '2026-03-01',
    mastered: false,
  },
  {
    id: 'v2',
    word: 'exert',
    phonetic: '/ɪɡˈzɜːt/',
    bandLevel: 'C1',
    definitionEn: 'To use power or influence to affect somebody or something.',
    definitionVi: 'Tác động, tạo áp lực hoặc ảnh hưởng lên ai/cái gì.',
    collocations: ['exert a profound influence on', 'exert pressure on policymakers'],
    exampleSentence: 'Excessive screen time exerts a detrimental influence on cognitive development in adolescents.',
    topic: 'Technology',
    dateAdded: '2026-03-02',
    mastered: true,
  },
  {
    id: 'v3',
    word: 'proliferation',
    phonetic: '/prəˌlɪf.əˈreɪ.ʃən/',
    bandLevel: 'C2',
    definitionEn: 'A rapid increase in the number or amount of something.',
    definitionVi: 'Sự sinh sôi, gia tăng nhanh chóng theo cấp số nhân.',
    collocations: ['the proliferation of smart devices', 'proliferation of cybercrime'],
    exampleSentence: 'The rapid proliferation of social media platforms has revolutionized communication.',
    topic: 'Technology',
    dateAdded: '2026-03-03',
    mastered: false,
  },
  {
    id: 'v4',
    word: 'foster',
    phonetic: '/ˈfɒs.tər/',
    bandLevel: 'C1',
    definitionEn: 'To encourage something to develop; promote growth.',
    definitionVi: 'Khuyến khích, nuôi dưỡng và thúc đẩy sự phát triển.',
    collocations: ['foster a sense of community', 'foster critical thinking skills'],
    exampleSentence: 'Interactive classroom environments foster mutual collaboration among students.',
    topic: 'Education',
    dateAdded: '2026-03-04',
    mastered: false,
  },
  {
    id: 'v5',
    word: 'ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    bandLevel: 'C2',
    definitionEn: 'Present, appearing, or found everywhere.',
    definitionVi: 'Phổ biến khắp nơi, có mặt ở mọi nơi.',
    collocations: ['ubiquitous presence of smartphones', 'become ubiquitous in daily life'],
    exampleSentence: 'Artificial intelligence has become an ubiquitous component of modern healthcare systems.',
    topic: 'Technology',
    dateAdded: '2026-03-05',
    mastered: true,
  },
];

const SAMPLE_READING_TEXT = `In recent years, the rapid proliferation of artificial intelligence has exerted a profound influence on contemporary pedagogical paradigms. Proponents argue that automated assessment tools foster self-directed learning and democratize educational resources. Conversely, skeptics emphasize the risk of exacerbating socio-economic disparities, particularly in underprivileged communities lacking technological infrastructure. Consequently, governments must formulate comprehensive frameworks to mitigate these potential externalities and ensure equitable access.`;

export function VocabularyBank() {
  const [items, setItems] = useState<VocabItem[]>(() => {
    try {
      const raw = localStorage.getItem(VOCAB_STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_VOCABULARY;
    } catch {
      return DEFAULT_VOCABULARY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [activeTab, setActiveTab] = useState<'vault' | 'reader'>('vault');

  // Reader state
  const [readingText, setReadingText] = useState(SAMPLE_READING_TEXT);
  const [highlightedPhrase, setHighlightedPhrase] = useState('');
  const [capturedNotice, setCapturedNotice] = useState(false);

  // New item modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newBand, setNewBand] = useState<'B2' | 'C1' | 'C2'>('C1');
  const [newMeaningVi, setNewMeaningVi] = useState('');
  const [newMeaningEn, setNewMeaningEn] = useState('');
  const [newColloc, setNewColloc] = useState('');
  const [newSentence, setNewSentence] = useState('');
  const [newTopic, setNewTopic] = useState('General');

  const topics = ['All', 'Environment', 'Technology', 'Education', 'Society', 'General'];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definitionVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exampleSentence.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'All' || item.topic === selectedTopic;
    const matchesLevel = selectedLevel === 'All' || item.bandLevel === selectedLevel;
    return matchesSearch && matchesTopic && matchesLevel;
  });

  const handleAddNewItem = () => {
    if (!newWord.trim()) return;
    const item: VocabItem = {
      id: `v_${Date.now()}`,
      word: newWord.trim(),
      bandLevel: newBand,
      definitionEn: newMeaningEn.trim(),
      definitionVi: newMeaningVi.trim(),
      collocations: newColloc ? newColloc.split(',').map((c) => c.trim()) : [],
      exampleSentence: newSentence.trim(),
      topic: newTopic,
      dateAdded: new Date().toISOString().slice(0, 10),
      mastered: false,
    };
    setItems([item, ...items]);
    setShowAddModal(false);
    setNewWord('');
    setNewMeaningVi('');
    setNewMeaningEn('');
    setNewColloc('');
    setNewSentence('');
  };

  const handleExportCsv = () => {
    const headers = ['Word', 'Band Level', 'Topic', 'Definition (VI)', 'Definition (EN)', 'Collocations', 'Example'];
    const rows = items.map((i) => [
      `"${i.word}"`,
      `"${i.bandLevel}"`,
      `"${i.topic}"`,
      `"${i.definitionVi.replace(/"/g, '""')}"`,
      `"${i.definitionEn.replace(/"/g, '""')}"`,
      `"${i.collocations.join('; ').replace(/"/g, '""')}"`,
      `"${i.exampleSentence.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IELTS_Vocabulary_Bank_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleTextSelect = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 2 && selection.length < 50) {
      setHighlightedPhrase(selection);
    }
  };

  const handleSaveHighlighted = () => {
    if (!highlightedPhrase) return;
    const item: VocabItem = {
      id: `v_${Date.now()}`,
      word: highlightedPhrase,
      bandLevel: 'C1',
      definitionEn: 'Extracted from reading text',
      definitionVi: 'Trích xuất từ tài liệu đọc học thuật',
      collocations: [],
      exampleSentence: highlightedPhrase,
      topic: 'Reading',
      dateAdded: new Date().toISOString().slice(0, 10),
      mastered: false,
    };
    setItems([item, ...items]);
    setCapturedNotice(true);
    setTimeout(() => setCapturedNotice(false), 2500);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-900 mb-2">
            <Bookmark className="h-3.5 w-3.5 text-blue-700" />
            <span>Academic Lexical Vault</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
            Vocabulary Bank & Reading Assistant
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Sổ tay lưu trữ cụm từ học thuật C1/C2 và trình hỗ trợ bôi đen trích xuất từ vựng từ bài báo/bài mẫu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4" />
            Xuất CSV / Anki
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Thêm từ mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('vault')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'vault' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="h-4 w-4" />
          Sổ tay Từ Vựng ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('reader')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'reader' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Trình Đọc & Trích Xuất (Extension Simulator)
        </button>
      </div>

      {/* Tab 1: Vault */}
      {activeTab === 'vault' && (
        <div className="mt-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng, collocation hoặc nghĩa tiếng Việt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-700 focus:outline-none shadow-xs"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none shadow-xs"
              >
                {topics.map((t) => (
                  <option key={t} value={t}>
                    Chủ đề: {t}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none shadow-xs"
              >
                <option value="All">Level: Tất cả</option>
                <option value="B2">B2 (Vantage)</option>
                <option value="C1">C1 (Effective)</option>
                <option value="C2">C2 (Mastery)</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-900">{item.word}</h3>
                      {item.phonetic && <span className="text-xs text-slate-400 font-mono">{item.phonetic}</span>}
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-bold font-mono ${
                        item.bandLevel === 'C2'
                          ? 'bg-purple-100 text-purple-800'
                          : item.bandLevel === 'C1'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.bandLevel}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-blue-900">{item.definitionVi}</p>
                  {item.definitionEn && <p className="mt-1 text-xs text-slate-600 italic">{item.definitionEn}</p>}

                  {item.collocations.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Collocations:
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {item.collocations.map((c) => (
                          <span
                            key={c}
                            className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.exampleSentence && (
                    <div className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-600 font-serif leading-relaxed">
                      "{item.exampleSentence}"
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                  <span>Topic: {item.topic}</span>
                  <button
                    onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Reading Assistant & Highlighter */}
      {activeTab === 'reader' && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="font-serif text-base font-bold text-slate-900">
                Trình Đọc Học Thuật (Bôi đen từ/cụm từ để trích xuất)
              </h2>
              <span className="text-xs text-slate-400">Pasted or Sample Article</span>
            </div>

            <div
              onMouseUp={handleTextSelect}
              className="font-serif text-base leading-relaxed text-slate-800 bg-slate-50/50 p-5 rounded-lg border border-slate-200 cursor-text select-text"
            >
              {readingText}
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Hoặc dán bài báo khác vào đây để đọc:
              </label>
              <textarea
                value={readingText}
                onChange={(e) => setReadingText(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-lg border border-slate-300 p-3 text-xs font-mono focus:border-blue-700 focus:outline-none"
                placeholder="Dán bài báo tiếng Anh (BBC, The Guardian, National Geographic)..."
              />
            </div>
          </div>

          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <Sparkles className="h-4 w-4 text-blue-700" />
                <h3 className="font-serif text-base font-bold text-slate-900">Phân Tích Cụm Từ Bôi Đen</h3>
              </div>

              {highlightedPhrase ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                    <span className="text-xs uppercase font-semibold text-blue-700">Cụm từ đã chọn:</span>
                    <div className="mt-1 font-serif text-xl font-bold text-blue-950">
                      "{highlightedPhrase}"
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed">
                    💡 <strong>Đánh giá nhanh:</strong> Cụm từ mang sắc thái học thuật cao, phù hợp sử dụng cho IELTS Writing Task 2.
                  </div>

                  <button
                    onClick={handleSaveHighlighted}
                    className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 py-2.5 text-xs font-medium text-white hover:bg-blue-800 shadow-xs"
                  >
                    <Bookmark className="h-4 w-4" />
                    Lưu vào Sổ tay Từ Vựng
                  </button>

                  {capturedNotice && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 justify-center">
                      <Check className="h-4 w-4" />
                      Đã lưu thành công vào Sổ tay!
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-slate-500 italic">
                  Dùng chuột bôi đen bất kỳ từ hoặc cụm từ nào ở bài đọc bên trái để phân tích và lưu trữ tức thì.
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 text-xs text-slate-400">
              Mẹo: Tính năng mô phỏng Chrome Extension, cho phép thu thập collocations từ bài đọc thực tế.
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Thêm Từ Vựng / Collocation Mới
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-700">Từ hoặc cụm từ (*):</label>
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Ví dụ: exacerbate the situation"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Level CEFR:</label>
                  <select
                    value={newBand}
                    onChange={(e) => setNewBand(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                  >
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Chủ đề:</label>
                  <select
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                  >
                    <option value="General">General</option>
                    <option value="Environment">Environment</option>
                    <option value="Technology">Technology</option>
                    <option value="Education">Education</option>
                    <option value="Society">Society</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Nghĩa tiếng Việt:</label>
                <input
                  type="text"
                  value={newMeaningVi}
                  onChange={(e) => setNewMeaningVi(e.target.value)}
                  placeholder="Làm trầm trọng thêm tình hình"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Các Collocations đi kèm (phẩy ngăn cách):</label>
                <input
                  type="text"
                  value={newColloc}
                  onChange={(e) => setNewColloc(e.target.value)}
                  placeholder="exacerbate problems, exacerbate tensions"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Câu ví dụ áp dụng:</label>
                <textarea
                  value={newSentence}
                  onChange={(e) => setNewSentence(e.target.value)}
                  rows={2}
                  placeholder="This policy may inadvertently exacerbate socio-economic inequalities."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-serif"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleAddNewItem}
                className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800"
              >
                Lưu vào Sổ tay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
