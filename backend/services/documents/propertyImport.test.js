const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parsePropertyText, extractDocument, importPropertyDocument, MAX_FILE_SIZE } = require('./propertyImport');

const sample = fs.readFileSync(path.join(__dirname, 'fixtures/property.txt'), 'utf8');
const file = (name, text) => ({ originalname: name, buffer: Buffer.isBuffer(text) ? text : Buffer.from(text) });
const fixture = name => file(name, fs.readFileSync(path.join(__dirname, 'fixtures', name)));

test('maps Vietnamese labels, enums and numbers while preserving description sections', () => {
  const { property, warnings } = parsePropertyText(sample);
  assert.equal(property.location, 'Phường Lộc Thọ, Nha Trang, Khánh Hòa');
  assert.equal(property.price, '2,85 tỷ');
  assert.equal(property.area, 68);
  assert.equal(property.beds, 2);
  assert.equal(property.baths, 2);
  assert.equal(property.transactionType, 'sale');
  assert.equal(property.propertyType, 'apartment');
  assert.equal(property.legalStatus, 'pink-book');
  assert.ok(property.description.includes('\n\nTHIẾT KẾ VÀ NỘI THẤT\n- 2 phòng ngủ'));
  assert.equal(warnings.length, 0);
});

test('supports PDF-style labels on separate paragraphs and Markdown table rows', () => {
  const { property } = parsePropertyText('TIÊU ĐỀ\n\nBán đất\nĐỊA CHỈ\n\nNha Trang, Khánh Hòa\n| Giá | 10 tỷ |\n| Diện tích | 1.250,5 m² |\n## Mô tả\n\n### Vị trí\n- Gần biển.');
  assert.equal(property.title, 'Bán đất');
  assert.equal(property.location, 'Nha Trang, Khánh Hòa');
  assert.equal(property.price, '10 tỷ');
  assert.equal(property.area, 1250.5);
  assert.equal(property.description, '### Vị trí\n- Gần biển.');
});

test('preserves rental and per-area price units, converts hectares, accepts zero rooms', () => {
  const { property } = parsePropertyText('Giá: 15 triệu/m²\nDiện tích: 1,5 ha\nPhòng ngủ: 0\nPhòng tắm: 0\nGiao dịch: Cho thuê');
  assert.equal(property.price, '15 triệu/m²');
  assert.equal(property.area, 15000);
  assert.equal(property.beds, 0);
  assert.equal(property.baths, 0);
  assert.equal(property.transactionType, 'rent');
});

test('does not claim missing or negated legal paperwork; rejects invalid numeric facts', () => {
  assert.equal(parsePropertyText('Bán căn hộ 68 m², 2PN, 1WC').property.legalStatus, undefined);
  assert.equal(parsePropertyText('Pháp lý: Chưa có sổ hồng').property.legalStatus, 'unknown');
  const { property, warnings } = parsePropertyText('Diện tích: -10\nPhòng ngủ: 2,5\nPhòng tắm: -1');
  assert.equal(property.area, undefined);
  assert.equal(property.beds, undefined);
  assert.equal(property.baths, undefined);
  assert.equal(warnings.length, 3);
});

test('flags conflicting fields and keeps first value', () => {
  const result = parsePropertyText('Giá: 2 tỷ\nGiá bán: 3 tỷ');
  assert.equal(result.property.price, '2 tỷ');
  assert.equal(result.warnings.length, 1);
});

test('extracts explicit area and rooms from a title without inventing other fields', () => {
  const { property } = parsePropertyText('Cho thuê căn hộ 68 m², 2PN, 1WC\nBan công nhìn ra biển.');
  assert.equal(property.area, 68);
  assert.equal(property.beds, 2);
  assert.equal(property.baths, 1);
  assert.equal(property.transactionType, 'rent');
  assert.equal(property.propertyType, 'apartment');
  assert.equal(property.price, undefined);
  assert.equal(property.location, undefined);
});

