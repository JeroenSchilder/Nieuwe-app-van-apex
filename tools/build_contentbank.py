#!/usr/bin/env python3
"""Maakt content/contentbank-social.json en docs/07-contentbank-social.md.

De contentbank is een lijst met kant-en-klare ideeën voor social media, gehaald uit de bibliotheek
van de leeromgeving: bestaande video's met samenvatting, de 15 tips, mythes en de 90 dagen-modellen.
Elk idee heeft een haak, de kernpunten, de bron en een voorstel voor vorm en moment.

Draai:  python3 tools/build_contentbank.py   (na tools/build_seed.py)
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
seed = json.loads((ROOT / "content" / "leeromgeving-seed.json").read_text())
sam = {s["id"]: s for s in json.loads((ROOT / "content" / "bron" / "vimeo-samenvattingen.json").read_text())}
lessen = seed["lessen"]
by_vimeo = {l["vimeo_id"]: l for l in lessen if l.get("vimeo_id")}
by_title = {l["title"]: l for l in lessen}

ITEMS = []


def add(**kw):
    kw["id"] = f"cb-{len(ITEMS) + 1:03d}"
    kw.setdefault("moment", "altijd")
    kw.setdefault("let_op", "")
    ITEMS.append(kw)


# ---------------------------------------------------------------------------
# 1. Bestaande video's met samenvatting: de haak is met de hand geschreven.
#    vorm: "reel" = fragment knippen uit de bestaande video; "carrousel" = kernpunten als dia's.
# ---------------------------------------------------------------------------
VIDEO = [
    ("1173966754", "training", ["carrousel", "reel"], "Je traint drie keer per week en ziet geen verschil? Dan mis je één van deze drie.", "altijd", ""),
    ("1176160499", "herstel", ["reel", "carrousel"], "Het laatste halfuur voor je gaat slapen bepaalt je vetverlies van morgen.", "altijd", ""),
    ("1178390660", "herstel", ["carrousel"], "Discipline is een spier. Zo train je hem vanavond al.", "altijd",
     "In de video wordt een lid bij naam genoemd: alleen als tekst of carrousel gebruiken, niet de video zelf."),
    ("1180832558", "voeding", ["carrousel", "reel"], "Feestje dit weekend? Zo maak je vooraf 1.250 kcal ruimte.", "december: kerst en oud en nieuw", ""),
    ("1182532274", "mindset", ["reel", "carrousel"], "‘Ik had geen tijd’ klopt niet. Dit is wat je eigenlijk zegt.", "altijd", ""),
    ("1185894860", "mindset", ["challenge", "reel"], "Zeven dagen lang mag je maar één zin gebruiken: ‘ik koos ervoor’.", "altijd",
     "Leent zich voor een meedoe-actie in stories: elke dag één verboden zin."),
    ("1185915341", "mindset", ["reel"], "Niemand maakt jouw doelen belangrijker dan jij. Ook je coach niet.", "altijd", ""),
    ("1191196066", "voeding", ["carrousel", "reel"], "Een kilo zwaarder dan gisteren? Dat is geen vet. Dit zijn de 12 redenen.", "altijd", ""),
    ("1193239630", "mindset", ["reel", "carrousel"], "Wie ben jij als niemand kijkt?", "altijd", ""),
    ("1194689594", "gewoontes", ["carrousel", "reel"], "Die snaaibui om negen uur ’s avonds is geen gebrek aan discipline. Het is een lus.", "altijd", ""),
    ("1194690043", "voeding", ["carrousel"], "Afvallen in volgorde van belang. Je training staat op plek vijf.", "januari: goede voornemens", ""),
    ("1199308412", "voeding", ["carrousel"], "Supplementen staan bovenaan je boodschappenlijst en onderaan deze piramide.", "altijd", ""),
    ("1203411955", "training", ["reel", "carrousel"], "Dertig graden is geen reden om je training over te slaan. Pas dit aan.", "zomer: warme dagen", ""),
    ("1205429294", "mindset", ["reel"], "Een boek over zwemmen lezen voorkomt niet dat je verzuipt.", "altijd", ""),
    ("1207334889", "mindset", ["carrousel", "reel"], "Zeven regels die je leven lichter maken. Regel één: f*ck wat mensen denken.", "altijd", ""),
    ("1210793327", "mindset", ["reel"], "Geen kwark in huis is geen reden. Het hoort bij het spel.", "zomer: vakantie", ""),
    ("1210798101", "mindset", ["reel"], "‘Ik kijk wel even’ is geen commitment.", "altijd", ""),
    ("1211313888", "mindset", ["carrousel", "reel"], "Nadenken, googelen, erover praten. Het voelt als bezig zijn, maar het is uitstel.", "altijd", ""),
    ("1215470492", "gewoontes", ["carrousel", "reel"], "Je hoeft niets nieuws te beginnen. Stop eerst hiermee.", "januari: goede voornemens", ""),
    ("1216935597", "mindset", ["carrousel", "reel"], "Er zijn drie soorten beloftes. Twee ervan kosten je je resultaat.", "januari: goede voornemens", ""),
    ("1218859140", "gewoontes", ["reel", "carrousel"], "Uit je ritme? Dit is het moment waarop je het meeste kunt winnen.", "januari en na de zomervakantie", ""),
    ("1220812964", "voeding", ["carrousel", "reel"], "Dertig mixdrankjes met gewone cola: 3.300 kcal, alleen al aan cola.", "december: feestdagen; september: kermis", ""),
    ("1222655635", "herstel", ["carrousel"], "Zo herstel je sneller na een avond drinken.", "december: feestdagen; september: kermis", ""),
    ("1223677492", "gewoontes", ["reel", "carrousel"], "De schade zit niet in het feest. Die zit in de vier dagen erna.", "1 en 2 januari; na de kermis", ""),
]
for vid, pijler, vormen, haak, moment, let_op in VIDEO:
    s, l = sam[vid], by_vimeo.get(vid)
    add(soort="video", pijler=pijler, vormen=vormen, haak=haak, titel=s["titel"], punten=s["kernpunten"][:5],
        afsluiter=s.get("opdracht_suggestie", ""), moment=moment, let_op=let_op,
        bron=dict(les=l["title"] if l else s["titel"], vimeo_id=vid, minuten=l.get("duration_min") if l else None,
                  transcript=bool(l and l.get("transcript"))))

# ---------------------------------------------------------------------------
# 2. De 90 dagen-modellen: per sessie één carrousel als voorproefje van de challenge.
# ---------------------------------------------------------------------------
C90 = [
    (1, "Begin je elke maandag opnieuw? Dan zit je in de cirkel."),
    (2, "Wie moet jij zijn, om te doen wat nodig is, om te krijgen wat je wilt?"),
    (6, "Geen zin? Doe het twee minuten."),
    (7, "Doordeweeks gaat het prima. In het weekend verlies je het."),
    (8, "Tijd is niet het probleem. Dit zijn de drie echte oorzaken."),
    (9, "Je lichaam waarschuwt je al. Herken je deze oranje lichten?"),
    (10, "‘Ik ben nu eenmaal een pleaser.’ Het klinkt als een eigenschap. Het is een escape card."),
    (11, "Zeventig procent dark side, dertig procent light side."),
    (12, "Wie geeft je kracht en wie kost je kracht? Teken je sociogram."),
]
for nr, haak in C90:
    l = next(x for x in lessen if x["ref"] == f"c90-s{nr}")
    add(soort="model", pijler="mindset", vormen=["carrousel", "reel"], haak=haak, titel=l["title"].split("·", 1)[1].strip(),
        punten=[p for p in l["key_points"] if not p.startswith("Lezen:")][:4], afsluiter="Dit is één van de twaalf sessies van de 90 Dagen Challenge.",
        moment="in de weken voor de start van een nieuwe ronde",
        let_op="Betaalde inhoud: deel het model, niet de hele sessie of de opdracht.",
        bron=dict(les=l["title"], vimeo_id=l.get("vimeo_id", ""), minuten=l.get("duration_min"), transcript=bool(l.get("transcript"))))

# ---------------------------------------------------------------------------
# 3. De 15 tips: een reeks van korte posts of stories.
# ---------------------------------------------------------------------------
def eerste_zinnen(tekst, n=2, titel=""):
    tekst = re.sub(r"\s+", " ", tekst).strip()
    # Mailresten weghalen: aanhef, "Tip nummer 3:" en de herhaalde titel.
    tekst = re.sub(r"^(Hoi|Hey|Hallo)\b[ ,!]*", "", tekst)
    tekst = re.sub(r"^Tip nummer \d+\s*:?\s*", "", tekst)
    for kop in (titel, "Kies voor een verantwoord tussendoortje", "Houd rekening met de grootte van je bord en je bestek",
                "Eet tot 80%", "Maak afspraken met jezelf om te gaan sporten", "Eet voedingsmiddelen die je TEF verhogen"):
        if kop and tekst.lower().startswith(kop.lower()):
            tekst = tekst[len(kop):].lstrip(" :.")
    zinnen = re.split(r"(?<=[.!?])\s+", tekst)
    return " ".join(zinnen[:n])


for l in sorted((x for x in lessen if re.match(r"Tip \d+:", x["title"])), key=lambda x: int(re.search(r"\d+", x["title"]).group())):
    nr, tip = re.match(r"Tip (\d+): (.+)", l["title"]).groups()
    add(soort="tip", pijler=l["categories"][0], vormen=["story", "enkele post"], haak=f"Tip {nr} van 15: {tip}.",
        titel=tip[0].upper() + tip[1:], punten=[eerste_zinnen(l["body"], 2, tip)], afsluiter="Bewaar deze tip.",
        let_op="Tekst komt uit de oude mailreeks: lees hem na voor je post.",
        bron=dict(les=l["title"], vimeo_id="", minuten=None, transcript=False))

# ---------------------------------------------------------------------------
# 4. Mythes en veelgestelde vragen: "mythe of feit".
# ---------------------------------------------------------------------------
MYTHES = [
    ("Is het ontbijt de belangrijkste maaltijd van de dag?", "Is het ontbijt echt de belangrijkste maaltijd van de dag?"),
    ("Lokale vetverbranding vs algehele vetverbranding", "Buikspieroefeningen verbranden geen buikvet."),
    ("Mythe - een gewoonte aanleren", "Een gewoonte aanleren duurt 21 dagen. Klopt dat?"),
    ("Heeft warm weer invloed op mijn gewicht?", "Zwaarder op de weegschaal als het warm is? Dit is waarom."),
    ("Intermittent fasting", "Val je sneller af met intermittent fasting?"),
    ("Ketogeen dieet", "Koolhydraten schrappen: werkt het ketogeen dieet beter?"),
    ("Suiker", "Maakt suiker je dik?"),
    ("Vet verbranden waar blijft het?", "Als je vet verliest, waar blijft het dan?"),
    ("Cafeïne", "Helpt koffie voor je training echt?"),
    ("Kennisclip · Na 8 uur eten", "Word je dik van eten na acht uur ’s avonds?"),
    ("Kennisclip · Detoxen", "Detoxen: wat doet het echt?"),
    ("Kennisclip · Cheat meals", "Heb je een cheat meal nodig?"),
    ("Kennisclip · Toning creme", "Smeer je vet weg met een crème?"),
    ("Kennisclip · Creatine", "Creatine: voor wie en waarom?"),
    ("Kennisclip · Vrouwen moeten meer eten", "Veel vrouwen eten te weinig om af te vallen."),
    ("Kennisclip · Te weinig calorieen eten en niet afvallen", "Je eet weinig en valt toch niet af. Hoe kan dat?"),
    ("Kennisclip · Eiwitshakes ja of nee", "Eiwitshakes: nodig of niet?"),
    ("Kennisclip · Hoe snel kan je vet verliezen", "Hoe snel kun je vet verliezen?"),
]
for titel, haak in MYTHES:
    l = by_title.get(titel)
    if not l:
        continue
    clip = titel.startswith("Kennisclip")
    add(soort="mythe", pijler=l["categories"][0], vormen=["reel"] if clip else ["carrousel", "reel"], haak=haak,
        titel=titel.replace("Kennisclip · ", ""), punten=[eerste_zinnen(l["body"], 3)] if l.get("body") else [],
        afsluiter="Stuur dit naar iemand die dit nog gelooft.",
        let_op=("Bestaande korte video uit 2018-2019: check beeldkwaliteit en of de inhoud nog klopt." if clip
                else "Tekst komt uit de oude mailreeks: lees hem na voor je post."),
        bron=dict(les=l["title"], vimeo_id=l.get("vimeo_id", ""), minuten=l.get("duration_min"), transcript=bool(l.get("transcript"))))

# ---------------------------------------------------------------------------
# 5. Zelftests ("kies 1-4"): de vorm die bij Jeroen het vaakst gedeeld wordt.
#    Toegevoegd na de Instagram-cijfers van 18-11-2026; achteraan, zodat bestaande id's gelijk blijven.
# ---------------------------------------------------------------------------
ZELFTEST = [
    ("mindset", "Welke belofte maak jij het vaakst? Kies 1, 2, 3 of 4.",
     ["1. Krachtig: je komt hem 100% na", "2. Zwak: 50%, afhankelijk van hoe je je voelt",
      "3. Crimineel: je weet al dat je hem breekt voordat je hem maakt", "4. Geen belofte"],
     "Reageer met je cijfer. Wees eerlijk.", "c90-s7"),
    ("mindset", "In welke wereld leef jij nu? Kies 1, 2 of 3.",
     ["1. Cirkel: je begint elke maandag opnieuw", "2. Zigzag: twee weken goed, dan weer terug",
      "3. Straight line: je doet wat nodig is, ook als het schuurt"],
     "Reageer met je cijfer en met het gebied waar het over gaat.", "c90-s1"),
    ("voeding", "Op welke trede laat jij je resultaat liggen? Kies 1 tot 5.",
     ["1. Calorietekort: je houdt je voeding niet bij", "2. Slaap: minder dan 7,5 uur", "3. Eiwit: je haalt het niet",
      "4. Beweging buiten het sporten", "5. Training"],
     "De meeste mensen beginnen bij 5. Begin bij 1.", "bibw-1194690043"),
    ("herstel", "Hoeveel van deze oranje lichten herken jij deze week? 0 tot 4.",
     ["Je voelt je opgejaagd", "Je hoofd staat vol", "Geïrriteerd zonder reden", "In slaap vallen op de bank"],
     "Reageer met je aantal. Bij 3 of 4: wat schuif je al weken voor je uit?", "c90-s9"),
    ("mindset", "Wat zei jij deze week? Kies 1 of 2.",
     ["1. ‘Ik had geen tijd’", "2. ‘Ik maakte er geen prioriteit van’"],
     "Zelfde week, andere zin. Welke geeft jou de controle terug?", "bibw-1182532274"),
    ("mindset", "Powerful of not powerful? Tel hoeveel je er deze week deed.",
     ["Erover nadenken", "Googelen en uitzoeken", "Erover praten", "Er een nachtje over slapen", "Het doen"],
     "Alleen de laatste telt.", "bibw-1211313888"),
    ("mindset", "Hoeveel procent dark side ben jij? Kies 1, 2 of 3.",
     ["1. 70% dark side: gedreven, confronterend, doelgericht", "2. 50/50", "3. 70% light side: geduldig, zorgzaam, kalm"],
     "Geen van drie is fout. Past het bij wat je wilt bereiken?", "c90-s11"),
    ("gewoontes", "Het weekend: welke ben jij? Kies 1, 2 of 3.",
     ["1. Ik houd het bij, ook op zaterdag", "2. Vrijdagavond laat ik het los", "3. Maandag begin ik weer opnieuw"],
     "Het weekend telt even hard mee als maandag.", "c90-s7"),
]
for pijler, haak, punten, afsluiter, ref in ZELFTEST:
    l = next(x for x in lessen if x["ref"] == ref)
    add(soort="zelftest", pijler=pijler, vormen=["reel", "carrousel"], haak=haak, titel=haak.split("?")[0] + "?", punten=punten,
        afsluiter=afsluiter, bron=dict(les=l["title"], vimeo_id=l.get("vimeo_id", ""), minuten=l.get("duration_min"), transcript=bool(l.get("transcript"))))

# ---------------------------------------------------------------------------
# 6. Klantverhalen zonder naam: bij Jeroen nummer 2 en 5 van de laatste 90 dagen.
#    Gebaseerd op wat deelnemers in de 90 dagen lieten zien; details bewust algemeen gehouden.
# ---------------------------------------------------------------------------
VERHAAL = [
    ("Ze ging van 30% naar 70% van haar acties uitvoeren. Niet door harder te werken.",
     ["Ze stopte met beschrijven wat er misging", "Ze begon te verklaren waaróm het misging", "En paste daarna één ding in haar gedrag aan"],
     "Wat beschrijf jij al weken, zonder het te verklaren?", "c90-s10"),
    ("Hij vroeg nooit om hulp. ‘Zo ben ik nu eenmaal.’",
     ["Alles zelf doen voelde als een eigenschap", "Het was een escape card: een excuus om geen verantwoordelijkheid te nemen",
      "Eén keer hulp vragen veranderde zijn week"],
     "Welke zin gebruik jij om niets te hoeven veranderen?", "c90-s10"),
    ("Ze haalde 68.000 stappen in een week. En toch telde het niet.",
     ["De afspraak was: bewijs insturen vóór de deadline", "Dat lukte niet door haar werk", "Het punt is niet of de regel eerlijk is, maar wat je doet binnen de regels"],
     "Zoek jij een oplossing, of gebruik je de omstandigheid als excuus?", "c90-s9"),
]
for haak, punten, afsluiter, ref in VERHAAL:
    l = next(x for x in lessen if x["ref"] == ref)
    add(soort="klantverhaal", pijler="mindset", vormen=["foto met tekst", "carrousel"], haak=haak, titel=haak, punten=punten, afsluiter=afsluiter,
        let_op="Gebaseerd op een echte deelnemer. Vraag toestemming en laat alles weg waaraan iemand in Volendam hem of haar kan herkennen.",
        bron=dict(les=l["title"], vimeo_id="", minuten=None, transcript=False))

# ---------------------------------------------------------------------------
# 7. Prioriteit op basis van de Instagram-cijfers (bron: Apex Socials, 18-11-2026, laatste 90 dagen).
#    Confronterende posts scoren gemiddeld 52, verkopende 17. Zelftests, klantverhalen zonder naam en
#    "weten versus doen" winnen; aankondigingen, kortingen en reviews met naam verliezen.
# ---------------------------------------------------------------------------
BEWEZEN = ("zwemmen lezen", "Niemand maakt", "geen tijd", "bezig zijn", "niemand kijkt", "commitment", "soorten beloftes",
           "weekend verlies", "Stop eerst", "ik koos", "pleaser", "elke maandag opnieuw", "Wie moet jij zijn")
for i in ITEMS:
    if i["soort"] in ("zelftest", "klantverhaal"):
        i["prioriteit"], i["waarom"] = 1, ("Zelftests worden bij jou het vaakst gedeeld (beste reel van het jaar: 977 keer)."
                                         if i["soort"] == "zelftest" else "Klantverhalen zonder naam staan op plek 2 en 5 van je laatste 90 dagen.")
    elif any(b in i["haak"] for b in BEWEZEN):
        i["prioriteit"], i["waarom"] = 1, "Confronterend en over weten versus doen: dit soort posts scoort bij jou gemiddeld 52 (normaal is 50, verkopend 17)."
    elif i["soort"] in ("video", "model"):
        i["prioriteit"], i["waarom"] = 2, "Past bij je pijlers; het onderwerp voeding en weekend scoorde bij jou net onder normaal (47)."
    else:
        i["prioriteit"], i["waarom"] = 3, "Uitleg en tips: hiervan staan geen posts in je top 10. Test er twee of drie voordat je er een reeks van maakt."
    if i["soort"] == "model":
        # Verkopende afsluiters verliezen (score 17): eindig met een vraag, niet met het aanbod.
        i["afsluiter"] = "Herken je dit? Reageer met één woord."
    i["plaatsen"] = "donderdag of vrijdag vóór 14:00" if i["prioriteit"] == 1 else ("dinsdag tot en met vrijdag, niet op maandag" if i["prioriteit"] == 2 else "als dagelijkse clip of story")

PLAN = [  # hoofdposts: donderdag en vrijdag, tot en met de tweede week van januari
    ("do 19-11", "Welke belofte maak jij"), ("vr 20-11", "zwemmen lezen"), ("do 26-11", "30% naar 70%"), ("vr 27-11", "In welke wereld"),
    ("do 3-12", "geen tijd’ klopt niet"), ("vr 4-12", "Het weekend: welke ben jij"), ("do 10-12", "Feestje dit weekend"),
    ("vr 11-12", "Op welke trede"), ("do 17-12", "Dertig mixdrankjes"), ("vr 18-12", "oranje lichten herken"),
    ("do 24-12", None), ("vr 1-1", "vier dagen erna"), ("do 7-1", "Stop eerst hiermee"), ("vr 8-1", "drie soorten beloftes"),
]

out = dict(versie=2, uitleg="Ideeën voor social media uit de bibliotheek van de Apex leeromgeving. vimeo_id verwijst naar de video in het "
           "Vimeo-account van Apex; transcript = er is een doorzoekbaar transcript in content/leeromgeving-seed.json. "
           "prioriteit 1 = past het best bij wat op Jeroens Instagram werkt (cijfers Apex Socials, 18-11-2026); id's blijven gelijk, nieuwe items komen achteraan.",
           plan=[dict(dag=d, id=next((i["id"] for i in ITEMS if h and h in i["haak"]), None),
                      haak=next((i["haak"] for i in ITEMS if h and h in i["haak"]), "Persoonlijke post, zelf schrijven (je best scorende soort): terugblik op je jaar")) for d, h in PLAN],
           items=ITEMS)
(ROOT / "content" / "contentbank-social.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")

SOORT = {"zelftest": "Zelftests (kies 1-4)", "klantverhaal": "Klantverhalen zonder naam", "video": "Bestaande video's met samenvatting",
         "model": "Modellen uit de 90 Dagen Challenge", "tip": "De 15 tips", "mythe": "Mythes en veelgestelde vragen"}
md = ["# Contentbank voor social media", "",
      "Automatisch gemaakt met `python3 tools/build_contentbank.py` uit de bibliotheek van de leeromgeving. "
      f"**{len(ITEMS)} ideeën**, elk met een haak, kernpunten, de bron en een voorstel voor vorm en moment. "
      "De volledige gegevens (kernpunten en afsluiter per idee) staan in `content/contentbank-social.json`.", "",
      "## Wat bij jouw publiek werkt", "",
      "Bron: de Instagram-cijfers van @_jeroenschilder_ uit Apex Socials (18-11-2026, laatste 90 dagen). "
      "Het gaat om tientallen posts met een bereik rond de duizend, dus het is een richting en geen wet. LinkedIn is nog niet gekoppeld.", "",
      "- **Wint:** confronterende posts (gemiddeld 52, normaal is 50), zelftests met \"kies 1-4\", klantverhalen zonder naam, persoonlijke momenten, weten versus doen.",
      "- **Verliest:** verkopende posts (gemiddeld 17): aankondigingen, kortingen en reviews met naam.",
      "- **Wanneer:** donderdag of vrijdag vóór 14:00. Maandag is je zwakste dag.",
      "- **Nog weinig gedaan:** een oproep met één woord (\"Reageer met ...\").", "",
      "Daarom staat elk idee op prioriteit 1, 2 of 3, eindigen de 90 dagen-modellen met een vraag in plaats van het aanbod, "
      "en zijn er zelftests en klantverhalen zonder naam bijgekomen.", "",
      "## Voorstel: je hoofdposts tot half januari", "", "| Dag | Haak |", "|---|---|"]
for row in out["plan"]:
    md.append(f"| {row['dag']} | {row['haak']} |")
md.append("")
for soort, kop in SOORT.items():
    rows = sorted((i for i in ITEMS if i["soort"] == soort), key=lambda i: i["prioriteit"])
    md += [f"## {kop} ({len(rows)})", "", "| Prio | Haak | Vorm | Moment | Bron | Let op |", "|---|---|---|---|---|---|"]
    for i in rows:
        bron = i["bron"]["les"] + (f" ({i['bron']['minuten']} min)" if i["bron"].get("minuten") else "")
        md.append(f"| {i['prioriteit']} | {i['haak']} | {', '.join(i['vormen'])} | {i['moment']} | {bron} | {i['let_op']} |")
    md.append("")
(ROOT / "docs" / "07-contentbank-social.md").write_text("\n".join(md))
import collections
print(f"{len(ITEMS)} ideeën:", dict(collections.Counter(i["soort"] for i in ITEMS)), "prio:", dict(collections.Counter(i["prioriteit"] for i in ITEMS)))
for row in out["plan"]:
    print(row["dag"], row["id"], "|", row["haak"][:70])
