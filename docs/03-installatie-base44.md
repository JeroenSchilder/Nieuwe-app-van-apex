# Installatie in Base44

De module is geschreven volgens de officiële Base44-conventies: Vite + React, shadcn/ui, `base44/entities/*.jsonc` met RLS, en een backend-functie. Alles staat in `base44-app/`, in **exact dezelfde mappenstructuur als je Base44-app**. Je kopieert dus 1-op-1.

## Wat er bij komt

| Map in `base44-app/` | Inhoud |
|---|---|
| `base44/entities/` | 8 nieuwe entiteiten (`Leer*.jsonc`), met rechten (RLS) |
| `base44/entities/User.velden-toevoegen.jsonc` | 5 velden die je **toevoegt** aan je bestaande `User.jsonc`. Dit is geen nieuw bestand |
| `base44/functions/leer-toegang/entry.ts` | Backend-functie waarmee een admin pakketten toekent |
| `src/pages/` | `Leeromgeving.jsx` (leden), `LeerCoach.jsx` (coach), `LeerBeheer.jsx` (admin) |
| `src/components/leeromgeving/` | Alle onderdelen en de logica |
| `../content/leeromgeving-seed.json` | Alle startcontent: 171 lessen en 19 opdrachten |

Er worden geen nieuwe npm-packages gebruikt. Alles draait op wat Base44 standaard heeft: react-router-dom, lucide-react, react-markdown en shadcn/ui.

---

## Route A: ik zet het er direct in (aanbevolen, 0 Base44-tokens)

Base44 heeft een officiële MCP-koppeling waarmee een AI-agent rechtstreeks in de sandbox van je app schrijft. Dan kost het je geen Base44-credits.

1. Ga in Base44 naar je app en klik in de editor op **"Send to Coding Agent"**, of voeg in claude.ai de connector `https://app.base44.com/mcp` toe (Instellingen → Connectors).
2. Start een gewone claude.ai-chat met die connector, of geef mij in deze omgeving toegang tot Base44 (zie hieronder).
3. Zeg: *"Zet de Apex leeromgeving uit de repo `Nieuwe-app-van-apex`, map `base44-app/`, in mijn app."*

Wat de agent dan doet:
- schrijft alle bestanden naar dezelfde paden;
- voegt de User-velden samen in je bestaande `User.jsonc`;
- zet de routes in `src/App.jsx` (zie stap 3 hieronder);
- draait `npm run build` als controle;
- maakt een checkpoint, zodat je in de versiegeschiedenis terug kunt.

**In deze Claude Code-omgeving** kan ik het ook met de `base44` CLI (`base44 sandbox write …`). Daarvoor moet `app.base44.com` in de netwerkinstellingen van deze omgeving worden toegestaan en moet je één keer inloggen.

## Route B: zelf met de Base44 CLI (op je eigen computer)

```bash
npm install -g base44
base44 login
git clone https://github.com/jeroenschilder/nieuwe-app-van-apex && cd nieuwe-app-van-apex/base44-app
# per bestand, bijvoorbeeld:
base44 sandbox write src/pages/Leeromgeving.jsx --app-id <JOUW_APP_ID> < src/pages/Leeromgeving.jsx
base44 sandbox checkpoint --app-id <JOUW_APP_ID>
```

## Route C: handmatig in de Base44-editor

Kopieer de bestanden via de code-editor van Base44. Laat de AI van Base44 alleen de routes toevoegen; dat zijn weinig tokens.

---

## Stap 1: User-velden

Open in je app `base44/entities/User.jsonc` en voeg de 5 velden uit `User.velden-toevoegen.jsonc` toe aan `properties`. Laat de bestaande velden staan.

`apex_packages` en `apex_role` zijn vergrendeld: een lid kan zichzelf geen toegang geven. Jij past ze aan via **Beheer → Leden & toegang**, dat de functie `leer-toegang` gebruikt, of via het Base44-dashboard (Data → Users).

> Backend-functies vragen een betaald Base44-abonnement. Heb je dat niet, dan zet je pakketten via het dashboard.

## Stap 2: entiteiten en functie

Zet de 8 `Leer*.jsonc`-bestanden in `base44/entities/` en de map `leer-toegang` in `base44/functions/`. In de sandbox staan ze live zodra ze zijn weggeschreven.

## Stap 3: routes in `src/App.jsx`

Bij de andere page-imports (bij `// Add page imports here`):

```jsx
import Leeromgeving from "./pages/Leeromgeving";
import LeerCoach from "./pages/LeerCoach";
import LeerBeheer from "./pages/LeerBeheer";
```

Binnen `<Routes>`, vóór de `*`-route:

```jsx
<Route path="/leren" element={<Leeromgeving />} />
<Route path="/leren/coach" element={<LeerCoach />} />
<Route path="/leren/beheer" element={<LeerBeheer />} />
```

Zet daarna een knop **"Leeromgeving"** in je bestaande menu met `<Link to="/leren">`.

## Stap 4: content importeren

1. Log in als admin en ga naar `/leren/beheer`.
2. Open de tab **Import / export** en kies `content/leeromgeving-seed.json`.
3. Je krijgt 5 leerlijnen, 27 modules, 171 lessen en 19 opdrachten.

Het importeren kun je veilig herhalen: bestaande items worden overgeslagen.

## Stap 5: leden toegang geven

Ga naar **Beheer → Leden & toegang** en stel per lid in:

- **Pakket(ten):** Small Group / Small Group+ / 90 Dagen / Performance. Coaches krijgen *Team / coach (alles)*.
- **Rol:** coach, als iemand opdrachten mag nakijken.
- **Coach:** wie de opdrachten van dit lid beoordeelt.
- **Ronde:** voor de 90 dagen challenge. De weken komen dan automatisch vrij en de deadlines staan goed.

Een nieuwe ronde (bijvoorbeeld *90 dagen Q1-2027*) maak je aan in **Leerlijnen & rondes**: naam, maandag van week 1 en de Zoom-link.

## Stap 6: Vimeo-instelling (belangrijk)

Vimeo-video's spelen alleen in de app als het embedden is toegestaan. Zet in Vimeo per video, of voor de map in één keer: **Privacy → Waar kan deze video worden ingesloten → "Specifieke domeinen"**. Voeg je app-domein toe (bijvoorbeeld `app.apexonlinecoaching.nl` en je `*.base44.app`-domein). De verborgen links (met hash) blijven werken.

## Optioneel: Apex-kleuren

De module gebruikt de thema-tokens van je app (`bg-primary`, `text-muted-foreground`, …). Wil je de goud/petrol-stijl van de preview, neem dan de waarden uit `prototype/src/index.css` over in je `src/index.css`. Alleen `--primary` is genoeg voor het goud: `--primary: 37 55% 56%;`.

## Beveiliging in het kort

| Entiteit | Lezen | Schrijven |
|---|---|---|
| LeerLes | alleen als een pakket van het lid in `access_packages` staat (of admin) | admin |
| LeerTraject / Module / Opdracht / Pakket / Cohort | ingelogde gebruikers | admin |
| LeerInzending / LeerVoortgang | het lid zelf, de coach (`coach_email`) en admin | het lid zelf, en de coach voor feedback |
