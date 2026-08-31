"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import { modules } from "@/lib/course";
import { loadLocalProgress, ProgressData } from "@/lib/progress";

export default function Course(){const [p,setP]=useState<ProgressData>({}); useEffect(()=>setP(loadLocalProgress()),[]); const m1=[p.lesson1,p.lesson2,p.lesson3,p.challenge].filter(Boolean).length; return <main><Header/><section className="course-hero"><div className="shell"><span className="eyebrow">INTERACTIVE COURSE</span><h1>Turning Forward</h1><p>The Work Beyond Fear</p><ProgressBar value={Math.round(m1/32*100)}/></div></section><section className="shell module-list">{modules.map(m=><article className={`module-card ${!m.available?"locked":""}`} key={m.slug}><div className="module-number">{String(m.number).padStart(2,"0")}</div><div><span>{m.lessons} lessons + challenge</span><h2>{m.title}</h2><p>{m.description}</p>{m.number===1&&<small>{m1} of 4 sections complete</small>}</div>{m.available?<Link className="button secondary" href={`/course/turning-forward/${m.slug}`}>{m1?"Continue":"Begin"}</Link>:<span className="locked-pill">Coming soon</span>}</article>)}</section></main>}
