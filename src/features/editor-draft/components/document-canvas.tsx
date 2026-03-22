import type {
  WorkspaceDocumentBlock,
  WorkspaceSummary,
} from "@/features/workspace-context/types/workspace-summary";
import { InlineSelectionBlock } from "@/features/editor-draft/components/inline-selection-block";
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

  return (
    <section className="document-canvas" data-testid="document-canvas">
      <div className="document-canvas__note">
        {suggestionCount > 0 ? `检测到 ${suggestionCount} 处建议` : "已载入真实正文"}
      </div>
      <div className="document-content">
        {summary.documentBlocks.map((block) =>
          block.kind === "heading" ? (
            <div key={block.id} className={getHeadingClassName(block)}>
              {block.text}
            </div>
          ) : (
            <p key={block.id} className="document-block document-block--paragraph">
              {block.text}
            </p>
          ),
        )}
      </div>
      <InlineSelectionBlock
        title={summary.activeClauseTitle}
        text={summary.activeClauseText}
        isFocused={summary.isSelectionFocused}
      />
      {summary.suggestedRevisionText ? <RiskMarker text={summary.suggestedRevisionText} /> : null}
    </section>
  );
}
