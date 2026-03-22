type ActionPanelProps = {
  documentMode: "structured" | "pdf";
  hasSuggestion: boolean;
  summaryLabel: string;
  onApplySuggestion: () => void;
  onJumpToSelection: () => void;
  onClose: () => void;
};

export function ActionPanel({
  documentMode,
  hasSuggestion,
  summaryLabel,
  onApplySuggestion,
  onJumpToSelection,
  onClose,
}: ActionPanelProps) {
  return (
    <div
      className="absolute right-0 bottom-[calc(100%+10px)] w-full max-w-[280px] rounded-[18px] border border-[rgba(216,207,193,0.88)] bg-[rgba(255,251,244,0.96)] p-[14px] shadow-[0_20px_40px_rgba(71,53,33,0.12)] backdrop-blur-[10px]"
      role="dialog"
      aria-label="对话操作"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
          当前操作
        </div>
        <button
          className="cursor-pointer border-0 bg-transparent p-0 text-[var(--color-text-muted)]"
          type="button"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
      <div className="font-sans text-[0.85rem] leading-[1.5] text-[var(--color-text-muted)]">
        当前聚焦：{summaryLabel}
      </div>
      <div className="mt-[10px] grid gap-[10px]">
        {documentMode === "structured" && hasSuggestion ? (
          <button
            className="cursor-pointer rounded-[14px] border-0 bg-[var(--color-ink-strong)] px-[14px] py-3 text-center text-[#fffdf9]"
            type="button"
            onClick={() => {
              onApplySuggestion();
              onClose();
            }}
          >
            接受建议
          </button>
        ) : null}
        <button
          className="cursor-pointer rounded-[14px] border-0 bg-[rgba(236,228,216,0.76)] px-[14px] py-3 text-center text-[var(--color-text-secondary)]"
          type="button"
          onClick={onClose}
        >
          重新生成
        </button>
        {documentMode === "structured" ? (
          <button
            className="cursor-pointer rounded-[14px] border-0 bg-[rgba(236,228,216,0.76)] px-[14px] py-3 text-center text-[var(--color-text-secondary)]"
            type="button"
            onClick={() => {
              onJumpToSelection();
              onClose();
            }}
          >
            跳到原文位置
          </button>
        ) : null}
      </div>
    </div>
  );
}
