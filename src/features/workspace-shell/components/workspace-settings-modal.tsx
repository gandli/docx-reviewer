import { useEffect, useState } from "react";
import type { LLMProviderOption, LocalLLMModelOption } from "@/services/ai/local-llm";
import type { AppThemeId, LLMProvider } from "@/services/persistence/app-settings";
import { themeOptions } from "@/shared/constants/theme";

type WorkspaceSettingsModalProps = {
  isOpen: boolean;
  workspaceTitle: string;
  selectedThemeId: AppThemeId;
  reviewPromptNote: string;
  llmProvider: LLMProvider;
  selectedModelId: string;
  openAIBaseUrl: string;
  openAIApiKey: string;
  openAIModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  activeModelId?: string;
  providerOptions: readonly LLMProviderOption[];
  modelOptions: readonly LocalLLMModelOption[];
  isModelBusy?: boolean;
  isModelSupported?: boolean;
  onClose: () => void;
  onSave: (payload: {
    workspaceTitle: string;
    themeId: AppThemeId;
    reviewPromptNote: string;
    llmProvider: LLMProvider;
    modelId: string;
    openAIBaseUrl: string;
    openAIApiKey: string;
    openAIModel: string;
    ollamaBaseUrl: string;
    ollamaModel: string;
  }) => void;
  onClear: () => void;
};

