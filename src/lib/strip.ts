import type { Frame } from "./frames";

/**
 * Strip geometry, in CSS pixels, built from spacing tokens. The PNG is drawn
 * at EXPORT_SCALE times this size so it prints and shares sharply.
 */
export const EXPORT_SCALE = 3;
export const SHOT_COUNT = 4;
/** Photos are 4:3 landscape, like the camera preview. */
export const PHOTO_ASPECT = 4 / 3;
const PHOTO_CSS_WIDTH = 320;

export const PHOTO_PX_W = PHOTO_CSS_WIDTH * EXPORT_SCALE;
export const PHOTO_PX_H = Math.round(PHOTO_PX_W / PHOTO_ASPECT);

function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

function readPx(name: string): number {
  return parseFloat(readToken(name)) || 0;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Couldn't load ${src}`));
    img.src = src;
  });
}

/** Grabs one mirrored, centre-cropped 4:3 frame from the live video. */
export function captureFrame(video: HTMLVideoElement): string | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_PX_W;
  canvas.height = PHOTO_PX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let sw = vw, sh = vh, sx = 0, sy = 0;
  if (vw / vh > PHOTO_ASPECT) {
    sw = vh * PHOTO_ASPECT;
    sx = (vw - sw) / 2;
  } else {
    sh = vw / PHOTO_ASPECT;
    sy = (vh - sh) / 2;
  }

  // Mirror it so the photo matches what people saw in the preview.
  ctx.translate(PHOTO_PX_W, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, PHOTO_PX_W, PHOTO_PX_H);
  return canvas.toDataURL("image/jpeg", 0.92);
}

/** Stacks the photos into a vertical strip in the chosen frame colour. */
export async function renderStrip(photos: string[], frame: Frame): Promise<HTMLCanvasElement> {
  const s = EXPORT_SCALE;
  const pad = readPx("space-4") * s;
  const gap = readPx("space-2") * s;
  const radius = readPx("radius-sm") * s;
  const logoH = readPx("space-8") * s;
  const footer = (readPx("space-16") + readPx("space-8")) * s;

  const width = PHOTO_PX_W + pad * 2;
  const height = pad + photos.length * PHOTO_PX_H + (photos.length - 1) * gap + footer;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas isn't available");

  ctx.fillStyle = readToken(frame.bg);
  ctx.fillRect(0, 0, width, height);

  const [images, logo] = await Promise.all([
    Promise.all(photos.map(loadImage)),
    loadImage(frame.logo),
  ]);

  images.forEach((img, i) => {
    const y = pad + i * (PHOTO_PX_H + gap);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pad, y, PHOTO_PX_W, PHOTO_PX_H, radius);
    ctx.clip();
    ctx.drawImage(img, pad, y, PHOTO_PX_W, PHOTO_PX_H);
    ctx.restore();
  });

  // Footer: logo on the left, date on the right.
  const footerTop = height - footer;
  const logoW = (logo.naturalWidth / logo.naturalHeight) * logoH;
  const logoY = footerTop + (footer - logoH) / 2;
  ctx.drawImage(logo, pad, logoY, logoW, logoH);

  const labelFamily = readToken("font-body");
  const labelWeight = readToken("type-label-weight");
  const labelSize = readPx("type-label-size") * s;
  const font = `${labelWeight} ${labelSize}px ${labelFamily}`;
  try {
    await document.fonts.load(font);
  } catch {
    /* fall back to the system font in the stack */
  }
  ctx.font = font;
  ctx.fillStyle = readToken(frame.fg);
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const date = new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  ctx.fillText(date, width - pad, logoY + logoH / 2);

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't export the strip"))), "image/png");
  });
}
