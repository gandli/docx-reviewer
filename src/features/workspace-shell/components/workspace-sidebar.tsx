import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { mockAssetGroups } from "@/shared/mocks/workspace-shell";
import { WorkspaceAssetGroups } from "@/features/workspace-shell/components/workspace-asset-groups";
import { WorkspaceEvidenceList } from "@/features/workspace-shell/components/workspace-evidence-list";

type WorkspaceSidebarProps = {
  summary: WorkspaceSummary;
};

export function WorkspaceSidebar({ summary }: WorkspaceSidebarProps) {
  return (
    <aside className="workspace-sidebar" data-testid="workspace-sidebar">
      <div>
        <div className="eyebrow">Workspace</div>
        <div className="title-lg">{summary.workspaceTitle}</div>
        <div className="muted">最近更新：{summary.updatedAt}</div>
      </div>

      <WorkspaceAssetGroups groups={mockAssetGroups} />
      <WorkspaceEvidenceList evidence={summary.recentEvidenceRefs} />

      <div className="workspace-actions">
        <button className="workspace-actions__item" type="button">
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
