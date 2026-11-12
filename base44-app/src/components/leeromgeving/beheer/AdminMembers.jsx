import { useEffect, useState } from "react";
import { Loader2, Save, UserPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChipSelect from "./ChipSelect";
import { userField } from "../lib/access";
import { listUsers, setUserAccess } from "../lib/api";

const FIELDS = ["apex_packages", "apex_role", "apex_coach_email", "apex_cohort", "apex_start_date", "apex_phone"];

function MemberRow({ u, packages, cohorts, coaches }) {
  const [v, setV] = useState(Object.fromEntries(FIELDS.map((k) => [k, userField(u, k) ?? (k === "apex_packages" ? [] : "")])));
  const [state, setState] = useState("");
  const set = (k) => (val) => { setV((x) => ({ ...x, [k]: val })); setState("gewijzigd"); };
  const save = async () => {
    setState("opslaan");
    try { await setUserAccess(u.id, v); setState("opgeslagen"); } catch (e) { setState("fout"); }
  };
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-auto min-w-0">
          <p className="truncate font-medium">{u.full_name || u.email}{u.role === "admin" && <span className="ml-2 text-xs text-primary">admin</span>}</p>
          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
        </div>
        <span className="text-xs text-muted-foreground">{state === "fout" ? "Opslaan mislukt" : state}</span>
        <Button size="sm" onClick={save} disabled={state === "opslaan" || !state || state === "opgeslagen"}><Save className="mr-1 h-4 w-4" /> Opslaan</Button>
      </div>
      <ChipSelect options={packages.map((p) => ({ key: p.key, label: p.name }))} value={v.apex_packages} onChange={set("apex_packages")} />
      <div className="grid gap-2 sm:grid-cols-4">
        <select value={v.apex_role} onChange={(e) => set("apex_role")(e.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm">
          <option value="lid">Rol: lid</option><option value="coach">Rol: coach</option>
        </select>
        <select value={v.apex_coach_email} onChange={(e) => set("apex_coach_email")(e.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm">
          <option value="">Coach: geen</option>
          {coaches.map((c) => <option key={c.email} value={c.email}>Coach: {c.full_name || c.email}</option>)}
        </select>
        <select value={v.apex_cohort} onChange={(e) => set("apex_cohort")(e.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm">
          <option value="">Ronde: geen</option>
          {cohorts.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
        </select>
        <Input type="date" className="h-9" title="Startdatum" value={v.apex_start_date || ""} onChange={(e) => set("apex_start_date")(e.target.value)} />
        <Input className="h-9 sm:col-span-2" placeholder="Mobiel (voor WhatsApp), bijv. +31612345678" value={v.apex_phone || ""} onChange={(e) => set("apex_phone")(e.target.value)} />
      </div>
    </div>
  );
}

export default function AdminMembers({ content }) {
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState("");
  const [invite, setInvite] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { listUsers().then(setUsers); }, []);
  if (!users) return <Loader2 className="h-5 w-5 animate-spin text-primary" />;

  const coaches = users.filter((u) => u.role === "admin" || userField(u, "apex_role") === "coach");
  const shown = users.filter((u) => `${u.full_name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  const doInvite = async () => {
    await base44.users.inviteUser(invite.trim(), "user");
    setMsg(`Uitnodiging verstuurd naar ${invite}. Ververs straks de lijst om pakketten toe te kennen.`);
    setInvite("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Zoek lid" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <div className="ml-auto flex gap-2">
          <Input placeholder="e-mail nieuw lid" value={invite} onChange={(e) => setInvite(e.target.value)} className="w-56" />
          <Button variant="outline" onClick={doInvite} disabled={!invite.includes("@")}><UserPlus className="mr-1 h-4 w-4" /> Uitnodigen</Button>
        </div>
      </div>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      <p className="text-xs text-muted-foreground">Pakketten bepalen wat een lid ziet. Small Group (zonder coaching) ziet alleen Fase 1. Coaches krijgen het pakket “Team / coach (alles)”.</p>
      {shown.map((u) => <MemberRow key={u.id} u={u} packages={content.packages} cohorts={content.cohorts} coaches={coaches} />)}
    </div>
  );
}
