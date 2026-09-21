"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import "./organization-admin.css";

type Member={
  id:string;
  user_id:string|null;
  email:string;
  full_name:string|null;
  role:"admin"|"co_admin"|"learner";
  status:string;
  invited_at:string;
  accepted_at:string|null;
};

type ProgressStatus="complete"|"in_progress"|"not_started";

type ProgressItem={
  key:string;
  label:string;
  status:ProgressStatus;
};

type ProgressModule={
  number:number;
  title:string;
  completed:number;
  total:number;
  introWatched?:boolean;
  items:ProgressItem[];
};

type CourseProgress={
  courseSlug:"turning-forward"|"thought-to-freedom";
  title:string;
  completed:number;
  total:number;
  percent:number;
  status:ProgressStatus;
  currentItem:string|null;
  lastActivity:string|null;
  modules:ProgressModule[];
};

type LearnerProgress={
  userId:string;
  completed:number;
  total:number;
  percent:number;
  status:ProgressStatus;
  lastActivity:string|null;
  courses:CourseProgress[];
};

type Overview={
  organization:any;
  adminRole:"admin"|"co_admin";
  members:Member[];
  progressSummaries:LearnerProgress[];
  refreshedAt:string;
};

const statusLabel:Record<ProgressStatus,string>={
  complete:"Complete",
  in_progress:"In Progress",
  not_started:"Not Started",
};

function formatActivity(value:string|null){
  if(!value)return "No activity yet";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return "No activity yet";
  return date.toLocaleString([],{
    month:"short",
    day:"numeric",
    year:date.getFullYear()===new Date().getFullYear()?undefined:"numeric",
    hour:"numeric",
    minute:"2-digit",
  });
}

function courseBySlug(summary:LearnerProgress|undefined,slug:CourseProgress["courseSlug"]){
  return summary?.courses.find(course=>course.courseSlug===slug);
}

function ProgressBar({percent}:{percent:number}){
  return <div className="org-progress-track" aria-label={percent+"% complete"}>
    <span style={{width:Math.max(0,Math.min(100,percent))+"%"}}/>
  </div>;
}

function StatusPill({status}:{status:ProgressStatus}){
  return <span className={"org-status-pill status-"+status}>{statusLabel[status]}</span>;
}

