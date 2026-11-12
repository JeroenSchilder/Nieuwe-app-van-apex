import { CheckCircle2, Circle, ClipboardList, Lock, MapPin, PlayCircle } from "lucide-react";

export default function LessonRow({ lesson, state, hasAssignment, submitted, onOpen }) {
  const Icon = state.done ? CheckCircle2 : state.locked ? Lock : Circle;
  return (
    <button
      disabled={state.locked}
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon className={`h-5 w-5 shrink-0 ${state.done ? "text-primary" : "text-muted-foreground"}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {lesson.step_label && <span className="text-muted-foreground">{lesson.step_label} · </span>}
          {lesson.title}
        </p>
        {state.reason === "volgorde" && <p className="text-xs text-muted-foreground">Rond eerst de vorige stap af</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
        {lesson.live_session && <MapPin className="h-4 w-4" title="Live op locatie" />}
        {lesson.vimeo_id && <PlayCircle className="h-4 w-4" />}
        {hasAssignment && <ClipboardList className={`h-4 w-4 ${submitted ? "text-primary" : ""}`} />}
      </div>
    </button>
  );
}
