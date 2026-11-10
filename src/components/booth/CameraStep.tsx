"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SHOT_OPTIONS, captureFrame } from "@/lib/strip";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Filter, filterCss } from "@/lib/filters";
import FilterPicker from "./FilterPicker";
import styles from "./Booth.module.css";

const COUNTDOWN_SECONDS = 3;
const FLASH_MS = 200;
const PAUSE_BETWEEN_SHOTS_MS = 700;

type CameraError = "denied" | "not-found" | "busy" | "unsupported" | "unknown";
type CameraState = { status: "starting" } | { status: "ready" } | { status: "error"; error: CameraError };

const ERROR_COPY: Record<CameraError, { title: string; body: string }> = {
  denied: {
    title: "Pose can't see you yet.",
    body: "Camera access is blocked. Allow it in your browser's site settings, then try again.",
  },
  "not-found": {
    title: "No camera found.",
    body: "Plug in a camera, or open Pose on a phone or laptop that has one.",
  },
  busy: {
    title: "Your camera's busy.",
    body: "Close any other app or tab using it, then try again.",
  },
  unsupported: {
    title: "This browser can't open a camera.",
    body: "Open Pose in a recent version of Chrome, Safari or Firefox, over a secure (https) connection.",
  },
  unknown: {
    title: "Something stopped the camera.",
    body: "Try again. If it keeps happening, reload the page.",
  },
};

