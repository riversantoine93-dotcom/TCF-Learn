"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { loadCloudProgress, loadLocalProgress, saveCloudProgress, saveLocalProgress, ProgressData } from "@/lib/progress";
import "./completion.css";

const COMPLETE_KEY="m8challenge";
const COMPLETED_AT_KEY="courseCompletedAt";
const REFLECTION_KEYS=["courseFinalReflection1","courseFinalReflection2","courseFinalReflection3"] as const;
const MIN_REFLECTION_CHARS=50;

const finalPrompts=[
  "What has changed in the way you see yourself after completing Turning Forward?",
  "What belief, habit, or weight are you committed to leaving behind?",
  "What is the most important action you will carry forward from this course?",
] as const;

const journey=[
  {number:1,title:"Identity",question:"Who am I becoming?"},
  {number:2,title:"Shame",question:"What do I need to stop carrying?"},
  {number:3,title:"Discipline",question:"What must I consistently do?"},
  {number:4,title:"Narrative",question:"What story will I believe?"},
  {number:5,title:"Accountability",question:"What belongs to me?"},
  {number:6,title:"Relationships",question:"Who belongs around me?"},
  {number:7,title:"Purpose",question:"What am I building?"},
  {number:8,title:"Forward",question:"How will I live from here?"},
] as const;

function responseRequirement(value:string){
  const count=value.trim().length;
  if(count===0)return `Required: write at least ${MIN_REFLECTION_CHARS} characters.`;
  if(count<MIN_REFLECTION_CHARS){const remaining=MIN_REFLECTION_CHARS-count;return `Keep going — ${remaining} more ${remaining===1?"character":"characters"} remaining.`;}
  return "✓ Requirement met";
}

function escapeHtml(value:string){
  return value.replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]||ch));
}

function formatCompletionDate(value:string){
  const date=new Date(value);
  return Number.isNaN(date.getTime())?"Completion date unavailable":date.toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"});
}

function printCertificate(name:string,completedAt:string){
  const win=window.open("","_blank","width=1200,height=850");
  if(!win)return;
  const safeName=escapeHtml(name||"TCF Learn User");
  const safeDate=escapeHtml(formatCompletionDate(completedAt));
  win.document.write(`<!doctype html><html><head><title>Turning Forward Certificate of Completion</title><style>@page{size:landscape;margin:.5in}*{box-sizing:border-box}body{margin:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif}.certificate{min-height:7in;border:12px solid #111;padding:34px 56px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;position:relative}.certificate:before{content:"";position:absolute;inset:14px;border:2px solid #b79a67;pointer-events:none}.brand{font-size:18px;font-weight:900;letter-spacing:.24em}.kicker{margin-top:28px;font-size:13px;font-weight:900;letter-spacing:.22em;color:#8c7249}.title{font-family:Georgia,serif;font-size:52px;margin:12px 0 8px}.presented{font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#666;margin-top:18px}.name{font-family:Georgia,serif;font-size:46px;margin:12px 0;border-bottom:2px solid #b79a67;padding:0 28px 10px}.course{font-size:25px;font-weight:800;margin:22px 0 8px}.detail{max-width:720px;font-size:16px;line-height:1.6;color:#444}.date{margin-top:26px;font-weight:800}.footer{margin-top:26px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#666}.print-actions{max-width:1100px;margin:18px auto}.print-actions button{background:#111;color:#fff;border:0;padding:13px 18px;font-weight:800;cursor:pointer}@media print{.print-actions{display:none}}</style></head><body><div class="print-actions"><button onclick="window.print()">Download / Print Certificate</button></div><main class="certificate"><div class="brand">TCF LEARN</div><div class="kicker">CERTIFICATE OF COMPLETION</div><h1 class="title">You Turned Forward</h1><div class="presented">Presented to</div><div class="name">${safeName}</div><div class="course">Turning Forward: The Work Beyond Fear</div><div class="detail">For completing all eight modules and the full Turning Forward learning experience.</div><div class="date">Completed ${safeDate}</div><div class="footer">TCF Learn · From conversation to transformation</div></main><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`);
  win.document.close();
}

