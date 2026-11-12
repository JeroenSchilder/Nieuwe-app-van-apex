import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import TrackIcon from "../TrackIcon";

export default function TrackCard({ track, onOpen, locked = false }) {
  const pct = track.total ? Math.round((track.done / track.total) * 100) : 0;
  return (
    <Card
      onClick={locked ? undefined : onOpen}
      className={`transition ${locked ? "opacity-60" : "cursor-pointer hover:border-primary hover:shadow-md"}`}
    >
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            {locked ? <Lock className="h-5 w-5" /> : <TrackIcon name={track.icon} />}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{track.title}</h3>
            <p className="truncate text-sm text-muted-foreground">{track.subtitle}</p>
          </div>
        </div>
        {locked ? (
          <p className="text-sm text-muted-foreground">Onderdeel van een ander traject. Vraag je coach naar de mogelijkheden.</p>
        ) : track.type === "bibliotheek" ? (
          <p className="text-sm text-muted-foreground">{track.total} onderwerpen</p>
        ) : (
          <div className="mt-auto space-y-1">
            <Progress value={pct} />
            <p className="text-xs text-muted-foreground">{track.done} van {track.total} afgerond · {pct}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
