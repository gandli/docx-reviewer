import { renderAsync } from "docx-preview";
import { useEffect, useRef, useState } from "react";
import type {
  WorkspacePreviewDocument,
  WorkspaceSummary,
} from "@/features/workspace-context/types/workspace-summary";

type DocxDocumentCanvasProps = {
  summary: WorkspaceSummary;
  title: string;
  previewDocument?: WorkspacePreviewDocument;
};

export function DocxDocumentCanvas({
  summary,
  title,
  previewDocument,
}: DocxDocumentCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadError, setLoadError] = useState<string | undefined>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || previewDocument?.mode !== "docx") {
      return;
    }

    let isCancelled = false;
    setLoadError(undefined);
    container.innerHTML = "";

    void renderAsync(previewDocument.source, container, undefined, {
      className: "docx-preview-surface",
      inWrapper: false,
      ignoreWidth: false,
      ignoreHeight: false,
      breakPages: true,
    }).catch((error: unknown) => {
      if (!isCancelled) {
        setLoadError(error instanceof Error ? error.message : "Word 文档预览失败");
      }
    });

    return () => {
      isCancelled = true;
      container.innerHTML = "";
    };
  }, [previewDocument]);

  if (previewDocument?.mode !== "docx") {
    return (
      <section className="document-canvas document-canvas--docx" data-testid="document-canvas">
        <div className="document-canvas__note">Word 预览需要重新导入原文件</div>
        <div className="pdf-empty-state">当前 Word 原样预览内容不可用，请重新导入《{title}》后继续查看。</div>
      </section>
    );
  }

  return (
    <section className="document-canvas document-canvas--docx" data-testid="document-canvas">
      <div className="document-canvas__note">Word 原样预览</div>
      <div className="docx-document-viewer" data-testid="docx-document-viewer">
        {loadError ? (
          <div className="pdf-empty-state">{loadError}</div>
        ) : (
          <div ref={containerRef} className="docx-preview-host" data-testid="docx-preview-host" />
        )}
      </div>
      <div className="docx-document-summary">
        已载入《{summary.activeDocumentTitle}》的原样排版预览。后续我们可以继续基于正文结构做审阅、修订和导出。
      </div>
    </section>
  );
}
