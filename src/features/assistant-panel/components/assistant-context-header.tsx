import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";

type AssistantContextHeaderProps = {
  summary: WorkspaceSummary;
};

export function AssistantContextHeader({ summary }: AssistantContextHeaderProps) {
  return (
    <div className="border-b border-[rgba(216,207,193,0.78)] pb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
          Assistant
        </div>
        <div className="inline-flex min-w-0 items-center gap-2 font-sans text-[0.8rem] text-[var(--color-text-secondary)]">
          <span className="text-[var(--color-text-muted)]">当前上下文</span>
          <span className="truncate font-semibold text-[var(--color-text-primary)]">
            {summary.activeClauseTitle}
          </span>
        </div>
      </div>
    </div>
  );
}
