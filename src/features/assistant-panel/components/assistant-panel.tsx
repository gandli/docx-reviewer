import { useState } from "react";
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
  const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);

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
        <div className="assistant-floating-tools">
          {isActionPanelOpen ? (
            <ActionPanel
              summaryLabel={summary.activeClauseTitle}
              onApplySuggestion={onApplySuggestion}
              onJumpToSelection={onJumpToSelection}
              onClose={() => setIsActionPanelOpen(false)}
            />
          ) : null}
        </div>
        <ChatComposer
          trailingAction={
            <button
              className="assistant-tools-trigger"
              type="button"
              onClick={() => setIsActionPanelOpen((current) => !current)}
            >
              更多操作
            </button>
          }
        />
      </div>
    </section>
  );
}
