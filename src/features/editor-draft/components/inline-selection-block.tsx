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
    <section className="selection-block" data-focused={isFocused}>
      <div className="eyebrow">当前选中条款</div>
      <div className="title-lg" style={{ fontSize: "1rem" }}>{title}</div>
      <div className="muted" style={{ color: "var(--color-text-secondary)" }}>{text}</div>
      {isFocused ? <div className="eyebrow" style={{ marginTop: 10 }}>已定位到当前条款</div> : null}
    </section>
  );
}
