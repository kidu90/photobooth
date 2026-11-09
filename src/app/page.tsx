import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PlaceholderStrip from "@/components/PlaceholderStrip";
import { DEFAULT_FRAME, FRAMES } from "@/lib/frames";
import styles from "./page.module.css";

const STEPS = [
  {
    title: "Squeeze in",
    body: "Open the booth and get everyone in the frame. Closer. Closer still.",
  },
  {
    title: "Take four shots",
    body: "You get three seconds before each one. Change your pose every time.",
  },
  {
    title: "Share your strip",
    body: "Pick a frame colour, download your strip, and send it to the group.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero: the one hero on this page. */}
        <section className={`section ${styles.hero}`} aria-labelledby="hero-title">
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroCopy}>
              <h1 id="hero-title" className="t-hero">
                Everyone in.
              </h1>
              <p className="t-lead">Open the booth, squeeze in, and get your strip in seconds.</p>
              <div className={styles.heroActions}>
                <Link href="/booth" className="btn btn-primary btn-lg">
                  Start a booth
                </Link>
                <p className="t-label muted">No sign-up. Your photos stay on your device.</p>
              </div>
            </div>
            <div className={styles.heroStrip}>
              <PlaceholderStrip
                frame={DEFAULT_FRAME}
                size="lg"
                label="Example photo strip with four placeholder frames"
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section" aria-labelledby="how-title">
          <div className="container">
            <h2 id="how-title" className={`t-h2 ${styles.sectionTitle}`}>
              How it works
            </h2>
            <ol className={styles.steps}>
              {STEPS.map((step, i) => (
                <li key={step.title} className={styles.step}>
                  <span className={`t-label ${styles.stepBadge}`} aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="t-h3">
                    <span className="visually-hidden">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`section ${styles.showcase}`} aria-labelledby="showcase-title">
          <div className="container">
            <div className={styles.showcaseHead}>
              <h2 id="showcase-title" className="t-h2">
                Four frames, one strip
              </h2>
              <p className="t-lead">
                Your shots stack up like the real thing. Pick the frame colour after you shoot.
              </p>
              <p className="t-label muted">The frames below are placeholders. Your photos go here.</p>
            </div>
            <ul className={styles.showcaseGrid}>
              {FRAMES.map((frame) => (
                <li key={frame.id} className={styles.showcaseItem}>
                  <PlaceholderStrip frame={frame} />
                  <p className="t-label">{frame.name}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The one full-bleed curtain section on this page. */}
        <section className={styles.curtain} aria-labelledby="cta-title">
          <div className={`container ${styles.curtainInner}`}>
            <img src="/brand/pose-mark-paper.svg" alt="" className={styles.curtainMark} />
            <h2 id="cta-title" className="t-h1">
              Your turn. Get in the booth.
            </h2>
            <p className="t-lead">Grab your friends, find some light, and hold still.</p>
            <Link href="/booth" className="btn btn-inverse btn-lg">
              Start a booth
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
