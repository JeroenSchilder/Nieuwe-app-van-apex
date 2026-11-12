#!/usr/bin/env python3
"""Maakt docs/02-videocatalogus.md uit content/leeromgeving-seed.json."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
seed = json.loads((ROOT / "content" / "leeromgeving-seed.json").read_text())

CAT = {"start": "Start & apps", "doelen": "Doelen stellen", "mindset": "Mindset & motivatie",
       "gewoontes": "Gewoontes & discipline", "voeding": "Voeding", "training": "Training & techniek",
       "mobiliteit": "Mobiliteit & foam rollen", "herstel": "Slaap, stress & herstel",
       "lichaam": "Lichaam & gezondheid", "relaties": "Relaties & omgeving", "tijd": "Tijd & leiderschap"}
PKG = {p["key"]: p["name"] for p in seed["pakketten"]}
ops = {o["ref"]: o for o in seed["opdrachten"]}


def vlink(l):
    if not l.get("vimeo_id"):
        return "—"
    url = f"https://vimeo.com/{l['vimeo_id']}" + (f"/{l['vimeo_hash']}" if l.get("vimeo_hash") else "")
    return f"[{l['vimeo_id']}]({url})"


out = ["# Videocatalogus & indeling", "",
       "Automatisch gemaakt met `python3 tools/build_catalogus.py`. ⚠️ = nog controleren "
       "(video of tekst moet je even nalopen in Beheer → Lessen & opdrachten → 'Alleen nog controleren').", ""]
lessen = seed["lessen"]
out.append(f"**Totaal:** {len(seed['trajecten'])} leerlijnen · {len(lessen)} lessen · "
           f"{sum(1 for l in lessen if l['vimeo_id'])} met Vimeo-video · {len(seed['opdrachten'])} invulbare opdrachten · "
           f"{sum(1 for l in lessen if l['needs_review'])} nog te controleren.")
out.append("")
out.append("## Wie ziet wat")
out.append("")
out.append("| Leerlijn | " + " | ".join(PKG[k] for k in PKG if k != "alles") + " |")
out.append("|---|" + "---|" * (len(PKG) - 1))
for t in seed["trajecten"]:
    cells = ["✅" if k in t["access_packages"] else "—" for k in PKG if k != "alles"]
    out.append(f"| {t['title']}{'' if t['published'] else ' *(nog niet gepubliceerd)*'} | " + " | ".join(cells) + " |")
out.append("")
out.append("Binnen Fase 1 zijn stap 3 en 4 (voedingsschema en Vytal) alleen zichtbaar voor pakketten met voeding. "
           "Small Group zonder coaching ziet dus 7 stappen, de andere pakketten 9.")
out.append("")

for t in seed["trajecten"]:
    mods = [m for m in seed["modules"] if m["track_key"] == t["key"]]
    out.append(f"## {t['title']}")
    out.append("")
    if t.get("description"):
        out.append(t["description"])
        out.append("")
    if t["type"] == "bibliotheek":
        for m in mods:
            ls = sorted([l for l in lessen if l["module_ref"] == m["ref"]], key=lambda l: l["order"])
            if not ls:
                continue
            out.append(f"### {m['title']} ({len(ls)})")
            out.append("")
            out.append("| Onderwerp | Video | Thema's | Bron |")
            out.append("|---|---|---|---|")
            for l in ls:
                out.append(f"| {l['title']} | {vlink(l)} | {', '.join(CAT.get(c, c) for c in l['categories'])} | {l.get('source', '')} |")
            out.append("")
        continue
    out.append("| Week/stap | Les | Video | Opdracht | Thema's |")
    out.append("|---|---|---|---|---|")
    for m in mods:
        for l in sorted([l for l in lessen if l["module_ref"] == m["ref"]], key=lambda l: l["order"]):
            op = ops.get(l.get("assignment_ref"))
            opt = f"{op['title']} ({len([f for f in op['fields'] if f['type'] != 'info'])} vragen)" if op else "—"
            label = l.get("step_label") or m["title"]
            only = "" if set(l["access_packages"]) >= set(t["access_packages"]) else " *(alleen " + ", ".join(PKG[p] for p in l["access_packages"] if p != "alles") + ")*"
            out.append(f"| {label} | {l['title']}{only}{' ⚠️' if l['needs_review'] else ''} | {vlink(l)} | {opt} | "
                       f"{', '.join(CAT.get(c, c) for c in l['categories'])} |")
    out.append("")

(ROOT / "docs" / "02-videocatalogus.md").write_text("\n".join(out) + "\n")
print("docs/02-videocatalogus.md geschreven")
