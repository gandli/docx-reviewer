import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { WorkspaceSidebar } from "@/features/workspace-shell/components/workspace-sidebar";
import { DocumentHeader } from "@/features/editor-draft/components/document-header";
import { DocumentCanvas } from "@/features/editor-draft/components/document-canvas";
import { AssistantPanel } from "@/features/assistant-panel/components/assistant-panel";

type WorkspaceLayoutProps = {
  summary: WorkspaceSummary;
  onApplySuggestion: () => void;
  onJumpToSelection: () => void;
  onSelectText: (payload: { text: string; blockId?: string }) => void;
  onSendMessage: (message: string) => void;
  onImportDocument: (file: File) => void | Promise<void>;
};

export function WorkspaceLayout({
  summary,
  onApplySuggestion,
  onJumpToSelection,
  onSelectText,
  onSendMessage,
  onImportDocument,
}: WorkspaceLayoutProps) {
  return (
    <div className="workspace-layout">
      <WorkspaceSidebar summary={summary} onImportDocument={onImportDocument} />
      <main className="workspace-main">
        <DocumentHeader title={summary.activeDocumentTitle} />
        <DocumentCanvas summary={summary} onSelectText={onSelectText} />
      </main>
      <AssistantPanel
        summary={summary}
        onApplySuggestion={onApplySuggestion}
        onJumpToSelection={onJumpToSelection}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}
