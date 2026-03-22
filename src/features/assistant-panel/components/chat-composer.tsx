import { useState, type FormEvent } from "react";

type ChatComposerProps = {
  onSendMessage: (message: string) => void;
  localModelLabel: string;
  localModelActionLabel?: string;
  onLocalModelAction?: () => void;
  isBusy?: boolean;
};

export function ChatComposer({
  onSendMessage,
  localModelLabel,
  localModelActionLabel,
  onLocalModelAction,
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
      <div className="flex items-center justify-between gap-3 font-sans text-[0.76rem] text-[var(--color-text-muted)]">
        <span>{localModelLabel}</span>
        {localModelActionLabel && onLocalModelAction ? (
          <button
            aria-label={localModelActionLabel}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[rgba(216,207,193,0.78)] bg-[rgba(255,251,244,0.78)] text-[var(--color-text-secondary)] transition hover:border-[rgba(181,142,83,0.42)] hover:bg-[rgba(255,251,244,0.96)]"
            type="button"
            onClick={onLocalModelAction}
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 3.25a1.2 1.2 0 0 1 1.18.97l.15.77a5.2 5.2 0 0 1 1.08.45l.66-.43a1.2 1.2 0 0 1 1.51.14l.28.28a1.2 1.2 0 0 1 .14 1.5l-.43.67c.2.35.35.72.46 1.1l.76.14A1.2 1.2 0 0 1 17 10a1.2 1.2 0 0 1-.97 1.18l-.77.15a5.2 5.2 0 0 1-.45 1.08l.43.66a1.2 1.2 0 0 1-.14 1.51l-.28.28a1.2 1.2 0 0 1-1.5.14l-.67-.43c-.35.2-.72.35-1.1.46l-.14.76A1.2 1.2 0 0 1 10 17a1.2 1.2 0 0 1-1.18-.97l-.15-.77a5.2 5.2 0 0 1-1.08-.45l-.66.43a1.2 1.2 0 0 1-1.51-.14l-.28-.28a1.2 1.2 0 0 1-.14-1.5l.43-.67a5.2 5.2 0 0 1-.46-1.1l-.76-.14A1.2 1.2 0 0 1 3 10c0-.58.42-1.08.97-1.18l.77-.15c.1-.37.25-.73.45-1.08l-.43-.66a1.2 1.2 0 0 1 .14-1.51l.28-.28a1.2 1.2 0 0 1 1.5-.14l.67.43c.35-.2.72-.35 1.1-.46l.14-.76A1.2 1.2 0 0 1 10 3.25Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-[10px] rounded-[18px] border border-[rgba(216,207,193,0.88)] bg-[rgba(255,252,247,0.9)] px-3 py-3 pl-[14px]">
        <input
          className="flex-1 border-0 bg-transparent p-0 font-sans text-[0.88rem] leading-[1.4] text-[var(--color-text-muted)] outline-none placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-70"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={isBusy}
          placeholder="继续输入你的要求，或让助手基于当前条款继续处理"
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
