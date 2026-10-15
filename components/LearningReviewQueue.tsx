"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {readReviews,reviewDue,reviewStorageKey,type PracticeReview} from '@/lib/learning/microlearning';
export default function LearningReviewQueue({userId,slug}:{userId?:string;slug?:string}){
 const [reviews,setReviews]=useState<PracticeReview[]>([]),[message,setMessage]=useState('');
 useEffect(()=>{if(!userId){setReviews([]);return}try{setReviews(readReviews(localStorage.getItem(reviewStorageKey(userId))))}catch{setReviews([])}},[userId]);
 function remove(review:PracticeReview){if(!userId)return;const next=reviews.filter(r=>r.slug!==review.slug||r.number!==review.number);try{localStorage.setItem(reviewStorageKey(userId),JSON.stringify(next));setReviews(next);setMessage('Practice review removed. Course completion is unchanged.')}catch{setMessage('This browser could not update the saved review.')}}
 const visible=reviews.filter(r=>!slug||r.slug===slug).sort((a,b)=>a.dueAt-b.dueAt);
 if(!visible.length)return null;
 return <section className="micro-review-queue" aria-label="Your optional practice reviews"><h2>Bring a skill back into practice</h2><p>These optional review plans stay on this device. They do not send notifications or affect certificates. Open a lesson, try recalling it before rereading, and adapt your routine to what happened.</p>{visible.map(r=><article key={`${r.slug}:${r.number}`}><div><small>{reviewDue(r)?'Ready to revisit':'Planned for '+new Date(r.dueAt).toLocaleDateString()}</small><h3>{r.title}</h3><p>{r.prompt}</p><details><summary>Your practice plan</summary><p>{r.plan}</p></details></div><div><Link className="learn-button secondary" href={`/learn/${r.slug}/${r.number}?step=transfer`}>Revisit &amp; practice →</Link><button className="micro-text-button" onClick={()=>remove(r)} type="button">Remove review</button></div></article>)}{message&&<p role="status">{message}</p>}</section>;
}
