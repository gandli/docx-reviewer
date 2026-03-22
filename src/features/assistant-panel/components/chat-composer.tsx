import type { ReactNode } from "react";

type ChatComposerProps = {
  trailingAction?: ReactNode;
};

export function ChatComposer({ trailingAction }: ChatComposerProps) {
  return (
    <div className="chat-composer">
      <div className="chat-composer__toolbar">
        <div className="suggested-action">生成</div>
        <div className="suggested-action">审阅</div>
        <div className="suggested-action is-active">修订</div>
        <div className="suggested-action">优化</div>
        {trailingAction}
      </div>
      <div className="chat-composer__input">
        <div className="chat-composer__placeholder">
          继续输入你的要求，或让助手基于当前条款继续处理
        </div>
        <button className="chat-composer__send" type="button">
          发送
        </button>
      </div>
    </div>
  );
}
