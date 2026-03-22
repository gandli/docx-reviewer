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
    <aside className="workspace-sidebar" data-testid="workspace-sidebar">
      <div>
        <div className="eyebrow">Workspace</div>
        <div className="title-lg">{summary.workspaceTitle}</div>
        <div className="muted">最近更新：{summary.updatedAt}</div>
      </div>

      <WorkspaceAssetGroups groups={groups} />
      <WorkspaceEvidenceList evidence={summary.recentEvidenceRefs} />

      <div className="workspace-actions">
        <input
          ref={fileInputRef}
          className="workspace-actions__input"
          data-testid="workspace-import-input"
          type="file"
          accept=".txt,.md,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
          className="workspace-actions__item"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          导入
        </button>
        <span className="workspace-actions__divider" aria-hidden="true">
          ·
        </span>
        <button className="workspace-actions__item" type="button">
          导出
        </button>
        <span className="workspace-actions__divider" aria-hidden="true">
          ·
        </span>
        <button className="workspace-actions__item" type="button">
          工作区设置
        </button>
      </div>
    </aside>
  );
}
