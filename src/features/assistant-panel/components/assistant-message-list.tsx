import type { WorkspaceAssistantMessage } from "@/features/workspace-context/types/workspace-summary";

type AssistantMessageListProps = {
  messages: readonly WorkspaceAssistantMessage[];
  latestConclusion: string;
};

export function AssistantMessageList({ messages, latestConclusion }: AssistantMessageListProps) {
  return (
    <div className="assistant-messages">
      <div className="assistant-card assistant-card--summary">{latestConclusion}</div>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`assistant-card assistant-card--${message.role}`}
        >
          {message.content}
        </div>
      ))}
    </div>
  );
}
