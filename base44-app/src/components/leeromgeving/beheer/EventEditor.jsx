import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ChipSelect from "./ChipSelect";
import { KIND_LABEL } from "../lid/EventCard";

const local = (iso) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
const toIso = (v) => (v ? new Date(v).toISOString() : "");
const WEEK = 7 * 24 * 60 * 60 * 1000;

// Agenda-item maken of bewerken. Bij een nieuw item kun je het meteen een aantal keer laten herhalen.
export default function EventEditor({ event, content, onSaved, onCancel }) {
  const [e, setE] = useState({ kind: "groepscoaching", registration: true, access_packages: [], ...event });
  const [repeat, setRepeat] = useState({ times: 1, every: 4 });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setE((x) => ({ ...x, [k]: v }));

  const save = async () => {
    setBusy(true);
    const { id, created_date, updated_date, created_by, created_by_id, ...data } = e;
    if (!data.access_packages.includes("alles")) data.access_packages = [...data.access_packages, "alles"];
    if (id) {
      await base44.entities.LeerEvent.update(id, data);
    } else {
      const rows = Array.from({ length: Math.max(1, repeat.times) }, (_, i) => ({
        ...data,
        start: new Date(new Date(data.start).getTime() + i * repeat.every * WEEK).toISOString(),
        end: data.end ? new Date(new Date(data.end).getTime() + i * repeat.every * WEEK).toISOString() : "",
      }));
      await base44.entities.LeerEvent.bulkCreate(rows);
    }
    setBusy(false);
    onSaved();
  };
  const remove = async () => {
    await base44.entities.LeerEvent.delete(e.id);
    onSaved();
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <h3 className="font-semibold">{e.id ? "Agenda-item bewerken" : "Nieuw agenda-item"}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1"><Label>Titel</Label><Input value={e.title || ""} onChange={(x) => set("title", x.target.value)} /></div>
        <div className="space-y-1"><Label>Soort</Label>
          <select className="h-10 w-full rounded-md border bg-background px-2 text-sm" value={e.kind} onChange={(x) => set("kind", x.target.value)}>
            {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="space-y-1"><Label>Begin</Label><Input type="datetime-local" value={local(e.start)} onChange={(x) => set("start", toIso(x.target.value))} /></div>
        <div className="space-y-1"><Label>Einde</Label><Input type="datetime-local" value={local(e.end)} onChange={(x) => set("end", toIso(x.target.value))} /></div>
        <div className="space-y-1"><Label>Locatie</Label><Input value={e.location || ""} onChange={(x) => set("location", x.target.value)} /></div>
        <div className="space-y-1"><Label>Online link (Zoom)</Label><Input value={e.online_url || ""} onChange={(x) => set("online_url", x.target.value)} /></div>
        <div className="space-y-1"><Label>Externe inschrijflink (bijv. Trainin)</Label><Input value={e.booking_url || ""} onChange={(x) => set("booking_url", x.target.value)} /></div>
        <div className="space-y-1"><Label>Alleen voor ronde</Label>
          <select className="h-10 w-full rounded-md border bg-background px-2 text-sm" value={e.cohort_key || ""} onChange={(x) => set("cohort_key", x.target.value)}>
            <option value="">Iedereen met het pakket</option>
            {content.cohorts.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1"><Label>Omschrijving</Label><Textarea rows={3} value={e.description || ""} onChange={(x) => set("description", x.target.value)} /></div>
      <div className="space-y-1"><Label>Zichtbaar voor pakketten</Label>
        <ChipSelect options={content.packages.map((p) => ({ key: p.key, label: p.name }))} value={e.access_packages} onChange={(v) => set("access_packages", v)} />
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={e.registration !== false} onChange={(x) => set("registration", x.target.checked)} /> Leden kunnen zich aanmelden</label>
      {!e.id && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          Herhalen:
          <Input type="number" min={1} className="h-9 w-16" value={repeat.times} onChange={(x) => setRepeat((r) => ({ ...r, times: Number(x.target.value) }))} /> keer, elke
          <Input type="number" min={1} className="h-9 w-16" value={repeat.every} onChange={(x) => setRepeat((r) => ({ ...r, every: Number(x.target.value) }))} /> weken
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={save} disabled={busy || !e.title || !e.start}><Save className="mr-2 h-4 w-4" /> Opslaan</Button>
        <Button variant="ghost" onClick={onCancel}>Annuleren</Button>
        {e.id && <Button variant="ghost" className="ml-auto" onClick={remove}><Trash2 className="mr-2 h-4 w-4" /> Verwijderen</Button>}
      </div>
    </div>
  );
}
