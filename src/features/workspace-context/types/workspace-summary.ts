export type WorkspaceTaskType = "generate" | "review" | "revise" | "optimize";

export type WorkspaceAssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type WorkspaceDocumentBlock = {
  id: string;
  kind: "heading" | "paragraph";
  text: string;
  level?: 1 | 2 | 3;
  pageNumber?: number;
};

export type WorkspaceDocumentMode = "structured" | "plain" | "pdf" | "docx";

export type WorkspacePreviewLabel = "文本原样预览" | "Markdown 原样预览";

export type WorkspaceImportedDocument = {
  mode: WorkspaceDocumentMode;
  title: string;
  blocks: WorkspaceDocumentBlock[];
  activeClauseTitle: string;
  activeClauseText: string;
  previewLabel?: WorkspacePreviewLabel;
  pdfSource?: string;
  docxSource?: ArrayBuffer;
};

export type WorkspacePreviewDocument =
  | {
      mode: "pdf";
      source: string;
    }
  | {
      mode: "docx";
      source: ArrayBuffer;
    };

export type WorkspaceSummary = {
  workspaceId: string;
  workspaceTitle: string;
  activeDocumentId: string;
  activeDocumentTitle: string;
  activeDocumentMode: WorkspaceDocumentMode;
  activePreviewLabel?: WorkspacePreviewLabel;
  activeNodeId?: string;
  activeSelectionBlockId?: string;
  activeClauseTitle: string;
  activeClauseText: string;
  suggestedRevisionText: string;
  isSelectionFocused: boolean;
  currentTask: WorkspaceTaskType;
  currentTaskStatus: "idle" | "in_progress" | "ready_to_resume";
  lastUserIntent: string;
  latestConclusion: string;
  nextAction: string;
  openQuestions: string[];
  pendingSuggestionIds: string[];
  recentEvidenceRefs: string[];
  assistantMessages: WorkspaceAssistantMessage[];
  documentBlocks: WorkspaceDocumentBlock[];
  updatedAt: string;
};
