#!/usr/bin/env python3
"""Bouwt content/leeromgeving-seed.json: de startdata voor de Apex leeromgeving.

Bronnen:
  - Stappenplannen en 90-dagen mails uit ActiveCampaign (handmatig verwerkt hieronder)
  - content/bron/bibliotheek-mails.json   (kennisreeks 'Apex Online Pakketten', 112 mails)
  - content/bron/oude-website-videos.json (techniek- en foam-roller video's van de oude site)

Draai:  python3 tools/build_seed.py
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
BRON = ROOT / "content" / "bron"
OUT = ROOT / "content" / "leeromgeving-seed.json"

# ---------------------------------------------------------------------------
# Pakketten (toegangsniveaus)
# ---------------------------------------------------------------------------
PAKKETTEN = [
    dict(key="small_group", name="Small Group Training", order=1,
         description="Small group training zonder coaching. Ziet alleen Fase 1 (het startstappenplan)."),
    dict(key="small_group_plus", name="Small Group+", order=2,
         description="Small group + 1-op-1 coaching + voedingsschema. Fase 1, Fase 2 en de bibliotheek."),
    dict(key="challenge_90", name="90 Dagen Challenge", order=3,
         description="13 weken programma met wekelijkse opdrachten, coaching via Zoom en de bibliotheek."),
    dict(key="performance", name="Performance Coaching", order=4,
         description="Volledige toegang tot alle leerlijnen."),
    dict(key="alles", name="Team / coach (alles)", order=9,
         description="Interne toegang voor coaches en het Apex team. Ziet alle content."),
]
ALL = ["small_group", "small_group_plus", "challenge_90", "performance", "alles"]
COACHING = ["small_group_plus", "challenge_90", "performance", "alles"]
VOEDING = ["small_group_plus", "challenge_90", "performance", "alles"]
CHALLENGE = ["challenge_90", "performance", "alles"]
PERFORMANCE = ["performance", "alles"]

# ---------------------------------------------------------------------------
# Categorieën / thema's (vaste lijst, ook in de frontend: components/leeromgeving/config.js)
# ---------------------------------------------------------------------------
CATS = ["start", "doelen", "mindset", "gewoontes", "voeding", "training",
        "mobiliteit", "herstel", "lichaam", "relaties", "tijd"]


def f(key, label, type="textarea", **kw):
    """Een invulveld van een opdracht."""
    d = dict(key=key, label=label, type=type)
    d.update(kw)
    return d


def info(key, text):
    return dict(key=key, label=text, type="info")


PIJLERS = [("gezondheid", "Gezondheid"), ("relaties", "Relaties"),
           ("werk", "Werk & financiën"), ("persoonlijk", "Persoonlijk leven")]

LINKS = dict(
    app="https://app.apexonlinecoaching.nl/",
    vytal_intake="https://coach.vytal.nl/club/apex-online-coaching/",
    vytal_android="https://play.google.com/store/apps/details?id=nl.intoapps.tastish",
    vytal_apple="https://apps.apple.com/nl/app/vytal/id1456738302",
    trainin="https://apexonlinecoaching.trainin.app/activities/L67JD/meting-inbody-met-advies-fotos-en-omtrekmeting",
    sll_pdf="https://www.apexonlinecoaching.nl/wp-content/uploads/2022/08/straightlineleadership-eerste_5_hoofdstukken.pdf",
    ebook_drive="https://drive.google.com/drive/folders/1vLJRv60JDGFHwIcrZ1ycHE2cUTeQPFic?usp=sharing",
    books_android="https://play.google.com/store/apps/details?id=com.google.android.apps.books",
    books_apple="https://apps.apple.com/nl/app/apple-books/id364709193",
    inbody_android="https://play.google.com/store/apps/details?id=com.inbody2014.inbody",
    inbody_apple="https://apps.apple.com/nl/app/inbody/id884923678",
)

TRAJECTEN = []
MODULES = []
LESSEN = []
OPDRACHTEN = []


def traject(**kw):
    kw.setdefault("published", True)
    TRAJECTEN.append(kw)


def module(ref, track_key, title, order, **kw):
    MODULES.append(dict(ref=ref, track_key=track_key, title=title, order=order, **kw))


def les(ref, track_key, module_ref, title, order, **kw):
    kw.setdefault("published", True)
    kw.setdefault("completion", "handmatig")
    LESSEN.append(dict(ref=ref, track_key=track_key, module_ref=module_ref, title=title, order=order, **kw))


def opdracht(ref, title, track_key, lesson_ref, fields, **kw):
    kw.setdefault("coach_review", True)
    OPDRACHTEN.append(dict(ref=ref, title=title, track_key=track_key, lesson_ref=lesson_ref, fields=fields, **kw))


# ===========================================================================
# FASE 1 — Start bij Apex (stappenplan uit de 'Vervolgstappen' mail)
# ===========================================================================
traject(key="fase1", title="Fase 1 · Start bij Apex", order=1, type="stappenplan", sequential=True,
        drip="geen", icon="Rocket", access_packages=ALL,
        subtitle="In 9 stappen en een korte check klaar voor je intake",
        description="Kijk de video's op volgorde en voer na elke video de actie uit. Zo heb ik zo snel "
                    "mogelijk al jouw informatie en ben ik goed voorbereid op je intake.")
module("f1-m1", "fase1", "Jouw stappenplan", 1, description="Rond de stappen op volgorde af.")

les("f1-s1", "fase1", "f1-m1", "Welkom bij Apex & jouw intake", 1, step_label="Stap 1",
    vimeo_id="1052225623", vimeo_hash="6aca5ff2ac", categories=["start"], access_packages=ALL,
    summary="Welkom! In deze video vertel ik hoe jouw traject eruitziet en wat je bij de intake kunt verwachten.",
    key_points=["Hoe jouw traject is opgebouwd", "Wat er tijdens de intake gebeurt", "Wat ik van jou verwacht"])

les("f1-s2", "fase1", "f1-m1", "De Apex app", 2, step_label="Stap 2",
    vimeo_id="1005196974", vimeo_hash="4c9908dac6", categories=["start"], access_packages=ALL,
    summary="Bekijk de video en log daarna in op de Apex app.",
    action_links=[dict(label="Naar de Apex app", url=LINKS["app"])],
    key_points=["Je account staat al klaar: je hebt een aparte mail van de Apex app ontvangen",
                "Zet de app op het beginscherm van je telefoon"])

les("f1-s3", "fase1", "f1-m1", "Jouw voedingsschema", 3, step_label="Stap 3",
    vimeo_id="1005196947", vimeo_hash="eff0e89f16", categories=["start", "voeding"], access_packages=VOEDING,
    summary="Bekijk de video en vul daarna het Vytal intakeformulier in. Daarmee maken we jouw voedingsschema.",
    action_links=[dict(label="Naar het Vytal intakeformulier", url=LINKS["vytal_intake"])])

les("f1-s4", "fase1", "f1-m1", "Vytal downloaden", 4, step_label="Stap 4",
    vimeo_id="1052230762", vimeo_hash="89c12456b6", categories=["start", "voeding"], access_packages=VOEDING,
    summary="Bekijk de video en download de Vytal app. Vytal stelt met één druk op de knop jouw maaltijden samen, "
            "afgestemd op je kcal, macro's, dieetvoorkeuren en allergieën.",
    action_links=[dict(label="Vytal voor Android", url=LINKS["vytal_android"]),
                  dict(label="Vytal voor Apple", url=LINKS["vytal_apple"])])

les("f1-s5", "fase1", "f1-m1", "Intake & meting inplannen in Trainin", 5, step_label="Stap 5",
    vimeo_id="1005972749", vimeo_hash="20c7803dda", categories=["start"], access_packages=ALL,
    summary="Waarschijnlijk hebben we je intake al telefonisch ingepland, dan kun je deze stap overslaan. "
            "Je krijgt een aparte mail van Trainin zodra je producten zijn toegekend; daar staat ook je factuur.",
    action_links=[dict(label="Intake/meting inplannen", url=LINKS["trainin"])],
    body="""### Wat je kunt verwachten bij de intake
- Je huidige situatie en wensen bespreken
- Startmeting: omtrek in centimeters, foto's en de InBody-weegschaal
- Doel bepalen
- Al je overige vragen kun je hier ook stellen

