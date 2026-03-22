type DocumentHeaderProps = {
  title: string;
};

export function DocumentHeader({ title }: DocumentHeaderProps) {
  return (
    <header className="mb-[18px]">
      <div>
        <div className="font-sans text-[12px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
          Document
        </div>
        <div className="mt-2 text-[1.4rem] leading-[1.25] font-bold text-[var(--color-text-primary)]">
          {title}
        </div>
      </div>
    </header>
  );
}
