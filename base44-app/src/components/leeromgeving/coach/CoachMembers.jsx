import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "../lib/access";

// Overzicht per lid, opgebouwd uit voortgang en inzendingen (coaches kunnen geen gebruikerslijst opvragen).
export default function CoachMembers({ submissions, progress, tracks, onSelect }) {
  const members = {};
  const touch = (email, name, date) => {
    const m = (members[email] ||= { email, name: name || email, done: 0, byTrack: {}, subs: 0, todo: 0, last: null });
    if (date && (!m.last || date > m.last)) m.last = date;
    return m;
  };
  for (const p of progress) {
    const m = touch(p.member_email, p.member_name, p.completed_at || p.created_date);
    m.done += 1;
    m.byTrack[p.track_key] = (m.byTrack[p.track_key] || 0) + 1;
  }
  for (const s of submissions) {
    if (s.status === "concept") continue;
    const m = touch(s.member_email, s.member_name, s.submitted_at || s.updated_date);
    m.subs += 1;
    if (s.status === "ingediend") m.todo += 1;
  }
  const list = Object.values(members).sort((a, b) => String(b.last).localeCompare(String(a.last)));
  const title = Object.fromEntries(tracks.map((t) => [t.key, t.title.split("·")[0].trim()]));

  if (list.length === 0) return <p className="text-sm text-muted-foreground">Nog geen activiteit van leden.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {list.map((m) => (
        <Card key={m.email} className="cursor-pointer hover:border-primary" onClick={() => onSelect(m.email)}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
              {m.todo > 0 && <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">{m.todo} te beoordelen</span>}
            </div>
            <p className="text-sm">{m.done} lessen afgerond · {m.subs} opdrachten ingeleverd</p>
            <p className="text-xs text-muted-foreground">
              {Object.entries(m.byTrack).map(([k, n]) => `${title[k] || k}: ${n}`).join(" · ")}
            </p>
            {m.last && <p className="text-xs text-muted-foreground">Laatst actief {formatDate(m.last)}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
