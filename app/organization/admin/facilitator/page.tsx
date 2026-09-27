"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import "./facilitator.css";

type CourseSlug="turning-forward"|"thought-to-freedom";

type Guide={
  id:string;
  courseSlug:CourseSlug;
  courseTitle:string;
  moduleNumber:number;
  moduleTitle:string;
  lessonNumber:number;
  lessonTitle:string;
  overview:string;
  facilitationGoal:string;
  discussionPoints:string[];
  facilitatorNotes:string[];
  script:{
    opening:string;
    teaching:string;
    discussion:string;
    activity:string;
    closing:string;
  };
};

export default function FacilitatorGuidePage(){
  const [course,setCourse]=useState<CourseSlug>("turning-forward");
  const [guides,setGuides]=useState<Guide[]>([]);
  const [selectedId,setSelectedId]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);

  async function authHeaders(){
    if(!supabase)return null;
    const {data:{session}}=await supabase.auth.getSession();
    return session?.access_token?{Authorization:"Bearer "+session.access_token}:null;
  }

  async function load(nextCourse:CourseSlug){
    setLoading(true);
    setMessage("");
    const headers=await authHeaders();
    if(!headers){
      window.location.href="/login?mode=admin";
      return;
    }

    const res=await fetch("/api/organization/facilitator-guides?course="+encodeURIComponent(nextCourse),{
      headers,
      cache:"no-store",
    });
    const body=await res.json().catch(()=>({}));

    if(!res.ok){
      setMessage(body.error||"Unable to load facilitator guides.");
      setGuides([]);
      setLoading(false);
      return;
    }

    const nextGuides=body.guides||[];
    setGuides(nextGuides);
    setSelectedId(nextGuides[0]?.id||"");
    setLoading(false);
  }

  useEffect(()=>{load(course)},[course]);

  const modules=useMemo(()=>{
    const map=new Map<number,string>();
    for(const guide of guides)map.set(guide.moduleNumber,guide.moduleTitle);
    return Array.from(map.entries()).map(([number,title])=>({number,title}));
  },[guides]);

  const selected=guides.find(guide=>guide.id===selectedId)||guides[0]||null;
  const moduleGuides=selected
    ?guides.filter(guide=>guide.moduleNumber===selected.moduleNumber)
    :[];

  function chooseModule(moduleNumber:number){
    const first=guides.find(guide=>guide.moduleNumber===moduleNumber);
    if(first)setSelectedId(first.id);
  }

  return <main>
    <Header/>
    <section className="facilitator-page">
      <div className="facilitator-heading">
        <div>
          <span className="eyebrow">ADMIN / CO-ADMIN ONLY</span>
          <h1>Facilitator Guide</h1>
          <p>Lesson overviews, discussion prompts, and word-for-word language for live classes and group discussions.</p>
        </div>
        <Link className="button" href="/organization/admin">Back to Admin Dashboard</Link>
      </div>

      <div className="facilitator-safety-note">
        <strong>Facilitation standard</strong>
        <span>Invite reflection without forcing disclosure. Keep accountability separate from shame. Learner written responses remain private.</span>
      </div>

      <div className="facilitator-course-tabs" role="tablist" aria-label="Choose course">
        <button className={course==="turning-forward"?"active":""} onClick={()=>setCourse("turning-forward")}>Turning Forward</button>
        <button className={course==="thought-to-freedom"?"active":""} onClick={()=>setCourse("thought-to-freedom")}>Thought to Freedom</button>
      </div>

      {message&&<div className="notice">{message}</div>}
      {loading&&<div className="notice">Loading facilitator material…</div>}

      {!loading&&selected&&<div className="facilitator-layout">
        <aside className="facilitator-nav">
          <label>
            Module
            <select value={selected.moduleNumber} onChange={event=>chooseModule(Number(event.target.value))}>
              {modules.map(module=><option key={module.number} value={module.number}>
                {module.number===0?"Orientation":"Module "+module.number}: {module.title}
              </option>)}
            </select>
          </label>

          <div className="facilitator-lesson-list">
            {moduleGuides.map(guide=><button
              type="button"
              key={guide.id}
              className={guide.id===selected.id?"active":""}
              onClick={()=>setSelectedId(guide.id)}
            >
              <small>{guide.lessonNumber===0?"Orientation":"Lesson "+guide.lessonNumber}</small>
              <strong>{guide.lessonTitle}</strong>
            </button>)}
          </div>
        </aside>

        <article className="facilitator-guide">
          <header className="facilitator-guide-header">
            <span>{selected.courseTitle} · {selected.moduleNumber===0?"Orientation":"Module "+selected.moduleNumber}</span>
            <h2>{selected.lessonTitle}</h2>
            <p>{selected.moduleTitle}</p>
          </header>

          <section className="facilitator-card">
            <span className="facilitator-label">LESSON OVERVIEW</span>
            <p>{selected.overview}</p>
          </section>

          <section className="facilitator-card">
            <span className="facilitator-label">FACILITATION GOAL</span>
            <p>{selected.facilitationGoal}</p>
          </section>

          <section className="facilitator-card">
            <span className="facilitator-label">DISCUSSION POINTS</span>
            <ol className="discussion-list">
              {selected.discussionPoints.map((point,index)=><li key={index}>{point}</li>)}
            </ol>
          </section>

          <section className="facilitator-card facilitator-notes-card">
            <span className="facilitator-label">FACILITATOR NOTES</span>
            <ul>
              {selected.facilitatorNotes.map((note,index)=><li key={index}>{note}</li>)}
            </ul>
          </section>

          <section className="facilitator-script-section">
            <div className="script-heading">
              <div>
                <span className="facilitator-label">WORD-FOR-WORD FACILITATION SCRIPT</span>
                <h3>Use as written or adapt to your voice.</h3>
              </div>
            </div>

            {([
              ["Opening",selected.script.opening],
              ["Teaching / Framing",selected.script.teaching],
              ["Group Discussion",selected.script.discussion],
              ["Activity / Practice",selected.script.activity],
              ["Closing",selected.script.closing],
            ] as const).map(([title,text])=><div className="script-block" key={title}>
              <div className="script-block-title">
                <strong>{title}</strong>
                <button type="button" className="secondary" onClick={()=>navigator.clipboard.writeText(text)}>Copy</button>
              </div>
              {text.split("\n\n").map((paragraph,index)=><p key={index}>{paragraph}</p>)}
            </div>)}
          </section>
        </article>
      </div>}
    </section>
  </main>;
}
