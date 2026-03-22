type AssistantMessageListProps = {
  messages: readonly string[];
  latestConclusion: string;
};

export function AssistantMessageList({ messages, latestConclusion }: AssistantMessageListProps) {
  return (
    <div className="assistant-messages">
      <div className="assistant-card">{latestConclusion}</div>
      {messages.map((message) => (
        <div key={message} className="assistant-card">
          {message}
        </div>
      ))}
    </div>
  );
}
