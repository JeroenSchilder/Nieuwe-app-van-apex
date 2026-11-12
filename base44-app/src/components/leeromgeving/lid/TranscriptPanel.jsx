import { useMemo, useState } from "react";
import { ScrollText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// Doorzoekbaar transcript. Klik op een regel om de video naar dat moment te laten springen.
export default function TranscriptPanel({ transcript, onSeek }) {
  const [q, setQ] = useState("");
  const lines = useMemo(() => String(transcript || "").split("\n").map((r) => {
    const i = r.indexOf("|");
    return { t: Number(r.slice(0, i)) || 0, text: r.slice(i + 1) };
  }).filter((l) => l.text), [transcript]);
  if (!lines.length) return null;
  const term = q.trim().toLowerCase();
  const shown = term ? lines.filter((l) => l.text.toLowerCase().includes(term)) : lines;

  return (
    <details className="rounded-xl border bg-card p-4">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <ScrollText className="h-4 w-4 text-primary" /> Transcript lezen of doorzoeken
      </summary>
      <div className="mt-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek in de video, bijv. eiwit" className="pl-9" />
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
          {shown.map((l, i) => (
            <button key={i} onClick={() => onSeek(l.t)} className="flex w-full gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted">
              <span className="w-12 shrink-0 font-mono text-xs text-primary">{fmt(l.t)}</span>
              <span>{l.text}</span>
            </button>
          ))}
          {shown.length === 0 && <p className="px-2 text-sm text-muted-foreground">Niets gevonden.</p>}
        </div>
        <p className="text-xs text-muted-foreground">Automatisch gemaakt uit de ondertitels; kleine fouten zijn mogelijk.</p>
      </div>
    </details>
  );
}
