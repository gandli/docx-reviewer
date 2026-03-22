type RiskMarkerProps = {
  text: string;
};

export function RiskMarker({ text }: RiskMarkerProps) {
  return <div className="risk-marker">建议：{text}</div>;
}
