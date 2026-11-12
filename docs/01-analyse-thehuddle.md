# Analyse: Huddle (thehuddle.nl) en wat we overnemen

> **Bronnen:** thehuddle.nl, YouTube en de app stores waren vanuit deze omgeving niet direct bereikbaar. Deze analyse is gebaseerd op zoekresultaten over de site, de help-artikelen (help.thehuddle.nl), de app-listings en reviews (laura.nl, solopreneur.nl, onlinevibes.be, moneyinstyle.nl). De YouTube-reviews heb ik gevonden, maar niet kunnen afspelen.

## Wat Huddle is

Huddle is een Nederlands alles-in-één platform voor online cursussen, communities en coachprogramma's. Leden krijgen een eigen app.

| Abonnement | Prijs (excl. btw) | Wat erbij zit |
|---|---|---|
| Lite | €15/mnd | Basis |
| Premium | €49–59/mnd | Toegangsniveaus, drip, certificaten |
| Ultimate | €97–125/mnd | Quizzen, groepen |

Video wordt niet gehost: je embedt YouTube of Vimeo, net als bij ons.

## Wat Huddle goed doet, en wat wij daarvan overnemen

| Huddle | In de Apex leeromgeving |
|---|---|
| Product → modules → lessen | Leerlijn → module/week → les. Precies dezelfde opbouw |
| Voortgangsbalk en "ga verder waar je was" | Kaart **"Ga verder"** bovenaan, en een voortgangsbalk per leerlijn |
| Lessen afvinken (handmatig of automatisch) | **"Markeer als afgerond"**, of automatisch zodra de Vimeo-video is uitgekeken (per les in te stellen) |
| Drip: content per week vrijgeven | Weken van de 90 dagen challenge komen per **ronde** vrij, gerekend vanaf de maandag van week 1 |
| Cohort-modus: groep start samen | **Rondes** (LeerCohort) met startdatum, sessie-info en Zoom-link |
| Toegangsniveaus per product | **Pakketten** per leerlijn én per les, server-side afgedwongen (RLS) |
| Vergrendelde content tonen als prikkel | Leerlijnen die niet in je pakket zitten, staan als slotje op het dashboard ("vraag je coach") |
| Afvinken in vaste volgorde | Fase 1 is een **stappenplan**: stap 2 opent pas als stap 1 klaar is |

## Waar wij Huddle verslaan (de gaten die reviews noemen)

1. **Invulbare opdrachten met een coach-inbox.** Huddle heeft alleen downloads en DM's. Wij hebben formulieren per les met 8 veldtypes, concept opslaan, inleveren, deadlines (zaterdag 23:59) en sluiten na de deadline. De coach heeft een inbox met feedback, afronden en heropenen.
2. **"Wat heb je nu nodig?"** Leden klikken een behoefte aan ("ik mis motivatie", "ik slaap slecht") en krijgen direct de juiste video's en artikelen uit alle leerlijnen waar ze toegang toe hebben.
3. **Coach ziet alleen zijn eigen leden.** Rechten per coach via `coach_email`; de admin ziet alles.
4. **Geen extra abonnement.** Alles draait in je eigen Base44-app, met dezelfde login als de rest van Apex.

## Bewust (nog) niet gebouwd

Deze onderdelen zijn bewust nog niet gebouwd. Kies welke je wilt; dan bouw ik ze.

- **Community-feed, chat en DM's.** Dat is een groot onderdeel; jullie gebruiken nu WhatsApp/Facebook.
- **Punten, levels, streaks en een leaderboard.** Kan later bovenop de voortgangsdata.
- **Certificaat na afronding** (bijvoorbeeld van de 90 dagen challenge).
- **AI-coach die antwoordt vanuit je eigen lessen.** Base44 heeft daar InvokeLLM voor. De 112 kennisartikelen zijn daar een ideale bron voor.
- **Push of e-mail naar de coach bij een nieuwe inzending.** Kan via Base44 SendEmail of via ActiveCampaign.
