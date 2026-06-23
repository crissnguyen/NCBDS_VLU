const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'duc.2174802010002@vanlanguni.vn' }
  });
  console.log("Mã OTP của bạn là:", user?.verificationCode);
  console.log("Mã Reset Pass của bạn là:", user?.resetPasswordToken);
}

main().catch(console.error).finally(() => prisma.$disconnect());
