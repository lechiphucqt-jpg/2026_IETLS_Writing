import { useState, useEffect } from 'react';
import { Key, Sparkles, ExternalLink, Check, ShieldCheck, X } from 'lucide-react';
import {
  AVAILABLE_MODELS,
  getStoredAiSettings,
  saveAiSettings,
} from '../utils/geminiAi';
import type { GeminiModelId } from '../types/ielts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
  required?: boolean;
}

export function SettingsModal({
  isOpen,
  onClose,
  onSettingsSaved,
  required = false,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>('gemini-3-flash-preview');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getStoredAiSettings();
      setApiKey(current.apiKey);
      setSelectedModel(current.selectedModel);
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAiSettings({
      apiKey,
      selectedModel,
    });
    setIsSaved(true);
    onSettingsSaved?.();
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-700" />
            <h2 className="font-serif text-xl font-bold text-slate-900">
              Cấu Hình Model AI & Google Gemini API Key
            </h2>
          </div>
          {!required && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mt-5 space-y-5">
          {/* Instruction & Link */}
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-900">
                  Lấy API Key Google Gemini miễn phí để sử dụng phần mềm
                </p>
                <p className="mt-1 text-xs text-red-800 leading-relaxed">
                  Để hệ thống phân tích không bị gián đoạn hoặc hết hạn ngạch (quota 429), bạn hãy truy cập Google AI Studio để tạo key cá nhân miễn phí và dán vào bên dưới:
                </p>
                <a
                  href="https://aistudio.google.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors"
                >
                  <span>Truy cập https://aistudio.google.com/api-keys để lấy key</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Nhập Google Gemini API Key của bạn:
            </label>
            <div className="relative mt-1.5">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 pr-10 font-mono text-sm focus:border-blue-700 focus:bg-white focus:outline-none"
              />
              <Key className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              * Khóa API được lưu an toàn trực tiếp vào <code>localStorage</code> trên trình duyệt của bạn và không gửi về máy chủ thứ ba.
            </p>
          </div>

          {/* Model Selection Cards */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Chọn Model AI Chấm Bài (Thứ tự Fallback tự động):
            </label>
            <div className="mt-2 space-y-2.5">
              {AVAILABLE_MODELS.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-blue-700 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{m.name}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            m.isDefault
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {m.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">{m.description}</p>
                    </div>

                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        isSelected
                          ? 'border-blue-700 bg-blue-700 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Tự động Fallback khi gặp lỗi 429</span>
          </div>

          <div className="flex gap-2">
            {!required && (
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
            )}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-800 transition-colors"
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <span>Lưu Cấu Hình</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
