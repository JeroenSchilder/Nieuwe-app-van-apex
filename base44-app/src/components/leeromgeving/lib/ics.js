// Maakt een .ics-bestand zodat een lid een agenda-item aan de eigen agenda kan toevoegen.
const stamp = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);

export function downloadIcs(event) {
  const end = event.end || new Date(new Date(event.start).getTime() + 60 * 60 * 1000).toISOString();
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Apex Online Coaching//Leeromgeving//NL", "BEGIN:VEVENT",
    `UID:${event.id}@apex-leeromgeving`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(event.start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(event.title)}`, `DESCRIPTION:${esc([event.description, event.online_url].filter(Boolean).join("\n"))}`,
    `LOCATION:${esc(event.location || event.online_url || "")}`, "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${event.title}.ics` });
  a.click();
  URL.revokeObjectURL(url);
}
