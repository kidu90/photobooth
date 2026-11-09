// Generates src/styles/tokens.css from design-system/tokens.json.
// Run with `npm run tokens` whenever tokens.json changes. Never edit tokens.css by hand.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(resolve(root, "design-system/tokens.json"), "utf8"));
const out = resolve(root, "src/styles/tokens.css");

const themes = tokens.color.themes.map((t) => t.id);
const [primary] = themes;
const colorFor = (tok, theme) =>
  typeof tok.value === "string" ? tok.value : (tok.value[theme] ?? tok.value[primary]);
const resolveAlias = (v) => v.replace(/^\{(.+)\}$/, "var(--$1)");

const lines = [`/* ${tokens.name} — generated from design-system/tokens.json by scripts/tokens-to-css.mjs. Do not edit. */`, ""];

// Light (primary theme) is the default. The site is light-only for now, so nothing sets
// data-theme="dark" yet, but the dark values are kept here so it can be turned on later.
lines.push(":root {", `  color-scheme: ${primary};`);
for (const tok of tokens.color.tokens) lines.push(`  --${tok.name}: ${resolveAlias(colorFor(tok, primary))};`);
lines.push("");
for (const [name, stack] of Object.entries(tokens.type.families)) lines.push(`  --font-${name}: ${stack};`);
lines.push("");
for (const group of tokens.type.groups) {
  for (const s of group.styles) {
    const p = `--type-${s.name}`;
    lines.push(`  ${p}-family: var(--font-${s.family ?? group.family});`);
    lines.push(`  ${p}-size: ${s.fontSize};`);
    lines.push(`  ${p}-line: ${s.lineHeight};`);
    lines.push(`  ${p}-weight: ${s.fontWeight};`);
    lines.push(`  ${p}-tracking: ${s.letterSpacing ?? "normal"};`);
  }
}
lines.push("");
for (const fam of ["spacing", "radius", "shadow"]) {
  for (const tok of tokens[fam]?.tokens ?? []) lines.push(`  --${tok.name}: ${tok.value};`);
}
lines.push("}", "");

for (const theme of themes.slice(1)) {
  lines.push(`:root[data-theme="${theme}"] {`, `  color-scheme: ${theme};`);
  for (const tok of tokens.color.tokens) lines.push(`  --${tok.name}: ${resolveAlias(colorFor(tok, theme))};`);
  lines.push("}", "");
}

// One class per text style, so components never restate sizes or weights.
for (const group of tokens.type.groups) {
  for (const s of group.styles) {
    const p = `--type-${s.name}`;
    lines.push(
      `.t-${s.name} {`,
      `  font-family: var(${p}-family);`,
      `  font-size: var(${p}-size);`,
      `  line-height: var(${p}-line);`,
      `  font-weight: var(${p}-weight);`,
      `  letter-spacing: var(${p}-tracking);`,
      "}",
      ""
    );
  }
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join("\n"));
console.log(`Wrote ${out}`);