### Regels voor de InBody
- Ga naar het toilet voordat je op de weegschaal gaat
- Eet 3 uur van tevoren niet
- Drink 2 uur van tevoren niet
- Train niet op de dag van de meting
- Kom met schone voeten
- Kom zonder sieraden (dit kan de meting beïnvloeden)

### Kleding en foto's
We gaan voor het beste resultaat. Daarom staan we standaard zonder shirt, broek en sokken op de weegschaal, alleen in ondergoed of bikini. Dat kan oncomfortabel voelen, maar het is een bewuste eerste stap: zo starten we met een blanco canvas.

We maken ook foto's om je startpositie vast te leggen, inclusief de stand van je rug, nek, enkels en schouders. Trek daarom een relatief strak shirt of topje aan (het liefst geen zwarte kleding).

**Advies:** draag zo licht mogelijke kleding. Wil je dat niet, zorg dan voor kleding waarbij je oksels vrij zijn.""")

les("f1-s6", "fase1", "f1-m1", "Instructievideo's in de Apex app", 6, step_label="Stap 6",
    vimeo_id="1005979070", vimeo_hash="f8194cdfd7", categories=["start"], access_packages=ALL,
    summary="Bekijk de video en open daarna de instructievideo's in de Apex app.",
    action_links=[dict(label="Naar de instructievideo's", url=LINKS["app"])])

les("f1-s7", "fase1", "f1-m1", "De eerste 5 hoofdstukken van Straight Line Leadership", 7, step_label="Stap 7",
    vimeo_id="1006354802", vimeo_hash="66ced837cf", categories=["start", "mindset"], access_packages=ALL,
    summary="Bekijk de video en lees daarna de eerste 5 hoofdstukken.",
    action_links=[dict(label="Eerste 5 hoofdstukken (pdf)", url=LINKS["sll_pdf"])])

les("f1-s8", "fase1", "f1-m1", "Download het hele e-book", 8, step_label="Stap 8",
    categories=["start", "mindset"], access_packages=ALL, assignment_ref="op-sll",
    summary="Het e-book is een Epub-bestand. Op je telefoon open je dat met een e-book app, dus download die eerst. "
            "Open daarna de map in Google Drive en klik op het Epub-bestand.",
    key_points=["Mijn verzoek: lees elke dag 1 hoofdstuk",
                "Vul na elk hoofdstuk je observaties in via de opdracht hieronder"],
    action_links=[dict(label="E-book app Android", url=LINKS["books_android"]),
                  dict(label="E-book app Apple", url=LINKS["books_apple"]),
                  dict(label="Naar het e-book in Google Drive", url=LINKS["ebook_drive"])])

les("f1-s9", "fase1", "f1-m1", "Download de InBody app", 9, step_label="Stap 9",
    categories=["start"], access_packages=ALL,
    summary="Met de InBody app kijk je al je metingen terug wanneer je maar wilt. Bedankt voor het doorlopen van "
            "alle stappen! We spreken elkaar snel op de intake.",
    action_links=[dict(label="InBody voor Android", url=LINKS["inbody_android"]),
                  dict(label="InBody voor Apple", url=LINKS["inbody_apple"])])

opdracht("op-sll", "Observaties Straight Line Leadership", "fase1", "f1-s8", repeatable=True, coach_review=False,
         intro="Alleen lezen levert je niets op. Reflectie en toepassing wel. Vul dit formulier in na elk hoofdstuk.",
         fields=[f("hoofdstuk", "Hoofdstuk", "number", required=True, min=1, max=60),
                 f("inzicht", "Wat is je belangrijkste inzicht uit dit hoofdstuk?", required=True),
                 f("herkenning", "Waar herken je jezelf in?"),
                 f("toepassen", "Wat ga je vandaag of deze week anders doen?")])

les("f1-quiz", "fase1", "f1-m1", "Check: ben je klaar voor je intake?", 10, step_label="Afsluiter",
    categories=["start"], access_packages=ALL, assignment_ref="op-f1-quiz", needs_review=False,
    summary="Acht korte vragen over je stappenplan. Haal je 75% of meer, dan ben je klaar voor je intake.")

def q(key, label, options, correct, explanation=""):
    return dict(key=key, label=label, type="quiz", options=options, correct=correct, explanation=explanation)

opdracht("op-f1-quiz", "Klaar voor je intake?", "fase1", "f1-quiz", kind="quiz", pass_percentage=75, repeatable=True,
         coach_review=False, intro="Je mag de quiz zo vaak maken als je wilt.",
         fields=[q("eten", "Hoe lang van tevoren eet je niet meer voor de InBody-meting?", ["1 uur", "2 uur", "3 uur", "6 uur"], "3 uur",
                   "Eten beïnvloedt de meting; 3 uur van tevoren niet eten."),
                 q("drinken", "Hoe lang van tevoren drink je niet meer?", ["30 minuten", "1 uur", "2 uur", "3 uur"], "2 uur"),
                 q("trainen", "Mag je trainen op de dag van je meting?", ["Ja, als het licht is", "Nee", "Alleen cardio"], "Nee",
                   "Training verandert je vochtbalans en daarmee de uitslag."),
                 q("sieraden", "Wat doe je af voordat je op de InBody stapt?", ["Je sieraden", "Niets", "Alleen je schoenen"], "Je sieraden",
                   "Sieraden kunnen de meting beïnvloeden. Kom ook met schone voeten."),
                 q("fotos", "Waarom maken we foto's bij de startmeting?",
                   ["Voor social media", "Om je startpositie vast te leggen en later te vergelijken", "Dat is verplicht voor de verzekering"],
                   "Om je startpositie vast te leggen en later te vergelijken"),
                 q("trainin", "Waar plan je je meting in?", ["In de Apex app", "In Trainin", "Via WhatsApp"], "In Trainin"),
                 q("sll", "Hoe lees je Straight Line Leadership?",
                   ["In één weekend uit", "Elke dag één hoofdstuk, en je observaties vul je in de app in", "Alleen de samenvattingen"],
                   "Elke dag één hoofdstuk, en je observaties vul je in de app in"),
                 q("meting", "Hoe vaak is er een InBody-meting?", ["Elke week", "Elke 4 weken", "Eén keer per kwartaal"], "Elke 4 weken",
                   "Iedereen, in elk traject, heeft elke 4 weken een InBody-meting. Zo zie je je voortgang zwart op wit.")])

# ===========================================================================
# FASE 2 — Je doel stellen
# ===========================================================================
traject(key="fase2", title="Fase 2 · Je doel stellen", order=2, type="leerlijn", sequential=False,
        drip="geen", icon="Target", access_packages=COACHING,
        subtitle="Van Punt A naar Punt B",
        description="Een helder doel is de basis van elk resultaat. In deze fase bepaal je waar je nu staat, "
                    "waar je naartoe wilt en waarom dat zo belangrijk voor je is. Doel: een 8,5 of hoger op ieder "
                    "domein in je leven.")
module("f2-m1", "fase2", "Waar sta je en waar wil je heen?", 1)
module("f2-m2", "fase2", "Maak het concreet", 2)

les("f2-l1", "fase2", "f2-m1", "Visualiseer je doel: wat is jouw why?", 1, categories=["doelen", "mindset"],
    access_packages=COACHING, assignment_ref="op-why", needs_review=True,
    summary="Als je why sterk genoeg is, houdt niets je meer tegen om te doen wat nodig is.",
    body="""Hoe zou het zijn als je jouw ideale lichaam al had? Als je kon zeggen dat je je echt fit voelt? Welk ideaal je ook voor ogen hebt: probeer het eens te visualiseren.

Ga daarna nadenken **waarom** je dit zo graag wilt. Waarom wil ik afvallen? Waarom wil ik sterker worden? Dit noemen we je *why*. Is je why sterk genoeg, dan houdt niets je meer tegen. Dat geldt niet alleen fysiek, maar ook mentaal.

