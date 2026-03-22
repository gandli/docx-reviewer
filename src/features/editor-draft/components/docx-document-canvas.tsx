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
  onSelectText: (payload: { text: string; blockId?: string; contextLabel?: string }) => void;
};

type DocxSelectionPopover = {
  text: string;
  top: number;
  left: number;
};

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
      <section className="document-canvas document-canvas--docx" data-testid="document-canvas">
        <div className="document-canvas__note">Word 预览需要重新导入原文件</div>
        <div className="pdf-empty-state">当前 Word 原样预览内容不可用，请重新导入《{title}》后继续查看。</div>
      </section>
    );
  }

  return (
    <section className="document-canvas document-canvas--docx" data-testid="document-canvas">
      <div className="document-canvas__note">Word 原样预览</div>
      <div
        className="docx-document-viewer"
        data-testid="docx-document-viewer"
        onMouseUp={handleMouseUp}
      >
        {loadError ? (
          <div className="pdf-empty-state">{loadError}</div>
        ) : (
          <div ref={containerRef} className="docx-preview-host" data-testid="docx-preview-host" />
        )}
      </div>
      <div className="docx-document-summary">
        已载入《{summary.activeDocumentTitle}》的原样排版预览。后续我们可以继续基于正文结构做审阅、修订和导出。
      </div>
      {selectionPopover ? (
        <div
          className="pdf-selection-popover"
          data-testid="docx-selection-popover"
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
                contextLabel: "已选文本",
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
