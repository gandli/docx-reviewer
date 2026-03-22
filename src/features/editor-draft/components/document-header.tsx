import type { WorkspaceDocumentMode } from "@/features/workspace-context/types/workspace-summary";

type DocumentHeaderProps = {
  title: string;
  mode: WorkspaceDocumentMode;
};

export function DocumentHeader({ title, mode }: DocumentHeaderProps) {
  return (
    <header className="document-header">
      <div>
        <div className="eyebrow">Document</div>
        <div className="title-lg" style={{ fontSize: "1.4rem", marginTop: 8 }}>
          {title}
        </div>
      </div>
      <div className="document-status-inline">
        {mode === "pdf" || mode === "docx" ? (
          <span className="document-status-inline__item is-active">原样预览</span>
        ) : (
          <>
            <span className="document-status-inline__item">阅读视图</span>
            <span className="document-status-inline__divider" aria-hidden="true">
              ·
            </span>
            <span className="document-status-inline__item is-active">可编辑</span>
          </>
        )}
      </div>
    </header>
  );
}
