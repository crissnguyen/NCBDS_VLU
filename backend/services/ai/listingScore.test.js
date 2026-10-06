const test = require('node:test');
const assert = require('node:assert/strict');
const { CRITERIA, validateScore } = require('./listingScore');
const sample = () => ({ summary: 'Tin cần cải thiện.', criteria: CRITERIA.map(item => ({ id: item.id, score: 0, reason: 'Chưa có thông tin.' })), suggestions: ['Bổ sung vị trí.'] });
test('empty criteria scores total zero without default bonus', () => assert.equal(validateScore(sample()).score, 0));
test('total comes from validated criteria and remains within 100', () => {
  const value = sample(); value.criteria.forEach((item, i) => { item.score = CRITERIA[i].maxScore; });
  assert.equal(validateScore(value).score, 100);
});
test('rejects out of range, negative, fractional and nonnumeric scores', () => {
  for (const score of [-1, 16, 1.5, '10', NaN]) {
    const value = sample(); value.criteria[0].score = score;
    assert.throws(() => validateScore(value));
  }
});
test('rejects missing or duplicate criteria and unusable explanations', () => {
  const missing = sample(); missing.criteria.pop(); assert.throws(() => validateScore(missing));
  const duplicate = sample(); duplicate.criteria[1] = duplicate.criteria[0]; assert.throws(() => validateScore(duplicate));
  const empty = sample(); empty.criteria[0].reason = ' '; assert.throws(() => validateScore(empty));
  const bad = sample(); bad.suggestions = [{}]; assert.throws(() => validateScore(bad));
});
