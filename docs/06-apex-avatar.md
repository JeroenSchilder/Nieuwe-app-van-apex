# Apex avatar: voorstel en vragen

Een beloningssysteem waarin elk lid een eigen avatar uitbouwt door te doen wat resultaat oplevert: gewicht invullen, opdrachten maken, metingen inplannen, doelen halen.

## Voorstel in het kort

**De beklimming.** Apex betekent top. De avatar start in het basiskamp (Punt A) en klimt naar de top (Punt B). Elke actie levert stappen op. Onderweg liggen kampen: dat zijn de levels. Bij elk kamp krijgt de avatar iets nieuws, zoals uitrusting, een titel of een achtergrond.

- **Vier krachten**, gelijk aan de 4 pijlers: gezondheid, relaties, werk & financiën, persoonlijk leven. Elke actie voedt één kracht, zodat een lid ziet waar het groeit en waar het achterblijft.
- **Reeksen:** een vlam voor dagen op rij (gewicht ingevuld, hoofdstuk gelezen).
- **Geen lichaam dat dunner of dikker wordt.** De avatar verandert in uitrusting, houding en omgeving, niet in lichaamsvorm. Dat voorkomt dat het systeem iemand op uiterlijk afrekent.

## Wat er al ligt

| Actie | Staat al in de leeromgeving? |
|---|---|
| Les afgerond | Ja (`LeerVoortgang`) |
| Opdracht ingeleverd, feedback gekregen | Ja (`LeerInzending`) |
| Quiz gehaald | Ja (score in `LeerInzending`) |
| Aangemeld voor groepscoaching, niet afgezegd | Ja (`LeerAanmelding`, `LeerAfmelding`) |
| Dagelijks gewicht, doelen, metingen, trainingen, voeding | **Nee**: dat zit in de rest van je Base44-app, in Trainin of in Vytal. Daar gaan de vragen hieronder over |

**Voorwaarde:** punten moeten op de server worden toegekend. Nu wordt "afgerond" in de browser bepaald; met beloningen eraan gaat dat mis. Dit staat als stap 2 in de [verbeterlijst](05-verbeterlijst.md).

## Vragen

### A. Doel
1. Welk gedrag wil je het meest belonen? Kies je top 3 uit: dagelijks gewicht, voeding bijhouden, trainen, opdrachten, lezen, metingen, op tijd komen.
2. Wat is het belangrijkste doel: dat leden vaker inloggen, langer lid blijven, of betere resultaten halen?
3. Voor wie: alle leden, of alleen bepaalde pakketten (bijvoorbeeld niet voor Small Group zonder coaching)?
4. Welke toon past bij Apex: speels, of stoer en sportief?

### B. De avatar zelf
5. Wat is de avatar: een figuur die uitrusting verdient, een klimmer op een berg, iets anders?
6. Welke stijl: getekend, 3D, of simpel met iconen? Heb je een ontwerper of budget voor tekeningen, of maak ik een eenvoudige versie in code?
7. Mag een lid zelf kiezen (man/vrouw/neutraal, huidskleur, haar), of is er één Apex-figuur?
8. Eens met het uitgangspunt dat het lichaam van de avatar niet verandert?

### C. Acties en punten
9. Welke acties tellen, en hoe zwaar? Wat is bijvoorbeeld meer waard: een week lang gewicht invullen of één opdracht?
10. **Per actie: waar wordt die nu vastgelegd?**
    - Dagelijks gewicht: in je Base44-app? Hoe heet dat onderdeel?
    - Doelen: hoe leg je een doel vast, en wie bepaalt dat het gehaald is, het lid of de coach?
    - Meting ingepland: dat gebeurt in Trainin. Mag "meting gedaan" (InBody-uitslag in de app) ook tellen?
    - Training gedaan: via Trainin, of in de app?
    - Voeding: via Vytal. Is dat in je app zichtbaar?
11. Mag een coach handmatig punten geven, bijvoorbeeld voor een persoonlijk record?
12. Reeksen: wat gebeurt er als iemand een dag mist? Reeks kwijt, of één keer per week een "rustdag"?
13. Krijgen bestaande leden punten voor wat ze al gedaan hebben?

### D. Beloningen
14. Alleen digitaal (uitrusting, titels, levels), of ook echt: korting, een shirt, een gratis meting?
15. Zien leden elkaars avatar en is er een ranglijst, of is het privé? Bij een ranglijst: per groep of ronde, of iedereen?
16. Wil je groepsdoelen, bijvoorbeeld "de 90 dagen-groep haalt samen 500.000 stappen"?

### E. Techniek
17. Kun je mij toegang geven tot je Base44-app (de knop "Send to Coding Agent", of de GitHub-koppeling)? Dan zie ik hoe gewicht, doelen en metingen zijn opgebouwd en hoef je vraag 10 niet uit te zoeken.
18. Waar moet de avatar staan: op het dashboard, in het profiel, bovenin elke pagina?
19. Welk Base44-abonnement heb je? Voor punten op de server zijn backend-functies nodig.

### F. Planning
20. Wat moet er minimaal in de eerste versie, en wanneer wil je die hebben?
