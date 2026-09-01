"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { loadCloudProgress, loadLocalProgress, saveCloudProgress, saveLocalProgress, ProgressData } from "@/lib/progress";
import styles from "./ModuleOpenerGate.module.css";

const moduleOpeners: Record<string, { number: number; title: string; question: string; playbackId: string; ratio: string }> = {
  "module-1": { number: 1, title: "Identity", question: "Who am I becoming?", playbackId: "00CJGoE8rSkT8kLHKE02v62G00zVb730201XxyhtB00iYD9DA", ratio: "16 / 9" },
  "module-2": { number: 2, title: "Shame", question: "What do I need to stop carrying?", playbackId: "2bwbixKQCmfLfvrFvvwoOc824fqZMcMYYl01PGMQbogE", ratio: "16 / 9" },
  "module-3": { number: 3, title: "Discipline", question: "What must I consistently do?", playbackId: "NV5Dudc13gqQfDXMX4miR7kYYlMrd4lZhRuUlqHZUrY", ratio: "256 / 135" },
  "module-4": { number: 4, title: "Narrative", question: "What story will I believe?", playbackId: "iWgQj00l901AqBM42MH63ykM00hxfMchz45n8T00O85hDvs", ratio: "256 / 135" },
  "module-5": { number: 5, title: "Accountability", question: "What belongs to me?", playbackId: "RzGH2gaxhU01CJQ9HvA1PMmwQxVU902AXuwjHnh9zRddM", ratio: "16 / 9" },
  "module-6": { number: 6, title: "Relationships", question: "Who belongs around me?", playbackId: "9hJRiLUzG3q9YZy01POlEtc4Ja00QOUhBnBOsSiAHMyzU", ratio: "16 / 9" },
  "module-7": { number: 7, title: "Purpose", question: "What am I building?", playbackId: "00v6chrDJ6VAEZWMslXC1Q7VKxuw8tFJ7iyv5Rrt3aVA", ratio: "16 / 9" },
  "module-8": { number: 8, title: "Forward", question: "How will I live from here?", playbackId: "Tr2Omgh02bFQKZSkYfxfQ9N7czTt029otobWkm1AZ7ZT4", ratio: "16 / 9" }
};

const moduleOpenerDoneKey = (moduleNumber: number) => `m${moduleNumber}opener`;

type PlayerJsPlayer = {
  on: (event: string, callback: (data?: { seconds?: number; duration?: number }) => void) => void;
  off?: (event: string, callback?: (data?: unknown) => void) => void;
  setCurrentTime: (seconds: number) => Promise<void> | void;
};

declare global {
  interface Window {
    playerjs?: { Player: new (iframe: HTMLIFrameElement) => PlayerJsPlayer };
  }
}

export default function ModuleOpenerGate({ moduleSlug, children }: { moduleSlug: string; children: React.ReactNode }) {
  const opener = moduleOpeners[moduleSlug];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const furthestRef = useRef(0);
  const durationRef = useRef(0);
  const [progress, setProgress] = useState<ProgressData>({});
  const [ready, setReady] = useState(false);
  const [watchedNow, setWatchedNow] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const { user, loading } = useAuth();

  const doneKey = opener ? moduleOpenerDoneKey(opener.number) : "";
  const previouslyWatched = Boolean(doneKey && progress[doneKey]);
  const canContinue = previouslyWatched || watchedNow;

  useEffect(() => {
    if (loading) return;
    const local = loadLocalProgress();
    if (!user) {
      setProgress(local);
      setReady(true);
      return;
    }
    loadCloudProgress(user.id)
      .then(cloud => setProgress({ ...local, ...cloud }))
      .catch(() => setProgress(local))
      .finally(() => setReady(true));
  }, [user, loading, moduleSlug]);

  useEffect(() => {
    if (!opener || !ready || (canContinue && !showReplay) || !iframeRef.current) return;
    let cancelled = false;
    let player: PlayerJsPlayer | null = null;

    const markComplete = () => {
      if (cancelled) return;
      if (previouslyWatched) {
        setWatchedNow(true);
        return;
      }
      const duration = durationRef.current;
      if (!duration || furthestRef.current < duration - 1.5) return;
      const next = { ...progress, [doneKey]: true };
      setProgress(next);
      saveLocalProgress(next);
      if (user) saveCloudProgress(user.id, next).catch(() => undefined);
      setWatchedNow(true);
    };

    const attachPlayer = () => {
      if (cancelled || !window.playerjs || !iframeRef.current) return;
      player = new window.playerjs.Player(iframeRef.current);
      player.on("timeupdate", data => {
        const seconds = Number(data?.seconds ?? 0);
        const duration = Number(data?.duration ?? 0);
        if (duration > 0) durationRef.current = duration;
        if (!previouslyWatched && seconds > furthestRef.current + 2.5) {
          player?.setCurrentTime(Math.max(0, furthestRef.current));
          return;
        }
        if (seconds > furthestRef.current) furthestRef.current = seconds;
      });
      player.on("ended", markComplete);
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-tcf-playerjs="true"]');
    if (window.playerjs) attachPlayer();
    else if (existing) existing.addEventListener("load", attachPlayer, { once: true });
    else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/player.js@0.1.0/dist/player-0.1.0.min.js";
      script.async = true;
      script.dataset.tcfPlayerjs = "true";
      script.addEventListener("load", attachPlayer, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (existing) existing.removeEventListener("load", attachPlayer);
      player?.off?.("ended");
      player?.off?.("timeupdate");
    };
  }, [opener, ready, canContinue, showReplay, doneKey, progress, user, previouslyWatched]);

  if (!opener) return <>{children}</>;
  if (!ready) return <main><Header/><section className={styles.loading}>Loading module…</section></main>;

  if (previouslyWatched && !showReplay && !watchedNow) {
    return <>
      <div style={{ maxWidth: 1180, margin: "18px auto 0", padding: "0 24px", textAlign: "right" }}>
        <button className="button" onClick={() => { furthestRef.current = 0; durationRef.current = 0; setShowReplay(true); }}>Replay Module Introduction</button>
      </div>
      {children}
    </>;
  }

  return <main>
    <Header/>
    <section className={styles.shell}>
      <div className={styles.kicker}>TCF LEARN · MODULE {opener.number}</div>
      <h1>{opener.title}</h1>
      <p className={styles.question}>{opener.question}</p>
      <div className={styles.playerFrame}>
        <iframe
          ref={iframeRef}
          src={`https://player.mux.com/${opener.playbackId}?hotkeys=noarrowleft%20noarrowright`}
          style={{ width: "100%", border: "none", aspectRatio: opener.ratio }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          title={`Module ${opener.number} introduction video`}
        />
      </div>
      {!canContinue ? <div className={styles.locked} aria-live="polite"><span>Watch the complete module introduction to continue.</span></div> : <div className={styles.continueBox}><p>{showReplay ? "Introduction replay complete. Return to your lesson when ready." : "Introduction complete. You’re ready to begin."}</p><button className="button" onClick={() => { setShowReplay(false); setWatchedNow(false); }}>{showReplay ? "Return to Module →" : "Continue to Lesson 1 →"}</button></div>}
    </section>
  </main>;
}
