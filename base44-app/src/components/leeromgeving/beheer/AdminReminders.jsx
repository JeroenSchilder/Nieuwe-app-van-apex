import { useEffect, useState } from "react";
import { Loader2, Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { loadReminderLog, loadReminderSettings, runReminders, saveReminderSettings } from "../lib/api";

// Instellingen voor herinneringen aan leden die een tijd niet actief zijn (zoals Huddle: 7, 30 en 30 dagen).
export default function AdminReminders() {
  const [s, setS] = useState(null);
  const [log, setLog] = useState([]);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));

  useEffect(() => { loadReminderSettings().then(setS); loadReminderLog().then(setLog); }, []);
  if (!s) return <Loader2 className="h-5 w-5 animate-spin text-primary" />;

  const save = async () => {
    const rec = await saveReminderSettings(s);
    setS((x) => ({ ...x, id: rec.id }));
    setMsg("Opgeslagen.");
  };
  const test = async () => {
    setBusy(true); setPreview(null);
    try { setPreview(await runReminders(true)); } catch (e) { setMsg("Proefrun mislukt. Staat de functie leer-herinneringen in je app?"); }
    setBusy(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <h3 className="font-semibold">Herinnering bij inactiviteit</h3>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={!!s.enabled} onChange={(e) => set("enabled", e.target.checked)} /> Herinneringen aan</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={!!s.test_mode} onChange={(e) => set("test_mode", e.target.checked)} /> Proefmodus (niets versturen, alleen bepalen wie)</label>
        <div className="space-y-1">
          <Label>Na hoeveel dagen zonder activiteit?</Label>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {[0, 1, 2].map((i) => (
              <span key={i} className="flex items-center gap-1">
                {i + 1}e na
                <Input type="number" min={0} className="h-9 w-16" value={s.days?.[i] ?? ""}
                  onChange={(e) => { const d = [...(s.days || [])]; d[i] = Number(e.target.value); set("days", d.filter((x, j) => j < 3)); }} />
                {i === 0 ? "dagen" : "dagen later"}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Zet een waarde op 0 om die herinnering over te slaan. Wordt een lid weer actief, dan begint de reeks opnieuw.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          Alleen bij voortgang tussen
          <Input type="number" className="h-9 w-16" value={s.min_progress ?? 0} onChange={(e) => set("min_progress", Number(e.target.value))} /> en
          <Input type="number" className="h-9 w-16" value={s.max_progress ?? 90} onChange={(e) => set("max_progress", Number(e.target.value))} /> %
        </div>
        <div className="space-y-1"><Label>Onderwerp</Label><Input value={s.subject} onChange={(e) => set("subject", e.target.value)} /></div>
        <div className="space-y-1"><Label>Tekst</Label><Textarea rows={8} value={s.body} onChange={(e) => set("body", e.target.value)} />
          <p className="text-xs text-muted-foreground">Gebruik {"{voornaam}"}, {"{les}"} (volgende les), {"{leerlijn}"} en {"{link}"}.</p></div>
        <div className="space-y-1"><Label>Link naar de leeromgeving ({"{link}"})</Label><Input placeholder="https://app.apexonlinecoaching.nl/leren" value={s.app_url || ""} onChange={(e) => set("app_url", e.target.value)} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={s.event_reminders !== false} onChange={(e) => set("event_reminders", e.target.checked)} /> Ook een herinnering de dag vóór een agenda-item waarvoor iemand is aangemeld</label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={save}><Save className="mr-2 h-4 w-4" /> Opslaan</Button>
          <Button variant="outline" onClick={test} disabled={busy}><Play className="mr-2 h-4 w-4" /> {busy ? "Bezig…" : "Proefrun: wie krijgt nu een mail?"}</Button>
        </div>
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <p className="text-xs text-muted-foreground">De controle draait elke ochtend om 08:47 via de workflow "Leeromgeving herinneringen".</p>
      </div>
      <div className="space-y-4">
        {preview && (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-2 font-semibold">Proefrun</h3>
            {preview.inactief.length + preview.agenda.length === 0 ? <p className="text-sm text-muted-foreground">Op dit moment krijgt niemand een herinnering.</p> : (
              <ul className="space-y-1 text-sm">
                {preview.inactief.map((r) => <li key={r.email}>Herinnering {r.herinnering} → <b>{r.naam || r.email}</b> · {r.dagen_niet_actief} dagen niet actief · {r.voortgang}% · volgende: {r.volgende_les}</li>)}
                {preview.agenda.map((r, i) => <li key={i}>Agenda → {r.email} · {r.event}</li>)}
              </ul>
            )}
          </div>
        )}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 font-semibold">Laatst verstuurd</h3>
          {log.length === 0 ? <p className="text-sm text-muted-foreground">Nog geen herinneringen verstuurd.</p> : (
            <ul className="space-y-1 text-sm">
              {log.slice(0, 30).map((h) => <li key={h.id}>{new Date(h.sent_at).toLocaleDateString("nl-NL")} · {h.member_name} · herinnering {h.number} · {h.days_inactive} dagen</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
