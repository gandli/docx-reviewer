type ActionPanelProps = {
  onApplySuggestion: () => void;
  onJumpToSelection: () => void;
};

export function ActionPanel({
  onApplySuggestion,
  onJumpToSelection,
}: ActionPanelProps) {
  return (
    <div className="assistant-actions">
      <button className="assistant-primary-action" type="button" onClick={onApplySuggestion}>
        接受建议
      </button>
      <button className="assistant-secondary-action" type="button">
        重新生成
      </button>
      <button className="assistant-secondary-action" type="button" onClick={onJumpToSelection}>
        跳到原文位置
      </button>
    </div>
  );
}
