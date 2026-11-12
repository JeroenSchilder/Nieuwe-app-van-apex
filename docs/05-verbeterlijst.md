# Verbeterlijst na kritische review

Stand: 12 november 2026. De hele module is opnieuw nagelopen op fouten, beveiliging, snelheid en inhoud. Bovenaan staat wat er meteen is hersteld. Daaronder staat wat nog moet gebeuren, op volgorde van belang.

## Deze ronde hersteld

| Wat | Waarom het ertoe deed |
|---|---|
| **A.I.-coach draait nu op de server** (`leer-coach`) | In de browser kon een lid de opdracht aan de AI aanpassen en onbeperkt vragen stellen op jouw kosten. Nu: alleen antwoorden uit lessen van het eigen pakket, een daglimiet (15 vragen) en een logboek van alle vragen (`LeerCoachVraag`) |
| **Instellingen alleen leesbaar voor de admin** | Elk ingelogd lid kon de WhatsApp-koppeling, je telefoonnummer en de trainer-adressen uitlezen |
| **Coach, ronde en startdatum vergrendeld op het account** | Een lid kon zichzelf een andere startdatum geven en zo weken eerder openen |
| **Herinneringen: maximaal 5.000 per aanvraag en expliciete limieten** | De functie vroeg meer op dan Base44 toestaat en haalde de ledenlijst op zonder limiet, waardoor leden gemist konden worden |
| **Agenda-herinnering "morgen" op kalenderdag** | Een sessie van 21:00 kreeg pas op de dag zelf een mail met "Morgen is het zover" |
| **Zomertijd in de agenda** | De groepscoachings van april stonden op 21:15 in plaats van 20:15 |
| **Melding bij afzeggen maar één keer per afmelding** | Een tweede aanroep kon dezelfde melding opnieuw versturen |
| **Lessen laden lichter** | De app haalde bij elke start alle teksten en transcripts op (ruim 700 kB). Nu alleen de overzichtsvelden; de tekst komt bij het openen van een les |
| **Coach-inbox** | Mislukte quizpogingen stonden bij "te beoordelen" en de tellers klopten niet met de lijst |
| **Lege opdracht inleveren kon** | Twee opdrachten (Punt A & B, 5G-schema) hadden geen verplichte vraag |
| **Zoeken van de coach** | Een tekst die één woord vaak herhaalt won altijd; stopwoorden als "geen" gaven verkeerde lessen |
| **Vimeo-berichten strikter gecontroleerd**, concept na deadline krijgt een melding, certificaat print zonder menu, export bevat nu ook agenda en instellingen | Kleinere fouten |
| **16 automatische tests** (`cd prototype && npm test`) | Rechten per pakket, vrijgave per week, deadlines, quizscore, zoeken, en de inhoud zelf (verwijzingen, 13 weken, tijden, geen mailresten of e-mailadressen) |
| **"Nog controleren" met reden en prioriteit** | 251 lessen op één hoop was niet werkbaar. Elke les heeft nu een reden; Beheer sorteert op prioriteit |

## Moet gebeuren vóór leden erin gaan

1. **Het heeft nog nooit in echte Base44 gedraaid.** Alles is getest in een nagebouwde omgeving. Deze punten kunnen daar anders uitpakken en moeten in je app worden gecontroleerd:
   - de rechtenregel op lessen (`access_packages` tegenover de pakketten van het lid);
   - de vergrendelde velden op het account, en of Beheer → Leden ze daarna nog kan zetten;
   - de workflows (dagelijkse herinnering, controle na afmelding) en of ze de functies mogen aanroepen;
   - mail versturen, en het laden van lessen met een veldenlijst.
2. **Wie mag de functies aanroepen?** `leer-herinneringen` en `leer-afmelding-check` moeten zonder ingelogde gebruiker werken, want de workflow roept ze aan. Controleer in Base44 of een buitenstaander ze dan ook kan aanroepen. Zo ja: een geheim toevoegen, zoals bij de Trainin-koppeling.
3. **Inhoud nalopen.** Per prioriteit in Beheer → Lessen & opdrachten → "Alleen nog controleren":
   - **18 lessen (prioriteit 1):** 17 teksten verwijzen naar een mail, de oude app of een oud pakket; 1 video noemt een lid bij naam.
   - **132 video's (prioriteit 2):** alleen een titel, geen samenvatting. Vimeo heeft er geen ondertitels van. Zet in Vimeo automatische ondertitels aan voor deze video's, dan maak ik de samenvattingen en transcripts.
   - **101 teksten (prioriteit 3):** doorlezen.
