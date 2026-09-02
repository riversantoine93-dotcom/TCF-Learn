"use client";

export default function WorkbookActivity({ title, instructions, fields, values, onChange }: { title: string; instructions: string; fields: string[]; values: Record<string, string>; onChange: (field: string, value: string) => void; }) {
  return <section className="ttf-card ttf-workbook"><span className="ttf-label">WORKBOOK ACTIVITY</span><h3>{title}</h3><p>{instructions}</p><div className="ttf-workbook-fields">{fields.map((field) => <label key={field}><strong>{field}</strong><textarea value={values[field] || ""} onChange={(event) => onChange(field, event.target.value)} rows={4}/></label>)}</div></section>;
}
