import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { mockAssistantMessages } from "@/shared/mocks/workspace-shell";
import { AssistantContextHeader } from "@/features/assistant-panel/components/assistant-context-header";
import { SuggestedActions } from "@/features/assistant-panel/components/suggested-actions";
import { AssistantMessageList } from "@/features/assistant-panel/components/assistant-message-list";
import { ActionPanel } from "@/features/assistant-panel/components/action-panel";

type AssistantPanelProps = {
  summary: WorkspaceSummary;
};

export function AssistantPanel({ summary }: AssistantPanelProps) {
  return (
    <section className="assistant-panel" data-testid="assistant-panel">
      <AssistantContextHeader summary={summary} />
      <SuggestedActions />
      <AssistantMessageList messages={mockAssistantMessages} />
      <ActionPanel />
      <div className="context-card">
        <div className="eyebrow">跨 Agent 接续</div>
        <div className="muted">
          恢复时读取工作区摘要、当前节点、待处理建议和最近证据，不依赖原聊天线程。
        </div>
      </div>
    </section>
  );
}
