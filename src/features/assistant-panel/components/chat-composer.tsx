import { useState, type FormEvent, type ReactNode } from "react";

type ChatComposerProps = {
  trailingAction?: ReactNode;
  onSendMessage: (message: string) => void;
  localModelLabel: string;
  localModelActionLabel?: string;
  onLocalModelAction?: () => void;
  isBusy?: boolean;
};

export function ChatComposer({
  trailingAction,
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
    <form className="chat-composer" onSubmit={handleSubmit}>
      <div className="chat-composer__status">
        <span>{localModelLabel}</span>
        {localModelActionLabel && onLocalModelAction ? (
          <button
            className="chat-composer__status-action"
            type="button"
            onClick={onLocalModelAction}
          >
            {localModelActionLabel}
          </button>
        ) : null}
      </div>
      <div className="chat-composer__toolbar">
        <div className="suggested-action">起草内容</div>
        <div className="suggested-action">找问题</div>
        <div className="suggested-action is-active">直接改写</div>
        <div className="suggested-action">润色表达</div>
        {trailingAction}
      </div>
      <div className="chat-composer__input">
        <input
          className="chat-composer__field"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={isBusy}
          placeholder="继续输入你的要求，或让助手基于当前条款继续处理"
        />
        <button className="chat-composer__send" type="submit" disabled={isBusy}>
          发送
        </button>
      </div>
    </form>
  );
}
