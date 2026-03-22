type ActionPanelProps = {
  summaryLabel: string;
  onApplySuggestion: () => void;
  onJumpToSelection: () => void;
  onClose: () => void;
};

export function ActionPanel({
  summaryLabel,
  onApplySuggestion,
  onJumpToSelection,
  onClose,
}: ActionPanelProps) {
  return (
    <div className="assistant-actions-popover" role="dialog" aria-label="对话操作">
      <div className="assistant-actions-popover__header">
        <div className="eyebrow">当前操作</div>
        <button className="assistant-actions-close" type="button" onClick={onClose}>
          关闭
        </button>
      </div>
      <div className="muted">当前聚焦：{summaryLabel}</div>
      <div className="assistant-actions">
        <button
          className="assistant-primary-action"
          type="button"
          onClick={() => {
            onApplySuggestion();
            onClose();
          }}
        >
        接受建议
        </button>
        <button className="assistant-secondary-action" type="button" onClick={onClose}>
          重新生成
        </button>
        <button
          className="assistant-secondary-action"
          type="button"
          onClick={() => {
            onJumpToSelection();
            onClose();
          }}
        >
          跳到原文位置
        </button>
      </div>
    </div>
  );
}
