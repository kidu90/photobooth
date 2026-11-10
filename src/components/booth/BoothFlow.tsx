"use client";

import { useEffect, useState } from "react";
import { DEFAULT_FRAME, Frame } from "@/lib/frames";
import { DEFAULT_FILTER, Filter } from "@/lib/filters";
import { DEFAULT_SHOT_COUNT, canvasToBlob, renderStrip } from "@/lib/strip";
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
  const [shotCount, setShotCount] = useState(DEFAULT_SHOT_COUNT);
  const [strip, setStrip] = useState<StripImage | null>(null);
  const [stripError, setStripError] = useState(false);

  // Re-render the strip whenever the photos, frame colour or filter change.
  useEffect(() => {
    if (photos.length === 0) {
      setStrip(null);
      return;
    }
    let cancelled = false;
    setStripError(false);
    renderStrip(photos, frame, filter)
      .then(canvasToBlob)
      .then((blob) => {
        if (cancelled) return;
        // Keep showing the previous strip until this one is ready.
        setStrip({ blob, url: URL.createObjectURL(blob) });
      })
      .catch(() => !cancelled && setStripError(true));
    return () => {
      cancelled = true;
    };
  }, [photos, frame, filter]);

  // Free each strip's object URL once it's been replaced or the booth closes.
  useEffect(() => {
    if (!strip) return;
    return () => URL.revokeObjectURL(strip.url);
  }, [strip]);

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
          shotCount={shotCount}
          onShotCountChange={setShotCount}
          onDone={(shots) => {
            setPhotos(shots);
            setStep("edit");
          }}
        />
      )}
      {step === "edit" && (
        <StripEditor
          strip={strip}
          shotCount={photos.length}
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
        <ShareStep strip={strip} shotCount={photos.length} onBack={() => setStep("edit")} onTakeAnother={startOver} />
      )}
    </div>
  );
}
