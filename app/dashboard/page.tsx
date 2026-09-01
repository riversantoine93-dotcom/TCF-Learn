"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/components/AuthProvider";
import { loadCloudProgress, loadLocalProgress, ProgressData } from "@/lib/progress";

const courseCatalog=[
  {slug:"turning-forward",title:"Turning Forward: The Work Beyond Fear",description:"A structured path from survival mode to clarity, discipline, purpose, and forward momentum.",status:"available" as const,href:"/course/turning-forward"},
  {slug:"from-thought-to-freedom",title:"From Thought to Freedom",subtitle:"Correcting Criminal Thinking Errors",description:"A practical course for identifying criminal thinking patterns, challenging distorted beliefs, and developing healthier decision-making habits.",status:"coming-soon" as const,release:"DECEMBER 2026"}
];

export default function Dashboard(){
  const {user,loading}=useAuth();
  const [p,setP]=useState<ProgressData>({});
  useEffect(()=>{if(loading)return;const local=loadLocalProgress();if(!user){setP(local);return;}loadCloudProgress(user.id).then(cloud=>setP({...local,...cloud})).catch(()=>setP(local));},[user,loading]);
  const complete=[p.lesson1,p.lesson2,p.lesson3,p.challenge].filter(Boolean).length;
  const percent=Math.round(complete/32*100);
  return <main><Header/><section className="dashboard shell">
    <div className="welcome"><span className="eyebrow">TCF LEARN COURSE HUB</span><h1>{user?.user_metadata?.full_name?`Welcome, ${user.user_metadata.full_name}`:"Welcome to TCF Learn"}</h1><p>{user?"Your learning hub brings your courses and progress together in one place.":"Explore the TCF LEARN course library. Sign in to sync enrolled-course progress across devices."}</p></div>
    <div style={{margin:"34px 0 16px"}}><span className="eyebrow">MY COURSES / COURSE LIBRARY</span><h2 style={{fontSize:"clamp(30px,5vw,48px)",margin:"8px 0 6px"}}>KEEP LEARNING. KEEP MOVING FORWARD.</h2><p style={{maxWidth:760,margin:0}}>Your dashboard is the home for current and future TCF LEARN courses. Continue what you have started and see what is coming next.</p></div>
    <div className="dashboard-grid" style={{alignItems:"stretch"}}>
      {courseCatalog.map(course=>course.status==="available"?<article className="course-card featured" key={course.slug}><div><span className="course-label">ENROLLED · {complete?"IN PROGRESS":"READY TO START"}</span><h2>{course.title}</h2><p>{course.description}</p><ProgressBar value={percent}/><small>{complete} of 32 course sections complete</small></div><Link className="button" href={course.href}>{complete?"Continue Course":"Start Course"}</Link></article>:<article className="course-card" key={course.slug} style={{border:"2px solid #b79a67",background:"#0b0b0b",color:"#fbf8f2"}}><div><span className="course-label" style={{color:"#d9c7a5"}}>COMING SOON · {course.release}</span><h2 style={{color:"#fbf8f2"}}>{course.title}</h2><h3 style={{color:"#d9c7a5",marginTop:-8}}>{course.subtitle}</h3><p style={{color:"#f2eee7"}}>{course.description}</p></div><div className="button" aria-disabled="true" style={{opacity:.65,cursor:"default",textAlign:"center"}}>Coming December 2026</div></article>)}
    </div>
    <aside className="side-card" style={{marginTop:24}}><h3>Your next step</h3><p>{p.lesson1?"Continue Turning Forward and complete your next section.":"Begin Turning Forward with Module 1: The Decision to Turn Forward."}</p><Link href="/course/turning-forward/module-1">Open Turning Forward →</Link></aside>
  </section></main>
}
