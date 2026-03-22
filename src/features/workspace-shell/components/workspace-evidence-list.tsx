type WorkspaceEvidenceListProps = {
  evidence: readonly string[];
};

export function WorkspaceEvidenceList({ evidence }: WorkspaceEvidenceListProps) {
  return (
    <section>
      <div className="eyebrow">最近引用</div>
      <div className="evidence-list" style={{ marginTop: 8 }}>
        {evidence.map((item) => (
          <div key={item} className="evidence-card">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
