// Score van een quiz. Puur, zodat het los te testen is.
export function scoreQuiz(assignment, answers) {
  const qs = (assignment.fields || []).filter((f) => f.type === "quiz");
  const good = qs.filter((f) => answers[f.key] !== undefined && answers[f.key] === f.correct).length;
  const score = qs.length ? Math.round((good / qs.length) * 100) : 0;
  return { score, good, total: qs.length, passed: score >= (assignment.pass_percentage ?? 70) };
}
