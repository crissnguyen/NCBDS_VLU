const prisma = require('./lib/prisma');
const { normalizeEmail } = require('./utils/auth');

async function main() {
  const email = normalizeEmail(process.argv[2] || 'duc.2174802010002@vanlanguni.vn');
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } }
  });

  if (!user) {
    console.log('Không tìm thấy user:', email);
    return;
  }

  console.log('Email:', user.email);
  console.log('Đã xác thực:', user.isVerified);
  console.log('OTP đang lưu:', user.verificationCode ? 'Có (đã hash hoặc legacy plaintext)' : 'Không');
  console.log('OTP hết hạn:', user.verificationCodeExpiry || 'Không có');
  console.log('Reset token đang lưu:', user.resetToken ? 'Có (đã hash)' : 'Không');
}

main().catch(console.error).finally(() => prisma.$disconnect());
