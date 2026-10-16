// POST /performance-scan/voortgang (rewritten here by vercel.json).
// Mirrors MarketingController::performanceScanProgress: where a visitor was
// when they left the scan, shown on their lead until the results replace it.

import { isAllowedOrigin, clean, mondayUpdateLead, nlTime } from './_lib.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ ok: false });
    if (!isAllowedOrigin(req)) return res.status(403).json({ ok: false });

    const b = req.body || {};
    const lead = clean(b.lead, 20);
    const question = Math.round(Number(b.question));
    const total = Math.round(Number(b.total));
    const label = clean(b.label, 200);
    if (!/^\d{1,20}$/.test(lead) || !(question >= 1 && question <= 200) || !(total >= 1 && total <= 200)) {
        return res.status(422).json({ ok: false, error: 'invalid' });
    }

    try {
        await mondayUpdateLead(lead, {
            summary: `Nog niet afgerond: laatst gezien bij vraag ${question} van ${total}${label ? ` (${label})` : ''} op ${nlTime()}.`,
        }, { onlyIfUnscored: true });
    } catch (error) {
        console.error(error);
    }

    return res.status(200).json({ ok: true });
}
