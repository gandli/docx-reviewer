import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useParams } from "react-router-dom";
import { WorkspaceLayout } from "@/features/workspace-shell/components/workspace-layout";
import { createWorkspaceContextStore } from "@/features/workspace-context/store/workspace-context-store";
import { createBrowserWorkspaceSummaryRepository } from "@/services/persistence/repositories/workspace-summary-repository";
import { importDocumentFile } from "@/services/import/import-document";
import { downloadWorkspaceExport, type WorkspaceExportFormat } from "@/services/export/workspace-export";
import {
  clearReadyLocalLLMModelId,
  ensureLLMProviderReady,
  getAvailableLLMProviders,
  getAvailableLocalLLMModels,
  getLoadedLocalLLMModelId,
  getProviderMissingConfigMessage,
  getProviderModelLabel,
  getProviderStatusSummary,
  isLocalLLMSupported,
  loadReadyLocalLLMModelId,
  runLLMTask,
  saveReadyLocalLLMModelId,
  validateLLMProviderConnection,
} from "@/services/ai/local-llm";
import { mockWorkspaceSummary } from "@/shared/mocks/workspace-shell";
import { WorkspaceSettingsModal } from "@/features/workspace-shell/components/workspace-settings-modal";
import { WorkspaceExportModal } from "@/features/workspace-shell/components/workspace-export-modal";
import {
  type AppSettings,
  createExportedModelServiceConfig,
  getDefaultAppSettings,
  loadAppSettings,
  parseImportedModelServiceConfig,
  saveAppSettings,
} from "@/services/persistence/app-settings";
type LocalModelStatus = "unsupported" | "idle" | "loading" | "ready" | "responding" | "error";

type ProviderStatusTone = "neutral" | "success" | "warning" | "error";

type ProviderHelperTone = ProviderStatusTone;

function getProviderSourceLabel(provider: "webllm" | "openai" | "anthropic" | "ollama") {
  if (provider === "openai") {
    return "来源：OpenAI API";
  }

  if (provider === "anthropic") {
    return "来源：Anthropic API";
  }

  if (provider === "ollama") {
    return "来源：Ollama";
  }

  return "来源：WebLLM";
}

function getProviderActiveActionLabel(provider: "webllm" | "openai" | "anthropic" | "ollama") {
  if (provider === "webllm") {
    return "本地模型";
  }

  if (provider === "openai" || provider === "anthropic") {
    return "外部模型";
  }

  return "Ollama";
}

function getProviderStatusBadge(params: {
  settings: AppSettings;
  localModelStatus: LocalModelStatus;
  currentCheckVariant: "success" | "error" | null;
}) {
  const missingMessage = getProviderMissingConfigMessage(params.settings);
  if (params.currentCheckVariant === "error" || params.localModelStatus === "error") {
    return {
      label: "检查失败",
      tone: "error" as ProviderStatusTone,
    };
  }

  if (params.localModelStatus === "unsupported") {
    return {
      label: "不可用",
      tone: "error" as ProviderStatusTone,
    };
  }

  if (missingMessage) {
    return {
      label: "未配置",
      tone: "warning" as ProviderStatusTone,
    };
  }

  if (params.currentCheckVariant === "success" || params.localModelStatus === "ready") {
    return {
      label: "已连接",
      tone: "success" as ProviderStatusTone,
    };
  }

  if (params.localModelStatus === "loading" || params.localModelStatus === "responding") {
    return {
      label: "连接中",
      tone: "neutral" as ProviderStatusTone,
    };
  }

  return {
    label: "待连接",
    tone: "neutral" as ProviderStatusTone,
  };
}

function formatCheckTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getProviderHelperText(params: {
  settings: AppSettings;
  localModelStatus: LocalModelStatus;
  localModelDetail: string;
  currentCheckVariant: "success" | "error" | null;
  currentCheckStatus: string;
  lastSuccessfulCheckAt: string;
}) {
  const missingMessage = getProviderMissingConfigMessage(params.settings);
  if (missingMessage) {
    return {
      text: missingMessage.replace("请先在设置里填写", "先在设置里补全"),
      tone: "warning" as ProviderHelperTone,
    };
  }

  if (params.localModelStatus === "unsupported") {
    return {
      text: "请换支持 WebGPU 的浏览器或设备。",
      tone: "error" as ProviderHelperTone,
    };
  }

  if (params.localModelStatus === "loading" || params.localModelStatus === "responding") {
    return {
      text: params.localModelDetail,
      tone: "neutral" as ProviderHelperTone,
    };
  }

  if (params.currentCheckVariant === "error" || params.localModelStatus === "error") {
    if (params.settings.llmProvider === "openai") {
      return {
        text: params.currentCheckStatus || params.localModelDetail || "检查地址、API Key 和模型名是否正确。",
        tone: "error" as ProviderHelperTone,
      };
    }

    if (params.settings.llmProvider === "ollama") {
      return {
        text: params.currentCheckStatus || params.localModelDetail || "确认 Ollama 已启动，地址和模型名可用。",
        tone: "error" as ProviderHelperTone,
      };
    }

    if (params.settings.llmProvider === "anthropic") {
      return {
        text: params.currentCheckStatus || params.localModelDetail || "检查地址、Key 和模型名是否正确。",
        tone: "error" as ProviderHelperTone,
      };
    }

    return {
      text: params.currentCheckStatus || params.localModelDetail || "请重试，或改用支持 WebGPU 的环境。",
      tone: "error" as ProviderHelperTone,
    };
  }

  if (params.currentCheckVariant === "success" && params.lastSuccessfulCheckAt) {
    return {
      text: `最近检查：${params.lastSuccessfulCheckAt}`,
      tone: "success" as ProviderHelperTone,
    };
  }

  return {
    text: "",
    tone: "neutral" as ProviderHelperTone,
  };
}

function getProviderSendGuard(params: {
  settings: AppSettings;
  localModelStatus: LocalModelStatus;
  localModelDetail: string;
  currentCheckVariant: "success" | "error" | null;
  currentCheckStatus: string;
}) {
  const missingMessage = getProviderMissingConfigMessage(params.settings);
  if (missingMessage) {
    return {
      blocked: true,
      reason: missingMessage.replace("请先在设置里填写", "先在设置里补全"),
    };
  }

  if (params.localModelStatus === "unsupported") {
    return {
      blocked: true,
      reason: "当前环境不支持本地模型",
    };
  }

  if (params.currentCheckVariant === "error") {
    if (params.settings.llmProvider === "openai") {
      return {
        blocked: true,
        reason: params.currentCheckStatus || params.localModelDetail || "请先修正 API 设置",
      };
    }

    if (params.settings.llmProvider === "ollama") {
      return {
        blocked: true,
        reason: params.currentCheckStatus || params.localModelDetail || "请先修正 Ollama 设置",
      };
    }

    if (params.settings.llmProvider === "anthropic") {
      return {
        blocked: true,
        reason: params.currentCheckStatus || params.localModelDetail || "请先修正 Anthropic 设置",
      };
    }

    return {
      blocked: true,
      reason: params.currentCheckStatus || params.localModelDetail || "请先修正本地模型环境",
    };
  }

  if (params.localModelStatus === "error") {
    return {
      blocked: true,
      reason: params.currentCheckStatus || params.localModelDetail || "请先修正当前模型状态",
    };
  }

  return {
    blocked: false,
    reason: "",
  };
}

