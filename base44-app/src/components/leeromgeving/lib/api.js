import { base44 } from "@/api/base44Client";
import { userField } from "./access";
import { scoreQuiz } from "./quiz";

const E = () => base44.entities;
const MAX = 2000;

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

// Velden die de overzichten nodig hebben. De lange tekst (body) en het transcript worden pas
// opgehaald als een les wordt geopend (loadLesson); dat scheelt het grootste deel van de laadtijd.
const LESSON_LIST_FIELDS = ["id", "ref", "track_key", "module_id", "title", "order", "step_label", "summary", "key_points",
  "vimeo_id", "vimeo_hash", "video_url", "duration_min", "thumbnail_url", "categories", "assignment_id", "access_packages",
  "completion", "live_session", "published", "needs_review", "review_note", "source"];

export async function loadLesson(id) {
  return E().LeerLes.get(id);
}

// Alle content in één keer. LeerLes wordt door RLS al gefilterd op de pakketten van de gebruiker.
// full = true haalt ook body en transcript op (alleen nodig voor export).
export async function loadContent({ full = false } = {}) {
  const [tracks, modules, lessons, assignments, packages, cohorts] = await Promise.all([
    E().LeerTraject.list("order", 100),
    E().LeerModule.list("order", 500),
    E().LeerLes.list("order", MAX, 0, full ? undefined : LESSON_LIST_FIELDS),
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
  if (existing && existing.status === "aangemeld" && status === "afgemeld") {
    // Afmelding vastleggen; de workflow "Leeromgeving afmeldingen" controleert daarna de drempel.
    await E().LeerAfmelding.create({
      ...memberStamp(user),
      training: event.title,
      training_start: event.start,
      cancelled_at: new Date().toISOString(),
      source: "app",
      event_id: event.id,
    });
  }
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

export async function saveSetting(s) {
  const { id, created_date, updated_date, created_by, created_by_id, ...data } = s;
  return id ? E().LeerInstelling.update(id, data) : E().LeerInstelling.create(data);
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

// ---- Afmeldingen (beheer) --------------------------------------------------

export const CANCEL_DEFAULTS = {
  key: "afmeldingen", enabled: false, test_mode: true, threshold: 3, period_days: 30, late_hours: 0,
  notify_member: true, notify_trainer: true, trainer_emails: "", trainer_phone: "", whatsapp_webhook_url: "",
  member_subject: "{voornaam}, we missen je bij de training",
  member_body: "Hoi {voornaam},\n\nJe hebt je de afgelopen {dagen} dagen {aantal} keer afgemeld voor een training (laatste: {training}).\n\nIs er iets aan de hand of kunnen we je ergens mee helpen? Laat het me weten, dan zoeken we samen naar een oplossing.\n\nSportieve groet,\nJeroen",
  trainer_subject: "Let op: {naam} heeft zich {aantal}× afgemeld in {dagen} dagen",
  trainer_body: "{naam} heeft zich voor de {aantal}e keer afgemeld in de afgelopen {dagen} dagen.\n\nLaatste afmelding: {training} ({datum}).\n\nAlle afmeldingen in deze periode:\n{lijst}",
  from_name: "Apex Online Coaching",
};

export async function loadCancelSettings() {
  const [s] = await E().LeerInstelling.filter({ key: "afmeldingen" });
  return s ? { ...CANCEL_DEFAULTS, ...s } : { ...CANCEL_DEFAULTS };
}

export async function loadCancellations() {
  return E().LeerAfmelding.list("-cancelled_at", 2000);
}

export async function addCancellation(data) {
  return E().LeerAfmelding.create({ cancelled_at: new Date().toISOString(), source: "handmatig", ...data });
}

export async function checkCancellation(id) {
  const res = await base44.functions.invoke("leer-afmelding-check", { afmelding_id: id, dry_run: true });
  return res.data;
}

// ---- A.I.-coach ------------------------------------------------------------

// De coach draait in de backend-functie leer-coach: die zoekt alleen in lessen waar het lid toegang toe heeft.
export async function askCoach(question) {
  const res = await base44.functions.invoke("leer-coach", { question });
  return res.data;
}
