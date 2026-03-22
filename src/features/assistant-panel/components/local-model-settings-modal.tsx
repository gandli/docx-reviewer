import { useEffect, useMemo, useState } from "react";
import type { LocalLLMModelOption } from "@/services/ai/local-llm";

type LocalModelSettingsModalProps = {
  isOpen: boolean;
  selectedModelId: string;
  activeModelId?: string;
  modelOptions: readonly LocalLLMModelOption[];
  isBusy?: boolean;
  isSupported?: boolean;
  onClose: () => void;
  onConfirm: (modelId: string) => void;
};

export function LocalModelSettingsModal({
  isOpen,
  selectedModelId,
  activeModelId,
  modelOptions,
  isBusy = false,
  isSupported = true,
  onClose,
  onConfirm,
}: LocalModelSettingsModalProps) {
  const [query, setQuery] = useState("");
  const [draftModelId, setDraftModelId] = useState(selectedModelId);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setQuery("");
    setDraftModelId(selectedModelId);
  }, [isOpen, selectedModelId]);

  const filteredModels = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return modelOptions;
    }

    return modelOptions.filter((model) =>
      [model.label, model.summary, model.id, ...model.tags]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [modelOptions, query]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,14,10,0.45)] px-6 py-10 backdrop-blur-sm">
      <section className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-[rgba(216,207,193,0.9)] bg-[rgba(251,248,242,0.98)] shadow-[0_28px_80px_rgba(41,31,21,0.22)]">
        <header className="flex items-start justify-between gap-4 border-b border-[rgba(216,207,193,0.72)] px-6 py-5">
          <div>
            <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
              Local Model
            </div>
            <h2 className="mt-2 text-[1.35rem] font-bold text-[var(--color-text-primary)]">
              本地模型设置
            </h2>
            <p className="mt-1 font-sans text-[0.9rem] leading-[1.6] text-[var(--color-text-muted)]">
              选择要用于文件审阅、改写和润色的本地模型。你的选择会保存在当前浏览器里。
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

        <div className="border-b border-[rgba(216,207,193,0.72)] px-6 py-4">
          <input
            className="w-full rounded-2xl border border-[rgba(216,207,193,0.86)] bg-white/80 px-4 py-3 font-sans text-[0.92rem] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            placeholder="搜索模型"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {!isSupported ? (
            <p className="mt-3 font-sans text-[0.84rem] leading-[1.6] text-[rgba(143,83,52,0.92)]">
              当前浏览器不支持 WebGPU，所以这里可以先选模型，但暂时无法实际加载。
            </p>
          ) : null}
        </div>

        <div className="grid flex-1 gap-3 overflow-y-auto px-6 py-5" data-scroll-region="true">
          {filteredModels.map((model) => {
            const isSelected = draftModelId === model.id;
            const isActive = activeModelId === model.id;

            return (
              <label
                key={model.id}
                aria-label={model.label}
                className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
                  isSelected
                    ? "border-[rgba(181,142,83,0.72)] bg-[rgba(251,246,233,0.96)] shadow-[0_0_0_3px_rgba(181,142,83,0.12)]"
                    : "border-[rgba(216,207,193,0.78)] bg-[rgba(255,252,247,0.86)]"
                }`}
              >
                <input
                  checked={isSelected}
                  className="sr-only"
                  name="local-model"
                  type="radio"
                  value={model.id}
                  onChange={() => setDraftModelId(model.id)}
                />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[1rem] font-semibold text-[var(--color-text-primary)]">
                      {model.label}
                    </div>
                    <div className="mt-1 font-sans text-[0.86rem] leading-[1.6] text-[var(--color-text-muted)]">
                      {model.summary}
                    </div>
                  </div>
                  {isActive ? (
                    <span className="shrink-0 rounded-full bg-[rgba(181,142,83,0.14)] px-3 py-1 font-sans text-[0.74rem] font-semibold text-[rgba(138,106,55,0.94)]">
                      当前加载
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {model.tags.map((tag) => (
                    <span
                      key={`${model.id}-${tag}`}
                      className="rounded-full bg-[rgba(236,228,216,0.82)] px-3 py-1 font-sans text-[0.72rem] font-semibold text-[var(--color-text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 font-sans text-[0.74rem] text-[var(--color-text-muted)]">
                  {model.id}
                </div>
              </label>
            );
          })}

          {filteredModels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgba(216,207,193,0.8)] px-4 py-6 text-center font-sans text-[0.9rem] text-[var(--color-text-muted)]">
              没找到匹配的模型，可以换个关键词试试。
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-[rgba(216,207,193,0.72)] px-6 py-4">
          <div className="font-sans text-[0.84rem] leading-[1.6] text-[var(--color-text-muted)]">
            已选模型会在下次打开时自动恢复。
          </div>
          <div className="flex items-center gap-3">
            <button
              className="cursor-pointer rounded-full border border-[rgba(216,207,193,0.78)] bg-[rgba(255,251,244,0.86)] px-4 py-2 font-sans text-[0.84rem] text-[var(--color-text-secondary)]"
              type="button"
              onClick={onClose}
            >
              取消
            </button>
            <button
              className="cursor-pointer rounded-full border-0 bg-[rgba(47,38,29,0.94)] px-4 py-2 font-sans text-[0.84rem] font-semibold text-[#fffdf9] disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={isBusy}
              onClick={() => onConfirm(draftModelId)}
            >
              保存并启用
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
