interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function Field({ label, type = "text", value, onChange, placeholder }: FieldProps) {
  return (
    <label className="block">
      <span className="text-ink-dim text-xs tracking-[0.2em] uppercase font-body">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full bg-panel border border-line rounded-none px-4 py-3 font-body text-ink
                   focus:outline-none focus:border-gold transition-colors"
      />
    </label>
  );
}