function toCameraError(e: unknown): CameraError {
  const name = (e as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError" || name === "DevicesNotFoundError") return "not-found";
  if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") return "busy";
  return "unknown";
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CameraStep({
  filter,
  onFilterChange,
  shotCount,
  onShotCountChange,
  onDone,
}: {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  shotCount: number;
  onShotCountChange: (count: number) => void;
  onDone: (photos: string[]) => void;
}) {
  const previewFilter = filterCss(filter);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cancelRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();

  const [camera, setCamera] = useState<CameraState>({ status: "starting" });
  const [shooting, setShooting] = useState(false);
  const [shots, setShots] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Bumped on every start/stop so a getUserMedia call that resolves late can't leak a stream.
  const generationRef = useRef(0);

  const stopCamera = useCallback(() => {
    generationRef.current++;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCamera({ status: "starting" });
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCamera({ status: "error", error: "unsupported" });
      return;
    }
    stopCamera();
    const generation = generationRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      if (generation !== generationRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => {});
      }
      setCamera({ status: "ready" });
    } catch (e) {
      if (generation !== generationRef.current) return;
      setCamera({ status: "error", error: toCameraError(e) });
    }
  }, [stopCamera]);

  useEffect(() => {
    headingRef.current?.focus();
    startCamera();
    return () => {
      cancelRef.current = true;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const runSession = async () => {
    if (shooting || camera.status !== "ready" || !videoRef.current) return;
    cancelRef.current = false;
    setShooting(true);
    setShots([]);

    const taken: string[] = [];
    for (let i = 0; i < shotCount; i++) {
      for (let s = COUNTDOWN_SECONDS; s > 0; s--) {
        if (cancelRef.current) break;
        setCountdown(s);
        setAnnouncement(s === COUNTDOWN_SECONDS ? `Shot ${i + 1} of ${shotCount} in ${s}` : String(s));
        await wait(1000);
      }
      setCountdown(null);
      if (cancelRef.current) break;

      const shot = videoRef.current ? captureFrame(videoRef.current) : null;
      if (shot) {
        taken.push(shot);
        setShots([...taken]);
      }
      setAnnouncement(`Shot ${i + 1} taken.`);
      if (!reducedMotion) {
        setFlash(true);
        await wait(FLASH_MS);
        setFlash(false);
      }
      if (i < shotCount - 1) await wait(PAUSE_BETWEEN_SHOTS_MS);
    }

    setShooting(false);
    setCountdown(null);
    if (cancelRef.current) {
      setShots([]);
      setAnnouncement("Stopped. Start again when you're ready.");
      return;
    }
    if (taken.length === shotCount) {
      stopCamera();
      onDone(taken);
    }
  };

  const cancel = () => {
    cancelRef.current = true;
  };

  const error = camera.status === "error" ? ERROR_COPY[camera.error] : null;

  return (
    <section className={styles.cameraLayout} aria-labelledby="shoot-title">
      <div className={styles.stepIntro}>
        <h1 id="shoot-title" ref={headingRef} tabIndex={-1} className="t-h1">
          Squeeze in.
        </h1>
        <p className="t-lead">Pick your shots and a filter, then hit Start. You get three seconds before each one.</p>
      </div>

      <div className={styles.stage}>
        <video
          ref={videoRef}
          className={styles.video}
          playsInline
          muted
          aria-label={`Live camera preview, ${filter.name.toLowerCase()} filter`}
          hidden={camera.status === "error"}
          style={{ filter: previewFilter }}
        />
        {camera.status === "ready" && !!filter.vignette && (
          <div className={styles.vignette} style={{ opacity: filter.vignette }} aria-hidden="true" />
        )}
        {camera.status === "ready" && !!filter.grain && <div className={styles.grain} aria-hidden="true" />}

        {camera.status === "starting" && (
          <div className={styles.stageMessage}>
            <p className="t-label">Opening the camera. Allow access if your browser asks.</p>
          </div>
        )}

        {error && (
          <div className={styles.stageMessage} role="alert">
            <h2 className="t-h3">{error.title}</h2>
            <p>{error.body}</p>
            <div className={styles.actions}>
              <button type="button" className="btn btn-primary" onClick={startCamera}>
                Try again
              </button>
              <Link href="/" className="btn btn-secondary">
                Back home
              </Link>
            </div>
          </div>
        )}

        {countdown !== null && (
          <div className={styles.countdown} aria-hidden="true">
            <span key={countdown} className={`t-hero ${styles.countdownDisc}`}>
              {countdown}
            </span>
          </div>
        )}

        {shooting && (
          <p className={`t-label ${styles.shotBadge}`} aria-hidden="true">
            Shot {Math.min(shots.length + 1, shotCount)} of {shotCount}
          </p>
        )}

        <div className={`${styles.flash} ${flash ? styles.flashOn : ""}`} aria-hidden="true" />
      </div>

      <div className={styles.side}>
        {!error && (
          <>
            <fieldset className={styles.choices} disabled={shooting}>
              <legend className="t-label">Photos in your strip</legend>
              {SHOT_OPTIONS.map((n) => (
                <label key={n} className={`t-label ${styles.choice}`}>
                  <input
                    type="radio"
                    name="shot-count"
                    value={n}
                    checked={n === shotCount}
                    onChange={() => onShotCountChange(n)}
                    className="visually-hidden"
                  />
                  {n} photos
                </label>
              ))}
            </fieldset>
            <FilterPicker name="shoot-filter" value={filter} onChange={onFilterChange} disabled={shooting} />
          </>
        )}
        <div className={styles.actions} hidden={!!error}>
          {shooting ? (
            <button type="button" className="btn btn-secondary btn-lg" onClick={cancel}>
              Stop
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={runSession}
              disabled={camera.status !== "ready"}
            >
              Start
            </button>
          )}
        </div>

        <div>
          <h2 className="t-label muted">Your shots</h2>
          {shots.length === 0 && !shooting && <p className="muted">Nobody&apos;s posing yet.</p>}
          <ol className={styles.thumbs}>
            {Array.from({ length: shotCount }, (_, i) => (
              <li key={i} className={styles.thumb}>
                {shots[i] ? (
                  <img src={shots[i]} alt={`Shot ${i + 1}`} style={{ filter: previewFilter }} />
                ) : (
                  <span className="t-label muted">
                    <span className="visually-hidden">Shot </span>
                    {i + 1}
                    <span className="visually-hidden">, not taken yet</span>
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}
