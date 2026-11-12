import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Eén invulveld van een opdracht. value/onChange werken met de ruwe waarde.
export default function FieldInput({ field, value, onChange, disabled }) {
  const common = { id: field.key, disabled };
  switch (field.type) {
    case "info":
      return null;
    case "text":
      return <Input {...common} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return (
        <Input {...common} type="number" min={field.min} max={field.max} className="max-w-[10rem]"
          value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />
      );
    case "date":
      return <Input {...common} type="date" className="max-w-[12rem]" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-primary" disabled={disabled}
            checked={!!value} onChange={(e) => onChange(e.target.checked)} /> Ja
        </label>
      );
    case "select":
      return (
        <select {...common} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full max-w-sm rounded-md border bg-background px-3 text-sm">
          <option value="">Kies…</option>
          {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case "scale": {
      const min = field.min ?? 1;
      const max = field.max ?? 10;
      return (
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
            <button key={n} type="button" disabled={disabled} onClick={() => onChange(n)}
              className={`h-9 w-9 rounded-md border text-sm font-medium ${value === n ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>
              {n}
            </button>
          ))}
        </div>
      );
    }
    default:
      return <Textarea {...common} rows={field.rows || 4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}