export function WorkspacePage() {
  const { workspaceId = mockWorkspaceSummary.workspaceId } = useParams();
  const repository = useMemo(
    () => createBrowserWorkspaceSummaryRepository(mockWorkspaceSummary),
    [],
  );
  const store = useMemo(
    () => createWorkspaceContextStore(repository, mockWorkspaceSummary),
    [repository],
  );

  useEffect(() => {
    void store.getState().hydrate(workspaceId);
  }, [store, workspaceId]);

  const workspaceState = useSyncExternalStore(store.subscribe, () => store.getState());
  const summary = workspaceState.summary ?? mockWorkspaceSummary;
  const providerOptions = useMemo(() => getAvailableLLMProviders(), []);
  const modelOptions = useMemo(() => getAvailableLocalLLMModels(), []);
  const [isWorkspaceSettingsOpen, setIsWorkspaceSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [appSettings, setAppSettings] = useState(() => loadAppSettings());
  const [modelCheckStatus, setModelCheckStatus] = useState("");
  const [modelCheckVariant, setModelCheckVariant] = useState<"success" | "error" | null>(null);
  const [lastSuccessfulCheckAt, setLastSuccessfulCheckAt] = useState("");
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const selectedModel = useMemo(
    () =>
      modelOptions.find((model) => model.id === appSettings.webllmModelId) ?? modelOptions[0],
    [appSettings.webllmModelId, modelOptions],
  );
  const [localModelStatus, setLocalModelStatus] = useState<LocalModelStatus>(() =>
    appSettings.llmProvider === "webllm" && !isLocalLLMSupported() ? "unsupported" : "idle",
  );
  const [localModelDetail, setLocalModelDetail] = useState(() =>
    appSettings.llmProvider === "webllm" && !isLocalLLMSupported()
      ? "当前浏览器不支持 WebGPU，本地模型无法运行。"
      : appSettings.llmProvider === "webllm" &&
          loadReadyLocalLLMModelId() === appSettings.webllmModelId &&
          isLocalLLMSupported()
        ? `模型：${getProviderModelLabel(appSettings)} · 自动恢复中`
      : getProviderStatusSummary(appSettings),
  );

  const updateProgress = (progress: { progress: number; text: string }) => {
    setLocalModelStatus("loading");
    setLocalModelDetail(`本地模型加载中 ${Math.round(progress.progress * 100)}% · ${progress.text}`);
  };

  const providerStatusBadge = getProviderStatusBadge({
    settings: appSettings,
    localModelStatus,
    currentCheckVariant: modelCheckVariant,
  });
  const providerHelper = getProviderHelperText({
    settings: appSettings,
    localModelStatus,
    localModelDetail,
    currentCheckVariant: modelCheckVariant,
    currentCheckStatus: modelCheckStatus,
    lastSuccessfulCheckAt,
  });
  const providerSendGuard = getProviderSendGuard({
    settings: appSettings,
    localModelStatus,
    localModelDetail,
    currentCheckVariant: modelCheckVariant,
    currentCheckStatus: modelCheckStatus,
  });
  const providerModelLabel = getProviderStatusSummary(appSettings);

  useEffect(() => {
    if (appSettings.llmProvider !== "webllm") {
      if (localModelStatus === "responding" || localModelStatus === "error") {
        return;
      }

      setLocalModelDetail(getProviderStatusSummary(appSettings));
      return;
    }

    if (!selectedModel) {
      return;
    }

    const activeModelId = getLoadedLocalLLMModelId();

    if (!isLocalLLMSupported()) {
      setLocalModelDetail("当前浏览器不支持 WebGPU，本地模型无法运行。");
      return;
    }

    if (localModelStatus === "ready" && activeModelId === selectedModel.id) {
      setLocalModelDetail(`本地模型已就绪 · ${selectedModel.label}`);
      return;
    }

    if (localModelStatus === "loading" || localModelStatus === "responding") {
      return;
    }

    setLocalModelDetail(getProviderStatusSummary(appSettings));
  }, [appSettings, localModelStatus, selectedModel]);

  const ensureModelReady = async () => {
    const missingMessage = getProviderMissingConfigMessage(appSettings);
    if (missingMessage) {
      setLocalModelStatus("error");
      setLocalModelDetail(missingMessage);
      return false;
    }

    if (appSettings.llmProvider === "webllm" && !isLocalLLMSupported()) {
      setLocalModelStatus("unsupported");
      setLocalModelDetail("当前浏览器不支持 WebGPU，本地模型无法运行。");
      return false;
    }

    try {
      if (appSettings.llmProvider === "webllm") {
        setLocalModelStatus((current) => (current === "ready" ? current : "loading"));
        setLocalModelDetail(`正在启动本地模型 ${getProviderModelLabel(appSettings)}…`);
      } else {
        setLocalModelStatus("ready");
        setLocalModelDetail(getProviderStatusSummary(appSettings));
      }

      await ensureLLMProviderReady(appSettings, updateProgress);
      setLocalModelStatus("ready");
      if (appSettings.llmProvider === "webllm") {
        saveReadyLocalLLMModelId(appSettings.webllmModelId);
      }
      setLocalModelDetail(
        appSettings.llmProvider === "webllm"
          ? `本地模型已就绪 · ${getProviderModelLabel(appSettings)}`
          : getProviderStatusSummary(appSettings),
      );
      return true;
    } catch (error) {
      setLocalModelStatus("error");
      setLocalModelDetail(error instanceof Error ? error.message : "本地模型启动失败。");
      return false;
    }
  };

  useEffect(() => {
    if (appSettings.llmProvider !== "webllm") {
      return;
    }

    if (localModelStatus !== "idle") {
      return;
    }

    if (loadReadyLocalLLMModelId() !== appSettings.webllmModelId) {
      return;
    }

    void ensureModelReady();
  }, [appSettings.llmProvider, appSettings.webllmModelId, localModelStatus]);

  const handleImportDocument = async (file: File) => {
    const importedDocument = await importDocumentFile(file);
    store.getState().importDocument(importedDocument, file.name);
  };

  const handleSendMessage = async (message: string) => {
    const currentSummary = store.getState().summary ?? mockWorkspaceSummary;
    const isReady = await ensureModelReady();

    if (!isReady) {
      store.getState().sendMessage(message);
      return;
    }

    try {
      setLocalModelStatus("responding");
      setLocalModelDetail(`${getProviderActiveActionLabel(appSettings.llmProvider)}正在生成回复…`);
      const reply = await runLLMTask({
        action: "chat",
        clauseTitle: currentSummary.activeClauseTitle,
        clauseText: currentSummary.activeClauseText,
        userMessage: message,
        customPrompt: appSettings.reviewPromptNote,
      }, appSettings);
      store.getState().completeAssistantTurn({
        userMessage: message,
        assistantReply: reply,
        variant: "chat",
      });
      setLocalModelStatus("ready");
      setLocalModelDetail(
        appSettings.llmProvider === "webllm"
          ? `本地模型已就绪 · ${getProviderModelLabel(appSettings)}`
          : getProviderStatusSummary(appSettings),
      );
    } catch (error) {
      setLocalModelStatus("error");
      setLocalModelDetail(error instanceof Error ? error.message : "本地模型回复失败。");
      store.getState().sendMessage(message);
    }
  };

  const handleSelectText = async (payload: {
    text: string;
    blockId?: string;
    contextLabel?: string;
    intent?: "review" | "revise" | "polish";
  }) => {
    store.getState().selectText(payload);

    if (!payload.intent) {
      return;
    }

    if (providerSendGuard.blocked) {
      return;
    }

    const taskMap = {
      review: "review",
      revise: "revise",
      polish: "optimize",
    } as const;
    const labelMap = {
      review: "找问题",
      revise: "直接改写",
      polish: "润色表达",
    } as const;

    const isReady = await ensureModelReady();
    if (!isReady) {
      return;
    }

    try {
      setLocalModelStatus("responding");
      setLocalModelDetail(
        `${getProviderActiveActionLabel(appSettings.llmProvider)}正在处理“${labelMap[payload.intent]}”…`,
      );
      const reply = await runLLMTask({
        action: payload.intent,
        clauseTitle: payload.contextLabel ?? "已选文本",
        clauseText: payload.text,
        customPrompt: appSettings.reviewPromptNote,
      }, appSettings);
      store.getState().completeAssistantTurn({
        userMessage: labelMap[payload.intent],
        assistantReply: reply,
        task: taskMap[payload.intent],
        variant: payload.intent,
      });
      setLocalModelStatus("ready");
      setLocalModelDetail(
        appSettings.llmProvider === "webllm"
          ? `本地模型已就绪 · ${getProviderModelLabel(appSettings)}`
          : getProviderStatusSummary(appSettings),
      );
    } catch (error) {
      setLocalModelStatus("error");
      setLocalModelDetail(error instanceof Error ? error.message : "本地模型处理失败。");
    }
  };

  const handleSaveWorkspaceSettings = (payload: {
    workspaceTitle: string;
    themeId: "warm" | "ink" | "forest";
    reviewPromptNote: string;
    llmProvider: "webllm" | "openai" | "ollama";
    modelId: string;
    openAIBaseUrl: string;
    openAIApiKey: string;
    openAIModel: string;
    anthropicBaseUrl: string;
    anthropicApiKey: string;
    anthropicModel: string;
    ollamaBaseUrl: string;
    ollamaModel: string;
  }) => {
    const nextTitle = payload.workspaceTitle.trim() || mockWorkspaceSummary.workspaceTitle;
    const nextAppSettings = {
      themeId: payload.themeId,
      reviewPromptNote: payload.reviewPromptNote.trim(),
      llmProvider: payload.llmProvider,
      webllmModelId: payload.modelId,
      openAIBaseUrl: payload.openAIBaseUrl.trim(),
      openAIApiKey: payload.openAIApiKey.trim(),
      openAIModel: payload.openAIModel.trim(),
      anthropicBaseUrl: payload.anthropicBaseUrl.trim(),
      anthropicApiKey: payload.anthropicApiKey.trim(),
      anthropicModel: payload.anthropicModel.trim(),
      ollamaBaseUrl: payload.ollamaBaseUrl.trim(),
      ollamaModel: payload.ollamaModel.trim(),
    };

    if (nextAppSettings.webllmModelId !== loadReadyLocalLLMModelId()) {
      clearReadyLocalLLMModelId();
    }

    saveAppSettings(nextAppSettings);
    setAppSettings(nextAppSettings);
    setLastSuccessfulCheckAt("");
    store.getState().replaceWorkspace(
      {
        ...summary,
        workspaceTitle: nextTitle,
        updatedAt: "刚刚",
      },
      workspaceState.previewDocument,
    );
    setIsWorkspaceSettingsOpen(false);
    void ensureModelReady();
  };

  const handleClearModelCheckStatus = useCallback(() => {
    setModelCheckStatus("");
    setModelCheckVariant(null);
  }, []);

  const handleCheckModelConnection = async (payload: {
    llmProvider: "webllm" | "openai" | "anthropic" | "ollama";
    modelId: string;
    openAIBaseUrl: string;
    openAIApiKey: string;
    openAIModel: string;
    anthropicBaseUrl: string;
    anthropicApiKey: string;
    anthropicModel: string;
    ollamaBaseUrl: string;
    ollamaModel: string;
  }) => {
    setIsCheckingConnection(true);
    setModelCheckStatus("");
    setModelCheckVariant(null);

    try {
      const result = await validateLLMProviderConnection({
        ...appSettings,
        llmProvider: payload.llmProvider,
        webllmModelId: payload.modelId,
        openAIBaseUrl: payload.openAIBaseUrl.trim(),
        openAIApiKey: payload.openAIApiKey.trim(),
        openAIModel: payload.openAIModel.trim(),
        anthropicBaseUrl: payload.anthropicBaseUrl.trim(),
        anthropicApiKey: payload.anthropicApiKey.trim(),
        anthropicModel: payload.anthropicModel.trim(),
        ollamaBaseUrl: payload.ollamaBaseUrl.trim(),
        ollamaModel: payload.ollamaModel.trim(),
      });
      setModelCheckStatus(result.message);
      setModelCheckVariant("success");
      setLastSuccessfulCheckAt(formatCheckTime(new Date()));
      if (payload.llmProvider === "webllm") {
        saveReadyLocalLLMModelId(payload.modelId);
      }
    } catch (error) {
      setModelCheckStatus(error instanceof Error ? error.message : "连接检查失败。");
      setModelCheckVariant("error");
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleClearWorkspaceRecords = async () => {
    await repository.clear(workspaceId);
    store.setState({
      summary: mockWorkspaceSummary,
      previewDocument: undefined,
    });
    setIsWorkspaceSettingsOpen(false);
  };

  const handleExportWorkspace = (format: WorkspaceExportFormat) => {
    downloadWorkspaceExport(summary, format);
    setIsExportModalOpen(false);
  };

  const handleExportModelConfig = () => {
    const readyWebllmModelId = loadReadyLocalLLMModelId();
    const config = createExportedModelServiceConfig(appSettings, readyWebllmModelId);
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "model-service-config.json";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportModelConfig = async (file: File) => {
    try {
      const content = await file.text();
      const imported = parseImportedModelServiceConfig(content, {
        ...getDefaultAppSettings(),
        ...appSettings,
      });

      if (imported.readyWebllmModelId) {
        saveReadyLocalLLMModelId(imported.readyWebllmModelId);
      } else {
        clearReadyLocalLLMModelId();
      }

      saveAppSettings(imported.settings);
      setAppSettings(imported.settings);
      setModelCheckStatus("已导入模型配置，请先检查连接。");
      setModelCheckVariant(null);
      setLastSuccessfulCheckAt("");
    } catch (error) {
      setModelCheckStatus(error instanceof Error ? error.message : "导入模型配置失败。");
      setModelCheckVariant("error");
    }
  };

  return (
    <div className="min-h-screen">
      <WorkspaceLayout
        summary={summary}
        previewDocument={workspaceState.previewDocument}
        onApplySuggestion={() => store.getState().applySuggestion()}
        onJumpToSelection={() => store.getState().focusSelection()}
        onSelectText={(payload) => {
          void handleSelectText(payload);
        }}
        onSendMessage={(message) => {
          void handleSendMessage(message);
        }}
        onImportDocument={handleImportDocument}
        onExport={() => setIsExportModalOpen(true)}
        onOpenSettings={() => setIsWorkspaceSettingsOpen(true)}
        isSelectionActionBlocked={providerSendGuard.blocked}
        selectionActionBlockReason={providerSendGuard.reason}
        localModelSourceLabel={getProviderSourceLabel(appSettings.llmProvider)}
        localModelStatusLabel={providerStatusBadge.label}
        localModelStatusTone={providerStatusBadge.tone}
        localModelLabel={providerModelLabel}
        localModelHelperText={providerHelper.text}
        localModelHelperTone={providerHelper.tone}
        isSendBlocked={providerSendGuard.blocked}
        sendBlockReason={providerSendGuard.reason}
        isLocalModelBusy={localModelStatus === "loading" || localModelStatus === "responding"}
      />
      <WorkspaceSettingsModal
        isOpen={isWorkspaceSettingsOpen}
        workspaceTitle={summary.workspaceTitle}
        selectedThemeId={appSettings.themeId}
        reviewPromptNote={appSettings.reviewPromptNote}
        llmProvider={appSettings.llmProvider}
        currentTask={summary.currentTask}
        selectedModelId={appSettings.webllmModelId}
        openAIBaseUrl={appSettings.openAIBaseUrl}
        openAIApiKey={appSettings.openAIApiKey}
        openAIModel={appSettings.openAIModel}
        anthropicBaseUrl={appSettings.anthropicBaseUrl}
        anthropicApiKey={appSettings.anthropicApiKey}
        anthropicModel={appSettings.anthropicModel}
        ollamaBaseUrl={appSettings.ollamaBaseUrl}
        ollamaModel={appSettings.ollamaModel}
        activeModelId={appSettings.llmProvider === "webllm" ? getLoadedLocalLLMModelId() : undefined}
        currentModelStatus={localModelDetail}
        currentCheckStatus={modelCheckStatus}
        currentCheckVariant={modelCheckVariant}
        isCheckingConnection={isCheckingConnection}
        providerOptions={providerOptions}
        modelOptions={modelOptions}
        isModelBusy={localModelStatus === "loading" || localModelStatus === "responding"}
        isModelSupported={appSettings.llmProvider === "webllm" ? isLocalLLMSupported() : true}
        onClose={() => setIsWorkspaceSettingsOpen(false)}
        onClearCheckStatus={handleClearModelCheckStatus}
        onCheckConnection={handleCheckModelConnection}
        onSave={handleSaveWorkspaceSettings}
        onExportModelConfig={handleExportModelConfig}
        onImportModelConfig={(file) => {
          void handleImportModelConfig(file);
        }}
        onClear={() => {
          void handleClearWorkspaceRecords();
        }}
      />
      <WorkspaceExportModal
        isOpen={isExportModalOpen}
        documentTitle={summary.activeDocumentTitle}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportWorkspace}
      />
    </div>
  );
}