export function WorkspaceSettingsModal({
  isOpen,
  workspaceTitle,
  selectedThemeId,
  reviewPromptNote,
  llmProvider,
  selectedModelId,
  openAIBaseUrl,
  openAIApiKey,
  openAIModel,
  ollamaBaseUrl,
  ollamaModel,
  activeModelId,
  providerOptions,
  modelOptions,
  isModelBusy = false,
  isModelSupported = true,
  onClose,
  onSave,
  onClear,
}: WorkspaceSettingsModalProps) {
  const [draftTitle, setDraftTitle] = useState(workspaceTitle);
  const [draftThemeId, setDraftThemeId] = useState<AppThemeId>(selectedThemeId);
  const [draftPromptNote, setDraftPromptNote] = useState(reviewPromptNote);
  const [draftProvider, setDraftProvider] = useState<LLMProvider>(llmProvider);
  const [draftModelId, setDraftModelId] = useState(selectedModelId);
  const [draftOpenAIBaseUrl, setDraftOpenAIBaseUrl] = useState(openAIBaseUrl);
  const [draftOpenAIApiKey, setDraftOpenAIApiKey] = useState(openAIApiKey);
  const [draftOpenAIModel, setDraftOpenAIModel] = useState(openAIModel);
  const [draftOllamaBaseUrl, setDraftOllamaBaseUrl] = useState(ollamaBaseUrl);
  const [draftOllamaModel, setDraftOllamaModel] = useState(ollamaModel);
  const [modelQuery, setModelQuery] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftTitle(workspaceTitle);
    setDraftThemeId(selectedThemeId);
    setDraftPromptNote(reviewPromptNote);
    setDraftProvider(llmProvider);
    setDraftModelId(selectedModelId);
    setDraftOpenAIBaseUrl(openAIBaseUrl);
    setDraftOpenAIApiKey(openAIApiKey);
    setDraftOpenAIModel(openAIModel);
    setDraftOllamaBaseUrl(ollamaBaseUrl);
    setDraftOllamaModel(ollamaModel);
    setModelQuery("");
  }, [
    isOpen,
    llmProvider,
    ollamaBaseUrl,
    ollamaModel,
    openAIBaseUrl,
    openAIApiKey,
    openAIModel,
    reviewPromptNote,
    selectedModelId,
    selectedThemeId,
    workspaceTitle,
  ]);

  const filteredModels = modelOptions.filter((model) =>
    [model.label, model.summary, model.id, model.deviceTier, model.vramHint, ...model.tags]
      .join(" ")
      .toLowerCase()
      .includes(modelQuery.trim().toLowerCase()),
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,14,10,0.45)] px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-8"
      onClick={onClose}
    >
      <section
        className="flex max-h-[min(840px,calc(100vh-48px))] w-full max-w-[880px] min-w-0 flex-col overflow-hidden rounded-[28px] border border-[rgba(216,207,193,0.9)] bg-[rgba(251,248,242,0.98)] shadow-[0_28px_80px_rgba(41,31,21,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="shrink-0 flex items-start justify-between gap-4 border-b border-[rgba(216,207,193,0.72)] px-5 py-5 sm:px-6">
          <div>
            <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
              Workspace
            </div>
            <h2 className="mt-2 text-[1.35rem] font-bold text-[var(--color-text-primary)]">
              工作区设置
            </h2>
            <p className="mt-1 font-sans text-[0.9rem] leading-[1.6] text-[var(--color-text-muted)]">
              这里可以统一调整当前工作区名称、提示词偏好、主题色和模型服务，并清空这一个工作区在本机浏览器里的保存记录。
            </p>
          </div>
          <button
            className="min-w-[72px] cursor-pointer rounded-full border border-[rgba(216,207,193,0.78)] bg-[rgba(255,251,244,0.86)] px-4 py-2 text-center font-sans text-[0.84rem] text-[var(--color-text-secondary)]"
            type="button"
            onClick={onClose}
          >
            关闭
          </button>
        </header>

        <div
          className="grid flex-1 gap-5 overflow-y-auto px-5 py-5 sm:px-6"
          data-scroll-region="true"
        >
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
                    aria-label={option.label}
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

          <div className="grid gap-3">
            <span className="font-sans text-[0.86rem] font-semibold text-[var(--color-text-secondary)]">
              模型服务
            </span>
            <div className="grid gap-3 md:grid-cols-3">
              {providerOptions.map((provider) => {
                const isSelected = draftProvider === provider.id;
                return (
                  <label
                    key={provider.id}
                    className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
                      isSelected
                        ? "border-[rgba(181,142,83,0.72)] bg-[rgba(251,246,233,0.96)] shadow-[0_0_0_3px_rgba(181,142,83,0.12)]"
                        : "border-[rgba(216,207,193,0.78)] bg-[rgba(255,252,247,0.86)]"
                    }`}
                  >
                    <input
                      checked={isSelected}
                      className="sr-only"
                      name="llm-provider"
                      type="radio"
                      value={provider.id}
                      onChange={() => setDraftProvider(provider.id)}
                    />
                    <div className="text-[0.96rem] font-semibold text-[var(--color-text-primary)]">
                      {provider.label}
                    </div>
                    <div className="mt-1 font-sans text-[0.82rem] leading-[1.6] text-[var(--color-text-muted)]">
                      {provider.summary}
                    </div>
                  </label>
                );
              })}
            </div>
            {draftProvider === "webllm" ? (
              <>
            <input
              aria-label="搜索本地模型"
              className="w-full rounded-2xl border border-[rgba(216,207,193,0.86)] bg-white/80 px-4 py-3 font-sans text-[0.92rem] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
              placeholder="搜索模型"
              value={modelQuery}
              onChange={(event) => setModelQuery(event.target.value)}
            />
            {!isModelSupported ? (
              <div className="font-sans text-[0.84rem] leading-[1.6] text-[rgba(143,83,52,0.92)]">
                当前浏览器不支持 WebGPU，所以这里可以先选模型，但暂时无法实际加载。
              </div>
            ) : null}
            <div className="grid gap-3">
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
                        <div className="mt-3 grid gap-1 font-sans text-[0.8rem] leading-[1.5] text-[var(--color-text-secondary)]">
                          <div>
                            推荐设备档位：<span className="font-semibold">{model.deviceTier}</span>
                          </div>
                          <div>
                            显存提示：<span className="font-semibold">{model.vramHint}</span>
                          </div>
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
              </>
            ) : null}
            {draftProvider === "openai" ? (
              <div className="grid gap-3">
                <label className="grid gap-2">
                  <span className="font-sans text-[0.84rem] font-semibold text-[var(--color-text-secondary)]">
                    API 地址
                  </span>
                  <input
                    aria-label="OpenAI 风格 API 地址"
                    className="w-full rounded-2xl border border-[rgba(216,207,193,0.86)] bg-white/80 px-4 py-3 font-sans text-[0.92rem] text-[var(--color-text-primary)] outline-none"
                    value={draftOpenAIBaseUrl}
                    onChange={(event) => setDraftOpenAIBaseUrl(event.target.value)}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="font-sans text-[0.84rem] font-semibold text-[var(--color-text-secondary)]">
                    API Key
                  </span>
                  <input
                    aria-label="OpenAI 风格 API Key"
                    className="w-full rounded-2xl border border-[rgba(216,207,193,0.86)] bg-white/80 px-4 py-3 font-sans text-[0.92rem] text-[var(--color-text-primary)] outline-none"
                    type="password"
                    value={draftOpenAIApiKey}
                    onChange={(event) => setDraftOpenAIApiKey(event.target.value)}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="font-sans text-[0.84rem] font-semibold text-[var(--color-text-secondary)]">
                    模型名
                  </span>
                  <input
                    aria-label="OpenAI 风格模型名"
                    className="w-full rounded-2xl border border-[rgba(216,207,193,0.86)] bg-white/80 px-4 py-3 font-sans text-[0.92rem] text-[var(--color-text-primary)] outline-none"
                    value={draftOpenAIModel}
                    onChange={(event) => setDraftOpenAIModel(event.target.value)}
                  />
                </label>
              </div>
            ) : null}
            {draftProvider === "ollama" ? (
              <div className="grid gap-3">
                <label className="grid gap-2">
                  <span className="font-sans text-[0.84rem] font-semibold text-[var(--color-text-secondary)]">
                    Ollama 地址
                  </span>
                  <input
                    aria-label="Ollama 地址"
                    className="w-full rounded-2xl border border-[rgba(216,207,193,0.86)] bg-white/80 px-4 py-3 font-sans text-[0.92rem] text-[var(--color-text-primary)] outline-none"
                    value={draftOllamaBaseUrl}
                    onChange={(event) => setDraftOllamaBaseUrl(event.target.value)}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="font-sans text-[0.84rem] font-semibold text-[var(--color-text-secondary)]">
                    模型名
                  </span>
                  <input
                    aria-label="Ollama 模型名"
                    className="w-full rounded-2xl border border-[rgba(216,207,193,0.86)] bg-white/80 px-4 py-3 font-sans text-[0.92rem] text-[var(--color-text-primary)] outline-none"
                    value={draftOllamaModel}
                    onChange={(event) => setDraftOllamaModel(event.target.value)}
                  />
                </label>
              </div>
            ) : null}
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

        <footer className="shrink-0 flex items-center justify-end gap-3 border-t border-[rgba(216,207,193,0.72)] px-5 py-4 sm:px-6">
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
              disabled={isModelBusy}
              onClick={() =>
                onSave({
                  workspaceTitle: draftTitle,
                  themeId: draftThemeId,
                  reviewPromptNote: draftPromptNote,
                  llmProvider: draftProvider,
                  modelId: draftModelId,
                  openAIBaseUrl: draftOpenAIBaseUrl,
                  openAIApiKey: draftOpenAIApiKey,
                  openAIModel: draftOpenAIModel,
                  ollamaBaseUrl: draftOllamaBaseUrl,
                  ollamaModel: draftOllamaModel,
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
