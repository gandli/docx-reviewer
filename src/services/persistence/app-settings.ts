export type AppThemeId = "warm" | "ink" | "forest";
export type LLMProvider = "webllm" | "openai" | "ollama";

export type AppSettings = {
  themeId: AppThemeId;
  reviewPromptNote: string;
  llmProvider: LLMProvider;
  webllmModelId: string;
  openAIBaseUrl: string;
  openAIApiKey: string;
  openAIModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
};

const APP_SETTINGS_STORAGE_KEY = "app-settings";
const APP_SETTINGS_EVENT = "app-settings-updated";

const DEFAULT_APP_SETTINGS: AppSettings = {
  themeId: "warm",
  reviewPromptNote: "",
  llmProvider: "webllm",
  webllmModelId: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  openAIBaseUrl: "https://api.openai.com/v1",
  openAIApiKey: "",
  openAIModel: "gpt-4.1-mini",
  ollamaBaseUrl: "http://127.0.0.1:11434",
  ollamaModel: "qwen2.5:3b",
};

export function getDefaultAppSettings(): AppSettings {
  return DEFAULT_APP_SETTINGS;
}

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_APP_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      themeId:
        parsed.themeId === "ink" || parsed.themeId === "forest" || parsed.themeId === "warm"
          ? parsed.themeId
          : DEFAULT_APP_SETTINGS.themeId,
      reviewPromptNote:
        typeof parsed.reviewPromptNote === "string"
          ? parsed.reviewPromptNote
          : DEFAULT_APP_SETTINGS.reviewPromptNote,
      llmProvider:
        parsed.llmProvider === "openai" || parsed.llmProvider === "ollama" || parsed.llmProvider === "webllm"
          ? parsed.llmProvider
          : DEFAULT_APP_SETTINGS.llmProvider,
      webllmModelId:
        typeof parsed.webllmModelId === "string" && parsed.webllmModelId.trim().length > 0
          ? parsed.webllmModelId
          : DEFAULT_APP_SETTINGS.webllmModelId,
      openAIBaseUrl:
        typeof parsed.openAIBaseUrl === "string" && parsed.openAIBaseUrl.trim().length > 0
          ? parsed.openAIBaseUrl
          : DEFAULT_APP_SETTINGS.openAIBaseUrl,
      openAIApiKey:
        typeof parsed.openAIApiKey === "string"
          ? parsed.openAIApiKey
          : DEFAULT_APP_SETTINGS.openAIApiKey,
      openAIModel:
        typeof parsed.openAIModel === "string" && parsed.openAIModel.trim().length > 0
          ? parsed.openAIModel
          : DEFAULT_APP_SETTINGS.openAIModel,
      ollamaBaseUrl:
        typeof parsed.ollamaBaseUrl === "string" && parsed.ollamaBaseUrl.trim().length > 0
          ? parsed.ollamaBaseUrl
          : DEFAULT_APP_SETTINGS.ollamaBaseUrl,
      ollamaModel:
        typeof parsed.ollamaModel === "string" && parsed.ollamaModel.trim().length > 0
          ? parsed.ollamaModel
          : DEFAULT_APP_SETTINGS.ollamaModel,
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(APP_SETTINGS_EVENT, { detail: settings }));
}

export function subscribeAppSettings(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleUpdate = () => listener();
  window.addEventListener(APP_SETTINGS_EVENT, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener(APP_SETTINGS_EVENT, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}
