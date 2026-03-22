export type WorkspaceTaskType = "generate" | "review" | "revise" | "optimize";

export type WorkspaceAssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type WorkspaceSummary = {
  workspaceId: string;
  workspaceTitle: string;
  activeDocumentId: string;
  activeNodeId?: string;
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
  updatedAt: string;
};
