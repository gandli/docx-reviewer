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
  const baseClass = "m-0 text-[var(--color-text-primary)] font-bold leading-[1.35]";

  if (level === 1) {
    return `${baseClass} mt-[2px] text-[1.5rem]`;
  }

  if (level === 3) {
    return `${baseClass} mt-[6px] text-[0.98rem]`;
  }

  return `${baseClass} mt-2 text-[1.08rem]`;
}

const popoverClassName =
  "fixed z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-[14px] border border-[rgba(216,207,193,0.92)] bg-[rgba(255,251,244,0.96)] px-[10px] py-2 shadow-[0_18px_36px_rgba(71,53,33,0.14)]";
const popoverActionClassName =
  "cursor-pointer border-0 bg-transparent p-0 font-sans text-[0.82rem] font-semibold text-[var(--color-text-primary)]";
const popoverDismissClassName =
  "cursor-pointer border-0 bg-transparent p-0 font-sans text-[0.82rem] text-[var(--color-text-muted)]";

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
    <section
      className="relative min-w-0 rounded-[22px] border border-[#dfd6c8] bg-white px-10 py-9 shadow-[0_24px_54px_rgba(71,53,33,0.1)]"
      data-testid="document-canvas"
    >
      <div className="mb-5 text-right font-sans text-[0.75rem] font-bold tracking-[0.02em] text-[rgba(138,106,55,0.88)]">
        {noteText}
      </div>
      <div
        ref={contentRef}
        className="mb-[22px] grid gap-[14px] px-5"
        onMouseUp={handleMouseUp}
      >
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
            isActiveHeading || isActiveParagraph
              ? " -mx-3 rounded-[14px] bg-[rgba(251,246,233,0.9)] px-3 py-[10px]"
              : "";
          const focusClassName =
            hasFocusedSelection && (isActiveHeading || isActiveParagraph)
              ? " shadow-[0_0_0_3px_rgba(181,142,83,0.14)]"
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
                  <span className="ml-[10px] inline-block align-middle font-sans text-[0.72rem] font-semibold text-[rgba(138,106,55,0.92)]">
                    已定位到当前条款
                  </span>
                ) : null}
              </div>
            );
          }

          return (
            <p
              key={block.id}
              className={`m-0 text-[0.98rem] leading-[1.85] text-[var(--color-text-secondary)] text-justify${activeClassName}${focusClassName}`}
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
          className={popoverClassName}
          data-testid="document-selection-popover"
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
      {summary.suggestedRevisionText ? <RiskMarker text={summary.suggestedRevisionText} /> : null}
    </section>
  );
}
