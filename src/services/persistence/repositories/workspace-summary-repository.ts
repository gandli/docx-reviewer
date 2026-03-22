import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";

export interface WorkspaceSummaryRepository {
  load(workspaceId: string): Promise<WorkspaceSummary | undefined>;
  save(summary: WorkspaceSummary): Promise<void>;
}

function normalizeWorkspaceSummary(
  summary: WorkspaceSummary,
  fallbackSummary?: WorkspaceSummary,
): WorkspaceSummary {
  if (!fallbackSummary || fallbackSummary.workspaceId !== summary.workspaceId) {
    return summary;
  }

  return {
    ...fallbackSummary,
    ...summary,
    workspaceTitle: fallbackSummary.workspaceTitle,
  };
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

export function createBrowserWorkspaceSummaryRepository(
  fallbackSummary?: WorkspaceSummary,
): WorkspaceSummaryRepository {
  const memory = createMemoryWorkspaceSummaryRepository(fallbackSummary);

  const getStorage = () => {
    if (typeof window === "undefined") {
      return undefined;
    }

    return window.localStorage;
  };

  return {
    async load(workspaceId) {
      const storage = getStorage();
      const value = storage?.getItem(`workspace-summary:${workspaceId}`);

      if (!value) {
        return memory.load(workspaceId);
      }

      try {
        return normalizeWorkspaceSummary(
          JSON.parse(value) as WorkspaceSummary,
          fallbackSummary,
        );
      } catch {
        return memory.load(workspaceId);
      }
    },
    async save(summary) {
      const storage = getStorage();
      storage?.setItem(`workspace-summary:${summary.workspaceId}`, JSON.stringify(summary));
      await memory.save(summary);
    },
  };
}
