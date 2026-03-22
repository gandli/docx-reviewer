type WorkspaceEvidenceListProps = {
  evidence: readonly string[];
};

export function WorkspaceEvidenceList({ evidence }: WorkspaceEvidenceListProps) {
  return (
    <section>
      <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
        最近引用
      </div>
      <div className="mt-2 grid gap-[10px]">
        {evidence.map((item) => (
          <div
            key={item}
            className="rounded-[14px] border-b border-[rgba(216,207,193,0.72)] py-[10px]"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
