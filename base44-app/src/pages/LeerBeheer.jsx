import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminContent from "@/components/leeromgeving/beheer/AdminContent";
import AdminImport from "@/components/leeromgeving/beheer/AdminImport";
import AdminMembers from "@/components/leeromgeving/beheer/AdminMembers";
import AdminSettings from "@/components/leeromgeving/beheer/AdminSettings";
import AdminAgenda from "@/components/leeromgeving/beheer/AdminAgenda";
import AdminReminders from "@/components/leeromgeving/beheer/AdminReminders";
import AdminCancellations from "@/components/leeromgeving/beheer/AdminCancellations";
import { isAdmin } from "@/components/leeromgeving/lib/access";
import { loadContent } from "@/components/leeromgeving/lib/api";
import { ROUTES } from "@/components/leeromgeving/lib/config";

const TABS = [
  { key: "leden", label: "Leden & toegang" },
  { key: "content", label: "Lessen & opdrachten" },
  { key: "agenda", label: "Agenda" },
  { key: "herinneringen", label: "Herinneringen" },
  { key: "afmeldingen", label: "Afmeldingen" },
  { key: "instellingen", label: "Leerlijnen & rondes" },
  { key: "import", label: "Import / export" },
];

export default function LeerBeheer() {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState(null);
  const [tab, setTab] = useState("leden");

  const reload = useCallback(async () => setContent(await loadContent()), []);
  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      setUser(me);
      if (isAdmin(me)) await reload();
    })();
  }, [reload]);

  if (user && !isAdmin(user)) return <p className="p-8 text-center text-muted-foreground">Alleen voor beheerders.</p>;
  if (!content) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const empty = content.tracks.length === 0;
  const active = empty ? "import" : tab;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to={ROUTES.member} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Apex Leeromgeving</p>
            <h1 className="font-semibold">Beheer</h1>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${active === t.key ? "border-primary font-medium" : "border-transparent text-muted-foreground"}`}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {empty && <p className="mb-4 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">Nog geen content. Importeer eerst <code>leeromgeving-seed.json</code>.</p>}
        {active === "leden" && <AdminMembers content={content} />}
        {active === "content" && <AdminContent content={content} reload={reload} />}
        {active === "agenda" && <AdminAgenda content={content} />}
        {active === "herinneringen" && <AdminReminders />}
        {active === "afmeldingen" && <AdminCancellations />}
        {active === "instellingen" && <AdminSettings content={content} reload={reload} />}
        {active === "import" && <AdminImport onDone={reload} />}
      </main>
    </div>
  );
}
