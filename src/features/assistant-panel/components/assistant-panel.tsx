import { useState } from "react";
import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { AssistantContextHeader } from "@/features/assistant-panel/components/assistant-context-header";
import { AssistantMessageList } from "@/features/assistant-panel/components/assistant-message-list";
import { ActionPanel } from "@/features/assistant-panel/components/action-panel";
import { ChatComposer } from "@/features/assistant-panel/components/chat-composer";

type AssistantPanelProps = {
  summary: WorkspaceSummary;
  onApplySuggestion: () => void;
  onJumpToSelection: () => void;
  onSendMessage: (message: string) => void;
  localModelLabel: string;
  localModelActionLabel?: string;
  onLocalModelAction?: () => void;
  isLocalModelBusy?: boolean;
};

export function AssistantPanel({
  summary,
  onApplySuggestion,
  onJumpToSelection,
  onSendMessage,
  localModelLabel,
  localModelActionLabel,
  onLocalModelAction,
  isLocalModelBusy = false,
}: AssistantPanelProps) {
  const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);

  return (
    <section className="assistant-panel" data-testid="assistant-panel">
      <AssistantContextHeader summary={summary} />
      <div className="assistant-thread">
        <AssistantMessageList
          messages={summary.assistantMessages}
          latestConclusion={summary.latestConclusion}
        />
      </div>
      <div className="assistant-footer">
        <div className="assistant-floating-tools">
          {isActionPanelOpen ? (
            <ActionPanel
              documentMode={summary.activeDocumentMode}
              hasSuggestion={Boolean(summary.suggestedRevisionText)}
              summaryLabel={summary.activeClauseTitle}
              onApplySuggestion={onApplySuggestion}
              onJumpToSelection={onJumpToSelection}
              onClose={() => setIsActionPanelOpen(false)}
            />
          ) : null}
        </div>
        <ChatComposer
          onSendMessage={onSendMessage}
          localModelLabel={localModelLabel}
          localModelActionLabel={localModelActionLabel}
          onLocalModelAction={onLocalModelAction}
          isBusy={isLocalModelBusy}
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
