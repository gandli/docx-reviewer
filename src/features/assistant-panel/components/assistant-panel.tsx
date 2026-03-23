import type { WorkspaceSummary } from "@/features/workspace-context/types/workspace-summary";
import { AssistantContextHeader } from "@/features/assistant-panel/components/assistant-context-header";
import { AssistantMessageList } from "@/features/assistant-panel/components/assistant-message-list";
import { ChatComposer } from "@/features/assistant-panel/components/chat-composer";

type AssistantPanelProps = {
  summary: WorkspaceSummary;
  onApplySuggestion: () => void;
  onJumpToSelection: () => void;
  onSendMessage: (message: string) => void;
  localModelSourceLabel: string;
  localModelStatusLabel: string;
  localModelStatusTone?: "neutral" | "success" | "warning" | "error";
  localModelLabel: string;
  localModelHelperText?: string;
  localModelHelperTone?: "neutral" | "success" | "warning" | "error";
  isSendBlocked?: boolean;
  sendBlockReason?: string;
  isLocalModelBusy?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function AssistantPanel({
  summary,
  onApplySuggestion,
  onJumpToSelection,
  onSendMessage,
  localModelSourceLabel,
  localModelStatusLabel,
  localModelStatusTone = "neutral",
  localModelLabel,
  localModelHelperText,
  localModelHelperTone = "neutral",
  isSendBlocked = false,
  sendBlockReason,
  isLocalModelBusy = false,
  isCollapsed = false,
  onToggleCollapse,
}: AssistantPanelProps) {
  return (
    <section
      className={`flex h-screen min-w-0 flex-col overflow-hidden border-l border-[var(--color-border-soft)] bg-[linear-gradient(180deg,rgba(248,244,237,0.72)_0%,rgba(243,237,227,0.5)_100%)] pt-6 pb-[18px] max-[980px]:h-auto max-[980px]:border-l-0 max-[980px]:border-t ${
        isCollapsed ? "items-center px-3" : "px-[18px]"
      }`}
      data-testid="assistant-panel"
    >
      {!isCollapsed ? (
        <>
          <AssistantContextHeader summary={summary} onToggleCollapse={onToggleCollapse} />
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
              localModelSourceLabel={localModelSourceLabel}
              localModelStatusLabel={localModelStatusLabel}
              localModelStatusTone={localModelStatusTone}
              localModelLabel={localModelLabel}
              localModelHelperText={localModelHelperText}
              localModelHelperTone={localModelHelperTone}
              isSendBlocked={isSendBlocked}
              sendBlockReason={sendBlockReason}
              isBusy={isLocalModelBusy}
            />
          </div>
        </>
      ) : (
        <button
          aria-label="展开右栏"
          className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center self-start rounded-xl border border-[rgba(216,207,193,0.82)] bg-[rgba(255,251,244,0.72)] text-[var(--color-text-secondary)] shadow-[0_8px_18px_rgba(71,53,33,0.06)] transition hover:border-[rgba(181,142,83,0.35)] hover:bg-[rgba(255,251,244,0.92)]"
          type="button"
          onClick={onToggleCollapse}
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 4.5L7 10L12.5 15.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </section>
  );
}
