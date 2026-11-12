import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addCancellation, listUsers, loadCancelSettings, loadCancellations, saveSetting } from "../lib/api";

const fmt = (d) => (d ? new Date(d).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
const SOURCE = { app: "app", trainin: "Trainin", handmatig: "handmatig" };

// Meldingen bij herhaaldelijk afzeggen: instellingen, overzicht per lid en handmatig een afmelding registreren.
export default function AdminCancellations() {
  const [s, setS] = useState(null);
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ member_email: "", training: "", training_start: "" });
  const [msg, setMsg] = useState("");
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));

  const reload = async () => setList(await loadCancellations());
  useEffect(() => { loadCancelSettings().then(setS); reload(); listUsers().then(setUsers); }, []);
  if (!s) return <Loader2 className="h-5 w-5 animate-spin text-primary" />;

  const since = Date.now() - (s.period_days || 30) * 86400000;
  const recent = list.filter((a) => new Date(a.cancelled_at || a.created_date).getTime() >= since);
  const per = {};
  for (const a of recent) (per[a.member_email] ||= { name: a.member_name, items: [] }).items.push(a);
  const rows = Object.entries(per).sort((a, b) => b[1].items.length - a[1].items.length);

  const save = async () => { const r = await saveSetting(s); setS((x) => ({ ...x, id: r.id })); setMsg("Opgeslagen."); };
  const add = async () => {
    const u = users.find((x) => x.email === form.member_email);
    await addCancellation({ ...form, member_name: u?.full_name || form.member_email, coach_email: u?.apex_coach_email ?? u?.data?.apex_coach_email ?? "",
      training_start: form.training_start ? new Date(form.training_start).toISOString() : "" });
    setForm({ member_email: "", training: "", training_start: "" });
    await reload();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <h3 className="font-semibold">Melding bij herhaaldelijk afzeggen</h3>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={!!s.enabled} onChange={(e) => set("enabled", e.target.checked)} /> Aan</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={!!s.test_mode} onChange={(e) => set("test_mode", e.target.checked)} /> Proefmodus (niets versturen)</label>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          Melding vanaf
          <Input type="number" min={1} className="h-9 w-16" value={s.threshold} onChange={(e) => set("threshold", Number(e.target.value))} /> afmeldingen binnen
          <Input type="number" min={1} className="h-9 w-16" value={s.period_days} onChange={(e) => set("period_days", Number(e.target.value))} /> dagen
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          Alleen tellen als afgemeld binnen
          <Input type="number" min={0} className="h-9 w-16" value={s.late_hours} onChange={(e) => set("late_hours", Number(e.target.value))} /> uur voor de training (0 = alle afmeldingen)
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={!!s.notify_member} onChange={(e) => set("notify_member", e.target.checked)} /> Bericht naar het lid</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={!!s.notify_trainer} onChange={(e) => set("notify_trainer", e.target.checked)} /> Bericht naar de trainer (en de vaste coach van het lid)</label>
        <div className="space-y-1"><Label>E-mail trainer(s), komma-gescheiden</Label><Input value={s.trainer_emails} onChange={(e) => set("trainer_emails", e.target.value)} /></div>
        <div className="space-y-1"><Label>Onderwerp aan lid</Label><Input value={s.member_subject} onChange={(e) => set("member_subject", e.target.value)} /></div>
        <div className="space-y-1"><Label>Tekst aan lid</Label><Textarea rows={6} value={s.member_body} onChange={(e) => set("member_body", e.target.value)} /></div>
        <div className="space-y-1"><Label>Onderwerp aan trainer</Label><Input value={s.trainer_subject} onChange={(e) => set("trainer_subject", e.target.value)} /></div>
        <div className="space-y-1"><Label>Tekst aan trainer</Label><Textarea rows={5} value={s.trainer_body} onChange={(e) => set("trainer_body", e.target.value)} />
          <p className="text-xs text-muted-foreground">Gebruik {"{voornaam}"}, {"{naam}"}, {"{aantal}"}, {"{dagen}"}, {"{training}"}, {"{datum}"} en {"{lijst}"}.</p></div>
        <div className="space-y-2 rounded-lg border p-3">
          <Label>WhatsApp (optioneel)</Label>
          <Input placeholder="Webhook-URL van Zapier, Make of Twilio" value={s.whatsapp_webhook_url} onChange={(e) => set("whatsapp_webhook_url", e.target.value)} />
          <Input placeholder="Mobiel trainer, bijv. +31683232341" value={s.trainer_phone} onChange={(e) => set("trainer_phone", e.target.value)} />
          <p className="text-xs text-muted-foreground">De app stuurt per bericht {"{ to, message, name, type }"} naar deze URL; die dienst verstuurt het WhatsApp-bericht. Het mobiele nummer van een lid zet je bij Leden & toegang.</p>
        </div>
        <Button onClick={save}><Save className="mr-2 h-4 w-4" /> Opslaan</Button>
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 font-semibold">Afmeldingen afgelopen {s.period_days} dagen</h3>
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">Geen afmeldingen.</p> : rows.map(([email, r]) => (
            <details key={email} className="border-b py-2 last:border-0">
              <summary className="flex cursor-pointer items-center gap-2 text-sm">
                {r.items.length >= s.threshold && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                <span className="mr-auto font-medium">{r.name}</span>
                <span className={r.items.length >= s.threshold ? "font-semibold text-amber-700" : "text-muted-foreground"}>{r.items.length}×</span>
              </summary>
              <ul className="mt-1 space-y-0.5 pl-6 text-xs text-muted-foreground">
                {r.items.map((a) => <li key={a.id}>{a.training} · {fmt(a.training_start || a.cancelled_at)} · via {SOURCE[a.source] || a.source}{a.notified ? " · melding verstuurd" : ""}</li>)}
              </ul>
            </details>
          ))}
        </div>
        <div className="space-y-2 rounded-xl border bg-card p-4">
          <h3 className="font-semibold">Afmelding registreren</h3>
          <p className="text-xs text-muted-foreground">Voor afmeldingen die buiten de app gaan (bijv. via WhatsApp of Trainin, zolang die koppeling er nog niet is).</p>
          <select className="h-10 w-full rounded-md border bg-background px-2 text-sm" value={form.member_email} onChange={(e) => setForm((f) => ({ ...f, member_email: e.target.value }))}>
            <option value="">Kies lid…</option>
            {users.map((u) => <option key={u.id} value={u.email}>{u.full_name || u.email}</option>)}
          </select>
          <Input placeholder="Training, bijv. Small group ma 19:00" value={form.training} onChange={(e) => setForm((f) => ({ ...f, training: e.target.value }))} />
          <Input type="datetime-local" value={form.training_start} onChange={(e) => setForm((f) => ({ ...f, training_start: e.target.value }))} />
          <Button variant="outline" onClick={add} disabled={!form.member_email || !form.training}><Plus className="mr-1 h-4 w-4" /> Registreren</Button>
        </div>
      </div>
    </div>
  );
}
