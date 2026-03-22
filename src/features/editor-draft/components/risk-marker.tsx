type RiskMarkerProps = {
  text: string;
};

export function RiskMarker({ text }: RiskMarkerProps) {
  return (
    <div className="mb-[18px] border-l-2 border-[rgba(181,142,83,0.52)] bg-transparent py-3 pl-[14px]">
      <div className="mb-1 font-sans text-[0.72rem] font-bold tracking-[0.06em] text-[rgba(138,106,55,0.92)] uppercase">
        修订建议
      </div>
      <div className="leading-[1.65] text-[var(--color-text-secondary)]">{text}</div>
    </div>
  );
}
