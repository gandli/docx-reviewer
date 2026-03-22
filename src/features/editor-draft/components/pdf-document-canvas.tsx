import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
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

type PdfSelectionPopover = {
  text: string;
  blockId?: string;
  contextLabel: string;
  top: number;
  left: number;
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
  const [selectionPopover, setSelectionPopover] = useState<PdfSelectionPopover | undefined>();
  const { containerRef, width } = useCanvasWidth();
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const selectionPopoverRef = useRef<HTMLDivElement | null>(null);
  const pdfPages = useMemo(() => collectPdfPages(summary), [summary]);
  const activePageNumber =
    summary.documentBlocks.find((block) => block.id === summary.activeSelectionBlockId)?.pageNumber ?? 1;

  useEffect(() => {
    setPageCount(0);
    setLoadError(undefined);
    setSelectionPopover(undefined);
  }, [previewDocument?.source]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        selectionPopoverRef.current &&
        event.target instanceof Node &&
        selectionPopoverRef.current.contains(event.target)
      ) {
        return;
      }

      setSelectionPopover(undefined);
    };
    window.addEventListener("pointerdown", handlePointerDown);

    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

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
            const contextLabel = `第 ${pageNumber} 页`;

            const handleSelectPage = () =>
              onSelectText({
                text: pageContext?.text || `${contextLabel}暂未提取到可用正文。`,
                blockId: pageContext?.blockId,
                contextLabel,
              });

            const handleExcerptMouseUp = (event: MouseEvent<HTMLDivElement>) => {
              const selection = window.getSelection();
              const text = selection?.toString().trim();

              if (!selection || !text) {
                setSelectionPopover(undefined);
                return;
              }

              const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : undefined;
              const anchorNode = range?.commonAncestorContainer;
              const anchorElement =
                anchorNode?.nodeType === Node.ELEMENT_NODE
                  ? (anchorNode as Element)
                  : anchorNode?.parentElement;

              if (!anchorElement || !event.currentTarget.contains(anchorElement)) {
                return;
              }

              const rect = range?.getBoundingClientRect();
              if (!rect) {
                return;
              }

              setSelectionPopover({
                text,
                blockId: pageContext?.blockId,
                contextLabel,
                top: rect.top + window.scrollY - 52,
                left: rect.left + window.scrollX + rect.width / 2,
              });
            };

            return (
              <div
                key={`pdf-page-${pageNumber}`}
                ref={(element) => {
                  pageRefs.current[pageNumber] = element;
                }}
                className={`pdf-page-card${isActive ? " pdf-page-card--active" : ""}${focusClassName}`}
                role="group"
              >
                <div className="pdf-page-card__meta">
                  <button
                    className="pdf-page-card__page-trigger"
                    data-testid={`pdf-page-trigger-${pageNumber}`}
                    type="button"
                    onClick={handleSelectPage}
                  >
                    第 {pageNumber} 页
                  </button>
                  {isActive ? <span className="pdf-page-card__status">当前上下文</span> : null}
                </div>
                <button
                  className="pdf-page-card__preview"
                  data-testid={`pdf-page-card-${pageNumber}`}
                  type="button"
                  onClick={handleSelectPage}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={width}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                </button>
                <div
                  className="pdf-page-card__excerpt"
                  data-testid={`pdf-page-excerpt-${pageNumber}`}
                  onMouseUp={handleExcerptMouseUp}
                >
                  {pageContext?.text || `第 ${pageNumber} 页暂未提取到可用正文。`}
                </div>
              </div>
            );
          })}
        </Document>
      </div>
      {selectionPopover ? (
        <div
          className="pdf-selection-popover"
          data-testid="pdf-selection-popover"
          ref={selectionPopoverRef}
          style={{
            top: selectionPopover.top,
            left: selectionPopover.left,
          }}
        >
          <button
            className="pdf-selection-popover__action"
            type="button"
            onClick={() => {
              onSelectText({
                text: selectionPopover.text,
                blockId: selectionPopover.blockId,
                contextLabel: selectionPopover.contextLabel,
              });
              window.getSelection()?.removeAllRanges();
              setSelectionPopover(undefined);
            }}
          >
            围绕所选内容继续处理
          </button>
          <button
            className="pdf-selection-popover__dismiss"
            type="button"
            onClick={() => {
              window.getSelection()?.removeAllRanges();
              setSelectionPopover(undefined);
            }}
          >
            关闭
          </button>
        </div>
      ) : null}
    </section>
  );
}
