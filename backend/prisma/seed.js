const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('sale123', 10);

  // Mảng dữ liệu nhân viên sale mẫu
  const salesTeam = [
    { name: 'Nguyễn Văn Tùng', email: 'tung.nguyen@estateai.vn', role: 'sale', title: 'Senior Sale', status: 'Active', performance: '94%', posts: 32 },
    { name: 'Trần Mai Linh', email: 'linh.tran@estateai.vn', role: 'sale', title: 'Sale', status: 'Active', performance: '88%', posts: 18 },
    { name: 'Phạm Quang Minh', email: 'minh.pham@estateai.vn', role: 'sale', title: 'Trainee', status: 'Pending', performance: '-', posts: 0 },
    { name: 'Lê Hoàng Anh', email: 'anh.le@estateai.vn', role: 'sale', title: 'Sale', status: 'Locked', performance: '76%', posts: 45 },
  ];

  for (const sale of salesTeam) {
    const existing = await prisma.user.findUnique({ where: { email: sale.email } });
    let userId;
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          email: sale.email,
          password: hashedPassword,
          name: sale.name,
          role: sale.role,
          title: sale.title,
          status: sale.status,
          performance: sale.performance
        }
      });
      userId = user.id;
      console.log(`Seeded user: ${sale.email}`);
    } else {
      userId = existing.id;
      // Update existing user just in case
      await prisma.user.update({
        where: { id: userId },
        data: {
          title: sale.title,
          status: sale.status,
          performance: sale.performance
        }
      });
    }

    // Insert dummy properties for this user
    const currentPropCount = await prisma.property.count({ where: { authorId: userId } });
    if (currentPropCount < sale.posts) {
      const propsToCreate = sale.posts - currentPropCount;
      const propData = [];
      for (let i = 0; i < propsToCreate; i++) {
        propData.push({
          title: `Tin đăng mẫu ${i + 1} của ${sale.name}`,
          price: `${(Math.random() * 5 + 1).toFixed(1)} Tỷ`,
          location: "Nha Trang, Khánh Hòa",
          authorId: userId,
          status: i % 10 === 0 ? "Pending" : "Approved", // Some pending, some approved
          isSold: i % 5 === 0 // 20% are sold
        });
      }
      await prisma.property.createMany({ data: propData });
      console.log(`Seeded ${propsToCreate} properties for ${sale.email}`);
    }
  }

  // Update existing test sale user
  await prisma.user.updateMany({
    where: { email: 'sale@estateai.vn' },
    data: { title: 'Sale', performance: '85%' }
  });

  console.log("Seeding admin dashboard mock data finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
