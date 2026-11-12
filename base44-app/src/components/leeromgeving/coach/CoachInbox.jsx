import { useState } from "react";
import { ChevronRight, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "../lib/access";
import { STATUS } from "../lib/config";

const FILTERS = [
  { key: "todo", label: "Te beoordelen", test: (s) => s.status === "ingediend" },
  { key: "done", label: "Feedback gegeven", test: (s) => ["feedback", "goedgekeurd"].includes(s.status) },
  { key: "all", label: "Alles", test: (s) => s.status !== "concept" },
];

export default function CoachInbox({ submissions, assignmentsById, memberFilter, onClearMember, onOpen }) {
  const [filter, setFilter] = useState("todo");
  // Quizzen worden automatisch nagekeken; opdrachten zonder coach-feedback hoeven niet beoordeeld te worden.
  const isQuiz = (s) => s.score != null || assignmentsById[s.opdracht_id]?.kind === "quiz";
  const matches = (f, s) => (!memberFilter || s.member_email === memberFilter) && f.test(s)
    && (f.key === "all" || (!isQuiz(s) && assignmentsById[s.opdracht_id]?.coach_review !== false));
  const active = FILTERS.find((f) => f.key === filter);
  const list = submissions.filter((s) => matches(active, s));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 text-sm ${filter === f.key ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}>
            {f.label} ({submissions.filter((s) => matches(f, s)).length})
          </button>
        ))}
        {memberFilter && <Badge variant="secondary" className="cursor-pointer" onClick={onClearMember}>{memberFilter} ✕</Badge>}
      </div>
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-10 text-muted-foreground">
          <Inbox className="h-8 w-8" /> Niets te doen in deze lijst.
        </div>
      ) : list.map((s) => (
        <button key={s.id} onClick={() => onOpen(s)} className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left hover:border-primary">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{s.member_name}</p>
            <p className="truncate text-sm text-muted-foreground">{s.opdracht_title}</p>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block">{formatDate(s.submitted_at || s.updated_date)}</span>
          <Badge variant="outline" className={`border-transparent ${STATUS[s.status]?.className}`}>{STATUS[s.status]?.label}</Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
