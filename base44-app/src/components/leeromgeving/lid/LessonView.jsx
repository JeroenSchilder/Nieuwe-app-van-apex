import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lock, MapPin, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VimeoPlayer from "../VimeoPlayer";
import LessonContent from "./LessonContent";
import TranscriptPanel from "./TranscriptPanel";
import AssignmentPanel from "./AssignmentPanel";
import { markComplete, markIncomplete } from "../lib/api";
import { CATEGORY_LABEL } from "../lib/config";

export default function LessonView({ lessonId, derived, user, mine, refreshMine, onBack, onOpenLesson }) {
  const entry = derived.lessonIndex[lessonId];
  const [busy, setBusy] = useState(false);
  const [seek, setSeek] = useState(null);

  if (!entry) {
    return (
      <div className="space-y-3">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Terug</button>
        <p className="text-muted-foreground">Deze les bestaat niet of hoort niet bij jouw traject.</p>
      </div>
    );
  }

  const { lesson, track, module, done, locked } = entry;
  const idx = track.ordered.findIndex((l) => l.id === lesson.id);
  const prev = track.ordered[idx - 1];
  const next = track.ordered[idx + 1];
  const assignment = lesson.assignment_id ? derived.assignmentsById[lesson.assignment_id] : null;

  const complete = async () => {
    if (done || busy) return;
    setBusy(true);
    await markComplete(user, lesson);
    await refreshMine();
    setBusy(false);
  };
  const undo = async () => {
    const rec = mine.progress.find((p) => p.les_id === lesson.id);
    if (!rec) return;
    setBusy(true);
    await markIncomplete(rec);
    await refreshMine();
    setBusy(false);
  };

  if (locked) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> {track.title}</button>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-6">
          <Lock className="h-6 w-6 text-muted-foreground" />
          <p>{entry.reason === "volgorde" ? "Rond eerst de vorige stap af." : "Deze week is nog niet vrijgegeven."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {track.title}
      </button>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{module.title}{lesson.step_label ? ` · ${lesson.step_label}` : ""}</p>
        <h1 className="text-2xl font-bold leading-tight">{lesson.title}</h1>
        <div className="flex flex-wrap gap-1">
          {lesson.live_session && <Badge variant="outline"><MapPin className="mr-1 h-3 w-3" /> Live op locatie</Badge>}
          {(lesson.categories || []).map((c) => <Badge key={c} variant="secondary">{CATEGORY_LABEL[c] || c}</Badge>)}
        </div>
      </div>

      {lesson.vimeo_id && (
        <VimeoPlayer id={lesson.vimeo_id} hash={lesson.vimeo_hash} title={lesson.title}
          onEnded={lesson.completion === "video_einde" ? complete : undefined} seek={seek} />
      )}
      {lesson.vimeo_id && lesson.transcript && (
        <TranscriptPanel transcript={lesson.transcript}
          onSeek={(t) => { setSeek({ t, n: Date.now() }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      )}
      {!lesson.vimeo_id && lesson.video_url && (
        <a href={lesson.video_url} target="_blank" rel="noreferrer" className="text-primary underline">Bekijk de video</a>
      )}

      <LessonContent lesson={lesson} />

      {assignment && (
        <AssignmentPanel key={assignment.id} assignment={assignment} lesson={lesson} module={module} track={track}
          derived={derived} user={user}
          onSaved={async (submitted) => {
            if (submitted && !done) await markComplete(user, lesson);
            await refreshMine();
          }} />
      )}

      <div className="flex flex-wrap items-center gap-2 border-t pt-5">
        {done ? (
          <>
            <span className="flex items-center gap-2 font-medium text-primary"><Check className="h-5 w-5" /> Afgerond</span>
            <Button variant="ghost" size="sm" onClick={undo} disabled={busy}><RotateCcw className="mr-1 h-4 w-4" /> Ongedaan maken</Button>
          </>
        ) : (
          <Button onClick={complete} disabled={busy}><Check className="mr-2 h-4 w-4" /> Markeer als afgerond</Button>
        )}
        <div className="ml-auto flex gap-2">
          {prev && <Button variant="outline" onClick={() => onOpenLesson(prev.id)}><ArrowLeft className="h-4 w-4" /></Button>}
          {next && (
            <Button variant="outline" onClick={() => onOpenLesson(next.id)} disabled={track.lessonState[next.id]?.locked}>
              Volgende <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
