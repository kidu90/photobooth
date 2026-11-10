"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { StripImage } from "./BoothFlow";
import styles from "./Booth.module.css";

export default function ShareStep({
  strip,
  shotCount,
  onBack,
  onTakeAnother,
}: {
  strip: StripImage | null;
  shotCount: number;
  onBack: () => void;
  onTakeAnother: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [canShare, setCanShare] = useState(false);
  const [message, setMessage] = useState("");

  const fileName = useMemo(() => `pose-strip-${new Date().toISOString().slice(0, 10)}.png`, []);
  const file = useMemo(
    () => (strip ? new File([strip.blob], fileName, { type: "image/png" }) : null),
    [strip, fileName]
  );

  useEffect(() => headingRef.current?.focus(), []);

  useEffect(() => {
    setCanShare(!!file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }));
  }, [file]);

  const share = async () => {
    if (!file) return;
    setMessage("");
    try {
      await navigator.share({ files: [file], title: "Our Pose strip" });
    } catch (e) {
      if ((e as { name?: string })?.name !== "AbortError") {
        setMessage("Sharing didn't work. Download the strip and send it yourself.");
      }
    }
  };

  return (
    <section className={styles.editorLayout} aria-labelledby="share-title">
      <div className={styles.stripPreview}>
        {strip ? (
          <img src={strip.url} alt={`Your finished photo strip with ${shotCount} shots`} />
        ) : (
          <p className="t-label muted">Developing your strip…</p>
        )}
      </div>

      <div className={styles.side}>
        <div className={styles.stepIntro}>
          <h1 id="share-title" ref={headingRef} tabIndex={-1} className="t-h1">
            Your strip is ready.
          </h1>
          <p className="t-lead">Save it, send it to the group, then go again.</p>
        </div>

        <div className={styles.actions}>
          {strip && (
            <a href={strip.url} download={fileName} className="btn btn-primary btn-lg">
              Download PNG
            </a>
          )}
          {canShare && (
            <button type="button" className="btn btn-secondary btn-lg" onClick={share}>
              Share
            </button>
          )}
        </div>
        {!canShare && strip && (
          <p className="muted">This browser can&apos;t share files directly. Download your strip and send it from there.</p>
        )}
        <p role="status" className="muted">
          {message}
        </p>

        <div className={styles.actions}>
          <button type="button" className="btn btn-secondary btn-lg" onClick={onTakeAnother}>
            Take another
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={onBack}>
            Change frame
          </button>
        </div>
        <p className="t-label muted">Your photos stay on this device. Nothing gets uploaded.</p>
      </div>
    </section>
  );
}
