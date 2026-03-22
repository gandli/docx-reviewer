import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";

type AssistantContextHeaderProps = {
  summary: WorkspaceSummary;
};

export function AssistantContextHeader({ summary }: AssistantContextHeaderProps) {
  return (
    <div className="assistant-context">
      <div className="eyebrow">Assistant</div>
      <div className="title-lg" style={{ fontSize: "1.05rem", marginTop: 10 }}>
        当前上下文：{summary.activeClauseTitle}
      </div>
      <div className="muted">已继承工作区摘要，最近接续自 {summary.lastAgent}</div>
    </div>
  );
}
