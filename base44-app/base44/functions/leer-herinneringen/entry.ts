// Dagelijkse herinneringen voor de leeromgeving (aangeroepen door de workflow "Leeromgeving herinneringen").
// 1. Leden die al een tijd niet actief zijn: herinnering 1, 2 en 3 na het ingestelde aantal dagen
//    (standaard 7, daarna 30, daarna 30). Zodra iemand weer actief is, begint de reeks opnieuw.
// 2. Agenda: de dag van tevoren een herinnering aan wie zich heeft aangemeld.
// Instellingen staan in LeerInstelling (key "herinneringen") en zijn te wijzigen in Beheer → Herinneringen.
// Aanroep met { dry_run: true } (alleen door een admin) laat zien wat er zou gebeuren, zonder te versturen.
import { createClientFromRequest } from "npm:@base44/sdk";

const DAY = 24 * 60 * 60 * 1000;
const DEFAULTS = {
  enabled: false, test_mode: true, days: [7, 30, 30], min_progress: 0, max_progress: 90,
  subject: "{voornaam}, je volgende stap staat klaar",
  body: "Hoi {voornaam},\n\nHet is alweer even geleden dat je in de Apex leeromgeving bent geweest. Je volgende stap staat voor je klaar: {les} ({leerlijn}).\n\nPak hem vandaag op, al is het maar tien minuten: {link}\n\nSportieve groet,\nJeroen",
  app_url: "", event_reminders: true, from_name: "Apex Online Coaching",
};

const fill = (t, v) => String(t || "").replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
const html = (t) => String(t).split("\n").map((r) => r.replace(/&/g, "&amp;").replace(/</g, "&lt;")).join("<br>");
const time = (d) => (d ? new Date(d).getTime() : 0);
const uf = (u, k) => u?.[k] ?? u?.data?.[k];

export default async function (req) {
  const base44 = createClientFromRequest(req);
  let me = null;
  try { me = await base44.auth.me(); } catch (_) { /* aanroep door de workflow */ }
  if (me && me.role !== "admin") return Response.json({ error: "Alleen voor beheerders." }, { status: 403 });
  let args = {};
  try { args = await req.json(); } catch (_) { /* geen body */ }

  const db = base44.asServiceRole.entities;
  const [setting] = await db.LeerInstelling.filter({ key: "herinneringen" });
  const cfg = { ...DEFAULTS, ...(setting || {}) };
  const dry = (me && args.dry_run === true) || cfg.test_mode || !cfg.enabled;
  const now = Date.now();
  const result = { dry_run: dry, enabled: !!cfg.enabled, inactief: [], agenda: [] };

  const send = async (to, subject, body) => {
    if (dry) return;
    await base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body: html(body), from_name: cfg.from_name });
  };

  // ---------- 1. Inactieve leden ----------
  const [users, progress, subs, lessons, modules, tracks, log] = await Promise.all([
    db.User.list(), db.LeerVoortgang.list("-created_date", 10000), db.LeerInzending.list("-updated_date", 10000),
    db.LeerLes.list("order", 5000), db.LeerModule.list("order", 1000), db.LeerTraject.list("order", 100),
    db.LeerHerinnering.filter({ kind: "inactief" }, "-sent_at", 10000),
  ]);
  const moduleOrder = Object.fromEntries(modules.map((m) => [m.id, m.order ?? 0]));
  const trackByKey = Object.fromEntries(tracks.map((t) => [t.key, t]));
  const learnLessons = lessons
    .filter((l) => l.published !== false && trackByKey[l.track_key]?.published && trackByKey[l.track_key]?.type !== "bibliotheek")
    .sort((a, b) => (trackByKey[a.track_key].order - trackByKey[b.track_key].order) || (moduleOrder[a.module_id] - moduleOrder[b.module_id]) || ((a.order ?? 0) - (b.order ?? 0)));

  const members = users.filter((u) => u.role !== "admin" && uf(u, "apex_role") !== "coach" && (uf(u, "apex_packages") || []).length > 0);
  for (const u of members) {
    const pk = uf(u, "apex_packages") || [];
    const mine = learnLessons.filter((l) => (l.access_packages || []).some((p) => pk.includes(p)) && (trackByKey[l.track_key].access_packages || []).some((p) => pk.includes(p)));
    const done = new Set(progress.filter((p) => p.member_email === u.email).map((p) => p.les_id));
    const activity = [
      ...progress.filter((p) => p.member_email === u.email).map((p) => time(p.completed_at || p.created_date)),
      ...subs.filter((s) => s.member_email === u.email).map((s) => time(s.updated_date || s.submitted_at)),
    ];
    if (!activity.length || !mine.length) continue; // nog niet begonnen of geen leerlijn
    const last = Math.max(...activity);
    const pct = Math.round((mine.filter((l) => done.has(l.id)).length / mine.length) * 100);
    if (pct < (cfg.min_progress ?? 0) || pct > (cfg.max_progress ?? 90)) continue;

    const sent = log.filter((h) => h.member_email === u.email && time(h.sent_at) > last).sort((a, b) => time(a.sent_at) - time(b.sent_at));
    const n = sent.length;
    const days = (cfg.days || []).map(Number).filter((d) => d > 0);
    if (n >= days.length) continue;
    const from = n === 0 ? last : time(sent[n - 1].sent_at);
    const daysSince = Math.floor((now - from) / DAY);
    if (daysSince < days[n]) continue;

    const next = mine.find((l) => !done.has(l.id));
    const vars = {
      voornaam: (u.full_name || "").split(" ")[0] || "daar",
      les: next?.title || "je volgende les",
      leerlijn: next ? trackByKey[next.track_key].title : "je leerlijn",
      link: cfg.app_url || "",
    };
    await send(u.email, fill(cfg.subject, vars), fill(cfg.body, vars));
    if (!dry) {
      await db.LeerHerinnering.create({ member_email: u.email, member_name: u.full_name || u.email, kind: "inactief", number: n + 1,
        sent_at: new Date(now).toISOString(), days_inactive: Math.floor((now - last) / DAY), test: false, detail: vars.les });
    }
    result.inactief.push({ email: u.email, naam: u.full_name, herinnering: n + 1, dagen_niet_actief: Math.floor((now - last) / DAY), voortgang: pct, volgende_les: vars.les });
  }

  // ---------- 2. Agenda: herinnering de dag van tevoren ----------
  if (cfg.event_reminders) {
    const events = (await db.LeerEvent.list("start", 500)).filter((e) => time(e.start) > now + 12 * 3600000 && time(e.start) < now + 36 * 3600000);
    for (const e of events) {
      const regs = await db.LeerAanmelding.filter({ event_id: e.id, status: "aangemeld" });
      for (const r of regs.filter((x) => !x.reminder_sent)) {
        const when = new Date(e.start).toLocaleString("nl-NL", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" });
        const body = `Hoi ${(r.member_name || "").split(" ")[0] || "daar"},\n\nMorgen is het zover: ${e.title}, ${when}.${e.location ? `\nLocatie: ${e.location}` : ""}${e.online_url ? `\nOnline: ${e.online_url}` : ""}\n\nTot dan!\nJeroen`;
        await send(r.member_email, `Morgen: ${e.title}`, body);
        if (!dry) await db.LeerAanmelding.update(r.id, { reminder_sent: true });
        result.agenda.push({ email: r.member_email, event: e.title, start: e.start });
      }
    }
  }

  return Response.json(result);
}
