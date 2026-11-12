import { CalendarPlus, Check, ExternalLink, MapPin, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadIcs } from "../lib/ics";

export const KIND_LABEL = {
  groepscoaching: "Groepscoaching", sessie: "Coachingsessie", meting: "Meting", kickoff: "Kickoff", training: "Training", event: "Event",
};

const fmtDay = (d) => new Date(d).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

export default function EventCard({ event, registration, busy, onRegister, compact = false }) {
  const going = registration?.status === "aangemeld";
  return (
    <div className="flex gap-4 rounded-xl border bg-card p-4">
      <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-primary/10 py-2 text-primary">
        <span className="text-xs uppercase">{new Date(event.start).toLocaleDateString("nl-NL", { month: "short" })}</span>
        <span className="text-xl font-bold leading-none">{new Date(event.start).getDate()}</span>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{KIND_LABEL[event.kind] || event.kind}</Badge>
          {going && <Badge variant="outline" className="border-transparent bg-emerald-100 text-emerald-800"><Check className="mr-1 h-3 w-3" /> Aangemeld</Badge>}
        </div>
        <p className="font-semibold leading-snug">{event.title}</p>
        <p className="text-sm text-muted-foreground">
          {fmtDay(event.start)} · {fmtTime(event.start)}{event.end ? `–${fmtTime(event.end)}` : ""}
        </p>
        {event.location && <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {event.location}</p>}
        {!compact && event.description && <p className="whitespace-pre-wrap text-sm">{event.description}</p>}
        {!compact && (
          <div className="flex flex-wrap gap-2 pt-2">
            {event.booking_url && (
              <Button asChild size="sm"><a href={event.booking_url} target="_blank" rel="noreferrer">Inplannen <ExternalLink className="ml-1 h-4 w-4" /></a></Button>
            )}
            {event.registration !== false && !event.booking_url && (
              going
                ? <Button size="sm" variant="outline" disabled={busy} onClick={() => onRegister("afgemeld")}>Afmelden</Button>
                : <Button size="sm" disabled={busy} onClick={() => onRegister("aangemeld")}>Aanmelden</Button>
            )}
            {event.online_url && (
              <Button asChild size="sm" variant="outline"><a href={event.online_url} target="_blank" rel="noreferrer"><Video className="mr-1 h-4 w-4" /> Online deelnemen</a></Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => downloadIcs(event)}><CalendarPlus className="mr-1 h-4 w-4" /> In mijn agenda</Button>
          </div>
        )}
      </div>
    </div>
  );
}
