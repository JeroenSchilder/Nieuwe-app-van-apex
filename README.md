# Apex Leeromgeving

Een leeromgeving voor Apex-leden in de stijl van Huddle, gebouwd als module voor de **Base44**-app van Apex Online Coaching.

- **Fase 1 · Start bij Apex:** het stappenplan uit de welkomstmail, als afvinkbare stappen met video en actieknoppen.
- **Fase 2 · Je doel stellen:** je why, Punt A & B op de 4 pijlers, het doel achter het doel en krachtige beloftes, met invulbare opdrachten.
- **90 Dagen Challenge:** 13 weken. Weken komen per ronde vrij, elke sessie heeft een video en een opdracht, en de deadline is zaterdag 23:59.
- **Performance Coaching:** 60 video's uit Leadership, Commitment, Dreamteam en Self Leadership, plus de Kickstart-masterclasses (nog niet gepubliceerd).
- **Bibliotheek:** ruim 200 onderwerpen (artikelen, weekvideo's en kennisclips) in 11 thema's, met de vraag *"Wat heb je nu nodig?"* en een zoekfunctie.
- **Opdrachten:** invulbaar en opgeslagen per lid. De coach heeft een inbox met feedback, afronden en heropenen.
- **Rechten per pakket:** Small Group zonder coaching ziet alleen Fase 1. Dit is server-side afgedwongen.
- **Video's met transcript:** doorzoekbaar, klik op een zin en de video springt erheen. Plus thumbnails en de duur.
- **Vraag de coach:** een AI-coach die antwoordt vanuit de lessen van het lid, met links naar de bronnen.
- **Quiz met score**, zoals de afsluiter van Fase 1, met slagingspercentage en herkansen. **Certificaat** na afronden.
- **Agenda:** groepscoachings, sessies en kickoff, met aan- en afmelden, "In mijn agenda" en een link om de InBody-meting in te plannen.
- **Herinneringen:** automatische mail als een lid 7/30/30 dagen niet actief is (in te stellen), en de dag vóór een agenda-item.
- **Beheer:** leden en pakketten, lessen en opdrachten bewerken (inclusief vragen- en quizbouwer), agenda, herinneringen, rondes en import/export.

## Mappen

| Map | Wat |
|---|---|
| `base44-app/` | **De module zelf**, in dezelfde structuur als je Base44-app. Dit kopieer je |
| `content/leeromgeving-seed.json` | Alle startcontent, te importeren via Beheer → Import |
| `content/bron/` | Brondata: de kennisreeks-mails en de video's van de oude website |
| `docs/` | Huddle-analyse, videocatalogus, installatie, open punten |
| `prototype/` | Lokale preview met demo-accounts per rol (`cd prototype && npm i && npm run dev`) |
| `tools/` | Scripts die de seed en de catalogus opnieuw opbouwen |

## Beginnen

1. Lees [docs/04-open-punten.md](docs/04-open-punten.md): wat ik nog van je nodig heb.
2. Bekijk [docs/02-videocatalogus.md](docs/02-videocatalogus.md): alle video's, per fase en thema.
3. Installeer met [docs/03-installatie-base44.md](docs/03-installatie-base44.md).

## Content aanpassen

Pas je de content liever in bulk aan dan in het beheerscherm? Bewerk dan `tools/build_seed.py` en draai:

```bash
python3 tools/build_seed.py && python3 tools/build_catalogus.py
```
