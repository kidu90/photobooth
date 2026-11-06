export type FrameStyle = { id: string; label: string; bg: string; text: string };

export const FRAMES: FrameStyle[] = [
  { id: "classic", label: "Classic", bg: "#ffffff", text: "#111111" },
  { id: "noir", label: "Noir", bg: "#111111", text: "#f5f5f5" },
  { id: "blush", label: "Blush", bg: "#f9d5dc", text: "#7a2e3b" },
  { id: "mint", label: "Mint", bg: "#cdeee0", text: "#1f5a44" },
  { id: "butter", label: "Butter", bg: "#fbefb4", text: "#6b5310" },
  { id: "sky", label: "Sky", bg: "#cfe4fb", text: "#1d3f66" },
];

export const PHOTO_W = 640;
export const PHOTO_H = 480;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Lays the photos out as a vertical strip and returns it as a PNG data URL. */
export async function composeStrip(photos: string[], frame: FrameStyle, caption: string): Promise<string> {
  const pad = 36;
  const gap = 24;
  const footer = 130;
  const w = PHOTO_W + pad * 2;
  const h = pad + photos.length * PHOTO_H + (photos.length - 1) * gap + footer;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = frame.bg;
  ctx.fillRect(0, 0, w, h);

  const images = await Promise.all(photos.map(loadImage));
  images.forEach((img, i) => {
    ctx.drawImage(img, pad, pad + i * (PHOTO_H + gap), PHOTO_W, PHOTO_H);
  });

  const footerTop = h - footer;
  ctx.fillStyle = frame.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 40px Georgia, 'Times New Roman', serif";
  ctx.fillText(caption || "photobooth", w / 2, footerTop + 52);
  ctx.font = "400 22px ui-monospace, Menlo, monospace";
  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  ctx.fillText(date.toUpperCase(), w / 2, footerTop + 96);

  return canvas.toDataURL("image/png");
}
