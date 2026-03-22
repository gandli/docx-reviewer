import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { AssistantContextHeader } from "@/features/assistant-panel/components/assistant-context-header";
import { AssistantMessageList } from "@/features/assistant-panel/components/assistant-message-list";
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
        <ChatComposer
          onSendMessage={onSendMessage}
          localModelLabel={localModelLabel}
          localModelActionLabel={localModelActionLabel}
          onLocalModelAction={onLocalModelAction}
          isBusy={isLocalModelBusy}
        />
      </div>
    </section>
  );
}
