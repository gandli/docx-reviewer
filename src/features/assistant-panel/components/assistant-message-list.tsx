import { useEffect, useRef } from "react";
import type { WorkspaceAssistantMessage } from "@/features/workspace-context/types/workspace-summary";

type AssistantMessageListProps = {
  messages: readonly WorkspaceAssistantMessage[];
  latestConclusion: string;
};

type ReviewIssue = {
  originalText: string;
  problemType: string;
  category: string;
  explanation: string;
  suggestion: string;
};

const REVIEW_FIELDS = [
  { key: "originalText", label: "原文" },
  { key: "problemType", label: "问题类型" },
  { key: "category", label: "问题归类" },
  { key: "explanation", label: "问题说明" },
  { key: "suggestion", label: "修改建议" },
] as const;

function extractReviewField(
  block: string,
  label: (typeof REVIEW_FIELDS)[number]["label"],
  nextLabels: readonly string[],
) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nextPattern = nextLabels.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const matcher = new RegExp(
    `${escapedLabel}[：:]\\s*([\\s\\S]*?)(?=(?:${nextPattern})[：:]|$)`,
    "m",
  );
  return block.match(matcher)?.[1]?.trim() ?? "";
}

function parseReviewIssues(content: string) {
  const normalized = content.replace(/\r/g, "").trim();

  if (!normalized.includes("原文：") && !normalized.includes("原文:")) {
    return [];
  }

  return normalized
    .split(/(?=原文[：:])/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map<ReviewIssue>((block) => {
      const labels = REVIEW_FIELDS.map((field) => field.label);

      return {
        originalText: extractReviewField(block, "原文", labels.filter((item) => item !== "原文")),
        problemType: extractReviewField(
          block,
          "问题类型",
          labels.filter((item) => item !== "问题类型"),
        ),
        category: extractReviewField(
          block,
          "问题归类",
          labels.filter((item) => item !== "问题归类"),
        ),
        explanation: extractReviewField(
          block,
          "问题说明",
          labels.filter((item) => item !== "问题说明"),
        ),
        suggestion: extractReviewField(
          block,
          "修改建议",
          labels.filter((item) => item !== "修改建议"),
        ),
      };
    })
    .filter((issue) => issue.originalText || issue.problemType || issue.category || issue.explanation || issue.suggestion);
}

function ReviewResultCard({ content }: { content: string }) {
  const issues = parseReviewIssues(content);

  if (!issues.length) {
    return (
      <div className="max-w-[92%] justify-self-start rounded-[18px] border border-[rgba(216,207,193,0.52)] bg-[rgba(255,251,244,0.46)] px-[14px] py-3 leading-[1.7]">
        {content}
      </div>
    );
  }

  return (
    <div className="max-w-[92%] justify-self-start rounded-[20px] border border-[rgba(196,165,116,0.42)] bg-[rgba(255,250,242,0.9)] px-4 py-4 shadow-[0_12px_28px_rgba(110,84,47,0.08)]">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[rgba(216,207,193,0.6)] pb-3">
        <div>
          <div className="text-[0.92rem] font-semibold text-[var(--color-text-primary)]">校阅发现</div>
          <div className="mt-1 text-[0.76rem] text-[var(--color-text-muted)]">按问题逐项标注，便于直接核对和修改</div>
        </div>
        <div className="rounded-full bg-[rgba(199,171,125,0.18)] px-[10px] py-[4px] text-[0.72rem] font-semibold text-[var(--color-text-secondary)]">
          {issues.length} 项
        </div>
      </div>
      <div className="grid gap-3">
        {issues.map((issue, index) => (
          <div
            key={`${issue.originalText}-${index}`}
            className="rounded-[16px] border border-[rgba(216,207,193,0.78)] bg-[rgba(255,255,255,0.86)] px-3 py-3"
          >
            <div className="mb-3 text-[0.74rem] font-semibold tracking-[0.06em] text-[var(--color-text-muted)] uppercase">
              问题 {index + 1}
            </div>
            <div className="grid gap-2 text-[0.86rem] leading-[1.7] text-[var(--color-text-secondary)]">
              <ResultField label="原文" value={issue.originalText} />
              <ResultField label="问题类型" value={issue.problemType} />
              <ResultField label="问题归类" value={issue.category} />
              <ResultField label="问题说明" value={issue.explanation} />
              <ResultField label="修改建议" value={issue.suggestion} />
            </div>
          </div>
        ))}
      </div>
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
      <div className="rounded-[16px] border border-[rgba(216,207,193,0.72)] bg-white px-4 py-4 text-[0.9rem] leading-[1.8] text-[var(--color-text-primary)]">
        {content}
      </div>
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
      <div className="rounded-[16px] border border-[rgba(216,207,193,0.72)] bg-white px-4 py-4 text-[0.9rem] leading-[1.8] text-[var(--color-text-primary)]">
        {content}
      </div>
    </div>
  );
}

function ResultField({ label, value }: { label: string; value: string }) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-1">
      <div className="text-[0.74rem] font-semibold text-[var(--color-text-muted)]">{label}</div>
      <div className="text-[0.88rem] text-[var(--color-text-secondary)]">{value}</div>
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
      {message.content}
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
        {latestConclusion}
      </div>
      {messages.map((message) => (
        <div key={message.id} ref={message === messages.at(-1) ? latestMessageRef : null}>
          <AssistantMessageCard message={message} />
        </div>
      ))}
    </div>
  );
}
