"use client";

import { useEffect, useState } from "react";
import { DEFAULT_FRAME, Frame } from "@/lib/frames";
import { DEFAULT_FILTER, Filter } from "@/lib/filters";
import { canvasToBlob, renderStrip } from "@/lib/strip";
import CameraStep from "./CameraStep";
import StripEditor from "./StripEditor";
import ShareStep from "./ShareStep";
import styles from "./Booth.module.css";

type Step = "shoot" | "edit" | "share";
export type StripImage = { blob: Blob; url: string };

export default function BoothFlow() {
  const [step, setStep] = useState<Step>("shoot");
  const [photos, setPhotos] = useState<string[]>([]);
  const [frame, setFrame] = useState<Frame>(DEFAULT_FRAME);
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [strip, setStrip] = useState<StripImage | null>(null);
  const [stripError, setStripError] = useState(false);

  // Re-render the strip whenever the photos or frame colour change.
  useEffect(() => {
    if (photos.length === 0) {
      setStrip(null);
      return;
    }
    let cancelled = false;
    let url: string | null = null;
    setStripError(false);
    renderStrip(photos, frame, filter)
      .then(canvasToBlob)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setStrip({ blob, url });
      })
      .catch(() => !cancelled && setStripError(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [photos, frame, filter]);

  const startOver = () => {
    setPhotos([]);
    setStrip(null);
    setStep("shoot");
  };

  return (
    <div className={`container section ${styles.flow}`}>
      <ol className={styles.progress} aria-label="Booth steps">
        {(["shoot", "edit", "share"] as const).map((s, i) => (
          <li
            key={s}
            className={`t-label ${styles.progressItem} ${step === s ? styles.progressCurrent : ""}`}
            aria-current={step === s ? "step" : undefined}
          >
            {i + 1}. {s === "shoot" ? "Shoot" : s === "edit" ? "Frame" : "Share"}
          </li>
        ))}
      </ol>

      {step === "shoot" && (
        <CameraStep
          filter={filter}
          onFilterChange={setFilter}
          onDone={(shots) => {
            setPhotos(shots);
            setStep("edit");
          }}
        />
      )}
      {step === "edit" && (
        <StripEditor
          strip={strip}
          error={stripError}
          frame={frame}
          onFrameChange={setFrame}
          filter={filter}
          onFilterChange={setFilter}
          onRetake={startOver}
          onDone={() => setStep("share")}
        />
      )}
      {step === "share" && (
        <ShareStep strip={strip} onBack={() => setStep("edit")} onTakeAnother={startOver} />
      )}
    </div>
  );
}
