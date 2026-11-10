"use client";

import { useEffect, useRef } from "react";
import { FRAMES, Frame, tokenVar } from "@/lib/frames";
import type { Filter } from "@/lib/filters";
import type { StripImage } from "./BoothFlow";
import FilterPicker from "./FilterPicker";
import styles from "./Booth.module.css";

export default function StripEditor({
  strip,
  error,
  frame,
  onFrameChange,
  filter,
  onFilterChange,
  onRetake,
  onDone,
}: {
  strip: StripImage | null;
  error: boolean;
  frame: Frame;
  onFrameChange: (frame: Frame) => void;
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  onRetake: () => void;
  onDone: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <section className={styles.editorLayout} aria-labelledby="edit-title">
      <div className={styles.stripPreview}>
        {strip ? (
          <img src={strip.url} alt={`Your photo strip: four shots in a ${frame.name.toLowerCase()} frame${filter.ops.length ? `, ${filter.name.toLowerCase()} filter` : ""}`} />
        ) : error ? (
          <p role="alert">We couldn&apos;t put your strip together. Retake the set and try again.</p>
        ) : (
          <p className="t-label muted">Developing your strip…</p>
        )}
      </div>

      <div className={styles.side}>
        <div className={styles.stepIntro}>
          <h1 id="edit-title" ref={headingRef} tabIndex={-1} className="t-h1">
            Pick a frame.
          </h1>
          <p className="t-lead">Choose a colour and a filter. You can change them until you share.</p>
        </div>

        <fieldset className={styles.choices}>
          <legend className="t-label">Frame colour</legend>
          {FRAMES.map((f) => (
            <label key={f.id} className={styles.choice}>
              <input
                type="radio"
                name="frame"
                value={f.id}
                checked={f.id === frame.id}
                onChange={() => onFrameChange(f)}
                className="visually-hidden"
              />
              <span className={styles.swatch} style={{ background: tokenVar(f.bg) }} aria-hidden="true" />
              <span className="t-label">{f.name}</span>
            </label>
          ))}
        </fieldset>

        <FilterPicker name="edit-filter" value={filter} onChange={onFilterChange} />

        <div className={styles.actions}>
          <button type="button" className="btn btn-primary btn-lg" onClick={onDone} disabled={!strip}>
            Looks good
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={onRetake}>
            Retake the set
          </button>
        </div>
      </div>
    </section>
  );
}
