# Analyse: Huddle (thehuddle.nl) en wat we overnemen

**Bronnen (november 2026):**
- 32 pagina's van thehuddle.nl, doorgeklikt met een browser: alle functiepagina's uit het menu, prijzen, app, koppelingen en MCP.
- De YouTube-demo *"Online programma maken met Huddle A.I. (in 30 minuten!)"* van Martijn van Tongeren, volledig via de ondertitels.

## Wat Huddle is

Huddle is een Nederlands platform voor online cursussen, community en coaching, met een gratis app voor leden. Ongeveer 5.500 ondernemers gebruiken het. Je betaalt per maand (Lite, Premium of Ultimate) en krijgt 14 dagen gratis proef. Hun drie pijlers:

| E-learning | Community | Beheer |
|---|---|---|
| Online programma's, A.I.-cursusgenerator, A.I.-coach, trajecten & dripping, voortgang, toetsen & certificaten | Kanalen & groepen, ledenoverzicht (lijst/kaart), evenementen, gamification (punten, levels, leaderboard, streaks), chats tussen leden, livestream (binnenkort) | Eigen huisstijl & domein, app/whitelabel app, toegangsniveaus (ook tijdelijk), koppelingen (Plug&Pay, ActiveCampaign/MailBlue, Vimeo, Zoom, Zapier, webhooks), betaalsysteem, MCP (Claude/ChatGPT) |

## Wat de demo laat zien

1. **Cursus maken.** Titel invullen, toegangsniveau kiezen en "genereer met AI". Je krijgt modules en lessen met tekst. Daarna kun je modules en lessen laten voorstellen en met één klik toevoegen, en per les AI-feedback vragen.
2. **Videoles.** De video staat bovenaan, met daaronder automatisch een **transcript dat je kunt doorzoeken**. Klik je op een tekstregel, dan springt de video naar dat moment. Er is ook een **AI-samenvatting** die je in de les plakt.
3. **Overzicht voor leden.** Een cursusoverzicht met het aantal modules, videolessen en tekstlessen. Een vinkje per bekeken les en "ga verder waar je was".
4. **Dripping.** Per module of per les, dagelijks of wekelijks op een vast tijdstip. De start is na aankoop, op een vaste datum of per groep (cohort). Je kunt per module een andere dag kiezen, bijvoorbeeld "dag 10".
5. **Certificaat.** Automatisch na het bekijken van alle lessen of na het halen van alle quizzen, met logo en handtekening.
6. **Community en evenementen.** Kanalen zoals "stel jezelf voor" en "victory lounge", moodboards, en online/offline events met aanmelden.

## Vergelijking met de Apex leeromgeving

| Huddle | Apex leeromgeving | Status |
|---|---|---|
| Programma → modules → lessen, met video, tekst en bijlagen | Leerlijn → module/week → les (video, tekst, kernpunten, actieknoppen) | ✅ |
| Toegangsniveaus (ook per les) | **Pakketten** per leerlijn én per les, server-side afgedwongen (RLS) | ✅ |
| Slotje op content zonder toegang | Leerlijnen buiten je pakket staan met slotje op het dashboard | ✅ |
| Dripping per groep (cohort) | **Rondes** voor de 90 dagen challenge, met deadlines | ✅ |
| Dripping vanaf eigen startmoment | **Nieuw:** vrijgave per week vanaf de persoonlijke startdatum | ✅ toegevoegd |
| Voortgang, vinkjes, "ga verder" | Voortgangsbalk, vinkjes, "Ga verder"-kaart | ✅ |
| Cursusoverzicht met aantallen | **Nieuw:** per leerlijn modules · video's · teksten · minuten | ✅ toegevoegd |
| Doorzoekbaar transcript, klik = spring naar moment | **Nieuw:** transcript onder de video bij 28 video's met ondertitels, met zoekveld; klik springt naar dat moment | ✅ toegevoegd |
| AI-samenvatting bij video | Samenvattingen en kernpunten van 45 video's, al gemaakt uit de Vimeo-ondertitels | ✅ |
| A.I.-coach die antwoordt uit je eigen lessen, met bronnen | **Nieuw:** "Vraag de coach". Zoekt de best passende lessen (alleen die van het lid zelf) en laat Base44-AI daaruit antwoorden, met links naar de lessen | ✅ toegevoegd |
| Certificaat na afronden | **Nieuw:** certificaat bij Fase 2, de 90 dagen en Performance Coaching, af te drukken of op te slaan als PDF | ✅ toegevoegd |
| Thumbnails en afbeeldingen | **Nieuw:** Vimeo-thumbnails met duur op alle videotegels | ✅ toegevoegd |
| Quizzen met slagingspercentage | **Quiz met score**, slagingspercentage, herkansen en uitleg per vraag, plus invulbare opdrachten | ✅ toegevoegd |
| Automatische herinnering bij inactiviteit (7 / 30 / 30 dagen) | **In de app zelf:** dagen, tekst en voortgangsgrenzen in te stellen, met proefrun en logboek | ✅ toegevoegd |
| Community, kanalen, chats, ledenoverzicht, gamification | Niet gebouwd; Apex gebruikt WhatsApp-groepen | ➖ bewuste keuze |
| Evenementen-agenda | **Agenda** met aan- en afmelden, .ics-export, herhalen, aanmeldlijst en herinnering de dag van tevoren | ✅ toegevoegd |
| AI-cursusgenerator | Niet nodig: de content komt uit jouw eigen mails en Vimeo | — |

## Waar Apex sterker is dan Huddle

- **Echte opdrachten met een coach-inbox.** Huddle heeft quizzen en downloads. Wij hebben invulbare opdrachten per les, deadlines (zaterdag 23:59), en per coach een inbox met feedback, afronden en heropenen.
- **"Wat heb je nu nodig?"** Leden klikken een behoefte aan en krijgen video's en artikelen uit al hun leerlijnen.
- **Alles in je eigen Base44-app.** Geen extra abonnement, dezelfde login als de rest van Apex, en jouw content blijft van jou.

## Nog te kiezen (bouw ik als je wilt)

1. **Community-light:** één "successen"-feed binnen de leeromgeving, als je WhatsApp wilt vervangen.
2. **Punten en streaks** op basis van afgeronde lessen en opdrachten.
