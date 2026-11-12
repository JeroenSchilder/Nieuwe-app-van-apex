// Zoekt de lessen die het best bij een vraag passen. Puur JavaScript, zonder afhankelijkheden,
// zodat de backend-functie, de preview en de tests dezelfde code gebruiken.

const STOP = new Set(("de het een en of van in op te je jij ik is dat die wat hoe voor met naar aan als bij om niet maar ook zijn heb heeft kan kun moet wil wel dan mijn "
  + "geen veel meer heel elke door zonder over weer nog dit deze wordt worden kom komt ben bent mag gaat gaan doen doe hebben hebt waarom wanneer welke iets alles altijd nooit soms").split(" "));

// Thema's in gewone woorden, zodat "motivatie" ook lessen met het thema mindset vindt.
const THEMA = {
  start: "start beginnen app intake", doelen: "doelen doel stellen", mindset: "mindset motivatie mentaal", gewoontes: "gewoontes discipline volhouden routine",
  voeding: "voeding eten dieet", training: "training trainen kracht techniek", mobiliteit: "mobiliteit foamrollen stijf", herstel: "slaap slapen stress herstel rust",
  lichaam: "lichaam gezondheid gewicht", relaties: "relaties omgeving", tijd: "tijd planning leiderschap",
};

export const words = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

export function lessonText(l) {
  const transcript = String(l.transcript || "").split("\n").map((r) => r.slice(r.indexOf("|") + 1)).join(" ");
  return `${l.title}\n${l.summary || ""}\n${(l.key_points || []).join("\n")}\n${l.body || ""}\n${transcript}`;
}

export function findLessons(question, lessons, max = 5) {
  const q = words(question);
  if (!q.length) return [];
  // Exact, meervoud (card → cards) of, bij langere woorden, het begin van een woord (eiwit → eiwitten).
  const hits = (list, w) => list.filter((x) => x === w || x === `${w}s` || x === `${w}en` || (w.length >= 5 && x.startsWith(w))).length;
  return lessons
    .map((l) => {
      const title = words(l.title);
      const head = words(`${l.summary || ""} ${(l.key_points || []).join(" ")} ${(l.categories || []).map((c) => THEMA[c] || c).join(" ")}`);
      const text = words(lessonText(l));
      // Titel en samenvatting wegen zwaar; lange teksten worden genormaliseerd zodat ze niet altijd winnen.
      const norm = Math.sqrt(Math.max(text.length, 200) / 200);
      // Herhaling telt afnemend mee (log), anders wint een tekst die één woord heel vaak noemt.
      const score = q.reduce((n, w) => n + (hits(title, w) ? 8 : 0) + Math.min(hits(head, w), 2) * 3 + (Math.log2(1 + hits(text, w)) * 2) / norm, 0);
      return { l, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.l);
}
