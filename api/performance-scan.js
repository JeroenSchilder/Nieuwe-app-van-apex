// POST /performance-scan/versturen (rewritten here by vercel.json).
// Mirrors MarketingController::performanceScanSubmit: the summary goes on the
// Monday lead with every answer in an update, and the contact plus their
// results go to ActiveCampaign so an automation can e-mail the report. The
// visitor sees their results either way.

import {
    isAllowedOrigin, clean, isEmail, mondayCreateLead, mondayUpdateLead,
    activeCampaignConfigured, acSyncContact, acSubscribe, acTag, listIdByName,
} from './_lib.js';

const AC_LIST = 'Performance Scan';
const AC_TAG = 'Performance Scan';

const LEVERS = ['focus', 'energie', 'structuur', 'besluit', 'leiderschap'];
const DOMAINS = ['werk', 'prive', 'fysiek'];
const ANIMALS = ['adelaar', 'haai', 'krokodil', 'tijger', 'beer', 'olifant', 'leeuw', 'orka', 'wolf'];

// A Dutch grade from 1 to 10 with one decimal, or null.
function grade(value) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 1 && n <= 10 ? Math.round(n * 10) / 10 : null;
}
const nl = (g) => (g === null ? '' : g.toFixed(1).replace('.', ','));
// ActiveCampaign stores emoji as "?", so they are left out of its fields;
// the e-mail shows the animals in pictures instead.
const noEmoji = (text) => text.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s{2,}/g, ' ').trim();
const euro = (n) => '€' + Math.round(Number(n)).toLocaleString('nl-NL');

// Link to the picture of the score card in the results e-mail, drawn by
// /api/scan-kaart from these numbers (grades times ten).
function cardUrl(req, card) {
    if (!card || typeof card !== 'object') return '';
    const tenths = (v) => {
        const n = Math.round(Number(v));
        return n >= 10 && n <= 100 ? n : null;
    };
    const s = tenths(card.s);
    const d = Array.isArray(card.d) ? card.d.map(tenths) : [];
    const h = Array.isArray(card.h) ? card.h.map(tenths) : [];
    if (s === null || d.length !== 3 || h.length !== 5 || [...d, ...h].includes(null)
        || !LEVERS.includes(card.lk) || !DOMAINS.includes(card.ld) || !ANIMALS.includes(card.j) || !ANIMALS.includes(card.o)) {
        return '';
    }
    const params = new URLSearchParams({ s, d: d.join('-'), h: h.join('-'), lk: card.lk, ld: card.ld, j: card.j, o: card.o });
    return `https://${host(req)}/api/scan-kaart?${params}`;
}

function profileUrl(req, card) {
    if (!card || !ANIMALS.includes(card.j) || !ANIMALS.includes(card.o)) return '';
    return `https://${host(req)}/api/scan-kaart?${new URLSearchParams({ type: 'profiel', j: card.j, o: card.o })}`;
}

function host(req) {
    return clean(req.headers['x-forwarded-host'] || req.headers.host, 200);
}

async function syncToActiveCampaign({ req, b, name, email, phone, score, summary, answers }) {
    if (!activeCampaignConfigured()) {
        console.warn('ActiveCampaign is niet ingesteld: geen uitslagmail.');
        return;
    }
    const domains = b.domains && typeof b.domains === 'object' ? b.domains : {};
    const metrics = b.metrics && typeof b.metrics === 'object' ? b.metrics : {};
    const urgency = Math.round(Number(b.urgentie));

    const contactId = await acSyncContact({
        email,
        name,
        phone,
        fields: {
            SCAN_SCORE: nl(score),
            SCAN_WERK: nl(grade(domains.werk)),
            SCAN_PRIVE: nl(grade(domains.prive)),
            SCAN_FYSIEK: nl(grade(domains.fysiek)),
            SCAN_FOCUS: nl(grade(metrics.focus)),
            SCAN_ENERGIE: nl(grade(metrics.energie)),
            SCAN_STRUCTUUR: nl(grade(metrics.structuur)),
            SCAN_BESLUIT: nl(grade(metrics.besluit)),
            SCAN_INTEGRITEIT: nl(grade(metrics.leiderschap)),
            SCAN_LEK: clean(b.lek),
            SCAN_LEK_ZIN: clean(b.lek_zin, 500),
            SCAN_TWEEDE_LEK: clean(b.tweede_lek),
            SCAN_PROFIEL: noEmoji(clean(b.profiel)),
            SCAN_PROFIEL_UITLEG: clean(b.profiel_uitleg, 1000),
            SCAN_JACHTSTIJL: noEmoji(clean(b.jachtstijl)),
            SCAN_LEIDERSCHAP: noEmoji(clean(b.leiderschapsstijl)),
            SCAN_ACTIE: clean(b.action_name),
            SCAN_ACTIE_TEKST: clean(b.action_text, 500),
            SCAN_WIL_VERANDEREN: clean(b.verandering),
            SCAN_OMZET: clean(b.revenue_label),
            // A whole sentence, so the e-mail shows nothing at all when there is no revenue.
            SCAN_KOSTEN: Number(b.cost_monthly) > 0
                ? `Wat dit je naar schatting kost: ${euro(b.cost_monthly)} per maand, ${euro(b.cost_yearly)} per jaar.`
                : '',
            SCAN_URGENTIE: urgency >= 1 && urgency <= 10 ? `${urgency}/10` : '',
            SCAN_KAART: cardUrl(req, b.card),
            SCAN_PROFIEL_KAART: profileUrl(req, b.card),
            SCAN_ANTWOORDEN: `${summary}\n\n${answers}`.trim(),
        },
        // Not every scan has these (employees have no revenue), so they are
        // cleared instead of keeping the value of an earlier scan.
        allowEmpty: ['SCAN_TWEEDE_LEK', 'SCAN_OMZET', 'SCAN_KOSTEN', 'SCAN_URGENTIE', 'SCAN_KAART', 'SCAN_PROFIEL_KAART'],
    });
    await acSubscribe(contactId, await listIdByName(AC_LIST));
    // Last, so the fields are filled before an automation sends the e-mail.
    await acTag(contactId, AC_TAG, { retrigger: true });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ ok: false });
    if (!isAllowedOrigin(req)) return res.status(403).json({ ok: false });

    const b = req.body || {};
    const name = clean(b.name);
    const email = clean(b.email).toLowerCase();
    const score = grade(b.score);
    const summary = clean(b.summary, 5000);
    if (!name || !isEmail(email) || score === null || !summary) {
        return res.status(422).json({ ok: false, error: 'invalid' });
    }

    const phone = clean(b.phone, 50);
    const answers = clean(b.answers_text, 20000);
    const lead = { name, email, phone, score, summary, answers };

    // The lead was created when the scan started; fill in its results.
    // If that fails for any reason, a new lead keeps the results from getting lost.
    const saveToMonday = async () => {
        if (b.lead_id) {
            try {
                if (await mondayUpdateLead(clean(b.lead_id, 20), lead)) return;
            } catch (error) {
                console.error(error);
            }
        }
        await mondayCreateLead({ ...lead, source: clean(b.bron, 10) || null });
    };

    const results = await Promise.allSettled([
        saveToMonday(),
        syncToActiveCampaign({ req, b, name, email, phone, score, summary, answers }),
    ]);
    results.filter((r) => r.status === 'rejected').forEach((r) => console.error(r.reason));

    return res.status(200).json({ ok: true });
}
