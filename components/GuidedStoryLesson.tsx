"use client";

import {useEffect,useState} from "react";
import type {GuidedStory} from "@/lib/guided-story-content";
import styles from "./GuidedStoryLesson.module.css";

export default function GuidedStoryLesson({story}:{story:GuidedStory}){
  const [choice,setChoice]=useState<number|null>(null);
  const [notesOpen,setNotesOpen]=useState(false);
  useEffect(()=>{
    if(!notesOpen)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setNotesOpen(false)};
    document.addEventListener("keydown",onKey);
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=previous};
  },[notesOpen]);
  return <section className={styles.story} aria-label="Guided lesson">
    <div className={styles.hook}><span className={styles.blockLabel}>THE HOOK</span><h3>{story.hook.headline}</h3><p>{story.hook.body}</p></div>
    <div className={styles.scenario}><span className={styles.blockLabel}>WHAT WOULD YOU DO?</span><p>{story.scenario.setup}</p><h3>{story.scenario.question}</h3><div className={styles.options}>{story.scenario.options.map((option,index)=><button type="button" key={option.text} className={`${styles.option} ${choice===index?styles.selected:""}`} onClick={()=>setChoice(index)}>{option.text}</button>)}</div>{choice!==null&&<div className={`${styles.feedback} ${story.scenario.options[choice].recommended?styles.recommended:""}`} role="status"><b>{story.scenario.options[choice].recommended?"Strong choice":"Consider this"}</b><p>{story.scenario.options[choice].feedback}</p></div>}</div>
    <button type="button" className={styles.keyNotesTrigger} onClick={()=>setNotesOpen(true)} aria-haspopup="dialog"><span><b>KEY NOTES</b><small>Terms &amp; ideas from this lesson</small></span><span>OPEN +</span></button>
    {notesOpen&&<div className={styles.keyNotesOverlay} onMouseDown={event=>{if(event.target===event.currentTarget)setNotesOpen(false)}}><aside className={styles.keyNotesDrawer} role="dialog" aria-modal="true" aria-label="Key Notes"><header><div><span className={styles.blockLabel}>LESSON REFERENCE</span><h2>KEY NOTES</h2><p>Terms &amp; ideas from this lesson</p></div><button type="button" className={styles.drawerClose} onClick={()=>setNotesOpen(false)} aria-label="Close key notes">×</button></header><div className={styles.keyNotesBody}>{story.teachingCards.map((card,index)=><article className={styles.keyNoteItem} key={card.title}><span>{String(index+1).padStart(2,"0")}</span><div><h3>{card.title}</h3><p>{card.body}</p><small><b>Why it matters:</b> Use this idea to recognize the lesson in real situations and choose a more intentional response.</small></div></article>)}</div><button type="button" className={styles.drawerDone} onClick={()=>setNotesOpen(false)}>Close Key Notes</button></aside></div>}
    <div className={styles.cardsWrap}><span className={styles.blockLabel}>CORE TEACHING</span><div className={styles.grid}>{story.teachingCards.map((card,index)=><article className={styles.card} key={card.title}><small>{String(index+1).padStart(2,"0")}</small><h3>{card.title}</h3><p>{card.body}</p></article>)}</div></div>
    <div className={styles.coach}><span className={styles.blockLabel}>COACH'S VOICE</span><p>{story.coachVoice.text}</p>{story.coachVoice.audioUrl&&<audio controls preload="none" src={story.coachVoice.audioUrl}>Your browser does not support audio playback.</audio>}</div>
    <div className={styles.apply}><span className={styles.blockLabel}>STOP &amp; APPLY</span><h3>Before you move on</h3><p>{story.applyPrompt}</p></div>
  </section>;
}
