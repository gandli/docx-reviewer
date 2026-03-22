import { createStore } from "zustand/vanilla";
import type {
  WorkspaceImportedDocument,
  WorkspacePreviewDocument,
  WorkspaceSummary,
} from "@/features/workspace-context/types/workspace-summary";
import type { WorkspaceSummaryRepository } from "@/services/persistence/repositories/workspace-summary-repository";

export type WorkspaceContextState = {
  summary?: WorkspaceSummary;
  previewDocument?: WorkspacePreviewDocument;
  setSummary: (summary: WorkspaceSummary) => void;
  hydrate: (workspaceId: string) => Promise<void>;
  focusSelection: () => void;
  selectText: (payload: {
    text: string;
    blockId?: string;
    contextLabel?: string;
    intent?: "review" | "revise" | "polish";
  }) => void;
  applySuggestion: () => void;
  sendMessage: (message: string) => void;
  completeAssistantTurn: (payload: {
    assistantReply: string;
    userMessage?: string;
    task?: WorkspaceSummary["currentTask"];
    nextAction?: string;
  }) => void;
  importDocument: (document: WorkspaceImportedDocument, fileName: string) => void;
};

export function createWorkspaceContextStore(
  repository?: WorkspaceSummaryRepository,
  initialSummary?: WorkspaceSummary,
) {
  const buildAssistantReply = (summary: WorkspaceSummary, message: string) =>
    `已记录你的要求：${message}。我会继续围绕“${summary.activeClauseTitle}”处理，并保持当前文档上下文。`;

  const persist = (summary: WorkspaceSummary) => {
    void repository?.save(summary);
    return summary;
  };

  return createStore<WorkspaceContextState>((set) => ({
    summary: initialSummary,
    previewDocument: undefined,
    setSummary: (summary) => {
      set({ summary: persist(summary) });
    },
    hydrate: async (workspaceId) => {
      const summary = await repository?.load(workspaceId);
      if (summary) {
        set({ summary });
      }
    },
    focusSelection: () =>
      set((state) => {
        if (!state.summary) {
          return state;
        }

        return {
          summary: persist({
            ...state.summary,
            isSelectionFocused: true,
            updatedAt: "刚刚",
          }),
        };
      }),
    selectText: ({ text, blockId, contextLabel, intent }) =>
      set((state) => {
        if (!state.summary || !text.trim()) {
          return state;
        }

        const selectedText = text.trim();
        const intentState =
          intent === "review"
            ? {
                currentTask: "review" as const,
                latestConclusion: "已定位到你选中的内容，接下来我会先帮你找问题。",
                nextAction: "开始找问题",
              }
            : intent === "revise"
              ? {
                  currentTask: "revise" as const,
                  latestConclusion: "已定位到你选中的内容，接下来我会直接帮你改写。",
                  nextAction: "开始直接改写",
                }
              : intent === "polish"
                ? {
                    currentTask: "optimize" as const,
                    latestConclusion: "已定位到你选中的内容，接下来我会帮你润色表达。",
                    nextAction: "开始润色表达",
                  }
                : {
                    currentTask: state.summary.currentTask,
                    latestConclusion: "已切换到你刚刚选中的内容，可以继续围绕这段文字处理。",
                    nextAction: "继续处理选中文本",
                  };

        return {
          summary: persist({
            ...state.summary,
            activeSelectionBlockId: blockId,
            activeClauseTitle: contextLabel?.trim() || "已选文本",
            activeClauseText: selectedText,
            latestConclusion: intentState.latestConclusion,
            nextAction: intentState.nextAction,
            currentTask: intentState.currentTask,
            currentTaskStatus: "in_progress",
            updatedAt: "刚刚",
            isSelectionFocused: true,
          }),
        };
      }),
    applySuggestion: () =>
      set((state) => {
        if (!state.summary) {
          return state;
        }

        const [acceptedSuggestionId, ...restSuggestionIds] = state.summary.pendingSuggestionIds;
        const acceptedText = state.summary.suggestedRevisionText;

        return {
          summary: persist({
            ...state.summary,
            activeClauseText: acceptedText,
            latestConclusion: `已应用建议：${acceptedText}`,
            nextAction: acceptedSuggestionId ? "继续检查相关条款" : "继续审阅下一处问题",
            pendingSuggestionIds: restSuggestionIds,
            currentTaskStatus: "in_progress",
            updatedAt: "刚刚",
            isSelectionFocused: true,
          }),
        };
      }),
    sendMessage: (message) =>
      set((state) => {
        if (!state.summary || !message.trim()) {
          return state;
        }

        const trimmedMessage = message.trim();
        const assistantReply = buildAssistantReply(state.summary, trimmedMessage);

        return {
          summary: persist({
            ...state.summary,
            lastUserIntent: trimmedMessage,
            latestConclusion: assistantReply,
            nextAction: "继续处理当前条款",
            currentTaskStatus: "in_progress",
            updatedAt: "刚刚",
            assistantMessages: [
              ...state.summary.assistantMessages,
              {
                id: `user-${state.summary.assistantMessages.length + 1}`,
                role: "user",
                content: trimmedMessage,
              },
              {
                id: `assistant-${state.summary.assistantMessages.length + 2}`,
                role: "assistant",
                content: assistantReply,
              },
            ],
          }),
        };
      }),
    completeAssistantTurn: ({ assistantReply, userMessage, task, nextAction }) =>
      set((state) => {
        if (!state.summary || !assistantReply.trim()) {
          return state;
        }

        const messages = [...state.summary.assistantMessages];

        if (userMessage?.trim()) {
          messages.push({
            id: `user-${messages.length + 1}`,
            role: "user",
            content: userMessage.trim(),
          });
        }

        messages.push({
          id: `assistant-${messages.length + 1}`,
          role: "assistant",
          content: assistantReply.trim(),
        });

        return {
          summary: persist({
            ...state.summary,
            assistantMessages: messages,
            latestConclusion: assistantReply.trim(),
            currentTask: task ?? state.summary.currentTask,
            nextAction: nextAction ?? "继续处理当前内容",
            currentTaskStatus: "in_progress",
            updatedAt: "刚刚",
          }),
        };
      }),
    importDocument: (document, fileName) =>
      set((state) => {
        if (!state.summary) {
          return state;
        }

        const importedReply = "可以直接选中内容开始处理，或在右侧输入你的要求。";
        const isPdfDocument = document.mode === "pdf";
        const defaultActiveBlockId =
          document.blocks.find((block) => block.kind === "paragraph")?.id ?? document.blocks[0]?.id;

        return {
          previewDocument:
            isPdfDocument && document.pdfSource
              ? {
                  mode: "pdf",
                  source: document.pdfSource,
                }
              : document.mode === "docx" && document.docxSource
                ? {
                    mode: "docx",
                    source: document.docxSource,
                  }
                : undefined,
          summary: persist({
            ...state.summary,
            activeDocumentId: `imported-${Date.now()}`,
            activeDocumentTitle: document.title,
            activeDocumentMode: document.mode,
            activePreviewLabel: document.previewLabel,
            activeSelectionBlockId: defaultActiveBlockId,
            activeClauseTitle: document.activeClauseTitle,
            activeClauseText: document.activeClauseText,
            suggestedRevisionText: "",
            pendingSuggestionIds: [],
            recentEvidenceRefs: [`导入文件 · ${fileName}`],
            latestConclusion: importedReply,
            nextAction: "等待下一步操作",
            currentTaskStatus: "in_progress",
            lastUserIntent: `导入文档 ${fileName}`,
            documentBlocks: document.blocks,
            updatedAt: "刚刚",
            isSelectionFocused: false,
            assistantMessages: [],
          }),
        };
      }),
  }));
}
