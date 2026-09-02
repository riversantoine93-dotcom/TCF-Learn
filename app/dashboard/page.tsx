"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import DashboardPurchaseCenter from "@/components/DashboardPurchaseCenter";
import { useAuth } from "@/components/AuthProvider";
import { loadCloudProgress, loadLocalProgress, ProgressData } from "@/lib/progress";
import { courseProgressSummary } from "@/lib/courses/dashboard";
import { activeCourseSlugs, DashboardCourseSlug } from "@/lib/dashboard-enrollments";
import { supabase } from "@/lib/supabase";
import "./dashboard.css";

export default function Dashboard(){
  const {user,loading}=useAuth();
  const [turningForward,setTurningForward]=useState<ProgressData>({});
  const [thoughtToFreedom,setThoughtToFreedom]=useState<ProgressData>({});
  const [enrolledCourses,setEnrolledCourses]=useState<DashboardCourseSlug[]>([]);
  const [checkingEnrollments,setCheckingEnrollments]=useState(true);
  const [theme,setTheme]=useState<"dark"|"light">("dark");
  useEffect(()=>{const saved=localStorage.getItem("tcf-learn-dashboard-theme");if(saved==="light"||saved==="dark")setTheme(saved)},[]);
  useEffect(()=>{
    if(loading)return;
    const tfLocal=loadLocalProgress("turning-forward"); const ttfLocal=loadLocalProgress("thought-to-freedom");
    if(!user||!supabase){setTurningForward(tfLocal);setThoughtToFreedom(ttfLocal);setEnrolledCourses([]);setCheckingEnrollments(false);return;}
    let cancelled=false;
    setCheckingEnrollments(true);
    (async()=>{
      const [enrollmentResult,tf,ttf]=await Promise.all([
        supabase.from("enrollments").select("course_slug,active").eq("user_id",user.id).eq("active",true),
        loadCloudProgress(user.id,"turning-forward").catch(()=>({})),
        loadCloudProgress(user.id,"thought-to-freedom").catch(()=>({})),
      ]);
      if(cancelled)return;
      setTurningForward({...tfLocal,...tf});
      setThoughtToFreedom({...ttfLocal,...ttf});
      setEnrolledCourses(activeCourseSlugs(enrollmentResult.data));
      setCheckingEnrollments(false);
    })();
    return()=>{cancelled=true};
  },[user,loading]);
  const toggleTheme=()=>setTheme(current=>{const next=current==="dark"?"light":"dark";localStorage.setItem("tcf-learn-dashboard-theme",next);return next});
  const turningComplete=Object.entries(turningForward).filter(([key,value])=>value===true&&(/^(lesson\d+|challenge|m\d+lesson\d+|m\d+challenge)$/.test(key))).length;
  const turningPercent=Math.min(100,Math.round(turningComplete/32*100));
  const thoughtSummary=useMemo(()=>courseProgressSummary(thoughtToFreedom,30),[thoughtToFreedom]);
  const firstName=user?.user_metadata?.full_name?.split(" ")[0];
  const hasTurningForward=enrolledCourses.includes("turning-forward");
  const hasThoughtToFreedom=enrolledCourses.includes("thought-to-freedom");
  const thoughtStarted=hasThoughtToFreedom&&(Boolean(thoughtToFreedom.orientationComplete)||thoughtSummary.complete>0);
  const thoughtComplete=hasThoughtToFreedom&&Boolean(thoughtToFreedom.courseComplete);
  const nextCourse=hasThoughtToFreedom&&thoughtStarted&&!thoughtComplete?"/course/thought-to-freedom":hasTurningForward?"/course/turning-forward":hasThoughtToFreedom?"/course/thought-to-freedom":"/dashboard#purchase-center";
  return <main className={`dashboard-shell ${theme}`}>
    <aside className="dashboard-sidebar"><Link className="dash-brand" href="/dashboard"><strong>TCF <span>LEARN</span></strong><small>TURNING CONVICTION INTO FREEDOM</small></Link><nav aria-label="User navigation"><Link className="active" href="/dashboard"><span>⌂</span>Dashboard</Link><Link href="/dashboard#purchase-center"><span>$</span>Course Store</Link><Link href="/dashboard#my-courses"><span>▣</span>My Courses</Link><Link href="/profile"><span>○</span>Profile</Link></nav><button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`}><span>{theme==="dark"?"☀":"☾"}</span><b>{theme==="dark"?"Light Mode":"Dark Mode"}</b></button></aside>
    <section className="dashboard-main">
      <header className="dash-topbar"><div><span className="eyebrow">USER DASHBOARD</span><h1>{firstName?`Welcome back, ${firstName}.`:"Welcome to TCF LEARN."}</h1><p>Keep building. Keep growing. Keep turning conviction into freedom.</p></div><Link className="profile-link" href="/profile">{user?.user_metadata?.full_name||"User Profile"} <span>›</span></Link></header>
      {user&&<div className="dash-stats"><div><strong>{checkingEnrollments?"—":enrolledCourses.length}</strong><span>Purchased Courses</span></div>{hasTurningForward&&<div><strong>{turningPercent}%</strong><span>Turning Forward</span></div>}{hasThoughtToFreedom&&<div><strong>{thoughtSummary.percent}%</strong><span>Thought to Freedom</span></div>}</div>}
      <DashboardPurchaseCenter/>
      <div className="hub-heading" id="my-courses"><div><span className="eyebrow">TCF LEARN COURSE HUB</span><h2>My Courses</h2><p>Only courses purchased on this account appear here. New purchases are made in the Course Store above.</p></div></div>
      {checkingEnrollments?<div className="course-empty-state"><h3>Checking your course access…</h3><p>We’re loading the active courses attached to your account.</p></div>:enrolledCourses.length===0?<div className="course-empty-state"><h3>No purchased courses yet</h3><p>When you purchase a course or the bundle, your active courses will appear here automatically.</p><Link className="continue-button" href="/dashboard#purchase-center">View Course Store <span>→</span></Link></div>:<div className="course-hub-grid">
        {hasTurningForward&&<article className="hub-course-card available"><div className="course-thumb"><Image src="/course-thumbnails/turning-forward.png" alt="Turning Forward course thumbnail" fill sizes="(max-width: 900px) 100vw, 50vw" priority/><span className="status-pill">ENROLLED</span></div><div className="course-card-body"><h3>Turning Forward: The Work Beyond Fear</h3><p>A structured path from survival mode to clarity, discipline, purpose, and forward momentum.</p><div className="progress-heading"><b>Overall Progress</b><strong>{turningPercent}%</strong></div><ProgressBar value={turningPercent}/><div className="course-meta"><span>{turningComplete} of 32 sections complete</span><span>8 modules</span></div><Link className="continue-button" href="/course/turning-forward">{turningComplete?"Continue Course":"Start Course"}<span>→</span></Link></div></article>}
        {hasThoughtToFreedom&&<article className="hub-course-card available"><div className="course-thumb"><Image src="/course-thumbnails/from-thought-to-freedom.png" alt="Thought to Freedom course thumbnail" fill sizes="(max-width: 900px) 100vw, 50vw"/><span className="status-pill">{thoughtComplete?"COMPLETED":thoughtStarted?"IN PROGRESS":"ENROLLED"}</span></div><div className="course-card-body"><h3>Thought to Freedom</h3><h4>Correcting Criminal Thinking Errors</h4><p>Identify recurring thinking errors, challenge the thought before it becomes action, and practice responsible replacement thinking.</p><div className="progress-heading"><b>Core Lesson Progress</b><strong>{thoughtSummary.percent}%</strong></div><ProgressBar value={thoughtSummary.percent}/><div className="course-meta"><span>{thoughtSummary.complete} of 30 lessons complete</span><span>10 modules</span></div><Link className="continue-button" href="/course/thought-to-freedom">{thoughtComplete?"Review Course":thoughtStarted?"Continue Course":"Start Course"}<span>→</span></Link></div></article>}
      </div>}
      <div className="next-step"><div><span>→</span><div><b>Your next step</b><p>{enrolledCourses.length===0?"Choose a course in the store above to begin.":hasThoughtToFreedom&&thoughtStarted&&!thoughtComplete?"Continue Thought to Freedom from your next incomplete thinking-error lesson.":"Continue one of the courses attached to your account."}</p></div></div><Link href={nextCourse}>{enrolledCourses.length===0?"View Course Store":"Open Course"}</Link></div>
    </section>
    <a className="podcast-powered" href="https://theconvictionfictionpodcast.com" target="_blank" rel="noreferrer" aria-label="Visit The Conviction Fiction Podcast"><span className="powered-label">POWERED BY</span><span className="podcast-lockup"><img src="https://theconvictionfictionpodcast.com/assets/conviction-fiction-logo.png" alt="The Conviction Fiction Podcast"/><span className="listen-cue" aria-hidden="true"><svg viewBox="0 0 24 24" role="img"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="12" width="4" height="7" rx="2"/><rect x="17" y="12" width="4" height="7" rx="2"/><path d="M17 19c0 1.1-.9 2-2 2h-3"/></svg></span></span></a>
  </main>;
}
