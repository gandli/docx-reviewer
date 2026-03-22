import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";

export interface WorkspaceSummaryRepository {
  load(workspaceId: string): Promise<WorkspaceSummary | undefined>;
  save(summary: WorkspaceSummary): Promise<void>;
}

export function createMemoryWorkspaceSummaryRepository(
  initialSummary?: WorkspaceSummary,
): WorkspaceSummaryRepository {
  let current = initialSummary;

  return {
    async load(workspaceId) {
      if (current?.workspaceId === workspaceId) {
        return current;
      }

      return undefined;
    },
    async save(summary) {
      current = summary;
    },
  };
}
