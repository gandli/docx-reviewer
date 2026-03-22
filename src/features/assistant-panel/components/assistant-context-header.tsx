import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";

type AssistantContextHeaderProps = {
  summary: WorkspaceSummary;
};

export function AssistantContextHeader({ summary }: AssistantContextHeaderProps) {
  return (
    <div className="assistant-context">
      <div className="assistant-context__row">
        <div className="eyebrow">Assistant</div>
        <div className="assistant-context__summary">
          <span className="assistant-context__label">当前上下文</span>
          <span className="assistant-context__value">{summary.activeClauseTitle}</span>
        </div>
      </div>
    </div>
  );
}
