import test from 'node:test';
import assert from 'node:assert/strict';
import { getJson } from '../src/services/request.js';

test('loads a property list and preserves an actually empty list', async t => {
  const properties = [{ id: 'property-1', status: 'Approved' }];
  const responses = [properties, []];
  t.mock.method(globalThis, 'fetch', async () => Response.json(responses.shift()));
  assert.deepEqual(await getJson('/api/properties'), properties);
  assert.deepEqual(await getJson('/api/properties'), []);
});

test('rejects a database error instead of treating it as an empty property list', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Database unavailable' }, { status: 500 }));
  await assert.rejects(getJson('/api/properties'), /Không thể tải dữ liệu/);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('recovers when a temporary gateway failure is followed by a successful response', async t => {
  const responses = [new Response('Service unavailable', { status: 503 }), Response.json([{ id: 'property-1' }])];
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => responses.shift());
  assert.deepEqual(await getJson('/api/properties'), [{ id: 'property-1' }]);
  assert.equal(fetchMock.mock.callCount(), 2);
});

test('network retries are bounded and a failed request remains an error', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(getJson('/api/properties'), /Không thể tải dữ liệu/);
  assert.equal(fetchMock.mock.callCount(), 2);
});

test('rejects an HTML fallback page rather than passing it to the UI as data', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<!doctype html><html></html>'));
  await assert.rejects(getJson('/api/properties'), /Không thể tải dữ liệu/);
});

test('aborts a stalled request instead of leaving the page loading forever', async t => {
  t.mock.method(globalThis, 'fetch', async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }));
  await assert.rejects(getJson('/api/properties', { timeoutMs: 10, retries: 0 }), /Không thể tải dữ liệu/);
});
