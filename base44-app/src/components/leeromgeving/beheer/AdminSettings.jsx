import RecordEditor from "./RecordEditor";

export default function AdminSettings({ content, reload }) {
  const pkgOptions = content.packages.map((p) => ({ key: p.key, label: p.name }));
  const trackOptions = content.tracks.map((t) => ({ key: t.key, label: t.title }));
  return (
    <div className="space-y-8">
      <RecordEditor title="Leerlijnen" entity="LeerTraject" records={content.tracks} onChanged={reload}
        newRecord={{ key: "", title: "", order: content.tracks.length + 1, type: "leerlijn", drip: "geen", published: false, access_packages: [] }}
        fields={[
          { key: "title", label: "Titel" }, { key: "subtitle", label: "Ondertitel" }, { key: "key", label: "Key (uniek)" },
          { key: "description", label: "Omschrijving", wide: true },
          { key: "type", label: "Soort", type: "select", options: ["stappenplan", "leerlijn", "challenge", "bibliotheek"].map((k) => ({ key: k, label: k })) },
          { key: "drip", label: "Vrijgave", type: "select", options: [{ key: "geen", label: "Alles direct" }, { key: "wekelijks_cohort", label: "Per week, vanaf start ronde" }, { key: "wekelijks_vanaf_start", label: "Per week, vanaf eigen startdatum" }] },
          { key: "order", label: "Volgorde", type: "number" },
          { key: "access_packages", label: "Pakketten", type: "chips", options: pkgOptions, wide: true },
          { key: "sequential", label: "Stappen op volgorde", type: "bool" }, { key: "published", label: "Gepubliceerd", type: "bool" },
          { key: "certificate", label: "Certificaat bij afronden", type: "bool" },
        ]} />
      <RecordEditor title="Rondes (90 dagen challenge)" entity="LeerCohort" records={content.cohorts} onChanged={reload}
        newRecord={{ key: "", name: "", track_key: "challenge90", start_date: "", active: true }}
        fields={[
          { key: "name", label: "Naam" }, { key: "key", label: "Key (uniek)" }, { key: "start_date", label: "Maandag van week 1", type: "date" },
          { key: "track_key", label: "Leerlijn", type: "select", options: trackOptions },
          { key: "session_info", label: "Sessie (dag/tijd)" }, { key: "zoom_url", label: "Zoom-link" }, { key: "active", label: "Actief", type: "bool" },
        ]} />
      <RecordEditor title="Pakketten" entity="LeerPakket" records={content.packages} onChanged={reload}
        newRecord={{ key: "", name: "", order: content.packages.length + 1 }}
        fields={[{ key: "name", label: "Naam" }, { key: "key", label: "Key (uniek)" }, { key: "order", label: "Volgorde", type: "number" },
          { key: "description", label: "Omschrijving", wide: true }]} />
    </div>
  );
}
