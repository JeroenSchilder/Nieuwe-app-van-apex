// Shared helpers for the Vercel functions that stand in for the Laravel form
// endpoints while the website runs as a static copy. Files starting with "_"
// are not exposed as functions themselves.
//
// Secrets come from the project's Environment Variables in Vercel:
//   MONDAY_API_TOKEN, ACTIVECAMPAIGN_API_URL, ACTIVECAMPAIGN_API_KEY

const MONDAY_API_URL = 'https://api.monday.com/v2';

// Pasted values often carry a stray space or newline; a newline in a header
// makes fetch() throw before the request is even sent.
function secret(name) {
    return (process.env[name] || '').trim();
}
const LEADS_BOARD_ID = process.env.MONDAY_LEADS_BOARD_ID || '1774941078';
const LEADS_GROUP_ID = process.env.MONDAY_PERFORMANCE_SCAN_GROUP_ID || 'group_mm6qpbar';
export const SESSIE_GROUP_ID = process.env.MONDAY_PERFORMANCE_SESSIE_GROUP_ID || 'group_mm7rb823';

const ALLOWED_HOSTS = [/\.vercel\.app$/, /(^|\.)apexonlinecoaching\.nl$/, /^localhost(:\d+)?$/, /^127\.0\.0\.1(:\d+)?$/];

// Browsers always send Origin on POST; requests without it (scripts, bots)
// or from other sites are refused.
export function isAllowedOrigin(req) {
    const origin = req.headers.origin || req.headers.referer;
    if (!origin) return false;
    try {
        const host = new URL(origin).host;
        return ALLOWED_HOSTS.some((pattern) => pattern.test(host));
    } catch {
        return false;
    }
}

export function clean(value, max = 255) {
    return typeof value === 'string' || typeof value === 'number' ? String(value).trim().slice(0, max) : '';
}

export function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 255;
}

function splitName(name) {
    const [firstName, ...rest] = name.split(/\s+/);
    return { firstName, lastName: rest.join(' ') };
}

