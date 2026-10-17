// GET /api/scan-kaart?s=64&d=68-51-67&h=60-52-49-71-63&lk=structuur&ld=fysiek&j=wolf&o=orka
// GET /api/scan-kaart?type=profiel&j=wolf&o=orka
// Draws the score card of the Performance Scan, or the Apex Predator banner,
// as a picture for the results e-mail: e-mail programs cannot draw the ring
// and the bars, and ActiveCampaign cannot store the animal emoji. The link
// only holds grades (times ten) and keys, never a name or e-mail address.

import { ImageResponse } from '@vercel/og';

const LEVERS = { focus: 'Focus', energie: 'Energie', structuur: 'Structuur', besluit: 'Besluitvaardigheid', leiderschap: 'Leiderschap & Integriteit' };
const DOMAINS = { werk: 'Werk', prive: 'Privé', fysiek: 'Fysiek' };
const ANIMALS = {
    adelaar: ['🦅', 'Adelaar'], haai: ['🦈', 'Haai'], krokodil: ['🐊', 'Krokodil'],
    tijger: ['🐯', 'Tijger'], beer: ['🐻', 'Beer'], olifant: ['🐘', 'Olifant'],
    leeuw: ['🦁', 'Leeuw'], orka: ['🐋', 'Orka'], wolf: ['🐺', 'Wolf'],
};

const GOLD = '#D4A574';
const DIM = '#9fb3d1';
const LINE = 'rgba(255,255,255,0.14)';
const color = (g) => (g >= 8.5 ? '#10B981' : g >= 5.5 ? GOLD : '#FB923C');
const nl = (g) => g.toFixed(1).replace('.', ',');

function tenths(value) {
    const n = Number(value);
    return Number.isInteger(n) && n >= 10 && n <= 100 ? n / 10 : null;
}
function grades(value, length) {
    const list = String(value || '').split('-').map(tenths);
    return list.length === length && !list.includes(null) ? list : null;
}

// Fonts of the website, fetched once per warm instance. Without them the
// card falls back to the built-in font.
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ÉéëïöüÖÜ&·:,.-()/ ';
let fontsPromise;
async function googleFont(family, weight) {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(CHARS)}`)).text();
    const url = (css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/) || [])[1];
    if (!url) throw new Error(`Lettertype ${family} niet gevonden`);
    return (await fetch(url)).arrayBuffer();
}
function loadFonts() {
    fontsPromise ??= Promise.all([googleFont('Open+Sans', 400), googleFont('Open+Sans', 700), googleFont('Oswald', 700)])
        .then(([regular, bold, oswald]) => [
            { name: 'Open Sans', data: regular, weight: 400, style: 'normal' },
            { name: 'Open Sans', data: bold, weight: 700, style: 'normal' },
            { name: 'Oswald', data: oswald, weight: 700, style: 'normal' },
        ])
        .catch((error) => {
            console.error(error);
            fontsPromise = undefined;
            return null;
        });
    return fontsPromise;
}

// Plain objects in the shape of React elements, which ImageResponse accepts.
function box(style, ...children) {
    return { type: 'div', props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children } };
}

function ring(grade) {
    const r = 120;
    const c = 2 * Math.PI * r;
    const target = 0.85 * 2 * Math.PI;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">'
        + '<g transform="rotate(-90 150 150)">'
        + `<circle cx="150" cy="150" r="${r}" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="24"/>`
        + `<circle cx="150" cy="150" r="${r}" fill="none" stroke="${color(grade)}" stroke-width="24" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - grade / 10)).toFixed(1)}"/>`
        + `<circle cx="${(150 + r * Math.cos(target)).toFixed(1)}" cy="${(150 + r * Math.sin(target)).toFixed(1)}" r="8" fill="#ffffff"/>`
        + '</g></svg>';
    return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

