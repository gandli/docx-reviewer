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
    <div className="grid gap-[10px]">
      <div className="max-w-[88%] justify-self-start border-b border-[rgba(216,207,193,0.6)] bg-transparent px-0 pt-2 pb-[10px] text-[var(--color-text-muted)]">
        {latestConclusion}
      </div>
      {messages.map((message) => (
        <div
          key={message.id}
          ref={message === messages.at(-1) ? latestMessageRef : null}
          className={`max-w-[92%] rounded-[18px] border px-[14px] py-3 leading-[1.6] ${
            message.role === "user"
              ? "justify-self-end border-[rgba(210,194,171,0.7)] bg-[rgba(241,233,222,0.78)]"
              : "justify-self-start border-[rgba(216,207,193,0.52)] bg-[rgba(255,251,244,0.46)]"
          }`}
        >
          {message.content}
        </div>
      ))}
    </div>
  );
}
