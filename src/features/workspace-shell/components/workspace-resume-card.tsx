import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";

type WorkspaceResumeCardProps = {
  summary: WorkspaceSummary;
};

export function WorkspaceResumeCard({ summary }: WorkspaceResumeCardProps) {
  return (
    <section className="resume-card">
      <div className="eyebrow">继续上次工作</div>
      <div className="title-lg" style={{ fontSize: "1rem", marginTop: 10 }}>
        {summary.nextAction}
      </div>
      <div className="muted">
        上次停在“{summary.activeClauseTitle}”修订。可由当前 agent 或其他 agent 接续。
      </div>
    </section>
  );
}
