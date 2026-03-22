import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { WorkspaceSidebar } from "@/features/workspace-shell/components/workspace-sidebar";
import { DocumentHeader } from "@/features/editor-draft/components/document-header";
import { DocumentCanvas } from "@/features/editor-draft/components/document-canvas";
import { AssistantPanel } from "@/features/assistant-panel/components/assistant-panel";

type WorkspaceLayoutProps = {
  summary: WorkspaceSummary;
  onApplySuggestion: () => void;
  onJumpToSelection: () => void;
};

export function WorkspaceLayout({
  summary,
  onApplySuggestion,
  onJumpToSelection,
}: WorkspaceLayoutProps) {
  return (
    <div className="workspace-layout">
      <WorkspaceSidebar summary={summary} />
      <main className="workspace-main">
        <DocumentHeader title="采购与付款管理制度" />
        <DocumentCanvas summary={summary} />
      </main>
      <AssistantPanel
        summary={summary}
        onApplySuggestion={onApplySuggestion}
        onJumpToSelection={onJumpToSelection}
      />
    </div>
  );
}
