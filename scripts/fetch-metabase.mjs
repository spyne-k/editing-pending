import fs from 'node:fs/promises';

const METABASE_URL = (process.env.METABASE_URL || 'https://metabase.spyne.ai').replace(/\/$/, '');
const QUESTION_ID = process.env.METABASE_QUESTION_ID || '6501';
const username = process.env.METABASE_USERNAME;
const password = process.env.METABASE_PASSWORD;
const apiKey = process.env.METABASE_API_KEY;

if (!apiKey && (!username || !password)) {
  throw new Error('Missing METABASE_USERNAME/METABASE_PASSWORD (or METABASE_API_KEY).');
}

async function request(path, options = {}) {
  const response = await fetch(`${METABASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Metabase ${response.status} ${response.statusText}: ${text.slice(0, 1000)}`);
  }
  try { return JSON.parse(text); }
  catch { return text; }
}

let headers = {};
if (apiKey) {
  headers['X-API-Key'] = apiKey;
} else {
  const session = await request('/api/session', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  if (!session?.id) throw new Error('Metabase login succeeded but no session id was returned.');
  headers['X-Metabase-Session'] = session.id;
}

const result = await request(`/api/card/${QUESTION_ID}/query`, {
  method: 'POST',
  headers,
  body: JSON.stringify({})
});

const data = result?.data || result;
const rows = data?.rows || [];
const cols = data?.cols || [];

const payload = {
  fetchedAt: new Date().toISOString(),
  metabaseUrl: METABASE_URL,
  questionId: QUESTION_ID,
  columns: cols.map((c, i) => ({
    name: c?.name ?? `Column ${i + 1}`,
    displayName: c?.display_name ?? c?.name ?? `Column ${i + 1}`,
    baseType: c?.base_type ?? null
  })),
  rows
};

await fs.writeFile('site/data.json', JSON.stringify(payload, null, 2));
console.log(`Fetched ${rows.length} rows from Metabase question ${QUESTION_ID}.`);
