/**
 * 5 Tiêu chí chấm điểm chất lượng tin đăng AI (Thang điểm 100):
 * 1. Tiêu đề (max 15đ): rõ ràng, có vị trí/loại hình, không giật tít
 * 2. Thông tin BĐS (max 25đ): vị trí, giá, diện tích, phòng ngủ, phòng tắm, pháp lý
 * 3. Mô tả (max 30đ): độ dài, tiện ích, công năng, tiềm năng
 * 4. Tính nhất quán (max 20đ): khớp thông tin giữa các trường và mô tả
 * 5. Số lượng ảnh (max 10đ): min(số ảnh, 5) * 2
 */

export function evaluateProperty(property = {}) {
  const title = (property.title || '').trim();
  const desc = (property.description || '').trim();
  const images = property.images || [];
  const imageCount = Array.isArray(images) ? images.length : (property.image ? 1 : 0);

  // 1. Tiêu đề (max 15)
  let titleScore = 10;
  let titleReason = 'Tiêu đề cơ bản, nên bổ sung vị trí hoặc đặc điểm nổi bật.';
  if (title.length >= 20 && title.length <= 85) {
    titleScore = 15;
    titleReason = 'Tiêu đề cụ thể, rõ ràng, độ dài đạt chuẩn.';
  } else if (!title || title.length < 10) {
    titleScore = 6;
    titleReason = 'Tiêu đề còn ngắn hoặc sơ sài.';
  }

  // 2. Thông tin BĐS (max 25)
  let detailPoints = 0;
  if (property.location) detailPoints += 6;
  if (property.price) detailPoints += 6;
  if (property.area && Number(property.area) > 0) detailPoints += 5;
  if (property.beds || property.baths) detailPoints += 4;
  if (property.legalStatus) detailPoints += 4;
  const detailsScore = Math.min(25, Math.max(5, detailPoints));
  const detailsReason = detailsScore >= 20
    ? 'Thông số đầy đủ: vị trí, giá, diện tích, phòng ốc và pháp lý rõ ràng.'
    : 'Cần bổ sung thêm thông số chi tiết (pháp lý, diện tích, phòng ốc).';

  // 3. Chất lượng mô tả (max 30)
  let descScore = 15;
  let descReason = 'Mô tả ở mức cơ bản, nên mở rộng thêm các tiện ích xung quanh.';
  if (desc.length >= 200) {
    descScore = 29;
    descReason = 'Mô tả chi tiết, đầy đủ thông tin tiện ích, hạ tầng và tiềm năng.';
  } else if (desc.length >= 80) {
    descScore = 23;
    descReason = 'Mô tả tương đối đầy đủ nhưng có thể bổ sung thêm tiện ích.';
  } else if (desc.length < 40) {
    descScore = 10;
    descReason = 'Mô tả còn ngắn, chưa nêu bật được công năng và giá trị BĐS.';
  }

  // 4. Tính nhất quán (max 20)
  const consistencyScore = desc.length >= 40 ? 19 : 14;
  const consistencyReason = 'Thông tin khai báo cơ bản đồng nhất với nội dung mô tả.';

  // 5. Số lượng ảnh (max 10)
  const imagesScore = Math.min(imageCount, 5) * 2;
  const imagesReason = `${imageCount} ảnh được cung cấp; tối đa 5 ảnh đạt 10 điểm.`;

  const criteria = [
    { id: 'title', label: 'Tiêu đề', maxScore: 15, score: titleScore, reason: titleReason },
    { id: 'details', label: 'Thông tin bất động sản', maxScore: 25, score: detailsScore, reason: detailsReason },
    { id: 'description', label: 'Chất lượng mô tả', maxScore: 30, score: descScore, reason: descReason },
    { id: 'consistency', label: 'Tính nhất quán', maxScore: 20, score: consistencyScore, reason: consistencyReason },
    { id: 'images', label: 'Số lượng ảnh', maxScore: 10, score: imagesScore, reason: imagesReason },
  ];

  const aiScore = criteria.reduce((sum, item) => sum + item.score, 0);

  // Độ uy tín đồng bộ với điểm chất lượng và mức độ xác thực
  const trustScore = Math.min(99, Math.max(50, Math.round(
    aiScore * 0.82 + (property.legalStatus ? 12 : 2) + (imageCount >= 3 ? 6 : 2)
  )));

  const suggestions = [];
  if (titleScore < 13) suggestions.push('Cải thiện tiêu đề: Thêm vị trí và đặc điểm nổi bật.');
  if (detailsScore < 20) suggestions.push('Bổ sung thêm thông số chi tiết (pháp lý, diện tích, phòng ốc).');
  if (descScore < 24) suggestions.push('Mở rộng mô tả: kết cấu nhà, đường trước nhà, tiện ích lân cận.');
  if (imageCount < 5) suggestions.push('Tải thêm ảnh thực tế (tối thiểu 5 ảnh) để đạt điểm tối đa.');

  return {
    aiScore,
    trustScore,
    scoreCriteria: criteria,
    scoreSummary: `Đánh giá tin đăng: đạt ${aiScore}/100 điểm.`,
    scoreSuggestions: suggestions.slice(0, 5),
  };
}

/**
 * Gán điểm cho property nếu chưa có và sắp xếp bài 80-100 lên đầu
 */
export function enrichAndSortProperties(properties = []) {
  if (!Array.isArray(properties)) return [];
  
  const enriched = properties.map(property => {
    // Nếu backend chưa có hoặc chưa gán aiScore
    if (typeof property.aiScore !== 'number') {
      const evalData = evaluateProperty(property);
      return {
        ...property,
        aiScore: evalData.aiScore,
        trustScore: evalData.trustScore,
        scoreCriteria: evalData.scoreCriteria,
        scoreSummary: evalData.scoreSummary,
        scoreSuggestions: evalData.scoreSuggestions,
      };
    }
    return property;
  });

  // Ưu tiên bài 80 - 100 điểm lên đầu, bài thấp điểm về sau
  return enriched.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
}
