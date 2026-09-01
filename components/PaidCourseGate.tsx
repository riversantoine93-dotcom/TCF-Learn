"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Header from "./Header";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import { loadCloudProgress, loadLocalProgress, ProgressData } from "@/lib/progress";

const moduleCompleteKey=(n:number)=>n===1?"challenge":`m${n}challenge`;
const moduleNumberFromSlug=(slug:string)=>Number(slug.replace("module-",""));
export const previousModuleComplete=(progress:ProgressData,moduleNumber:number)=>moduleNumber<=1||Boolean(progress[moduleCompleteKey(moduleNumber-1)]);

export default function PaidCourseGate({ children, moduleSlug }: { children: ReactNode; moduleSlug: string }) {
  const { user, loading } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [sequenceAllowed,setSequenceAllowed]=useState(false);
  const [checking, setChecking] = useState(true);
  const moduleNumber=moduleNumberFromSlug(moduleSlug);

  useEffect(() => {
    if (loading) return;
    if (!user || !supabase) { setAllowed(false); setSequenceAllowed(false); setChecking(false); return; }
    setChecking(true);
    let cancelled=false;
    (async()=>{
      const {data}=await supabase.from("enrollments").select("id").eq("user_id",user.id).eq("course_slug","turning-forward").eq("active",true).maybeSingle();
      if(!data){if(!cancelled){setAllowed(false);setSequenceAllowed(false);setChecking(false)}return;}
      let progress=loadLocalProgress();
      try{progress={...progress,...await loadCloudProgress(user.id)}}catch{}
      if(!cancelled){setAllowed(true);setSequenceAllowed(previousModuleComplete(progress,moduleNumber));setChecking(false)}
    })();
    return()=>{cancelled=true};
  }, [user, loading, moduleNumber]);

  if (loading || checking) return <main><Header/><section className="empty-state"><h1>Checking course access…</h1></section></main>;
  if (!user) return <main><Header/><section className="empty-state"><span className="eyebrow">PAID COURSE</span><h1>User Login required</h1><p>Turning Forward lesson content is available only to paid users.</p><Link className="button" href="/login">User Login</Link><Link className="button secondary" href="/course/turning-forward">Preview course</Link></section></main>;
  if (!allowed) return <main><Header/><section className="empty-state"><span className="eyebrow">COURSE LOCKED</span><h1>Purchase required</h1><p>This account does not have an active Turning Forward enrollment. Preview the course outline and unlock the course for a one-time $97 payment.</p><Link className="button" href="/course/turning-forward">Preview & unlock — $97</Link></section></main>;
  if (!sequenceAllowed) return <main><Header/><section className="empty-state"><span className="eyebrow">MODULE LOCKED</span><h1>Complete Module {moduleNumber-1} first</h1><p>Turning Forward is designed to be completed in sequence. Finish all three lessons and the challenge in Module {moduleNumber-1} to unlock Module {moduleNumber}.</p><Link className="button" href={`/course/turning-forward/module-${moduleNumber-1}`}>Return to Module {moduleNumber-1}</Link><Link className="button secondary" href="/course/turning-forward">Course overview</Link></section></main>;
  return <>{children}</>;
}
