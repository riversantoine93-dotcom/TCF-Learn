"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import CoursePurchaseOptions from "@/components/CoursePurchaseOptions";
import { useAuth } from "@/components/AuthProvider";
import { thoughtToFreedomCourse } from "@/lib/courses/thought-to-freedom";
import { loadCloudProgress, loadLocalProgress, ProgressData } from "@/lib/progress";
import { supabase } from "@/lib/supabase";
import "./thought-to-freedom.css";

const lessonKey = (moduleNumber: number, lessonNumber: number) => `m${moduleNumber}lesson${lessonNumber}`;

export default function ThoughtToFreedomOverview() {
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState<ProgressData>({});
  const [enrolled, setEnrolled] = useState(false);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    if (loading) return;
    const local = loadLocalProgress("thought-to-freedom");
    if (!user || !supabase) { setProgress(local); setEnrolled(false); setChecking(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_slug", "thought-to-freedom").eq("active", true).maybeSingle();
      try { const cloud = await loadCloudProgress(user.id, "thought-to-freedom"); if (!cancelled) setProgress({ ...local, ...cloud }); } catch { if (!cancelled) setProgress(local); }
      if (!cancelled) { setEnrolled(Boolean(data)); setChecking(false); }
    })();
    return () => { cancelled = true; };
  }, [user, loading]);
  const completedLessons = useMemo(() => thoughtToFreedomCourse.modules.reduce((total, module) => total + module.lessons.filter((lesson) => Boolean(progress[lessonKey(module.number, lesson.number)])).length, 0), [progress]);
  const percent = Math.round((completedLessons / 30) * 100);
  const orientationDone = Boolean(progress.orientationComplete);

  return <main className="ttf-shell"><Header/>
    <section className="ttf-hero"><div className="shell"><span className="eyebrow">TCF LEARN · INTERACTIVE COURSE</span><h1>Thought to Freedom</h1><h2>Correcting Criminal Thinking Errors</h2><p className="ttf-tagline">Examine the thought. Challenge the pattern. Choose a different response.</p><p className="ttf-intro">This course turns reflection into practice. You will learn to recognize recurring thinking errors, slow down the choice point, examine consequences, and practice a responsible replacement thought before the old pattern becomes action.</p>{enrolled&&completedLessons > 0 && <div className="ttf-progress"><div><strong>{percent}% complete</strong><span>{completedLessons} of 30 lessons</span></div><ProgressBar value={percent}/></div>}{enrolled&&<Link className="button" href={orientationDone ? "/course/thought-to-freedom/module-1" : "/course/thought-to-freedom/orientation"}>{orientationDone ? (completedLessons ? "Continue Course" : "Begin Module 1") : "Start Orientation"} →</Link>}{!checking&&!enrolled&&<div className="notice">Preview the full 10-module framework below. Full access is a one-time $97 purchase.</div>}</div></section>
    <section className="shell ttf-about"><div><span className="eyebrow">BEFORE THE ACTION COMES THE THOUGHT</span><h2>Correct the pattern earlier.</h2></div><div><p>The working chain is <strong>Thought → Choice → Action → Consequence.</strong> Thought to Freedom is built around a five-step practice: <strong>Recognize → Examine → Interrupt → Replace → Practice.</strong></p><p>Antoine Rivers developed this course from lessons he studied and applied while incarcerated, including his study of criminal-thinking work by Dr. Stanton Samenow and Dr. Samuel Yochelson. The instruction is presented through Antoine's lived experience and the TCF Learn framework and does not claim endorsement by those scholars.</p></div></section>
    <section className="shell ttf-module-list"><div className="ttf-section-heading"><span className="eyebrow">10 THINKING ERRORS · 30 CORE LESSONS</span><h2>Course Framework</h2></div>{thoughtToFreedomCourse.modules.map((module) => { const previousDone = enrolled && (module.number === 1 ? orientationDone : Boolean(progress[lessonKey(module.number - 1, 3)])); const count = module.lessons.filter((lesson) => Boolean(progress[lessonKey(module.number, lesson.number)])).length; return <article className="ttf-module-card" key={module.slug}><div className="ttf-module-number">{String(module.number).padStart(2, "0")}</div><div className="ttf-module-copy"><span>{enrolled?`${count}/3 lessons complete`:"Course preview"}</span><h3>{module.title}</h3><p className="ttf-core-question">{module.coreQuestion}</p><p>{module.keyIdea}</p></div>{previousDone ? <Link className="button secondary" href={`/course/thought-to-freedom/${module.slug}`}>{count ? "Continue" : "Begin"}</Link> : <span className="locked-pill">{enrolled?"🔒 Locked":"Preview"}</span>}</article>; })}</section>
    {!checking&&!enrolled&&<section className="shell" style={{paddingBottom:"64px"}}><h2 style={{textAlign:"center"}}>Choose your access</h2><p style={{textAlign:"center"}}>Buy Thought to Freedom by itself, or save $48.50 by unlocking both TCF Learn courses together.</p><CoursePurchaseOptions course="thought-to-freedom"/></section>}
  </main>;
}
