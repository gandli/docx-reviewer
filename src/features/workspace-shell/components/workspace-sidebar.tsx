import { useRef } from "react";
import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { mockAssetGroups } from "@/shared/mocks/workspace-shell";
import { WorkspaceAssetGroups } from "@/features/workspace-shell/components/workspace-asset-groups";
import { WorkspaceEvidenceList } from "@/features/workspace-shell/components/workspace-evidence-list";

type WorkspaceSidebarProps = {
  summary: WorkspaceSummary;
  onImportDocument: (file: File) => void | Promise<void>;
};

export function WorkspaceSidebar({ summary, onImportDocument }: WorkspaceSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const groups = [
    {
      ...mockAssetGroups[0],
      items: [
        {
          id: summary.activeDocumentId,
          label: summary.activeDocumentTitle,
          kind: "文档",
          updatedAt: summary.updatedAt === "刚刚" ? "刚刚更新" : summary.updatedAt,
          selected: true,
        },
      ],
    },
    ...mockAssetGroups.slice(1),
  ];

  return (
    <aside
      className="flex h-screen min-w-0 flex-col gap-5 overflow-x-hidden overflow-y-auto border-r border-[var(--color-border-soft)] bg-[linear-gradient(180deg,rgba(239,231,218,0.82)_0%,rgba(232,222,206,0.58)_100%)] px-[18px] pt-6 pb-[18px] max-[980px]:h-auto max-[980px]:border-r-0 max-[980px]:border-b"
      data-testid="workspace-sidebar"
      data-scroll-region="true"
    >
      <div>
        <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
          Workspace
        </div>
        <div className="mt-2 mb-1 text-[1.15rem] leading-[1.25] font-bold text-[var(--color-text-primary)]">
          {summary.workspaceTitle}
        </div>
        <div className="font-sans text-[0.85rem] leading-[1.5] text-[var(--color-text-muted)]">
          最近更新：{summary.updatedAt}
        </div>
      </div>

      <WorkspaceAssetGroups groups={groups} />
      <WorkspaceEvidenceList evidence={summary.recentEvidenceRefs} />

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[rgba(216,207,193,0.82)] pt-4">
        <input
          ref={fileInputRef}
          className="hidden"
          data-testid="workspace-import-input"
          type="file"
          accept=".txt,.md,.docx,.pdf,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => {
            const [file] = Array.from(event.target.files ?? []);
            if (!file) {
              return;
            }

            void onImportDocument(file);
            event.currentTarget.value = "";
          }}
        />
        <button
          className="cursor-pointer border-0 bg-transparent p-0 font-sans text-[0.84rem] text-[var(--color-text-muted)]"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          导入
        </button>
        <span className="font-sans text-[var(--color-text-muted)]/50" aria-hidden="true">
          ·
        </span>
        <button className="cursor-pointer border-0 bg-transparent p-0 font-sans text-[0.84rem] text-[var(--color-text-muted)]" type="button">
          导出
        </button>
        <span className="font-sans text-[var(--color-text-muted)]/50" aria-hidden="true">
          ·
        </span>
        <button className="cursor-pointer border-0 bg-transparent p-0 font-sans text-[0.84rem] text-[var(--color-text-muted)]" type="button">
          工作区设置
        </button>
      </div>
    </aside>
  );
}
