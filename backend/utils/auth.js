const crypto = require('crypto');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const normalizeOtp = (code) => String(code || '').replace(/\D/g, '').slice(0, 6);

const createOtp = () => String(crypto.randomInt(100000, 1000000));

const hashToken = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

const hashOtp = (code) => hashToken(normalizeOtp(code));

const otpMatches = (storedCode, submittedCode) => {
  const code = normalizeOtp(submittedCode);
  if (!storedCode || code.length !== 6) return false;
  return storedCode === code || storedCode === hashOtp(code);
};

const getOtpExpiry = (minutes = 15) => new Date(Date.now() + minutes * 60 * 1000);

const sanitizeUser = (user) => {
  if (!user) return user;
  const {
    password,
    verificationCode,
    verificationCodeExpiry,
    resetToken,
    resetTokenExpiry,
    ...safeUser
  } = user;
  return safeUser;
};

module.exports = {
  normalizeEmail,
  normalizeOtp,
  createOtp,
  hashToken,
  hashOtp,
  otpMatches,
  getOtpExpiry,
  sanitizeUser,
};
