"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { loadCloudProgress, loadLocalProgress, saveCloudProgress, saveLocalProgress, ProgressData } from "@/lib/progress";
import { getModuleContent, CourseModuleContent, LessonContent, QuizQuestion } from "@/lib/course-content";
import { moduleOneContent } from "@/lib/module-one-content";

const tabs=["Lesson 1","Lesson 2","Lesson 3","Challenge"] as const;
type Tab=(typeof tabs)[number];

const clearQuizAnswers=(data:ProgressData)=>Object.fromEntries(
  Object.entries(data).filter(([key])=>!/^l\d+q\d+$/.test(key)&&!/^m\d+l\d+q\d+$/.test(key))
) as ProgressData;

const lessonDoneKey=(moduleNumber:number,lessonNumber:number)=>moduleNumber===1?`lesson${lessonNumber}`:`m${moduleNumber}lesson${lessonNumber}`;
const challengeDoneKey=(moduleNumber:number)=>moduleNumber===1?"challenge":`m${moduleNumber}challenge`;
const fieldKey=(moduleNumber:number,lessonNumber:number,id:string)=>moduleNumber===1?id:`m${moduleNumber}l${lessonNumber}${id}`;
const quizKey=(moduleNumber:number,lessonNumber:number,id:string)=>moduleNumber===1?`l${lessonNumber}${id}`:`m${moduleNumber}l${lessonNumber}${id}`;
const challengeFieldKey=(moduleNumber:number,id:string)=>moduleNumber===1?id:`m${moduleNumber}c${id}`;
const pledgeKey=(moduleNumber:number)=>moduleNumber===1?"pledge":`m${moduleNumber}cpledge`;

export default function ModulePage(){
  const params=useParams<{module:string}>();
  const module=params.module==="module-1"?moduleOneContent:getModuleContent(params.module);
  if(!module) return <main><Header/><section className="empty-state"><h1>Module not found.</h1><Link className="button" href="/course/turning-forward">Return to course</Link></section></main>;
  return <InteractiveModule module={module}/>;
}

function InteractiveModule({module}:{module:CourseModuleContent}){
  const [tab,setTab]=useState<Tab>("Lesson 1");
  const [saved,setSaved]=useState<ProgressData>({});
  const [ready,setReady]=useState(false);
  const [sync,setSync]=useState("Saved on this device");
  const {user,loading}=useAuth();

  useEffect(()=>{setTab("Lesson 1");setReady(false)},[module.slug]);
  useEffect(()=>{
    if(loading)return;
    const local=clearQuizAnswers(loadLocalProgress());
    if(!user){setSaved(local);setReady(true);return;}
    loadCloudProgress(user.id).then(cloud=>setSaved(clearQuizAnswers({...local,...cloud}))).catch(()=>setSaved(local)).finally(()=>setReady(true));
  },[user,loading,module.slug]);
  useEffect(()=>{
    if(!ready)return;
    saveLocalProgress(saved);
    if(!user){setSync("Saved on this device");return;}
    setSync("Saving…");
    const t=setTimeout(()=>saveCloudProgress(user.id,saved).then(()=>setSync("Saved to your account")).catch(()=>setSync("Cloud sync unavailable; saved locally")),500);
    return()=>clearTimeout(t);
  },[saved,user,ready]);

  const completionKeys=[1,2,3].map(n=>lessonDoneKey(module.number,n)).concat(challengeDoneKey(module.number));
  const completed=useMemo(()=>completionKeys.filter(key=>Boolean(saved[key])).length,[saved,module.number]);
  const field=(k:string,v:string|boolean)=>setSaved(s=>({...s,[k]:v}));
  const finish=(k:string,next?:Tab)=>{field(k,true);if(next)setTab(next);window.scrollTo({top:0,behavior:"smooth"})};
  const unlocked:Record<Tab,boolean>={
    "Lesson 1":true,
    "Lesson 2":Boolean(saved[lessonDoneKey(module.number,1)]),
    "Lesson 3":Boolean(saved[lessonDoneKey(module.number,2)]),
    "Challenge":Boolean(saved[lessonDoneKey(module.number,3)])
  };

  return <main><Header/><section className="lesson-shell shell">
    <div className="lesson-top"><Link href="/course/turning-forward">← Course overview</Link><span>{completed} of 4 complete · {sync}</span></div>
    <div className="module-banner"><span>MODULE {module.number}</span><h1>{module.title}</h1><p>{module.description}</p></div>
    <div className="tab-row">{tabs.map((t,i)=>{const open=unlocked[t];const key=i<3?lessonDoneKey(module.number,i+1):challengeDoneKey(module.number);return <button key={t} className={tab===t?"selected":""} disabled={!open} aria-disabled={!open} title={open?t:`Complete ${tabs[i-1]} first`} onClick={()=>{if(open)setTab(t)}}><b>{!open?"🔒":saved[key]?"✓":"○"}</b>{t}</button>})}</div>
    {module.lessons.map((lesson,index)=>tab===`Lesson ${lesson.number}`&&<LessonView key={lesson.number} module={module} lesson={lesson} s={saved} f={field} done={()=>finish(lessonDoneKey(module.number,lesson.number),index<2?(`Lesson ${lesson.number+1}` as Tab):"Challenge")}/>) }
    {tab==="Challenge"&&<ChallengeView module={module} s={saved} f={field} done={()=>finish(challengeDoneKey(module.number))}/>} 
  </section></main>;
}

