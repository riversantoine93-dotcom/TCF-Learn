"use client";

export default function CatchTheThought({ prompt, statements, value, onChange }: { prompt: string; statements: string[]; value: string; onChange: (value: string) => void; }) {
  return <section className="ttf-card ttf-catch"><span className="ttf-label">CATCH THE THOUGHT</span><h3>{prompt}</h3><div className="ttf-statement-list">{statements.map((statement) => <button type="button" key={statement} className={value === statement ? "selected" : ""} onClick={() => onChange(statement)}><span aria-hidden="true">{value === statement ? "✓" : "○"}</span>{statement}</button>)}</div></section>;
}
