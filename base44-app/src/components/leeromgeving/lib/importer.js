import { base44 } from "@/api/base44Client";
import { loadContent } from "./api";

const E = () => base44.entities;
const CHUNK = 20;

function strip(obj, keys) {
  const out = { ...obj };
  for (const k of keys) delete out[k];
  return out;
}

async function bulk(entity, rows, onStep) {
  const created = [];
  for (let i = 0; i < rows.length; i += CHUNK) {
    const part = await E()[entity].bulkCreate(rows.slice(i, i + CHUNK));
    created.push(...part);
    onStep?.(rows.length ? Math.min(i + CHUNK, rows.length) : 0, rows.length);
  }
  return created;
}

// Importeert content/leeromgeving-seed.json. Bestaande items (zelfde key/ref) worden
// overgeslagen, tenzij overwrite = true. Veilig om meerdere keren te draaien.
export async function importSeed(seed, { overwrite = false, log = () => {} } = {}) {
  const cur = await loadContent();
  const stats = {};

  async function upsert(entity, rows, idKey, existing, prep = (r) => r) {
    const have = Object.fromEntries(existing.filter((e) => e[idKey]).map((e) => [e[idKey], e]));
    const fresh = rows.filter((r) => !have[r[idKey]]).map(prep);
    const created = await bulk(entity, fresh, (n, t) => log(`${entity}: ${n}/${t}`));
    let updated = 0;
    if (overwrite) {
      for (const r of rows.filter((r) => have[r[idKey]])) {
        await E()[entity].update(have[r[idKey]].id, prep(r));
        updated += 1;
      }
    }
    stats[entity] = { nieuw: created.length, bijgewerkt: updated, overgeslagen: rows.length - fresh.length - updated };
    const map = { ...Object.fromEntries(Object.entries(have).map(([k, v]) => [k, v.id])) };
    fresh.forEach((r, i) => { if (created[i]) map[r[idKey]] = created[i].id; });
    return map;
  }

  log("Pakketten…");
  await upsert("LeerPakket", seed.pakketten || [], "key", cur.packages);
  log("Leerlijnen…");
  await upsert("LeerTraject", (seed.trajecten || []).map((t) => ({ ...t, ref: t.key })), "key", cur.tracks);
  log("Rondes…");
  await upsert("LeerCohort", seed.cohorten || [], "key", cur.cohorts);
  log("Opdrachten…");
  const opMap = await upsert("LeerOpdracht", seed.opdrachten || [], "ref", cur.assignments, (o) => strip(o, ["lesson_ref"]));
  log("Modules…");
  const modMap = await upsert("LeerModule", seed.modules || [], "ref", cur.modules);
  log("Lessen…");
  const lesMap = await upsert("LeerLes", seed.lessen || [], "ref", cur.lessons, (l) => ({
    ...strip(l, ["module_ref", "assignment_ref"]),
    module_id: modMap[l.module_ref] || "",
    assignment_id: l.assignment_ref ? opMap[l.assignment_ref] || "" : "",
  }));

  log("Agenda…");
  const curEvents = await E().LeerEvent.list("start", 2000);
  await upsert("LeerEvent", seed.evenementen || [], "ref", curEvents);
  log("Instellingen…");
  const curSettings = await E().LeerInstelling.list(null, 50);
  await upsert("LeerInstelling", seed.instellingen || [], "key", curSettings);

  log("Opdrachten koppelen aan lessen…");
  for (const o of seed.opdrachten || []) {
    if (o.lesson_ref && opMap[o.ref] && lesMap[o.lesson_ref]) {
      await E().LeerOpdracht.update(opMap[o.ref], { lesson_id: lesMap[o.lesson_ref] });
    }
  }
  log("Klaar.");
  return stats;
}

// Exporteert de huidige content in hetzelfde formaat (back-up of overzetten naar een andere app).
export async function exportContent() {
  const c = await loadContent();
  const modRef = Object.fromEntries(c.modules.map((m) => [m.id, m.ref || m.id]));
  const opRef = Object.fromEntries(c.assignments.map((a) => [a.id, a.ref || a.id]));
  const lesRef = Object.fromEntries(c.lessons.map((l) => [l.id, l.ref || l.id]));
  const clean = (r) => strip(r, ["id", "created_date", "updated_date", "created_by", "created_by_id", "is_sample"]);
  return {
    version: 1,
    exported_at: new Date().toISOString(),
    pakketten: c.packages.map(clean),
    trajecten: c.tracks.map(clean),
    cohorten: c.cohorts.map(clean),
    modules: c.modules.map((m) => ({ ...clean(m), ref: modRef[m.id] })),
    opdrachten: c.assignments.map((a) => ({ ...clean(strip(a, ["lesson_id"])), ref: opRef[a.id], lesson_ref: lesRef[a.lesson_id] || "" })),
    lessen: c.lessons.map((l) => ({
      ...clean(strip(l, ["module_id", "assignment_id"])),
      ref: lesRef[l.id],
      module_ref: modRef[l.module_id] || "",
      assignment_ref: l.assignment_id ? opRef[l.assignment_id] || "" : "",
    })),
  };
}
