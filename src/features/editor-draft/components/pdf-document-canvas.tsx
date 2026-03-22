import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type {
  WorkspacePreviewDocument,
  WorkspaceSummary,
} from "@/features/workspace-context/types/workspace-summary";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type PdfDocumentCanvasProps = {
  summary: WorkspaceSummary;
  title: string;
  previewDocument?: WorkspacePreviewDocument;
  onSelectText: (payload: { text: string; blockId?: string; contextLabel?: string }) => void;
};

type PdfPageContext = {
  pageNumber: number;
  blockId?: string;
  text: string;
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

function collectPdfPages(summary: WorkspaceSummary) {
  const pageMap = new Map<number, PdfPageContext>();

  for (const block of summary.documentBlocks) {
    if (!block.pageNumber) {
      continue;
    }

    const current =
      pageMap.get(block.pageNumber) ??
      ({
        pageNumber: block.pageNumber,
        text: "",
      } satisfies PdfPageContext);

    if (block.kind === "paragraph") {
      current.blockId = block.id;
      current.text = block.text;
    }

    pageMap.set(block.pageNumber, current);
  }

  return Array.from(pageMap.values()).sort((left, right) => left.pageNumber - right.pageNumber);
}

export function PdfDocumentCanvas({
  summary,
  title,
  previewDocument,
  onSelectText,
}: PdfDocumentCanvasProps) {
  const [pageCount, setPageCount] = useState(0);
  const [loadError, setLoadError] = useState<string | undefined>();
  const { containerRef, width } = useCanvasWidth();
  const pageRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const pdfPages = useMemo(() => collectPdfPages(summary), [summary]);
  const activePageNumber =
    summary.documentBlocks.find((block) => block.id === summary.activeSelectionBlockId)?.pageNumber ?? 1;

  useEffect(() => {
    setPageCount(0);
    setLoadError(undefined);
  }, [previewDocument?.source]);

  useEffect(() => {
    if (!summary.isSelectionFocused) {
      return;
    }

    pageRefs.current[activePageNumber]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activePageNumber, summary.isSelectionFocused]);

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
          {Array.from({ length: pageCount }, (_, index) => {
            const pageNumber = index + 1;
            const pageContext = pdfPages.find((page) => page.pageNumber === pageNumber);
            const isActive = pageNumber === activePageNumber;
            const focusClassName =
              summary.isSelectionFocused && isActive ? " pdf-page-card--focused" : "";

            return (
              <button
                key={`pdf-page-${pageNumber}`}
                ref={(element) => {
                  pageRefs.current[pageNumber] = element;
                }}
                className={`pdf-page-card${isActive ? " pdf-page-card--active" : ""}${focusClassName}`}
                data-testid={`pdf-page-card-${pageNumber}`}
                type="button"
                onClick={() =>
                  onSelectText({
                    text: pageContext?.text || `第 ${pageNumber} 页暂未提取到可用正文。`,
                    blockId: pageContext?.blockId,
                    contextLabel: `第 ${pageNumber} 页`,
                  })
                }
              >
                <div className="pdf-page-card__meta">
                  <span>第 {pageNumber} 页</span>
                  {isActive ? <span className="pdf-page-card__status">当前上下文</span> : null}
                </div>
                <Page
                  pageNumber={pageNumber}
                  width={width}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
                <div className="pdf-page-card__excerpt">
                  {pageContext?.text || `第 ${pageNumber} 页暂未提取到可用正文。`}
                </div>
              </button>
            );
          })}
        </Document>
      </div>
    </section>
  );
}
