// GET /api/status: read-only check that the Monday and ActiveCampaign keys in
// Vercel work and which of the lists, tags and fields the form functions use
// exist. Answers yes/no only, never returns a secret, and changes nothing.

import { mondayStatus, mondayTokenShape, activeCampaignStatus, activeCampaignShape } from './_lib.js';

const NEWSLETTER_LIST_ID = process.env.ACTIVECAMPAIGN_NEWSLETTER_LIST_ID || '6';
const SCAN_FIELDS = [
    'SCAN_SCORE', 'SCAN_WERK', 'SCAN_PRIVE', 'SCAN_FYSIEK',
    'SCAN_FOCUS', 'SCAN_ENERGIE', 'SCAN_STRUCTUUR', 'SCAN_BESLUIT', 'SCAN_INTEGRITEIT',
    'SCAN_LEK', 'SCAN_LEK_ZIN', 'SCAN_TWEEDE_LEK', 'SCAN_PROFIEL', 'SCAN_PROFIEL_UITLEG',
    'SCAN_JACHTSTIJL', 'SCAN_LEIDERSCHAP', 'SCAN_ACTIE', 'SCAN_ACTIE_TEKST', 'SCAN_WIL_VERANDEREN',
    'SCAN_OMZET', 'SCAN_KOSTEN', 'SCAN_URGENTIE', 'SCAN_KAART', 'SCAN_PROFIEL_KAART', 'SCAN_ANTWOORDEN',
];

// Our own errors quote only the API path, status and response body; anything
// else (e.g. fetch rejecting a header) is reduced to its name.
function ownError(reason) {
    if (!reason) return null;
    return /^ActiveCampaign |^Monday /.test(reason.message || '') ? reason.message.slice(0, 300) : reason.name;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ ok: false });

    const [monday, activecampaign] = await Promise.allSettled([
        mondayStatus(),
        activeCampaignStatus({
            lists: ['Performance Scan', NEWSLETTER_LIST_ID],
            tags: ['Performance Scan', 'Performance Sessie'],
            fields: SCAN_FIELDS,
        }),
    ]);

    // Log only the kind of failure: some error messages quote header values.
    if (monday.status === 'rejected') console.error('Monday status check failed:', monday.reason && monday.reason.name);
    if (activecampaign.status === 'rejected') console.error('ActiveCampaign status check failed:', activecampaign.reason && activecampaign.reason.name);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
        monday: monday.status === 'fulfilled'
            ? monday.value
            : { configured: true, tokenWorks: false, failure: monday.reason && monday.reason.name, token: mondayTokenShape() },
        activecampaign: activecampaign.status === 'fulfilled'
            ? activecampaign.value
            : { configured: true, keyWorks: false, failure: ownError(activecampaign.reason), values: activeCampaignShape() },
    });
}
