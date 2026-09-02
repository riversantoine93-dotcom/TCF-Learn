"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import CoursePurchaseOptions from "@/components/CoursePurchaseOptions";
import { useAuth } from "@/components/AuthProvider";
import { modules } from "@/lib/course";
import { loadCloudProgress, loadLocalProgress, ProgressData } from "@/lib/progress";
import { supabase } from "@/lib/supabase";

const moduleCompleteKey=(n:number)=>n===1?"challenge":`m${n}challenge`;
const moduleSectionKeys=(n:number)=>n===1?["lesson1","lesson2","lesson3","challenge"]:[`m${n}lesson1`,`m${n}lesson2`,`m${n}lesson3`,`m${n}challenge`];
const moduleIsComplete=(p:ProgressData,n:number)=>Boolean(p[moduleCompleteKey(n)]);
const moduleProgress=(p:ProgressData,n:number)=>moduleSectionKeys(n).filter(k=>Boolean(p[k])).length;

export default function Course(){
 const [p,setP]=useState<ProgressData>({}); const [enrolled,setEnrolled]=useState(false); const [checking,setChecking]=useState(true); const {user,loading}=useAuth();
 useEffect(()=>setP(loadLocalProgress()),[]);
 useEffect(()=>{if(loading)return;if(!user||!supabase){setEnrolled(false);setChecking(false);return;}setChecking(true);let cancelled=false;(async()=>{const {data}=await supabase.from("enrollments").select("id").eq("user_id",user.id).eq("course_slug","turning-forward").eq("active",true).maybeSingle();if(data){try{const cloud=await loadCloudProgress(user.id);if(!cancelled)setP({...loadLocalProgress(),...cloud})}catch{}}if(!cancelled){setEnrolled(Boolean(data));setChecking(false)}})();return()=>{cancelled=true}},[user,loading]);
 const completedSections=modules.reduce((total,m)=>total+moduleProgress(p,m.number),0);
 return <main><Header/><section className="course-hero"><div className="shell"><span className="eyebrow">INTERACTIVE COURSE</span><h1>Turning Forward</h1><p>The Work Beyond Fear</p>{enrolled?<ProgressBar value={Math.round(completedSections/32*100)}/>:<div className="notice">Preview all 8 modules below. Full course access is a one-time $97 purchase.</div>}</div></section><section className="shell module-list">{modules.map(m=>{const open=enrolled&&(m.number===1||moduleIsComplete(p,m.number-1));const count=moduleProgress(p,m.number);return <article className="module-card" key={m.slug}><div className="module-number">{String(m.number).padStart(2,"0")}</div><div><span>{m.lessons} lessons + challenge</span><h2>{m.title}</h2><p>{m.description}</p>{enrolled&&open&&<small>{count} of 4 sections complete</small>}{enrolled&&!open&&<small>🔒 Complete Module {m.number-1} to unlock</small>}</div>{!enrolled?<span className="locked-pill">Preview</span>:open?<Link className="button secondary" href={`/course/turning-forward/${m.slug}`}>{count?"Continue":"Begin"}</Link>:<span className="locked-pill">Locked</span>}</article>})}</section>{!checking&&!enrolled&&<section className="shell" style={{paddingBottom:"64px"}}><h2 style={{textAlign:"center"}}>Choose your access</h2><p style={{textAlign:"center"}}>Buy Turning Forward by itself, or save $48.50 when you unlock both TCF Learn courses together.</p><CoursePurchaseOptions course="turning-forward"/>{user&&<p style={{textAlign:"center"}}><small>You are signed in, but this account does not currently have an active Turning Forward enrollment.</small></p>}</section>}</main>
}
