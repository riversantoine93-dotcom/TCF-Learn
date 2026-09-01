"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Header from "./Header";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";

export default function PaidCourseGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || !supabase) { setAllowed(false); setChecking(false); return; }
    setChecking(true);
    supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_slug", "turning-forward").eq("active", true).maybeSingle()
      .then(({ data }) => setAllowed(Boolean(data)))
      .finally(() => setChecking(false));
  }, [user, loading]);

  if (loading || checking) return <main><Header/><section className="empty-state"><h1>Checking course access…</h1></section></main>;
  if (!user) return <main><Header/><section className="empty-state"><span className="eyebrow">PAID COURSE</span><h1>User Login required</h1><p>Turning Forward lesson content is available only to paid users.</p><Link className="button" href="/login">User Login</Link><Link className="button secondary" href="/course/turning-forward">Preview course</Link></section></main>;
  if (!allowed) return <main><Header/><section className="empty-state"><span className="eyebrow">COURSE LOCKED</span><h1>Purchase required</h1><p>This account does not have an active Turning Forward enrollment. Preview the course outline and unlock all lessons for a one-time $97 payment.</p><Link className="button" href="/course/turning-forward">Preview & unlock — $97</Link></section></main>;
  return <>{children}</>;
}
