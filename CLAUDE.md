# Pose

Pose is a photobooth web app: friends squeeze in, take four shots, and get a photo strip they can download and share. Next.js 15 (App Router) + TypeScript, deployed on Vercel. Everything runs client-side: no backend, no accounts, photos never leave the device.

- `npm run dev`: local dev server at http://localhost:3000
- `npm run build`: production build (runs `npm run tokens` first)
- `npm run lint`: ESLint

Routes: `/` is the landing page and `/booth` is the booth. The booth is one client component ([src/components/booth/BoothFlow.tsx](src/components/booth/BoothFlow.tsx)) that steps through shoot → frame → share, keeping photos in memory.

## Design system

The UI follows the **Pose design system** (source: https://claude.ai/artifact/1WN3vNa8Q4NungQ9qSKh5R). Local copies:

- [design-system/README.md](design-system/README.md): the brand book and usage rules. Read it before changing UI or copy.
- [design-system/tokens.json](design-system/tokens.json): the source of truth for tokens.
- [design-system/logos.md](design-system/logos.md): which logo file to use where.
- Logos live in [public/brand/](public/brand/). Never redraw, recolour, stretch or add effects to them.

### Tokens

`src/styles/tokens.css` is **generated** from `design-system/tokens.json` by `scripts/tokens-to-css.mjs`. Don't edit it by hand. After changing tokens.json, run `npm run tokens`. The script produces:

- Colour: `--ground --surface --ink --muted --line --control-line --curtain --on-curtain --flash --on-flash --blush`
- Fonts: `--font-display` (Bricolage Grotesque) and `--font-body` (Instrument Sans), loaded from Google Fonts in `src/app/layout.tsx`
- Type classes: `.t-hero .t-h1 .t-h2 .t-h3 .t-lead .t-body .t-label` (plus `--type-<style>-size|line|weight|tracking|family` variables)
- Spacing: `--space-2` (8px), `--space-4` (16px), `--space-8` (32px), `--space-16` (64px)
- Radius: `--radius-sm`, `--radius-md`, `--radius-pill`

### Rules

- Use only tokens for colour, type, spacing and radius in components. No hex values, font sizes, or one-off px paddings or radii. Layout constants (page width, breakpoints, aspect ratios) and motion timings are fine. Canvas drawing reads tokens at runtime with `getComputedStyle` ([src/lib/strip.ts](src/lib/strip.ts)), and frame colours reference token names ([src/lib/frames.ts](src/lib/frames.ts)).
- **Light theme only** (the owner's choice). `:root` holds the light values. The dark values are generated under `:root[data-theme="dark"]`, but nothing sets that attribute and there's no toggle.
- Build pages mostly from `ground`, `surface` and `ink`, so `curtain` lands with force.
- **One `t-hero` per page.** It steps down to h1 size on phones (handled in globals.css).
- **At most one full-bleed `curtain` section per page**, with `on-curtain` content. Buttons on it use `.btn-inverse`.
- `curtain` is for primary buttons (`.btn-primary`) and links. Secondary buttons and inputs are outlined in `control-line` (`.btn-secondary`). `line` is only for decorative dividers and card borders.
- `flash` is for small badges or highlights behind `on-flash` text, and never as text on `ground`. `blush` is for quiet tinted sections and selected states, under `ink`.
- `muted` is for secondary copy on `ground` and `surface`.
- **No shadows.** Separate surfaces with flat colour or a `line` border.
- Spacing: `space-16` between sections (`.section`), `space-8` between grid items, `space-4` as the phone gutter (`.container`).
- Radius: buttons and chips `radius-pill`, cards and panels `radius-md`, photos, inputs and badges `radius-sm`.
- Focus rings are 2px solid `ink`, offset 2px (global `:focus-visible` rule). Don't override them.
- Logos: `pose-logo.svg` on light grounds, `pose-logo-reversed.svg` on dark grounds, `pose-mark-paper.svg` on `curtain` (never the two-colour version there), `pose-mark-ink.svg` for one-colour on light, and `pose-app-icon.svg` as the favicon. Show the mark at 24px or larger.

### Voice

Short, warm and a little bossy, like the friend organising the photo. Use sentence case and "you", and no emoji in interface copy. Examples: "Everyone in.", "Start a booth", "Nobody's posing yet." Don't invent testimonials, user counts or stats. Where a real photo is needed, use a clearly labelled placeholder (`PlaceholderStrip`).

### Accessibility

Use semantic HTML. Every action works from the keyboard. Images have alt text. Each booth step moves focus to its `h1` on entry, and the shoot step announces progress through a polite live region. Respect `prefers-reduced-motion`: the countdown doesn't animate and the capture flash is skipped (`useReducedMotion`).
