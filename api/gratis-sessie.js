// POST /gratis-sessie/{id}/inschrijven (rewritten here by vercel.json).
// The static site has no database to count seats, so a signup becomes a lead
// in the Monday group "leads Performance Sessie" (and a tagged contact in
// ActiveCampaign). The visitor is sent back
// to the page with ?ingeschreven=1 (saved) or ?ingeschreven=0 (not saved).

import { isAllowedOrigin, clean, isEmail, mondayCreateLead, activeCampaignConfigured, acSyncContact, acTag, SESSIE_GROUP_ID } from './_lib.js';

const AC_TAG = 'Performance Sessie';

function back(res, saved, fromCheckout) {
    // The checkout page (/gratis-sessie/inschrijven) sends terug=inschrijven and gets its answer back there.
    res.setHeader('Location', fromCheckout
        ? `/gratis-sessie/inschrijven?ingeschreven=${saved ? 1 : 0}`
        : `/gratis-sessie?ingeschreven=${saved ? 1 : 0}#sessies`);
    return res.status(303).end();
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    if (!isAllowedOrigin(req)) return res.status(403).end();

    const b = req.body || {};
    const name = clean(b.name);
    const email = clean(b.email).toLowerCase();
    const phone = clean(b.phone, 50);
    const session = clean(b.sessie) || `sessie #${clean(req.query.id, 20)}`;
    const fromCheckout = clean(b.terug) === 'inschrijven';
    // The phone number is required: at least eight digits, in any notation.
    if (!name || !isEmail(email) || phone.replace(/\D/g, '').length < 8) return back(res, false, fromCheckout);

    const summary = [
        `Inschrijving gratis Performance Sessie: ${session}`,
        phone ? `Telefoon: ${phone}` : null,
    ].filter(Boolean).join('\n');

    let saved = false;
    try {
        saved = await mondayCreateLead({ name, email, phone, summary, groupId: SESSIE_GROUP_ID });
    } catch (error) {
        console.error(error);
    }

    if (activeCampaignConfigured()) {
        try {
            const contactId = await acSyncContact({ email, name, phone });
            await acTag(contactId, AC_TAG);
        } catch (error) {
            console.error(error);
        }
    }

    return back(res, saved, fromCheckout);
}
