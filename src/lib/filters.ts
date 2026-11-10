/**
 * Photo filters. Each filter is a list of CSS filter operations, so one
 * definition drives both the live preview (CSS `filter`) and the exported
 * strip (canvas `filter`, or a pixel fallback for browsers without it,
 * such as Safari before 18).
 */
type Op =
  | { fn: "grayscale" | "sepia" | "saturate" | "contrast" | "brightness"; v: number }
  | { fn: "hue-rotate"; v: number /* degrees */ };

export type Filter = {
  id: string;
  name: string;
  ops: Op[];
  /** Darkens the edges, 0–1. */
  vignette?: number;
  /** Film grain strength, 0–1. */
  grain?: number;
};

export const FILTERS: Filter[] = [
  { id: "original", name: "Original", ops: [] },
  { id: "mono", name: "Mono", ops: [{ fn: "grayscale", v: 1 }] },
  {
    id: "noir",
    name: "Noir",
    ops: [{ fn: "grayscale", v: 1 }, { fn: "contrast", v: 1.45 }, { fn: "brightness", v: 0.95 }],
  },
  { id: "sepia", name: "Sepia", ops: [{ fn: "sepia", v: 0.85 }] },
  {
    id: "vintage",
    name: "Vintage",
    ops: [{ fn: "sepia", v: 0.4 }, { fn: "saturate", v: 0.8 }, { fn: "contrast", v: 1.1 }, { fn: "brightness", v: 1.05 }],
  },
  {
    id: "warm",
    name: "Warm",
    ops: [{ fn: "sepia", v: 0.2 }, { fn: "saturate", v: 1.3 }, { fn: "hue-rotate", v: -10 }],
  },
  {
    id: "cool",
    name: "Cool",
    ops: [{ fn: "saturate", v: 1.1 }, { fn: "hue-rotate", v: 12 }, { fn: "brightness", v: 1.03 }],
  },
  { id: "pop", name: "Pop", ops: [{ fn: "saturate", v: 1.7 }, { fn: "contrast", v: 1.2 }] },
  {
    // The old chemical-booth look: warm brown monochrome, deep shadows, dark edges, grain.
    id: "darkroom",
    name: "Darkroom",
    ops: [
      { fn: "grayscale", v: 1 },
      { fn: "sepia", v: 0.6 },
      { fn: "contrast", v: 1.25 },
      { fn: "brightness", v: 0.88 },
    ],
    vignette: 0.55,
    grain: 0.09,
  },
];

export const DEFAULT_FILTER = FILTERS[0];

export function filterCss(filter: Filter): string {
  if (filter.ops.length === 0) return "none";
  return filter.ops.map((o) => (o.fn === "hue-rotate" ? `hue-rotate(${o.v}deg)` : `${o.fn}(${o.v})`)).join(" ");
}

let canvasFilterSupport: boolean | null = null;
function supportsCanvasFilter(): boolean {
  if (canvasFilterSupport === null) {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx && "filter" in ctx) {
      ctx.filter = "grayscale(1)";
      canvasFilterSupport = ctx.filter === "grayscale(1)";
    } else {
      canvasFilterSupport = false;
    }
  }
  return canvasFilterSupport;
}

type M = number[]; // 3x3 row-major colour matrix

function matrixFor(op: Op): M | null {
  const v = op.v;
  switch (op.fn) {
    case "grayscale": {
      const s = 1 - Math.min(1, v);
      return [
        0.2126 + 0.7874 * s, 0.7152 - 0.7152 * s, 0.0722 - 0.0722 * s,
        0.2126 - 0.2126 * s, 0.7152 + 0.2848 * s, 0.0722 - 0.0722 * s,
        0.2126 - 0.2126 * s, 0.7152 - 0.7152 * s, 0.0722 + 0.9278 * s,
      ];
    }
    case "sepia": {
      const s = 1 - Math.min(1, v);
      return [
        0.393 + 0.607 * s, 0.769 - 0.769 * s, 0.189 - 0.189 * s,
        0.349 - 0.349 * s, 0.686 + 0.314 * s, 0.168 - 0.168 * s,
        0.272 - 0.272 * s, 0.534 - 0.534 * s, 0.131 + 0.869 * s,
      ];
    }
    case "saturate":
      return [
        0.213 + 0.787 * v, 0.715 - 0.715 * v, 0.072 - 0.072 * v,
        0.213 - 0.213 * v, 0.715 + 0.285 * v, 0.072 - 0.072 * v,
        0.213 - 0.213 * v, 0.715 - 0.715 * v, 0.072 + 0.928 * v,
      ];
    case "hue-rotate": {
      const a = (v * Math.PI) / 180;
      const c = Math.cos(a);
      const s = Math.sin(a);
      return [
        0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
        0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283,
        0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072,
      ];
    }
    default:
      return null;
  }
}

