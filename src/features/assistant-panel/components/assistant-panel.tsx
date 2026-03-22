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
    <section
      className="flex h-screen min-w-0 flex-col overflow-hidden border-l border-[var(--color-border-soft)] bg-[linear-gradient(180deg,rgba(248,244,237,0.72)_0%,rgba(243,237,227,0.5)_100%)] px-[18px] pt-6 pb-[18px] max-[980px]:h-auto max-[980px]:border-l-0 max-[980px]:border-t"
      data-testid="assistant-panel"
    >
      <AssistantContextHeader summary={summary} />
      <div
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-4 pb-3"
        data-scroll-region="true"
      >
        <AssistantMessageList
          messages={summary.assistantMessages}
          latestConclusion={summary.latestConclusion}
        />
      </div>
      <div className="grid gap-[10px] border-t border-[rgba(216,207,193,0.78)] pt-[14px]">
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
