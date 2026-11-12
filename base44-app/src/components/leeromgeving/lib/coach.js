import { base44 } from "@/api/base44Client";

// A.I.-coach: zoekt eerst zelf de best passende lessen (alleen waar het lid toegang toe heeft)
// en laat het taalmodel daarna uitsluitend vanuit die lessen antwoorden, met bronvermelding.

const STOP = new Set("de het een en of van in op te je jij ik is dat die wat hoe voor met naar aan als bij om niet maar ook zijn heb heeft kan kun moet wil wel dan mijn".split(" "));
const words = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

function lessonText(l) {
  const transcript = String(l.transcript || "").split("\n").map((r) => r.slice(r.indexOf("|") + 1)).join(" ");
  return `${l.title}\n${l.summary || ""}\n${(l.key_points || []).join("\n")}\n${l.body || ""}\n${transcript}`;
}

export function findLessons(question, lessons, max = 5) {
  const q = words(question);
  if (!q.length) return [];
  return lessons
    .map((l) => {
      const title = words(l.title);
      const head = words(`${l.summary || ""} ${(l.key_points || []).join(" ")} ${(l.categories || []).join(" ")}`);
      const text = words(lessonText(l));
      const hits = (list, w) => list.filter((x) => x === w || (w.length >= 5 && x.startsWith(w))).length;
      // Titel en samenvatting wegen zwaar; lange teksten worden genormaliseerd zodat ze niet altijd winnen.
      const norm = Math.sqrt(Math.max(text.length, 200) / 200);
      const score = q.reduce((n, w) => n + hits(title, w) * 8 + hits(head, w) * 3 + hits(text, w) / norm, 0);
      return { l, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.l);
}

export async function askCoach(question, lessons, firstName) {
  const sources = findLessons(question, lessons);
  if (!sources.length) {
    return { answer: "Daar heb ik in jouw lessen niets over gevonden. Stel je vraag aan je coach, die helpt je verder.", sources: [] };
  }
  const context = sources.map((l, i) => `[${i + 1}] ${l.title}\n${lessonText(l).slice(0, 3500)}`).join("\n\n---\n\n");
  const prompt = `Je bent de A.I.-coach van Apex Online Coaching (coach Jeroen Schilder). Je spreekt ${firstName || "het lid"} aan met "je", direct, warm en motiverend, in het Nederlands.
Beantwoord de vraag UITSLUITEND met informatie uit de lessen hieronder. Staat het antwoord er niet in, zeg dat dan eerlijk en verwijs naar de coach. Geen medisch advies; bij pijn of klachten: verwijs naar coach of huisarts.
Houd het kort (max. 120 woorden) en eindig met één concrete actie voor vandaag. Geef aan welke lessen je gebruikte met hun nummer.

LESSEN:
${context}

VRAAG: ${question}`;
  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: { antwoord: { type: "string" }, bronnen: { type: "array", items: { type: "integer" } } },
      required: ["antwoord"],
    },
  });
  const used = (res.bronnen || []).map((n) => sources[n - 1]).filter(Boolean);
  return { answer: res.antwoord, sources: used.length ? used : sources.slice(0, 2) };
}
