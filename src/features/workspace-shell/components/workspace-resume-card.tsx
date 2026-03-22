import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";

type WorkspaceResumeCardProps = {
  summary: WorkspaceSummary;
};

export function WorkspaceResumeCard({ summary }: WorkspaceResumeCardProps) {
  return (
    <section className="rounded-[18px] border border-[rgba(216,207,193,0.72)] bg-[rgba(255,251,244,0.56)] px-4 py-[14px]">
      <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
        继续上次工作
      </div>
      <div className="mt-[10px] text-[1rem] leading-[1.25] font-bold text-[var(--color-text-primary)]">
        {summary.nextAction}
      </div>
      <div className="font-sans text-[0.85rem] leading-[1.5] text-[var(--color-text-muted)]">
        上次停在“{summary.activeClauseTitle}”修订，可直接继续处理。
      </div>
    </section>
  );
}
