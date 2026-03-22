import { useEffect, useRef, useState, type MouseEvent } from "react";
import type {
  WorkspaceDocumentBlock,
  WorkspaceSummary,
} from "@/features/workspace-context/types/workspace-summary";
import { RiskMarker } from "@/features/editor-draft/components/risk-marker";

type DocumentCanvasProps = {
  summary: WorkspaceSummary;
  onSelectText: (payload: {
    text: string;
    blockId?: string;
    contextLabel?: string;
    intent?: "review" | "revise" | "polish";
  }) => void;
};

type DocumentSelectionPopover = {
  text: string;
  blockId?: string;
  contextLabel: string;
  top: number;
  left: number;
};

function getHeadingClassName(block: WorkspaceDocumentBlock) {
  const level = block.level ?? 2;
  return `document-block document-block--heading document-block--heading-${level}`;
}

export function DocumentCanvas({ summary, onSelectText }: DocumentCanvasProps) {
  const suggestionCount = summary.pendingSuggestionIds.length + (summary.suggestedRevisionText ? 1 : 0);
  const hasFocusedSelection = summary.isSelectionFocused;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const selectionPopoverRef = useRef<HTMLDivElement | null>(null);
  const [selectionPopover, setSelectionPopover] = useState<DocumentSelectionPopover | undefined>();
  const noteText =
    summary.activeDocumentMode === "plain"
      ? summary.activePreviewLabel ?? "文本原样预览"
      : suggestionCount > 0
        ? `检测到 ${suggestionCount} 处建议`
        : "已载入真实正文";

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

    if (!anchorElement || !contentRef.current?.contains(anchorElement)) {
      return;
    }

    const blockId = anchorElement.closest("[data-block-id]")?.getAttribute("data-block-id") ?? undefined;
    const blockElement = anchorElement.closest("[data-block-id]");
    const contextLabel =
      blockElement?.getAttribute("data-block-kind") === "heading"
        ? blockElement.textContent?.trim() || "已选文本"
        : summary.activeClauseTitle;
    const rect = range?.getBoundingClientRect();

    if (!rect) {
      onSelectText({ text, blockId, contextLabel });
      return;
    }

    if (!event.currentTarget.contains(anchorElement)) {
      return;
    }

    setSelectionPopover({
      text,
      blockId,
      contextLabel: contextLabel?.trim() || "已选文本",
      top: rect.top + window.scrollY - 52,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  };

  return (
    <section className="document-canvas" data-testid="document-canvas">
      <div className="document-canvas__note">{noteText}</div>
      <div ref={contentRef} className="document-content" onMouseUp={handleMouseUp}>
        {summary.documentBlocks.map((block) => {
          const isActiveHeading =
            block.kind === "heading" &&
            (block.text.trim() === summary.activeClauseTitle.trim() ||
              block.id === summary.activeSelectionBlockId);
          const isActiveParagraph =
            block.kind === "paragraph" &&
            (block.text.trim() === summary.activeClauseText.trim() ||
              block.id === summary.activeSelectionBlockId);
          const activeClassName =
            isActiveHeading || isActiveParagraph ? " document-block--active" : "";
          const focusClassName =
            hasFocusedSelection && (isActiveHeading || isActiveParagraph)
              ? " document-block--focused"
              : "";

          if (block.kind === "heading") {
            return (
              <div
                key={block.id}
                className={`${getHeadingClassName(block)}${activeClassName}${focusClassName}`}
                data-block-id={block.id}
                data-block-kind="heading"
                data-active={isActiveHeading}
              >
                {block.text}
                {hasFocusedSelection && isActiveHeading ? (
                  <span className="document-block__anchor-note">已定位到当前条款</span>
                ) : null}
              </div>
            );
          }

          return (
            <p
              key={block.id}
              className={`document-block document-block--paragraph${activeClassName}${focusClassName}`}
              data-block-id={block.id}
              data-block-kind="paragraph"
              data-active={isActiveParagraph}
            >
              {block.text}
            </p>
          );
        })}
      </div>
      {selectionPopover ? (
        <div
          className="pdf-selection-popover"
          data-testid="document-selection-popover"
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
                intent: "review",
              });
              window.getSelection()?.removeAllRanges();
              setSelectionPopover(undefined);
            }}
          >
            找问题
          </button>
          <button
            className="pdf-selection-popover__action"
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
            className="pdf-selection-popover__action"
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
      {summary.suggestedRevisionText ? <RiskMarker text={summary.suggestedRevisionText} /> : null}
    </section>
  );
}