async function fetchWithTimeout(url, options = {}, ms = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

// ---------------------------------------------------------------- Monday

// Same board, group and columns as App\Services\MondayService in the app.
const EMAIL_COLUMN = 'e_mail_mkm5g1fq';
const SCORE_COLUMN = 'numeric_mm6q5qbs';
const SUMMARY_COLUMN = 'long_text_mm6q99p5';
// The board has two Telefoon columns; the text one is the one in use.
const PHONE_COLUMN = 'text_mknfevc8';
const SOURCE_COLUMN = 'color_mm808y9y';

// The short codes in campaign links (?r=a1) and the label each one sets in the
// Bron column. Kept the same as MondayService::LEAD_SOURCES.
const LEAD_SOURCES = { a1: 'Instagram', a2: 'Facebook', a3: 'LinkedIn', a4: 'Google', a5: 'Website', a6: 'Doorverwijzing', a7: 'Talk/workshop', a8: 'Partner' };
// Monday refuses longer texts in a long text column.
const SUMMARY_LIMIT = 2000;

function limit(text) {
    const chars = Array.from(String(text || ''));
    return chars.length > SUMMARY_LIMIT ? chars.slice(0, SUMMARY_LIMIT - 1).join('') + '…' : chars.join('');
}

// Posts a text as an update on the item, e.g. every answer of the scan, which
// does not fit in the summary column. A failure here never loses the lead.
async function mondayAddUpdate(itemId, text) {
    const body = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    try {
        await monday(
            `mutation ($itemId: ID!, $body: String!) { create_update(item_id: $itemId, body: $body) { id } }`,
            { itemId: String(itemId), body },
        );
    } catch (error) {
        console.error(error);
    }
}

async function monday(query, variables) {
    const response = await fetchWithTimeout(MONDAY_API_URL, {
        method: 'POST',
        headers: { Authorization: secret('MONDAY_API_TOKEN'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.errors) {
        throw new Error(`Monday mislukt: ${response.status} ${JSON.stringify(body.errors || body).slice(0, 300)}`);
    }
    return body.data || {};
}

// Returns the id of the new item, or null when Monday is not configured.
export async function mondayCreateLead({ name, email, score = null, summary, phone = '', answers = '', source, groupId = LEADS_GROUP_ID }) {
    if (!secret('MONDAY_API_TOKEN')) {
        console.warn('MONDAY_API_TOKEN ontbreekt: lead niet naar Monday gestuurd.');
        return null;
    }

    const columnValues = {
        [EMAIL_COLUMN]: { email, text: email },
        status: { label: 'Nieuwe Lead' },
        [SUMMARY_COLUMN]: { text: limit(summary) },
    };
    if (score !== null) columnValues[SCORE_COLUMN] = String(score);
    if (phone) columnValues[PHONE_COLUMN] = phone;
    // Only the scan passes a source (null when unknown, which counts as Website).
    if (source !== undefined) columnValues[SOURCE_COLUMN] = { label: LEAD_SOURCES[source] || 'Website' };

    const data = await monday(
        `mutation ($boardId: ID!, $groupId: String, $itemName: String!, $columnValues: JSON!) {
            create_item(board_id: $boardId, group_id: $groupId, item_name: $itemName, column_values: $columnValues) { id }
        }`,
        { boardId: LEADS_BOARD_ID, groupId, itemName: name, columnValues: JSON.stringify(columnValues) },
    );
    const id = data.create_item ? String(data.create_item.id) : null;
    if (id && answers) await mondayAddUpdate(id, answers);
    return id;
}

// Updates a lead made by mondayCreateLead(). Only items of the scan group that
// are less than 24 hours old can be changed, so a visitor cannot touch any
// other item; with onlyIfUnscored a lead with results is left alone.
export async function mondayUpdateLead(itemId, { score = null, summary, phone = '', answers = '' }, { onlyIfUnscored = false } = {}) {
    if (!secret('MONDAY_API_TOKEN') || !/^\d{1,20}$/.test(String(itemId || ''))) return false;

    const data = await monday(
        `query ($ids: [ID!]) { items(ids: $ids) { id created_at board { id } group { id } column_values(ids: ["${SCORE_COLUMN}"]) { text } } }`,
        { ids: [String(itemId)] },
    );
    const item = (data.items || [])[0];
    const ageMs = item ? Date.now() - Date.parse(item.created_at) : Infinity;
    const scored = item && item.column_values[0] && String(item.column_values[0].text || '').trim() !== '';
    if (!item || String(item.board.id) !== String(LEADS_BOARD_ID) || item.group.id !== LEADS_GROUP_ID
        || ageMs > 24 * 60 * 60 * 1000 || (onlyIfUnscored && scored)) {
        return false;
    }

    const columnValues = { [SUMMARY_COLUMN]: { text: limit(summary) } };
    if (score !== null) columnValues[SCORE_COLUMN] = String(score);
    if (phone) columnValues[PHONE_COLUMN] = phone;

    const result = await monday(
        `mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
            change_multiple_column_values(board_id: $boardId, item_id: $itemId, column_values: $columnValues) { id }
        }`,
        { boardId: LEADS_BOARD_ID, itemId: String(itemId), columnValues: JSON.stringify(columnValues) },
    );
    const updated = Boolean(result.change_multiple_column_values);
    if (updated && answers) await mondayAddUpdate(itemId, answers);
    return updated;
}

// Dutch date and time for texts shown in Monday.
export function nlTime(date = new Date()) {
    return date.toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
}

// Read-only: is the token valid, and do the leads board and group exist?
// Shape of the stored value, never the value itself.
export function mondayTokenShape() {
    const raw = process.env.MONDAY_API_TOKEN || '';
    return {
        length: raw.trim().length,
        hadSurroundingWhitespace: raw !== raw.trim(),
        looksLikeMondayToken: /^[\w-]+\.[\w-]+\.[\w-]+$/.test(raw.trim()),
    };
}

// Shape of the stored ActiveCampaign values, never the values themselves.
export function activeCampaignShape() {
    const url = secret('ACTIVECAMPAIGN_API_URL');
    const key = secret('ACTIVECAMPAIGN_API_KEY');
    return {
        urlLooksRight: /^https:\/\/[\w-]+\.api-us\d+\.com\/?$/.test(url),
        keyLength: key.length,
        keyIsHex: /^[0-9a-f]+$/i.test(key),
    };
}

export async function mondayStatus() {
    const token = secret('MONDAY_API_TOKEN');
    if (!token) return { configured: false };
    const response = await fetchWithTimeout(MONDAY_API_URL, {
        method: 'POST',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `query { boards(ids: [${Number(LEADS_BOARD_ID)}]) { id groups { id } } }` }),
    });
    const body = await response.json().catch(() => ({}));
    const board = body.data && body.data.boards && body.data.boards[0];
    return {
        configured: true,
        tokenWorks: response.ok && !body.errors,
        httpStatus: response.status,
        leadsBoard: Boolean(board),
        leadsGroup: Boolean(board && board.groups.some((g) => g.id === LEADS_GROUP_ID)),
        sessieGroup: Boolean(board && board.groups.some((g) => g.id === SESSIE_GROUP_ID)),
    };
}

// ---------------------------------------------------------- ActiveCampaign

export function activeCampaignConfigured() {
    return Boolean(secret('ACTIVECAMPAIGN_API_URL') && secret('ACTIVECAMPAIGN_API_KEY'));
}

// ActiveCampaign now and then answers 429 or a 5xx page, or takes longer than
// the timeout. Every call made here is safe to repeat (sync, subscribe, tag,
// lookups), so those cases are retried twice with a short pause.
async function ac(path, { method = 'GET', body } = {}) {
    const base = secret('ACTIVECAMPAIGN_API_URL').replace(/\/+$/, '');
    let response;
    let lastError;
    for (const pause of [0, 500, 1500]) {
        if (pause) await new Promise((resolve) => setTimeout(resolve, pause));
        try {
            response = await fetchWithTimeout(`${base}/api/3/${path}`, {
                method,
                headers: { 'Api-Token': secret('ACTIVECAMPAIGN_API_KEY'), 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined,
            });
        } catch (error) {
            if (error.name !== 'AbortError') throw error;
            lastError = error;
            response = null;
            continue;
        }
        if (response.status !== 429 && response.status < 500) break;
    }
    if (!response) throw lastError;
    if (!response.ok) {
        const text = await response.text();
        const title = (text.match(/<title>([^<]*)<\/title>/i) || [])[1];
        throw new Error(`ActiveCampaign ${method} ${path} mislukt: ${response.status} ${(title || text).slice(0, 200)}`);
    }
    return response.status === 204 ? {} : response.json();
}

// Lookups are cached for a few minutes per warm function instance, so a list,
// tag or field added in ActiveCampaign is picked up without a redeploy.
// Nothing is ever created from here: a missing one is simply skipped.
const CACHE_MS = 5 * 60 * 1000;
let cache = {};
let cachedAt = 0;
function freshCache() {
    if (Date.now() - cachedAt > CACHE_MS) {
        cache = {};
        cachedAt = Date.now();
    }
    return cache;
}

async function fieldIdsByPersTag() {
    const cache = freshCache();
    if (!cache.fields) {
        const { fields = [] } = await ac('fields?limit=100');
        cache.fields = Object.fromEntries(fields.map((f) => [String(f.perstag).toUpperCase(), f.id]));
    }
    return cache.fields;
}

export async function listIdByName(name) {
    const cache = freshCache();
    cache.lists ??= (await ac('lists?limit=100')).lists || [];
    const list = cache.lists.find((l) => l.name.toLowerCase() === name.toLowerCase());
    return list ? list.id : null;
}

async function tagIdByName(name) {
    const cache = freshCache();
    cache.tags ??= {};
    if (!(name in cache.tags)) {
        const { tags = [] } = await ac(`tags?search=${encodeURIComponent(name)}`);
        const tag = tags.find((t) => t.tag.toLowerCase() === name.toLowerCase());
        cache.tags[name] = tag ? tag.id : null;
    }
    return cache.tags[name];
}

// Read-only: which of the lists, tags and fields the functions use exist.
export async function activeCampaignStatus({ lists = [], tags = [], fields = [] }) {
    if (!activeCampaignConfigured()) return { configured: false };
    const ids = await fieldIdsByPersTag();
    const listIds = (await ac('lists?limit=100')).lists || [];
    const result = { configured: true, keyWorks: true, lists: {}, tags: {}, fields: {} };
    for (const name of lists) {
        result.lists[name] = listIds.some((l) => l.name.toLowerCase() === name.toLowerCase() || String(l.id) === String(name));
    }
    for (const name of tags) result.tags[name] = Boolean(await tagIdByName(name));
    for (const persTag of fields) result.fields[persTag] = Boolean(ids[persTag]);
    return result;
}

// Create or update the contact, filling only custom fields that exist.
// Empty values are left out so they never wipe what ActiveCampaign knows,
// except for the fields in allowEmpty: those are cleared, so a value from an
// earlier scan never ends up in a new e-mail.
export async function acSyncContact({ email, name, phone, fields = {}, allowEmpty = [] }) {
    const ids = await fieldIdsByPersTag();
    const isEmpty = (value) => value === null || value === undefined || value === '';
    const fieldValues = Object.entries(fields)
        .filter(([persTag, value]) => ids[persTag] && (!isEmpty(value) || allowEmpty.includes(persTag)))
        .map(([persTag, value]) => ({ field: ids[persTag], value: isEmpty(value) ? '' : String(value) }));

    const contact = { email, fieldValues };
    if (name) Object.assign(contact, splitName(name));
    if (phone) contact.phone = phone;

    const { contact: synced } = await ac('contact/sync', { method: 'POST', body: { contact } });
    return synced.id;
}

export async function acSubscribe(contactId, listId) {
    if (!listId) return false;
    await ac('contactLists', { method: 'POST', body: { contactList: { list: listId, contact: contactId, status: 1 } } });
    return true;
}

// Adds the tag; with retrigger the tag is removed first, so an automation
// that starts on "tag added" also runs for someone doing the scan again.
export async function acTag(contactId, tagName, { retrigger = false } = {}) {
    const tagId = await tagIdByName(tagName);
    if (!tagId) {
        console.warn(`Tag "${tagName}" bestaat niet in ActiveCampaign; overgeslagen.`);
        return false;
    }
    if (retrigger) {
        const { contactTags = [] } = await ac(`contacts/${contactId}/contactTags`);
        for (const ct of contactTags.filter((ct) => String(ct.tag) === String(tagId))) {
            await ac(`contactTags/${ct.id}`, { method: 'DELETE' });
        }
    }
    await ac('contactTags', { method: 'POST', body: { contactTag: { contact: contactId, tag: tagId } } });
    return true;
}

