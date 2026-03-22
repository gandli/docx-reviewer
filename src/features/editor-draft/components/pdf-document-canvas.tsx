import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { WorkspacePreviewDocument } from "@/features/workspace-context/types/workspace-summary";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type PdfDocumentCanvasProps = {
  title: string;
  previewDocument?: WorkspacePreviewDocument;
};

function useCanvasWidth() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(720);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateWidth = () => {
      setWidth(Math.max(320, Math.min(container.clientWidth - 40, 860)));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return { containerRef, width };
}

export function PdfDocumentCanvas({ title, previewDocument }: PdfDocumentCanvasProps) {
  const [pageCount, setPageCount] = useState(0);
  const [loadError, setLoadError] = useState<string | undefined>();
  const { containerRef, width } = useCanvasWidth();

  useEffect(() => {
    setPageCount(0);
    setLoadError(undefined);
  }, [previewDocument?.source]);

  if (!previewDocument) {
    return (
      <section className="document-canvas document-canvas--pdf" data-testid="document-canvas">
        <div className="document-canvas__note">PDF 预览需要重新导入原文件</div>
        <div className="pdf-empty-state">当前 PDF 预览内容不可用，请重新导入后继续查看。</div>
      </section>
    );
  }

  return (
    <section className="document-canvas document-canvas--pdf" data-testid="document-canvas">
      <div className="document-canvas__note">
        {pageCount > 0 ? `PDF 原样预览 · 共 ${pageCount} 页` : "正在载入 PDF 预览"}
      </div>
      <div ref={containerRef} className="pdf-document-viewer" data-testid="pdf-document-viewer">
        <Document
          className="pdf-document"
          file={previewDocument.source}
          loading={<div className="pdf-empty-state">正在打开《{title}》…</div>}
          error={<div className="pdf-empty-state">{loadError ?? "PDF 打开失败，请重新导入后重试。"}</div>}
          onLoadSuccess={({ numPages }) => setPageCount(numPages)}
          onLoadError={(error) => setLoadError(error.message)}
        >
          {Array.from({ length: pageCount }, (_, index) => (
            <Page
              key={`pdf-page-${index + 1}`}
              pageNumber={index + 1}
              width={width}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          ))}
        </Document>
      </div>
    </section>
  );
}