function Video({title}:{title:string}){return <div className="video"><div className="play">▶</div><div><span>VIDEO LESSON</span><h3>{title}</h3><p>Video coming soon. This panel is ready for the lesson embed.</p></div></div>}

function LessonVideo({module,lesson}:{module:CourseModuleContent,lesson:LessonContent}){
  if(module.number===1&&lesson.number===1) return <iframe src="https://player.mux.com/NN9S02p3YoJlnDezTiEKvL02vUOHHay7YlhUtXSQlNnlc" title="Module 1 Lesson 1: The Decision" style={{width:"100%",border:"none",aspectRatio:"16 / 9",display:"block",margin:"18px 0 24px",background:"#000"}} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowFullScreen loading="lazy"/>;
  if(module.number===1&&lesson.number===3) return <iframe src="https://player.mux.com/8B5hbbbYdboc6yek6gDmlqXPRna1x02UlKsD1M00zV8fw" title="Module 1 Lesson 3: Systems Create Stability" style={{width:"100%",border:"none",aspectRatio:"16 / 9",display:"block",margin:"18px 0 24px",background:"#000"}} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowFullScreen loading="lazy"/>;
  return <Video title={lesson.videoTitle}/>;
}

function Quiz({moduleNumber,lessonNumber,items,s,f}:{moduleNumber:number,lessonNumber:number,items:QuizQuestion[],s:ProgressData,f:(k:string,v:string)=>void}){
  return <section className="quiz"><h3>Knowledge Check</h3>{items.map((item,i)=>{
    const key=quizKey(moduleNumber,lessonNumber,item.id);
    const selected=String(s[key]||"");
    const selectedOption=item.options.find(option=>option.text===selected);
    const correct=selected===item.correct;
    return <div className="question" key={key}><strong>{i+1}. {item.prompt}</strong>{item.options.map(option=><label className={`option ${selected===option.text?(option.text===item.correct?"correct":"incorrect"):""}`} key={option.text}><input type="radio" name={key} checked={selected===option.text} onChange={()=>f(key,option.text)}/>{option.text}</label>)}{selectedOption&&<div className={`answer-feedback ${correct?"is-correct":"is-incorrect"}`} role="alert"><b>{correct?"Correct":"Not quite"}</b><p>{selectedOption.feedback}</p></div>}</div>;
  })}</section>;
}

function LessonView({module,lesson,s,f,done}:{module:CourseModuleContent,lesson:LessonContent,s:ProgressData,f:(k:string,v:string|boolean)=>void,done:()=>void}){
  const fieldsComplete=lesson.fields.every(item=>String(s[fieldKey(module.number,lesson.number,item.id)]||"").trim().length>=(item.min??3));
  const quizComplete=lesson.quiz.every(item=>Boolean(s[quizKey(module.number,lesson.number,item.id)]));
  const ok=fieldsComplete&&quizComplete;
  return <article className="lesson-content"><span className="lesson-kicker">LESSON {lesson.number}</span><h2>{lesson.title}</h2><LessonVideo module={module} lesson={lesson}/><p>{lesson.intro}</p><blockquote>{lesson.quote}</blockquote><h3>{lesson.sectionTitle}</h3><p>{lesson.sectionBody}</p><section className="interaction"><h3>{lesson.activityTitle}</h3>{lesson.fields.map(item=>{const key=fieldKey(module.number,lesson.number,item.id);return <label key={key}>{item.label}<textarea className={(item.min??0)>10?"large":""} value={String(s[key]||"")} onChange={e=>f(key,e.target.value)}/></label>})}</section><Quiz moduleNumber={module.number} lessonNumber={lesson.number} items={lesson.quiz} s={s} f={(k,v)=>f(k,v)}/><button className="button full" disabled={!ok} onClick={done}>Complete Lesson {lesson.number} →</button></article>;
}

