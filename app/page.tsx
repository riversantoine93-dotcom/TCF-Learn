import Header from "@/components/Header";

export default function Home() {
  return <main><Header />
    <section className="home-hero">
      <div className="shell home-hero-shell">
        <div className="home-hero-top">
          <span className="eyebrow">FROM CONVERSATION TO TRANSFORMATION</span>
        </div>
        <div className="home-hero-copy">
          <h1>TCF Learn turns hard conversations into practical growth.</h1>
          <p className="lead">TCF Learn is the interactive learning platform born from The Conviction Fiction Podcast. The podcast creates space for honest conversations about accountability, criminal behavior, reentry, identity, relationships, healing, purpose, and second chances. TCF Learn takes those conversations further by turning them into structured learning experiences people can work through, reflect on, and apply to real life.</p>
        </div>
        <div className="trust-row"><span>Podcast-rooted learning</span><span>Interactive modules</span><span>Real-world reflection</span><span>Action-centered growth</span></div>
      </div>
    </section>

    <section className="statement">
      <p>TCF Learn was built on a simple belief: insight matters, but transformation requires participation. Every course is designed to help learners examine how they think, understand what they carry, take responsibility for what belongs to them, and make different choices moving forward.</p>
    </section>

    <section className="framework">
      <span className="eyebrow">WHAT TCF LEARN EXPLORES</span>
      <h2>The same real-life issues we talk about on the podcast—built into deeper learning.</h2>
      <div className="framework-grid">
        <div><b>01</b><h3>Criminal Thinking & Behavior</h3><p>Recognizing distorted thinking, criminal behavior patterns, impulsive decision-making, victimstance, entitlement, rationalization, and the beliefs that can keep harmful cycles alive.</p></div>
        <div><b>02</b><h3>Identity & The Past</h3><p>Letting go of old labels, shame, fear, survival identities, and the belief that a past decision has to become a permanent definition of who you are.</p></div>
        <div><b>03</b><h3>Accountability & Discipline</h3><p>Ownership, personal responsibility, consistency, boundaries, self-discipline, emotional regulation, and learning to respond instead of react.</p></div>
        <div><b>04</b><h3>Relationships & Reentry</h3><p>Family, trust, communication, parenting, healthy support systems, social contracts, employment, reintegration, and the realities of rebuilding life after incarceration or major adversity.</p></div>
        <div><b>05</b><h3>Purpose & Forward Living</h3><p>Mindset, resilience, purpose, faith, goals, financial responsibility, restoration, second chances, and building a life that is no longer organized around the past.</p></div>
      </div>
    </section>

    <section className="home-action-section">
      <div className="shell home-action-shell">
        <div className="home-action-heading"><span className="eyebrow">BUILT TO BE INTERACTIVE</span><h2>You do not just watch TCF Learn. You participate.</h2><p>Every course is organized into interactive modules designed to make the learner stop, think, answer, decide, and act.</p></div>
        <div className="feature-grid">
          <article><b>01</b><h3>Reflect</h3><p>Guided questions, journal prompts, personal inventories, and exercises help learners connect each topic to their own experiences and thinking patterns.</p></article>
          <article><b>02</b><h3>Challenge</h3><p>Interactive activities push learners to question assumptions, identify patterns, examine consequences, and practice healthier ways of thinking and responding.</p></article>
          <article><b>03</b><h3>Apply</h3><p>Each module moves beyond information toward action—clear commitments, real-world decisions, and practical steps that can be carried into everyday life.</p></article>
        </div>
      </div>
    </section>

    <section className="framework">
      <span className="eyebrow">THE ORIGIN OF THE PLATFORM</span>
      <h2>Born from The Conviction Fiction Podcast.</h2>
      <p style={{maxWidth:"900px",fontSize:"20px",color:"var(--muted)"}}>The Conviction Fiction Podcast began with real stories and hard truths about incarceration, accountability, reentry, resilience, relationships, mental health, employment, family, faith, and what it actually takes to rebuild. TCF Learn is the educational extension of that mission. It creates a place where those conversations can become guided experiences—not just something you hear, but something you work through.</p>
    </section>
  </main>;
}
