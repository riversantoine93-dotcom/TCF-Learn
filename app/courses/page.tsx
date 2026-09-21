"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { activeCourseSlugs, DashboardCourseSlug } from "@/lib/dashboard-enrollments";
import { courseCardsForUser } from "@/lib/courses-access";
import { HEADER_THEME_STORAGE_KEY, HeaderTheme, nextHeaderTheme, normalizeHeaderTheme } from "@/lib/header-theme";
import { supabase } from "@/lib/supabase";
import "./courses.css";

const COURSE_DETAILS = {
  "turning-forward": {
    title: "Turning Forward",
    subtitle: "The Work Beyond Fear",
    description: "A structured path from survival mode to clarity, discipline, identity, accountability, relationships, purpose, and forward momentum.",
    thumbnail: "/course-thumbnails/turning-forward.png",
    meta: "8 modules · 32 sections",
    href: "/course/turning-forward",
  },
  "thought-to-freedom": {
    title: "Thought to Freedom",
    subtitle: "Correcting Criminal Thinking Errors",
    description: "Identify recurring thinking errors, challenge the thought before it becomes action, and practice responsible replacement thinking.",
    thumbnail: "/course-thumbnails/from-thought-to-freedom.png",
    meta: "10 modules · 30 lessons",
    href: "/course/thought-to-freedom",
  },
} as const;

export default function CoursesPage() {
  const { user, loading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<DashboardCourseSlug[]>([]);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [pageTheme, setPageTheme] = useState<HeaderTheme>("dark");

  useEffect(() => {
    const saved = normalizeHeaderTheme(localStorage.getItem(HEADER_THEME_STORAGE_KEY));
    setPageTheme(saved);
    document.documentElement.dataset.tcfTheme = saved;
    return () => {
      delete document.documentElement.dataset.tcfTheme;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user || !supabase) {
      setEnrolledCourses([]);
      setCheckingAccess(false);
      return;
    }

    let cancelled = false;
    setCheckingAccess(true);
    supabase
      .from("enrollments")
      .select("course_slug,active")
      .eq("user_id", user.id)
      .eq("active", true)
      .then(({ data }) => {
        if (cancelled) return;
        setEnrolledCourses(activeCourseSlugs(data));
        setCheckingAccess(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const togglePageTheme = () => setPageTheme(current => {
    const next = nextHeaderTheme(current);
    localStorage.setItem(HEADER_THEME_STORAGE_KEY, next);
    document.documentElement.dataset.tcfTheme = next;
    return next;
  });

  const cards = useMemo(
    () => courseCardsForUser(Boolean(user), enrolledCourses),
    [user, enrolledCourses]
  );

  return (
    <main className={`courses-page page-theme-${pageTheme}`}>
      <header className={`courses-topbar header-theme-${pageTheme}`}>
        <Link href="/" className="courses-brand" aria-label="TCF Learn home">
          <Image src="/learn-logo.png" alt="TCF Learn" width={160} height={66} priority />
        </Link>
        <nav aria-label="Courses navigation">
          <Link href={user ? "/dashboard" : "/organizations"}>{user ? "Dashboard" : "Organization Plans"}</Link>
          <Link className="active" href="/courses">Courses</Link>
          <Link href="/organizations">Organization Plans</Link>
          {user ? <Link href="/profile">Profile</Link> : <Link href="/login">User Login</Link>}
          <button type="button" className="courses-theme-toggle" onClick={togglePageTheme} aria-label={`Switch page to ${pageTheme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${pageTheme === "dark" ? "light" : "dark"} mode`}>
            <span aria-hidden="true">{pageTheme === "dark" ? "☀" : "☾"}</span>
            <b>{pageTheme === "dark" ? "Light" : "Dark"}</b>
          </button>
        </nav>
      </header>

      <section className="courses-hero">
        <span className="eyebrow">TCF LEARN COURSES</span>
        <h1>{user ? "Your courses and what comes next." : "Preview the work before you begin."}</h1>
        <p>{user ? "Courses assigned through your organization are ready to open. Other courses remain available to preview." : "Explore both TCF Learn courses. Organizations license both courses together for their enrolled learners."}</p>
      </section>

      <section className="courses-grid" aria-live="polite">
        {checkingAccess && user ? <div className="courses-loading">Checking your course access…</div> : cards.map((card) => {
          const course = COURSE_DETAILS[card.slug];
          return <article className={`course-preview-card ${card.purchased ? "purchased" : "preview"}`} key={card.slug}>
            <div className="course-preview-art"><Image src={course.thumbnail} alt={`${course.title} course thumbnail`} fill sizes="(max-width: 820px) 100vw, 50vw" /><span>{card.purchased ? "PURCHASED" : "COURSE PREVIEW"}</span></div>
            <div className="course-preview-body"><p className="course-meta">{course.meta}</p><h2>{course.title}</h2><h3>{course.subtitle}</h3><p>{course.description}</p><div className="course-actions"><Link className="primary-course-action" href={course.href}>{card.purchased ? "Open Course" : "Preview Course"}</Link>{card.showPurchaseCta && <Link className="secondary-course-action" href="/organizations">View Organization Plans</Link>}</div></div>
          </article>;
        })}
      </section>

      <section className="bundle-note"><div><span className="eyebrow">ORGANIZATIONAL ACCESS</span><h2>Both courses are included with every learner seat.</h2><p>Organizations can enroll 10, 50, or 100 learners under one license, with centralized administration and learner progress visibility.</p></div><Link href="/organizations">View Organization Plans</Link></section>

      <aside className="podcast-extras" aria-label="More from The Conviction Fiction Podcast"><span>More from The Conviction Fiction Podcast</span><div><a href="https://theconvictionfictionpodcast.com/#books" target="_blank" rel="noreferrer">Browse Books ↗</a><a href="https://theconvictionfictionpodcast.com/#shop" target="_blank" rel="noreferrer">Visit the Shop ↗</a></div></aside>
    </main>
  );
}
