import { useState } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ChipSelect from "./ChipSelect";
import AssignmentEditor from "./AssignmentEditor";
import VimeoPlayer, { parseVimeoUrl } from "../VimeoPlayer";
import { CATEGORIES } from "../lib/config";

const linksToText = (links = []) => links.map((l) => `${l.label} | ${l.url}`).join("\n");
const textToLinks = (t) => t.split("\n").map((r) => r.split("|").map((s) => s.trim())).filter(([l, u]) => l && u).map(([label, url]) => ({ label, url }));

export default function LessonEditor({ lesson, content, onBack, onSaved }) {
  const [l, setL] = useState({ published: true, completion: "handmatig", categories: [], access_packages: [], key_points: [], action_links: [], ...lesson });
  const [vimeo, setVimeo] = useState(l.vimeo_id ? `https://vimeo.com/${l.vimeo_id}${l.vimeo_hash ? "/" + l.vimeo_hash : ""}` : "");
  const [links, setLinks] = useState(linksToText(l.action_links));
  const [points, setPoints] = useState((l.key_points || []).join("\n"));
  const [editAssignment, setEditAssignment] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setL((x) => ({ ...x, [k]: v }));
  const modules = content.modules.filter((m) => m.track_key === l.track_key);
  const assignment = content.assignments.find((a) => a.id === l.assignment_id);
  const parsed = parseVimeoUrl(vimeo);

  const save = async () => {
    setBusy(true);
    const data = { ...l, vimeo_id: parsed?.id || "", vimeo_hash: parsed?.hash || "", action_links: textToLinks(links),
      key_points: points.split("\n").map((s) => s.trim()).filter(Boolean) };
    if (!data.access_packages.includes("alles")) data.access_packages = [...data.access_packages, "alles"];
    const rec = l.id ? await base44.entities.LeerLes.update(l.id, data) : await base44.entities.LeerLes.create(data);
    setBusy(false);
    onSaved(rec);
  };
  const remove = async () => {
    if (!l.id || !window.confirm("Deze les verwijderen?")) return;
    await base44.entities.LeerLes.delete(l.id);
    onSaved(null);
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Terug naar lijst</button>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2"><Label>Titel</Label><Input value={l.title || ""} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-2"><Label>Module</Label>
              <select className="h-10 w-full rounded-md border bg-background px-2 text-sm" value={l.module_id || ""} onChange={(e) => set("module_id", e.target.value)}>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Volgorde</Label><Input type="number" value={l.order ?? 0} onChange={(e) => set("order", Number(e.target.value))} /></div>
          </div>
          <div className="space-y-2"><Label>Label (bijv. "Stap 3")</Label><Input value={l.step_label || ""} onChange={(e) => set("step_label", e.target.value)} /></div>
          <div className="space-y-2"><Label>Vimeo-link</Label><Input placeholder="https://vimeo.com/123456789/abcdef1234" value={vimeo} onChange={(e) => setVimeo(e.target.value)} />
            {vimeo && !parsed && <p className="text-xs text-destructive">Geen geldige Vimeo-link</p>}
          </div>
          {parsed && <VimeoPlayer id={parsed.id} hash={parsed.hash} title="preview" />}
          <div className="space-y-2"><Label>Samenvatting</Label><Textarea rows={3} value={l.summary || ""} onChange={(e) => set("summary", e.target.value)} /></div>
          <div className="space-y-2"><Label>Kernpunten (één per regel)</Label><Textarea rows={4} value={points} onChange={(e) => setPoints(e.target.value)} /></div>
          <div className="space-y-2"><Label>Actieknoppen (per regel: tekst | link)</Label><Textarea rows={3} value={links} onChange={(e) => setLinks(e.target.value)} /></div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Thema's</Label>
            <ChipSelect options={CATEGORIES} value={l.categories || []} onChange={(v) => set("categories", v)} /></div>
          <div className="space-y-2"><Label>Zichtbaar voor pakketten</Label>
            <ChipSelect options={content.packages.map((p) => ({ key: p.key, label: p.name }))} value={l.access_packages || []} onChange={(v) => set("access_packages", v)} /></div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" checked={l.published !== false} onChange={(e) => set("published", e.target.checked)} /> Gepubliceerd</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" checked={!!l.needs_review} onChange={(e) => set("needs_review", e.target.checked)} /> Nog controleren</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" checked={l.completion === "video_einde"} onChange={(e) => set("completion", e.target.checked ? "video_einde" : "handmatig")} /> Automatisch afgerond na video</label>
          </div>
          <div className="space-y-2"><Label>Tekst (markdown)</Label><Textarea rows={14} value={l.body || ""} onChange={(e) => set("body", e.target.value)} /></div>
          <div className="space-y-2 rounded-lg border p-3">
            <Label>Opdracht</Label>
            <select className="h-10 w-full rounded-md border bg-background px-2 text-sm" value={l.assignment_id || ""} onChange={(e) => set("assignment_id", e.target.value)}>
              <option value="">Geen opdracht</option>
              {content.assignments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={() => setEditAssignment(true)}>{assignment ? "Opdracht bewerken" : "Nieuwe opdracht maken"}</Button>
          </div>
        </div>
      </div>
      {editAssignment && (
        <AssignmentEditor assignment={assignment || {}} lesson={l} onCancel={() => setEditAssignment(false)}
          onSaved={(rec) => { content.assignments = [...content.assignments.filter((a) => a.id !== rec.id), rec]; set("assignment_id", rec.id); setEditAssignment(false); }} />
      )}
      <div className="flex gap-2 border-t pt-4">
        <Button onClick={save} disabled={busy || !l.title}><Save className="mr-2 h-4 w-4" /> Les opslaan</Button>
        {l.id && <Button variant="ghost" onClick={remove}><Trash2 className="mr-2 h-4 w-4" /> Verwijderen</Button>}
      </div>
    </div>
  );
}
