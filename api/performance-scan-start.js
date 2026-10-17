// POST /performance-scan/start (rewritten here by vercel.json).
// Mirrors MarketingController::performanceScanStart: the contact details come
// first, so someone who stops halfway is still a lead. Returns the Monday item
// id the results are written to later.

import { isAllowedOrigin, clean, isEmail, mondayCreateLead, nlTime } from './_lib.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ ok: false });
    if (!isAllowedOrigin(req)) return res.status(403).json({ ok: false });

    const b = req.body || {};
    const name = clean(b.name);
    const email = clean(b.email).toLowerCase();
    const phone = clean(b.phone, 50);
    // The phone number is required: at least eight digits, in any notation.
    if (!name || !isEmail(email) || phone.replace(/\D/g, '').length < 8) {
        return res.status(422).json({ ok: false, error: 'invalid' });
    }

    let lead = null;
    try {
        lead = await mondayCreateLead({ name, email, phone, source: clean(b.bron, 10) || null, summary: `Scan gestart op ${nlTime()}. Nog niet afgerond.` });
    } catch (error) {
        console.error(error);
    }

    return res.status(200).json({ ok: true, lead });
}
