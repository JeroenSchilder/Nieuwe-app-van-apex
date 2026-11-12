import { base44 } from "@/api/base44Client";
import { userField } from "./access";

const E = () => base44.entities;
const MAX = 2000;

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

// Alle content in één keer. LeerLes wordt door RLS al gefilterd op de pakketten van de gebruiker.
export async function loadContent() {
  const [tracks, modules, lessons, assignments, packages, cohorts] = await Promise.all([
    E().LeerTraject.list("order", 100),
    E().LeerModule.list("order", 500),
    E().LeerLes.list("order", MAX),
    E().LeerOpdracht.list("-created_date", 500),
    E().LeerPakket.list("order", 50),
    E().LeerCohort.list("-start_date", 100),
  ]);
  return {
    tracks: tracks.sort(byOrder),
    modules: modules.sort(byOrder),
    lessons: lessons.sort(byOrder),
    assignments,
    packages: packages.sort(byOrder),
    cohorts,
  };
}

export async function loadMyState(user) {
  const [progress, submissions] = await Promise.all([
    E().LeerVoortgang.filter({ member_email: user.email }, "-created_date", MAX),
    E().LeerInzending.filter({ member_email: user.email }, "-created_date", MAX),
  ]);
  return { progress, submissions };
}

function memberStamp(user) {
  return {
    member_email: user.email,
    member_name: user.full_name || user.email,
    coach_email: userField(user, "apex_coach_email") || "",
  };
}

export async function markComplete(user, lesson) {
  return E().LeerVoortgang.create({
    ...memberStamp(user),
    les_id: lesson.id,
    track_key: lesson.track_key,
    completed_at: new Date().toISOString(),
  });
}

export async function markIncomplete(progressRecord) {
  return E().LeerVoortgang.delete(progressRecord.id);
}

// Bewaart een inzending. status "concept" = tussentijds opslaan, "ingediend" = inleveren.
export async function saveSubmission({ user, assignment, lesson, module, existing, answers, status }) {
  const data = {
    answers,
    status,
    ...(status === "ingediend" ? { submitted_at: new Date().toISOString() } : {}),
  };
  if (existing) return E().LeerInzending.update(existing.id, data);
  return E().LeerInzending.create({
    ...memberStamp(user),
    ...data,
    opdracht_id: assignment.id,
    opdracht_title: assignment.title,
    les_id: lesson?.id || assignment.lesson_id || "",
    track_key: lesson?.track_key || assignment.track_key || "",
    week_number: module?.week_number || null,
  });
}

export async function markFeedbackSeen(submission) {
  return E().LeerInzending.update(submission.id, { feedback_seen: true });
}

// ---- Coach ---------------------------------------------------------------

export async function loadCoachState(user, isAdminUser) {
  const query = isAdminUser ? {} : { coach_email: user.email };
  const [submissions, progress] = await Promise.all([
    E().LeerInzending.filter(query, "-updated_date", MAX),
    E().LeerVoortgang.filter(query, "-created_date", MAX),
  ]);
  return { submissions, progress };
}

export async function giveFeedback(user, submission, { feedback, status }) {
  return E().LeerInzending.update(submission.id, {
    feedback,
    status,
    feedback_by: user.full_name || user.email,
    feedback_at: new Date().toISOString(),
    feedback_seen: false,
  });
}

// ---- Beheer (admin) ------------------------------------------------------

export async function listUsers() {
  return E().User.list("-created_date", 1000);
}

// Pakketten en rol zijn vergrendeld op de User; daarom via de backend-functie.
// Werkt die (nog) niet, dan valt het terug op een directe update.
export async function setUserAccess(userId, values) {
  try {
    const res = await base44.functions.invoke("leer-toegang", { user_id: userId, values });
    return res.data;
  } catch (err) {
    if (err?.response?.status === 403) throw err;
    return E().User.update(userId, values);
  }
}

// ---- Agenda ----------------------------------------------------------------

export async function loadAgenda(user) {
  const [events, regs] = await Promise.all([
    E().LeerEvent.list("start", 500),
    E().LeerAanmelding.filter({ member_email: user.email }, "-created_date", 1000),
  ]);
  return { events, registrations: regs };
}

export async function setRegistration(user, event, existing, status) {
  if (existing) return E().LeerAanmelding.update(existing.id, { status });
  return E().LeerAanmelding.create({
    ...memberStamp(user),
    event_id: event.id,
    event_title: event.title,
    event_start: event.start,
    status,
  });
}

export async function loadAllRegistrations() {
  return E().LeerAanmelding.list("-created_date", 5000);
}

// ---- Quiz ------------------------------------------------------------------

export function scoreQuiz(assignment, answers) {
  const qs = assignment.fields.filter((f) => f.type === "quiz");
  const good = qs.filter((f) => answers[f.key] !== undefined && answers[f.key] === f.correct).length;
  const score = qs.length ? Math.round((good / qs.length) * 100) : 0;
  return { score, good, total: qs.length, passed: score >= (assignment.pass_percentage ?? 70) };
}

export async function saveQuizAttempt({ user, assignment, lesson, answers }) {
  const r = scoreQuiz(assignment, answers);
  await E().LeerInzending.create({
    ...memberStamp(user),
    opdracht_id: assignment.id,
    opdracht_title: assignment.title,
    les_id: lesson?.id || "",
    track_key: lesson?.track_key || "",
    answers,
    status: r.passed ? "goedgekeurd" : "ingediend",
    submitted_at: new Date().toISOString(),
    score: r.score,
    passed: r.passed,
  });
  return r;
}

// ---- Herinneringen (beheer) ------------------------------------------------

export const REMINDER_DEFAULTS = {
  key: "herinneringen", enabled: false, test_mode: true, days: [7, 30, 30], min_progress: 0, max_progress: 90,
  subject: "{voornaam}, je volgende stap staat klaar",
  body: "Hoi {voornaam},\n\nHet is alweer even geleden dat je in de Apex leeromgeving bent geweest. Je volgende stap staat voor je klaar: {les} ({leerlijn}).\n\nPak hem vandaag op, al is het maar tien minuten: {link}\n\nSportieve groet,\nJeroen",
  app_url: "", event_reminders: true, from_name: "Apex Online Coaching",
};

export async function loadReminderSettings() {
  const [s] = await E().LeerInstelling.filter({ key: "herinneringen" });
  return s ? { ...REMINDER_DEFAULTS, ...s } : { ...REMINDER_DEFAULTS };
}

export async function saveReminderSettings(s) {
  const { id, created_date, updated_date, created_by, created_by_id, ...data } = s;
  return id ? E().LeerInstelling.update(id, data) : E().LeerInstelling.create(data);
}

export async function runReminders(dryRun) {
  const res = await base44.functions.invoke("leer-herinneringen", { dry_run: dryRun });
  return res.data;
}

export async function loadReminderLog() {
  return E().LeerHerinnering.list("-sent_at", 200);
}
