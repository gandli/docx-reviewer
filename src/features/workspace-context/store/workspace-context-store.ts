import { createStore } from "zustand/vanilla";
import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import type { WorkspaceSummaryRepository } from "@/services/persistence/repositories/workspace-summary-repository";

export type WorkspaceContextState = {
  summary?: WorkspaceSummary;
  setSummary: (summary: WorkspaceSummary) => void;
  hydrate: (workspaceId: string) => Promise<void>;
  focusSelection: () => void;
  applySuggestion: () => void;
};

export function createWorkspaceContextStore(
  repository?: WorkspaceSummaryRepository,
  initialSummary?: WorkspaceSummary,
) {
  const persist = (summary: WorkspaceSummary) => {
    void repository?.save(summary);
    return summary;
  };

  return createStore<WorkspaceContextState>((set) => ({
    summary: initialSummary,
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
  }));
}
