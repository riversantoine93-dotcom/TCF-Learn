import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import EnrollButton from "@/components/EnrollButton";

export default function Home() {
  return <main><Header />
    <section className="home-hero">
      <div className="shell home-hero-shell">
        <div className="home-hero-top">
          <span className="eyebrow">THE WORK BEYOND FEAR</span>
          <div className="home-hero-quick">
            <Image src="/learn-logo.png" alt="TCF LEARN" width={132} height={132} priority />
            <div className="home-hero-actions" id="enroll"><EnrollButton/><Link className="button secondary" href="/course/turning-forward">Preview</Link></div>
          </div>
        </div>
        <div className="home-hero-copy">
          <h1>You do not need a second chance. You need a forward strategy.</h1>
          <p className="lead">Turning Forward is an interactive learning experience that helps students rebuild identity, develop structure, face fear, and create sustainable momentum after adversity.</p>
        </div>
        <div className="trust-row"><span>One-time payment: $97</span><span>8 guided modules</span><span>Interactive journal</span><span>Progress tracking</span></div>
      </div>
    </section>
    <section className="home-action-section">
      <div className="shell home-action-shell">
        <div className="home-action-heading"><span className="eyebrow">A COURSE THAT REQUIRES ACTION</span><h2>More than videos and motivation</h2><p>Each part of the experience is designed to move learning off the screen and into everyday decisions.</p></div>
        <div className="feature-grid">
          <article><b>01</b><h3>Guided teaching</h3><p>Focused lessons connect personal experience with practical strategies for change.</p></article>
          <article><b>02</b><h3>Private reflection</h3><p>Journal responses, fear maps, and commitments save to each student account.</p></article>
          <article><b>03</b><h3>Forward challenges</h3><p>Every module ends with a measurable action that turns insight into behavior.</p></article>
        </div>
      </div>
    </section>
  </main>;
}
