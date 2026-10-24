import test from 'node:test';
import assert from 'node:assert/strict';
import { propertyDescriptionBlocks } from '../src/utils/propertyDescription.js';

test('formats imported headings, paragraph breaks, bullets and numbered lists', () => {
  const blocks = propertyDescriptionBlocks('TỔNG QUAN\nCăn hộ nhìn ra biển.\nDòng tiếp theo.\n\nĐoạn thứ hai.\n\n## Tiện ích\n- Ban công\n- Bãi xe\n\n3. Liên hệ\n4. Xem nhà');
  assert.deepEqual(blocks.map(block => block.type), ['heading', 'paragraph', 'paragraph', 'heading', 'unordered-list', 'ordered-list']);
  assert.equal(blocks[1].text, 'Căn hộ nhìn ra biển.\nDòng tiếp theo.');
  assert.deepEqual(blocks[4].items, ['Ban công', 'Bãi xe']);
  assert.equal(blocks[5].start, 3);
});

test('keeps imported HTML as text and handles empty descriptions', () => {
  const text = '<script>alert(1)</script>\n<img src=x onerror=alert(1)>';
  assert.equal(propertyDescriptionBlocks(text)[0].text, text);
  assert.deepEqual(propertyDescriptionBlocks(null), []);
});

test('recognizes ordinary Vietnamese section titles without PDF font information', () => {
  const blocks = propertyDescriptionBlocks('Tiện ích xung quanh:\nGần biển.\n\nLiên hệ\nGọi để xem nhà.');
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[2].type, 'heading');
});
