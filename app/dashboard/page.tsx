"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/components/AuthProvider";
import { loadCloudProgress, loadLocalProgress, ProgressData } from "@/lib/progress";

export default function Dashboard(){const {user,loading}=useAuth();const [p,setP]=useState<ProgressData>({}); useEffect(()=>{if(loading)return; const local=loadLocalProgress(); if(!user){setP(local);return;} loadCloudProgress(user.id).then(cloud=>setP({...local,...cloud})).catch(()=>setP(local));},[user,loading]); const complete=[p.lesson1,p.lesson2,p.lesson3,p.challenge].filter(Boolean).length; const percent=Math.round(complete/32*100);
return <main><Header/><section className="dashboard shell"><div className="welcome"><span className="eyebrow">STUDENT DASHBOARD</span><h1>{user?.user_metadata?.full_name?`Welcome, ${user.user_metadata.full_name}`:"Welcome to Learn"}</h1><p>{user?"Your progress is connected to your student account.":"You are previewing as a guest. Sign in to sync progress across devices."}</p></div><div className="dashboard-grid"><article className="course-card featured"><div><span className="course-label">FEATURED COURSE</span><h2>Turning Forward: The Work Beyond Fear</h2><p>A structured path from survival mode to clarity, discipline, purpose, and forward momentum.</p><ProgressBar value={percent}/><small>{complete} of 32 course sections complete</small></div><Link className="button" href="/course/turning-forward">{complete?"Continue course":"Start course"}</Link></article><aside className="side-card"><h3>Your next step</h3><p>{p.lesson1?"Continue Module 1 and complete your next section.":"Begin with Module 1: The Decision to Turn Forward."}</p><Link href="/course/turning-forward/module-1">Open Module 1 →</Link></aside></div></section></main>}
