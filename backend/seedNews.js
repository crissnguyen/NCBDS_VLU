const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newsData = [
  {
    title: 'Thị trường Bất động sản Việt Nam dự báo phục hồi mạnh mẽ trong quý 4',
    excerpt: 'Các chuyên gia nhận định lãi suất giảm và các chính sách tháo gỡ khó khăn về mặt pháp lý sẽ là đòn bẩy quan trọng giúp thị trường khởi sắc trở lại vào cuối năm nay. Dòng tiền đầu tư đang rục rịch quay trở lại các phân khúc an toàn.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    category: 'Tiêu điểm Thị trường',
    author: 'Nguyễn Văn A',
    featured: true
  },
  {
    title: 'Xu hướng thiết kế căn hộ phong cách tối giản (Minimalism) lên ngôi',
    excerpt: 'Không gian sống được tối ưu hóa chức năng, loại bỏ chi tiết rườm rà đang thu hút giới trẻ mua nhà lần đầu.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    category: 'Thiết kế',
    author: 'Trần Thị B',
    featured: false
  },
  {
    title: 'Hạ tầng giao thông khu Đông TP.HCM đón loạt tin vui',
    excerpt: 'Nhiều tuyến đường huyết mạch và cầu vượt chuẩn bị thông xe, đẩy giá trị bất động sản khu vực tăng lên một tầm cao mới.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    category: 'Quy hoạch',
    author: 'Lê Hoàng C',
    featured: false
  },
  {
    title: 'Kinh nghiệm vay mua nhà trả góp không bị áp lực tài chính',
    excerpt: 'Áp dụng quy tắc 50/30/20 và chọn ngân hàng có lãi suất cố định dài hạn là chìa khóa để sở hữu nhà an toàn.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    category: 'Góc tư vấn',
    author: 'Phạm Văn D',
    featured: false
  },
  {
    title: 'Luật Đất đai (sửa đổi) chính thức có hiệu lực: Những điểm cần lưu ý',
    excerpt: 'Bảng giá đất mới, quy định về đền bù giải tỏa và cấp sổ đỏ là những nội dung người dân cần nắm rõ.',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    category: 'Pháp lý',
    author: 'Luật sư E',
    featured: false
  },
  {
    title: 'Bất động sản công nghiệp tiếp tục là điểm sáng thu hút FDI',
    excerpt: 'Sự dịch chuyển chuỗi cung ứng toàn cầu giúp các khu công nghiệp tại Việt Nam giữ tỷ lệ lấp đầy ấn tượng.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    category: 'Đầu tư',
    author: 'Chuyên gia F',
    featured: false
  }
];

async function seed() {
  console.log('Seeding news...');
  for (const n of newsData) {
    await prisma.news.create({ data: n });
  }
  console.log('Seed done!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