Neem er de tijd voor. Als je iets echt wilt, dan lukt het!""")

les("f2-l2", "fase2", "f2-m1", "Punt A & Punt B op de 4 pijlers", 2, categories=["doelen"],
    access_packages=COACHING, assignment_ref="op-puntab", needs_review=True,
    summary="Je leven rust op 4 pijlers: gezondheid, relaties, werk & financiën en persoonlijk leven. "
            "Punt A is waar je nu staat. Punt B is waar je over 90 dagen wilt staan.",
    key_points=["Geef jezelf per pijler eerlijk een cijfer", "Beschrijf Punt A zo concreet mogelijk",
                "Maak Punt B meetbaar: wat zie, voel en meet je als je er bent?"])

les("f2-l3", "fase2", "f2-m1", "Het doel achter het doel", 3, categories=["doelen", "mindset"],
    access_packages=COACHING, assignment_ref="op-doelachter", needs_review=True,
    summary="Achter elk doel zit een dieper doel. Wie dat kent, heeft een reden om in actie te komen, "
            "ook op de dagen dat de motivatie er niet is.",
    key_points=["Betere resultaten omdat dingen helder zijn", "Makkelijker door het traject omdat je weet wat je wél en niet wilt",
                "Een duidelijke reden waarom jij in actie komt"])

les("f2-l4", "fase2", "f2-m2", "Zoek een korte termijn doel", 4, categories=["doelen", "gewoontes"],
    access_packages=COACHING, needs_review=True, source_subject="Tip 5: zoek een korte termijn doel",
    summary="Een groot doel geeft richting, een kort doel geeft vaart.")

les("f2-l5", "fase2", "f2-m2", "Maak het meetbaar met krachtige beloftes", 5, categories=["doelen", "gewoontes"],
    access_packages=COACHING, assignment_ref="op-beloftes-f2", needs_review=True,
    summary="Vage doelen geven vage resultaten. Maak specifieke, meetbare afspraken met jezelf en kom ze 100% na.",
    body="""Er zijn vier soorten beloftes:

- **Krachtig:** je komt hem 100% na.
- **Zwak:** 50%, afhankelijk van hoe je je voelt.
- **Crimineel:** je weet al dat je hem breekt voordat je hem maakt.
- **Geen belofte.**

