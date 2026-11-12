import { useState } from "react";
import { ArrowLeft, CheckCheck, RotateCcw, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import AnswersView from "../AnswersView";
import { formatDate } from "../lib/access";
import { giveFeedback } from "../lib/api";
import { STATUS } from "../lib/config";

export default function SubmissionReview({ submission, assignment, user, onBack, onSaved }) {
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [busy, setBusy] = useState(false);

  const save = async (status) => {
    setBusy(true);
    await giveFeedback(user, submission, { feedback, status });
    setBusy(false);
    onSaved();
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Inbox
      </button>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="mr-auto">{submission.opdracht_title}</CardTitle>
            <Badge variant="outline" className={`border-transparent ${STATUS[submission.status]?.className}`}>{STATUS[submission.status]?.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {submission.member_name} · {submission.member_email}
            {submission.submitted_at && ` · ingeleverd ${formatDate(submission.submitted_at, true)}`}
          </p>
        </CardHeader>
        <CardContent>
          {assignment ? <AnswersView fields={assignment.fields} answers={submission.answers} /> : (
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(submission.answers, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Jouw feedback</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea rows={6} value={feedback} onChange={(e) => setFeedback(e.target.value)}
            placeholder="Wat valt je op? Waar zit de winst voor deze week?" />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => save("feedback")} disabled={busy || !feedback.trim()}><Send className="mr-2 h-4 w-4" /> Feedback versturen</Button>
            <Button variant="outline" onClick={() => save("goedgekeurd")} disabled={busy}><CheckCheck className="mr-2 h-4 w-4" /> Afronden</Button>
            <Button variant="ghost" onClick={() => save("heropend")} disabled={busy}><RotateCcw className="mr-2 h-4 w-4" /> Heropenen voor het lid</Button>
          </div>
          {submission.feedback_at && (
            <p className="text-xs text-muted-foreground">Laatste feedback {formatDate(submission.feedback_at, true)} door {submission.feedback_by}{submission.feedback_seen ? " · gelezen" : ""}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
