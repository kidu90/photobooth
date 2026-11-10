"use client";

import { FILTERS, Filter } from "@/lib/filters";
import styles from "./Booth.module.css";

export default function FilterPicker({
  value,
  onChange,
  disabled = false,
  name,
}: {
  value: Filter;
  onChange: (filter: Filter) => void;
  disabled?: boolean;
  /** Unique radio-group name, in case two pickers render on one page. */
  name: string;
}) {
  return (
    <fieldset className={styles.choices} disabled={disabled}>
      <legend className="t-label">Filter</legend>
      {FILTERS.map((f) => (
        <label key={f.id} className={`t-label ${styles.choice}`}>
          <input
            type="radio"
            name={name}
            value={f.id}
            checked={f.id === value.id}
            onChange={() => onChange(f)}
            className="visually-hidden"
          />
          {f.name}
        </label>
      ))}
    </fieldset>
  );
}