export default function OrganizationAdmin(){
  const [data,setData]=useState<Overview|null>(null);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [email,setEmail]=useState("");
  const [fullName,setFullName]=useState("");
  const [role,setRole]=useState<"learner"|"co_admin">("learner");
  const [inviteUrl,setInviteUrl]=useState("");
  const [expanded,setExpanded]=useState<string|null>(null);
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState<"all"|ProgressStatus>("all");
  const [liveState,setLiveState]=useState<"connecting"|"live"|"fallback">("connecting");
  const loadingRef=useRef(false);

  async function authHeaders(){
    if(!supabase)return null;
    const {data:{session}}=await supabase.auth.getSession();
    if(!session?.access_token)return null;
    return {Authorization:"Bearer "+session.access_token};
  }

  async function load(options?:{silent?:boolean}){
    if(loadingRef.current)return;
    loadingRef.current=true;
    if(!options?.silent)setMessage("");
    try{
      const headers=await authHeaders();
      if(!headers){
        if(!options?.silent)setMessage("Sign in to manage your organization.");
        return;
      }
      const res=await fetch("/api/organization/overview",{headers,cache:"no-store"});
      const body=await res.json().catch(()=>({}));
      if(!res.ok){
        if(!options?.silent)setMessage(body.error||"Unable to load organization.");
        return;
      }
      setData(body);
    } finally {
      loadingRef.current=false;
    }
  }

  useEffect(()=>{load()},[]);

  useEffect(()=>{
    if(!supabase||!data?.organization?.id)return;

    const channel=supabase
      .channel("organization-progress-"+data.organization.id)
      .on(
        "postgres_changes",
        {event:"*",schema:"public",table:"course_progress"},
        ()=>load({silent:true})
      )
      .subscribe(status=>{
        if(status==="SUBSCRIBED")setLiveState("live");
        if(status==="CHANNEL_ERROR"||status==="TIMED_OUT")setLiveState("fallback");
      });

    const fallback=window.setInterval(()=>load({silent:true}),15000);
    return ()=>{
      window.clearInterval(fallback);
      supabase.removeChannel(channel);
    };
  },[data?.organization?.id]);

  async function invite(e:FormEvent){
    e.preventDefault();
    if(!data)return;
    setBusy(true);
    setMessage("");
    setInviteUrl("");
    try{
      const headers=await authHeaders();
      if(!headers)throw new Error("Sign in again.");
      const res=await fetch("/api/organization/invite",{
        method:"POST",
        headers:{...headers,"Content-Type":"application/json"},
        body:JSON.stringify({organizationId:data.organization.id,email,fullName,role}),
      });
      const body=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(body.error||"Unable to create invitation.");
      setInviteUrl(body.inviteUrl);
      setEmail("");
      setFullName("");
      await load();
    }catch(error){
      setMessage(error instanceof Error?error.message:"Unable to create invitation.");
    }finally{
      setBusy(false);
    }
  }

  async function remove(memberId:string){
    if(!data)return;
    const headers=await authHeaders();
    if(!headers)return;
    const res=await fetch("/api/organization/remove",{
      method:"POST",
      headers:{...headers,"Content-Type":"application/json"},
      body:JSON.stringify({organizationId:data.organization.id,membershipId:memberId}),
    });
    const body=await res.json().catch(()=>({}));
    if(!res.ok){
      setMessage(body.error||"Unable to remove member.");
      return;
    }
    await load();
  }

  const learnerCount=data?.members.filter(m=>m.role==="learner"&&m.status!=="removed").length||0;
  const adminCount=data?.members.filter(m=>m.role==="admin"&&m.status!=="removed").length||0;
  const coAdminCount=data?.members.filter(m=>m.role==="co_admin"&&m.status!=="removed").length||0;

  const progressByUser=useMemo(()=>{
    const map=new Map<string,LearnerProgress>();
    for(const row of data?.progressSummaries||[])map.set(row.userId,row);
    return map;
  },[data]);

  const learners=useMemo(()=>{
    const rows=(data?.members||[]).filter(member=>member.role==="learner"&&member.status!=="removed");
    return rows.filter(member=>{
      const summary=member.user_id?progressByUser.get(member.user_id):undefined;
      const matchesQuery=!query.trim()||
        (member.full_name||"").toLowerCase().includes(query.toLowerCase())||
        member.email.toLowerCase().includes(query.toLowerCase());
      const matchesFilter=filter==="all"||(summary?.status||"not_started")===filter;
      return matchesQuery&&matchesFilter;
    });
  },[data,progressByUser,query,filter]);

  const activeSummaries=(data?.members||[])
    .filter(member=>member.role==="learner"&&member.status==="active"&&member.user_id)
    .map(member=>progressByUser.get(member.user_id!))
    .filter(Boolean) as LearnerProgress[];

  const averagePercent=activeSummaries.length
    ?Math.round(activeSummaries.reduce((sum,row)=>sum+row.percent,0)/activeSummaries.length)
    :0;
  const completeLearners=activeSummaries.filter(row=>row.status==="complete").length;
  const startedLearners=activeSummaries.filter(row=>row.status==="in_progress").length;
  const notStartedLearners=learnerCount-completeLearners-startedLearners;

  return <main>
    <Header/>
    <section className="organization-admin-page">
      <div className="organization-admin-heading">
        <div>
          <span className="eyebrow">ORGANIZATION ADMIN</span>
          <h1>{data?.organization?.name||"TCF Learn Organization"}</h1>
          <p>Manage seats and track learner completion across both TCF Learn courses without viewing private written responses.</p>
        </div>
        <div className="organization-admin-heading-actions">
          <div className={"live-indicator live-"+liveState}>
            <span/>
            {liveState==="live"?"Live progress":liveState==="fallback"?"Auto-refreshing":"Connecting…"}
          </div>
          <Link className="button" href="/dashboard">Learner Dashboard</Link>
        </div>
      </div>

      {message&&<div className="notice organization-admin-notice">{message}</div>}

      {data&&<>
        <div className="organization-license-grid">
          <article><small>LEARNER LICENSES</small><h2>{learnerCount} / {data.organization.seat_limit}</h2><p>Admin accounts do not use learner seats.</p></article>
          <article><small>PRIMARY ADMIN</small><h2>{adminCount} / {data.organization.admin_license_limit||1}</h2></article>
          <article><small>CO-ADMINS</small><h2>{coAdminCount} / {data.organization.co_admin_limit}</h2></article>
          <article><small>AVERAGE COMPLETION</small><h2>{averagePercent}%</h2><ProgressBar percent={averagePercent}/></article>
        </div>

        <div className="organization-progress-summary">
          <div><b>{completeLearners}</b><span>Completed both courses</span></div>
          <div><b>{startedLearners}</b><span>In progress</span></div>
          <div><b>{Math.max(0,notStartedLearners)}</b><span>Not started</span></div>
          <div><b>63</b><span>Required completion points</span></div>
        </div>

        <details className="organization-invite-panel">
          <summary>Assign learner or co-admin access</summary>
          <form onSubmit={invite}>
            <label>Name<input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Learner or co-admin name"/></label>
            <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
            <label>Role<select value={role} onChange={e=>setRole(e.target.value as "learner"|"co_admin")}>
              <option value="learner">Learner</option>
              {data.adminRole==="admin"&&data.organization.co_admin_limit>0&&<option value="co_admin">Co-admin</option>}
            </select></label>
            <button className="button full" disabled={busy}>{busy?"Creating invitation…":"Create invitation"}</button>
            {inviteUrl&&<div className="notice"><strong>Invitation link</strong><br/><a href={inviteUrl}>{inviteUrl}</a></div>}
          </form>
        </details>

        <section className="learner-progress-section">
          <div className="learner-progress-header">
            <div>
              <span className="eyebrow">LEARNER PROGRESS</span>
              <h2>Completion Tracker</h2>
              <p>Changes appear automatically as learners save course progress.</p>
            </div>
            <div className="progress-tools">
              <input
                type="search"
                placeholder="Search learner…"
                value={query}
                onChange={event=>setQuery(event.target.value)}
                aria-label="Search learners"
              />
              <select value={filter} onChange={event=>setFilter(event.target.value as typeof filter)} aria-label="Filter by progress status">
                <option value="all">All learners</option>
                <option value="in_progress">In progress</option>
                <option value="complete">Complete</option>
                <option value="not_started">Not started</option>
              </select>
              <button type="button" className="secondary" onClick={()=>load({silent:true})}>Refresh</button>
            </div>
          </div>

          <div className="learner-progress-list">
            {learners.length===0&&<div className="empty-progress-state">No learners match this view.</div>}
            {learners.map(member=>{
              const summary=member.user_id?progressByUser.get(member.user_id):undefined;
              const status=summary?.status||"not_started";
              const turning=courseBySlug(summary,"turning-forward");
              const thought=courseBySlug(summary,"thought-to-freedom");
              const isOpen=expanded===member.id;

              return <article className="learner-progress-card" key={member.id}>
                <div className="learner-progress-row">
                  <div className="learner-identity">
                    <div className="learner-avatar">{(member.full_name||member.email).slice(0,1).toUpperCase()}</div>
                    <div>
                      <h3>{member.full_name||"Learner"}</h3>
                      <p>{member.email}</p>
                      {member.status!=="active"&&<span className="membership-state">{member.status}</span>}
                    </div>
                  </div>

                  <div className="overall-progress-cell">
                    <div className="progress-cell-top">
                      <StatusPill status={status}/>
                      <strong>{summary?.percent||0}%</strong>
                    </div>
                    <ProgressBar percent={summary?.percent||0}/>
                    <small>{summary?.completed||0} of {summary?.total||63} completion points</small>
                  </div>

                  <div className="course-progress-cell">
                    <span>Turning Forward</span>
                    <strong>{turning?.percent||0}%</strong>
                    <small>{turning?.completed||0} / {turning?.total||32}</small>
                  </div>

                  <div className="course-progress-cell">
                    <span>Thought to Freedom</span>
                    <strong>{thought?.percent||0}%</strong>
                    <small>{thought?.completed||0} / {thought?.total||31}</small>
                  </div>

                  <div className="last-activity-cell">
                    <span>Last activity</span>
                    <strong>{formatActivity(summary?.lastActivity||null)}</strong>
                  </div>

                  <button
                    type="button"
                    className="progress-detail-button"
                    onClick={()=>setExpanded(isOpen?null:member.id)}
                    aria-expanded={isOpen}
                  >
                    {isOpen?"Hide details":"View details"}
                  </button>
                </div>

                {isOpen&&<div className="learner-progress-details">
                  {!member.user_id||!summary?<div className="empty-progress-state">This learner has not activated their account yet.</div>:summary.courses.map(course=>
                    <section className="course-detail-card" key={course.courseSlug}>
                      <div className="course-detail-heading">
                        <div>
                          <span>{course.title}</span>
                          <h4>{course.percent}% complete</h4>
                          <p>{course.currentItem?<>Current / next: <strong>{course.currentItem}</strong></>:"Course complete"}</p>
                        </div>
                        <div className="course-detail-score">
                          <StatusPill status={course.status}/>
                          <b>{course.completed} / {course.total}</b>
                        </div>
                      </div>
                      <ProgressBar percent={course.percent}/>

                      <div className="module-progress-grid">
                        {course.modules.map(module=>
                          <article className="module-progress-card" key={course.courseSlug+"-"+module.number}>
                            <div className="module-progress-title">
                              <span>{module.number===0?"Orientation":"Module "+module.number}</span>
                              <b>{module.completed}/{module.total}</b>
                            </div>
                            <h5>{module.title}</h5>
                            {typeof module.introWatched==="boolean"&&
                              <div className={"module-intro-state "+(module.introWatched?"watched":"not-watched")}>
                                <span>{module.introWatched?"✓":"○"}</span>
                                Module introduction {module.introWatched?"watched":"not completed"}
                              </div>
                            }
                            <ul>
                              {module.items.map(item=><li key={item.key} className={"item-"+item.status}>
                                <span className="item-status-icon">{item.status==="complete"?"✓":item.status==="in_progress"?"◐":"○"}</span>
                                <span>{item.label}</span>
                                <small>{statusLabel[item.status]}</small>
                              </li>)}
                            </ul>
                          </article>
                        )}
                      </div>
                    </section>
                  )}

                  <div className="learner-admin-actions">
                    {member.role!=="admin"&&<button type="button" className="secondary" onClick={()=>remove(member.id)}>Remove learner access</button>}
                  </div>
                </div>}
              </article>
            })}
          </div>

          <div className="progress-footer-note">
            <span>Last dashboard sync: {formatActivity(data.refreshedAt)}</span>
            <span>Written reflections and quiz answers remain private to the learner.</span>
          </div>
        </section>
      </>}
    </section>
  </main>;
}
