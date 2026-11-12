import { useState } from "react";
import { ArrowLeft, Award, CalendarClock, Clock, FileText, Layers, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import LessonRow from "./LessonRow";
import Certificate from "./Certificate";
import { formatDate } from "../lib/access";

const DRIPS = ["wekelijks_cohort", "wekelijks_vanaf_start"];

export default function TrackView({ track, derived, user, onBack, onOpenLesson }) {
  const [showCert, setShowCert] = useState(false);
  const pct = track.total ? Math.round((track.done / track.total) * 100) : 0;
  const noSchedule = DRIPS.includes(track.drip) && !track.schedule;
  const complete = track.total > 0 && track.done === track.total;

  if (showCert) return <Certificate track={track} user={user} onBack={() => setShowCert(false)} />;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Overzicht
      </button>
      <div>
        <h1 className="text-2xl font-bold">{track.title}</h1>
        {track.description && <p className="mt-1 max-w-3xl text-muted-foreground">{track.description}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Layers className="h-4 w-4" /> {track.modules.length} modules</span>
          <span className="flex items-center gap-1"><PlayCircle className="h-4 w-4" /> {track.videos} video's</span>
          <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {track.total - track.videos} teksten</span>
          {track.minutes > 0 && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {track.minutes} min</span>}
        </div>
        {track.type !== "bibliotheek" && (
          <div className="mt-3 max-w-sm space-y-1">
            <Progress value={pct} />
            <p className="text-xs text-muted-foreground">{track.done} van {track.total} afgerond</p>
          </div>
        )}
        {track.certificate && complete && (
          <Button className="mt-4" onClick={() => setShowCert(true)}><Award className="mr-2 h-4 w-4" /> Bekijk je certificaat</Button>
        )}
      </div>
      {noSchedule && (
        <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          {track.drip === "wekelijks_cohort"
            ? "Je bent nog niet aan een ronde gekoppeld. Zodra je coach dat doet, komen de weken één voor één vrij."
            : "Je startdatum is nog niet ingesteld. Zodra je coach dat doet, komen de modules week voor week vrij."}
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
