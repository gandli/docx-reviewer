export function InlineSelectionBlock() {
  return (
    <section className="selection-block">
      <div className="eyebrow">当前选中条款</div>
      <div className="title-lg" style={{ fontSize: "1rem" }}>
        付款方式
      </div>
      <div className="muted" style={{ color: "var(--color-text-secondary)" }}>
        合同签订后一次性支付全部款项。
      </div>
    </section>
  );
}
