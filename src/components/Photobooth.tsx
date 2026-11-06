"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FILTERS, FilterId, applyFilter } from "@/lib/filters";
import { FRAMES, PHOTO_H, PHOTO_W, composeStrip } from "@/lib/strip";

type CamState = "idle" | "starting" | "ready" | "error";

const SHOT_OPTIONS = [1, 3, 4];
const COUNTDOWN_OPTIONS = [3, 5, 10];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Photobooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cancelRef = useRef(false);

  const [camState, setCamState] = useState<CamState>("idle");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterId>("none");
  const [frameId, setFrameId] = useState(FRAMES[0].id);
  const [shotCount, setShotCount] = useState(4);
  const [countdownSecs, setCountdownSecs] = useState(3);
  const [caption, setCaption] = useState("photobooth");

  const [photos, setPhotos] = useState<string[]>([]);
  const [shooting, setShooting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [strip, setStrip] = useState<string | null>(null);

  const frame = FRAMES.find((f) => f.id === frameId) ?? FRAMES[0];
  const filterCss = FILTERS.find((f) => f.id === filter)?.css ?? "none";

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamState("error");
      setError("Your browser doesn't support camera access. Try a recent version of Chrome, Safari or Firefox.");
      return;
    }
    setCamState("starting");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamState("ready");
    } catch (e) {
      setCamState("error");
      const name = (e as DOMException)?.name;
      setError(
        name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in your browser settings, then try again."
          : name === "NotFoundError"
            ? "No camera was found on this device."
            : "Couldn't start the camera. Check whether another app is using it."
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /** Grabs a mirrored, center-cropped 4:3 frame with the selected filter applied. */
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const canvas = document.createElement("canvas");
    canvas.width = PHOTO_W;
    canvas.height = PHOTO_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    const vw = video.videoWidth, vh = video.videoHeight;
    const target = PHOTO_W / PHOTO_H;
    let sw = vw, sh = vh, sx = 0, sy = 0;
    if (vw / vh > target) { sw = vh * target; sx = (vw - sw) / 2; }
    else { sh = vw / target; sy = (vh - sh) / 2; }

    ctx.translate(PHOTO_W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, PHOTO_W, PHOTO_H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    applyFilter(ctx, PHOTO_W, PHOTO_H, filter);
    return canvas.toDataURL("image/jpeg", 0.92);
  }, [filter]);

  const runSession = useCallback(async () => {
    if (shooting || camState !== "ready") return;
    cancelRef.current = false;
    setShooting(true);
    setStrip(null);
    setPhotos([]);

    const taken: string[] = [];
    for (let i = 0; i < shotCount; i++) {
      for (let s = countdownSecs; s > 0; s--) {
        if (cancelRef.current) break;
        setCountdown(s);
        await wait(1000);
      }
      if (cancelRef.current) break;
      setCountdown(null);
      const shot = captureFrame();
      if (shot) {
        taken.push(shot);
        setPhotos([...taken]);
      }
      setFlash(true);
      await wait(180);
      setFlash(false);
      if (i < shotCount - 1) await wait(700);
    }

    setCountdown(null);
    setShooting(false);
    if (!cancelRef.current && taken.length) {
      setStrip(await composeStrip(taken, frame, caption));
    }
  }, [shooting, camState, shotCount, countdownSecs, captureFrame, frame, caption]);

  // Rebuild the strip when the frame or caption changes after shooting.
  useEffect(() => {
    if (shooting || photos.length === 0 || photos.length < shotCount) return;
    let alive = true;
    composeStrip(photos, frame, caption).then((url) => alive && setStrip(url));
    return () => { alive = false; };
  }, [frame, caption]); // eslint-disable-line react-hooks/exhaustive-deps

  const cancel = () => { cancelRef.current = true; };

  const reset = () => { setPhotos([]); setStrip(null); };

  const download = () => {
    if (!strip) return;
    const a = document.createElement("a");
    a.href = strip;
    a.download = `photobooth-${Date.now()}.png`;
    a.click();
  };

  const share = async () => {
    if (!strip) return;
    try {
      const blob = await (await fetch(strip)).blob();
      const file = new File([blob], "photobooth.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My photobooth strip" });
      } else {
        download();
      }
    } catch {
      /* user dismissed share sheet */
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Camera + controls */}
      <section className="flex flex-col gap-5">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-xl ring-1 ring-black/10">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
            style={{ filter: filterCss }}
          />

          {camState !== "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-neutral-200">
              {camState === "error" ? (
                <p className="max-w-sm text-sm text-red-300">{error}</p>
              ) : (
                <p className="max-w-sm text-sm text-neutral-400">
                  Your photos stay on this device. Nothing gets uploaded.
                </p>
              )}
              <button
                onClick={startCamera}
                disabled={camState === "starting"}
                className="rounded-full bg-rose-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-rose-600 disabled:opacity-60"
              >
                {camState === "starting" ? "Starting camera…" : camState === "error" ? "Try again" : "Turn on camera"}
              </button>
            </div>
          )}

          {countdown !== null && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span key={countdown} className="animate-pop text-[9rem] font-black leading-none text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                {countdown}
              </span>
            </div>
          )}

          {shooting && (
            <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              Photo {Math.min(photos.length + 1, shotCount)} / {shotCount}
            </div>
          )}

          <div
            className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${flash ? "opacity-90" : "opacity-0"}`}
          />
        </div>

        {/* Filters */}
        <div>
          <Label>Filter</Label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} disabled={shooting}>
                {f.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label>Photos</Label>
            <div className="flex gap-2">
              {SHOT_OPTIONS.map((n) => (
                <Chip key={n} active={shotCount === n} onClick={() => setShotCount(n)} disabled={shooting}>
                  {n}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <Label>Timer</Label>
            <div className="flex gap-2">
              {COUNTDOWN_OPTIONS.map((n) => (
                <Chip key={n} active={countdownSecs === n} onClick={() => setCountdownSecs(n)} disabled={shooting}>
                  {n}s
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {shooting ? (
            <button onClick={cancel} className="rounded-full bg-neutral-800 px-8 py-4 text-lg font-semibold text-white transition hover:bg-neutral-700">
              Cancel
            </button>
          ) : (
            <button
              onClick={runSession}
              disabled={camState !== "ready"}
              className="rounded-full bg-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {photos.length ? "Retake" : "Start"}
            </button>
          )}
          {photos.length > 0 && !shooting && (
            <button onClick={reset} className="rounded-full border border-neutral-300 px-6 py-4 font-medium text-neutral-700 transition hover:bg-neutral-100">
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Strip */}
      <aside className="flex flex-col gap-5">
        <div>
          <Label>Frame</Label>
          <div className="flex flex-wrap gap-2">
            {FRAMES.map((f) => (
              <button
                key={f.id}
                onClick={() => setFrameId(f.id)}
                title={f.label}
                aria-label={`${f.label} frame`}
                className={`h-9 w-9 rounded-full ring-1 ring-black/15 transition ${frameId === f.id ? "scale-110 outline-2 outline-offset-2 outline-rose-500" : ""}`}
                style={{ background: f.bg }}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>Caption</Label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 24))}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            placeholder="photobooth"
          />
        </div>

        <div className="rounded-xl p-3 shadow-lg ring-1 ring-black/10" style={{ background: frame.bg }}>
          {strip ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={strip} alt="Your photo strip" className="w-full" />
          ) : (
            <div className="flex flex-col gap-2">
              {Array.from({ length: shotCount }).map((_, i) =>
                photos[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={photos[i]} alt={`Photo ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div key={i} className="flex aspect-[4/3] w-full items-center justify-center bg-black/10 text-sm font-medium" style={{ color: frame.text, opacity: 0.5 }}>
                    {i + 1}
                  </div>
                )
              )}
              <p className="py-2 text-center font-serif text-lg font-bold" style={{ color: frame.text }}>
                {caption || "photobooth"}
              </p>
            </div>
          )}
        </div>

        {strip && (
          <div className="flex gap-3">
            <button onClick={download} className="flex-1 rounded-full bg-neutral-900 px-5 py-3 font-semibold text-white transition hover:bg-neutral-700">
              Download
            </button>
            <button onClick={share} className="flex-1 rounded-full border border-neutral-300 px-5 py-3 font-semibold text-neutral-800 transition hover:bg-neutral-100">
              Share
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">{children}</p>;
}

function Chip({
  active, children, ...props
}: { active: boolean; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
        active ? "bg-neutral-900 text-white" : "bg-white text-neutral-700 ring-1 ring-neutral-300 hover:bg-neutral-100"
      }`}
    >
      {children}
    </button>
  );
}
