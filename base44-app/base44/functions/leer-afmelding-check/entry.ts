// Controleert na elke nieuwe afmelding (workflow "Leeromgeving afmeldingen") of een lid vaker dan de drempel
// heeft afgezegd binnen de ingestelde periode. Zo ja: bericht aan het lid en aan de trainer, per mail en
// optioneel via WhatsApp (webhook naar bijv. Zapier/Make/Twilio). Instellingen: LeerInstelling key "afmeldingen".
import { createClientFromRequest } from "npm:@base44/sdk";

const DAY = 24 * 60 * 60 * 1000;
export const DEFAULTS = {
  enabled: false, test_mode: true, threshold: 3, period_days: 30, late_hours: 0,
  notify_member: true, notify_trainer: true, trainer_emails: "", trainer_phone: "", whatsapp_webhook_url: "",
  member_subject: "{voornaam}, we missen je bij de training",
  member_body: "Hoi {voornaam},\n\nJe hebt je de afgelopen {dagen} dagen {aantal} keer afgemeld voor een training (laatste: {training}).\n\nIs er iets aan de hand of kunnen we je ergens mee helpen? Laat het me weten, dan zoeken we samen naar een oplossing.\n\nSportieve groet,\nJeroen",
  trainer_subject: "Let op: {naam} heeft zich {aantal}× afgemeld in {dagen} dagen",
  trainer_body: "{naam} heeft zich voor de {aantal}e keer afgemeld in de afgelopen {dagen} dagen.\n\nLaatste afmelding: {training} ({datum}).\n\nAlle afmeldingen in deze periode:\n{lijst}",
  from_name: "Apex Online Coaching",
};

const fill = (t, v) => String(t || "").replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
const html = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").split("\n").join("<br>");
const fmt = (d) => (d ? new Date(d).toLocaleString("nl-NL", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" }) : "");
const uf = (u, k) => u?.[k] ?? u?.data?.[k];

export default async function (req) {
  const base44 = createClientFromRequest(req);
  let me = null;
  try { me = await base44.auth.me(); } catch (_) { /* aanroep door de workflow */ }
  if (me && me.role !== "admin") return Response.json({ error: "Alleen voor beheerders." }, { status: 403 });
  const { afmelding_id, dry_run } = await req.json().catch(() => ({}));
  if (!afmelding_id) return Response.json({ error: "afmelding_id ontbreekt" }, { status: 400 });

  const db = base44.asServiceRole.entities;
  const [setting] = await db.LeerInstelling.filter({ key: "afmeldingen" });
  const cfg = { ...DEFAULTS, ...(setting || {}) };
  const dry = dry_run === true || cfg.test_mode || !cfg.enabled;

  const a = await db.LeerAfmelding.get(afmelding_id);
  if (!a) return Response.json({ error: "Afmelding niet gevonden" }, { status: 404 });

  // Is deze afmelding "laat"? (alleen relevant als late_hours > 0)
  const lateHours = Number(cfg.late_hours) || 0;
  const isLate = (x) => !lateHours || (x.training_start && new Date(x.training_start) - new Date(x.cancelled_at || x.created_date) < lateHours * 3600000);
  if (lateHours && !a.late && isLate(a)) await db.LeerAfmelding.update(a.id, { late: true });
  if (!isLate(a)) return Response.json({ skipped: "niet laat genoeg om mee te tellen" });

  const since = Date.now() - (Number(cfg.period_days) || 30) * DAY;
  const all = (await db.LeerAfmelding.filter({ member_email: a.member_email }, "-cancelled_at", 500))
    .filter((x) => new Date(x.cancelled_at || x.created_date).getTime() >= since && isLate(x));
  const count = all.length;
  if (count < (Number(cfg.threshold) || 3)) return Response.json({ count, below_threshold: true });

  const [user] = await db.User.filter({ email: a.member_email });
  const vars = {
    voornaam: (a.member_name || "").split(" ")[0] || "daar", naam: a.member_name || a.member_email,
    aantal: String(count), dagen: String(cfg.period_days), training: a.training, datum: fmt(a.training_start || a.cancelled_at),
    lijst: all.map((x) => `- ${x.training} (${fmt(x.training_start || x.cancelled_at)})`).join("\n"),
  };
  const sent = [];
  const whatsapp = async (to, message, type) => {
    if (!cfg.whatsapp_webhook_url || !to) return;
    if (!dry) await fetch(cfg.whatsapp_webhook_url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to, message, name: vars.naam, type }) });
    sent.push(`whatsapp:${type}`);
  };

  if (cfg.notify_member) {
    const body = fill(cfg.member_body, vars);
    if (!dry) await base44.asServiceRole.integrations.Core.SendEmail({ to: a.member_email, subject: fill(cfg.member_subject, vars), body: html(body), from_name: cfg.from_name });
    sent.push("mail:lid");
    await whatsapp(uf(user, "apex_phone"), body, "lid");
  }
  if (cfg.notify_trainer) {
    const body = fill(cfg.trainer_body, vars);
    const to = String(cfg.trainer_emails || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (a.coach_email && !to.includes(a.coach_email)) to.push(a.coach_email);
    for (const t of to) {
      if (!dry) await base44.asServiceRole.integrations.Core.SendEmail({ to: t, subject: fill(cfg.trainer_subject, vars), body: html(body), from_name: cfg.from_name });
      sent.push(`mail:${t}`);
    }
    await whatsapp(cfg.trainer_phone, body, "trainer");
  }
  if (!dry) {
    await db.LeerAfmelding.update(a.id, { notified: true });
    await db.LeerHerinnering.create({ member_email: a.member_email, member_name: a.member_name, kind: "afmelding", number: count,
      sent_at: new Date().toISOString(), test: false, detail: `${count}× afgemeld in ${cfg.period_days} dagen · ${sent.join(", ")}` });
  }
  return Response.json({ count, dry_run: dry, sent });
}
