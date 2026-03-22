import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { mockAssistantMessages } from "@/shared/mocks/workspace-shell";
import { AssistantContextHeader } from "@/features/assistant-panel/components/assistant-context-header";
import { AssistantMessageList } from "@/features/assistant-panel/components/assistant-message-list";
import { ActionPanel } from "@/features/assistant-panel/components/action-panel";
import { ChatComposer } from "@/features/assistant-panel/components/chat-composer";

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
      <div className="assistant-thread">
        <AssistantMessageList
          messages={mockAssistantMessages}
          latestConclusion={summary.latestConclusion}
        />
      </div>
      <div className="assistant-footer">
        <ActionPanel
          onApplySuggestion={onApplySuggestion}
          onJumpToSelection={onJumpToSelection}
        />
        <ChatComposer />
        <div className="context-card">
          <div className="eyebrow">工作区摘要</div>
          <div className="muted">
            当前视图基于工作区摘要、当前节点、待处理建议和最近证据恢复。
          </div>
        </div>
      </div>
    </section>
  );
}
