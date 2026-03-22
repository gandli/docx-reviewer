import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useParams } from "react-router-dom";
import { WorkspaceLayout } from "@/features/workspace-shell/components/workspace-layout";
import { createWorkspaceContextStore } from "@/features/workspace-context/store/workspace-context-store";
import { createBrowserWorkspaceSummaryRepository } from "@/services/persistence/repositories/workspace-summary-repository";
import { importDocumentFile } from "@/services/import/import-document";
import {
  ensureLocalLLM,
  getLocalLLMModelId,
  isLocalLLMSupported,
  runLocalLLMTask,
} from "@/services/ai/local-llm";
import { mockWorkspaceSummary } from "@/shared/mocks/workspace-shell";

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
  const [localModelStatus, setLocalModelStatus] = useState<LocalModelStatus>(() =>
    isLocalLLMSupported() ? "idle" : "unsupported",
  );
  const [localModelDetail, setLocalModelDetail] = useState(() =>
    isLocalLLMSupported()
      ? "本地模型未加载。需要时会自动启动。"
      : "当前浏览器不支持 WebGPU，本地模型无法运行。",
  );

  const updateProgress = (progress: { progress: number; text: string }) => {
    setLocalModelStatus("loading");
    setLocalModelDetail(`本地模型加载中 ${Math.round(progress.progress * 100)}% · ${progress.text}`);
  };

  const ensureModelReady = async () => {
    if (!isLocalLLMSupported()) {
      setLocalModelStatus("unsupported");
      setLocalModelDetail("当前浏览器不支持 WebGPU，本地模型无法运行。");
      return false;
    }

    try {
      setLocalModelStatus((current) => (current === "ready" ? current : "loading"));
      setLocalModelDetail(`正在启动本地模型 ${getLocalLLMModelId()}…`);
      await ensureLocalLLM(updateProgress);
      setLocalModelStatus("ready");
      setLocalModelDetail(`本地模型已就绪 · ${getLocalLLMModelId()}`);
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
      });
      store.getState().completeAssistantTurn({
        userMessage: message,
        assistantReply: reply,
      });
      setLocalModelStatus("ready");
      setLocalModelDetail(`本地模型已就绪 · ${getLocalLLMModelId()}`);
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
      });
      store.getState().completeAssistantTurn({
        userMessage: labelMap[payload.intent],
        assistantReply: reply,
        task: taskMap[payload.intent],
      });
      setLocalModelStatus("ready");
      setLocalModelDetail(`本地模型已就绪 · ${getLocalLLMModelId()}`);
    } catch (error) {
      setLocalModelStatus("error");
      setLocalModelDetail(error instanceof Error ? error.message : "本地模型处理失败。");
    }
  };

  const localModelActionLabel =
    localModelStatus === "idle" || localModelStatus === "error" ? "启用本地模型" : undefined;

  return (
    <div className="workspace-page">
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
        localModelLabel={localModelDetail}
        localModelActionLabel={localModelActionLabel}
        onLocalModelAction={() => {
          void ensureModelReady();
        }}
        isLocalModelBusy={localModelStatus === "loading" || localModelStatus === "responding"}
      />
    </div>
  );
}