Vertrouwen in jezelf bouw je niet met grote dingen, maar met kleine beloftes die je nakomt. Dag na dag. Keuze na keuze.""")

opdracht("op-why", "Mijn why", "fase2", "f2-l1",
         intro="Neem de tijd. Hoe eerlijker je bent, hoe meer je hieraan hebt.",
         fields=[f("doel", "Wat wil je bereiken?", required=True),
                 f("waarom", "Waarom is dit zo belangrijk voor je?", required=True),
                 f("visualisatie", "Hoe ziet je leven eruit als je het bereikt hebt? Wat zie, voel en hoor je?"),
                 f("prijs", "Wat kost het je als je níets verandert?")])

opdracht("op-puntab", "Punt A & Punt B", "fase2", "f2-l2",
         intro="Geef per pijler een cijfer (1-10) en beschrijf waar je nu staat (A) en waar je over 90 dagen wilt staan (B).",
         fields=sum([[f(k + "_cijfer", label + ": cijfer nu", "scale", min=1, max=10),
                      f(k + "_a", label + ": Punt A (nu)"),
                      f(k + "_b", label + ": Punt B (over 90 dagen)")] for k, label in PIJLERS], []))

opdracht("op-doelachter", "Het doel achter het doel", "fase2", "f2-l3",
         intro="Vraag steeds opnieuw 'waarom is dát belangrijk?' tot je bij de kern komt.",
         fields=[f("doel", "Mijn doel", "text", required=True),
                 f("w1", "Waarom wil je dat?"), f("w2", "En waarom is dát belangrijk?"),
                 f("w3", "En waarom is dát belangrijk?"), f("w4", "En wat levert dat je uiteindelijk op?"),
                 f("kern", "Mijn doel achter het doel in één zin", "text", required=True)])

opdracht("op-beloftes-f2", "Mijn krachtige beloftes", "fase2", "f2-l5",
         fields=[f("doel", "Mijn doel, specifiek en meetbaar", "text", required=True),
                 f("b1", "Krachtige belofte 1", "text", required=True), f("b2", "Krachtige belofte 2", "text"),
                 f("b3", "Krachtige belofte 3", "text"),
                 f("evaluatie", "Wanneer evalueer je of je ze bent nagekomen?", "date")])

# ===========================================================================
# 90 DAGEN CHALLENGE — 13 weken (week 1 = kickoff op locatie, week 2-13 = sessie 1-12)
# ===========================================================================
traject(key="challenge90", title="90 Dagen Challenge · Creating your Fundament", order=3, type="challenge",
        sequential=False, drip="wekelijks_cohort", icon="Flame", access_packages=CHALLENGE,
        subtitle="13 weken · elke week een sessie en een opdracht",
        description="Elke week krijg je na de coachingsessie één opdracht. Deadline: zaterdag 23:59, daarna sluit "
                    "de mogelijkheid om in te leveren. Niet om streng te zijn, maar omdat commitment zonder "
                    "consequentie niets waard is. Daarnaast lees je dagelijks één hoofdstuk uit Straight Line Leadership.")

WEKEN = [
    # (week, sessie, titel, vimeo_id, hash, lezen, samenvatting, kernpunten, opdracht-velden)
    (2, 1, "Cirkel, zigzag of straight line", "899626509", "39321e2f87", "Hoofdstuk 1 t/m 7",
     "Jouw leven is opgebouwd uit 3 werelden van succes. Die bepalen welke resultaten je daadwerkelijk haalt. "
     "Observeer je patronen: draai je rondjes (cirkel), ga je heen en weer (zigzag) of loop je een straight line?",
     ["Cirkel: je komt steeds terug bij af", "Zigzag: je zet stappen vooruit en weer terug",
      "Straight line: je doet wat nodig is, in een rechte lijn naar je doel"],
     [f("cirkel", "Op welk gebied zit je in een cirkel?"), f("zigzag", "Waar zigzag je?"),
      f("straight", "Waar loop je al een straight line?"),
      f("kost", "Welk patroon kost je op dit moment het meest?"),
      f("acties", "Welke 2 acties voer je deze week door?", required=True)]),
    (3, 2, "Obstakels & jouw Inner Stance", "905355413", "e6f2dc0ec2", "Hoofdstuk 8 t/m 14",
     "Van excuses naar eigenaarschap. Wie moet jij zijn, om te doen wat nodig is, om te krijgen wat je wilt? "
     "BE – DO – HAVE. Dat is je Inner Stance: de bril waardoor jij kijkt. Your words create your world.",
     ["Herken uitstelgedrag, alles-of-niets denken en het ontbreken van prioriteiten",
      "Kies bewust een nieuwe identiteit, bijvoorbeeld: 'ik ben een atleet'",
      "Pas die identiteit toe, juist op de momenten dat het schuurt"],
     [f("obstakels", "Mijn top 3 obstakels", required=True),
      f("excuus", "Welk excuus hoort bij elk obstakel?"),
      f("be", "BE: wie moet ik zijn?", required=True), f("do", "DO: wat ga ik doen?"),
      f("have", "HAVE: wat levert dat op?"), f("identiteit", "Mijn nieuwe identiteit: 'Ik ben…'", "text"),
      f("schuren", "Een moment deze week waarop het schuurde. Wat deed je?")]),
    (4, 3, "Slaap", "908561124", "80d2a93e59", "Hoofdstuk 15 t/m 21",
     "Slaap is een van de meest onderschatte factoren voor resultaat. Het beïnvloedt vetverbranding, spieropbouw, "
     "energie, focus, hormonen en herstel. Creëer jezelf tot iemand die slaap belangrijk maakt.",
     ["30 minuten geen blauw licht voor het slapen", "Een vaste avondroutine",
      "Let op cafeïne laat op de dag, alcohol en onregelmatige routines"],
     [f("uren", "Gemiddeld aantal uur slaap per nacht", "number", min=0, max=14),
      f("kwaliteit", "Hoe beoordeel je je slaapkwaliteit?", "scale", min=1, max=10),
      f("blauwlicht", "Hoeveel avonden lukte 30 minuten zonder blauw licht?", "number", min=0, max=7),
      f("routine", "Mijn avondroutine", required=True), f("observaties", "Observaties rondom slaap en energie"),
      f("excuses", "Op welke excuses of uitstelgedrag betrapte je jezelf?")]),
    (5, 4, "BMR & tips om sneller je doel te halen", "910944120", "cf90bd4666", "Hoofdstuk 22 t/m 28",
     "We kijken hoe je jouw doelstelling nog sneller haalt, met tips en adviezen om af te vallen of aan te komen.",
     ["Je BMR is de energie die je lichaam in rust verbruikt", "Je kcal-doel bouwt daarop voort",
      "Kleine dagelijkse keuzes bepalen het eindresultaat"],
     [f("richting", "Mijn doel", "select", options=["Afvallen", "Aankomen", "Op gewicht blijven"]),
      f("kcal", "Mijn dagelijkse kcal-doel", "number"),
      f("inname", "Mijn gemiddelde inname deze week (kcal)", "number"),
      f("tips", "Welke 3 tips pas je deze week toe?", required=True),
      f("reflectie", "Wat ging goed en wat kan beter?")]),
    (6, 5, "Verantwoordelijkheid & gewoontes", "1142425742", "d53a5e42fe", "Hoofdstuk 29 t/m 35",
     "Vage uitspraken geven vage resultaten. Maak specifieke, meetbare afspraken met jezelf. Gewoontes werken "
     "volgens trigger – gedrag – beloning. Wie dat patroon ziet, kan het structureel veranderen.",
     ["Verantwoordelijkheid nemen betekent ook tijdig communiceren als iets niet haalbaar is",
      "Weekendgedrag is voor veel mensen het aandachtspunt",
      "Dagelijks minimaal 400 gram groente, voldoende eiwit en maximaal 2 stuks fruit"],
     [f("gewoonte", "Welke gewoonte wil je veranderen?", "text", required=True),
      f("trigger", "Trigger: wat gaat eraan vooraf?"), f("gedrag", "Gedrag: wat doe je dan?"),
      f("beloning", "Beloning: wat levert het je op?"), f("nieuw", "Mijn nieuwe routine")]
     + [f("stopstart_" + k, label + ": waar stop je mee en waar begin je mee?") for k, label in PIJLERS]
     + [f("waarden", "Mijn 3 belangrijkste waarden, en sluiten mijn keuzes daarop aan?")]),
    (7, 6, "Personal Presence Drill & het verborgen voordeel", "1147260570", "8aae6004c6", "Hoofdstuk 36 t/m 42",
     "Leer de interne stem te herkennen en te parkeren. Kies 3 gewoontes in plaats van 10. Gebruik de "
     "twee-minutenregel. En observeer waar jij dingen mooier of erger maakt dan ze zijn, en wat je dat oplevert.",
     ["Honger vs. trek: focus op eiwitten en vast voedsel, groente bij elke maaltijd",
      "Personal Presence Drill: dagelijks 5 minuten in de spiegel, bij elke gedachte zeg je 'niet dat'",
      "Twee-minutenregel: begin gewoon twee minuten. Je traint discipline, niet motivatie"],
     [f("drill", "Hoeveel dagen deed je de Personal Presence Drill?", "number", min=0, max=7),
      f("drill_obs", "Wat merkte je tijdens de drill?"),
      f("top3", "Mijn top 3 gewoontes om te starten of te stoppen", required=True),
      f("voordeel", "Waar verdraai ik de werkelijkheid, en welk verborgen voordeel levert me dat op?"),
      f("gesprek", "Welk gesprek ga ik voeren (of heb ik gevoerd) waar ik verantwoordelijkheid vermeed?"),
      f("tweemin", "Waar heb ik de twee-minutenregel ingezet?")]),
    (8, 7, "Beloftes & het weekend", "914819027", "e49b2482ab", "Boek uitgelezen: herlees hoofdstuk 'Beloften'",
     "Doordeweeks gaat het prima, in het weekend verlaag je je standaard. Het weekend telt even hard mee als "
     "maandag. En: vetverlies meet je niet alleen op de weegschaal.",
     ["Hormonen, vocht, zout, glycogeen, stress en darminhoud vertekenen het getal op de weegschaal",
      "Kijk ook naar centimeters, energie, hoe je kleding zit en je foto's",
      "Vier soorten beloftes: krachtig, zwak, crimineel en geen belofte"],
     [f("tracken", "Heb je ook in het weekend alles getrackt?", "select", options=["Ja, alles", "Deels", "Nee"]),
      f("strategie", "Mijn strategie voor het weekend", required=True),
      f("zwak", "Een zwakke of criminele belofte die ik deed"),
      f("b1", "Krachtige belofte 1", "text", required=True), f("b2", "Krachtige belofte 2", "text"),
      f("b3", "Krachtige belofte 3", "text"), f("reflectie", "Reflectie op het hoofdstuk 'Beloften'")]),
    (9, 8, "Timemanagement: krachtige vs. zwakke acties", "917131451", "e2107a8241", None,
     "Tijd is niet het probleem, commitment wel. Tijdgebrek komt bijna altijd door een van deze drie: je verwart "
     "oppervlakkige acties met kernacties, je hebt een Inner Stance waar je je niet bewust van bent, of je doel "
     "is niet scherp genoeg.",
     ["The path to success is to take massive determined actions", "Maak het onderscheid zwart-wit",
      "Nog 4 weken: tijd voor massieve actie"],
     [f("doel", "Mijn doel, scherp geformuleerd", "text", required=True),
      f("krachtig", "Welke acties brengen me dichter bij mijn doel? (krachtig)", required=True),
      f("zwak", "Welke acties houden me tegen? (zwak)", required=True),
      f("observaties", "Wat zijn je observaties na het maken van deze opdracht?")]),
    (10, 9, "Stressmanagement", "922584746", "986a2adbdb", None,
     "Stress en uitstel zijn broer en zus. Elke taak die je uitstelt blijft in je hoofd hangen. Je lost stress "
     "niet op door te ontspannen, maar door te doen wat je steeds voor je uitschuift.",
     ["Orange lights: opgejaagd, vol hoofd, geïrriteerd, in slaap vallen op de bank",
      "Red lights: duizeligheid, fysieke spanning, je zwaar of geblokkeerd voelen, slaapproblemen",
      "10-secondenregel: tel af van 10 naar 0 en doe het gewoon"],
     [f("nadelen", "De nadelen van mijn zwakke acties (specifiek)", required=True),
      f("orange", "Welke orange lights herken ik?"), f("red", "Welke red lights herken ik?"),
      f("correctie", "Mijn correctie per signaal"),
      f("ratio", "Percentage krachtige acties deze week", "number", min=0, max=100),
      f("intentie", "Wie wil ik zijn? (zeg dit elke ochtend en avond)", "text")]),
    (11, 10, "Je toekomst: de brief aan jezelf", "924987684", "e6f1fbf5d1", None,
     "Een escape card is een excuus dat je steeds opnieuw speelt, zodat je geen verantwoordelijkheid hoeft te "
     "nemen. 'Ik ben nu eenmaal een pleaser.' Klinkt als een eigenschap, maar het is een keuze die je blijft herhalen.",
     ["Je escape card is het enige dat je nog tegenhoudt", "Twee-minutenregel: doe het nu",
      "Schrijf meetbaar, geen vage intenties"],
     [info("uitleg", "Schrijf een brief aan jezelf: wie ben jij over zes maanden? Maak het concreet op vier domeinen. "
                     "Print de brief en neem hem over twee weken mee naar je coach.")]
     + [f("brief_" + k, label + " over 6 maanden", required=True) for k, label in PIJLERS]
     + [f("escape", "Mijn escape card deze week, en waarvoor was die een excuus?"),
        f("tweemin", "Waar pas ik vandaag de twee-minutenregel toe?", "text")]),
    (12, 11, "Het 5G-schema & Dark side vs. Light side", "927528380", "8f96d4be37", None,
     "Alleen je inner stance, je gedachten en je gedrag kun je beïnvloeden. Het 5G-schema maakt zichtbaar hoe "
     "hinderende gedachten leiden tot het niet halen van resultaat.",
     ["Dark side: gedrevenheid, moed, volharding, kracht, confronterend",
      "Light side: verbindend, geduldig, vriendelijk, accepterend, ontspannen",
      "Een krachtig persoon schakelt bewust tussen dark en light side"],
     [f("g_gebeurtenis", "5G · Gebeurtenis"), f("g_gedachte", "5G · Gedachten"), f("g_gevoel", "5G · Gevoel"),
      f("g_gedrag", "5G · Gedrag"), f("g_gevolg", "5G · Gevolg"),
      f("ratio", "Welke ratio dark/light side geef je jezelf, en waarom?"),
      f("werkbaar", "Waar is dit werkbaar voor je en waar niet?"),
      f("gewenst", "Welke ratio zou je willen zien? Wat maakt dat mogelijk?"),
      f("pijlers", "Een commitment per pijler waarvoor je moet shiften"),
      f("experiment", "Wat ervoer je toen je deze week experimenteerde?")]),
    (13, 12, "Sociogram: jouw relaties", "929920361", "8c349e030f", None,
     "Voor de pijler Relaties maak je een sociale balans op. Je kijkt naar het belang en de kwaliteit van je "
     "relaties. Bovenaan de gouden cirkel: mensen die je kracht geven. Onderaan: mensen die je kracht kosten.",
     ["Het belang van een relatie", "De kwaliteit van een relatie", "Waar wil je meer tijd en energie in steken?"],
     [f("kracht", "Mensen die me kracht geven (bovenkant gouden cirkel)", required=True),
      f("energie", "Mensen die me te veel tijd en energie kosten (onderkant)", required=True),
      f("investeren", "In welke relatie ga ik investeren, en hoe?"),
      f("grens", "Waar ga ik een grens stellen?")]),
]

for week in range(1, 14):
    module(f"c90-w{week}", "challenge90", f"Week {week}", week, week_number=week,
           live_session=(week == 1),
           description="Kickoff op locatie" if week == 1 else f"Coachingsessie {week - 1}")

les("c90-intro", "challenge90", "c90-w1", "Zo werkt de 90 Dagen Challenge", 1, categories=["doelen"],
    access_packages=CHALLENGE, summary="De spelregels voor de komende 13 weken.",
    body="""- **Elke week één opdracht.** Je krijgt hem aan het einde van de coachingsessie.
