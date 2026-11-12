// Controleert de startcontent (content/leeromgeving-seed.json) op fouten die leden zouden raken.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as access from "../../base44-app/src/components/leeromgeving/lib/access.js";

const seed = JSON.parse(readFileSync(new URL("../../content/leeromgeving-seed.json", import.meta.url), "utf8"));
const pakketten = new Set(seed.pakketten.map((p) => p.key));
const trajecten = Object.fromEntries(seed.trajecten.map((t) => [t.key, t]));
const modules = new Set(seed.modules.map((m) => m.ref));
const opdrachten = Object.fromEntries(seed.opdrachten.map((o) => [o.ref, o]));
const CATS = ["start", "doelen", "mindset", "gewoontes", "voeding", "training", "mobiliteit", "herstel", "lichaam", "relaties", "tijd"];

test("verwijzingen kloppen en sleutels zijn uniek", () => {
  for (const lijst of [seed.lessen, seed.modules, seed.opdrachten, seed.evenementen]) {
    const refs = lijst.map((x) => x.ref);
    assert.equal(new Set(refs).size, refs.length, "dubbele ref");
  }
  for (const l of seed.lessen) {
    assert.ok(trajecten[l.track_key], `${l.ref}: onbekende leerlijn`);
    assert.ok(modules.has(l.module_ref), `${l.ref}: onbekende module`);
    if (l.assignment_ref) assert.ok(opdrachten[l.assignment_ref], `${l.ref}: onbekende opdracht`);
    assert.ok(l.title.trim(), `${l.ref}: geen titel`);
    for (const c of l.categories) assert.ok(CATS.includes(c), `${l.ref}: onbekend thema ${c}`);
    for (const p of l.access_packages) assert.ok(pakketten.has(p), `${l.ref}: onbekend pakket ${p}`);
    assert.ok(l.access_packages.includes("alles"), `${l.ref}: coaches (pakket 'alles') moeten elke les zien`);
    if (l.vimeo_id) assert.match(l.vimeo_id, /^\d+$/, `${l.ref}: ongeldig Vimeo-ID`);
  }
});

test("Small Group zonder coaching ziet alleen Fase 1, en daarin 7 stappen plus de check", () => {
  const lid = { role: "user", apex_role: "lid", apex_packages: ["small_group"] };
  const zichtbaar = seed.lessen.filter((l) => access.canSeeTrack(trajecten[l.track_key], lid) && access.canSeeLesson(l, lid));
  assert.deepEqual([...new Set(zichtbaar.map((l) => l.track_key))], ["fase1"]);
  assert.equal(zichtbaar.length, 8);
  // Ook op serverniveau (RLS op LeerLes kijkt alleen naar access_packages van de les):
  const viaRls = seed.lessen.filter((l) => l.access_packages.includes("small_group"));
  assert.deepEqual([...new Set(viaRls.map((l) => l.track_key))], ["fase1"]);
});

test("elk pakket geeft toegang tot wat is afgesproken", () => {
  const zien = (pk) => [...new Set(seed.lessen
    .filter((l) => trajecten[l.track_key].published && trajecten[l.track_key].access_packages.includes(pk) && l.access_packages.includes(pk))
    .map((l) => l.track_key))].sort();
  assert.deepEqual(zien("small_group_plus"), ["bibliotheek", "fase1", "fase2"]);
  assert.deepEqual(zien("challenge_90"), ["bibliotheek", "challenge90", "fase1", "fase2"]);
});

test("90 dagen: 13 weken, elke sessie heeft een video en een opdracht met deadline", () => {
  const weken = seed.modules.filter((m) => m.track_key === "challenge90");
  assert.deepEqual(weken.map((m) => m.week_number), Array.from({ length: 13 }, (_, i) => i + 1));
  const sessies = seed.lessen.filter((l) => /^c90-s\d+$/.test(l.ref));
  assert.equal(sessies.length, 12);
  for (const s of sessies) {
    assert.ok(s.vimeo_id, `${s.ref}: geen video`);
    const o = opdrachten[s.assignment_ref];
    assert.equal(o.deadline_day_offset, 5, `${s.ref}: deadline is zaterdag`);
    assert.ok(o.fields.some((f) => f.required), `${s.ref}: minstens één verplichte vraag`);
  }
});

test("opdrachten en quizzen zijn goed opgebouwd", () => {
  for (const o of seed.opdrachten) {
    const keys = o.fields.map((f) => f.key);
    assert.equal(new Set(keys).size, keys.length, `${o.ref}: dubbele veldsleutel`);
    for (const f of o.fields) {
      if (f.type === "select" || f.type === "quiz") assert.ok(f.options?.length >= 2, `${o.ref}.${f.key}: te weinig opties`);
      if (f.type === "quiz") assert.ok(f.options.includes(f.correct), `${o.ref}.${f.key}: goede antwoord staat niet bij de opties`);
    }
    if (o.kind !== "quiz") assert.ok(o.fields.some((f) => f.required), `${o.ref}: zonder verplichte vraag kan een lid een lege opdracht inleveren`);
    if (o.kind === "quiz") assert.ok(o.fields.some((f) => f.type === "quiz"), `${o.ref}: quiz zonder vragen`);
  }
});

test("agenda: geldige tijden, einde na begin, bekende pakketten", () => {
  for (const e of seed.evenementen) {
    assert.ok(!Number.isNaN(Date.parse(e.start)), `${e.ref}: ongeldige starttijd`);
    assert.match(e.start, /Z$/, `${e.ref}: tijd moet in UTC staan`);
    if (e.end) assert.ok(Date.parse(e.end) > Date.parse(e.start), `${e.ref}: einde voor begin`);
    for (const p of e.access_packages) assert.ok(pakketten.has(p), `${e.ref}: onbekend pakket`);
  }
  const gc = seed.evenementen.filter((e) => e.kind === "groepscoaching");
  for (const e of gc) {
    const uur = new Date(e.start).toLocaleTimeString("nl-NL", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit" });
    assert.equal(uur, "20:15", `${e.ref}: groepscoaching begint om 20:15 Nederlandse tijd, ook in de zomertijd`);
  }
});

test("geen persoonsgegevens of mailresten in de lesteksten", () => {
  for (const l of seed.lessen) {
    const tekst = `${l.title} ${l.summary} ${l.body}`;
    assert.doesNotMatch(tekst, /%[A-Z-]+%/, `${l.ref}: mail-plaatshouder`);
    assert.doesNotMatch(tekst, /[\w.+-]+@[\w-]+\.[a-z]{2,}/i, `${l.ref}: e-mailadres`);
    assert.doesNotMatch(tekst, /zoom\.us\/j\//, `${l.ref}: Zoom-link`);
  }
});
