import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { useState } from "react";
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
  onExport: () => void;
  onOpenSettings: () => void;
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
  onExport,
  onOpenSettings,
  localModelLabel,
  localModelActionLabel,
  onLocalModelAction,
  isLocalModelBusy,
}: WorkspaceLayoutProps) {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const desktopGridColumns = isLeftCollapsed
    ? isRightCollapsed
      ? "lg:grid-cols-[72px_minmax(0,1fr)_72px]"
      : "lg:grid-cols-[72px_minmax(0,1fr)_24%]"
    : isRightCollapsed
      ? "lg:grid-cols-[22%_minmax(0,1fr)_72px]"
      : "lg:grid-cols-[22%_54%_24%]";

  return (
    <div className={`grid h-screen overflow-hidden bg-[var(--color-surface-app)] max-[1180px]:grid-cols-[24%_52%_24%] max-[980px]:grid-cols-1 ${desktopGridColumns}`}>
      <WorkspaceSidebar
        summary={summary}
        onImportDocument={onImportDocument}
        onExport={onExport}
        onOpenSettings={onOpenSettings}
        isCollapsed={isLeftCollapsed}
        onToggleCollapse={() => setIsLeftCollapsed((current) => !current)}
      />
      <main
        className="min-w-0 overflow-x-hidden overflow-y-auto bg-[var(--color-surface-app)] px-0 pt-4 pb-0 max-[980px]:h-auto max-[980px]:min-h-[55vh]"
        data-scroll-region="true"
      >
        <DocumentHeader
          title={summary.activeDocumentTitle}
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
        isCollapsed={isRightCollapsed}
        onToggleCollapse={() => setIsRightCollapsed((current) => !current)}
      />
    </div>
  );
}
