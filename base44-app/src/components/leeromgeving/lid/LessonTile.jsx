import { CheckCircle2, FileText, PlayCircle } from "lucide-react";
import { CATEGORY_LABEL } from "../lib/config";

export default function LessonTile({ lesson, done, onOpen }) {
  const Icon = lesson.vimeo_id ? PlayCircle : FileText;
  return (
    <button onClick={onOpen} className="flex h-full flex-col overflow-hidden rounded-xl border bg-card text-left transition hover:border-primary hover:shadow-sm">
      {lesson.thumbnail_url && (
        <div className="relative aspect-video w-full bg-muted">
          <img src={lesson.thumbnail_url} alt="" loading="lazy" className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }} />
          {lesson.duration_min > 0 && (
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">{lesson.duration_min} min</span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{(lesson.categories || []).map((c) => CATEGORY_LABEL[c] || c).join(" · ")}</span>
          {done && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-primary" />}
        </div>
        <p className="font-medium leading-snug">{lesson.title}</p>
        {lesson.summary && <p className="line-clamp-2 text-sm text-muted-foreground">{lesson.summary}</p>}
      </div>
    </button>
  );
}
