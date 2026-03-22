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
      <div className="document-status">
        <div className="status-pill">阅读态</div>
        <div className="status-pill is-primary">可编辑</div>
      </div>
    </header>
  );
}
