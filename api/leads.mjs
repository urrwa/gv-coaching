import { randomUUID } from 'node:crypto';

const MAX_BYTES = 32768;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PUBLIC_ORIGINS = ['https://www.gvcoaching.com', 'https://gvcoaching.com', 'https://gv-coaching-rho.vercel.app'];

function reply(status, body, headers = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
}

function field(value, max, required = false) {
  if (value == null && !required) return '';
  if (typeof value !== 'string') throw new Error('invalid_field');
  const text = value.trim();
  if ((required && !text) || text.length > max || /\u0000/.test(text)) throw new Error('invalid_field');
  return text;
}

function validatedLead(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalid_body');
  if (!['contact', 'performance-check'].includes(input.type)) throw new Error('invalid_type');
  const person = input.type === 'performance-check' ? input.contact : input;
  if (!person || typeof person !== 'object' || person.consent !== true) throw new Error('consent_required');
  const contact = { name: field(person.name, 100, true), email: field(person.email, 254, true), phone: field(person.phone, 60), message: field(person.message, 5000) };
  if (!EMAIL.test(contact.email) || /[\r\n]/.test(contact.email)) throw new Error('invalid_email');
  const lead = { type: input.type, contact, consent: true, consentAt: field(person.consentAt || input.consentAt, 64, true), receivedAt: new Date().toISOString() };
  if (!Number.isFinite(Date.parse(lead.consentAt))) throw new Error('invalid_consent_date');
  if (input.type === 'contact') {
    lead.topic = field(input.topic, 100, true);
    if (!contact.message) throw new Error('message_required');
  } else {
    if (!input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers)) throw new Error('answers_required');
    const entries = Object.entries(input.answers);
    if (!entries.length || entries.length > 20) throw new Error('invalid_answers');
    lead.answers = Object.fromEntries(entries.map(([key, item]) => {
      if (!/^[a-zA-Z0-9_-]{1,50}$/.test(key) || ['__proto__', 'constructor', 'prototype'].includes(key) || !item || typeof item !== 'object') throw new Error('invalid_answer');
      const answer = Array.isArray(item.answer) ? item.answer.map(value => field(value, 500, true)) : field(item.answer, 500, true);
      if (Array.isArray(answer) && (!answer.length || answer.length > 10)) throw new Error('invalid_answer');
      return [key, { question: field(item.question, 500, true), answer }];
    }));
  }
  lead.source = field(input.source, 100) || 'website';
  const page = field(input.page, 2048, true);
  const pageUrl = new URL(page);
  if (!['http:', 'https:'].includes(pageUrl.protocol)) throw new Error('invalid_page');
  lead.page = pageUrl.origin + pageUrl.pathname + pageUrl.hash;
  return lead;
}

export function createHandler({ env = process.env, forward = globalThis.fetch } = {}) {
  return async function handle(request) {
    if (request.method !== 'POST') return reply(405, { success: false, error: 'method_not_allowed' }, { Allow: 'POST' });
    const allowed = new Set([...PUBLIC_ORIGINS, new URL(request.url).origin]);
    if (!allowed.has(request.headers.get('origin'))) return reply(403, { success: false, error: 'origin_not_allowed' });
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply(415, { success: false, error: 'json_required' });
    if (Number(request.headers.get('content-length')) > MAX_BYTES) return reply(413, { success: false, error: 'request_too_large' });
    let input, lead;
    try {
      const body = await request.text();
      if (Buffer.byteLength(body, 'utf8') > MAX_BYTES) return reply(413, { success: false, error: 'request_too_large' });
      input = JSON.parse(body);
      if (input?.company || input?.contact?.company) return reply(200, { success: true });
      lead = validatedLead(input);
    } catch {
      return reply(400, { success: false, error: 'invalid_request' });
    }
    let destination;
    try {
      destination = new URL(env.LEAD_WEBHOOK_URL);
      if (destination.protocol !== 'https:' || destination.username || destination.password) throw new Error('invalid_destination');
    } catch {
      return reply(503, { success: false, error: 'delivery_unavailable' });
    }
    const id = randomUUID();
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json', 'X-GV-Submission-Id': id };
    if (env.LEAD_WEBHOOK_TOKEN) headers.Authorization = `Bearer ${env.LEAD_WEBHOOK_TOKEN}`;
    try {
      const response = await forward(destination.href, { method: 'POST', headers, redirect: 'error', body: JSON.stringify({ ...lead, id }), signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('delivery_failed');
      const result = await response.json().catch(() => null);
      if (result?.success === false || result?.success === 'false' || result?.ok === false) throw new Error('delivery_rejected');
      return reply(200, { success: true, id });
    } catch {
      return reply(502, { success: false, error: 'delivery_failed' });
    }
  };
}

export default { fetch: createHandler() };