const clamp = (x: number) => (x < 0 ? 0 : x > 255 ? 255 : x);

/** Pixel fallback that follows the CSS filter-function maths. */
function applyOpsToPixels(data: Uint8ClampedArray, ops: Op[]) {
  const steps = ops.map((op) => ({ op, m: matrixFor(op) }));
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    for (const { op, m } of steps) {
      if (m) {
        const nr = m[0] * r + m[1] * g + m[2] * b;
        const ng = m[3] * r + m[4] * g + m[5] * b;
        const nb = m[6] * r + m[7] * g + m[8] * b;
        r = nr; g = ng; b = nb;
      } else if (op.fn === "brightness") {
        r *= op.v; g *= op.v; b *= op.v;
      } else if (op.fn === "contrast") {
        r = (r - 127.5) * op.v + 127.5;
        g = (g - 127.5) * op.v + 127.5;
        b = (b - 127.5) * op.v + 127.5;
      }
      r = clamp(r); g = clamp(g); b = clamp(b);
    }
    data[i] = r; data[i + 1] = g; data[i + 2] = b;
  }
}

/**
 * Returns a canvas holding the photo with the full filter applied: colour
 * operations, then vignette and grain. `edgeColor` is the vignette colour
 * (pass a token value, such as `ink`).
 */
export function renderFilteredPhoto(
  img: CanvasImageSource,
  filter: Filter,
  w: number,
  h: number,
  edgeColor: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: !!filter.grain });
  if (!ctx) return canvas;

  drawFiltered(ctx, img, filter, 0, 0, w, h);

  if (filter.vignette) {
    const r = Math.hypot(w, h) / 2;
    const g = ctx.createRadialGradient(w / 2, h / 2, r * 0.45, w / 2, h / 2, r);
    g.addColorStop(0, "transparent");
    g.addColorStop(1, edgeColor);
    ctx.save();
    ctx.globalAlpha = filter.vignette;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  if (filter.grain) {
    const pixels = ctx.getImageData(0, 0, w, h);
    const d = pixels.data;
    const amount = filter.grain * 255;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * amount;
      d[i] = clamp(d[i] + n);
      d[i + 1] = clamp(d[i + 1] + n);
      d[i + 2] = clamp(d[i + 2] + n);
    }
    ctx.putImageData(pixels, 0, 0);
  }

  return canvas;
}

/** Draws an image with the filter's colour operations applied into the given rectangle. */
function drawFiltered(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  filter: Filter,
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (filter.ops.length === 0) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }
  if (supportsCanvasFilter()) {
    const prev = ctx.filter;
    ctx.filter = filterCss(filter);
    ctx.drawImage(img, x, y, w, h);
    ctx.filter = prev;
    return;
  }
  const tmp = document.createElement("canvas");
  tmp.width = Math.round(w);
  tmp.height = Math.round(h);
  const tctx = tmp.getContext("2d", { willReadFrequently: true });
  if (!tctx) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }
  tctx.drawImage(img, 0, 0, tmp.width, tmp.height);
  const pixels = tctx.getImageData(0, 0, tmp.width, tmp.height);
  applyOpsToPixels(pixels.data, filter.ops);
  tctx.putImageData(pixels, 0, 0);
  ctx.drawImage(tmp, x, y, w, h);
}
