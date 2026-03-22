import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";

type AssistantContextHeaderProps = {
  summary: WorkspaceSummary;
  onToggleCollapse?: () => void;
};

export function AssistantContextHeader({
  summary,
  onToggleCollapse,
}: AssistantContextHeaderProps) {
  return (
    <div className="border-b border-[rgba(216,207,193,0.78)] pb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
            Assistant
          </div>
        </div>
        <div className="inline-flex min-w-0 items-center gap-3">
          <div className="inline-flex min-w-0 items-center gap-2 font-sans text-[0.8rem] text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-text-muted)]">当前上下文</span>
            <span className="truncate font-semibold text-[var(--color-text-primary)]">
              {summary.activeClauseTitle}
            </span>
          </div>
          <button
            aria-label="收起右栏"
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[rgba(216,207,193,0.7)] bg-[rgba(255,251,244,0.52)] text-[var(--color-text-secondary)] transition hover:border-[rgba(181,142,83,0.35)] hover:bg-[rgba(255,251,244,0.88)]"
            type="button"
            onClick={onToggleCollapse}
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4 rotate-180"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 4.5L7 10L12.5 15.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
