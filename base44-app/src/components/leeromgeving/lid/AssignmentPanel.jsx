import { useEffect, useState } from "react";
import { Clock, Lock, MessageSquare, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import FieldInput from "../FieldInput";
import AnswersView from "../AnswersView";
import { assignmentDeadline, formatDate, isPastDeadline } from "../lib/access";
import { markFeedbackSeen, saveSubmission } from "../lib/api";
import { STATUS } from "../lib/config";

const EDITABLE = ["concept", "heropend"];

export default function AssignmentPanel({ assignment, lesson, module, track, derived, user, onSaved }) {
  const subs = derived.submissionsByAssignment[assignment.id] || [];
  const existing = assignment.repeatable ? null : subs[0];
  const [answers, setAnswers] = useState(existing?.answers || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const deadline = assignmentDeadline(assignment, module, track, derived.cohort);
  const late = isPastDeadline(deadline);
  const closed = late && assignment.lock_after_deadline && existing?.status !== "heropend";
  const status = existing?.status;
  const canEdit = !closed && (!existing || EDITABLE.includes(status) || (status === "ingediend" && !existing.feedback));

  useEffect(() => {
    if (existing?.feedback && !existing.feedback_seen) markFeedbackSeen(existing);
  }, [existing?.id]);

  const save = async (nextStatus) => {
    setError("");
    if (nextStatus === "ingediend") {
      const missing = assignment.fields.filter((f) => f.required && (answers[f.key] === undefined || answers[f.key] === ""));
      if (missing.length) return setError(`Vul nog in: ${missing.map((f) => f.label).join(", ")}`);
    }
    setSaving(true);
    try {
      await saveSubmission({ user, assignment, lesson, module, existing, answers, status: nextStatus });
      if (assignment.repeatable) setAnswers({});
      await onSaved(nextStatus === "ingediend");
    } catch (e) {
      setError("Opslaan is niet gelukt. Probeer het nog eens.");
    }
    setSaving(false);
  };

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="mr-auto text-lg">Opdracht: {assignment.title}</CardTitle>
          {status && <Badge variant="outline" className={`border-transparent ${STATUS[status]?.className}`}>{STATUS[status]?.label}</Badge>}
        </div>
        {deadline && (
          <p className={`flex items-center gap-1 text-sm ${late ? "text-destructive" : "text-muted-foreground"}`}>
            <Clock className="h-4 w-4" /> Deadline {formatDate(deadline, true)}
          </p>
        )}
        {assignment.intro && <p className="text-sm text-muted-foreground">{assignment.intro}</p>}
      </CardHeader>
      <CardContent className="space-y-5">
        {existing?.feedback && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold"><MessageSquare className="h-4 w-4" /> Feedback van {existing.feedback_by || "je coach"}</p>
            <p className="whitespace-pre-wrap text-sm">{existing.feedback}</p>
          </div>
        )}

        {closed && !existing && (
          <p className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm"><Lock className="h-4 w-4" /> De deadline is verstreken. Inleveren is niet meer mogelijk.</p>
        )}

        {canEdit ? (
          <div className="space-y-5">
            {assignment.fields.map((f) => f.type === "info" ? (
              <p key={f.key} className="rounded-lg bg-muted p-3 text-sm">{f.label}</p>
            ) : (
              <div key={f.key} className="space-y-2">
                <Label htmlFor={f.key}>{f.label}{f.required && <span className="text-primary"> *</span>}</Label>
                {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
                <FieldInput field={f} value={answers[f.key]} onChange={(v) => setAnswers((a) => ({ ...a, [f.key]: v }))} />
              </div>
            ))}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => save("ingediend")} disabled={saving}>
                <Send className="mr-2 h-4 w-4" /> {assignment.repeatable ? "Toevoegen" : status === "ingediend" ? "Opnieuw inleveren" : "Inleveren"}
              </Button>
              {!assignment.repeatable && status !== "ingediend" && (
                <Button variant="outline" onClick={() => save("concept")} disabled={saving}>Opslaan als concept</Button>
              )}
            </div>
          </div>
        ) : existing ? (
          <AnswersView fields={assignment.fields} answers={existing.answers} />
        ) : null}

        {assignment.repeatable && subs.length > 0 && (
          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer text-sm font-medium">Eerder ingevuld ({subs.length})</summary>
            <div className="mt-3 space-y-4">
              {subs.map((s) => (
                <div key={s.id} className="border-t pt-3">
                  <p className="mb-2 text-xs text-muted-foreground">{formatDate(s.submitted_at || s.created_date, true)}</p>
                  <AnswersView fields={assignment.fields} answers={s.answers} />
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
