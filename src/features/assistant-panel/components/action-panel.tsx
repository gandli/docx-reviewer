export function ActionPanel() {
  return (
    <div className="assistant-actions">
      <button className="assistant-primary-action" type="button">
        接受建议
      </button>
      <button className="assistant-secondary-action" type="button">
        重新生成
      </button>
      <button className="assistant-secondary-action" type="button">
        写入当前条款
      </button>
    </div>
  );
}
