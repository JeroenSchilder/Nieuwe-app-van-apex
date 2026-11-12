// Toont ingevulde antwoorden (alleen-lezen), gebruikt door lid en coach.
export default function AnswersView({ fields = [], answers = {} }) {
  const shown = fields.filter((f) => f.type !== "info");
  return (
    <dl className="space-y-4">
      {shown.map((f) => {
        const v = answers?.[f.key];
        const empty = v === undefined || v === null || v === "";
        return (
          <div key={f.key}>
            <dt className="text-sm font-medium text-muted-foreground">{f.label}</dt>
            <dd className={`mt-1 whitespace-pre-wrap text-sm ${empty ? "italic text-muted-foreground" : ""}`}>
              {empty ? "Niet ingevuld" : typeof v === "boolean" ? (v ? "Ja" : "Nee") : String(v)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
