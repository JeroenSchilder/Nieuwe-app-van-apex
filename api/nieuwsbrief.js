// POST /nieuwsbrief/inschrijven (rewritten here by vercel.json).
// Mirrors NewsletterController::subscribe: the contact goes on the
// ActiveCampaign Nieuwsbrief list. A failure is reported to the visitor.

import { isAllowedOrigin, clean, isEmail, activeCampaignConfigured, acSyncContact, acSubscribe } from './_lib.js';

const NEWSLETTER_LIST_ID = process.env.ACTIVECAMPAIGN_NEWSLETTER_LIST_ID || '6';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ ok: false });
    if (!isAllowedOrigin(req)) return res.status(403).json({ ok: false });

    const email = clean((req.body || {}).email).toLowerCase();
    if (!isEmail(email)) return res.status(422).json({ ok: false, error: 'invalid' });

    if (!activeCampaignConfigured()) {
        console.warn('ActiveCampaign is niet ingesteld: nieuwsbrief-inschrijving niet opgeslagen.');
        return res.status(503).json({ ok: false });
    }

    try {
        const contactId = await acSyncContact({ email, name: '' });
        await acSubscribe(contactId, NEWSLETTER_LIST_ID);
        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error(error);
        return res.status(502).json({ ok: false });
    }
}
