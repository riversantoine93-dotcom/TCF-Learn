"use client";

import {useState} from "react";
import type {GuidedStory} from "@/lib/guided-story-content";
import styles from "./GuidedStoryLesson.module.css";

export default function GuidedStoryLesson({story}:{story:GuidedStory}){
  const [choice,setChoice]=useState<number|null>(null);
  return <section className={styles.story} aria-label="Guided lesson">
    <div className={styles.hook}><span className={styles.blockLabel}>THE HOOK</span><h3>{story.hook.headline}</h3><p>{story.hook.body}</p></div>
    <div className={styles.scenario}><span className={styles.blockLabel}>WHAT WOULD YOU DO?</span><p>{story.scenario.setup}</p><h3>{story.scenario.question}</h3><div className={styles.options}>{story.scenario.options.map((option,index)=><button type="button" key={option.text} className={`${styles.option} ${choice===index?styles.selected:""}`} onClick={()=>setChoice(index)}>{option.text}</button>)}</div>{choice!==null&&<div className={`${styles.feedback} ${story.scenario.options[choice].recommended?styles.recommended:""}`} role="status"><b>{story.scenario.options[choice].recommended?"Strong choice":"Consider this"}</b><p>{story.scenario.options[choice].feedback}</p></div>}</div>
    <div className={styles.cardsWrap}><span className={styles.blockLabel}>CORE TEACHING</span><div className={styles.grid}>{story.teachingCards.map((card,index)=><article className={styles.card} key={card.title}><small>{String(index+1).padStart(2,"0")}</small><h3>{card.title}</h3><p>{card.body}</p></article>)}</div></div>
    <div className={styles.coach}><span className={styles.blockLabel}>COACH'S VOICE</span><p>{story.coachVoice.text}</p>{story.coachVoice.audioUrl&&<audio controls preload="none" src={story.coachVoice.audioUrl}>Your browser does not support audio playback.</audio>}</div>
    <div className={styles.apply}><span className={styles.blockLabel}>STOP &amp; APPLY</span><h3>Before you move on</h3><p>{story.applyPrompt}</p></div>
  </section>;
}
