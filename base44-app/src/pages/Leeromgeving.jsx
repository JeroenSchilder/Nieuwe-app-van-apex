import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useLeeromgeving from "@/components/leeromgeving/lib/useLeeromgeving";
import LeerHeader from "@/components/leeromgeving/lid/LeerHeader";
import HomeView from "@/components/leeromgeving/lid/HomeView";
import TrackView from "@/components/leeromgeving/lid/TrackView";
import LessonView from "@/components/leeromgeving/lid/LessonView";
import LibraryView from "@/components/leeromgeving/lid/LibraryView";
import MyAssignments from "@/components/leeromgeving/lid/MyAssignments";
import CoachChat from "@/components/leeromgeving/lid/CoachChat";
import AgendaView from "@/components/leeromgeving/lid/AgendaView";

// Ledenomgeving. Navigatie via de URL: ?tab=home|bibliotheek|opdrachten, ?traject=<key>, ?les=<id>
export default function Leeromgeving() {
  const { loading, user, mine, agenda, derived, refreshMine, refreshAgenda } = useLeeromgeving();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "home";
  const trackKey = params.get("traject");
  const lessonId = params.get("les");

  const go = (next) => {
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)));
    window.scrollTo({ top: 0 });
  };

  if (loading || !derived) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const unseen = Object.values(derived.submissionsByAssignment).flat().filter((s) => s.feedback && !s.feedback_seen).length;
  const openLesson = (id) => go({ tab, traject: trackKey, les: id });
  const track = derived.tracks.find((t) => t.key === trackKey);
  const backFromLesson = () => go({ tab, traject: trackKey || (tab === "home" ? derived.lessonIndex[lessonId]?.track.key : null) });

  let body;
  if (lessonId) {
    body = <LessonView lessonId={lessonId} derived={derived} user={user} mine={mine} refreshMine={refreshMine}
      onBack={backFromLesson} onOpenLesson={openLesson} />;
  } else if (track) {
    body = <TrackView track={track} derived={derived} user={user} onBack={() => go({ tab })} onOpenLesson={openLesson} />;
  } else if (tab === "bibliotheek") {
    body = <LibraryView derived={derived} onOpenLesson={openLesson} />;
  } else if (tab === "agenda") {
    body = <AgendaView agenda={agenda} user={user} refreshAgenda={refreshAgenda} />;
  } else if (tab === "opdrachten") {
    body = <MyAssignments derived={derived} onOpenLesson={openLesson} />;
  } else {
    body = <HomeView derived={derived} agenda={agenda} user={user} onOpenTrack={(key) => go({ tab: "home", traject: key })}
      onOpenLesson={(id) => go({ tab: "home", les: id })} onTab={(t) => go({ tab: t })} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LeerHeader user={user} tab={tab} onTab={(t) => go({ tab: t })} badge={unseen} />
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24">{body}</main>
      <CoachChat derived={derived} onOpenLesson={(id) => go({ tab, les: id })} />
    </div>
  );
}