test('decodes UTF-8 and UTF-16 text and rejects unsupported, empty, binary or oversized input', async () => {
  assert.equal(await extractDocument(file('tin.TXT', sample)), sample.trim());
  assert.equal(await extractDocument(file('tin.md', Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(sample, 'utf16le')]))), sample.trim());
  await assert.rejects(extractDocument(file('bad.exe', sample)), /Chỉ hỗ trợ/);
  await assert.rejects(extractDocument(file('empty.txt', '   ')), /không có nội dung/);
  await assert.rejects(extractDocument(file('binary.txt', Buffer.from([0, 1, 2]))), /không phải tài liệu/);
  await assert.rejects(extractDocument(file('bad.docx', 'x')), /Word không hợp lệ/);
  await assert.rejects(extractDocument(file('bad.pdf', 'not a PDF')), /PDF không hợp lệ/);
  await assert.rejects(extractDocument(file('long.txt', 'a'.repeat(30001))), /quá dài/);
  await assert.rejects(extractDocument(file('large.txt', Buffer.alloc(MAX_FILE_SIZE + 1))), /5MB/);
});

test('extracts and maps a real text PDF', async () => {
  const result = await importPropertyDocument(fixture('property.pdf'));
  assert.equal(result.property.title, 'Coastal apartment');
  assert.equal(result.property.location, 'Nha Trang, Khanh Hoa');
  assert.equal(result.property.price, '2.85 ty');
  assert.equal(result.property.area, 68);
  assert.equal(result.property.beds, 2);
  assert.equal(result.property.description.includes('AMENITIES'), true);
  assert.equal(result.method, 'rules');
});

test('extracts DOCX paragraphs and Vietnamese headings', async () => {
  const result = await importPropertyDocument(fixture('property.docx'));
  assert.equal(result.property.location, 'Phường Lộc Thọ, Nha Trang, Khánh Hòa');
  assert.equal(result.property.area, 68);
  assert.ok(result.property.description.includes('THIẾT KẾ VÀ NỘI THẤT'));
});

test('downloadable Word template imports its fields and description correctly', async () => {
  const buffer = fs.readFileSync(path.join(__dirname, '../../../Web/public/mau-tai-lieu-bat-dong-san.docx'));
  const result = await importPropertyDocument(file('mau-tai-lieu-bat-dong-san.docx', buffer));
  assert.equal(result.property.title, 'Bán căn hộ 2 phòng ngủ tại Lộc Thọ, Nha Trang');
  assert.equal(result.property.location, 'Phường Lộc Thọ, Nha Trang, Khánh Hòa');
  assert.equal(result.property.price, '2,85 tỷ');
  assert.equal(result.property.area, 68);
  assert.equal(result.property.beds, 2);
  assert.equal(result.property.baths, 2);
  assert.equal(result.property.legalStatus, 'pink-book');
  assert.ok(result.property.description.includes('THIẾT KẾ VÀ NỘI THẤT'));
  assert.equal(result.property.description.includes('giữ nguyên tên các mục'), false);
  assert.deepEqual(result.missingFields, []);
  assert.deepEqual(result.warnings, []);
});

test('rejects image-only PDF instead of returning an empty listing', async () => {
  await assert.rejects(importPropertyDocument(fixture('empty.pdf')), /OCR/);
});

test('AI fills missing fields only, validates output, and cannot add privileged fields', async () => {
  const result = await importPropertyDocument(file('tin.txt', 'Giá: 2 tỷ\nBan công rộng.'), {
    ai: { geminiApiKey: 'test-key' },
    fetchImpl: async () => ({ ok: true, json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ price: '9 tỷ', location: 'Nha Trang', area: '-9', propertyType: 'castle', authorId: 'attacker', status: 'Approved' }) }] } }] }) }),
  });
  assert.equal(result.property.price, '2 tỷ');
  assert.equal(result.property.location, 'Nha Trang');
  assert.equal(result.property.area, undefined);
  assert.equal(result.property.propertyType, undefined);
  assert.equal(result.property.authorId, undefined);
  assert.equal(result.property.status, undefined);
  assert.equal(result.property.description, 'Ban công rộng.');
  assert.equal(result.method, 'ai');
});

test('AI failure preserves rule results and reports missing fields', async () => {
  const result = await importPropertyDocument(file('tin.txt', 'Giá: 2 tỷ\nBan công rộng.'), {
    ai: { geminiApiKey: 'test-key' }, fetchImpl: async () => { throw new Error('Unavailable'); },
  });
  assert.equal(result.property.price, '2 tỷ');
  assert.equal(result.method, 'rules');
  assert.ok(result.missingFields.includes('location'));
  assert.ok(result.warnings.length);
});
