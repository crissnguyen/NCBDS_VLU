import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, TrendingUp } from 'lucide-react';

const newsData = [
  {
    id: 1,
    title: 'Thị trường Bất động sản Việt Nam dự báo phục hồi mạnh mẽ trong quý 4',
    excerpt: 'Các chuyên gia nhận định lãi suất giảm và các chính sách tháo gỡ khó khăn sẽ là đòn bẩy giúp thị trường khởi sắc trở lại.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80',
    category: 'Thị trường',
    author: 'Nguyễn Văn A',
    date: '10/06/2026',
  },
  {
    id: 2,
    title: 'Xu hướng thiết kế căn hộ phong cách tối giản (Minimalism) lên ngôi',
    excerpt: 'Không gian sống được tối ưu hóa chức năng, loại bỏ chi tiết rườm rà đang thu hút giới trẻ mua nhà lần đầu.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80',
    category: 'Thiết kế',
    author: 'Trần Thị B',
    date: '08/06/2026',
  },
  {
    id: 3,
    title: 'Hạ tầng giao thông khu Đông TP.HCM đón loạt tin vui',
    excerpt: 'Nhiều tuyến đường huyết mạch và cầu vượt chuẩn bị thông xe, đẩy giá trị bất động sản khu vực tăng lên một tầm cao mới.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
    category: 'Quy hoạch',
    author: 'Lê Hoàng C',
    date: '05/06/2026',
  },
  {
    id: 4,
    title: 'Kinh nghiệm vay mua nhà trả góp không bị áp lực tài chính',
    excerpt: 'Áp dụng quy tắc 50/30/20 và chọn ngân hàng có lãi suất cố định dài hạn là chìa khóa để sở hữu nhà an toàn.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80',
    category: 'Góc tư vấn',
    author: 'Phạm Văn D',
    date: '02/06/2026',
  },
  {
    id: 5,
    title: 'Luật Đất đai (sửa đổi) chính thức có hiệu lực: Những điểm cần lưu ý',
    excerpt: 'Bảng giá đất mới, quy định về đền bù giải tỏa và cấp sổ đỏ là những nội dung người dân cần nắm rõ.',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80',
    category: 'Pháp lý',
    author: 'Luật sư E',
    date: '28/05/2026',
  },
  {
    id: 6,
    title: 'Bất động sản công nghiệp tiếp tục là điểm sáng thu hút FDI',
    excerpt: 'Sự dịch chuyển chuỗi cung ứng toàn cầu giúp các khu công nghiệp tại Việt Nam giữ tỷ lệ lấp đầy ấn tượng.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80',
    category: 'Đầu tư',
    author: 'Chuyên gia F',
    date: '25/05/2026',
  }
];

export default function News() {
  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh', background: '#f8fafc', paddingBottom: '4rem' }}>
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', padding: '4rem 2rem', textAlign: 'center' }}>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem' }}
        >
          Tin tức Thị trường
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}
        >
          Cập nhật thông tin mới nhất về thị trường bất động sản, xu hướng thiết kế và góc nhìn chuyên gia.
        </motion.p>
      </div>

      {/* Content Grid */}
      <div className="container" style={{ maxWidth: 1200, margin: '-2rem auto 0', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2rem' 
        }}>
          {newsData.map((news, index) => (
            <motion.article 
              key={news.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                background: 'white', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img 
                  src={news.image} 
                  alt={news.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.95)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', backdropFilter: 'blur(4px)' }}>
                  {news.category}
                </div>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ margin: '0 0 0.8rem', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
                  {news.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem', flex: 1 }}>
                  {news.excerpt}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <Calendar size={14} />
                    {news.date}
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#0f766e', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = '#0891b2'} onMouseOut={e => e.currentTarget.style.color = '#0f766e'}>
                    Đọc tiếp <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
