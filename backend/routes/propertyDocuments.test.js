const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

test('document endpoint validates auth and uploads, previews PDF without creating a property', async t => {
  const previousKey = env.ai.geminiApiKey;
  env.ai.geminiApiKey = undefined;
  const app = express();
  app.use('/api/properties', require('./propertyDocuments'));
  const server = await new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
  t.after(async () => {
    env.ai.geminiApiKey = previousKey;
    await new Promise(resolve => server.close(resolve));
  });
  const token = role => jwt.sign({ id: 'document-import-test', role }, env.jwtSecret, { expiresIn: '5m' });
  const url = `http://127.0.0.1:${server.address().port}/api/properties/import-document`;
  const request = async (body, role = 'sale') => {
    const response = await fetch(url, { method: 'POST', headers: role ? { Authorization: `Bearer ${token(role)}` } : {}, body });
    return { status: response.status, data: await response.json() };
  };
  const form = (name, content) => {
    const body = new FormData();
    body.append('document', new Blob([content]), name);
    return body;
  };
  assert.equal((await request(new FormData(), null)).status, 401);
  assert.equal((await request(new FormData(), 'user')).status, 403);
  assert.equal((await request(new FormData())).status, 400);
  const pdf = fs.readFileSync(path.join(__dirname, '../services/documents/fixtures/property.pdf'));
  for (const role of ['admin', 'sale']) {
    const result = await request(form('property.pdf', pdf), role);
    assert.equal(result.status, 200);
    assert.equal(result.data.data.property.title, 'Coastal apartment');
    assert.equal(result.data.data.property.area, 68);
    assert.equal(result.data.data.property.status, undefined);
    assert.equal(result.data.data.property.authorId, undefined);
    assert.ok(Array.isArray(result.data.data.missingFields));
  }
  assert.equal((await request(form('wrong.exe', pdf))).status, 400);
  assert.equal((await request(form('corrupt.pdf', 'not a PDF'))).status, 400);
  assert.equal((await request(form('empty.txt', ''))).status, 400);
  const large = await request(form('large.txt', Buffer.alloc(5 * 1024 * 1024 + 1)));
  assert.equal(large.status, 400);
  assert.match(large.data.message, /5MB/);
  const multiple = form('first.txt', 'Giá: 2 tỷ');
  multiple.append('document', new Blob(['Giá: 3 tỷ']), 'second.txt');
  assert.equal((await request(multiple)).status, 400);
});
