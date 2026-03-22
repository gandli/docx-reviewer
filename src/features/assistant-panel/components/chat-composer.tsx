import { useState, type FormEvent, type ReactNode } from "react";

type ChatComposerProps = {
  trailingAction?: ReactNode;
  onSendMessage: (message: string) => void;
};

export function ChatComposer({ trailingAction, onSendMessage }: ChatComposerProps) {
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
          placeholder="继续输入你的要求，或让助手基于当前条款继续处理"
        />
        <button className="chat-composer__send" type="submit">
          发送
        </button>
      </div>
    </form>
  );
}
