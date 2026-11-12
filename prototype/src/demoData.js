import seed from "../../content/leeromgeving-seed.json";
import { base44, demo } from "./mock/base44Client";
import { importSeed } from "@/components/leeromgeving/lib/importer";

// Fictieve demo-accounts om alle rollen en rechten te kunnen bekijken.
export const DEMO_USERS = [
  { id: "u-admin", full_name: "Jeroen (admin)", email: "admin@demo.apex", role: "admin", apex_role: "coach", apex_packages: ["alles"] },
  { id: "u-coach", full_name: "Coach Lisa", email: "coach@demo.apex", role: "user", apex_role: "coach", apex_packages: ["alles"] },
  { id: "u-sg", full_name: "Sanne de Vries", email: "sanne@demo.apex", role: "user", apex_role: "lid", apex_packages: ["small_group"] },
  { id: "u-sgp", full_name: "Mark Jansen", email: "mark@demo.apex", role: "user", apex_role: "lid", apex_packages: ["small_group_plus"], apex_coach_email: "coach@demo.apex" },
  { id: "u-90", full_name: "Eva Bakker", email: "eva@demo.apex", role: "user", apex_role: "lid", apex_packages: ["challenge_90"], apex_coach_email: "coach@demo.apex", apex_cohort: "c90-voorbeeld" },
];

function mondayWeeksAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - n * 7);
  return d.toISOString().slice(0, 10);
}

export async function ensureDemo() {
  if (demo.db.seeded) return;
  demo.reset();
  demo.table("User").push(...DEMO_USERS.map((u) => ({ ...u, created_date: new Date().toISOString() })));
  demo.setUser("u-admin");
  const s = structuredClone(seed);
  s.cohorten = s.cohorten.map((c) => ({ ...c, start_date: mondayWeeksAgo(4), name: "90 Dagen · demo-ronde", zoom_url: "https://zoom.us" }));
  // Agenda van de demo-ronde laten aansluiten op de verschoven startdatum.
  const shift = new Date(mondayWeeksAgo(4)).getTime() - new Date("2026-11-16").getTime();
  s.evenementen = s.evenementen.map((e) => (e.cohort_key ? { ...e, start: new Date(new Date(e.start).getTime() + shift).toISOString(), end: e.end ? new Date(new Date(e.end).getTime() + shift).toISOString() : "" } : e));
  await importSeed(s);

  const E = base44.entities;
  const lessons = await E.LeerLes.list("order", 2000);
  const ops = await E.LeerOpdracht.list(null, 500);
  const byRef = (ref) => lessons.find((l) => l.ref === ref);
  const opFor = (l) => ops.find((o) => o.id === l.assignment_id);

  const act = async (userId, refs, subs = []) => {
    const u = DEMO_USERS.find((x) => x.id === userId);
    demo.setUser(userId);
    for (const ref of refs) {
      const l = byRef(ref);
      if (l) await E.LeerVoortgang.create({ les_id: l.id, track_key: l.track_key, member_email: u.email, member_name: u.full_name, coach_email: u.apex_coach_email || "", completed_at: new Date().toISOString() });
    }
    for (const sub of subs) {
      const l = byRef(sub.ref); const o = opFor(l);
      await E.LeerInzending.create({ opdracht_id: o.id, opdracht_title: o.title, les_id: l.id, track_key: l.track_key, member_email: u.email, member_name: u.full_name, coach_email: u.apex_coach_email || "", submitted_at: new Date().toISOString(), ...sub.data });
    }
  };

  await act("u-sg", ["f1-s1", "f1-s2"]);
  await act("u-sgp", ["f1-s1", "f1-s2", "f1-s3", "f1-s4", "f1-s5", "f1-s6", "f1-s7", "f1-s8", "f1-s9", "f2-l1"], [
    { ref: "f2-l1", data: { status: "ingediend", answers: { doel: "10 kg lichter en fitter voor de zomer", waarom: "Ik wil weer energie hebben om met mijn kinderen te sporten.", visualisatie: "Ik loop zonder te hijgen de trap op en voel me sterk." } } },
  ]);
  await act("u-90", ["c90-intro", "c90-kickoff", "c90-s1", "c90-s2"], [
    { ref: "c90-kickoff", data: { status: "feedback", answers: { gezondheid_cijfer: 5, gezondheid_a: "Te weinig beweging, slecht slapen", gezondheid_b: "3x per week trainen, 7 uur slaap", doel_achter: "Een voorbeeld zijn voor mijn kinderen" }, feedback: "Sterke start Eva! Maak Punt B bij relaties nog concreter: wat doe je wekelijks?", feedback_by: "Coach Lisa", feedback_at: new Date().toISOString(), feedback_seen: false } },
    { ref: "c90-s1", data: { status: "ingediend", answers: { cirkel: "Elke maandag opnieuw beginnen met gezond eten", zigzag: "Sporten: 2 weken goed, dan weer niet", straight: "Mijn werk", kost: "De cirkel met eten", acties: "Zondag maaltijden preppen en dinsdag + donderdag vast trainen" } } },
  ]);
  // Sanne heeft zich al 2× afgemeld voor een training; een 3e afmelding in de agenda geeft een melding.
  for (const [d, t] of [[12, "Small group ma 19:00"], [5, "Small group vr 09:00"]]) {
    const when = new Date(Date.now() - d * 86400000).toISOString();
    demo.table("LeerAfmelding").push({ id: `afm-${d}`, member_email: "sanne@demo.apex", member_name: "Sanne de Vries", coach_email: "",
      training: t, training_start: when, cancelled_at: when, source: "handmatig", created_date: when, created_by_id: "u-admin" });
  }
  // Mark is 9 dagen niet actief geweest (zichtbaar in Beheer → Herinneringen → Proefrun).
  const ago = new Date(Date.now() - 9 * 86400000).toISOString();
  for (const r of demo.table("LeerVoortgang").filter((x) => x.member_email === "mark@demo.apex")) Object.assign(r, { completed_at: ago, created_date: ago });
  for (const r of demo.table("LeerInzending").filter((x) => x.member_email === "mark@demo.apex")) Object.assign(r, { updated_date: ago, submitted_at: ago });
  demo.save();
  demo.db.seeded = true;
  demo.setUser("u-90");
}