export default function CourseCompletionPage(){
  const {user,loading}=useAuth();
  const [saved,setSaved]=useState<ProgressData>({});
  const [ready,setReady]=useState(false);
  const [sync,setSync]=useState("Loading your completion…");

  useEffect(()=>{
    if(loading)return;
    const local=loadLocalProgress();
    if(!user){setSaved(local);setReady(true);setSync("Saved on this device");return;}
    loadCloudProgress(user.id)
      .then(cloud=>setSaved({...local,...cloud}))
      .catch(()=>setSaved(local))
      .finally(()=>{setReady(true);setSync("Saved to your account")});
  },[user,loading]);

  useEffect(()=>{
    if(!ready||!saved[COMPLETE_KEY]||saved[COMPLETED_AT_KEY])return;
    setSaved(current=>({...current,[COMPLETED_AT_KEY]:new Date().toISOString()}));
  },[ready,saved]);

  useEffect(()=>{
    if(!ready)return;
    saveLocalProgress(saved);
    if(!user){setSync("Saved on this device");return;}
    setSync("Saving…");
    const timer=setTimeout(()=>saveCloudProgress(user.id,saved).then(()=>setSync("Saved to your account")).catch(()=>setSync("Cloud sync unavailable; saved locally")),500);
    return()=>clearTimeout(timer);
  },[saved,user,ready]);

  const reflectionValues=REFLECTION_KEYS.map(key=>String(saved[key]||""));
  const reflectionsComplete=useMemo(()=>reflectionValues.filter(value=>value.trim().length>=MIN_REFLECTION_CHARS).length,[reflectionValues]);
  const completedAt=String(saved[COMPLETED_AT_KEY]||"");
  const displayName=String(user?.user_metadata?.full_name||"TCF Learn User");
  const setReflection=(index:number,value:string)=>setSaved(current=>({...current,[REFLECTION_KEYS[index]]:value}));

  if(!ready)return <main><Header/><section className="course-completion-shell shell"><div className="completion-loading"><span className="eyebrow">TCF LEARN</span><h1>Loading your completion…</h1></div></section></main>;

  if(!saved[COMPLETE_KEY])return <main><Header/><section className="course-completion-shell shell"><div className="completion-guard"><span className="eyebrow">COURSE COMPLETION</span><h1>Finish Module 8 first.</h1><p>Your completion experience unlocks after you finish the Module 8 challenge and pledge.</p><Link className="button" href="/course/turning-forward/module-8">Return to Module 8</Link></div></section></main>;

  return <main><Header/><section className="course-completion-shell shell">
    <section className="completion-hero">
      <span className="eyebrow">COURSE COMPLETE</span>
      <div className="completion-mark" aria-hidden="true">✓</div>
      <h1>YOU TURNED FORWARD</h1>
      <p>You completed the full Turning Forward learning experience. The work was never just about finishing eight modules. It was about choosing what you will carry, what you will release, and how you will live from here.</p>
      <small>{sync}</small>
    </section>

    <section className="completion-stats" aria-label="Course completion summary">
      <div><strong>100%</strong><span>COMPLETE</span></div>
      <div><strong>8</strong><span>MODULES</span></div>
      <div><strong>32</strong><span>SECTIONS</span></div>
    </section>

    <section className="journey-section">
      <span className="eyebrow">THE JOURNEY</span>
      <h2>Eight questions. One direction forward.</h2>
      <p>These are the questions you worked through across Turning Forward.</p>
      <div className="journey-grid">{journey.map(item=><article key={item.number}><span>MODULE {item.number}</span><h3>{item.title}</h3><p>{item.question}</p></article>)}</div>
    </section>

    <section className="final-reflection">
      <div className="section-heading"><div><span className="eyebrow">FINAL REFLECTION</span><h2>Before you leave the course, name what changed.</h2></div><strong>{reflectionsComplete} of 3 complete</strong></div>
      <p>Your responses save with the rest of your Turning Forward progress so you can return to them later.</p>
      <div className="reflection-list">{finalPrompts.map((prompt,index)=>{const value=reflectionValues[index];const complete=value.trim().length>=MIN_REFLECTION_CHARS;const key=REFLECTION_KEYS[index];return <label key={key}><span>{index+1}. {prompt}</span><textarea className="large" value={value} aria-describedby={`${key}-requirement`} onChange={event=>setReflection(index,event.target.value)}/><small id={`${key}-requirement`} className={`response-requirement ${complete?"is-met":"is-pending"}`} aria-live="polite">{responseRequirement(value)}</small></label>})}</div>
    </section>

    <section className="certificate-panel">
      <div className="certificate-copy"><span className="eyebrow">CERTIFICATE OF COMPLETION</span><h2>You earned this.</h2><p>Your certificate recognizes completion of all eight Turning Forward modules and the full course experience.</p><button className="button" type="button" onClick={()=>printCertificate(displayName,completedAt)}>Download / Print Certificate</button></div>
      <div className="certificate-preview" aria-label="Certificate preview"><span>TCF LEARN</span><small>CERTIFICATE OF COMPLETION</small><h3>{displayName}</h3><p>Turning Forward: The Work Beyond Fear</p><strong>{formatCompletionDate(completedAt)}</strong></div>
    </section>

    <section className="completion-next-actions">
      <span className="eyebrow">WHAT COMES NEXT</span>
      <h2>Completion is not the end of the work.</h2>
      <p>Return to your TCF Learn dashboard whenever you want to revisit Turning Forward. New learning experiences will appear there as they become available.</p>
      <div><Link className="button" href="/dashboard">Return to TCF Learn Dashboard</Link><Link className="button secondary" href="/course/turning-forward">Revisit Turning Forward</Link></div>
    </section>
  </section></main>;
}
