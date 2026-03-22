import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
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
  onSelectText: (payload: {
    text: string;
    blockId?: string;
    contextLabel?: string;
    intent?: "review" | "revise" | "polish";
  }) => void;
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

const popoverClassName =
  "fixed z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-[14px] border border-[rgba(216,207,193,0.92)] bg-[rgba(255,251,244,0.96)] px-[10px] py-2 shadow-[0_18px_36px_rgba(71,53,33,0.14)]";
const popoverActionClassName =
  "cursor-pointer border-0 bg-transparent p-0 font-sans text-[0.82rem] font-semibold text-[var(--color-text-primary)]";
const popoverDismissClassName =
  "cursor-pointer border-0 bg-transparent p-0 font-sans text-[0.82rem] text-[var(--color-text-muted)]";

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
      <section
        className="relative min-w-0 bg-white px-6 py-7"
        data-testid="document-canvas"
      >
        <div className="mb-5 text-right font-sans text-[0.75rem] font-bold tracking-[0.02em] text-[rgba(138,106,55,0.88)]">
          PDF 预览需要重新导入原文件
        </div>
        <div className="mx-auto w-full max-w-[720px] rounded-[18px] border border-dashed border-[rgba(181,142,83,0.28)] px-7 py-[72px] text-center font-sans text-[0.92rem] leading-[1.7] text-[var(--color-text-muted)]">
          当前 PDF 预览内容不可用，请重新导入后继续查看。
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-w-0 bg-white px-6 py-7"
      data-testid="document-canvas"
    >
      <div className="mb-5 text-right font-sans text-[0.75rem] font-bold tracking-[0.02em] text-[rgba(138,106,55,0.88)]">
        {pageCount > 0 ? `PDF 原样预览 · 共 ${pageCount} 页` : "正在载入 PDF 预览"}
      </div>
      <div
        ref={containerRef}
        className="flex min-h-[540px] justify-center"
        data-testid="pdf-document-viewer"
      >
        <Document
          className="grid w-full justify-items-center gap-[18px]"
          file={previewDocument.source}
          loading={
            <div className="mx-auto w-full max-w-[720px] rounded-[18px] border border-dashed border-[rgba(181,142,83,0.28)] px-7 py-[72px] text-center font-sans text-[0.92rem] leading-[1.7] text-[var(--color-text-muted)]">
              正在打开《{title}》…
            </div>
          }
          error={
            <div className="mx-auto w-full max-w-[720px] rounded-[18px] border border-dashed border-[rgba(181,142,83,0.28)] px-7 py-[72px] text-center font-sans text-[0.92rem] leading-[1.7] text-[var(--color-text-muted)]">
              {loadError ?? "PDF 打开失败，请重新导入后重试。"}
            </div>
          }
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

            const handlePreviewMouseUp = (event: MouseEvent<HTMLDivElement>) => {
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

            const handlePreviewClick = () => {
              const selectedText = window.getSelection()?.toString().trim();
              if (selectedText) {
                return;
              }

              handleSelectPage();
            };

            return (
              <div
                key={`pdf-page-${pageNumber}`}
                ref={(element) => {
                  pageRefs.current[pageNumber] = element;
                }}
                className={`w-full max-w-[900px] text-left${isActive ? " pdf-page-card--active" : ""}${focusClassName}`}
                role="group"
              >
                <div className="mb-2 flex items-center justify-between font-sans text-[0.78rem] font-semibold text-[var(--color-text-muted)]">
                  <button
                    className="cursor-pointer border-0 bg-transparent p-0 text-inherit"
                    data-testid={`pdf-page-trigger-${pageNumber}`}
                    type="button"
                    onClick={handleSelectPage}
                  >
                    第 {pageNumber} 页
                  </button>
                  {isActive ? (
                    <span className="text-[rgba(138,106,55,0.92)]">当前上下文</span>
                  ) : null}
                </div>
                <div
                  className="block w-full cursor-text"
                  data-testid={`pdf-page-card-${pageNumber}`}
                  onClick={handlePreviewClick}
                  onMouseUp={handlePreviewMouseUp}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={width}
                    renderAnnotationLayer={false}
                    renderTextLayer
                  />
                </div>
              </div>
            );
          })}
        </Document>
      </div>
      {selectionPopover ? (
        <div
          className={popoverClassName}
          data-testid="pdf-selection-popover"
          ref={selectionPopoverRef}
          style={{
            top: selectionPopover.top,
            left: selectionPopover.left,
          }}
        >
          <button
            className={popoverActionClassName}
            type="button"
            onClick={() => {
              onSelectText({
                text: selectionPopover.text,
                blockId: selectionPopover.blockId,
                contextLabel: selectionPopover.contextLabel,
                intent: "review",
              });
              window.getSelection()?.removeAllRanges();
              setSelectionPopover(undefined);
            }}
          >
            找问题
          </button>
          <button
            className={popoverActionClassName}
            type="button"
            onClick={() => {
              onSelectText({
                text: selectionPopover.text,
                blockId: selectionPopover.blockId,
                contextLabel: selectionPopover.contextLabel,
                intent: "revise",
              });
              window.getSelection()?.removeAllRanges();
              setSelectionPopover(undefined);
            }}
          >
            直接改写
          </button>
          <button
            className={popoverActionClassName}
            type="button"
            onClick={() => {
              onSelectText({
                text: selectionPopover.text,
                blockId: selectionPopover.blockId,
                contextLabel: selectionPopover.contextLabel,
                intent: "polish",
              });
              window.getSelection()?.removeAllRanges();
              setSelectionPopover(undefined);
            }}
          >
            润色表达
          </button>
          <button
            className={popoverDismissClassName}
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
