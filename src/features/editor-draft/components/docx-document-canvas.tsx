import { renderAsync } from "docx-preview";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type {
  WorkspacePreviewDocument,
  WorkspaceSummary,
} from "@/features/workspace-context/types/workspace-summary";

type DocxDocumentCanvasProps = {
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

type DocxSelectionPopover = {
  text: string;
  top: number;
  left: number;
};

const popoverClassName =
  "fixed z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-[14px] border border-[rgba(216,207,193,0.92)] bg-[rgba(255,251,244,0.96)] px-[10px] py-2 shadow-[0_18px_36px_rgba(71,53,33,0.14)]";
const popoverActionClassName =
  "cursor-pointer border-0 bg-transparent p-0 font-sans text-[0.82rem] font-semibold text-[var(--color-text-primary)]";
const popoverDismissClassName =
  "cursor-pointer border-0 bg-transparent p-0 font-sans text-[0.82rem] text-[var(--color-text-muted)]";

export function DocxDocumentCanvas({
  summary,
  title,
  previewDocument,
  onSelectText,
}: DocxDocumentCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectionPopoverRef = useRef<HTMLDivElement | null>(null);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [selectionPopover, setSelectionPopover] = useState<DocxSelectionPopover | undefined>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || previewDocument?.mode !== "docx") {
      return;
    }

    let isCancelled = false;
    setLoadError(undefined);
    setSelectionPopover(undefined);
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

  const handleMouseUp = (event: MouseEvent<HTMLDivElement>) => {
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
      top: rect.top + window.scrollY - 52,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  };

  if (previewDocument?.mode !== "docx") {
    return (
      <section
        className="relative min-w-0 rounded-[22px] border border-[#dfd6c8] bg-[linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,255,255,0.95)),var(--color-surface-paper)] px-10 py-9 shadow-[0_24px_54px_rgba(71,53,33,0.1)]"
        data-testid="document-canvas"
      >
        <div className="mb-5 text-right font-sans text-[0.75rem] font-bold tracking-[0.02em] text-[rgba(138,106,55,0.88)]">
          Word 预览需要重新导入原文件
        </div>
        <div className="mx-auto w-full max-w-[720px] rounded-[18px] border border-dashed border-[rgba(181,142,83,0.28)] px-7 py-[72px] text-center font-sans text-[0.92rem] leading-[1.7] text-[var(--color-text-muted)]">
          当前 Word 原样预览内容不可用，请重新导入《{title}》后继续查看。
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-w-0 rounded-[22px] border border-[#dfd6c8] bg-[linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,255,255,0.95)),var(--color-surface-paper)] px-10 py-9 shadow-[0_24px_54px_rgba(71,53,33,0.1)]"
      data-testid="document-canvas"
    >
      <div className="mb-5 text-right font-sans text-[0.75rem] font-bold tracking-[0.02em] text-[rgba(138,106,55,0.88)]">
        Word 原样预览
      </div>
      <div
        className="flex min-h-[540px] w-full max-w-full justify-center overflow-x-auto overflow-y-hidden px-5"
        data-testid="docx-document-viewer"
        onMouseUp={handleMouseUp}
      >
        {loadError ? (
          <div className="mx-auto w-full max-w-[720px] rounded-[18px] border border-dashed border-[rgba(181,142,83,0.28)] px-7 py-[72px] text-center font-sans text-[0.92rem] leading-[1.7] text-[var(--color-text-muted)]">
            {loadError}
          </div>
        ) : (
          <div
            ref={containerRef}
            className="docx-preview-host flex w-full max-w-full justify-center overflow-x-auto overflow-y-hidden"
            data-testid="docx-preview-host"
          />
        )}
      </div>
      <div className="mt-[18px] font-sans text-[0.82rem] leading-[1.7] text-[var(--color-text-muted)]">
        已载入《{summary.activeDocumentTitle}》的原样排版预览。后续我们可以继续基于正文结构找问题、直接改写和导出。
      </div>
      {selectionPopover ? (
        <div
          className={popoverClassName}
          data-testid="docx-selection-popover"
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
                contextLabel: "已选文本",
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
                contextLabel: "已选文本",
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
                contextLabel: "已选文本",
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
