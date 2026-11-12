// Nagebootste Base44-client voor de lokale preview. Data staat in localStorage van de browser.
// Bootst ook de RLS-regels na (LeerLes per pakket; inzendingen/voortgang alleen eigen, coach of admin).

const KEY = "apex-leeromgeving-demo-v2";
const listeners = new Set();

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { tables: {}, currentUser: null };
  } catch {
    return { tables: {}, currentUser: null };
  }
}
let db = load();
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* opslag vol of geblokkeerd */ }
  listeners.forEach((l) => l());
}

export const demo = {
  get db() { return db; },
  reset() { db = { tables: {}, currentUser: null }; persist(); },
  setUser(id) { db.currentUser = id; persist(); },
  table(name) { return (db.tables[name] ||= []); },
  save: persist,
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const now = () => new Date().toISOString();
const me = () => demo.table("User").find((u) => u.id === db.currentUser) || null;

function matches(rec, query = {}) {
  return Object.entries(query).every(([k, cond]) => {
    const v = rec[k];
    if (cond && typeof cond === "object" && !Array.isArray(cond)) {
      if ("$in" in cond) return Array.isArray(v) ? v.some((x) => cond.$in.includes(x)) : cond.$in.includes(v);
      if ("$ne" in cond) return v !== cond.$ne;
      return true;
    }
    return Array.isArray(v) ? v.includes(cond) : v === cond;
  });
}

function canRead(entity, rec, u) {
  if (!u) return false;
  if (u.role === "admin") return true;
  if (entity === "LeerLes") return (rec.access_packages || []).some((p) => (u.apex_packages || []).includes(p));
  if (entity === "LeerInzending" || entity === "LeerVoortgang") {
    return rec.created_by_id === u.id || (rec.coach_email && rec.coach_email === u.email);
  }
  if (entity === "User") return rec.id === u.id;
  return true;
}

function sortRows(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith("-");
  const key = desc ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    const x = a[key] ?? ""; const y = b[key] ?? "";
    const r = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
    return desc ? -r : r;
  });
}

const delay = (v) => new Promise((res) => setTimeout(() => res(structuredClone(v)), 40));

function handler(name) {
  const rows = () => demo.table(name);
  const visible = () => rows().filter((r) => canRead(name, r, me()));
  return {
    async list(sort, limit = 50) { return delay(sortRows(visible(), sort).slice(0, limit)); },
    async filter(query, sort, limit = 50) { return delay(sortRows(visible().filter((r) => matches(r, query)), sort).slice(0, limit)); },
    async get(id) { return delay(visible().find((r) => r.id === id)); },
    async create(data) {
      const u = me();
      const rec = { ...structuredClone(data), id: uid(), created_date: now(), updated_date: now(), created_by: u?.email, created_by_id: u?.id };
      rows().push(rec); persist();
      return delay(rec);
    },
    async bulkCreate(list) { const out = []; for (const d of list) out.push(await this.create(d)); return out; },
    async update(id, data) {
      const rec = rows().find((r) => r.id === id);
      if (!rec) throw new Error("Niet gevonden");
      Object.assign(rec, structuredClone(data), { updated_date: now() }); persist();
      return delay(rec);
    },
    async delete(id) { db.tables[name] = rows().filter((r) => r.id !== id); persist(); return { success: true }; },
  };
}

const entities = new Proxy({}, { get: (_, name) => handler(name) });

export const base44 = {
  entities,
  auth: {
    async me() { const u = me(); if (!u) throw new Error("Niet ingelogd"); return delay(u); },
    async updateMe(data) { return entities.User.update(db.currentUser, data); },
    async isAuthenticated() { return !!me(); },
    logout() {},
    redirectToLogin() {},
  },
  users: {
    async inviteUser(email) {
      demo.table("User").push({ id: uid(), email, full_name: email.split("@")[0], role: "user", apex_packages: [], created_date: now() });
      persist();
    },
  },
  functions: {
    async invoke(fn, payload) {
      if (fn !== "leer-toegang") throw Object.assign(new Error("Onbekende functie"), { response: { status: 404 } });
      if (me()?.role !== "admin") throw Object.assign(new Error("Geen toegang"), { response: { status: 403 } });
      const u = await entities.User.update(payload.user_id, payload.values);
      return { data: { success: true, user: u } };
    },
  },
};

export default base44;
