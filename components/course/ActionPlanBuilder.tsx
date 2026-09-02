"use client";

import { thoughtToFreedomActionPlanFields } from "@/lib/courses/thought-to-freedom";
import type { ProgressData } from "@/lib/progress";

const fieldKey = (index: number) => `actionPlan:${index + 1}`;
export function actionPlanComplete(progress: ProgressData) { return thoughtToFreedomActionPlanFields.every((_, index) => String(progress[fieldKey(index)] || "").trim().length >= 20); }

export default function ActionPlanBuilder({ progress, onChange, onComplete }: { progress: ProgressData; onChange: (key: string, value: string) => void; onComplete: () => void; }) {
  const ready = actionPlanComplete(progress);
  return <section className="ttf-action-plan"><div className="ttf-action-intro"><span className="eyebrow">FINAL PRACTICE</span><h2>My Thought to Freedom Action Plan</h2><p>Correction is not a one-time decision. Build a 30-day plan that names the patterns you are most likely to repeat and the responses you will practice instead.</p></div><div className="ttf-action-fields">{thoughtToFreedomActionPlanFields.map((label, index) => { const key = fieldKey(index); const value = String(progress[key] || ""); const met = value.trim().length >= 20; return <label key={label}><strong>{index + 1}. {label}</strong><textarea rows={5} value={value} onChange={(event) => onChange(key, event.target.value)}/><small className={met ? "requirement-met" : "requirement-pending"}>{met ? "✓ Complete" : `${Math.max(0, 20 - value.trim().length)} more characters required`}</small></label>; })}</div><button type="button" className="button full" disabled={!ready} onClick={onComplete}>Complete Thought to Freedom →</button></section>;
}
