"use client";

export default function DecisionPointCard({ scenario, prompt, value, onChange }: { scenario: string; prompt: string; value: string; onChange: (value: string) => void; }) {
  return <section className="ttf-card ttf-decision"><span className="ttf-label">DECISION POINT</span><p className="ttf-scenario">{scenario}</p><label><strong>{prompt}</strong><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={6}/><small>{value.trim().length} characters</small></label></section>;
}
