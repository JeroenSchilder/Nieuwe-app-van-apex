# Open punten en keuzes

## Wat ik van jou nodig heb

1. **Vimeo-toegang (blokkerend voor de volledige catalogus).** Het token is opgeslagen, maar Vimeo meldt *"The app didn't receive the user's credentials"* (fout 8003). Waarschijnlijke oorzaken:
   - het is een *Unauthenticated*-token, of de client secret in plaats van een access token;
   - het token is geplakt mét het woord `Bearer` ervoor.

   **Oplossing:** maak op developer.vimeo.com/apps → jouw app → *Generate access token* een token aan met **Authenticated (you)** en de scopes *Public, Private, Video Files*. Vervang daarna het opgeslagen token (Omgeving → Network secrets → `api.vimeo.com`), zonder "Bearer".

   Daarna haal ik álle video's op (titels, mappen, beschrijvingen en automatische ondertitels), koppel ik de 50+ opdrachtvideo's en vul ik de bibliotheek aan.
2. **De 50+ opdrachtvideo's.** Ik vond tot nu toe 19 opdrachten: 13 uit de 90 dagen challenge, 5 voor Fase 2 en de SLL-observaties. Staan de overige opdrachten in de huidige Apex app (`app.apexonlinecoaching.nl` → Opdrachten)? Die site is vanuit hier niet bereikbaar. Je kunt de opdrachten exporteren, of de pagina toestaan in de netwerkinstellingen.
3. **Base44-toegang voor de installatie in één keer.** Zie [installatie route A](03-installatie-base44.md).

## Aannames die ik heb gedaan (zeg het als het anders moet)

| Onderwerp | Gekozen | Alternatief |
|---|---|---|
| Wat ziet Small Group zonder coaching? | Alleen Fase 1. Dat zijn **7 stappen**, want voedingsschema en Vytal vallen weg, net als in je huidige mail | Alle 9 stappen tonen |
| Small Group+ | Fase 1 (9 stappen), Fase 2 en de bibliotheek | Ook de 90 dagen |
| 90 dagen: 13 weken | Week 1 = kickoff (live op locatie) en spelregels. Week 2–13 = sessie 1–12. Week 13 heeft ook een terugblik-opdracht | Kickoff als week 0 + 13 online weken |
| Deadline opdracht | Zaterdag 23:59 van de week, daarna gesloten. De coach kan heropenen | Geen harde sluiting |
| Vrijgave weken | Op maandag 00:00 van de week | Pas na de sessie (maandag 21:30) |
| Rol "coach" | Eigen veld `apex_role` op de User (je bestaande admin/user-rollen blijven ongemoeid) | Base44-rol uitbreiden |
| Fase 2-video's | Nog géén video gekoppeld (alleen tekst + opdracht) | Kies welke video's erbij horen zodra Vimeo werkt |

## Controleren (gemarkeerd met ⚠️ in Beheer)

- **Week 5 (Verantwoordelijkheid & gewoontes):** in de mails stond twee keer dezelfde video als week 4 (910944120). Ik heb 1142425742 gekoppeld, de video die in een andere ronde bij week 5 stond. Graag even checken.
- **Week 6:** er bestaan drie versies (1147260570, 951532814, 912849384). De nieuwste (1147260570) is gekoppeld.
- **De 112 kennisartikelen uit de mailreeks "Apex Online Pakketten":** de teksten staan er volledig in. Sommige verwijzen nog naar oude dingen, zoals *"Apex Basis pakket"*, *"mijn doelen op de website"* of *"mail beantwoorden op ma/wo/vr"*. Loop ze door via **Beheer → Lessen & opdrachten → "Alleen nog controleren"** en vink *Nog controleren* uit als ze goed zijn.
- **Techniek- en foam-roller-video's van de oude website (2018–2019):** nog relevant?

## Volgende stappen (voorstel)

1. Vimeo-token goed zetten → volledige catalogus + transcripties → betere indeling en samenvattingen per video.
2. Installeren in Base44 (route A) + content importeren.
3. Jij loopt de ⚠️-lessen door (± 1 uur werk).
4. Eerste ronde 90 dagen aanmaken en leden koppelen.
5. Daarna: Performance Coaching-leerlijn vullen, en eventueel extra's als certificaat, AI-coach en een melding bij nieuwe inzending.
