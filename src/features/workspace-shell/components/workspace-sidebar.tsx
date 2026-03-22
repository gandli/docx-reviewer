import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { mockAssetGroups } from "@/shared/mocks/workspace-shell";
import { WorkspaceResumeCard } from "@/features/workspace-shell/components/workspace-resume-card";
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

      <WorkspaceResumeCard summary={summary} />
      <WorkspaceAssetGroups groups={mockAssetGroups} />
      <WorkspaceEvidenceList evidence={summary.recentEvidenceRefs} />

      <div className="workspace-actions">
        <span>导入 · 导出 · 工作区设置</span>
      </div>
    </aside>
  );
}
