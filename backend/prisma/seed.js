const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const sampleProperties = [
  {
    title: 'Căn hộ 2PN Lộc Thọ view biển trực diện',
    price: '2.85 tỷ',
    location: 'Lộc Thọ, Nha Trang',
    beds: 2,
    baths: 2,
    area: 68,
    description: 'Căn hộ tầng cao tại khu vực Lộc Thọ với tầm nhìn ôm trọn vịnh Nha Trang. Đầy đủ nội thất cao cấp, sẵn sàng ở hoặc khai thác cho thuê du lịch.',
    transactionType: 'sale',
    propertyType: 'apartment',
    legalStatus: 'Sổ hồng lâu dài',
    status: 'Approved',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Nhà phố Phước Hải full nội thất cao cấp',
    price: '4.9 tỷ',
    location: 'Phước Hải, Nha Trang',
    beds: 3,
    baths: 3,
    area: 85,
    description: 'Nhà phố 3 tầng hoàn thiện tỉ mỉ, công năng tối ưu cho gia đình 4-6 người. Đường trước nhà 6m ô tô tránh nhau thoải mái.',
    transactionType: 'sale',
    propertyType: 'house',
    legalStatus: 'Sổ đỏ chính chủ',
    status: 'Approved',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Studio Vĩnh Hải gần các trường Đại học',
    price: '1.2 tỷ',
    location: 'Vĩnh Hải, Nha Trang',
    beds: 1,
    baths: 1,
    area: 35,
    description: 'Căn hộ studio xinh xắn, thiết kế tối giản thông minh. Khu vực an ninh, gần chợ Vĩnh Hải và đại học Nha Trang.',
    transactionType: 'sale',
    propertyType: 'apartment',
    legalStatus: 'Hợp đồng mua bán',
    status: 'Approved',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Biệt thự sân vườn Vĩnh Điềm Trung',
    price: '7.5 tỷ',
    location: 'Vĩnh Hiệp, Nha Trang',
    beds: 4,
    baths: 4,
    area: 150,
    description: 'Biệt thự kiến trúc hiện đại, sân vườn xanh mát, hồ cá KOI. Không gian yên tĩnh, đẳng cấp dành cho chủ nhân tinh tế.',
    transactionType: 'sale',
    propertyType: 'villa',
    legalStatus: 'Sổ hồng hoàn công',
    status: 'Approved',
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Căn hộ Mường Thanh Trần Phú cao cấp cho thuê',
    price: '12 triệu/tháng',
    location: 'Trần Phú, Nha Trang',
    beds: 2,
    baths: 2,
    area: 65,
    description: 'Cho thuê căn hộ cao cấp full đồ đường Trần Phú, bước chân xuống đường là bãi tắm biển. Phù hợp chuyên gia hoặc du khách thuê lâu dài.',
    transactionType: 'rent',
    propertyType: 'apartment',
    legalStatus: 'Hợp đồng lâu dài',
    status: 'Approved',
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Shophouse khu đô thị Mỹ Gia mặt tiền lớn',
    price: '6.2 tỷ',
    location: 'Vĩnh Thái, Nha Trang',
    beds: 4,
    baths: 4,
    area: 108,
    description: 'Shophouse 4 tầng kinh doanh đa ngành nghề tại trung tâm KĐT Mỹ Gia. Vị trí đắc địa, lưu lượng giao thông đông đúc.',
    transactionType: 'sale',
    propertyType: 'shophouse',
    legalStatus: 'Sổ đỏ sẵn sàng',
    status: 'Approved',
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Đất nền thổ cư Diên Khánh vuông vức',
    price: '1.75 tỷ',
    location: 'Diên Khánh, Khánh Hòa',
    beds: null,
    baths: null,
    area: 100,
    description: 'Lô đất quy hoạch thổ cư 100%, đường bê tông 5m. Hạ tầng điện nước đầy đủ, mua đặt cọc sang tên ngay trong ngày.',
    transactionType: 'sale',
    propertyType: 'land',
    legalStatus: 'Sổ đỏ riêng',
    status: 'Approved',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Nhà nguyên căn 3 tầng Vĩnh Trường chờ duyệt',
    price: '3.2 tỷ',
    location: 'Vĩnh Trường, Nha Trang',
    beds: 3,
    baths: 2,
    area: 72,
    description: 'Tin đăng bất động sản mới gửi chờ quản trị viên phê duyệt trên hệ thống.',
    transactionType: 'sale',
    propertyType: 'house',
    legalStatus: 'Sổ hồng',
    status: 'Pending',
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Penthouse Ocean View Trần Phú với hồ bơi vô cực',
    price: '18.5 tỷ',
    location: 'Trần Phú, Nha Trang',
    beds: 4,
    baths: 5,
    area: 280,
    description: 'Penthouse tầng cao nhất tòa nhà sang trọng, tầm nhìn panorama trọn vịnh Nha Trang. Nội thất nhập khẩu Ý cao cấp.',
    transactionType: 'sale',
    propertyType: 'apartment',
    legalStatus: 'Sổ hồng sở hữu lâu dài',
    status: 'Approved',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Biệt thự Hillside An Viên view biển cực phẩm',
    price: '22 tỷ',
    location: 'Vĩnh Trường, Nha Trang',
    beds: 5,
    baths: 6,
    area: 320,
    description: 'Tọa lạc tại khu biệt thự cao cấp An Viên, không khí trong lành quanh năm. Trang bị thang máy kính gia đình.',
    transactionType: 'sale',
    propertyType: 'villa',
    legalStatus: 'Sổ hồng hoàn công',
    status: 'Approved',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Nhà phố góc 2 mặt tiền khu đô thị VCN Phước Hải',
    price: '8.8 tỷ',
    location: 'Phước Hải, Nha Trang',
    beds: 4,
    baths: 4,
    area: 120,
    description: 'Căn góc 2 mặt tiền siêu thoáng, thích hợp vừa ở vừa mở văn phòng hoặc spa thẩm mỹ. Hạ tầng vỉa hè rộng 4m.',
    transactionType: 'sale',
    propertyType: 'house',
    legalStatus: 'Sổ đỏ vuông đẹp',
    status: 'Approved',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Cho thuê Căn hộ Panorama Nha Trang trung tâm du lịch',
    price: '15 triệu/tháng',
    location: 'Nguyễn Thị Minh Khai, Nha Trang',
    beds: 2,
    baths: 2,
    area: 70,
    description: 'Căn hộ dịch vụ cao cấp ngay cạnh Quảng trường 2/4. Đầy đủ tiện ích gym, hồ bơi tràn bờ tầng 40, dịch vụ dọn phòng.',
    transactionType: 'rent',
    propertyType: 'apartment',
    legalStatus: 'Hợp đồng lâu dài',
    status: 'Approved',
    images: [
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    title: 'Đất nền ven sông Quán Trường phong thủy vượng khí',
    price: '3.6 tỷ',
    location: 'Vĩnh Thái, Nha Trang',
    beds: null,
    baths: null,
    area: 110,
    description: 'Lô đất ven sông thoáng mát quanh năm, hướng Đông Nam đón gió biển. Khu vực kết nối nhanh đến trục Võ Nguyên Giáp.',
    transactionType: 'sale',
    propertyType: 'land',
    legalStatus: 'Sổ đỏ chính chủ',
    status: 'Pending',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    ]
  }
];

