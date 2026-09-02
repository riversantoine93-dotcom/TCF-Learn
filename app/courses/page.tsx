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
  const [headerTheme, setHeaderTheme] = useState<HeaderTheme>("dark");

  useEffect(() => {
    setHeaderTheme(normalizeHeaderTheme(localStorage.getItem(HEADER_THEME_STORAGE_KEY)));
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

  const toggleHeaderTheme = () => setHeaderTheme(current => {
    const next = nextHeaderTheme(current);
    localStorage.setItem(HEADER_THEME_STORAGE_KEY, next);
    return next;
  });

  const cards = useMemo(
    () => courseCardsForUser(Boolean(user), enrolledCourses),
    [user, enrolledCourses]
  );

  return (
    <main className="courses-page">
      <header className={`courses-topbar header-theme-${headerTheme}`}>
        <Link href="/" className="courses-brand" aria-label="TCF Learn home">
          <Image src="/learn-logo.png" alt="TCF Learn" width={160} height={66} priority />
        </Link>
        <nav aria-label="Courses navigation">
          <Link href="/">Dashboard</Link>
          <Link className="active" href="/courses">Courses</Link>
          <Link href="/#purchase-center">Course Store</Link>
          {user ? <Link href="/profile">Profile</Link> : <Link href="/login">User Login</Link>}
          <button type="button" className="courses-theme-toggle" onClick={toggleHeaderTheme} aria-label={`Switch header to ${headerTheme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${headerTheme === "dark" ? "light" : "dark"} mode`}>
            <span aria-hidden="true">{headerTheme === "dark" ? "☀" : "☾"}</span>
            <b>{headerTheme === "dark" ? "Light" : "Dark"}</b>
          </button>
        </nav>
      </header>

      <section className="courses-hero">
        <span className="eyebrow">TCF LEARN COURSES</span>
        <h1>{user ? "Your courses and what comes next." : "Preview the work before you begin."}</h1>
        <p>
          {user
            ? "Purchased courses are ready to open. Courses you have not purchased remain available to preview, with checkout kept in one central location on the Dashboard."
            : "Explore both TCF Learn courses, review what each one covers, and return to the Dashboard when you are ready to purchase a course or the bundle."}
        </p>
      </section>

      <section className="courses-grid" aria-live="polite">
        {checkingAccess && user ? (
          <div className="courses-loading">Checking your course access…</div>
        ) : (
          cards.map((card) => {
            const course = COURSE_DETAILS[card.slug];
            return (
              <article className={`course-preview-card ${card.purchased ? "purchased" : "preview"}`} key={card.slug}>
                <div className="course-preview-art">
                  <Image src={course.thumbnail} alt={`${course.title} course thumbnail`} fill sizes="(max-width: 820px) 100vw, 50vw" />
                  <span>{card.purchased ? "PURCHASED" : "COURSE PREVIEW"}</span>
                </div>
                <div className="course-preview-body">
                  <p className="course-meta">{course.meta}</p>
                  <h2>{course.title}</h2>
                  <h3>{course.subtitle}</h3>
                  <p>{course.description}</p>
                  <div className="course-actions">
                    <Link className="primary-course-action" href={course.href}>
                      {card.purchased ? "Open Course" : "Preview Course"}
                    </Link>
                    {card.showPurchaseCta && (
                      <Link className="secondary-course-action" href="/#purchase-center">
                        Purchase from Dashboard
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      <section className="bundle-note">
        <div>
          <span className="eyebrow">ONE CHECKOUT LOCATION</span>
          <h2>Buy either course for $97, or get both for $145.50.</h2>
          <p>The bundle saves $48.50 and unlocks both courses. All purchases are completed from the Dashboard Course Store.</p>
        </div>
        <Link href="/#purchase-center">View Course Store</Link>
      </section>

      <aside className="podcast-extras" aria-label="More from The Conviction Fiction Podcast">
        <span>More from The Conviction Fiction Podcast</span>
        <div>
          <a href="https://theconvictionfictionpodcast.com/#books" target="_blank" rel="noreferrer">Browse Books ↗</a>
          <a href="https://theconvictionfictionpodcast.com/#shop" target="_blank" rel="noreferrer">Visit the Shop ↗</a>
        </div>
      </aside>
    </main>
  );
}
