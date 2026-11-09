Pose is a photobooth app. The brand borrows from the real thing: the red curtain, the burst of the flash, the paper of a fresh print.

## Voice

Write short, warm and a little bossy, like the friend organising the photo. Use sentence case and "you". Skip emoji in interface copy.

- Headline: "Everyone in."
- Button: "Start a booth"
- Empty state: "Nobody's posing yet."

## Logo

The mark is a P built from a booth's two signature objects: the stem is a strip of three photo frames, and the bowl is a camera lens.

- Use `pose-logo.svg` in the site header on light grounds, and `pose-logo-reversed.svg` on dark grounds.
- Use `pose-mark.svg` when space is tight, and `pose-app-icon.svg` for the favicon and app stores.
- Use `pose-mark-ink.svg` or `pose-mark-paper.svg` for one-colour printing.
- Keep clear space around the logo equal to the lens diameter. Show the mark at 24px or larger.
- Never recolour, stretch or add effects to the logo, and never place the two-colour version on `curtain`. Use `pose-mark-paper.svg` there.

## Colour

Build each page mostly from `ground`, `surface` and `ink`, so `curtain` lands with force.

- Use `curtain` for primary buttons, links and one full-bleed section per page, with `on-curtain` content.
- Use `flash` sparingly, for a badge or highlight behind `on-flash` text. Never set `flash` text on `ground`.
- Use `blush` for quieter tinted sections, with `ink` text.
- Keep `muted` for secondary copy on `ground` and `surface`.
- Outline inputs and secondary buttons with `control-line`. Keep `line` for decorative dividers.
- Draw focus rings 2px solid in `ink`, offset 2px.

## Type

Load both faces from Google Fonts:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Instrument+Sans:wght@400;600&display=swap">
```

Set headlines in `hero`, `h1`, `h2` and `h3`. Set running copy in `body`, intros in `lead`, and interface text in `label`. Use one `hero` per page.

## Layout

- Use `space-16` between sections and `space-8` between grid items. Use `space-4` for phone gutters.
- Round buttons with `radius-pill`, cards with `radius-md`, and photos and inputs with `radius-sm`.
- Separate surfaces with flat colour or a `line` border, not shadows.
- Let real photos of people do the visual work. Show them in strips of frames, echoing the logo's stem.
