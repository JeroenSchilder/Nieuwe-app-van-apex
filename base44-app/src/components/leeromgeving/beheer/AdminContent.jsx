import { useState } from "react";
import { AlertCircle, ClipboardList, EyeOff, PlayCircle, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LessonEditor from "./LessonEditor";
import { loadLesson } from "../lib/api";

export default function AdminContent({ content, reload }) {
  const [trackKey, setTrackKey] = useState(content.tracks[0]?.key);
  const [onlyReview, setOnlyReview] = useState(false);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);

  if (editing) {
    return <LessonEditor lesson={editing} content={content} onBack={() => setEditing(null)}
      onSaved={async () => { await reload(); setEditing(null); }} />;
  }

  const track = content.tracks.find((t) => t.key === trackKey);
  const modules = content.modules.filter((m) => m.track_key === trackKey);
  const term = q.toLowerCase();
  const review = content.lessons.filter((l) => l.needs_review).length;

  const addModule = async () => {
    const title = window.prompt("Naam van de nieuwe module/week");
    if (!title) return;
    await base44.entities.LeerModule.create({ track_key: trackKey, title, order: modules.length + 1 });
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {content.tracks.map((t) => (
          <button key={t.key} onClick={() => setTrackKey(t.key)}
            className={`rounded-full border px-3 py-1.5 text-sm ${t.key === trackKey ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}>
            {t.title.split("·")[0].trim()}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Zoek les" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-primary" checked={onlyReview} onChange={(e) => setOnlyReview(e.target.checked)} />
          Alleen “nog controleren” ({review} in totaal)
        </label>
        <Button variant="outline" size="sm" className="ml-auto" onClick={addModule}><Plus className="mr-1 h-4 w-4" /> Module</Button>
      </div>
      {modules.map((m) => {
        const lessons = content.lessons.filter((l) => l.module_id === m.id)
          .filter((l) => (!onlyReview || l.needs_review) && (!term || l.title.toLowerCase().includes(term)))
          .sort((a, b) => (onlyReview ? String(a.review_note || "9").localeCompare(String(b.review_note || "9")) : 0) || (a.order ?? 0) - (b.order ?? 0));
        if ((onlyReview || term) && lessons.length === 0) return null;
        return (
          <div key={m.id} className="rounded-xl border bg-card p-3">
            <div className="flex items-center justify-between px-2 pb-2">
              <h3 className="font-semibold">{m.title}</h3>
              <Button size="sm" variant="ghost" onClick={() => setEditing({ track_key: trackKey, module_id: m.id, order: lessons.length + 1, access_packages: track?.access_packages || [] })}>
                <Plus className="mr-1 h-4 w-4" /> Les
              </Button>
            </div>
            {lessons.map((l) => (
              <button key={l.id} onClick={async () => setEditing(await loadLesson(l.id))} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted">
                <span className="w-6 text-xs text-muted-foreground">{l.order}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{l.step_label ? `${l.step_label} · ` : ""}{l.title}</span>
                  {l.needs_review && l.review_note && <span className="block truncate text-xs text-amber-700">{l.review_note}</span>}
                </span>
                {l.published === false && <EyeOff className="h-4 w-4 text-muted-foreground" title="Niet gepubliceerd" />}
                {l.needs_review && <AlertCircle className="h-4 w-4 text-amber-600" title="Nog controleren" />}
                {l.vimeo_id && <PlayCircle className="h-4 w-4 text-primary" />}
                {l.assignment_id && <ClipboardList className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
