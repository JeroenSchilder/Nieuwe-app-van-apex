import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChipSelect from "./ChipSelect";

// Eenvoudige editor voor een lijst records (pakketten, rondes, leerlijnen).
// fields: [{ key, label, type: text|number|date|bool|chips|select, options? }]
function Row({ entity, record, fields, onChanged }) {
  const [r, setR] = useState(record);
  const [dirty, setDirty] = useState(!record.id);
  const set = (k, v) => { setR((x) => ({ ...x, [k]: v })); setDirty(true); };
  const save = async () => {
    const { id, created_date, updated_date, created_by, created_by_id, ...data } = r;
    if (id) await base44.entities[entity].update(id, data); else await base44.entities[entity].create(data);
    setDirty(false);
    onChanged();
  };
  const remove = async () => {
    if (r.id && window.confirm("Verwijderen?")) { await base44.entities[entity].delete(r.id); onChanged(); }
  };
  return (
    <div className="grid gap-2 rounded-lg border bg-card p-3 md:grid-cols-6">
      {fields.map((f) => (
        <label key={f.key} className={`space-y-1 text-xs ${f.wide ? "md:col-span-6" : "md:col-span-2"}`}>
          <span className="text-muted-foreground">{f.label}</span>
          {f.type === "bool" ? (
            <input type="checkbox" className="block h-4 w-4 accent-primary" checked={!!r[f.key]} onChange={(e) => set(f.key, e.target.checked)} />
          ) : f.type === "chips" ? (
            <ChipSelect options={f.options} value={r[f.key] || []} onChange={(v) => set(f.key, v)} />
          ) : f.type === "select" ? (
            <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={r[f.key] || ""} onChange={(e) => set(f.key, e.target.value)}>
              {f.options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          ) : (
            <Input type={f.type || "text"} className="h-9" value={r[f.key] ?? ""}
              onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)} />
          )}
        </label>
      ))}
      <div className="flex gap-2 md:col-span-6">
        <Button size="sm" onClick={save} disabled={!dirty}><Save className="mr-1 h-4 w-4" /> Opslaan</Button>
        {r.id && <Button size="sm" variant="ghost" onClick={remove}><Trash2 className="h-4 w-4" /></Button>}
      </div>
    </div>
  );
}

export default function RecordEditor({ title, entity, records, fields, newRecord, onChanged }) {
  const [adding, setAdding] = useState(false);
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}><Plus className="mr-1 h-4 w-4" /> Nieuw</Button>
      </div>
      {adding && <Row entity={entity} record={newRecord} fields={fields} onChanged={() => { setAdding(false); onChanged(); }} />}
      {records.map((r) => <Row key={r.id} entity={entity} record={r} fields={fields} onChanged={onChanged} />)}
    </section>
  );
}
