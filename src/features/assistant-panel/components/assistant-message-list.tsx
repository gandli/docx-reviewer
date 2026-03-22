type AssistantMessageListProps = {
  messages: readonly string[];
};

export function AssistantMessageList({ messages }: AssistantMessageListProps) {
  return (
    <div className="assistant-messages">
      {messages.map((message) => (
        <div key={message} className="assistant-card">
          {message}
        </div>
      ))}
    </div>
  );
}
