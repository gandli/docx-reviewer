type RiskMarkerProps = {
  text: string;
};

export function RiskMarker({ text }: RiskMarkerProps) {
  return (
    <div className="risk-marker">
      <div className="risk-marker__label">修订建议</div>
      <div className="risk-marker__text">{text}</div>
    </div>
  );
}
