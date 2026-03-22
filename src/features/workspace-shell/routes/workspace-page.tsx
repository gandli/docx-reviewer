import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useParams } from "react-router-dom";
import { WorkspaceLayout } from "@/features/workspace-shell/components/workspace-layout";
import { createWorkspaceContextStore } from "@/features/workspace-context/store/workspace-context-store";
import { createBrowserWorkspaceSummaryRepository } from "@/services/persistence/repositories/workspace-summary-repository";
import { importDocumentFile } from "@/services/import/import-document";
import { mockWorkspaceSummary } from "@/shared/mocks/workspace-shell";

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

  const handleImportDocument = async (file: File) => {
    const importedDocument = await importDocumentFile(file);
    store.getState().importDocument(importedDocument, file.name);
  };

  return (
    <div className="workspace-page">
      <WorkspaceLayout
        summary={summary}
        previewDocument={workspaceState.previewDocument}
        onApplySuggestion={() => store.getState().applySuggestion()}
        onJumpToSelection={() => store.getState().focusSelection()}
        onSelectText={(payload) => store.getState().selectText(payload)}
        onSendMessage={(message) => store.getState().sendMessage(message)}
        onImportDocument={handleImportDocument}
      />
    </div>
  );
}
