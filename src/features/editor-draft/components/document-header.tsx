type DocumentHeaderProps = {
  title: string;
};

export function DocumentHeader({ title }: DocumentHeaderProps) {
  return (
    <header className="document-header">
      <div>
        <div className="eyebrow">Document</div>
        <div className="title-lg" style={{ fontSize: "1.4rem", marginTop: 8 }}>
          {title}
        </div>
      </div>
      <div className="document-status-inline">
        <span className="document-status-inline__item">阅读视图</span>
        <span className="document-status-inline__divider" aria-hidden="true">
          ·
        </span>
        <span className="document-status-inline__item is-active">可编辑</span>
      </div>
    </header>
  );
}
