type InlineSelectionBlockProps = {
  title: string;
  text: string;
  isFocused: boolean;
};

export function InlineSelectionBlock({
  title,
  text,
  isFocused,
}: InlineSelectionBlockProps) {
  return (
    <section
      className="rounded-[18px] border border-[rgba(216,207,193,0.72)] bg-[rgba(255,251,244,0.56)] px-4 py-[14px]"
      data-focused={isFocused}
    >
      <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
        当前选中条款
      </div>
      <div className="mt-2 mb-1 text-[1rem] leading-[1.25] font-bold text-[var(--color-text-primary)]">
        {title}
      </div>
      <div className="font-sans text-[0.85rem] leading-[1.5] text-[var(--color-text-secondary)]">
        {text}
      </div>
      {isFocused ? (
        <div className="mt-[10px] font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
          已定位到当前条款
        </div>
      ) : null}
    </section>
  );
}
