import { CheckCircle2, FileText, PlayCircle } from "lucide-react";
import { CATEGORY_LABEL } from "../lib/config";

export default function LessonTile({ lesson, done, onOpen }) {
  const Icon = lesson.vimeo_id ? PlayCircle : FileText;
  return (
    <button onClick={onOpen} className="flex h-full flex-col gap-2 rounded-xl border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        <span className="truncate">{(lesson.categories || []).map((c) => CATEGORY_LABEL[c] || c).join(" · ")}</span>
        {done && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
      </div>
      <p className="font-medium leading-snug">{lesson.title}</p>
      {lesson.summary && <p className="line-clamp-2 text-sm text-muted-foreground">{lesson.summary}</p>}
    </button>
  );
}
