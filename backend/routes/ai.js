const express = require('express');
const { env } = require('../config/env');

const router = express.Router();

const cleanText = (value = '') => String(value)
  .replace(/\*\*/g, '')
  .replace(/^["'\s]+|["'\s]+$/g, '')
  .trim();

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
- Không dùng emoji, không markdown, không tiêu đề phụ.
- Độ dài 90-140 từ.
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
          temperature: 0.75,
          maxOutputTokens: 420,
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
