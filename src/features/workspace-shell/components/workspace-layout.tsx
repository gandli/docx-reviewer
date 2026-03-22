import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { WorkspaceSidebar } from "@/features/workspace-shell/components/workspace-sidebar";
import { DocumentHeader } from "@/features/editor-draft/components/document-header";
import { DocumentCanvas } from "@/features/editor-draft/components/document-canvas";
import { PdfDocumentCanvas } from "@/features/editor-draft/components/pdf-document-canvas";
import { DocxDocumentCanvas } from "@/features/editor-draft/components/docx-document-canvas";
import { AssistantPanel } from "@/features/assistant-panel/components/assistant-panel";
import type { WorkspacePreviewDocument } from "@/features/workspace-context/types/workspace-summary";

type WorkspaceLayoutProps = {
  summary: WorkspaceSummary;
  previewDocument?: WorkspacePreviewDocument;
  onApplySuggestion: () => void;
  onJumpToSelection: () => void;
  onSelectText: (payload: {
    text: string;
    blockId?: string;
    contextLabel?: string;
    intent?: "review" | "revise" | "polish";
  }) => void;
  onSendMessage: (message: string) => void;
  onImportDocument: (file: File) => void | Promise<void>;
  localModelLabel: string;
  localModelActionLabel?: string;
  onLocalModelAction?: () => void;
  isLocalModelBusy?: boolean;
};

export function WorkspaceLayout({
  summary,
  previewDocument,
  onApplySuggestion,
  onJumpToSelection,
  onSelectText,
  onSendMessage,
  onImportDocument,
  localModelLabel,
  localModelActionLabel,
  onLocalModelAction,
  isLocalModelBusy,
}: WorkspaceLayoutProps) {
  return (
    <div className="workspace-layout">
      <WorkspaceSidebar summary={summary} onImportDocument={onImportDocument} />
      <main className="workspace-main">
        <DocumentHeader
          title={summary.activeDocumentTitle}
          mode={summary.activeDocumentMode}
          previewLabel={summary.activePreviewLabel}
        />
        {summary.activeDocumentMode === "pdf" ? (
          <PdfDocumentCanvas
            summary={summary}
            title={summary.activeDocumentTitle}
            previewDocument={previewDocument}
            onSelectText={onSelectText}
          />
        ) : summary.activeDocumentMode === "docx" ? (
          <DocxDocumentCanvas
            summary={summary}
            title={summary.activeDocumentTitle}
            previewDocument={previewDocument}
            onSelectText={onSelectText}
          />
        ) : (
          <DocumentCanvas summary={summary} onSelectText={onSelectText} />
        )}
      </main>
      <AssistantPanel
        summary={summary}
        onApplySuggestion={onApplySuggestion}
        onJumpToSelection={onJumpToSelection}
        onSendMessage={onSendMessage}
        localModelLabel={localModelLabel}
        localModelActionLabel={localModelActionLabel}
        onLocalModelAction={onLocalModelAction}
        isLocalModelBusy={isLocalModelBusy}
      />
    </div>
  );
}
