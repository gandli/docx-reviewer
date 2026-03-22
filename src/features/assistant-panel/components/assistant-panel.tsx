import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { mockAssistantMessages } from "@/shared/mocks/workspace-shell";
import { AssistantContextHeader } from "@/features/assistant-panel/components/assistant-context-header";
import { SuggestedActions } from "@/features/assistant-panel/components/suggested-actions";
import { AssistantMessageList } from "@/features/assistant-panel/components/assistant-message-list";
import { ActionPanel } from "@/features/assistant-panel/components/action-panel";

type AssistantPanelProps = {
  summary: WorkspaceSummary;
  onApplySuggestion: () => void;
  onJumpToSelection: () => void;
};

export function AssistantPanel({
  summary,
  onApplySuggestion,
  onJumpToSelection,
}: AssistantPanelProps) {
  return (
    <section className="assistant-panel" data-testid="assistant-panel">
      <AssistantContextHeader summary={summary} />
      <SuggestedActions />
      <AssistantMessageList
        messages={mockAssistantMessages}
        latestConclusion={summary.latestConclusion}
      />
      <ActionPanel
        onApplySuggestion={onApplySuggestion}
        onJumpToSelection={onJumpToSelection}
      />
      <div className="context-card">
        <div className="eyebrow">工作区摘要</div>
        <div className="muted">
          当前视图基于工作区摘要、当前节点、待处理建议和最近证据恢复。
        </div>
      </div>
    </section>
  );
}
