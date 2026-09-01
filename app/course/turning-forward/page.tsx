"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/components/AuthProvider";
import { modules } from "@/lib/course";
import { loadLocalProgress, ProgressData } from "@/lib/progress";
import { supabase } from "@/lib/supabase";

export default function Course(){
 const [p,setP]=useState<ProgressData>({}); const [enrolled,setEnrolled]=useState(false); const [checking,setChecking]=useState(true); const [buying,setBuying]=useState(false); const {user,loading}=useAuth();
 useEffect(()=>setP(loadLocalProgress()),[]);
 useEffect(()=>{if(loading)return;if(!user||!supabase){setEnrolled(false);setChecking(false);return;}setChecking(true);let cancelled=false;(async()=>{const {data}=await supabase.from("enrollments").select("id").eq("user_id",user.id).eq("course_slug","turning-forward").eq("active",true).maybeSingle();if(!cancelled){setEnrolled(Boolean(data));setChecking(false)}})();return()=>{cancelled=true}},[user,loading]);
 const m1=[p.lesson1,p.lesson2,p.lesson3,p.challenge].filter(Boolean).length;
 async function checkout(){setBuying(true);try{const res=await fetch("/api/checkout",{method:"POST"});const data=await res.json();if(!res.ok||!data.url)throw new Error(data.error||"Checkout unavailable.");window.location.href=data.url;}catch(e){alert(e instanceof Error?e.message:"Checkout unavailable.");setBuying(false)}}
 return <main><Header/><section className="course-hero"><div className="shell"><span className="eyebrow">INTERACTIVE COURSE</span><h1>Turning Forward</h1><p>The Work Beyond Fear</p>{enrolled?<ProgressBar value={Math.round(m1/32*100)}/>:<div className="notice">Preview all 8 modules below. Full course access is a one-time $97 purchase.</div>}</div></section><section className="shell module-list">{modules.map(m=><article className="module-card" key={m.slug}><div className="module-number">{String(m.number).padStart(2,"0")}</div><div><span>{m.lessons} lessons + challenge</span><h2>{m.title}</h2><p>{m.description}</p>{enrolled&&m.number===1&&<small>{m1} of 4 sections complete</small>}</div>{enrolled?<Link className="button secondary" href={`/course/turning-forward/${m.slug}`}>{m1?"Continue":"Begin"}</Link>:<span className="locked-pill">Preview</span>}</article>)}</section>{!checking&&!enrolled&&<section className="shell" style={{paddingBottom:"64px",textAlign:"center"}}><h2>Ready to turn forward?</h2><p>One payment. Full access to all 8 modules, lessons, activities, challenges, and progress tracking.</p><button className="button" onClick={checkout} disabled={buying}>{buying?"Opening secure checkout…":"Unlock Full Course — $97"}</button>{user&&<p><small>You are signed in, but this account does not currently have an active Turning Forward enrollment.</small></p>}</section>}</main>
}
