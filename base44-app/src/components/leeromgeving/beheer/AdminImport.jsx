import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportContent, importSeed } from "../lib/importer";

export default function AdminImport({ onDone }) {
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [stats, setStats] = useState(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setLog([]); setStats(null);
    try {
      const seed = JSON.parse(await file.text());
      const s = await importSeed(seed, { overwrite, log: (m) => setLog((l) => [...l.slice(-30), m]) });
      setStats(s);
      onDone?.();
    } catch (err) {
      setLog((l) => [...l, `Fout: ${err.message || err}`]);
    }
    setBusy(false);
    e.target.value = "";
  };

  const onExport = async () => {
    const data = await exportContent();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `leeromgeving-export-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Startdata importeren</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">Kies <code>leeromgeving-seed.json</code>. Items die al bestaan (zelfde key/ref) worden overgeslagen, dus je kunt dit veilig opnieuw doen.</p>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-primary" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
            Bestaande items overschrijven met het bestand
          </label>
          <Button asChild disabled={busy}>
            <label className="cursor-pointer"><Upload className="mr-2 h-4 w-4" /> {busy ? "Bezig…" : "Kies bestand"}
              <input type="file" accept="application/json" className="hidden" onChange={onFile} disabled={busy} />
            </label>
          </Button>
          {log.length > 0 && <pre className="max-h-48 overflow-auto rounded bg-muted p-2 text-xs">{log.join("\n")}</pre>}
          {stats && (
            <ul className="text-xs">
              {Object.entries(stats).map(([k, v]) => <li key={k}><b>{k}</b>: {v.nieuw} nieuw, {v.bijgewerkt} bijgewerkt, {v.overgeslagen} overgeslagen</li>)}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Exporteren / back-up</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">Download alle leerlijnen, lessen en opdrachten als één bestand. Hetzelfde bestand kun je in een andere app weer importeren.</p>
          <Button variant="outline" onClick={onExport}><Download className="mr-2 h-4 w-4" /> Download export</Button>
        </CardContent>
      </Card>
    </div>
  );
}
