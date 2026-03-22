export type WorkspaceTaskType = "generate" | "review" | "revise" | "optimize";

export type WorkspaceSummary = {
  workspaceId: string;
  workspaceTitle: string;
  activeDocumentId: string;
  activeNodeId?: string;
  currentTask: WorkspaceTaskType;
  currentTaskStatus: "idle" | "in_progress" | "ready_to_resume";
  lastUserIntent: string;
  latestConclusion: string;
  nextAction: string;
  openQuestions: string[];
  pendingSuggestionIds: string[];
  recentEvidenceRefs: string[];
  updatedAt: string;
  lastAgent: string;
};
