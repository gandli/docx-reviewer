import { InlineSelectionBlock } from "@/features/editor-draft/components/inline-selection-block";
import { RiskMarker } from "@/features/editor-draft/components/risk-marker";

const widths = ["34%", "86%", "76%", "91%", "62%", "84%", "72%", "88%"];

export function DocumentCanvas() {
  return (
    <section
      className="document-canvas"
      data-testid="document-canvas"
      data-suggestion-count="检测到 3 处建议"
    >
      {widths.slice(0, 5).map((width, index) => (
        <div key={`${width}-${index}`} className="line" style={{ width }} />
      ))}
      <InlineSelectionBlock />
      <RiskMarker />
      {widths.slice(5).map((width, index) => (
        <div key={`${width}-${index + 5}`} className="line" style={{ width }} />
      ))}
    </section>
  );
}
