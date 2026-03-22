import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useParams } from "react-router-dom";
import { WorkspaceLayout } from "@/features/workspace-shell/components/workspace-layout";
import { createWorkspaceContextStore } from "@/features/workspace-context/store/workspace-context-store";
import { createMemoryWorkspaceSummaryRepository } from "@/services/persistence/repositories/workspace-summary-repository";
import { mockWorkspaceSummary } from "@/shared/mocks/workspace-shell";

export function WorkspacePage() {
  const { workspaceId = mockWorkspaceSummary.workspaceId } = useParams();
  const repository = useMemo(
    () => createMemoryWorkspaceSummaryRepository(mockWorkspaceSummary),
    [],
  );
  const store = useMemo(
    () => createWorkspaceContextStore(repository, mockWorkspaceSummary),
    [repository],
  );

  useEffect(() => {
    void store.getState().hydrate(workspaceId);
  }, [store, workspaceId]);

  const summary = useSyncExternalStore(
    store.subscribe,
    () => store.getState().summary ?? mockWorkspaceSummary,
  );

  return (
    <div className="workspace-page">
      <WorkspaceLayout summary={summary} />
    </div>
  );
}
