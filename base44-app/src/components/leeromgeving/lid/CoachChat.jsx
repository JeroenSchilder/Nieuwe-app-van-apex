import { useState } from "react";
import { Bot, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askCoach } from "../lib/api";

const EXAMPLES = ["Hoe kom ik door een weekend zonder terug te vallen?", "Hoeveel eiwit heb ik nodig?", "Wat is een escape card?"];

// Zwevende chat: vragen beantwoord vanuit de lessen waar het lid toegang toe heeft.
export default function CoachChat({ derived, onOpenLesson }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [chat, setChat] = useState([]);

  const send = async (text) => {
    const question = (text ?? q).trim();
    if (!question || busy) return;
    setQ(""); setBusy(true);
    setChat((c) => [...c, { role: "lid", text: question }]);
    try {
      const r = await askCoach(question);
      // Alleen bronnen tonen die voor dit lid open staan (niet vergrendeld door week of volgorde).
      const sources = (r.sources || []).filter((x) => derived.lessonIndex[x.id] && !derived.lessonIndex[x.id].locked);
      setChat((c) => [...c, { role: "coach", text: r.answer, sources }]);
    } catch {
      setChat((c) => [...c, { role: "coach", text: "Dat lukte even niet. Probeer het zo nog eens." }]);
    }
    setBusy(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-30 flex items-center print:hidden gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg">
        <Bot className="h-5 w-5" /> Vraag de coach
      </button>
    );
  }
  return (
    <div className="fixed inset-x-3 bottom-3 z-30 flex max-h-[80vh] print:hidden flex-col rounded-2xl border bg-card shadow-2xl sm:inset-x-auto sm:right-5 sm:w-96">
      <div className="flex items-center gap-2 border-b p-3">
        <Bot className="h-5 w-5 text-primary" />
        <div className="mr-auto">
          <p className="text-sm font-semibold">Apex A.I.-coach</p>
          <p className="text-xs text-muted-foreground">Antwoordt vanuit jouw lessen</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {chat.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Stel een vraag over voeding, training, mindset of je opdrachten.</p>
            {EXAMPLES.map((e) => (
              <button key={e} onClick={() => send(e)} className="block w-full rounded-lg border px-3 py-2 text-left text-sm hover:border-primary">{e}</button>
            ))}
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={m.role === "lid" ? "ml-8 rounded-xl bg-primary/10 p-3 text-sm" : "mr-4 space-y-2 rounded-xl bg-muted p-3 text-sm"}>
            <p className="whitespace-pre-wrap">{m.text}</p>
            {m.sources?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {m.sources.map((l) => (
                  <button key={l.id} onClick={() => { setOpen(false); onOpenLesson(l.id); }}
                    className="rounded-full border bg-card px-2 py-0.5 text-xs hover:border-primary">Les: {l.title}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t p-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Typ je vraag…" />
        <Button type="submit" size="icon" disabled={busy || !q.trim()}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
