const CRITERIA = [
  { id: 'title', label: 'Tiêu đề', maxScore: 15 },
  { id: 'details', label: 'Thông tin bất động sản', maxScore: 25 },
  { id: 'description', label: 'Chất lượng mô tả', maxScore: 30 },
  { id: 'consistency', label: 'Tính nhất quán', maxScore: 20 },
  { id: 'images', label: 'Số lượng ảnh', maxScore: 10 },
];
const responseSchema = {
  type: 'OBJECT', required: ['summary', 'criteria', 'suggestions'],
  properties: {
    summary: { type: 'STRING' },
    criteria: { type: 'ARRAY', items: { type: 'OBJECT', required: ['id', 'score', 'reason'], properties: {
      id: { type: 'STRING', enum: CRITERIA.map(item => item.id) },
      score: { type: 'INTEGER' }, reason: { type: 'STRING' },
    } } },
    suggestions: { type: 'ARRAY', items: { type: 'STRING' } },
  },
};
function validateScore(value) {
  if (!value || typeof value.summary !== 'string' || !value.summary.trim() ||
      !Array.isArray(value.criteria) || value.criteria.length !== CRITERIA.length ||
      !Array.isArray(value.suggestions) || value.suggestions.some(item => typeof item !== 'string')) {
    throw new Error('Invalid AI score');
  }
  const criteria = CRITERIA.map(definition => {
    const matches = value.criteria.filter(item => item.id === definition.id);
    const item = matches[0];
    if (matches.length !== 1 || !Number.isInteger(item.score) || item.score < 0 || item.score > definition.maxScore ||
        typeof item.reason !== 'string' || !item.reason.trim()) throw new Error('Invalid AI criterion');
    return { ...definition, score: item.score, reason: item.reason.trim() };
  });
  return { score: criteria.reduce((sum, item) => sum + item.score, 0), summary: value.summary.trim(), criteria, suggestions: value.suggestions.filter(item => item.trim()).slice(0, 5) };
}
module.exports = { CRITERIA, responseSchema, validateScore };
