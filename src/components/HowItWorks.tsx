import type { ReactNode } from "react";
import styles from "./HowItWorks.module.css";

/** A head-and-shoulders figure, drawn in a 120×90 frame. */
function Person({ cx }: { cx: number }) {
  return (
    <g>
      <path d={`M${cx - 20} 92 Q${cx} 50 ${cx + 20} 92`} className={styles.figure} />
      <circle cx={cx} cy="38" r="11" className={styles.figure} />
    </g>
  );
}

function CountDisc({ n }: { n: number }) {
  return (
    <g>
      <circle cx="60" cy="45" r="24" className={styles.disc} />
      <text x="60" y="45" textAnchor="middle" dominantBaseline="central" className={styles.discText}>
        {n}
      </text>
    </g>
  );
}

function Burst() {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return {
      x1: 60 + Math.cos(a) * 22,
      y1: 45 + Math.sin(a) * 22,
      x2: 60 + Math.cos(a) * 34,
      y2: 45 + Math.sin(a) * 34,
    };
  });
  return (
    <g>
      <circle cx="60" cy="45" r="12" className={styles.disc} />
      {rays.map((r, i) => (
        <line key={i} {...r} className={styles.line} />
      ))}
    </g>
  );
}

const STEPS: { title: string; body: string; frames: ReactNode[]; flashFrame?: number }[] = [
  {
    title: "Squeeze in",
    body: "Open the booth and get everyone in the frame. Closer. Closer still.",
    frames: [
      <Person key="a" cx={60} />,
      <g key="b">
        <Person cx={42} />
        <Person cx={78} />
      </g>,
      <g key="c">
        <Person cx={34} />
        <Person cx={86} />
        <Person cx={60} />
      </g>,
    ],
  },
  {
    title: "Take your shots",
    body: "Pick two, three or four. You get three seconds before each one. Change your pose every time.",
    frames: [<CountDisc key="3" n={3} />, <CountDisc key="2" n={2} />, <Burst key="burst" />],
    flashFrame: 2,
  },
  {
    title: "Share your strip",
    body: "Pick a frame colour and a filter, download your strip, and send it to the group.",
    frames: [
      <g key="strip">
        <rect x="48" y="12" width="24" height="66" rx="3" className={styles.paper} />
        {[17, 37, 57].map((y) => (
          <rect key={y} x="52" y={y} width="16" height="16" rx="2" className={styles.tint} />
        ))}
      </g>,
      <g key="download">
        <line x1="60" y1="16" x2="60" y2="58" className={styles.line} />
        <polyline points="45,44 60,59 75,44" className={styles.line} />
        <line x1="38" y1="72" x2="82" y2="72" className={styles.line} />
      </g>,
      <g key="share">
        <polyline points="46,46 40,46 40,74 80,74 80,46 74,46" className={styles.line} />
        <line x1="60" y1="60" x2="60" y2="16" className={styles.line} />
        <polyline points="48,28 60,16 72,28" className={styles.line} />
      </g>,
    ],
  },
];

export default function HowItWorks() {
  return (
    <ol className={styles.steps}>
      {STEPS.map((step, i) => (
        <li key={step.title} className={styles.step}>
          <div className={styles.strip} aria-hidden="true">
            {step.frames.map((art, f) => (
              <svg
                key={f}
                viewBox="0 0 120 90"
                className={`${styles.frame} ${step.flashFrame === f ? styles.frameFlash : ""}`}
              >
                {art}
              </svg>
            ))}
            <p className={`t-label ${styles.stripNumber}`}>{String(i + 1).padStart(2, "0")}</p>
          </div>
          <div className={styles.copy}>
            <h3 className="t-h3">
              <span className="visually-hidden">Step {i + 1}: </span>
              {step.title}
            </h3>
            <p className="muted">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
