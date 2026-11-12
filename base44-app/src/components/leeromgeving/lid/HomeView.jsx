import { ArrowRight, MessageSquare, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TrackCard from "./TrackCard";
import { formatDate } from "../lib/access";

// Eerstvolgende open, niet-afgeronde les binnen de leerlijnen (bibliotheek telt niet mee).
function nextLesson(tracks) {
  for (const t of tracks) {
    if (t.type === "bibliotheek") continue;
    const l = t.ordered.find((x) => !t.lessonState[x.id].done && !t.lessonState[x.id].locked);
    if (l) return { track: t, lesson: l };
  }
  return null;
}

export default function HomeView({ derived, onOpenTrack, onOpenLesson, onTab }) {
  const next = nextLesson(derived.tracks);
  const newFeedback = Object.values(derived.submissionsByAssignment).flat()
    .filter((s) => s.feedback && !s.feedback_seen);
  const cohort = derived.cohort;
  const tracks = derived.tracks;

  return (
    <div className="space-y-6">
      {next && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Ga verder</p>
              <h2 className="text-lg font-semibold">{next.lesson.step_label ? `${next.lesson.step_label} · ` : ""}{next.lesson.title}</h2>
              <p className="text-sm text-muted-foreground">{next.track.title}</p>
            </div>
            <Button onClick={() => onOpenLesson(next.lesson.id)}>
              Verder <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {newFeedback.length > 0 && (
        <button onClick={() => onTab("opdrachten")} className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left hover:border-primary">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="flex-1 text-sm">Je hebt <b>{newFeedback.length}</b> nieuwe feedback van je coach.</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      )}

      {cohort && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4 text-sm">
          <Video className="h-5 w-5 text-primary" />
          <span className="flex-1"><b>{cohort.name}</b> · gestart {formatDate(cohort.start_date)} · {cohort.session_info}</span>
          {cohort.zoom_url && (
            <a href={cohort.zoom_url} target="_blank" rel="noreferrer" className="font-medium text-primary underline">Inloggen Zoom</a>
          )}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Jouw leerlijnen</h2>
        {tracks.length === 0 ? (
          <p className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
            Er is nog geen leerlijn aan je account gekoppeld. Je coach zet dit voor je klaar.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tracks.map((t) => <TrackCard key={t.id} track={t} onOpen={() => onOpenTrack(t.key)} />)}
            {derived.lockedTracks.map((t) => <TrackCard key={t.id} track={{ ...t, total: 0, done: 0 }} locked />)}
          </div>
        )}
      </section>
    </div>
  );
}
