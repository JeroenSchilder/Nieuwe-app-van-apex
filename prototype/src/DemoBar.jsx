import { useNavigate } from "react-router-dom";
import { demo } from "./mock/base44Client";
import { DEMO_USERS } from "./demoData";

const LABEL = {
  "u-admin": "Admin",
  "u-coach": "Coach",
  "u-sg": "Lid · Small Group",
  "u-sgp": "Lid · Small Group+",
  "u-90": "Lid · 90 dagen",
};

// Alleen in de preview: wissel tussen demo-accounts om rechten te bekijken.
export default function DemoBar() {
  const nav = useNavigate();
  const current = demo.db.currentUser;
  const pick = (id) => { demo.setUser(id); nav(id === "u-coach" ? "/leren/coach" : "/leren"); window.location.reload(); };
  return (
    <div className="flex flex-wrap items-center gap-2 bg-foreground px-3 py-2 text-xs text-background">
      <span className="font-semibold">Preview · bekijk als:</span>
      {DEMO_USERS.map((u) => (
        <button key={u.id} onClick={() => pick(u.id)}
          className={`rounded-full px-2.5 py-1 ${current === u.id ? "bg-primary text-primary-foreground" : "bg-background/10 hover:bg-background/20"}`}>
          {LABEL[u.id]}
        </button>
      ))}
      <button onClick={() => { demo.reset(); window.location.reload(); }} className="ml-auto underline opacity-80">Demo resetten</button>
    </div>
  );
}
