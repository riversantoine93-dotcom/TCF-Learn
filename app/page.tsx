import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import EnrollButton from "@/components/EnrollButton";

export default function Home() {
  return <main><Header />
    <section className="hero"><div className="shell hero-grid"><div>
      <span className="eyebrow">THE WORK BEYOND FEAR</span>
      <h1>You do not need a second chance. You need a forward strategy.</h1>
      <p className="lead">Turning Forward is an interactive learning experience that helps students rebuild identity, develop structure, face fear, and create sustainable momentum after adversity.</p>
      <div className="actions" id="enroll"><EnrollButton/><Link className="button secondary" href="/course/turning-forward">Preview the course</Link></div>
      <div className="trust-row"><span>One-time payment: $97</span><span>8 guided modules</span><span>Interactive journal</span><span>Progress tracking</span></div>
    </div><div className="hero-card"><Image src="/learn-logo.png" alt="Learn logo" width={520} height={520} priority /><p>Build. Lead. Move Forward.</p></div></div></section>
    <section className="section shell"><div className="section-heading"><span className="eyebrow">A COURSE THAT REQUIRES ACTION</span><h2>More than videos and motivation</h2></div><div className="feature-grid">
      <article><b>01</b><h3>Guided teaching</h3><p>Focused lessons connect personal experience with practical strategies for change.</p></article>
      <article><b>02</b><h3>Private reflection</h3><p>Journal responses, fear maps, and commitments save to each student account.</p></article>
      <article><b>03</b><h3>Forward challenges</h3><p>Every module ends with a measurable action that turns insight into behavior.</p></article>
    </div></section>
  </main>;
}
