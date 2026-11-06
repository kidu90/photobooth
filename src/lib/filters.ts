export type FilterId = "none" | "bw" | "sepia" | "vintage" | "warm" | "cool" | "punch";

export const FILTERS: { id: FilterId; label: string; css: string }[] = [
  { id: "none", label: "Original", css: "none" },
  { id: "bw", label: "B&W", css: "grayscale(1) contrast(1.1)" },
  { id: "sepia", label: "Sepia", css: "sepia(1)" },
  { id: "vintage", label: "Vintage", css: "sepia(0.45) contrast(1.15) saturate(0.8) brightness(1.05)" },
  { id: "warm", label: "Warm", css: "saturate(1.2) hue-rotate(-12deg) brightness(1.05)" },
  { id: "cool", label: "Cool", css: "saturate(1.05) hue-rotate(15deg) brightness(1.02)" },
  { id: "punch", label: "Punch", css: "contrast(1.35) saturate(1.5)" },
];

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/**
 * Applies the filter directly to pixel data. This works in every browser,
 * unlike ctx.filter, which older Safari versions don't support.
 */
export function applyFilter(ctx: CanvasRenderingContext2D, w: number, h: number, id: FilterId) {
  if (id === "none") return;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    switch (id) {
      case "bw": {
        const v = (lum - 128) * 1.1 + 128;
        r = g = b = v;
        break;
      }
      case "sepia": {
        const sr = 0.393 * r + 0.769 * g + 0.189 * b;
        const sg = 0.349 * r + 0.686 * g + 0.168 * b;
        const sb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = sr; g = sg; b = sb;
        break;
      }
      case "vintage": {
        const sr = 0.393 * r + 0.769 * g + 0.189 * b;
        const sg = 0.349 * r + 0.686 * g + 0.168 * b;
        const sb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = r * 0.55 + sr * 0.45;
        g = g * 0.55 + sg * 0.45;
        b = b * 0.55 + sb * 0.45;
        r = (r - 128) * 1.15 + 128 + 8;
        g = (g - 128) * 1.15 + 128 + 4;
        b = (b - 128) * 1.15 + 128 - 6;
        break;
      }
      case "warm":
        r = r * 1.1 + 10; g = g * 1.02 + 4; b = b * 0.88;
        break;
      case "cool":
        r = r * 0.9; g = g * 1.0 + 2; b = b * 1.12 + 10;
        break;
      case "punch": {
        const s = 1.5, c = 1.35;
        r = lum + (r - lum) * s; g = lum + (g - lum) * s; b = lum + (b - lum) * s;
        r = (r - 128) * c + 128; g = (g - 128) * c + 128; b = (b - 128) * c + 128;
        break;
      }
    }
    d[i] = clamp(r); d[i + 1] = clamp(g); d[i + 2] = clamp(b);
  }
  ctx.putImageData(img, 0, 0);
}
