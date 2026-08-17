const express = require('express');
const { env } = require('../config/env');
const prisma = require('../lib/prisma');

const router = express.Router();

const cleanText = (value = '') => String(value)
  .replace(/\*\*/g, '')
  .replace(/^["'\s]+|["'\s]+$/g, '')
  .trim();

const parsePriceMillion = (value) => {
  const text = String(value || '').toLowerCase().replace(/,/g, '.');
  const match = text.match(/[\d.]+/);
  if (!match) return null;
  const number = Number.parseFloat(match[0]);
  if (!Number.isFinite(number)) return null;
  return text.includes('tỷ') || text.includes('tỉ') || text.includes('ty') ? number * 1000 : number;
};

const normalizeLocation = value => String(value || '').split(',').pop().trim() || 'Chưa xác định';

const buildMarketAnalysis = properties => {
  const valid = properties.map(property => ({
    ...property,
    priceMillion: parsePriceMillion(property.price),
    pricePerM2: property.area && parsePriceMillion(property.price) ? parsePriceMillion(property.price) / Number(property.area) : null,
  })).filter(property => property.priceMillion !== null);
  const average = valid.length ? valid.reduce((sum, item) => sum + item.priceMillion, 0) / valid.length : 0;
  const locations = [...new Set(valid.map(item => normalizeLocation(item.location)))].map(location => {
    const rows = valid.filter(item => normalizeLocation(item.location) === location);
    const avg = rows.reduce((sum, item) => sum + item.priceMillion, 0) / rows.length;
    const perM2Rows = rows.filter(item => item.pricePerM2);
    return { location, listings: rows.length, averagePriceMillion: Math.round(avg * 100) / 100, averagePricePerM2: perM2Rows.length ? Math.round(perM2Rows.reduce((sum, item) => sum + item.pricePerM2, 0) / perM2Rows.length * 100) / 100 : null };
  }).sort((a, b) => b.listings - a.listings);
  return { sampleSize: valid.length, averagePriceMillion: Math.round(average * 100) / 100, locations, methodology: 'So sánh giá trung bình và giá/m² từ các tin đã duyệt; cần dữ liệu lịch sử để dự báo xu hướng đáng tin cậy.' };
};

router.get('/market-analysis', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({ where: { status: 'Approved' }, select: { price: true, location: true, area: true, propertyType: true, transactionType: true, createdAt: true } });
    const analysis = buildMarketAnalysis(properties);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(500).json({ success: false, message: 'Không thể phân tích dữ liệu thị trường.' });
  }
});

router.get('/recommendations', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({ where: { status: 'Approved' }, include: { images: true }, orderBy: { createdAt: 'desc' } });
    const valid = properties.map(property => ({ ...property, priceMillion: parsePriceMillion(property.price), pricePerM2: property.area && parsePriceMillion(property.price) ? parsePriceMillion(property.price) / Number(property.area) : null })).filter(property => property.priceMillion !== null);
    const avg = valid.length ? valid.reduce((sum, item) => sum + item.priceMillion, 0) / valid.length : 0;
    const recommendations = valid.map(property => {
      const discount = avg ? Math.max(0, Math.min(30, ((avg - property.priceMillion) / avg) * 100)) : 0;
      const trust = Number(property.trustScore || 85);
      const score = Math.round(Math.min(100, 55 + discount * 0.8 + (trust - 70) * 0.35 + (property.legalStatus ? 5 : 0)));
      return { ...property, images: property.images.map(image => image.url), recommendationScore: score, estimatedMarketPriceMillion: Math.round(avg * 100) / 100, priceDifferencePercent: Math.round((property.priceMillion - avg) / avg * 1000) / 10, reasons: [discount > 3 ? 'Giá thấp hơn mặt bằng tham chiếu' : 'Giá nằm gần mặt bằng tham chiếu', property.legalStatus ? 'Có thông tin pháp lý' : 'Cần xác minh pháp lý', property.area ? 'Có dữ liệu diện tích để so sánh' : 'Thiếu dữ liệu diện tích'] };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 10);
    res.json({ success: true, data: { sampleSize: valid.length, recommendations, methodology: 'Điểm xếp hạng MVP dựa trên chênh lệch giá, độ tin cậy và thông tin pháp lý; chưa phải mô hình dự báo đã huấn luyện.' } });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ success: false, message: 'Không thể tạo đề xuất BĐS.' });
  }
});

router.post('/rewrite-description', async (req, res) => {
  try {
    const { description, property = {} } = req.body;
    const rawDescription = cleanText(description);

    if (!rawDescription || rawDescription.length < 12) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mô tả ban đầu trước khi tạo nội dung AI.',
      });
    }

    if (!env.ai.geminiApiKey) {
      return res.status(503).json({
        success: false,
        message: 'Chưa cấu hình GEMINI_API_KEY trên server.',
      });
    }

    const details = [
      property.transactionType && `Loại giao dịch: ${property.transactionType}`,
      property.propertyType && `Loại BĐS: ${property.propertyType}`,
      property.location && `Vị trí: ${property.location}`,
      property.price && `Giá: ${property.price}`,
      property.area && `Diện tích: ${property.area} m2`,
      property.beds && `Phòng ngủ: ${property.beds}`,
      property.baths && `Phòng tắm: ${property.baths}`,
      property.legalStatus && `Pháp lý: ${property.legalStatus}`,
    ].filter(Boolean).join('\n');

    const prompt = `
Bạn là chuyên gia copywriting bất động sản tại Việt Nam.
Hãy viết lại mô tả tin đăng bên dưới sao cho hấp dẫn, rõ ràng, chuyên nghiệp và dễ đăng lên website.

Yêu cầu:
- Viết bằng tiếng Việt tự nhiên.
- Không bịa thông tin ngoài dữ liệu được cung cấp.
- Không dùng emoji, không dùng markdown.
- Viết thành 3-4 đoạn ngắn, mỗi đoạn 2-3 câu.
- Độ dài 180-260 từ, đủ chi tiết để dùng trực tiếp làm mô tả tin đăng.
- Nếu mô tả gốc quá ít thông tin, hãy khai thác tối đa các trường giá, vị trí, diện tích, số phòng, pháp lý; không tự thêm tên dự án, tiện ích hoặc cam kết chưa có dữ liệu.
- Nêu nổi bật vị trí, công năng, pháp lý, tiện ích và tiềm năng nếu nội dung có nhắc đến.
- Giọng văn thuyết phục nhưng không phóng đại.

Thông tin tin đăng:
${details || 'Chưa có thông tin bổ sung.'}

Mô tả gốc:
${rawDescription}
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.ai.geminiModel}:generateContent?key=${env.ai.geminiApiKey}`;

    const aiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.82,
          maxOutputTokens: 900,
        },
      }),
    });
    clearTimeout(timeout);

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      return res.status(aiResponse.status).json({
        success: false,
        message: data.error?.message || 'AI không thể tạo nội dung lúc này.',
      });
    }

    const rewritten = cleanText(data.candidates?.[0]?.content?.parts?.[0]?.text);

    if (!rewritten) {
      return res.status(502).json({
        success: false,
        message: 'AI không trả về nội dung phù hợp.',
      });
    }

    res.json({ success: true, description: rewritten });
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'AI phản hồi quá lâu, vui lòng thử lại.'
      : 'Không thể tạo nội dung AI.';
    console.error('AI rewrite error:', error);
    res.status(500).json({ success: false, message, error: error.message });
  }
});

module.exports = router;
