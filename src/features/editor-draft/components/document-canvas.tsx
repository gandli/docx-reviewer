import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { InlineSelectionBlock } from "@/features/editor-draft/components/inline-selection-block";
import { RiskMarker } from "@/features/editor-draft/components/risk-marker";

const widths = ["34%", "86%", "76%", "91%", "62%", "84%", "72%", "88%"];

type DocumentCanvasProps = {
  summary: WorkspaceSummary;
};

export function DocumentCanvas({ summary }: DocumentCanvasProps) {
  return (
    <section
      className="document-canvas"
      data-testid="document-canvas"
      data-suggestion-count={`检测到 ${summary.pendingSuggestionIds.length + 1} 处建议`}
    >
      {widths.slice(0, 5).map((width, index) => (
        <div key={`${width}-${index}`} className="line" style={{ width }} />
      ))}
      <InlineSelectionBlock
        title={summary.activeClauseTitle}
        text={summary.activeClauseText}
        isFocused={summary.isSelectionFocused}
      />
      <RiskMarker text={summary.suggestedRevisionText} />
      {widths.slice(5).map((width, index) => (
        <div key={`${width}-${index + 5}`} className="line" style={{ width }} />
      ))}
    </section>
  );
}
