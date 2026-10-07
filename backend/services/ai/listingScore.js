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

function generateFallbackScore(listing = {}, imageCount = 0) {
  let titleScore = 10;
  let titleReason = 'Tiêu đề cơ bản, nên bổ sung vị trí hoặc đặc điểm nổi bật.';
  const title = (listing.title || '').trim();
  if (title.length >= 20 && title.length <= 80) {
    titleScore = 14;
    titleReason = 'Tiêu đề rõ ràng, độ dài phù hợp.';
  } else if (!title || title.length < 10) {
    titleScore = 6;
    titleReason = 'Tiêu đề còn ngắn hoặc sơ sài.';
  }

  let detailPoints = 0;
  if (listing.location) detailPoints += 6;
  if (listing.price) detailPoints += 6;
  if (listing.area) detailPoints += 5;
  if (listing.beds || listing.baths) detailPoints += 4;
  if (listing.legalStatus) detailPoints += 4;
  const detailsScore = Math.min(25, Math.max(5, detailPoints));
  const detailsReason = detailsScore >= 20
    ? 'Các thông tin cơ bản (vị trí, giá, diện tích, pháp lý) khá đầy đủ.'
    : 'Cần bổ sung thêm thông số chi tiết như pháp lý, diện tích cụ thể.';

  const desc = (listing.description || '').trim();
  let descScore = 15;
  let descReason = 'Mô tả ở mức cơ bản, nên mở rộng thêm các tiện ích xung quanh.';
  if (desc.length >= 200) {
    descScore = 28;
    descReason = 'Mô tả chi tiết, đầy đủ thông tin tiện ích và tiềm năng.';
  } else if (desc.length >= 80) {
    descScore = 22;
    descReason = 'Mô tả tương đối đầy đủ nhưng có thể bổ sung thêm tiện ích.';
  } else if (desc.length < 40) {
    descScore = 10;
    descReason = 'Mô tả còn ngắn, chưa nêu bật được công năng và giá trị BĐS.';
  }

  const consistencyScore = 18;
  const consistencyReason = 'Thông tin khai báo cơ bản đồng nhất với nội dung mô tả.';

  const imgCount = Math.max(0, Number(imageCount) || 0);
  const imagesScore = Math.min(imgCount, 5) * 2;
  const imagesReason = `${imgCount} ảnh được cung cấp; tối đa 5 ảnh đạt 10 điểm.`;

  const criteria = [
    { id: 'title', label: 'Tiêu đề', maxScore: 15, score: titleScore, reason: titleReason },
    { id: 'details', label: 'Thông tin bất động sản', maxScore: 25, score: detailsScore, reason: detailsReason },
    { id: 'description', label: 'Chất lượng mô tả', maxScore: 30, score: descScore, reason: descReason },
    { id: 'consistency', label: 'Tính nhất quán', maxScore: 20, score: consistencyScore, reason: consistencyReason },
    { id: 'images', label: 'Số lượng ảnh', maxScore: 10, score: imagesScore, reason: imagesReason },
  ];

  const totalScore = criteria.reduce((sum, item) => sum + item.score, 0);

  const suggestions = [];
  if (titleScore < 12) suggestions.push('Cải thiện tiêu đề: Thêm vị trí cụ thể và điểm nổi bật của bất động sản.');
  if (detailsScore < 20) suggestions.push('Bổ sung thêm thông số chi tiết (pháp lý, diện tích, số phòng).');
  if (descScore < 22) suggestions.push('Mở rộng mô tả: nêu rõ kết cấu nhà, đường trước nhà, tiện ích lân cận.');
  if (imgCount < 5) suggestions.push('Tải thêm hình ảnh thực tế (tối thiểu 5 ảnh) để người xem có cái nhìn toàn diện.');
  if (suggestions.length === 0) suggestions.push('Tin đăng có chất lượng tốt, đầy đủ thông tin.');

  return {
    score: totalScore,
    summary: `Tin đăng đạt ${totalScore}/100 điểm. Thông tin đã được kiểm tra và đánh giá theo 5 tiêu chí tiêu chuẩn.`,
    criteria,
    suggestions: suggestions.slice(0, 5),
  };
}

function evaluateProperty(property = {}) {
  const images = property.images || [];
  const imageCount = Array.isArray(images) ? images.length : 0;
  const scoreData = generateFallbackScore(property, imageCount);
  const aiScore = scoreData.score;
  const trustScore = Math.min(99, Math.max(50, Math.round(
    aiScore * 0.82 + (property.legalStatus ? 12 : 2) + (imageCount >= 3 ? 6 : 2)
  )));

  return {
    aiScore,
    trustScore,
    scoreCriteria: scoreData.criteria,
    scoreSummary: scoreData.summary,
    scoreSuggestions: scoreData.suggestions,
  };
}

module.exports = { CRITERIA, responseSchema, validateScore, generateFallbackScore, evaluateProperty };

