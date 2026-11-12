// Ontvangt afmeldingen van buiten de app, bijvoorbeeld uit Trainin (via Zapier/Make of een webhook).
// POST JSON: { "secret": "...", "email": "lid@...", "training": "Small group ma 19:00", "start": "2026-12-01T18:00:00Z", "cancelled_at": "..." }
// Het geheim staat in Base44 → Secrets als AFMELDING_WEBHOOK_SECRET.
import { createClientFromRequest } from "npm:@base44/sdk";
import { secrets } from "base44:runtime";

export default async function (req) {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const expected = secrets.get("AFMELDING_WEBHOOK_SECRET");
  if (!expected || body.secret !== expected) return Response.json({ error: "Ongeldig geheim" }, { status: 401 });
  if (!body.email || !body.training) return Response.json({ error: "email en training zijn verplicht" }, { status: 400 });

  const db = base44.asServiceRole.entities;
  const [user] = await db.User.filter({ email: String(body.email).toLowerCase().trim() });
  const rec = await db.LeerAfmelding.create({
    member_email: String(body.email).toLowerCase().trim(),
    member_name: user?.full_name || body.name || body.email,
    coach_email: user?.apex_coach_email ?? user?.data?.apex_coach_email ?? "",
    training: String(body.training).slice(0, 200),
    training_start: body.start || "",
    cancelled_at: body.cancelled_at || new Date().toISOString(),
    source: "trainin",
  });
  return Response.json({ success: true, id: rec.id });
}
