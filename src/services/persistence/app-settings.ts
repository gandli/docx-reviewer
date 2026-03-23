export type AppThemeId = "warm" | "ink" | "forest";
export type LLMProvider = "webllm" | "openai" | "anthropic" | "ollama";

export type AppSettings = {
  themeId: AppThemeId;
  reviewPromptNote: string;
  llmProvider: LLMProvider;
  webllmModelId: string;
  openAIBaseUrl: string;
  openAIApiKey: string;
  openAIModel: string;
  anthropicBaseUrl: string;
  anthropicApiKey: string;
  anthropicModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
};

export type ExportedModelServiceConfig = {
  version: 1;
  llmProvider: LLMProvider;
  webllmModelId: string;
  openAIBaseUrl: string;
  openAIApiKey: string;
  openAIModel: string;
  anthropicBaseUrl: string;
  anthropicApiKey: string;
  anthropicModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  readyWebllmModelId: string;
};

export type ModelServicePreset = {
  id: string;
  label: string;
  provider: LLMProvider;
  summary: string;
  openAIBaseUrl?: string;
  openAIModel?: string;
  anthropicBaseUrl?: string;
  anthropicModel?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
};

const APP_SETTINGS_STORAGE_KEY = "app-settings";
const APP_SETTINGS_EVENT = "app-settings-updated";
let cachedAppSettingsRaw = "";
let cachedAppSettingsSnapshot: AppSettings | undefined;

const DEFAULT_APP_SETTINGS: AppSettings = {
  themeId: "warm",
  reviewPromptNote: "",
  llmProvider: "webllm",
  webllmModelId: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  openAIBaseUrl: "https://api.openai.com/v1",
  openAIApiKey: "",
  openAIModel: "gpt-4.1-mini",
  anthropicBaseUrl: "https://api.anthropic.com/v1",
  anthropicApiKey: "",
  anthropicModel: "claude-3-5-sonnet-latest",
  ollamaBaseUrl: "http://127.0.0.1:11434",
  ollamaModel: "qwen2.5:3b",
};

const MODEL_SERVICE_PRESETS: ModelServicePreset[] = [
  {
    id: "zhipu-glm",
    label: "智谱 GLM",
    provider: "openai",
    summary: "适合接智谱兼容接口，自动填好 GLM 的常用地址和模型。",
    openAIBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
    openAIModel: "glm-4.7-flash",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    provider: "openai",
    summary: "适合接 DeepSeek 官方兼容接口。",
    openAIBaseUrl: "https://api.deepseek.com/v1",
    openAIModel: "deepseek-chat",
  },
  {
    id: "openai",
    label: "OpenAI",
    provider: "openai",
    summary: "OpenAI 官方接口预设。",
    openAIBaseUrl: "https://api.openai.com/v1",
    openAIModel: "gpt-4.1-mini",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    provider: "anthropic",
    summary: "Anthropic 官方 messages 接口预设。",
    anthropicBaseUrl: "https://api.anthropic.com/v1",
    anthropicModel: "claude-3-5-sonnet-latest",
  },
  {
    id: "ollama-local",
    label: "Ollama 本机",
    provider: "ollama",
    summary: "本机 Ollama 常用默认地址。",
    ollamaBaseUrl: "http://127.0.0.1:11434",
    ollamaModel: "qwen2.5:3b",
  },
];

export function getDefaultAppSettings(): AppSettings {
  return DEFAULT_APP_SETTINGS;
}

export function getModelServicePresets() {
  return MODEL_SERVICE_PRESETS;
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
        parsed.llmProvider === "openai" ||
        parsed.llmProvider === "anthropic" ||
        parsed.llmProvider === "ollama" ||
        parsed.llmProvider === "webllm"
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
      anthropicBaseUrl:
        typeof parsed.anthropicBaseUrl === "string" && parsed.anthropicBaseUrl.trim().length > 0
          ? parsed.anthropicBaseUrl
          : DEFAULT_APP_SETTINGS.anthropicBaseUrl,
      anthropicApiKey:
        typeof parsed.anthropicApiKey === "string"
          ? parsed.anthropicApiKey
          : DEFAULT_APP_SETTINGS.anthropicApiKey,
      anthropicModel:
        typeof parsed.anthropicModel === "string" && parsed.anthropicModel.trim().length > 0
          ? parsed.anthropicModel
          : DEFAULT_APP_SETTINGS.anthropicModel,
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

export function getAppSettingsSnapshot(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_APP_SETTINGS;
  }

  const raw = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY) ?? "";
  if (cachedAppSettingsSnapshot && cachedAppSettingsRaw === raw) {
    return cachedAppSettingsSnapshot;
  }

  const nextSnapshot = loadAppSettings();
  cachedAppSettingsRaw = raw;
  cachedAppSettingsSnapshot = nextSnapshot;
  return nextSnapshot;
}

