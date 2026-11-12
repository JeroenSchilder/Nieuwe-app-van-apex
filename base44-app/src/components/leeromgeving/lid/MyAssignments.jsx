import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { assignmentDeadline, formatDate, isPastDeadline } from "../lib/access";
import { STATUS } from "../lib/config";

// Alle opdrachten in de leerlijnen van het lid, met status en deadline.
export default function MyAssignments({ derived, onOpenLesson }) {
  const rows = derived.tracks.flatMap((t) => t.ordered
    .filter((l) => l.assignment_id && derived.assignmentsById[l.assignment_id] && !t.lessonState[l.id].locked)
    .map((l) => {
      const a = derived.assignmentsById[l.assignment_id];
      const subs = derived.submissionsByAssignment[a.id] || [];
      const sub = a.repeatable ? null : subs[0];
      const deadline = assignmentDeadline(a, t.lessonState[l.id].module, t, t.schedule);
      const missed = !a.repeatable && a.lock_after_deadline && isPastDeadline(deadline)
        && (!sub || sub.status === "concept");
      return { t, l, a, sub, count: subs.length, deadline, missed };
    }));

  const open = rows.filter((r) => !r.a.repeatable && !r.missed && (!r.sub || ["concept", "heropend"].includes(r.sub.status)));
  const rest = rows.filter((r) => !open.includes(r) && !r.missed);
  const missed = rows.filter((r) => r.missed);

  const Row = ({ r }) => {
    const status = r.a.repeatable ? null : r.sub?.status || "open";
    return (
      <button onClick={() => onOpenLesson(r.l.id)} className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left hover:border-primary">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium leading-snug">{r.a.title}</p>
          <p className="text-xs text-muted-foreground">
            {r.t.title.split("·")[0].trim()}{r.deadline ? ` · deadline ${formatDate(r.deadline, true)}` : ""}{r.a.repeatable ? ` · ${r.count}× ingevuld` : ""}
          </p>
          <div className="flex flex-wrap gap-1">
            {r.sub?.feedback && !r.sub.feedback_seen && <Badge>Nieuwe feedback</Badge>}
            {r.missed ? <Badge variant="outline">Gemist</Badge>
              : status === "open" ? <Badge variant="outline">Nog te doen</Badge>
                : status && <Badge variant="outline" className={`border-transparent ${STATUS[status]?.className}`}>{STATUS[status]?.label}</Badge>}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="font-semibold">Nog te doen ({open.length})</h2>
        {open.length === 0 ? <p className="text-sm text-muted-foreground">Helemaal bij. Sterk bezig!</p> : open.map((r) => <Row key={r.a.id} r={r} />)}
      </section>
      {rest.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Ingeleverd & doorlopend</h2>
          {rest.map((r) => <Row key={r.a.id} r={r} />)}
        </section>
      )}
      {missed.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-muted-foreground">Deadline verstreken</h2>
          {missed.map((r) => <Row key={r.a.id} r={r} />)}
        </section>
      )}
    </div>
  );
}
