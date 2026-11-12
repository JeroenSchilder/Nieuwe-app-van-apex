import { useState } from "react";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveQuizAttempt } from "../lib/api";

// Quiz met score. Na inleveren ziet het lid per vraag goed/fout met uitleg, en de score.
export default function QuizPanel({ assignment, lesson, derived, user, onSaved }) {
  const attempts = derived.submissionsByAssignment[assignment.id] || [];
  const best = attempts.reduce((m, a) => Math.max(m, a.score || 0), 0);
  const passedBefore = attempts.some((a) => a.passed);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const questions = assignment.fields.filter((f) => f.type === "quiz");
  const pass = assignment.pass_percentage ?? 70;
  const canRetry = assignment.repeatable !== false;

  const submit = async () => {
    setBusy(true);
    const r = await saveQuizAttempt({ user, assignment, lesson, answers });
    setResult(r);
    setBusy(false);
    await onSaved(r.passed);
  };
  const retry = () => { setAnswers({}); setResult(null); };

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quiz: {assignment.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {questions.length} vragen · geslaagd vanaf {pass}%
          {attempts.length > 0 && ` · ${attempts.length}× gemaakt, beste score ${best}%`}
        </p>
        {assignment.intro && <p className="text-sm text-muted-foreground">{assignment.intro}</p>}
      </CardHeader>
      <CardContent className="space-y-5">
        {passedBefore && !result && (
          <p className="flex items-center gap-2 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800"><Award className="h-4 w-4" /> Je bent al geslaagd voor deze quiz. Je mag hem nog een keer maken.</p>
        )}
        {questions.map((q, i) => {
          const chosen = answers[q.key];
          const right = result && chosen === q.correct;
          return (
            <div key={q.key} className="space-y-2">
              <p className="font-medium">{i + 1}. {q.label}</p>
              <div className="grid gap-2">
                {(q.options || []).map((o) => {
                  const isChosen = chosen === o;
                  const mark = result ? (o === q.correct ? "border-emerald-500 bg-emerald-50" : isChosen ? "border-destructive bg-destructive/5" : "") : isChosen ? "border-primary bg-primary/10" : "";
                  return (
                    <button key={o} type="button" disabled={!!result} onClick={() => setAnswers((a) => ({ ...a, [q.key]: o }))}
                      className={`rounded-lg border px-3 py-2 text-left text-sm hover:border-primary disabled:hover:border-current ${mark}`}>{o}</button>
                  );
                })}
              </div>
              {result && (
                <p className={`flex items-start gap-2 text-sm ${right ? "text-emerald-700" : "text-destructive"}`}>
                  {right ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>{right ? "Goed!" : `Het juiste antwoord is: ${q.correct}.`} {q.explanation}</span>
                </p>
              )}
            </div>
          );
        })}
        {result ? (
          <div className={`space-y-3 rounded-xl p-4 ${result.passed ? "bg-emerald-100 text-emerald-900" : "bg-muted"}`}>
            <p className="text-lg font-semibold">{result.passed ? "Geslaagd!" : "Nog niet geslaagd"} · {result.score}%</p>
            <p className="text-sm">{result.good} van de {result.total} vragen goed.{!result.passed && ` Je hebt ${pass}% nodig.`}</p>
            {canRetry && <Button variant="outline" onClick={retry}><RotateCcw className="mr-2 h-4 w-4" /> Opnieuw proberen</Button>}
          </div>
        ) : (
          <Button onClick={submit} disabled={busy || questions.some((q) => !answers[q.key])}>Quiz inleveren</Button>
        )}
      </CardContent>
    </Card>
  );
}
