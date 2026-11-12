// Meerkeuze met chips. options: [{ key, label }]
export default function ChipSelect({ options, value = [], onChange }) {
  const toggle = (k) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.key} type="button" onClick={() => toggle(o.key)}
          className={`rounded-full border px-2.5 py-1 text-xs ${value.includes(o.key) ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:border-primary"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
