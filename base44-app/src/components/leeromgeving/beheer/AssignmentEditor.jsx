import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FIELD_TYPES } from "../lib/config";

const slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 30) || "veld";

// Bewerkt een opdracht inclusief de invulvelden. assignment = bestaand record of {} voor nieuw.
export default function AssignmentEditor({ assignment, lesson, onSaved, onCancel }) {
  const [a, setA] = useState({ fields: [], coach_review: true, ...assignment });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setA((x) => ({ ...x, [k]: v }));
  const setField = (i, patch) => set("fields", a.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const move = (i, d) => {
    const fs = [...a.fields];
    [fs[i], fs[i + d]] = [fs[i + d], fs[i]];
    set("fields", fs);
  };

  const save = async () => {
    setBusy(true);
    const used = new Set();
    const fields = a.fields.map((f) => {
      let key = f.key || slug(f.label);
      while (used.has(key)) key += "_2";
      used.add(key);
      return { ...f, key };
    });
    const data = { ...a, fields, track_key: a.track_key || lesson?.track_key, lesson_id: a.lesson_id || lesson?.id };
    const rec = a.id ? await base44.entities.LeerOpdracht.update(a.id, data) : await base44.entities.LeerOpdracht.create(data);
    setBusy(false);
    onSaved(rec);
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <h3 className="font-semibold">{a.id ? "Opdracht bewerken" : "Nieuwe opdracht"}</h3>
      <div className="space-y-2"><Label>Titel</Label><Input value={a.title || ""} onChange={(e) => set("title", e.target.value)} /></div>
      <div className="space-y-2"><Label>Uitleg</Label><Textarea rows={2} value={a.intro || ""} onChange={(e) => set("intro", e.target.value)} /></div>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" checked={!!a.repeatable} onChange={(e) => set("repeatable", e.target.checked)} /> Meerdere keren invulbaar</label>
        <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" checked={a.coach_review !== false} onChange={(e) => set("coach_review", e.target.checked)} /> Coach geeft feedback</label>
        <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" checked={!!a.lock_after_deadline} onChange={(e) => set("lock_after_deadline", e.target.checked)} /> Sluiten na deadline</label>
        <label className="flex items-center gap-2">Deadline: dag
          <Input type="number" className="h-8 w-16" value={a.deadline_day_offset ?? ""} onChange={(e) => set("deadline_day_offset", e.target.value === "" ? null : Number(e.target.value))} />
          na start week (5 = za)
        </label>
      </div>

      <div className="space-y-2">
        <Label>Invulvelden</Label>
        {a.fields.map((f, i) => (
          <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-12">
            <Input className="sm:col-span-5" placeholder="Vraag / label" value={f.label} onChange={(e) => setField(i, { label: e.target.value })} />
            <select className="h-10 rounded-md border bg-background px-2 text-sm sm:col-span-3" value={f.type} onChange={(e) => setField(i, { type: e.target.value })}>
              {FIELD_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
            <label className="flex items-center gap-1 text-xs sm:col-span-2"><input type="checkbox" className="accent-primary" checked={!!f.required} onChange={(e) => setField(i, { required: e.target.checked })} /> Verplicht</label>
            <div className="flex gap-1 sm:col-span-2 sm:justify-end">
              <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" disabled={i === a.fields.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => set("fields", a.fields.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
            </div>
            {f.type === "select" && (
              <Input className="sm:col-span-12" placeholder="Opties, gescheiden door komma's" value={(f.options || []).join(", ")}
                onChange={(e) => setField(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => set("fields", [...a.fields, { label: "", type: "textarea" }])}><Plus className="mr-1 h-4 w-4" /> Veld toevoegen</Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={save} disabled={busy || !a.title}><Save className="mr-2 h-4 w-4" /> Opdracht opslaan</Button>
        <Button variant="ghost" onClick={onCancel}>Annuleren</Button>
      </div>
    </div>
  );
}
