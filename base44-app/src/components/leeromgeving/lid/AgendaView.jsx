import { useState } from "react";
import { CalendarDays, ExternalLink, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MEASUREMENT_URL } from "../lib/config";
import EventCard from "./EventCard";
import { setRegistration } from "../lib/api";
import { userField } from "../lib/access";

// Agenda van het lid: groepscoachings, sessies, metingen en events uit de pakketten van het lid.
export function visibleEvents(agenda, user) {
  const cohort = userField(user, "apex_cohort");
  const from = Date.now() - 3 * 60 * 60 * 1000;
  return agenda.events
    .filter((e) => new Date(e.start).getTime() >= from)
    .filter((e) => !e.cohort_key || e.cohort_key === cohort || user?.role === "admin")
    .sort((a, b) => new Date(a.start) - new Date(b.start));
}

export default function AgendaView({ agenda, user, refreshAgenda }) {
  const [busy, setBusy] = useState(null);
  const events = visibleEvents(agenda, user);
  const regFor = (e) => agenda.registrations.find((r) => r.event_id === e.id);

  const register = async (e, status) => {
    setBusy(e.id);
    await setRegistration(user, e, regFor(e), status);
    await refreshAgenda();
    setBusy(null);
  };

  const byMonth = {};
  for (const e of events) {
    const k = new Date(e.start).toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    (byMonth[k] ||= []).push(e);
  }

  const measurement = (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
      <Scale className="h-5 w-5 text-primary" />
      <div className="mr-auto">
        <p className="font-medium">InBody-meting</p>
        <p className="text-sm text-muted-foreground">Elke 4 weken. Je plant je meting zelf in via Trainin.</p>
      </div>
      <Button asChild size="sm"><a href={MEASUREMENT_URL} target="_blank" rel="noreferrer">Meting inplannen <ExternalLink className="ml-1 h-4 w-4" /></a></Button>
    </div>
  );

  if (!events.length) {
    return (
      <div className="space-y-4">
        {measurement}
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-10 text-center text-muted-foreground">
          <CalendarDays className="h-8 w-8" /> Er staat nog niets in je agenda.
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {measurement}
      {Object.entries(byMonth).map(([month, list]) => (
        <section key={month} className="space-y-2">
          <h2 className="font-semibold capitalize">{month}</h2>
          {list.map((e) => (
            <EventCard key={e.id} event={e} registration={regFor(e)} busy={busy === e.id} onRegister={(s) => register(e, s)} />
          ))}
        </section>
      ))}
    </div>
  );
}