async function main() {
  console.log('--- Reseeding Database with Rich Sample Data ---');
  const hashedPassword = await bcrypt.hash('sale123', 10);

  // 1. Seed Users
  const salesTeam = [
    { name: 'Nguyễn Văn Tùng', email: 'tung.nguyen@estateai.vn', role: 'sale', title: 'Senior Sale', status: 'Active', performance: '94%' },
    { name: 'Trần Mai Linh', email: 'linh.tran@estateai.vn', role: 'sale', title: 'Sale', status: 'Active', performance: '88%' },
    { name: 'Phạm Quang Minh', email: 'minh.pham@estateai.vn', role: 'sale', title: 'Trainee', status: 'Pending', performance: '70%' },
    { name: 'Lê Hoàng Anh', email: 'anh.le@estateai.vn', role: 'sale', title: 'Sale', status: 'Locked', performance: '76%' },
    { name: 'Admin System', email: 'admin@estateai.vn', role: 'admin', title: 'Administrator', status: 'Active', performance: '100%' },
  ];

  const userMap = {};
  for (const sale of salesTeam) {
    const user = await prisma.user.upsert({
      where: { email: sale.email },
      update: {
        name: sale.name,
        role: sale.role,
        title: sale.title,
        status: sale.status,
        performance: sale.performance,
        isVerified: true,
        password: hashedPassword
      },
      create: {
        email: sale.email,
        password: hashedPassword,
        name: sale.name,
        role: sale.role,
        title: sale.title,
        status: sale.status,
        performance: sale.performance,
        isVerified: true
      }
    });
    userMap[sale.email] = user.id;
    console.log(`User created/updated: ${sale.email}`);
  }

  // Clear existing properties to ensure clean state
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();

  // 2. Seed Properties
  const authorIds = Object.values(userMap);
  let count = 0;
  for (let i = 0; i < sampleProperties.length; i++) {
    const prop = sampleProperties[i];
    const authorId = authorIds[i % authorIds.length];

    await prisma.property.create({
      data: {
        title: prop.title,
        price: prop.price,
        location: prop.location,
        beds: prop.beds,
        baths: prop.baths,
        area: prop.area,
        description: prop.description,
        transactionType: prop.transactionType,
        propertyType: prop.propertyType,
        legalStatus: prop.legalStatus,
        status: prop.status,
        authorId: authorId,
        images: {
          create: prop.images.map(url => ({ url }))
        }
      }
    });
    count++;
  }

  // Add more dynamic properties so list is large
  for (let i = 1; i <= 20; i++) {
    const isRent = i % 4 === 0;
    const authorId = authorIds[i % authorIds.length];
    const propType = ['apartment', 'house', 'villa', 'land', 'shophouse'][i % 5];
    const status = i % 6 === 0 ? 'Pending' : 'Approved';

    await prisma.property.create({
      data: {
        title: `${isRent ? 'Cho thuê' : 'Bán'} ${propType === 'apartment' ? 'Căn hộ' : propType === 'house' ? 'Nhà phố' : 'Bất động sản'} cao cấp khu vực Nha Trang #${i}`,
        price: isRent ? `${8 + (i % 10)} triệu/tháng` : `${(2.5 + i * 0.4).toFixed(2)} tỷ`,
        location: i % 2 === 0 ? 'Lộc Thọ, Nha Trang' : 'Phước Hải, Nha Trang',
        beds: (i % 3) + 1,
        baths: (i % 2) + 1,
        area: 45 + (i * 5),
        description: `Bất động sản vị trí đẹp tại Nha Trang, tiện ích xung quanh đồng bộ, khu dân trí cao.`,
        transactionType: isRent ? 'rent' : 'sale',
        propertyType: propType,
        legalStatus: 'Sổ hồng lâu dài',
        status: status,
        authorId: authorId,
        images: {
          create: [
            { url: `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80` },
            { url: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80` }
          ]
        }
      }
    });
    count++;
  }

  console.log(`Seeded ${count} rich properties into database.`);
  console.log('Done seeding!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
