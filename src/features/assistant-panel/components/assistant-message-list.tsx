import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { WorkspaceAssistantMessage } from "@/features/workspace-context/types/workspace-summary";
import { normalizeAssistantMarkdown } from "@/shared/utils/assistant-message-format";

type AssistantMessageListProps = {
  messages: readonly WorkspaceAssistantMessage[];
  latestConclusion: string;
};

function MarkdownContent({ content }: { content: string }) {
  const normalized = normalizeAssistantMarkdown(content);

  return (
    <div className="assistant-markdown text-[0.9rem] leading-[1.8] text-[var(--color-text-primary)]">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h3 className="mt-0 mb-3 text-[0.95rem] font-semibold text-[var(--color-text-primary)]">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="mt-0 mb-3 text-[0.95rem] font-semibold text-[var(--color-text-primary)]">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-0 mb-3 text-[0.9rem] font-semibold text-[var(--color-text-primary)]">{children}</h4>
          ),
          p: ({ children }) => <p className="m-0 mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="m-0 grid gap-2 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="m-0 grid gap-2 pl-5">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-[var(--color-text-primary)]">{children}</strong>,
          code: ({ children }) => (
            <code className="rounded bg-[rgba(71,53,33,0.06)] px-1.5 py-0.5 text-[0.84em]">{children}</code>
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}

function ReviewResultCard({ content }: { content: string }) {
  return (
    <div className="max-w-[92%] justify-self-start rounded-[20px] border border-[rgba(196,165,116,0.42)] bg-[rgba(255,250,242,0.9)] px-4 py-4 shadow-[0_12px_28px_rgba(110,84,47,0.08)]">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[rgba(216,207,193,0.6)] pb-3">
        <div>
          <div className="text-[0.92rem] font-semibold text-[var(--color-text-primary)]">校阅发现</div>
          <div className="mt-1 text-[0.76rem] text-[var(--color-text-muted)]">按问题逐项展开，便于核对和修改</div>
        </div>
      </div>
      <MarkdownContent content={content} />
    </div>
  );
}

function RewriteResultCard({ content }: { content: string }) {
  return (
    <div className="max-w-[92%] justify-self-start rounded-[20px] border border-[rgba(161,145,114,0.4)] bg-[rgba(250,247,240,0.9)] px-4 py-4 shadow-[0_12px_28px_rgba(93,79,54,0.07)]">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[rgba(216,207,193,0.6)] pb-3">
        <div>
          <div className="text-[0.92rem] font-semibold text-[var(--color-text-primary)]">改写结果</div>
          <div className="mt-1 text-[0.76rem] text-[var(--color-text-muted)]">已按正式文件口径整理，可直接采用</div>
        </div>
        <div className="rounded-full bg-[rgba(174,156,122,0.16)] px-[10px] py-[4px] text-[0.72rem] font-semibold text-[var(--color-text-secondary)]">
          可直接采用
        </div>
      </div>
      <MarkdownContent content={content} />
    </div>
  );
}

function PolishResultCard({ content }: { content: string }) {
  return (
    <div className="max-w-[92%] justify-self-start rounded-[20px] border border-[rgba(177,161,128,0.36)] bg-[rgba(252,249,244,0.92)] px-4 py-4 shadow-[0_12px_28px_rgba(98,81,52,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[rgba(216,207,193,0.6)] pb-3">
        <div>
          <div className="text-[0.92rem] font-semibold text-[var(--color-text-primary)]">润色结果</div>
          <div className="mt-1 text-[0.76rem] text-[var(--color-text-muted)]">保留原意，只优化表达和书面感</div>
        </div>
        <div className="rounded-full bg-[rgba(185,171,141,0.16)] px-[10px] py-[4px] text-[0.72rem] font-semibold text-[var(--color-text-secondary)]">
          保留原意
        </div>
      </div>
      <MarkdownContent content={content} />
    </div>
  );
}

function AssistantMessageCard({ message }: { message: WorkspaceAssistantMessage }) {
  if (message.role === "assistant") {
    if (message.variant === "review") {
      return <ReviewResultCard content={message.content} />;
    }

    if (message.variant === "revise") {
      return <RewriteResultCard content={message.content} />;
    }

    if (message.variant === "polish") {
      return <PolishResultCard content={message.content} />;
    }
  }

  return (
    <div
      className={`max-w-[92%] rounded-[18px] border px-[14px] py-3 leading-[1.6] ${
        message.role === "user"
          ? "justify-self-end border-[rgba(210,194,171,0.7)] bg-[rgba(241,233,222,0.78)]"
          : "justify-self-start border-[rgba(216,207,193,0.52)] bg-[rgba(255,251,244,0.46)]"
      }`}
    >
      {message.role === "assistant" ? <MarkdownContent content={message.content} /> : message.content}
    </div>
  );
}

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
        <MarkdownContent content={latestConclusion} />
      </div>
      {messages.map((message) => (
        <div key={message.id} ref={message === messages.at(-1) ? latestMessageRef : null}>
          <AssistantMessageCard message={message} />
        </div>
      ))}
    </div>
  );
}
