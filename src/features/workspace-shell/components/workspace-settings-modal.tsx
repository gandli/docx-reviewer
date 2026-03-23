import { useEffect, useState } from "react";
import type { LocalLLMModelOption } from "@/services/ai/local-llm";
import type { AppThemeId } from "@/services/persistence/app-settings";
import { themeOptions } from "@/shared/constants/theme";

type WorkspaceSettingsModalProps = {
  isOpen: boolean;
  workspaceTitle: string;
  selectedThemeId: AppThemeId;
  reviewPromptNote: string;
  selectedModelId: string;
  modelOptions: readonly LocalLLMModelOption[];
  onClose: () => void;
  onSave: (payload: {
    workspaceTitle: string;
    themeId: AppThemeId;
    reviewPromptNote: string;
    modelId: string;
  }) => void;
  onClear: () => void;
};

export function WorkspaceSettingsModal({
  isOpen,
  workspaceTitle,
  selectedThemeId,
  reviewPromptNote,
  selectedModelId,
  modelOptions,
  onClose,
  onSave,
  onClear,
}: WorkspaceSettingsModalProps) {
  const [draftTitle, setDraftTitle] = useState(workspaceTitle);
  const [draftThemeId, setDraftThemeId] = useState<AppThemeId>(selectedThemeId);
  const [draftPromptNote, setDraftPromptNote] = useState(reviewPromptNote);
  const [draftModelId, setDraftModelId] = useState(selectedModelId);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftTitle(workspaceTitle);
    setDraftThemeId(selectedThemeId);
    setDraftPromptNote(reviewPromptNote);
    setDraftModelId(selectedModelId);
  }, [isOpen, reviewPromptNote, selectedModelId, selectedThemeId, workspaceTitle]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,14,10,0.45)] px-6 py-10 backdrop-blur-sm">
      <section className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[rgba(216,207,193,0.9)] bg-[rgba(251,248,242,0.98)] shadow-[0_28px_80px_rgba(41,31,21,0.22)]">
        <header className="flex items-start justify-between gap-4 border-b border-[rgba(216,207,193,0.72)] px-6 py-5">
          <div>
            <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
              Workspace
            </div>
            <h2 className="mt-2 text-[1.35rem] font-bold text-[var(--color-text-primary)]">
              工作区设置
            </h2>
            <p className="mt-1 font-sans text-[0.9rem] leading-[1.6] text-[var(--color-text-muted)]">
              这里可以统一调整当前工作区名称、提示词偏好、主题色和本地模型，并清空这一个工作区在本机浏览器里的保存记录。
            </p>
          </div>
          <button
            className="cursor-pointer rounded-full border border-[rgba(216,207,193,0.78)] bg-[rgba(255,251,244,0.86)] px-3 py-2 font-sans text-[0.82rem] text-[var(--color-text-secondary)]"
            type="button"
            onClick={onClose}
          >
            关闭
          </button>
        </header>

        <div className="grid gap-5 px-6 py-5">
          <label className="grid gap-2">
            <span className="font-sans text-[0.86rem] font-semibold text-[var(--color-text-secondary)]">
              工作区名称
            </span>
            <input
              aria-label="工作区名称"
              className="w-full rounded-2xl border border-[rgba(216,207,193,0.86)] bg-white/80 px-4 py-3 font-sans text-[0.95rem] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
            />
          </label>

          <div className="grid gap-2">
            <span className="font-sans text-[0.86rem] font-semibold text-[var(--color-text-secondary)]">
              提示词偏好
            </span>
            <textarea
              aria-label="提示词偏好"
              className="min-h-28 w-full rounded-2xl border border-[rgba(216,207,193,0.86)] bg-white/80 px-4 py-3 font-sans text-[0.92rem] leading-[1.7] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
              placeholder="例如：审阅时更严格关注事实完整性；改写时保持更正式的机关文风。"
              value={draftPromptNote}
              onChange={(event) => setDraftPromptNote(event.target.value)}
            />
          </div>

          <div className="grid gap-3">
            <span className="font-sans text-[0.86rem] font-semibold text-[var(--color-text-secondary)]">
              主题色
            </span>
            <div className="grid gap-3 md:grid-cols-3">
              {themeOptions.map((option) => {
                const isSelected = draftThemeId === option.id;
                return (
                  <label
                    key={option.id}
                    className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
                      isSelected
                        ? "border-[rgba(181,142,83,0.72)] bg-[rgba(251,246,233,0.96)] shadow-[0_0_0_3px_rgba(181,142,83,0.12)]"
                        : "border-[rgba(216,207,193,0.78)] bg-[rgba(255,252,247,0.86)]"
                    }`}
                  >
                    <input
                      checked={isSelected}
                      className="sr-only"
                      name="theme-id"
                      type="radio"
                      value={option.id}
                      onChange={() => setDraftThemeId(option.id)}
                    />
                    <div className="text-[0.96rem] font-semibold text-[var(--color-text-primary)]">
                      {option.label}
                    </div>
                    <div className="mt-1 font-sans text-[0.82rem] leading-[1.6] text-[var(--color-text-muted)]">
                      {option.summary}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <span className="font-sans text-[0.86rem] font-semibold text-[var(--color-text-secondary)]">
              本地模型
            </span>
            <select
              aria-label="本地模型"
              className="w-full rounded-2xl border border-[rgba(216,207,193,0.86)] bg-white/80 px-4 py-3 font-sans text-[0.92rem] text-[var(--color-text-primary)] outline-none"
              value={draftModelId}
              onChange={(event) => setDraftModelId(event.target.value)}
            >
              {modelOptions.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label} · {model.summary}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-[rgba(216,207,193,0.76)] bg-[rgba(255,252,247,0.9)] px-4 py-4">
            <div className="text-[0.96rem] font-semibold text-[var(--color-text-primary)]">
              清空当前工作区记录
            </div>
            <div className="mt-1 font-sans text-[0.86rem] leading-[1.6] text-[var(--color-text-muted)]">
              只会删除这个工作区保存在本机浏览器里的内容，不影响你的模型设置。
            </div>
            <button
              className="mt-4 cursor-pointer rounded-full border border-[rgba(191,132,104,0.32)] bg-[rgba(255,245,240,0.92)] px-4 py-2 font-sans text-[0.84rem] font-semibold text-[rgba(143,83,52,0.96)]"
              type="button"
              onClick={onClear}
            >
              清空当前工作区记录
            </button>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[rgba(216,207,193,0.72)] px-6 py-4">
          <button
            className="cursor-pointer rounded-full border border-[rgba(216,207,193,0.78)] bg-[rgba(255,251,244,0.86)] px-4 py-2 font-sans text-[0.84rem] text-[var(--color-text-secondary)]"
            type="button"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="cursor-pointer rounded-full border-0 bg-[rgba(47,38,29,0.94)] px-4 py-2 font-sans text-[0.84rem] font-semibold text-[#fffdf9]"
            type="button"
            onClick={() =>
              onSave({
                workspaceTitle: draftTitle,
                themeId: draftThemeId,
                reviewPromptNote: draftPromptNote,
                modelId: draftModelId,
              })
            }
          >
            保存设置
          </button>
        </footer>
      </section>
    </div>
  );
}
