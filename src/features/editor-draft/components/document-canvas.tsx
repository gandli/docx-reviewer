import type {
  WorkspaceDocumentBlock,
  WorkspaceSummary,
} from "@/features/workspace-context/types/workspace-summary";
import { RiskMarker } from "@/features/editor-draft/components/risk-marker";

type DocumentCanvasProps = {
  summary: WorkspaceSummary;
};

function getHeadingClassName(block: WorkspaceDocumentBlock) {
  const level = block.level ?? 2;
  return `document-block document-block--heading document-block--heading-${level}`;
}

export function DocumentCanvas({ summary }: DocumentCanvasProps) {
  const suggestionCount = summary.pendingSuggestionIds.length + (summary.suggestedRevisionText ? 1 : 0);
  const hasFocusedSelection = summary.isSelectionFocused;

  return (
    <section className="document-canvas" data-testid="document-canvas">
      <div className="document-canvas__note">
        {suggestionCount > 0 ? `检测到 ${suggestionCount} 处建议` : "已载入真实正文"}
      </div>
      <div className="document-content">
        {summary.documentBlocks.map((block) => {
          const isActiveHeading =
            block.kind === "heading" && block.text.trim() === summary.activeClauseTitle.trim();
          const isActiveParagraph =
            block.kind === "paragraph" && block.text.trim() === summary.activeClauseText.trim();
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
              data-active={isActiveParagraph}
            >
              {block.text}
            </p>
          );
        })}
      </div>
      {summary.suggestedRevisionText ? <RiskMarker text={summary.suggestedRevisionText} /> : null}
    </section>
  );
}
