import { createStore } from "zustand/vanilla";
import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import type { WorkspaceSummaryRepository } from "@/services/persistence/repositories/workspace-summary-repository";

export type WorkspaceContextState = {
  summary?: WorkspaceSummary;
  setSummary: (summary: WorkspaceSummary) => void;
  hydrate: (workspaceId: string) => Promise<void>;
};

export function createWorkspaceContextStore(
  repository?: WorkspaceSummaryRepository,
  initialSummary?: WorkspaceSummary,
) {
  return createStore<WorkspaceContextState>((set) => ({
    summary: initialSummary,
    setSummary: (summary) => {
      void repository?.save(summary);
      set({ summary });
    },
    hydrate: async (workspaceId) => {
      const summary = await repository?.load(workspaceId);
      if (summary) {
        set({ summary });
      }
    },
  }));
}
