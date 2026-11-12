// Vaste lijsten voor de leeromgeving. Pas labels hier aan; keys niet wijzigen
// (ze staan ook in de data en in base44/entities/LeerLes.jsonc).

export const CATEGORIES = [
  { key: "start", label: "Start & apps", icon: "Rocket" },
  { key: "doelen", label: "Doelen stellen", icon: "Target" },
  { key: "mindset", label: "Mindset & motivatie", icon: "Brain" },
  { key: "gewoontes", label: "Gewoontes & discipline", icon: "Repeat" },
  { key: "voeding", label: "Voeding", icon: "Apple" },
  { key: "training", label: "Training & techniek", icon: "Dumbbell" },
  { key: "mobiliteit", label: "Mobiliteit & foam rollen", icon: "StretchHorizontal" },
  { key: "herstel", label: "Slaap, stress & herstel", icon: "Moon" },
  { key: "lichaam", label: "Lichaam & gezondheid", icon: "HeartPulse" },
  { key: "relaties", label: "Relaties & omgeving", icon: "Users" },
  { key: "tijd", label: "Tijd & leiderschap", icon: "Clock" },
];

export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));

// "Wat heb je nu nodig?" — snelle ingangen naar thema's in de bibliotheek.
export const NEEDS = [
  { key: "motivatie", label: "Ik mis motivatie", categories: ["mindset", "doelen"] },
  { key: "eten", label: "Ik wil beter eten", categories: ["voeding"] },
  { key: "slaap", label: "Ik slaap slecht of heb stress", categories: ["herstel"] },
  { key: "volhouden", label: "Ik vind het lastig vol te houden", categories: ["gewoontes"] },
  { key: "sterker", label: "Ik wil sterker worden", categories: ["training"] },
  { key: "pijn", label: "Ik ben stijf of heb pijntjes", categories: ["mobiliteit", "lichaam"] },
  { key: "tijd", label: "Ik heb te weinig tijd", categories: ["tijd", "gewoontes"] },
];

export const STATUS = {
  concept: { label: "Concept", className: "bg-muted text-muted-foreground" },
  ingediend: { label: "Ingediend", className: "bg-blue-100 text-blue-800" },
  feedback: { label: "Feedback ontvangen", className: "bg-purple-100 text-purple-800" },
  goedgekeurd: { label: "Afgerond", className: "bg-emerald-100 text-emerald-800" },
  heropend: { label: "Heropend", className: "bg-amber-100 text-amber-800" },
};

export const FIELD_TYPES = [
  { key: "text", label: "Korte tekst" },
  { key: "textarea", label: "Lange tekst" },
  { key: "number", label: "Getal" },
  { key: "scale", label: "Schaal (1-10)" },
  { key: "select", label: "Keuzelijst" },
  { key: "checkbox", label: "Vinkje (ja/nee)" },
  { key: "date", label: "Datum" },
  { key: "info", label: "Alleen uitleg (geen invulveld)" },
  { key: "quiz", label: "Quizvraag (meerkeuze, met goed antwoord)" },
];

export const ROUTES = {
  member: "/leren",
  coach: "/leren/coach",
  admin: "/leren/beheer",
};

// Link waar leden zelf hun InBody-meting inplannen (Trainin).
export const MEASUREMENT_URL = "https://apexonlinecoaching.trainin.app/activities/L67JD/meting-inbody-met-advies-fotos-en-omtrekmeting";
