import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import LessonTile from "./LessonTile";
import { CATEGORIES, CATEGORY_LABEL, NEEDS } from "../lib/config";

// Alle lessen waar het lid toegang toe heeft, te filteren op thema, behoefte en zoekterm.
export default function LibraryView({ derived, onOpenLesson }) {
  const [cats, setCats] = useState([]);
  const [need, setNeed] = useState(null);
  const [q, setQ] = useState("");

  const all = useMemo(() => {
    const seen = new Set();
    return derived.tracks.flatMap((t) => t.ordered.filter((l) => !t.lessonState[l.id].locked))
      .filter((l) => (seen.has(l.id) ? false : seen.add(l.id)));
  }, [derived]);

  // Zoektekst per les één keer opbouwen (titel, samenvatting, kernpunten en thema's).
  const index = useMemo(() => new Map(all.map((l) => [l.id, `${l.title} ${l.summary || ""} ${(l.key_points || []).join(" ")} ${(l.categories || []).map((c) => CATEGORY_LABEL[c] || c).join(" ")}`.toLowerCase()])), [all]);

  const available = new Set(all.flatMap((l) => l.categories || []));
  const active = need ? NEEDS.find((n) => n.key === need).categories : cats;
  const term = q.trim().toLowerCase();
  const list = all.filter((l) =>
    (active.length === 0 || (l.categories || []).some((c) => active.includes(c))) &&
    (!term || index.get(l.id).includes(term)));

  const toggle = (k) => { setNeed(null); setCats((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k])); };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-semibold">Wat heb je nu nodig?</h2>
        <div className="flex flex-wrap gap-2">
          {NEEDS.filter((n) => n.categories.some((c) => available.has(c))).map((n) => (
            <button key={n.key} onClick={() => { setCats([]); setNeed(need === n.key ? null : n.key); }}
              className={`rounded-full border px-3 py-1.5 text-sm ${need === n.key ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}>
              {n.label}
            </button>
          ))}
        </div>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek een onderwerp, bijv. eiwitten of slaap" className="pl-9" />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.filter((c) => available.has(c.key)).map((c) => (
          <button key={c.key} onClick={() => toggle(c.key)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium ${active.includes(c.key) ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {c.label}
          </button>
        ))}
        {(cats.length > 0 || need || q) && (
          <button onClick={() => { setCats([]); setNeed(null); setQ(""); }} className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
            <X className="h-3 w-3" /> Wis filters
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{list.length} onderwerpen</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((l) => <LessonTile key={l.id} lesson={l} done={derived.doneIds.has(l.id)} onOpen={() => onOpenLesson(l.id)} />)}
      </div>
    </div>
  );
}
