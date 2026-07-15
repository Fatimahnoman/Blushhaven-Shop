import { type ComponentProps } from "react";

type FieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<ComponentProps<"input">, "value" | "onChange" | "type">;

export function Field({ label, type = "text", value, onChange, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="section-label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={200}
        className="mt-2 w-full input-premium"
        {...rest}
      />
    </label>
  );
}

type TextareaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
};

export function TextareaField({ label, value, onChange, maxLength = 1000, rows = 4 }: TextareaFieldProps) {
  return (
    <label className="block">
      <span className="section-label">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={rows}
        className="mt-2 w-full input-premium min-h-28 resize-none"
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="section-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full input-premium cursor-pointer appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}
