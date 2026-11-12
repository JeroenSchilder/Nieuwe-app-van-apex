import { ArrowLeft, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import LessonRow from "./LessonRow";
import { formatDate } from "../lib/access";

export default function TrackView({ track, derived, onBack, onOpenLesson }) {
  const pct = track.total ? Math.round((track.done / track.total) * 100) : 0;
  const noCohort = track.drip === "wekelijks_cohort" && !derived.cohort;
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Overzicht
      </button>
      <div>
        <h1 className="text-2xl font-bold">{track.title}</h1>
        {track.description && <p className="mt-1 text-muted-foreground">{track.description}</p>}
        {track.type !== "bibliotheek" && (
          <div className="mt-3 max-w-sm space-y-1">
            <Progress value={pct} />
            <p className="text-xs text-muted-foreground">{track.done} van {track.total} afgerond</p>
          </div>
        )}
      </div>
      {noCohort && (
        <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          Je bent nog niet aan een ronde gekoppeld. Zodra je coach dat doet, komen de weken één voor één vrij.
        </p>
      )}
      {track.modules.map((m) => (
        <Card key={m.id}>
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between px-3 pb-1 pt-2">
              <div>
                <h2 className="font-semibold">{m.title}</h2>
                {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
              </div>
              {!m.unlock.open && m.unlock.opensAt && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-4 w-4" /> Vanaf {formatDate(m.unlock.opensAt)}
                </span>
              )}
            </div>
            {m.lessons.map((l) => (
              <LessonRow
                key={l.id}
                lesson={l}
                state={track.lessonState[l.id]}
                hasAssignment={!!l.assignment_id}
                submitted={(derived.submissionsByAssignment[l.assignment_id] || []).some((s) => s.status !== "concept")}
                onOpen={() => onOpenLesson(l.id)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
