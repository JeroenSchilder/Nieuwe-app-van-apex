import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CoachInbox from "@/components/leeromgeving/coach/CoachInbox";
import CoachMembers from "@/components/leeromgeving/coach/CoachMembers";
import SubmissionReview from "@/components/leeromgeving/coach/SubmissionReview";
import { isAdmin, isCoach } from "@/components/leeromgeving/lib/access";
import { loadCoachState, loadContent } from "@/components/leeromgeving/lib/api";
import { ROUTES } from "@/components/leeromgeving/lib/config";

export default function LeerCoach() {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState(null);
  const [state, setState] = useState(null);
  const [view, setView] = useState("inbox");
  const [member, setMember] = useState(null);
  const [open, setOpen] = useState(null);

  const reload = useCallback(async (u) => setState(await loadCoachState(u, isAdmin(u))), []);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      setUser(me);
      if (!isCoach(me)) return;
      setContent(await loadContent());
      await reload(me);
    })();
  }, [reload]);

  if (user && !isCoach(user)) return <p className="p-8 text-center text-muted-foreground">Deze pagina is alleen voor coaches.</p>;
  if (!user || !content || !state) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  const assignmentsById = Object.fromEntries(content.assignments.map((a) => [a.id, a]));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to={ROUTES.member} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="mr-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Apex Leeromgeving</p>
            <h1 className="font-semibold">Coach{isAdmin(user) ? " · alle leden" : " · jouw leden"}</h1>
          </div>
          {["inbox", "leden"].map((v) => (
            <button key={v} onClick={() => { setView(v); setOpen(null); }}
              className={`rounded-md px-3 py-2 text-sm capitalize ${view === v ? "bg-muted font-medium" : "text-muted-foreground"}`}>{v}</button>
          ))}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        {open ? (
          <SubmissionReview submission={open} assignment={assignmentsById[open.opdracht_id]} user={user}
            onBack={() => setOpen(null)} onSaved={async () => { await reload(user); setOpen(null); }} />
        ) : view === "inbox" ? (
          <CoachInbox submissions={state.submissions} assignmentsById={assignmentsById} memberFilter={member}
            onClearMember={() => setMember(null)} onOpen={setOpen} />
        ) : (
          <CoachMembers submissions={state.submissions} progress={state.progress} tracks={content.tracks}
            onSelect={(email) => { setMember(email); setView("inbox"); }} />
        )}
      </main>
    </div>
  );
}
