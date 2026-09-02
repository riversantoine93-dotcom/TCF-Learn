"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/components/AuthProvider";
import { thoughtToFreedomCourse } from "@/lib/courses/thought-to-freedom";
import { loadCloudProgress, loadLocalProgress, ProgressData } from "@/lib/progress";
import "./thought-to-freedom.css";

const lessonKey = (moduleNumber: number, lessonNumber: number) => `m${moduleNumber}lesson${lessonNumber}`;

export default function ThoughtToFreedomOverview() {
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState<ProgressData>({});
  useEffect(() => {
    if (loading) return;
    const local = loadLocalProgress("thought-to-freedom");
    if (!user) { setProgress(local); return; }
    loadCloudProgress(user.id, "thought-to-freedom").then((cloud) => setProgress({ ...local, ...cloud })).catch(() => setProgress(local));
  }, [user, loading]);
  const completedLessons = useMemo(() => thoughtToFreedomCourse.modules.reduce((total, module) => total + module.lessons.filter((lesson) => Boolean(progress[lessonKey(module.number, lesson.number)])).length, 0), [progress]);
  const percent = Math.round((completedLessons / 30) * 100);
  const orientationDone = Boolean(progress.orientationComplete);

  return <main className="ttf-shell"><Header/>
    <section className="ttf-hero"><div className="shell"><span className="eyebrow">TCF LEARN · INTERACTIVE COURSE</span><h1>Thought to Freedom</h1><h2>Correcting Criminal Thinking Errors</h2><p className="ttf-tagline">Examine the thought. Challenge the pattern. Choose a different response.</p><p className="ttf-intro">This course turns reflection into practice. You will learn to recognize recurring thinking errors, slow down the choice point, examine consequences, and practice a responsible replacement thought before the old pattern becomes action.</p>{completedLessons > 0 && <div className="ttf-progress"><div><strong>{percent}% complete</strong><span>{completedLessons} of 30 lessons</span></div><ProgressBar value={percent}/></div>}<Link className="button" href={orientationDone ? "/course/thought-to-freedom/module-1" : "/course/thought-to-freedom/orientation"}>{orientationDone ? (completedLessons ? "Continue Course" : "Begin Module 1") : "Start Orientation"} →</Link></div></section>
    <section className="shell ttf-about"><div><span className="eyebrow">BEFORE THE ACTION COMES THE THOUGHT</span><h2>Correct the pattern earlier.</h2></div><div><p>The working chain is <strong>Thought → Choice → Action → Consequence.</strong> Thought to Freedom is built around a five-step practice: <strong>Recognize → Examine → Interrupt → Replace → Practice.</strong></p><p>Antoine Rivers developed this course from lessons he studied and applied while incarcerated, including his study of criminal-thinking work by Dr. Stanton Samenow and Dr. Samuel Yochelson. The instruction is presented through Antoine's lived experience and the TCF Learn framework and does not claim endorsement by those scholars.</p></div></section>
    <section className="shell ttf-module-list"><div className="ttf-section-heading"><span className="eyebrow">10 THINKING ERRORS · 30 CORE LESSONS</span><h2>Course Framework</h2></div>{thoughtToFreedomCourse.modules.map((module) => { const previousDone = module.number === 1 ? orientationDone : Boolean(progress[lessonKey(module.number - 1, 3)]); const count = module.lessons.filter((lesson) => Boolean(progress[lessonKey(module.number, lesson.number)])).length; return <article className="ttf-module-card" key={module.slug}><div className="ttf-module-number">{String(module.number).padStart(2, "0")}</div><div className="ttf-module-copy"><span>{count}/3 lessons complete</span><h3>{module.title}</h3><p className="ttf-core-question">{module.coreQuestion}</p><p>{module.keyIdea}</p></div>{previousDone ? <Link className="button secondary" href={`/course/thought-to-freedom/${module.slug}`}>{count ? "Continue" : "Begin"}</Link> : <span className="locked-pill">🔒 Locked</span>}</article>; })}</section>
  </main>;
}
