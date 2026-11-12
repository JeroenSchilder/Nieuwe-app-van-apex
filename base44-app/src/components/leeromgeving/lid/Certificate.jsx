import { ArrowLeft, Award, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// Certificaat na het afronden van een leerlijn. Printen of opslaan als PDF via de browser.
export default function Certificate({ track, user, onBack }) {
  const date = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <button onClick={onBack} className="mr-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {track.title}
        </button>
        <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Printen of opslaan als PDF</Button>
      </div>
      <div className="mx-auto max-w-3xl rounded-2xl border-4 border-primary/60 bg-card p-8 text-center shadow-sm sm:p-14">
        <Award className="mx-auto h-14 w-14 text-primary" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Certificaat van voltooiing</p>
        <p className="mt-8 text-sm text-muted-foreground">Hierbij verklaren wij dat</p>
        <p className="mt-2 text-3xl font-bold sm:text-4xl">{user?.full_name || user?.email}</p>
        <p className="mt-6 text-sm text-muted-foreground">met succes heeft afgerond</p>
        <p className="mt-2 text-xl font-semibold">{track.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{track.total} lessen · {date}</p>
        <div className="mx-auto mt-12 w-56 border-t pt-2 text-sm">
          <p className="font-medium">Jeroen Schilder</p>
          <p className="text-xs text-muted-foreground">Apex Online Coaching</p>
        </div>
      </div>
    </div>
  );
}