4. **Vimeo:** 27 video's spelen alleen op `apexonlinecoaching.nl`. Voeg het domein van de app toe als dat anders is.
5. **Agenda en ronde:** de voorbeelddata vervangen door de echte.
6. **Privacy (AVG):** leden vullen persoonlijke reflecties in, en de A.I.-coach stuurt vragen en lesteksten naar een taalmodel via Base44. Dit hoort in je privacyverklaring. Controleer ook de verwerkersovereenkomst met Base44.

## Bekende zwakke plekken

| Punt | Risico | Oplossing |
|---|---|---|
| **Voortgang en quizscore worden in de browser bepaald.** Een handig lid kan een les of quiz als gehaald markeren zonder hem te doen. De goede antwoorden zijn technisch uit te lezen | Laag nu. **Hoog zodra er beloningen aan hangen (avatar)** | Afronden en scoren via een functie op de server. Moet vóór de avatar |
| Vrijgave per week is alleen in het scherm afgedwongen | Laag: een lid met technische kennis kan latere weken lezen | Vrijgave ook op de server controleren |
| Trainin is niet gekoppeld | Afmeldingen voor trainingen komen niet vanzelf binnen | Koppeling via Zapier/Make zodra duidelijk is wat Trainin kan |
| WhatsApp-koppeling stuurt zonder handtekening | De ontvangende dienst kan niet zien dat het bericht echt van de app komt | Geheim meesturen |
| Maximum aantal deelnemers bij een agenda-item wordt niet afgedwongen | Te veel aanmeldingen mogelijk | Teller op de server |
| Coach krijgt geen melding bij een nieuwe inzending; lid krijgt geen mail bij feedback | Feedback blijft liggen | Mail via dezelfde herinneringsfunctie |
| Bij een netwerkfout zie je een leeg scherm of blijft de lader draaien | Verwarrend voor leden | Foutmelding met "opnieuw proberen" |
| Tot enkele honderden leden prima; daarboven laden de coach-inbox en de herinneringen te veel tegelijk | Traag bij groei | In delen ophalen |
| De herinnerings- en afmeldfuncties hebben geen automatische tests | Fout in wie een mail krijgt valt pas laat op | Rekenregels in een eigen bestand met tests, zoals bij de coach |
| Certificaat is niet te verifiëren en heeft een vaste ondertekenaar | Laag | Nummer en controlepagina |
| Toegankelijkheid niet getoetst (contrast goud op wit, toetsenbord) | Onbekend | Controle en bijstellen |
| Beheer: volgorde wijzigen kan alleen met een getal; verwijderen gebruikt een browser-pop-up; ledenlijst zonder pagina's | Onhandig | Slepen, eigen bevestiging, pagina's |

## Inhoud die nog ontbreekt

- **De 50+ opdrachtvideo's.** Er staan 20 opdrachten in. In Vimeo zijn geen aparte opdrachtvideo's te herkennen aan de titel. Staan de opdrachten zelf in de huidige Apex app?
- **Fase 2:** twee lessen (doel achter het doel, korte-termijndoel) hebben geen video.
- **Performance Coaching:** 60 video's ingedeeld, maar zonder samenvattingen en zonder opdrachten. Staat op niet gepubliceerd.
- **Trainingsmodule:** 658 oefenvideo's staan klaar in `content/bron/vimeo-oefenvideos.json`.

## Volgende stappen in volgorde

1. Installeren in Base44 en de punten onder "vóór leden erin gaan" aflopen.
2. Afronden en scoren naar de server (ook nodig voor de avatar).
3. Vimeo-ondertitels aan, daarna samenvattingen voor de 132 video's.
4. Apex avatar: zie [06-apex-avatar.md](06-apex-avatar.md).
