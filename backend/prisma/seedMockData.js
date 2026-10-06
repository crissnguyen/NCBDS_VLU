const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Bắt đầu nạp Mock Data đồng bộ cho Hệ thống & Trang Quản trị...');

  // 1. Cập nhật & Tạo Users (Admin & Sales)
  const defaultPassword = await bcrypt.hash('123456', 10);

  const salesData = [
    {
      email: 'nguyenduyduc2505@gmail.com',
      name: 'Nguyễn Duy Đức',
      role: 'sale',
      title: 'Trưởng nhóm Kinh doanh',
      performance: '95%',
      status: 'Active',
      isVerified: true,
    },
    {
      email: 'sale.linh@estateai.vn',
      name: 'Hoàng Thùy Linh',
      role: 'sale',
      title: 'Chuyên viên BĐS Cao cấp',
      performance: '88%',
      status: 'Active',
      isVerified: true,
    },
    {
      email: 'sale.nam@estateai.vn',
      name: 'Trần Văn Nam',
      role: 'sale',
      title: 'Chuyên viên Tư vấn Dự án',
      performance: '79%',
      status: 'Active',
      isVerified: true,
    },
    {
      email: 'sale.phuong@estateai.vn',
      name: 'Lê Mai Phương',
      role: 'sale',
      title: 'Chuyên viên Thẩm định',
      performance: '84%',
      status: 'Active',
      isVerified: true,
    }
  ];

  const salesMap = {};

  for (const s of salesData) {
    const existing = await prisma.user.findUnique({ where: { email: s.email } });
    if (existing) {
      const updated = await prisma.user.update({
        where: { email: s.email },
        data: {
          name: s.name,
          title: s.title,
          performance: s.performance,
          role: s.role,
        }
      });
      salesMap[s.email] = updated.id;
    } else {
      const created = await prisma.user.create({
        data: {
          ...s,
          password: defaultPassword,
        }
      });
      salesMap[s.email] = created.id;
    }
  }

  // Lấy thêm admin có sẵn
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  const adminId = adminUser ? adminUser.id : null;
  const ducId = salesMap['nguyenduyduc2505@gmail.com'];
  const linhId = salesMap['sale.linh@estateai.vn'];
  const namId = salesMap['sale.nam@estateai.vn'];
  const phuongId = salesMap['sale.phuong@estateai.vn'];

  console.log('✔ Đồng bộ thông tin Nhân viên & Sale thành công.');

  // 2. Mock Bất động sản (Properties)
  // Xóa ảnh cũ để nạp lại ảnh chất lượng cao
  const mockProperties = [
    {
      title: 'Căn hộ Masteri Centre Point 2PN View Công viên',
      price: '3.85 tỷ',
      location: 'TP. Thủ Đức, TP.HCM',
      beds: 2,
      baths: 2,
      area: 72,
      description: 'Căn hộ tầng cao, ban công hướng Đông Nam đón gió mát lành, full nội thất cao cấp nhập khẩu châu Âu. Tiện ích hồ bơi phi thuyền, công viên 36ha.',
      transactionType: 'sale',
      propertyType: 'apartment',
      legalStatus: 'Sổ hồng riêng',
      status: 'Approved',
      isSold: false,
      authorId: ducId,
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      title: 'Biệt thự Đơn lập Vinhomes Riverside Hoa Sữa',
      price: '28.5 tỷ',
      location: 'Quận Long Biên, Hà Nội',
      beds: 5,
      baths: 5,
      area: 320,
      description: 'Biệt thự phong cách tân cổ điển, có sông nhân tạo sau nhà, sân vườn rộng thoáng, hầm để xe riêng. An ninh đa lớp 24/7.',
      transactionType: 'sale',
      propertyType: 'villa',
      legalStatus: 'Sổ đỏ chính chủ',
      status: 'Approved',
      isSold: false,
      authorId: linhId,
      images: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      title: 'Nhà phố thương mại Shophouse The Manor Crown',
      price: '45 triệu/tháng',
      location: 'Quận Bình Thạnh, TP.HCM',
      beds: 4,
      baths: 4,
      area: 160,
      description: 'Vị trí mặt tiền kinh doanh sầm uất, phù hợp mở văn phòng công ty, spa hoặc showroom cao cấp. Vỉa hè rộng 6m để xe thoải mái.',
      transactionType: 'rent',
      propertyType: 'shophouse',
      legalStatus: 'Hợp đồng dài hạn',
      status: 'Approved',
      isSold: false,
      authorId: namId,
      images: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      title: 'Nhà phố liền kề KĐT Sala Đại Quang Minh',
      price: '18.2 tỷ',
      location: 'Quận 2, TP. Thủ Đức, TP.HCM',
      beds: 4,
      baths: 4,
      area: 140,
      description: 'Kiến trúc hiện đại 1 trệt 3 lầu, có thang máy gia đình. Đã hoàn tất thủ tục bàn giao và giao dịch thành công cho khách hàng.',
      transactionType: 'sale',
      propertyType: 'house',
      legalStatus: 'Sổ hồng riêng',
      status: 'Approved',
      isSold: true, // Giao dịch thành công (Test metric giao dịch)
      authorId: ducId,
      images: [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      title: 'Căn hộ Studio D\'Capitale Trần Duy Hưng',
      price: '12 triệu/tháng',
      location: 'Quận Cầu Giấy, Hà Nội',
      beds: 1,
      baths: 1,
      area: 38,
      description: 'Studio xinh xắn thích hợp cho chuyên gia nước ngoài hoặc người độc thân, full đồ dùng chỉ xách vali vào ở. View hồ điều hòa thoáng đãng.',
      transactionType: 'rent',
      propertyType: 'apartment',
      legalStatus: 'Hợp đồng thuê 1 năm',
      status: 'Approved',
      isSold: true, // Giao dịch thành công (Test metric giao dịch)
      authorId: phuongId,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      title: 'Đất nền Thổ cư ven biển Bãi Dài Cam Ranh',
      price: '2.4 tỷ',
      location: 'Cam Lâm, Khánh Hòa',
      beds: null,
      baths: null,
      area: 120,
      description: 'Lô đất vuông vắn đường nhựa 12m, cách biển 800m. Tiềm năng tăng giá cao theo quy hoạch du lịch nghỉ dưỡng trọng điểm.',
      transactionType: 'sale',
      propertyType: 'land',
      legalStatus: 'Sổ đỏ trao tay',
      status: 'Approved',
      isSold: false,
      authorId: linhId,
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    // --- Tin CHỜ DUYỆT (Để kiểm tra Tab Tin chờ duyệt trong Admin) ---
    {
      title: 'Penthouse Landmark 81 View Panorama toàn thành phố',
      price: '35 tỷ',
      location: 'Quận Bình Thạnh, TP.HCM',
      beds: 4,
      baths: 5,
      area: 280,
      description: 'Căn hộ Penthouse đỉnh cao sang trọng bậc nhất Sài Gòn, thang máy riêng biệt, bể bơi vô cực trên không. Tin đăng mới gửi chờ quản trị viên xét duyệt.',
      transactionType: 'sale',
      propertyType: 'apartment',
      legalStatus: 'Sổ hồng',
      status: 'Pending', // Tin chờ duyệt
      isSold: false,
      authorId: ducId,
      images: [
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      title: 'Nhà vườn sinh thái ven sông Đồng Nai',
      price: '6.5 tỷ',
      location: 'Long Thành, Đồng Nai',
      beds: 3,
      baths: 3,
      area: 500,
      description: 'Nhà vườn trồng sẵn cây ăn trái, bến du thuyền gia đình, không gian yên bình cho kỳ nghỉ cuối tuần. Chờ ban quản trị thẩm định pháp lý.',
      transactionType: 'sale',
      propertyType: 'house',
      legalStatus: 'Sổ hồng riêng',
      status: 'Pending', // Tin chờ duyệt
      isSold: false,
      authorId: namId,
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
      ]
    }
  ];

  // Nạp Properties
  for (const p of mockProperties) {
    const { images, ...propData } = p;
    // Kiểm tra xem đã có bài trùng tiêu đề chưa
    const existing = await prisma.property.findFirst({ where: { title: propData.title } });
    let propertyId;
    if (existing) {
      const updated = await prisma.property.update({
        where: { id: existing.id },
        data: propData
      });
      propertyId = updated.id;
      await prisma.propertyImage.deleteMany({ where: { propertyId } });
    } else {
      const created = await prisma.property.create({
        data: propData
      });
      propertyId = created.id;
    }

    // Thêm ảnh
    for (const imgUrl of images) {
      await prisma.propertyImage.create({
        data: {
          url: imgUrl,
          propertyId
        }
      });
    }
  }

  console.log(`✔ Đã nạp ${mockProperties.length} Bất động sản (bao gồm Approved, Sold, và Pending).`);

  // 3. Mock Tin tức (News)
  const newsList = [
    {
      title: 'Thị trường Bất động sản Việt Nam dự báo phục hồi mạnh mẽ trong quý 4',
      excerpt: 'Các chuyên gia nhận định lãi suất giảm và các chính sách tháo gỡ khó khăn về mặt pháp lý sẽ là đòn bẩy quan trọng giúp thị trường khởi sắc trở lại vào cuối năm nay.',
      content: 'Theo báo cáo mới nhất từ Hiệp hội Bất động sản, dòng vốn FDI và dòng tiền tiết kiệm từ ngân hàng đang bắt đầu dịch chuyển sang các kênh đầu tư tài sản có tính thanh khoản cao...',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
      category: 'Tiêu điểm Thị trường',
      author: 'Ban Biên Tập',
      featured: true,
      status: 'Published'
    },
    {
      title: 'Xu hướng thiết kế căn hộ phong cách tối giản (Minimalism) lên ngôi',
      excerpt: 'Không gian sống được tối ưu hóa chức năng, loại bỏ chi tiết rườm rà đang thu hút đông đảo giới trẻ và gia đình hiện đại.',
      content: 'Phong cách Minimalism không đơn thuần là sự đơn giản, mà là nghệ thuật tối ưu hóa không gian sống, mang lại sự thư thái và tái tạo năng lượng sau ngày làm việc bận rộn...',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      category: 'Thiết kế',
      author: 'Kiến Trúc Sư Minh Khang',
      featured: false,
      status: 'Published'
    },
    {
      title: 'Hạ tầng giao thông khu Đông TP.HCM đón loạt tin vui cuối năm',
      excerpt: 'Nhiều tuyến đường huyết mạch, nút giao An Phú và metro số 1 chuẩn bị đi vào vận hành, đẩy giá trị bất động sản khu vực tăng trưởng bền vững.',
      content: 'Khu Đông tiếp tục khẳng định vị thế đầu tàu phát triển đô thị với việc hoàn thiện chuỗi hạ tầng giao thông kết nối liên vùng...',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      category: 'Quy hoạch',
      author: 'Lê Hoàng Cường',
      featured: true,
      status: 'Published'
    },
    {
      title: 'Bí quyết vay mua nhà trả góp không bị áp lực tài chính đè nặng',
      excerpt: 'Cách tính toán tỷ lệ nợ trên thu nhập (DTI), lựa chọn gói lãi suất ưu đãi cố định và lập quỹ dự phòng khẩn cấp khi mua bất động sản đầu tiên.',
      content: 'Các chuyên gia tài chính khuyến cáo khoản trả góp ngân hàng hàng tháng không nên vượt quá 40% tổng thu nhập của cả gia đình...',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
      category: 'Tài chính',
      author: 'Chuyên gia Tài chính Đức Huy',
      featured: false,
      status: 'Published'
    }
  ];

  for (const n of newsList) {
    const existing = await prisma.news.findFirst({ where: { title: n.title } });
    if (existing) {
      await prisma.news.update({ where: { id: existing.id }, data: n });
    } else {
      await prisma.news.create({ data: n });
    }
  }
  console.log(`✔ Đã nạp ${newsList.length} bài viết Tin tức thị trường.`);

  // 4. Mock Khách hàng Liên hệ (ContactRequest)
  const contactRequests = [
    {
      name: 'Nguyễn Thanh Tùng',
      phone: '0912345678',
      email: 'thanhtung.nguyen@gmail.com',
      subject: 'Tư vấn xem nhà căn hộ Masteri Centre Point',
      message: 'Tôi muốn đặt lịch xem thực tế căn hộ 2PN Masteri vào cuối tuần này lúc 9h sáng. Xin hãy liên hệ lại.',
      status: 'Pending',
      replyText: null,
    },
    {
      name: 'Trần Thị Thu Hà',
      phone: '0988776655',
      email: 'thuha.tran@vinamilk.com.vn',
      subject: 'Hỏi về pháp lý Biệt thự Vinhomes Riverside',
      message: 'Gia đình tôi đang có nhu cầu tìm hiểu biệt thự tại Hoa Sữa, xin gửi thông tin chi tiết về sổ đỏ và lịch thanh toán.',
      status: 'Replied',
      replyText: 'Chào chị Hà, chuyên viên bên em đã gửi bản sao sổ đỏ và lộ trình thanh toán qua email của chị. Em sẽ gọi điện thoại để hỗ trợ chi tiết ạ.',
    },
    {
      name: 'Phạm Quốc Bảo',
      phone: '0903112233',
      email: 'baopham.invest@gmail.com',
      subject: 'Đầu tư đất nền Bãi Dài Cam Ranh',
      message: 'Tôi muốn khảo sát 2-3 lô đất nền tại Bãi Dài có sổ sẵn. Nhờ công ty gửi báo giá và vị trí quy hoạch.',
      status: 'Pending',
      replyText: null,
    }
  ];

  for (const c of contactRequests) {
    const existing = await prisma.contactRequest.findFirst({ where: { email: c.email, subject: c.subject } });
    if (existing) {
      await prisma.contactRequest.update({ where: { id: existing.id }, data: c });
    } else {
      await prisma.contactRequest.create({ data: c });
    }
  }
  console.log(`✔ Đã nạp ${contactRequests.length} Yêu cầu Liên hệ & Tư vấn.`);

  console.log('🎉 Hoàn tất nạp Mock Data 100%!');
}

main()
  .catch((e) => {
    console.error('Lỗi nạp Mock Data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
