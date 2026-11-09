/**
 * Strip frame colours. Each one names design-system tokens, never raw values:
 * `bg` is the frame colour, `fg` the text on it, and `logo` the logo variant
 * the README allows on that ground.
 */
export type Frame = {
  id: string;
  name: string;
  bg: string;
  fg: string;
  logo: string;
};

export const FRAMES: Frame[] = [
  { id: "paper", name: "Paper", bg: "ground", fg: "ink", logo: "/brand/pose-logo.svg" },
  { id: "white", name: "White", bg: "surface", fg: "ink", logo: "/brand/pose-logo.svg" },
  { id: "blush", name: "Blush", bg: "blush", fg: "ink", logo: "/brand/pose-logo.svg" },
  { id: "flash", name: "Flash", bg: "flash", fg: "on-flash", logo: "/brand/pose-mark-ink.svg" },
  { id: "curtain", name: "Curtain", bg: "curtain", fg: "on-curtain", logo: "/brand/pose-mark-paper.svg" },
  { id: "ink", name: "Ink", bg: "ink", fg: "ground", logo: "/brand/pose-logo-reversed.svg" },
];

export const DEFAULT_FRAME = FRAMES[0];

export const tokenVar = (name: string) => `var(--${name})`;