export function saveAppSettings(settings: AppSettings) {
  if (typeof window === "undefined") {
    return;
  }

  const raw = JSON.stringify(settings);
  cachedAppSettingsRaw = raw;
  cachedAppSettingsSnapshot = settings;
  window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, raw);
  window.dispatchEvent(new CustomEvent(APP_SETTINGS_EVENT, { detail: settings }));
}

export function createExportedModelServiceConfig(
  settings: AppSettings,
  readyWebllmModelId = "",
): ExportedModelServiceConfig {
  return {
    version: 1,
    llmProvider: settings.llmProvider,
    webllmModelId: settings.webllmModelId,
    openAIBaseUrl: settings.openAIBaseUrl,
    openAIApiKey: settings.openAIApiKey,
    openAIModel: settings.openAIModel,
    anthropicBaseUrl: settings.anthropicBaseUrl,
    anthropicApiKey: settings.anthropicApiKey,
    anthropicModel: settings.anthropicModel,
    ollamaBaseUrl: settings.ollamaBaseUrl,
    ollamaModel: settings.ollamaModel,
    readyWebllmModelId,
  };
}

export function parseImportedModelServiceConfig(raw: string, currentSettings: AppSettings) {
  let parsed: Partial<ExportedModelServiceConfig>;

  try {
    parsed = JSON.parse(raw) as Partial<ExportedModelServiceConfig>;
  } catch {
    throw new Error("导入文件不是有效的 JSON 配置。");
  }

  if (parsed.version !== 1) {
    throw new Error("导入文件版本不受支持。");
  }

  const normalizedProvider: LLMProvider =
    parsed.llmProvider === "openai" ||
    parsed.llmProvider === "anthropic" ||
    parsed.llmProvider === "ollama" ||
    parsed.llmProvider === "webllm"
      ? parsed.llmProvider
      : currentSettings.llmProvider;

  return {
    settings: {
      ...currentSettings,
      llmProvider: normalizedProvider,
      webllmModelId:
        typeof parsed.webllmModelId === "string" && parsed.webllmModelId.trim()
          ? parsed.webllmModelId
          : currentSettings.webllmModelId,
      openAIBaseUrl:
        typeof parsed.openAIBaseUrl === "string"
          ? parsed.openAIBaseUrl
          : currentSettings.openAIBaseUrl,
      openAIApiKey:
        typeof parsed.openAIApiKey === "string"
          ? parsed.openAIApiKey
          : currentSettings.openAIApiKey,
      openAIModel:
        typeof parsed.openAIModel === "string"
          ? parsed.openAIModel
          : currentSettings.openAIModel,
      anthropicBaseUrl:
        typeof parsed.anthropicBaseUrl === "string"
          ? parsed.anthropicBaseUrl
          : currentSettings.anthropicBaseUrl,
      anthropicApiKey:
        typeof parsed.anthropicApiKey === "string"
          ? parsed.anthropicApiKey
          : currentSettings.anthropicApiKey,
      anthropicModel:
        typeof parsed.anthropicModel === "string"
          ? parsed.anthropicModel
          : currentSettings.anthropicModel,
      ollamaBaseUrl:
        typeof parsed.ollamaBaseUrl === "string"
          ? parsed.ollamaBaseUrl
          : currentSettings.ollamaBaseUrl,
      ollamaModel:
        typeof parsed.ollamaModel === "string"
          ? parsed.ollamaModel
          : currentSettings.ollamaModel,
    } satisfies AppSettings,
    readyWebllmModelId:
      typeof parsed.readyWebllmModelId === "string" ? parsed.readyWebllmModelId : "",
  };
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
