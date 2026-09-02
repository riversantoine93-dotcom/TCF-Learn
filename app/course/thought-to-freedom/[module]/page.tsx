"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import InteractiveLesson, { lessonDoneKey } from "@/components/course/InteractiveLesson";
import { useAuth } from "@/components/AuthProvider";
import { thoughtToFreedomCourse } from "@/lib/courses/thought-to-freedom";
import { loadCloudProgress, loadLocalProgress, saveCloudProgress, saveLocalProgress, ProgressData } from "@/lib/progress";
import "../thought-to-freedom.css";

type LessonTab = 1 | 2 | 3;

export default function ThoughtToFreedomModulePage() {
  const params = useParams<{ module: string }>();
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState<ProgressData>({});
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<LessonTab>(1);
  const [sync, setSync] = useState("Saved on this device");
  const isOrientation = params.module === "orientation";
  const module = thoughtToFreedomCourse.modules.find((item) => item.slug === params.module);

  useEffect(() => { setTab(1); setReady(false); }, [params.module]);
  useEffect(() => {
    if (loading) return;
    const local = loadLocalProgress("thought-to-freedom");
    if (!user) { setProgress(local); setReady(true); return; }
    loadCloudProgress(user.id, "thought-to-freedom").then((cloud) => setProgress({ ...local, ...cloud })).catch(() => setProgress(local)).finally(() => setReady(true));
  }, [user, loading, params.module]);
  useEffect(() => {
    if (!ready) return;
    saveLocalProgress(progress, "thought-to-freedom");
    if (!user) { setSync("Saved on this device"); return; }
    setSync("Saving…");
    const timer = setTimeout(() => saveCloudProgress(user.id, progress, "thought-to-freedom").then(() => setSync("Saved to your account")).catch(() => setSync("Cloud sync unavailable; saved locally")), 450);
    return () => clearTimeout(timer);
  }, [progress, ready, user]);
  const update = (key: string, value: string | boolean | number) => setProgress((current) => ({ ...current, [key]: value }));

  if (isOrientation && thoughtToFreedomCourse.orientation) {
    const orientation = thoughtToFreedomCourse.orientation;
    return <main className="ttf-shell"><Header/><section className="shell ttf-module-page"><div className="ttf-module-banner"><span>COURSE ORIENTATION</span><h1>{orientation.title}</h1><p>Before Module 1, learn the thought-to-consequence chain and the correction loop you will use throughout the course.</p></div>{ready && <InteractiveLesson courseSlug="thought-to-freedom" moduleNumber={0} moduleSlug="orientation" lesson={{ ...orientation, number: 0 }} progress={progress} onProgressChange={update} onComplete={() => { setProgress((current) => ({ ...current, orientationComplete: true, m0lesson0: true })); window.scrollTo({ top: 0, behavior: "smooth" }); }}/>} {Boolean(progress.orientationComplete) && <div className="ttf-next-module"><strong>Orientation complete.</strong><Link className="button" href="/course/thought-to-freedom/module-1">Begin Module 1 →</Link></div>}</section></main>;
  }
  if (!module) return <main><Header/><section className="empty-state"><h1>Module not found.</h1><Link className="button" href="/course/thought-to-freedom">Return to course</Link></section></main>;
  const previousUnlocked = module.number === 1 ? Boolean(progress.orientationComplete) : Boolean(progress[lessonDoneKey(module.number - 1, 3)]);
  const unlocked: Record<LessonTab, boolean> = { 1: previousUnlocked, 2: Boolean(progress[lessonDoneKey(module.number, 1)]), 3: Boolean(progress[lessonDoneKey(module.number, 2)]) };
  const completed = module.lessons.filter((lesson) => Boolean(progress[lessonDoneKey(module.number, lesson.number)])).length;
  if (ready && !previousUnlocked) return <main className="ttf-shell"><Header/><section className="empty-state"><h1>Module locked.</h1><p>Complete the previous module to continue.</p><Link className="button" href="/course/thought-to-freedom">Return to course</Link></section></main>;
  const lesson = module.lessons[tab - 1];
  const completeLesson = () => { setProgress((current) => ({ ...current, [lessonDoneKey(module.number, lesson.number)]: true })); if (tab < 3) setTab((tab + 1) as LessonTab); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <main className="ttf-shell"><Header/><section className="shell ttf-module-page"><div className="ttf-module-banner"><span>MODULE {module.number} · THINKING ERROR</span><h1>{module.title}</h1><p className="ttf-core-question">{module.coreQuestion}</p><p>{module.keyIdea}</p><small>{completed}/3 lessons complete · {sync}</small></div><nav className="ttf-lesson-tabs" aria-label="Module lessons">{module.lessons.map((item) => { const open = unlocked[item.number as LessonTab]; const done = Boolean(progress[lessonDoneKey(module.number, item.number)]); return <button type="button" key={item.slug} disabled={!open} className={tab === item.number ? "active" : ""} onClick={() => setTab(item.number as LessonTab)}><span>{done ? "✓" : item.number}</span>{item.title}{!open && <small>Locked</small>}</button>; })}</nav>{ready && <InteractiveLesson courseSlug="thought-to-freedom" moduleNumber={module.number} moduleSlug={module.slug} lesson={lesson} progress={progress} onProgressChange={update} onComplete={completeLesson}/>} {Boolean(progress[lessonDoneKey(module.number, 3)]) && <div className="ttf-next-module"><strong>Module {module.number} complete.</strong>{module.number < 10 ? <Link className="button" href={`/course/thought-to-freedom/module-${module.number + 1}`}>Continue to Module {module.number + 1} →</Link> : <Link className="button" href="/course/thought-to-freedom/completion">Build My Action Plan →</Link>}</div>}</section></main>;
}
