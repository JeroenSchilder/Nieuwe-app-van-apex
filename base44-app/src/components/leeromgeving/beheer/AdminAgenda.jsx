import { useCallback, useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import EventEditor from "./EventEditor";
import { KIND_LABEL } from "../lid/EventCard";
import { loadAllRegistrations } from "../lib/api";

const fmt = (d) => new Date(d).toLocaleString("nl-NL", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function AdminAgenda({ content }) {
  const [events, setEvents] = useState(null);
  const [regs, setRegs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [past, setPast] = useState(false);
  const [open, setOpen] = useState(null);

  const reload = useCallback(async () => {
    const [ev, rg] = await Promise.all([base44.entities.LeerEvent.list("start", 1000), loadAllRegistrations()]);
    setEvents(ev);
    setRegs(rg);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  if (!events) return null;
  if (editing) {
    return <EventEditor event={editing} content={content} onCancel={() => setEditing(null)} onSaved={async () => { setEditing(null); await reload(); }} />;
  }
  const now = Date.now();
  const list = events.filter((e) => (past ? new Date(e.start) < now : new Date(e.start) >= now - 3 * 3600000));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setEditing({})}><Plus className="mr-1 h-4 w-4" /> Nieuw agenda-item</Button>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={past} onChange={(e) => setPast(e.target.checked)} /> Toon afgelopen</label>
      </div>
      {list.length === 0 && <p className="text-sm text-muted-foreground">Geen agenda-items.</p>}
      {list.map((e) => {
        const going = regs.filter((r) => r.event_id === e.id && r.status === "aangemeld");
        return (
          <div key={e.id} className="rounded-lg border bg-card p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setEditing(e)} className="mr-auto text-left">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">{KIND_LABEL[e.kind]} · {fmt(e.start)}{e.location ? ` · ${e.location}` : ""}</p>
              </button>
              <Button size="sm" variant="ghost" onClick={() => setOpen(open === e.id ? null : e.id)}>
                <Users className="mr-1 h-4 w-4" /> {going.length}{e.capacity ? `/${e.capacity}` : ""}
              </Button>
            </div>
            {open === e.id && (
              <ul className="mt-2 border-t pt-2 text-sm">
                {going.length === 0 ? <li className="text-muted-foreground">Nog niemand aangemeld.</li>
                  : going.map((r) => <li key={r.id}>{r.member_name} <span className="text-muted-foreground">· {r.member_email}</span></li>)}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
