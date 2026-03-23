import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useParams } from "react-router-dom";
import { WorkspaceLayout } from "@/features/workspace-shell/components/workspace-layout";
import { createWorkspaceContextStore } from "@/features/workspace-context/store/workspace-context-store";
import { createBrowserWorkspaceSummaryRepository } from "@/services/persistence/repositories/workspace-summary-repository";
import { importDocumentFile } from "@/services/import/import-document";
import { downloadWorkspaceExport, type WorkspaceExportFormat } from "@/services/export/workspace-export";
import {
  ensureLocalLLM,
  getAvailableLocalLLMModels,
  getLocalLLMModelId,
  getLoadedLocalLLMModelId,
  getDefaultLocalLLMModelId,
  isLocalLLMSupported,
  loadSelectedLocalLLMModelId,
  runLocalLLMTask,
  saveSelectedLocalLLMModelId,
} from "@/services/ai/local-llm";
import { mockWorkspaceSummary } from "@/shared/mocks/workspace-shell";
import { WorkspaceSettingsModal } from "@/features/workspace-shell/components/workspace-settings-modal";
import { WorkspaceExportModal } from "@/features/workspace-shell/components/workspace-export-modal";
import {
  loadAppSettings,
  saveAppSettings,
} from "@/services/persistence/app-settings";

type LocalModelStatus = "unsupported" | "idle" | "loading" | "ready" | "responding" | "error";

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
  const modelOptions = useMemo(() => getAvailableLocalLLMModels(), []);
  const [selectedModelId, setSelectedModelId] = useState(() => loadSelectedLocalLLMModelId());
  const [isWorkspaceSettingsOpen, setIsWorkspaceSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [appSettings, setAppSettings] = useState(() => loadAppSettings());
  const selectedModel = useMemo(
    () =>
      modelOptions.find((model) => model.id === selectedModelId) ??
      modelOptions.find((model) => model.id === getDefaultLocalLLMModelId()),
    [modelOptions, selectedModelId],
  );
  const [localModelStatus, setLocalModelStatus] = useState<LocalModelStatus>(() =>
    isLocalLLMSupported() ? "idle" : "unsupported",
  );
  const [localModelDetail, setLocalModelDetail] = useState(() =>
    isLocalLLMSupported()
      ? `模型：${getLocalLLMModelId(selectedModelId)} · 按需启动`
      : "当前浏览器不支持 WebGPU，本地模型无法运行。",
  );

  const updateProgress = (progress: { progress: number; text: string }) => {
    setLocalModelStatus("loading");
    setLocalModelDetail(`本地模型加载中 ${Math.round(progress.progress * 100)}% · ${progress.text}`);
  };

  useEffect(() => {
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

    setLocalModelDetail(`模型：${selectedModel.label} · 按需启动`);
  }, [localModelStatus, selectedModel]);

  const ensureModelReady = async (modelId = selectedModelId) => {
    const model =
      modelOptions.find((candidate) => candidate.id === modelId) ??
      modelOptions.find((candidate) => candidate.id === getDefaultLocalLLMModelId());

    if (!isLocalLLMSupported()) {
      setLocalModelStatus("unsupported");
      setLocalModelDetail("当前浏览器不支持 WebGPU，本地模型无法运行。");
      return false;
    }

    try {
      setLocalModelStatus((current) => (current === "ready" ? current : "loading"));
      setLocalModelDetail(`正在启动本地模型 ${model?.label ?? getLocalLLMModelId(modelId)}…`);
      await ensureLocalLLM(modelId, updateProgress);
      setLocalModelStatus("ready");
      setLocalModelDetail(`本地模型已就绪 · ${model?.label ?? getLocalLLMModelId(modelId)}`);
      return true;
    } catch (error) {
      setLocalModelStatus("error");
      setLocalModelDetail(error instanceof Error ? error.message : "本地模型启动失败。");
      return false;
    }
  };

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
      setLocalModelDetail("本地模型正在生成回复…");
      const reply = await runLocalLLMTask({
        action: "chat",
        clauseTitle: currentSummary.activeClauseTitle,
        clauseText: currentSummary.activeClauseText,
        userMessage: message,
        modelId: selectedModelId,
        customPrompt: appSettings.reviewPromptNote,
      });
      store.getState().completeAssistantTurn({
        userMessage: message,
        assistantReply: reply,
        variant: "chat",
      });
      setLocalModelStatus("ready");
      setLocalModelDetail(`本地模型已就绪 · ${selectedModel?.label ?? getLocalLLMModelId(selectedModelId)}`);
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
      setLocalModelDetail(`本地模型正在处理“${labelMap[payload.intent]}”…`);
      const reply = await runLocalLLMTask({
        action: payload.intent,
        clauseTitle: payload.contextLabel ?? "已选文本",
        clauseText: payload.text,
        modelId: selectedModelId,
        customPrompt: appSettings.reviewPromptNote,
      });
      store.getState().completeAssistantTurn({
        userMessage: labelMap[payload.intent],
        assistantReply: reply,
        task: taskMap[payload.intent],
        variant: payload.intent,
      });
      setLocalModelStatus("ready");
      setLocalModelDetail(`本地模型已就绪 · ${selectedModel?.label ?? getLocalLLMModelId(selectedModelId)}`);
    } catch (error) {
      setLocalModelStatus("error");
      setLocalModelDetail(error instanceof Error ? error.message : "本地模型处理失败。");
    }
  };

  const handleSaveWorkspaceSettings = (payload: {
    workspaceTitle: string;
    themeId: "warm" | "ink" | "forest";
    reviewPromptNote: string;
    modelId: string;
  }) => {
    const nextTitle = payload.workspaceTitle.trim() || mockWorkspaceSummary.workspaceTitle;
    const nextAppSettings = {
      themeId: payload.themeId,
      reviewPromptNote: payload.reviewPromptNote.trim(),
    };

    saveAppSettings(nextAppSettings);
    setAppSettings(nextAppSettings);
    saveSelectedLocalLLMModelId(payload.modelId);
    setSelectedModelId(payload.modelId);
    store.getState().replaceWorkspace(
      {
        ...summary,
        workspaceTitle: nextTitle,
        updatedAt: "刚刚",
      },
      workspaceState.previewDocument,
    );
    setIsWorkspaceSettingsOpen(false);
    void ensureModelReady(payload.modelId);
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
        localModelLabel={localModelDetail}
        isLocalModelBusy={localModelStatus === "loading" || localModelStatus === "responding"}
      />
      <WorkspaceSettingsModal
        isOpen={isWorkspaceSettingsOpen}
        workspaceTitle={summary.workspaceTitle}
        selectedThemeId={appSettings.themeId}
        reviewPromptNote={appSettings.reviewPromptNote}
        selectedModelId={selectedModelId}
        activeModelId={getLoadedLocalLLMModelId()}
        modelOptions={modelOptions}
        isModelBusy={localModelStatus === "loading" || localModelStatus === "responding"}
        isModelSupported={isLocalLLMSupported()}
        onClose={() => setIsWorkspaceSettingsOpen(false)}
        onSave={handleSaveWorkspaceSettings}
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
