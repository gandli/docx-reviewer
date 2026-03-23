import { useState, type FormEvent } from "react";

type ChatComposerProps = {
  onSendMessage: (message: string) => void;
  localModelLabel: string;
  isBusy?: boolean;
};

export function ChatComposer({
  onSendMessage,
  localModelLabel,
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

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 font-sans text-[0.76rem] text-[var(--color-text-muted)]">
        <span>{localModelLabel}</span>
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
