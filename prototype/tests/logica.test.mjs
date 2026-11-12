// Tests voor de regels die niet stuk mogen gaan: wie ziet wat, wanneer komt een week vrij,
// wanneer sluit een opdracht, hoe wordt een quiz gescoord en wat vindt de coach.
// Draaien: npm test (in de map prototype).
import test from "node:test";
import assert from "node:assert/strict";
import * as access from "../../base44-app/src/components/leeromgeving/lib/access.js";
import { scoreQuiz } from "../../base44-app/src/components/leeromgeving/lib/quiz.js";
import { findLessons } from "../../base44-app/base44/functions/leer-coach/zoeken.js";

const lid = (pk, extra = {}) => ({ role: "user", apex_role: "lid", apex_packages: pk, ...extra });
const coach = { role: "user", apex_role: "coach", apex_packages: ["alles"] };
const admin = { role: "admin" };

test("pakketten: een lid ziet alleen inhoud uit het eigen pakket", () => {
  const les = { access_packages: ["small_group_plus", "alles"], published: true };
  assert.equal(access.canSeeLesson(les, lid(["small_group"])), false);
  assert.equal(access.canSeeLesson(les, lid(["small_group_plus"])), true);
  assert.equal(access.canSeeLesson(les, lid([])), false);
  assert.equal(access.canSeeLesson(les, coach), true);
});

test("pakketten: velden onder user.data worden ook gelezen", () => {
  assert.deepEqual(access.userPackages({ data: { apex_packages: ["challenge_90"] } }), ["challenge_90"]);
});

test("niet gepubliceerd: alleen de admin ziet het", () => {
  const traject = { access_packages: ["performance", "alles"], published: false };
  assert.equal(access.canSeeTrack(traject, lid(["performance"])), false);
  assert.equal(access.canSeeTrack(traject, coach), false);
  assert.equal(access.canSeeTrack(traject, admin), true);
});

test("vrijgave per ronde: week 1 is open, latere weken vanaf hun maandag", () => {
  const traject = { drip: "wekelijks_cohort" };
  const ronde = access.trackSchedule(traject, { start_date: "2026-11-16" }, lid(["challenge_90"]));
  const op = (week, datum) => access.moduleUnlock({ week_number: week }, traject, ronde, lid(["challenge_90"]), new Date(datum)).open;
  assert.equal(op(1, "2026-11-01T12:00:00"), true);
  assert.equal(op(3, "2026-11-29T23:00:00"), false);
  assert.equal(op(3, "2026-11-30T00:01:00"), true);
  assert.equal(access.moduleUnlock({ week_number: 3 }, traject, null, lid(["challenge_90"])).open, false, "zonder ronde blijft week 3 dicht");
  assert.equal(access.moduleUnlock({ week_number: 13 }, traject, null, coach).open, true, "coach ziet alles");
});

test("vrijgave vanaf eigen startdatum", () => {
  const traject = { drip: "wekelijks_vanaf_start" };
  const u = lid(["performance"], { apex_start_date: "2026-12-01" });
  const schema = access.trackSchedule(traject, null, u);
  assert.equal(access.moduleUnlock({ order: 2 }, traject, schema, u, new Date("2026-12-07T12:00:00")).open, false);
  assert.equal(access.moduleUnlock({ order: 2 }, traject, schema, u, new Date("2026-12-08T12:00:00")).open, true);
  assert.equal(access.trackSchedule(traject, null, lid(["performance"])), null);
});

test("deadline: zaterdag 23:59 van de week", () => {
  const traject = { drip: "wekelijks_cohort" };
  const ronde = { start_date: "2026-11-16" }; // maandag
  const d = access.assignmentDeadline({ deadline_day_offset: 5 }, { week_number: 2 }, traject, ronde);
  assert.equal(d.getDay(), 6);
  assert.equal(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`, "2026-11-28 23:59");
  assert.equal(access.isPastDeadline(d, new Date(d.getTime() + 2000)), true);
  assert.equal(access.assignmentDeadline({ deadline_day_offset: null }, { week_number: 2 }, traject, ronde), null);
  assert.equal(access.assignmentDeadline({ deadline_day_offset: 5 }, { week_number: 2 }, { drip: "geen" }, ronde), null);
});

test("stappenplan: de volgende stap opent pas na de vorige", () => {
  const lessen = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const traject = { sequential: true };
  assert.equal(access.sequentialLocked(traject, lessen, lessen[0], new Set(), lid([])), false);
  assert.equal(access.sequentialLocked(traject, lessen, lessen[1], new Set(), lid([])), true);
  assert.equal(access.sequentialLocked(traject, lessen, lessen[1], new Set(["a"]), lid([])), false);
  assert.equal(access.sequentialLocked(traject, lessen, lessen[2], new Set(["a"]), coach), false);
});

test("quiz: score en slagingsgrens", () => {
  const quiz = { pass_percentage: 75, fields: [
    { type: "info", key: "i" },
    ...["a", "b", "c", "d"].map((k) => ({ type: "quiz", key: k, options: ["ja", "nee"], correct: "ja" })),
  ] };
  assert.deepEqual(scoreQuiz(quiz, { a: "ja", b: "ja", c: "ja", d: "nee" }), { score: 75, good: 3, total: 4, passed: true });
  assert.equal(scoreQuiz(quiz, { a: "ja", b: "ja" }).passed, false);
  assert.equal(scoreQuiz({ fields: [] }, {}).score, 0);
});

test("coach: de les met het onderwerp in de titel komt bovenaan", () => {
  const lessen = [
    { id: "1", title: "Macro's", body: "eiwit ".repeat(40) + "koolhydraten vetten" },
    { id: "2", title: "Eiwitsynthese", summary: "Hoeveel eiwit je nodig hebt" },
    { id: "3", title: "Slaap", body: "blauw licht" },
  ];
  assert.equal(findLessons("Hoeveel eiwit heb ik nodig?", lessen)[0].id, "2");
  assert.deepEqual(findLessons("xyzzy", lessen), []);
  assert.deepEqual(findLessons("de het een", lessen), []);
});
