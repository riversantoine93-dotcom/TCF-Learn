"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/components/AuthProvider";
import { loadCloudProgress, loadLocalProgress, ProgressData } from "@/lib/progress";
import "./dashboard.css";

const courseCatalog=[
  {slug:"turning-forward",title:"Turning Forward: The Work Beyond Fear",description:"A structured path from survival mode to clarity, discipline, purpose, and forward momentum.",status:"available" as const,href:"/course/turning-forward",image:"/course-thumbnails/turning-forward.png"},
  {slug:"from-thought-to-freedom",title:"From Thought to Freedom",subtitle:"Correcting Criminal Thinking Errors",description:"A practical course for identifying criminal thinking patterns, challenging distorted beliefs, and developing healthier decision-making habits.",status:"coming-soon" as const,release:"DECEMBER 2026",image:"/course-thumbnails/from-thought-to-freedom.png"}
];

export default function Dashboard(){
  const {user,loading}=useAuth();
  const [p,setP]=useState<ProgressData>({});
  const [theme,setTheme]=useState<"dark"|"light">("dark");
  useEffect(()=>{const saved=localStorage.getItem("tcf-learn-dashboard-theme");if(saved==="light"||saved==="dark")setTheme(saved)},[]);
  useEffect(()=>{if(loading)return;const local=loadLocalProgress();if(!user){setP(local);return;}loadCloudProgress(user.id).then(cloud=>setP({...local,...cloud})).catch(()=>setP(local));},[user,loading]);
  const toggleTheme=()=>setTheme(current=>{const next=current==="dark"?"light":"dark";localStorage.setItem("tcf-learn-dashboard-theme",next);return next});
  const complete=Object.entries(p).filter(([key,value])=>value===true&&(/^(lesson\d+|challenge|m\d+l\d+|m\d+challenge)$/.test(key))).length;
  const percent=Math.min(100,Math.round(complete/32*100));
  const firstName=user?.user_metadata?.full_name?.split(" ")[0];
  return <main className={`dashboard-shell ${theme}`}>
    <aside className="dashboard-sidebar">
      <Link className="dash-brand" href="/dashboard"><strong>TCF <span>LEARN</span></strong><small>TURNING CONVICTION INTO FREEDOM</small></Link>
      <nav aria-label="Student navigation"><Link className="active" href="/dashboard"><span>⌂</span>Dashboard</Link><Link href="/course/turning-forward"><span>▣</span>My Courses</Link><Link href="/profile"><span>○</span>Profile</Link></nav>
      <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`}><span>{theme==="dark"?"☀":"☾"}</span><b>{theme==="dark"?"Light Mode":"Dark Mode"}</b></button>
      <div className="sidebar-mark"><b>TCF</b><span>THE<br/>CONVICTION<br/><em>FICTION</em><br/>PODCAST</span><p>“The mind can be the prison.<br/>The mindset can be the key.”</p></div>
    </aside>
    <section className="dashboard-main">
      <header className="dash-topbar"><div><span className="eyebrow">STUDENT DASHBOARD</span><h1>{firstName?`Welcome back, ${firstName}.`:"Welcome to TCF LEARN."}</h1><p>Keep building. Keep growing. Keep turning conviction into freedom.</p></div><Link className="profile-link" href="/profile">{user?.user_metadata?.full_name||"Student Profile"} <span>›</span></Link></header>
      <div className="dash-stats"><div><strong>1</strong><span>Course Enrolled</span></div><div><strong>{percent}%</strong><span>Overall Progress</span></div><div><strong>8</strong><span>Modules</span></div></div>
      <div className="hub-heading"><div><span className="eyebrow">TCF LEARN COURSE HUB</span><h2>My Courses</h2><p>All your learning. One place. More courses coming soon.</p></div></div>
      <div className="course-hub-grid">{courseCatalog.map(course=><article className={`hub-course-card ${course.status}`} key={course.slug}><div className="course-thumb"><Image src={course.image} alt={`${course.title} course thumbnail`} fill sizes="(max-width: 900px) 100vw, 50vw" priority={course.slug==="turning-forward"}/><span className="status-pill">{course.status==="available"?"ENROLLED":"COMING SOON"}</span></div><div className="course-card-body"><h3>{course.title}</h3>{course.subtitle&&<h4>{course.subtitle}</h4>}<p>{course.description}</p>{course.status==="available"?<><div className="progress-heading"><b>Overall Progress</b><strong>{percent}%</strong></div><ProgressBar value={percent}/><div className="course-meta"><span>{complete} of 32 sections complete</span><span>8 modules</span></div><Link className="continue-button" href={course.href}>{complete?"Continue Course":"Start Course"}<span>→</span></Link></>:<div className="coming-state"><span className="lock-icon">▣</span><div><b>COMING SOON — {course.release}</b><small>Enrollment details will be announced closer to launch.</small></div></div>}</div></article>)}</div>
      <div className="next-step"><div><span>→</span><div><b>Your next step</b><p>{complete?"Continue Turning Forward from where you left off.":"Begin Turning Forward with Module 1: The Decision to Turn Forward."}</p></div></div><Link href="/course/turning-forward/module-1">Open Module 1</Link></div>
    </section>
  </main>;
}
