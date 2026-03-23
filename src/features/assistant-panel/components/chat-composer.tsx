import { useState, type FormEvent } from "react";

type ModelStatusTone = "neutral" | "success" | "warning" | "error";

type ChatComposerProps = {
  onSendMessage: (message: string) => void;
  localModelSourceLabel: string;
  localModelStatusLabel: string;
  localModelStatusTone?: ModelStatusTone;
  localModelLabel: string;
  localModelHelperText?: string;
  localModelHelperTone?: ModelStatusTone;
  isBusy?: boolean;
};

export function ChatComposer({
  onSendMessage,
  localModelSourceLabel,
  localModelStatusLabel,
  localModelStatusTone = "neutral",
  localModelLabel,
  localModelHelperText,
  localModelHelperTone = "neutral",
  isBusy = false,
}: ChatComposerProps) {
  const [draft, setDraft] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }

    onSendMessage(draft);
    setDraft("");
  };

  const statusToneClassName =
    localModelStatusTone === "success"
      ? "border-[rgba(100,147,112,0.28)] bg-[rgba(231,243,233,0.9)] text-[rgba(53,92,62,0.96)]"
      : localModelStatusTone === "warning"
        ? "border-[rgba(181,142,83,0.3)] bg-[rgba(250,242,225,0.92)] text-[rgba(118,87,40,0.96)]"
        : localModelStatusTone === "error"
          ? "border-[rgba(185,97,97,0.26)] bg-[rgba(251,236,236,0.92)] text-[rgba(131,56,56,0.96)]"
          : "border-[rgba(216,207,193,0.82)] bg-[rgba(255,251,244,0.82)] text-[var(--color-text-muted)]";
  const helperToneClassName =
    localModelHelperTone === "success"
      ? "text-[rgba(53,92,62,0.96)]"
      : localModelHelperTone === "warning"
        ? "text-[rgba(118,87,40,0.96)]"
        : localModelHelperTone === "error"
          ? "text-[rgba(131,56,56,0.96)]"
          : "text-[var(--color-text-muted)]";

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      <div className="grid gap-1 font-sans text-[0.76rem] text-[var(--color-text-muted)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{localModelSourceLabel}</span>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-[3px] text-[0.72rem] font-semibold ${statusToneClassName}`}
          >
            {localModelStatusLabel}
          </span>
          <span>{localModelLabel}</span>
        </div>
        {localModelHelperText ? (
          <div className={`text-[0.72rem] ${helperToneClassName}`}>{localModelHelperText}</div>
        ) : null}
      </div>
      <div className="flex items-center gap-[10px] rounded-[18px] border border-[rgba(216,207,193,0.88)] bg-[rgba(255,252,247,0.9)] px-3 py-3 pl-[14px]">
        <input
          className="flex-1 border-0 bg-transparent p-0 font-sans text-[0.88rem] leading-[1.4] text-[var(--color-text-muted)] outline-none placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-70"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={isBusy}
          placeholder="输入你的要求，或继续处理当前内容"
        />
        <button
          className="rounded-full border-0 bg-[rgba(47,38,29,0.92)] px-[13px] py-[9px] font-sans text-[0.8rem] font-semibold text-[#fffdf9] disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isBusy}
        >
          发送
        </button>
      </div>
    </form>
  );
}
