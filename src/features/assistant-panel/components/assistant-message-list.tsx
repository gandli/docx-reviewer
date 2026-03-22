import { useEffect, useRef } from "react";
import type { WorkspaceAssistantMessage } from "@/features/workspace-context/types/workspace-summary";

type AssistantMessageListProps = {
  messages: readonly WorkspaceAssistantMessage[];
  latestConclusion: string;
};

export function AssistantMessageList({ messages, latestConclusion }: AssistantMessageListProps) {
  const latestMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [latestConclusion, messages]);

  return (
    <div className="assistant-messages">
      <div className="assistant-card assistant-card--summary">{latestConclusion}</div>
      {messages.map((message) => (
        <div
          key={message.id}
          ref={message === messages.at(-1) ? latestMessageRef : null}
          className={`assistant-card assistant-card--${message.role}`}
        >
          {message.content}
        </div>
      ))}
    </div>
  );
}
