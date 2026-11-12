// Toegangs- en planningslogica van de leeromgeving (puur, zonder API-calls).
// De echte beveiliging van lessen zit in de RLS van LeerLes (apex_packages op de User);
// deze functies bepalen wat er in de interface open, dicht of "binnenkort" is.

const DAY = 24 * 60 * 60 * 1000;

// Base44 geeft eigen User-velden terug op het user-object; voor de zekerheid ook user.data.
export function userField(user, key) {
  if (!user) return undefined;
  return user[key] ?? user.data?.[key];
}

export function isAdmin(user) {
  return user?.role === "admin";
}

export function isCoach(user) {
  return isAdmin(user) || userField(user, "apex_role") === "coach";
}

export function userPackages(user) {
  const pk = userField(user, "apex_packages");
  return Array.isArray(pk) ? pk : [];
}

// Admins en coaches zien alles (preview); leden alleen hun pakketten.
export function hasPackage(item, user) {
  if (isCoach(user)) return true;
  const allowed = item?.access_packages || [];
  if (allowed.length === 0) return true;
  const mine = userPackages(user);
  return allowed.some((p) => mine.includes(p));
}

export function canSeeTrack(track, user) {
  if (!track) return false;
  if (!track.published && !isAdmin(user)) return false;
  return hasPackage(track, user);
}

export function canSeeLesson(lesson, user) {
  if (!lesson) return false;
  if (lesson.published === false && !isAdmin(user)) return false;
  return hasPackage(lesson, user);
}

function parseDate(d) {
  if (!d) return null;
  const [y, m, day] = String(d).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, day);
}

// Startmoment van een week: startdatum + (week - 1) * 7 dagen, 00:00.
export function weekStart(schedule, weekNumber) {
  const start = parseDate(schedule?.start_date);
  if (!start || !weekNumber) return null;
  return new Date(start.getTime() + (weekNumber - 1) * 7 * DAY);
}

const DRIPS = ["wekelijks_cohort", "wekelijks_vanaf_start"];

// Het schema van een leerlijn: de startdatum van de ronde (cohort) of de persoonlijke startdatum van het lid.
export function trackSchedule(track, cohort, user) {
  if (track?.drip === "wekelijks_cohort") return cohort ? { start_date: cohort.start_date, source: "ronde" } : null;
  if (track?.drip === "wekelijks_vanaf_start") {
    const start = userField(user, "apex_start_date");
    return start ? { start_date: start, source: "start" } : null;
  }
  return null;
}

const weekOf = (module) => module?.week_number || module?.order || 1;

// Is een module vrijgegeven? Alleen relevant bij een wekelijkse vrijgave.
export function moduleUnlock(module, track, schedule, user, now = new Date()) {
  if (!DRIPS.includes(track?.drip) || isCoach(user)) return { open: true, opensAt: null };
  const week = weekOf(module);
  if (week <= 1) return { open: true, opensAt: null };
  if (!schedule) return { open: false, opensAt: null, noSchedule: true };
  const opensAt = weekStart(schedule, week);
  return { open: !opensAt || now >= opensAt, opensAt };
}

// Deadline van een opdracht: start van de week + deadline_day_offset dagen, 23:59:59.
export function assignmentDeadline(assignment, module, track, schedule) {
  if (assignment?.deadline_day_offset == null || !DRIPS.includes(track?.drip)) return null;
  const start = weekStart(schedule, weekOf(module));
  if (!start) return null;
  const d = new Date(start.getTime() + assignment.deadline_day_offset * DAY);
  d.setHours(23, 59, 59, 0);
  return d;
}

export function isPastDeadline(deadline, now = new Date()) {
  return !!deadline && now > deadline;
}

// Bij een stappenplan (sequential) is een les pas open als de vorige is afgerond.
export function sequentialLocked(track, orderedLessons, lesson, doneIds, user) {
  if (!track?.sequential || isCoach(user)) return false;
  const idx = orderedLessons.findIndex((l) => l.id === lesson.id);
  if (idx <= 0) return false;
  return !doneIds.has(orderedLessons[idx - 1].id);
}

export function formatDate(d, withTime = false) {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  const opts = { weekday: "short", day: "numeric", month: "long" };
  if (withTime) Object.assign(opts, { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("nl-NL", opts);
}