- **Deadline: zaterdag 23:59.** Daarna sluit de mogelijkheid om in te leveren.
- **Elke dag één hoofdstuk** uit *Straight Line Leadership*. Je observaties deel je via de opdracht *Observaties Straight Line Leadership*.
- **Wekelijkse coachingsessie via Zoom.** De link vind je bovenaan in deze leerlijn.

Resultaat komt niet uit motivatie, maar uit wat je doet. Ook als niemand kijkt.""")

les("c90-kickoff", "challenge90", "c90-w1", "Kickoff: de fundamenten", 2, categories=["doelen", "mindset"],
    access_packages=CHALLENGE, live_session=True, assignment_ref="op-c90-kickoff",
    summary="Tijdens de kickoff op locatie werkten we aan de fundamenten: de Interne Wereld Dialoog, de 3 werelden "
            "van succes, de 4 pijlers, Punt A & Punt B en het doel achter het doel.",
    key_points=["Dit zijn geen losse concepten: hier bouw je de komende 90 dagen op",
                "Maak de opdracht goed, dan wordt de rest van het traject makkelijker",
                "Vanaf de maandag na de kickoff lees je elke dag één hoofdstuk"])

opdracht("op-c90-kickoff", "Kickoff: Punt A & Punt B + het doel achter het doel", "challenge90", "c90-kickoff",
         deadline_day_offset=5, lock_after_deadline=True,
         intro="Als je deze opdracht goed maakt, haal je betere resultaten, loop je makkelijker door het traject en "
               "weet je waarom jij in actie komt.",
         fields=sum([[f(k + "_cijfer", label + ": cijfer nu", "scale", min=1, max=10),
                      f(k + "_a", label + ": Punt A"), f(k + "_b", label + ": Punt B")] for k, label in PIJLERS], [])
         + [f("doel_achter", "Het doel achter mijn doel", required=True)])

SESSIE_CATS = {1: ["mindset"], 2: ["mindset"], 3: ["herstel"], 4: ["voeding"], 5: ["gewoontes"],
               6: ["mindset", "gewoontes"], 7: ["gewoontes", "voeding"], 8: ["tijd"], 9: ["herstel"],
               10: ["doelen"], 11: ["mindset"], 12: ["relaties"]}
for week, sessie, titel, vid, h, lezen, samenvatting, kern, velden in WEKEN:
    ref = f"c90-s{sessie}"
    kp = list(kern) + ([f"Lezen: Straight Line Leadership, {lezen}"] if lezen else [])
    les(ref, "challenge90", f"c90-w{week}", f"Sessie {sessie} · {titel}", 1, vimeo_id=vid, vimeo_hash=h,
        categories=SESSIE_CATS[sessie], access_packages=CHALLENGE, summary=samenvatting, key_points=kp,
        assignment_ref=f"op-{ref}", needs_review=(sessie == 5))
    opdracht(f"op-{ref}", f"Week {week} · {titel}", "challenge90", ref, velden,
             deadline_day_offset=5, lock_after_deadline=True)

les("c90-afronding", "challenge90", "c90-w13", "Afronding: terugblik & je volgende Punt B", 2,
    categories=["doelen"], access_packages=CHALLENGE, assignment_ref="op-c90-afronding", needs_review=True,
    summary="Ongelofelijk wat je in 90 dagen hebt neergezet. Kijk terug, meet opnieuw en bepaal je volgende stap.")
opdracht("op-c90-afronding", "Week 13 · Terugblik", "challenge90", "c90-afronding",
         deadline_day_offset=5, lock_after_deadline=False,
         fields=[f(k + "_nu", label + ": cijfer nu", "scale", min=1, max=10) for k, label in PIJLERS]
         + [f("inzicht", "Mijn grootste inzicht van de afgelopen 90 dagen", required=True),
            f("trots", "Waar ben ik het meest trots op?"),
            f("volgende", "Mijn volgende Punt B (komende 90 dagen)", required=True),
            f("feedback", "Wat wil je ons meegeven over de challenge? (optioneel)")])

# ===========================================================================
# PERFORMANCE COACHING — placeholder voor een later stadium
# ===========================================================================
traject(key="performance", title="Performance Coaching", order=4, type="leerlijn", sequential=False,
        drip="geen", icon="Trophy", access_packages=PERFORMANCE, published=False,
        subtitle="Binnenkort beschikbaar",
        description="De leerlijn voor Performance Coaching klanten. Wordt in een later stadium gevuld.")
module("pc-m1", "performance", "Introductie", 1)

# ===========================================================================
# BIBLIOTHEEK — kennisreeks + techniekvideo's
# ===========================================================================
traject(key="bibliotheek", title="Bibliotheek", order=5, type="bibliotheek", sequential=False, drip="geen",
        icon="Library", access_packages=COACHING, subtitle="Alles wat je wilt weten, per thema",
        description="Zoek op onderwerp of kies wat je nu nodig hebt.")

LIB_CATS = {
    "voeding": ["Tip 1", "Negatieve energiebalans", "Macro", "Tip 2", "Calorieën tracken", "Keukenindeling",
                "Alcohol", "Tip 4", "5 aspecten van voeding", "Gekookt vs ongekookt", "Boodschappen doen",
                "Het belang van water", "Gezond vs ongezond", "Tip 6", "Preppen", "Tip 7", "Wat te eten voor en na",
                "Tip 8", "Verborgen calorieën", "Nieuwe dingen proeven", "Levenslang je voeding", "Voedsel met weinig",
                "Tip 9", "Timing van voeding", "Suiker", "Tip 11", "Flexibel eten", "Cafeïne", "ontbijt",
                "Verzadiging", "Eiwitsynthese", "Koolhydraten", "Ketogeen", "Tip 13", "Micro’s",
                "Voedingssupplementen", "Ad libitum", "Tip 14", "Intermittent fasting", "Drugs", "Vakantie",
                "Lokale vetverbranding", "Vet verbranden", "Spiermassa aankomen"],
    "training": ["Wat is krachttraining", "Microplates", "Progressive overload", "Belasting en belastbaarheid",
                 "warming-up", "Spierschade", "volgorde van de oefeningen", "Cardio", "Goede en slechte trainingsdagen",
                 "Pijlers voor effectieve spieropbouw", "Deloaden", "Periodiseringsmodellen", "Techniek training",
                 "Mind muscle", "Bouw van de spieren", "Spiermassa aankomen", "Energiesystemen", "Presteren",
                 "Kracht en hypertrofie", "FITT", "Trainingsprincipes", "Jouw RM test", "Fit worden", "Tip 12",
                 "Steroïden", "Tip 15", "Bikini body", "Groeien in je rustfase"],
    "mobiliteit": ["Mobiliteit", "Sauna", "Nekpijn"],
    "herstel": ["Wat is stress", "Wat is herstel", "Blauw licht", "Supplementen voor herstel", "Relaxen",
                "Groeien in je rustfase", "Nummer 1 prioriteit", "Vechten tegen sociale stress", "Werk vs vrije dagen"],
    "gewoontes": ["Duurzaamheid en consistentie", "Wat is een gewoonte", "Voorbereiding op moeilijke momenten",
                  "blijvende gedragsverandering", "Jouw huidige gedrag", "Een gewoonte afleren", "Tip 10",
                  "Mythe - een gewoonte", "Robots vs normale", "Hoe is jouw thuissituatie", "Tip 1", "Tip 15",
                  "Tijdsindeling"],
    "mindset": ["Geloof in jezelf", "Motivatie", "Ontkenning van je eigen fouten", "Winnaarsmentaliteit",
                "Geluk", "Psychologie", "Resultaten"],
    "doelen": ["Visualiseer je doel", "Tip 5", "Meten is weten", "Tip 3", "Meten en vastleggen", "Resultaten"],
    "lichaam": ["Ontlasting", "verschil tussen mannen en vrouwen", "Menstruatie", "Zwangerschap", "Leeftijdsverschil",
                "Heeft warm weer", "Nekpijn", "Tip 3"],
    "relaties": ["invloed van de mensen", "Vechten tegen sociale stress", "Hoe is jouw thuissituatie"],
    "tijd": ["Tijdsindeling", "Werk vs vrije dagen"],
}
EXTRA_VIDEO = {"Nummer 1 prioriteit voor resultaat? (video)": ["592728526", ""]}
RENAME = {"Nummer 1 prioriteit voor resultaat? (video)": "Nummer 1 prioriteit voor resultaat: slaap"}

MODULE_TITLES = {
    "doelen": "Doelen stellen", "mindset": "Mindset & motivatie", "gewoontes": "Gewoontes & discipline",
    "voeding": "Voeding", "training": "Training & techniek", "mobiliteit": "Mobiliteit & foam rollen",
    "herstel": "Slaap, stress & herstel", "lichaam": "Lichaam & gezondheid", "relaties": "Relaties & omgeving",
    "tijd": "Tijd & leiderschap",
}
for i, (k, t) in enumerate(MODULE_TITLES.items(), 1):
    module(f"bib-{k}", "bibliotheek", t, i, category=k)


def cats_for(subject):
    out = [c for c, keys in LIB_CATS.items() if any(key.lower() in subject.lower() for key in keys)]
    return out or ["mindset"]


def summary_from(text):
    first = re.split(r"(?<=[.!?])\s", text.replace("\n", " ").strip())
    s = " ".join(first[:2])
    return (s[:240] + "…") if len(s) > 240 else s


mails = json.loads((BRON / "bibliotheek-mails.json").read_text())
by_subject = {m["subject"]: m for m in mails}
counters = {}
for m in mails:
    subj = m["subject"]
    cats = cats_for(subj)
    vid = m["vimeo"][0] if m["vimeo"] else EXTRA_VIDEO.get(subj)
    mod = cats[0]
    counters[mod] = counters.get(mod, 0) + 1
    slug = re.sub(r"[^a-z0-9]+", "-", subj.lower()).strip("-")[:48]
    les(f"bib-{slug}", "bibliotheek", f"bib-{mod}", RENAME.get(subj, subj), counters[mod], categories=cats,
        access_packages=COACHING, body=m["text"], summary=summary_from(m["text"]), needs_review=True,
        vimeo_id=vid[0] if vid else "", vimeo_hash=vid[1] if vid else "", source="kennisreeks-mail")

# Fase 2 les 4 gebruikt de tekst van de mail 'Tip 5'
for l in LESSEN:
    if l.get("source_subject"):
        l["body"] = by_subject[l.pop("source_subject")]["text"]

oud = json.loads((BRON / "oude-website-videos.json").read_text())
FOAM = {"Nek", "Bovenrug", "Voorkant schouder", "Achterkant schouder", "Buitenkant schouder", "(korte) kuitspier",
        "(lange) kuitspier", "Onderarm (buitenkant)", "Peesplaat Bovenbeen", "Voorkant bovenbeen", "Bilspier",
        "Onderarm (achterkant)", "Onderarm (binnenkant)", "Voorkant scheenbeenspier", "nek rol"}
seen = set()
for v in oud:
    if v["vimeo"][0] in seen or v["title"] in ("Promo Apex", "APEX_final", "Jeroen Fly"):
        continue
    seen.add(v["vimeo"][0])
    foam = v["title"] in FOAM
    mod = "mobiliteit" if foam else ("voeding" if v["title"] in ("Dames moeten meer eten", "Cheat meals",
                                                                 "Afvallen en te weinig eten.",
                                                                 "Creatine, hoe zit dat nou eigenlijk?") else "training")
    if v["title"] == "Centimeter omtrek meten":
        mod = "doelen"
    counters[mod] = counters.get(mod, 0) + 1
    title = ("Foam roller · " + v["title"][0].upper() + v["title"][1:]) if foam else v["title"].rstrip(".")
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:48]
    les(f"bibv-{slug}", "bibliotheek", f"bib-{mod}", title, counters[mod], categories=[mod],
        access_packages=COACHING, vimeo_id=v["vimeo"][0], vimeo_hash=v["vimeo"][1], needs_review=True,
        source=f"oude website ({v['date'][:4]})", summary="")

# ===========================================================================
# VIMEO-ACCOUNT: correcties, performance-leerlijn en extra bibliotheek-video's
# Bron: content/bron/vimeo-catalogus.json (alle niet-privé video's uit Vimeo, op titel ingedeeld)
#       content/bron/vimeo-samenvattingen.json (samenvattingen op basis van de Vimeo-ondertitels)
# ===========================================================================
VIMEO = {v["id"]: v for v in json.loads((BRON / "vimeo-catalogus.json").read_text())}
SAM_PATH = BRON / "vimeo-samenvattingen.json"
SAM = {s["id"]: s for s in json.loads(SAM_PATH.read_text())} if SAM_PATH.exists() else {}


def vh(vid):
    return VIMEO[vid]["hash"] if vid in VIMEO else ""


# 90 dagen: de mails liepen soms een week achter. Koppeling op basis van de Vimeo-titels (nieuwste versie).
C90_VIDEO = {"c90-s2": "1081863327", "c90-s3": "1140468510", "c90-s4": "1142425742", "c90-s5": "1171714092",
             "c90-s7": "917131451", "c90-s8": "919727077"}
# Fase 2: video's die in Vimeo bij deze onderwerpen horen.
F2_VIDEO = {"f2-l1": "345458538", "f2-l2": "1164317078", "f2-l5": "871822306"}
for l in LESSEN:
    vid = C90_VIDEO.get(l["ref"]) or F2_VIDEO.get(l["ref"])
    if vid:
        l["vimeo_id"], l["vimeo_hash"] = vid, vh(vid)
    if l["ref"].startswith("c90-s"):
        l["needs_review"] = False

# ---- Performance Coaching: series Leadership, Commitment, Dreamteam, Self Leadership + Kickstart masterclasses
PERF_MODULES = [
    ("pc-stance", "Inner Stance & identiteit", "mindset",
     ["1072452204", "1078484782"]),
    ("pc-voordeel", "Verborgen voordeel & escape cards", "mindset",
     ["1072456639", "1147304297", "1168114292"]),
    ("pc-comfort", "War on comfort & discipline", "gewoontes",
     ["1091737009", "1091739238", "1082434745", "933148368", "933150255", "941917158", "958156034",
      "970462295", "925930052"]),
    ("pc-tijd", "Tijd, focus & commitment", "tijd",
     ["1076542422", "1098656092", "1102192986", "1102199917", "1104059305", "1150634831", "1157009928",
      "1145625159", "920615434", "911540306", "913336350", "866876668", "931042510"]),
    ("pc-communicatie", "Communicatie & verzoeken", "relaties",
     ["1105949920", "1107999868", "1109659445", "1103700865", "1082457644", "1084765712", "1065065018",
      "1111663301", "1113867538", "1140792175", "1171793797", "875998023", "878303044"]),
    ("pc-strategie", "Zichtbaarheid, strategie & besluitvaardigheid", "doelen",
     ["1078493509", "1081458099", "1143384508", "1148727614", "1117428222", "1117444684", "1069026191"]),
    ("pc-geld", "Geld & well-being", "tijd",
     ["1123850187", "1126173562", "1129776084", "1134272598", "1138916934"]),
    ("pc-standaarden", "Standaarden & Strong Point B", "doelen",
     ["1156053897", "1160181179", "1164317078", "871822306"]),
    ("pc-kickstart", "Kickstart masterclasses", "mindset",
     ["1096885555", "1098767701", "1100568596", "1102456526"]),
]
PREFIX = re.compile(r"^(apex\s+)?(online coaching|commitment|leadership|self leadership|dreamteam|dream ?week)"
                    r"\s*[-:;]?\s*(week\s*(in\s*)?\d+\s*[-:;]?)?\s*|^(silver\s+)?week\s*\d+\s*[-:;]?\s*", re.I)


def clean_title(name):
    t = PREFIX.sub("", name).strip(" -:;")
    t = re.sub(r"^(masterclass|masterlass)\s*(apex kickstart)?\s*[-:]?\s*", "", t, flags=re.I).strip(" -:;'")
    t = re.sub(r"^apex kickstart\s*-\s*masterclass\s*", "", t, flags=re.I).strip(" -:;'")
    t = t.replace("presataties", "prestaties").replace("Projecten & Shit", "Projecten")
    return (t[:1].upper() + t[1:]) if t else name


TITLE_FIX = {"1091737009": "War on comfort (1)", "1091739238": "War on comfort (2)", "933148368": "Uithoudingsvermogen (1)",
             "933150255": "Uithoudingsvermogen (2)", "970462295": "Bar raising proces", "925930052": "Het leven is moeilijk",
             "1102192986": "Open cycles of action (1): projecten", "1102199917": "Open cycles of action (2)",
             "1104059305": "Open cycles of action (3): completion", "1145625159": "Must (not to) do's",
             "920615434": "Betaal met je aandacht", "911540306": "Focus & completion (2)", "913336350": "Focus & completion (3)",
             "931042510": "Take inventory", "875998023": "Taal", "1065065018": "Krachtige verzoeken",
             "1082457644": "Verzoeken (1)", "1084765712": "Brutale verzoeken (2)", "1143384508": "Strategie",
             "1117428222": "Besluitvaardigheid (1)", "1117444684": "Besluitvaardigheid (2)",
             "1081458099": "Zichtbaarheid strategie (2)", "1078493509": "Zichtbaarheid strategie (1)",
             "1096885555": "Masterclass: houding & gedrag", "1098767701": "Masterclass: laserfocus",
             "1100568596": "Masterclass: belemmerende overtuigingen", "1102456526": "Masterclass: communicatie",
             "1134272598": "Competency well-being", "1138916934": "Overtuigingen & societal well-being",
             "1076542422": "Timemanagement", "1157009928": "HRA & LRA", "1078484782": "Jouw ongewenst geprogrammeerde toekomst"}

module("pc-m1", "performance", "Introductie", 0)
MODULES[:] = [m for m in MODULES if m["ref"] != "pc-m1"]
for i, (ref, title, cat, ids) in enumerate(PERF_MODULES, 1):
    module(ref, "performance", title, i)
    for j, vid in enumerate(ids, 1):
        v = VIMEO[vid]
        s = SAM.get(vid, {})
        les(f"pc-{vid}", "performance", ref, s.get("titel") or TITLE_FIX.get(vid) or clean_title(v["name"]), j,
            vimeo_id=vid, vimeo_hash=v["hash"], categories=s.get("categorieen") or [cat],
            access_packages=PERFORMANCE, summary=s.get("samenvatting", ""), key_points=s.get("kernpunten", []),
            needs_review=not s, source=f"Vimeo: {v['name']}",
            duration_min=round(v["dur"] / 60))

# ---- Bibliotheek: weekvideo's (Apex Online Coaching week N) en presentaties
module("bib-seizoen", "bibliotheek", "Feestdagen, kermis & vakantie", 11, category="gewoontes")
SKIP_WEEK = {"1130851582", "1185893144", "1156067451", "1130851583", "396677358", "592728526", "1223939756"}  # dubbele versies
SEIZOEN = re.compile(r"kermis|havenfeesten|feestdagen|vakantie|voornemens|het jaar in", re.I)
counters2 = {}
week_items = [v for v in VIMEO.values() if v["group"] in ("weekvideo", "presentatie", "seizoen") and v["id"] not in SKIP_WEEK
              and v["id"] not in ("455042678",)]
for v in sorted(week_items, key=lambda v: v["date"]):
    s = SAM.get(v["id"], {})
    if s.get("doelgroep") in ("promo", "overslaan"):
        continue
    cats = s.get("categorieen") or (["herstel"] if "slaap" in v["name"].lower() else ["mindset"])
    mod = "seizoen" if (SEIZOEN.search(v["name"]) or s.get("doelgroep") == "seizoen") else cats[0]
    if mod == "start":
        mod = "mindset"
    counters2[mod] = counters2.get(mod, 0) + 1
    les(f"bibw-{v['id']}", "bibliotheek", f"bib-{mod}", s.get("titel") or clean_title(v["name"]),
        100 + counters2[mod], vimeo_id=v["id"], vimeo_hash=v["hash"], categories=cats, access_packages=COACHING,
        summary=s.get("samenvatting", ""),
        key_points=s.get("kernpunten", []) + ([f"Opdracht voor jezelf: {s['opdracht_suggestie']}"] if s.get("opdracht_suggestie") else []),
        needs_review=(not s) or s.get("privacy_let_op", False) or s.get("samenvatting", "").startswith("(op basis van titel)"),
        source=f"Vimeo: {v['name']}", duration_min=round(v["dur"] / 60))

# ---- Bibliotheek: korte kennisclips 2018-2021. Hoort een clip bij een bestaand artikel, dan krijgt dat de video.
CLIP_TO_ARTICLE = {"255244274": "Alcohol", "255248120": "Mind muscle connection", "255244805": "Belasting en belastbaarheid",
                   "344638447": "Wat is een gewoonte", "344562274": "Periodiseringsmodellen",
                   "344635729": "Is het ontbijt de belangrijkste maaltijd van de dag?", "568901593": "Nieuwe dingen proeven",
                   "344639030": "Menstruatie", "344635388": "Blauw licht", "255252355": "Progressive overload",
                   "344638312": "Voedingssupplementen", "255245494": "Werk vs vrije dagen"}
CLIP_SKIP = {"345458538", "388341401", "392728022", "486358830", "503097538", "504919462", "505202519",
             "255249021", "317030124", "344602188", "344639157", "344639539", "352541702", "250170430", "255244684"}
CLIP_CATS = [("voeding", r"goed eet|eten|alcohol|energiebalans|creatine|cheat|detox|ontbijt|eiwit|calorie|vet|voeding|toning|dames"),
             ("training", r"bank|plank|buikspier|trainingvol|periodis|spierpijn|rocky|neurolog|neat"),
             ("herstel", r"slaap|meditatie"), ("lichaam", r"menstruatie"),
             ("gewoontes", r"gewoonte|naleving|nieuwe normaal|duurzaam"), ("doelen", r"doel|fluctu")]
bib_by_title = {l["title"]: l for l in LESSEN if l["track_key"] == "bibliotheek"}
for v in sorted([v for v in VIMEO.values() if v["group"] == "kennis_oud"], key=lambda v: v["date"]):
    if v["id"] in CLIP_SKIP:
        continue
    art = bib_by_title.get(CLIP_TO_ARTICLE.get(v["id"], ""))
    if art and not art["vimeo_id"]:
        art["vimeo_id"], art["vimeo_hash"] = v["id"], v["hash"]
        continue
    if art:
        continue
    cat = next((c for c, rx in CLIP_CATS if re.search(rx, v["name"], re.I)), "mindset")
    counters2[cat] = counters2.get(cat, 0) + 1
    title = v["name"].replace("Vouwen", "Vrouwen").replace("geneat", "NEAT").replace("meet eten", "Meer eten")
    title = title[:1].upper() + title[1:]
    les(f"bibc-{v['id']}", "bibliotheek", f"bib-{cat}", f"Kennisclip · {title}", 200 + counters2[cat],
        vimeo_id=v["id"], vimeo_hash=v["hash"], categories=[cat], access_packages=COACHING, needs_review=True,
        source=f"Vimeo ({v['date'][:4]})", duration_min=round(v["dur"] / 60))

# Video's die niet meer in Vimeo staan: weghalen (video-only lessen vervallen dan).
BESTAAT = set(VIMEO) | {o["id"] for o in json.loads((BRON / "vimeo-oefenvideos.json").read_text())}
for l in list(LESSEN):
    if l.get("vimeo_id") and l["vimeo_id"] not in BESTAAT:
        if not l.get("body") and not l.get("assignment_ref"):
            LESSEN.remove(l)
        else:
            l["vimeo_id"], l["vimeo_hash"] = "", ""
        print("niet meer in Vimeo:", l["title"])

# Thumbnails (Vimeo) en doorzoekbare transcripts (Vimeo-ondertitels) bij video-lessen.
THUMBS = json.loads((BRON / "vimeo-thumbnails.json").read_text()) if (BRON / "vimeo-thumbnails.json").exists() else {}
TRANSCRIPTS = json.loads((BRON / "vimeo-transcripts.json").read_text()) if (BRON / "vimeo-transcripts.json").exists() else {}
for l in LESSEN:
    vid = l.get("vimeo_id")
    l["thumbnail_url"] = THUMBS.get(vid, "") if vid else ""
    l["transcript"] = TRANSCRIPTS.get(vid, "") if vid else ""
    if vid in VIMEO and not l.get("duration_min"):
        l["duration_min"] = round(VIMEO[vid]["dur"] / 60)

# Certificaat bij het afronden van deze leerlijnen.
for t in TRAJECTEN:
    t["certificate"] = t["key"] in ("fase2", "challenge90", "performance")

# ---------------------------------------------------------------------------
COHORTEN = [dict(key="c90-voorbeeld", name="90 Dagen Challenge · voorbeeldronde", track_key="challenge90",
                 start_date="2026-11-16", session_info="Maandag 20:15 via Zoom", zoom_url="", active=True)]

for l in LESSEN:
    for k in ("summary", "body", "vimeo_id", "vimeo_hash", "step_label"):
        l.setdefault(k, "")
    for k in ("key_points", "action_links", "categories"):
        l.setdefault(k, [])
    l.setdefault("needs_review", False)
    l.setdefault("access_packages", COACHING)
    if "alles" not in l["access_packages"]:
        l["access_packages"] = l["access_packages"] + ["alles"]
for o in OPDRACHTEN:
    o.setdefault("kind", "opdracht")
    o.setdefault("intro", "")
    o.setdefault("repeatable", False)
    o.setdefault("deadline_day_offset", None)
    o.setdefault("lock_after_deadline", False)

# ---------------------------------------------------------------------------
# AGENDA — voorbeelden; aanpassen in Beheer → Agenda
# ---------------------------------------------------------------------------
import datetime as _dt
EVENTS = []
APEX_ADRES = "Apex Performance Centre, Papaverstraat 26b, Volendam (1e etage)"
gc = _dt.datetime(2026, 12, 10, 20, 15)
for i in range(6):  # groepscoaching: elke 4 weken op donderdag
    d = gc + _dt.timedelta(weeks=4 * i)
    EVENTS.append(dict(ref=f"ev-gc-{i+1}", title="Groepscoaching", kind="groepscoaching", start=d.strftime("%Y-%m-%dT%H:%M:00+01:00"),
                       end=(d + _dt.timedelta(hours=1, minutes=15)).strftime("%Y-%m-%dT%H:%M:00+01:00"), location=APEX_ADRES,
                       description="Samen met een groep gelijkgestemden stel je doelen, creëer je focus en word je comfortabel met het oncomfortabele.",
                       registration=True, access_packages=["small_group", "small_group_plus", "performance", "alles"]))
c0 = _dt.datetime(2026, 11, 16, 20, 15)
EVENTS.append(dict(ref="ev-c90-kickoff", title="Kickoff 90 Dagen Challenge", kind="kickoff",
                   start=(c0 - _dt.timedelta(days=2, hours=10, minutes=15)).strftime("%Y-%m-%dT%H:%M:00+01:00"),
                   end=(c0 - _dt.timedelta(days=2, hours=6, minutes=15)).strftime("%Y-%m-%dT%H:%M:00+01:00"),
                   location=APEX_ADRES, registration=True, cohort_key="c90-voorbeeld",
                   description="Live op locatie: de fundamenten voor de komende 90 dagen.", access_packages=CHALLENGE))
for w in range(1, 13):
    d = c0 + _dt.timedelta(weeks=w)
    EVENTS.append(dict(ref=f"ev-c90-s{w}", title=f"90 Dagen Challenge · coachingsessie {w}", kind="sessie",
                       start=d.strftime("%Y-%m-%dT%H:%M:00+01:00"), end=(d + _dt.timedelta(hours=1, minutes=15)).strftime("%Y-%m-%dT%H:%M:00+01:00"),
                       online_url="", registration=False, cohort_key="c90-voorbeeld",
                       description="Online via Zoom. De link vind je bovenaan je leerlijn.", access_packages=CHALLENGE))

INSTELLINGEN = [dict(key="herinneringen", enabled=False, test_mode=True, days=[7, 30, 30], min_progress=0, max_progress=90,
                     subject="{voornaam}, je volgende stap staat klaar",
                     body="Hoi {voornaam},\n\nHet is alweer even geleden dat je in de Apex leeromgeving bent geweest. Je volgende stap staat voor je klaar: {les} ({leerlijn}).\n\nPak hem vandaag op, al is het maar tien minuten: {link}\n\nSportieve groet,\nJeroen",
                     app_url="https://app.apexonlinecoaching.nl/leren", event_reminders=True, from_name="Apex Online Coaching"),
               dict(key="afmeldingen", enabled=False, test_mode=True, threshold=3, period_days=30, late_hours=0,
                    notify_member=True, notify_trainer=True, trainer_emails="", trainer_phone="", whatsapp_webhook_url="",
                    member_subject="{voornaam}, we missen je bij de training",
                    member_body="Hoi {voornaam},\n\nJe hebt je de afgelopen {dagen} dagen {aantal} keer afgemeld voor een training (laatste: {training}).\n\nIs er iets aan de hand of kunnen we je ergens mee helpen? Laat het me weten, dan zoeken we samen naar een oplossing.\n\nSportieve groet,\nJeroen",
                    trainer_subject="Let op: {naam} heeft zich {aantal}× afgemeld in {dagen} dagen",
                    trainer_body="{naam} heeft zich voor de {aantal}e keer afgemeld in de afgelopen {dagen} dagen.\n\nLaatste afmelding: {training} ({datum}).\n\nAlle afmeldingen in deze periode:\n{lijst}",
                    from_name="Apex Online Coaching")]

seed = dict(version=1, pakketten=PAKKETTEN, trajecten=TRAJECTEN, modules=MODULES, lessen=LESSEN,
            opdrachten=OPDRACHTEN, cohorten=COHORTEN, evenementen=EVENTS, instellingen=INSTELLINGEN)
OUT.write_text(json.dumps(seed, ensure_ascii=False, indent=1))
print(f"{OUT.relative_to(ROOT)}: {len(TRAJECTEN)} leerlijnen, {len(MODULES)} modules, {len(LESSEN)} lessen "
      f"({sum(1 for l in LESSEN if l['vimeo_id'])} met video), {len(OPDRACHTEN)} opdrachten")
