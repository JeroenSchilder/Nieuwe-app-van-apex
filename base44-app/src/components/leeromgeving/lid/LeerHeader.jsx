import { Link } from "react-router-dom";
import { CalendarDays, ClipboardCheck, Home, Library, Settings, Users } from "lucide-react";
import { isAdmin, isCoach } from "../lib/access";
import { ROUTES } from "../lib/config";

const TABS = [
  { key: "home", label: "Mijn traject", icon: Home },
  { key: "bibliotheek", label: "Bibliotheek", icon: Library },
  { key: "opdrachten", label: "Opdrachten", icon: ClipboardCheck },
  { key: "agenda", label: "Agenda", icon: CalendarDays },
];

export default function LeerHeader({ user, tab, onTab, badge = 0 }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
        <div className="mr-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Apex Leeromgeving</p>
          <p className="text-sm text-muted-foreground">Hoi {user?.full_name?.split(" ")[0] || "daar"}</p>
        </div>
        {isCoach(user) && (
          <Link to={ROUTES.coach} className="flex items-center gap-1 rounded-md px-3 py-2 text-sm hover:bg-muted">
            <Users className="h-4 w-4" /> <span className="hidden sm:inline">Coach</span>
          </Link>
        )}
        {isAdmin(user) && (
          <Link to={ROUTES.admin} className="flex items-center gap-1 rounded-md px-3 py-2 text-sm hover:bg-muted">
            <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Beheer</span>
          </Link>
        )}
      </div>
      <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTab(key)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium sm:flex-none sm:px-3 ${
              tab === key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="hidden h-4 w-4 sm:block" />
            {label}
            {key === "opdrachten" && badge > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{badge}</span>
            )}
          </button>
        ))}
      </nav>
    </header>
  );
}