function escapeHtml(value:string){return value.replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]||ch))}

function saveChallengeAsPdf(module:CourseModuleContent,s:ProgressData){
  const win=window.open("","_blank","width=900,height=1100");
  if(!win)return;
  const items=module.challenge.fields.map(item=>`<section><h2>${escapeHtml(item.label)}</h2><p>${escapeHtml(String(s[challengeFieldKey(module.number,item.id)]||""))}</p></section>`).join("");
  win.document.write(`<!doctype html><html><head><title>My Turning Forward Commitments</title><style>@page{margin:.65in}*{box-sizing:border-box}body{margin:0;color:#0b0b0b;background:#fff;font-family:Arial,Helvetica,sans-serif;line-height:1.5}.sheet{max-width:760px;margin:auto;border-top:12px solid #0b0b0b;padding-top:34px}.kicker{font-size:12px;font-weight:900;letter-spacing:.18em;color:#8c7249;text-transform:uppercase}h1{font-size:42px;line-height:1;text-transform:uppercase;margin:12px 0 10px}header p{color:#6f6a61;margin:0 0 32px}section{border-top:2px solid #d6cfc2;padding:22px 0}section h2{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#8c7249;margin:0 0 8px}section p{font-family:Georgia,serif;font-size:22px;margin:0;white-space:pre-wrap}.pledge{margin-top:24px;background:#f2eee7;border-left:7px solid #b79a67;padding:20px;font-weight:700}footer{margin-top:40px;border-top:1px solid #d6cfc2;padding-top:16px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6f6a61}.print-actions{margin:0 auto 24px;max-width:760px}.print-actions button{background:#0b0b0b;color:#fff;border:0;padding:13px 18px;font-weight:800;cursor:pointer}@media print{.print-actions{display:none}}</style></head><body><div class="print-actions"><button onclick="window.print()">Save / Print PDF</button></div><main class="sheet"><header><span class="kicker">TCF LEARN · TURNING FORWARD</span><h1>My Forward Commitments</h1><p>Module ${module.number} · ${escapeHtml(module.title)}</p></header>${items}<div class="pledge">${escapeHtml(module.challenge.pledge)}</div><footer>Transformation is measured by what you consistently practice.</footer></main><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`);
  win.document.close();
}

function ChallengeView({module,s,f,done}:{module:CourseModuleContent,s:ProgressData,f:(k:string,v:string|boolean)=>void,done:()=>void}){
  const fieldsComplete=module.challenge.fields.every(item=>String(s[challengeFieldKey(module.number,item.id)]||"").trim().length>=3);
  const pledge=pledgeKey(module.number);
  const complete=challengeDoneKey(module.number);
  const ok=fieldsComplete&&Boolean(s[pledge]);
  return <article className="lesson-content"><span className="lesson-kicker">WEEKLY FORWARD CHALLENGE</span><h2>{module.challenge.title}</h2><p>{module.challenge.description}</p><section className="interaction"><h3>My commitments</h3>{module.challenge.fields.map(item=>{const key=challengeFieldKey(module.number,item.id);return <label key={key}>{item.label}<textarea value={String(s[key]||"")} onChange={e=>f(key,e.target.value)}/></label>})}<label className="check"><input type="checkbox" checked={Boolean(s[pledge])} onChange={e=>f(pledge,e.target.checked)}/> {module.challenge.pledge}</label></section>{s[complete]?<div className="completion"><b>✓</b><h3>Module {module.number} complete</h3><p>You completed the lessons and committed to the next forward action.</p><div className="completion-actions"><button className="button" onClick={()=>saveChallengeAsPdf(module,s)}>Save My Commitments as PDF</button><Link className="button secondary" href="/course/turning-forward">Return to course</Link></div></div>:<button className="button full" disabled={!ok} onClick={done}>I Commit to Turning Forward</button>}</article>;
}
