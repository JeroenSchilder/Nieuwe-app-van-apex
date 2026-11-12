import ReactMarkdown from "react-markdown";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Opmaak voor markdown zonder extra Tailwind-plugin.
const MD = {
  h2: (p) => <h2 className="pt-2 text-lg font-semibold" {...p} />,
  h3: (p) => <h3 className="pt-2 font-semibold" {...p} />,
  p: (p) => <p {...p} />,
  ul: (p) => <ul className="list-disc space-y-1 pl-5" {...p} />,
  ol: (p) => <ol className="list-decimal space-y-1 pl-5" {...p} />,
  a: (p) => <a className="text-primary underline" target="_blank" rel="noreferrer" {...p} />,
};

export default function LessonContent({ lesson }) {
  return (
    <div className="space-y-5">
      {lesson.summary && <p className="text-lg leading-relaxed">{lesson.summary}</p>}

      {lesson.key_points?.length > 0 && (
        <ul className="space-y-2 rounded-xl border bg-card p-4">
          {lesson.key_points.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {p}
            </li>
          ))}
        </ul>
      )}

      {lesson.action_links?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {lesson.action_links.map((a, i) => (
            <Button key={i} asChild variant={i === 0 ? "default" : "outline"}>
              <a href={a.url} target="_blank" rel="noreferrer">
                {a.label} <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ))}
        </div>
      )}

      {lesson.body && (
        <article className="space-y-3 text-[15px] leading-relaxed">
          <ReactMarkdown components={MD}>{lesson.body}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}
