import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../api/leads.mjs';

const sample = () => ({ type: 'contact', name: 'Example Visitor', email: 'visitor@example.test', topic: 'Coaching-Anfrage', message: 'Please tell me about coaching.', consent: true, consentAt: new Date().toISOString(), page: 'https://www.gvcoaching.com/?utm_source=test#kontakt' });
const request = (body, headers = {}) => new Request('https://www.gvcoaching.com/api/leads', { method: 'POST', headers: { Origin: 'https://www.gvcoaching.com', 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
const configured = { LEAD_WEBHOOK_URL: 'https://receiver.example.test/lead', LEAD_WEBHOOK_TOKEN: 'test-only-token' };

test('contact is acknowledged only after accepted delivery, without forwarding arbitrary fields or URL queries', async () => {
  let delivered;
  const handle = createHandler({ env: configured, forward: async (url, options) => {
    delivered = { url, options, lead: JSON.parse(options.body) };
    return Response.json({ success: true });
  } });
  const result = await handle(request({ ...sample(), injectedAdmin: true }));
  assert.equal(result.status, 200);
  assert.equal((await result.json()).success, true);
  assert.equal(delivered.lead.contact.email, 'visitor@example.test');
  assert.equal(delivered.lead.page, 'https://www.gvcoaching.com/#kontakt');
  assert.equal(delivered.lead.injectedAdmin, undefined);
  assert.equal(delivered.options.headers.Authorization, 'Bearer test-only-token');
  assert.equal(delivered.options.redirect, 'error');
  assert.ok(delivered.lead.id);
});

test('performance-check answers and nested contact information use the same delivery endpoint', async () => {
  let delivered;
  const handle = createHandler({ env: configured, forward: async (_, options) => { delivered = JSON.parse(options.body); return new Response(null, { status: 204 }); } });
  const person = sample();
  const result = await handle(request({ type: 'performance-check', contact: person, answers: { goal: { question: 'Dein Ziel?', answer: ['Muskelaufbau', 'Mehr Energie'] } }, page: person.page }));
  assert.equal(result.status, 200);
  assert.deepEqual(delivered.answers.goal.answer, ['Muskelaufbau', 'Mehr Energie']);
  assert.equal(delivered.contact.name, person.name);
});

test('missing destination does not pretend the enquiry was delivered', async () => {
  const handle = createHandler({ env: {}, forward: () => assert.fail('Must not send without configuration') });
  const result = await handle(request(sample()));
  assert.equal(result.status, 503);
  assert.equal((await result.json()).success, false);
});

test('invalid email, missing consent and blank contact message are rejected without delivery', async () => {
  const handle = createHandler({ env: configured, forward: () => assert.fail('Invalid enquiry must not be sent') });
  for (const invalid of [{ ...sample(), email: 'invalid' }, { ...sample(), consent: false }, { ...sample(), message: ' ' }]) {
    assert.equal((await handle(request(invalid))).status, 400);
  }
});

test('foreign origins, unsupported methods, non-JSON and oversized payloads are rejected', async () => {
  const handle = createHandler({ env: configured, forward: () => assert.fail('Rejected request must not be sent') });
  assert.equal((await handle(request(sample(), { Origin: 'https://unrelated.example.test' }))).status, 403);
  assert.equal((await handle(new Request('https://www.gvcoaching.com/api/leads'))).status, 405);
  assert.equal((await handle(request(sample(), { 'Content-Type': 'text/plain' }))).status, 415);
  assert.equal((await handle(request({ ...sample(), message: 'x'.repeat(40000) }))).status, 413);
});

test('upstream errors, timeouts and explicit rejected responses never show success', async () => {
  for (const forward of [async () => new Response(null, { status: 500 }), async () => Response.json({ success: false }), async () => { throw new Error('timeout'); }]) {
    const result = await createHandler({ env: configured, forward })(request(sample()));
    assert.equal(result.status, 502);
    assert.equal((await result.json()).success, false);
  }
});

test('honeypot submissions are discarded without contacting the receiver', async () => {
  const handle = createHandler({ env: configured, forward: () => assert.fail('Honeypot must not be sent') });
  assert.equal((await handle(request({ ...sample(), company: 'spam' }))).status, 200);
});

test('insecure webhook URLs and URLs containing credentials are refused', async () => {
  for (const url of ['http://receiver.example.test/lead', 'https://user:password@receiver.example.test/lead']) {
    const handle = createHandler({ env: { LEAD_WEBHOOK_URL: url }, forward: () => assert.fail('Insecure destination must not be used') });
    assert.equal((await handle(request(sample()))).status, 503);
  }
});