function card({ s, d, h, lk, ld, j, o }, fonts) {
    const body = fonts ? { fontFamily: 'Open Sans' } : {};
    const numbers = fonts ? { fontFamily: 'Oswald' } : {};
    const [jEmoji, jName] = ANIMALS[j];
    const [oEmoji, oName] = ANIMALS[o];
    const profile = j === o ? `Een pure ${jEmoji} ${jName}` : `${jEmoji} ${jName} met ${oEmoji} ${oName}-trekken`;

    return box({ width: '100%', height: '100%', flexDirection: 'column', padding: '56px 64px', color: '#ffffff', ...body,
        backgroundImage: 'linear-gradient(155deg, #1B3A6B 0%, #14294f 55%, #0d1c38 100%)' },
        box({ justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, letterSpacing: 4 },
            box({ color: GOLD, fontSize: 22 }, 'JE PERFORMANCE PROFIEL'),
            box({ color: DIM, fontSize: 16 }, 'APEX ONLINE COACHING')),

        box({ marginTop: 40, alignItems: 'center' },
            box({ position: 'relative', width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
                { type: 'img', props: { src: ring(s), width: 300, height: 300, style: { position: 'absolute', top: 0, left: 0 } } },
                box({ flexDirection: 'column', alignItems: 'center' },
                    box({ ...numbers, fontSize: 96, fontWeight: 700, lineHeight: 1, color: color(s) }, nl(s)),
                    box({ fontSize: 20, color: DIM, marginTop: 8 }, 'van de 10'))),
            box({ flexDirection: 'column', flexGrow: 1, marginLeft: 48 },
                box({ fontSize: 20, color: DIM, fontWeight: 700, letterSpacing: 3 }, 'MISSIE VAN APEX: 8,5 OF HOGER'),
                box({ marginTop: 20 }, ...Object.keys(DOMAINS).map((key, i) => box({
                    flexDirection: 'column', alignItems: 'center', flexGrow: 1, flexBasis: 0, marginLeft: i ? 16 : 0,
                    padding: '22px 8px', borderRadius: 20, backgroundColor: 'rgba(13,28,56,0.75)', border: `2px solid ${LINE}` },
                    box({ fontSize: 18, color: DIM, fontWeight: 700, letterSpacing: 2 }, DOMAINS[key].toUpperCase()),
                    box({ ...numbers, fontSize: 60, fontWeight: 700, color: color(d[i]), marginTop: 6 }, nl(d[i]))))))),

        box({ flexDirection: 'column', marginTop: 44 }, ...Object.keys(LEVERS).map((key, i) => box({ flexDirection: 'column', marginTop: i ? 20 : 0 },
            box({ justifyContent: 'space-between', fontSize: 24 },
                box({}, LEVERS[key]),
                box({ fontWeight: 700, color: color(h[i]) }, nl(h[i]))),
            box({ marginTop: 8, height: 12, borderRadius: 6, backgroundColor: LINE },
                box({ width: `${h[i] * 10}%`, height: 12, borderRadius: 6, backgroundColor: color(h[i]) }))))),

        box({ flexDirection: 'column', marginTop: 40, paddingTop: 28, borderTop: '2px solid rgba(212,165,116,0.4)', fontSize: 26 },
            box({}, `Grootste lek: ${LEVERS[lk]} · vooral in ${DOMAINS[ld]}`),
            box({ marginTop: 10, fontWeight: 700, color: GOLD }, profile)));
}

function banner({ j, o }, fonts) {
    const body = fonts ? { fontFamily: 'Open Sans' } : {};
    const title = fonts ? { fontFamily: 'Oswald' } : {};
    const [jEmoji, jName] = ANIMALS[j];
    const [oEmoji, oName] = ANIMALS[o];
    const pure = j === o;

    return box({ width: '100%', height: '100%', alignItems: 'center', padding: '0 56px', color: '#ffffff', ...body,
        backgroundImage: 'linear-gradient(155deg, #1B3A6B 0%, #14294f 55%, #0d1c38 100%)' },
        box({ fontSize: 96 }, pure ? jEmoji : `${jEmoji}${oEmoji}`),
        box({ flexDirection: 'column', marginLeft: 40 },
            box({ color: GOLD, fontSize: 20, fontWeight: 700, letterSpacing: 4 }, 'JOUW APEX PREDATOR'),
            box({ ...title, fontSize: 60, fontWeight: 700, marginTop: 6 }, pure ? `Een pure ${jName}` : `${jName} met ${oName}-trekken`),
            box({ fontSize: 24, color: DIM, marginTop: 6 }, pure ? `Je jaagt én leidt als een ${jName}` : `Je jaagt als een ${jName}, je leidt als een ${oName}`)));
}

async function send(res, element, height) {
    try {
        const fonts = await loadFonts();
        const image = new ImageResponse(element(fonts), { width: 1200, height, emoji: 'twemoji', ...(fonts ? { fonts } : {}) });
        const png = Buffer.from(await image.arrayBuffer());
        res.setHeader('Content-Type', 'image/png');
        // The link fully describes the picture, so it never changes.
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.status(200).send(png);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Afbeelding kon niet worden gemaakt');
    }
}

export default async function handler(req, res) {
    const q = req.query || {};
    if (q.type === 'profiel') {
        const animals = { j: String(q.j || ''), o: String(q.o || '') };
        if (!ANIMALS[animals.j] || !ANIMALS[animals.o]) return res.status(400).send('Ongeldige link');
        return send(res, (fonts) => banner(animals, fonts), 280);
    }

    const data = {
        s: tenths(q.s), d: grades(q.d, 3), h: grades(q.h, 5),
        lk: String(q.lk || ''), ld: String(q.ld || ''), j: String(q.j || ''), o: String(q.o || ''),
    };
    if (data.s === null || !data.d || !data.h || !LEVERS[data.lk] || !DOMAINS[data.ld] || !ANIMALS[data.j] || !ANIMALS[data.o]) {
        return res.status(400).send('Ongeldige link');
    }
    return send(res, (fonts) => card(data, fonts), 1020);
}
