// Zet de leeromgeving-velden van een lid (pakketten, rol, coach, ronde, startdatum).
// apex_packages en apex_role zijn op de User-entiteit vergrendeld, zodat een lid zichzelf
// geen extra toegang kan geven. Alleen een admin mag deze functie aanroepen; de functie
// schrijft daarna met de service-role.
import { createClientFromRequest } from "npm:@base44/sdk";

const ALLOWED = ["apex_packages", "apex_role", "apex_coach_email", "apex_cohort", "apex_start_date"];

export default async function (req) {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me();
  if (!me || me.role !== "admin") {
    return Response.json({ error: "Alleen een admin mag toegang aanpassen." }, { status: 403 });
  }

  const { user_id, values } = await req.json();
  if (!user_id || typeof values !== "object" || values === null) {
    return Response.json({ error: "user_id en values zijn verplicht." }, { status: 400 });
  }

  const update = {};
  for (const key of ALLOWED) {
    if (key in values) update[key] = values[key];
  }
  if ("apex_packages" in update && !Array.isArray(update.apex_packages)) {
    return Response.json({ error: "apex_packages moet een lijst zijn." }, { status: 400 });
  }

  const user = await base44.asServiceRole.entities.User.update(user_id, update);
  return Response.json({ success: true, user });
}
