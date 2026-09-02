"use client";

import type { CourseLesson, CourseSlug } from "@/lib/courses/types";
import type { ProgressData } from "@/lib/progress";
import CatchTheThought from "./CatchTheThought";
import DecisionPointCard from "./DecisionPointCard";
import WorkbookActivity from "./WorkbookActivity";

const safeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export function lessonDoneKey(moduleNumber: number, lessonNumber: number) { return `m${moduleNumber}lesson${lessonNumber}`; }

export default function InteractiveLesson({ courseSlug, moduleNumber, moduleSlug, lesson, progress, onProgressChange, onComplete }: { courseSlug: CourseSlug; moduleNumber: number; moduleSlug: string; lesson: CourseLesson; progress: ProgressData; onProgressChange: (key: string, value: string | boolean | number) => void; onComplete: () => void; }) {
  const prefix = `${courseSlug}:${moduleSlug}:${lesson.slug}`;
  const requirements: boolean[] = [];
  const content = lesson.blocks.map((block, index) => {
    if (block.type === "paragraph") return <p key={index}>{block.text}</p>;
    if (block.type === "key-idea") return <aside className="ttf-key-idea" key={index}><span>KEY IDEA</span><p>{block.text}</p></aside>;
    if (block.type === "reflection") {
      const key = `${prefix}:${block.id}`; const value = String(progress[key] || ""); const complete = value.trim().length >= block.minChars; requirements.push(complete);
      return <section className="ttf-card" key={block.id}><span className="ttf-label">REFLECTION</span><label><strong>{block.prompt}</strong><textarea value={value} onChange={(event) => onProgressChange(key, event.target.value)} rows={6}/><small className={complete ? "requirement-met" : "requirement-pending"}>{complete ? "✓ Requirement met" : `${Math.max(0, block.minChars - value.trim().length)} more characters required`}</small></label></section>;
    }
    if (block.type === "knowledge-check") {
      const key = `${prefix}:${block.question.id}`; const selected = String(progress[key] || ""); const selectedOption = block.question.options.find((option) => option.id === selected); const complete = Boolean(selectedOption?.correct); requirements.push(complete);
      return <section className="ttf-card ttf-knowledge" key={block.question.id}><span className="ttf-label">KNOWLEDGE CHECK</span><h3>{block.question.prompt}</h3><div className="ttf-options">{block.question.options.map((option) => <button type="button" key={option.id} className={selected === option.id ? "selected" : ""} onClick={() => onProgressChange(key, option.id)}><span aria-hidden="true">{selected === option.id ? "●" : "○"}</span>{option.label}</button>)}</div>{selectedOption && <div className={selectedOption.correct ? "ttf-feedback correct" : "ttf-feedback incorrect"}><strong>{selectedOption.correct ? "✓ Correct" : "Try again"}</strong><p>{selectedOption.feedback}</p></div>}</section>;
    }
    if (block.type === "catch-the-thought") { const key = `${prefix}:${block.id}`; const value = String(progress[key] || ""); requirements.push(Boolean(value)); return <CatchTheThought key={block.id} prompt={block.prompt} statements={block.statements} value={value} onChange={(next) => onProgressChange(key, next)}/>; }
    if (block.type === "decision-point") { const key = `${prefix}:${block.id}`; const value = String(progress[key] || ""); requirements.push(value.trim().length >= 50); return <DecisionPointCard key={block.id} scenario={block.scenario} prompt={block.prompt} value={value} onChange={(next) => onProgressChange(key, next)}/>; }
    if (block.type === "workbook-activity") {
      const values = Object.fromEntries(block.fields.map((field) => [field, String(progress[`${prefix}:${block.id}:${safeKey(field)}`] || "")])); requirements.push(block.fields.every((field) => String(values[field] || "").trim().length >= 10));
      return <WorkbookActivity key={block.id} title={block.title} instructions={block.instructions} fields={block.fields} values={values} onChange={(field, next) => onProgressChange(`${prefix}:${block.id}:${safeKey(field)}`, next)}/>;
    }
    return null;
  });
  const ready = requirements.length > 0 && requirements.every(Boolean); const done = Boolean(progress[lessonDoneKey(moduleNumber, lesson.number)]);
  return <article className="ttf-lesson"><div className="ttf-lesson-heading"><span>LESSON {lesson.number}</span><h2>{lesson.title}</h2><p>{lesson.objective}</p></div>{content}{done ? <div className="ttf-complete"><strong>✓ Lesson complete</strong><p>Your work is saved. Continue when you are ready.</p></div> : <button type="button" className="button full" disabled={!ready} onClick={onComplete}>Complete Lesson {lesson.number} →</button>}{!ready && !done && <p className="ttf-requirement-summary">Complete the required written work and answer the Knowledge Check correctly to continue.</p>}</article>;
}
