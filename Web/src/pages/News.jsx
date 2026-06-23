import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, ChevronRight, X, ExternalLink, Newspaper } from 'lucide-react';
import { dataService } from '../services/data/dataService';

const fallbackImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80';

export default function News() {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    dataService.getNews()
      .then(data => {
        if (data.success) setNewsData(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải tin tức:', err);
        setLoading(false);
      });
  }, []);

  const featuredArticle = newsData.find(n => n.featured) || newsData[0];
  const gridArticles = newsData.filter(n => n.id !== featuredArticle?.id);

  const openArticle = (article) => setSelectedArticle(article);
  const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        Đang tải tin tức...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6f9fc', paddingBottom: '5rem', fontFamily: "'Inter', sans-serif" }}>
      <section style={{
        position: 'relative',
        background: `url("${fallbackImage}") center/cover no-repeat`,
        padding: '5rem 2rem 7rem',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(8,29,46,0.9), rgba(15,118,110,0.78))' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) 360px', gap: '2rem', alignItems: 'end' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.42rem 0.75rem', background: 'rgba(255,255,255,0.12)', color: '#dffcf6', borderRadius: 999, fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.18)' }}>
              <Newspaper size={14} /> EstateAI Newsroom
            </span>
            <h1 style={{ fontSize: 'clamp(2.1rem, 4vw, 3.45rem)', fontWeight: 900, margin: '1rem 0 1rem', color: '#ffffff', lineHeight: 1.08 }}>
              Tin tức bất động sản và góc nhìn thị trường
            </h1>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.84)', maxWidth: 680, margin: 0, lineHeight: 1.7 }}>
              Cập nhật xu hướng giá, pháp lý, quy hoạch và các bài phân tích giúp người mua đưa ra quyết định chắc chắn hơn.
            </p>
          </motion.div>

          <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 18, padding: '1rem', color: 'white', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.72)', marginBottom: '0.35rem' }}>Đang theo dõi</div>
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              {['Thị trường', 'Pháp lý', 'Quy hoạch'].map((item, i) => (
                <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.72rem 0.85rem', fontWeight: 800 }}>
                  <span>{item}</span>
                  <span style={{ color: '#bff3e7' }}>{newsData.filter(n => n.category === item).length || i + 2}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1180, margin: '-4.3rem auto 0', padding: '0 1.25rem', position: 'relative', zIndex: 10 }}>
        {featuredArticle && (
          <motion.article
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => openArticle(featuredArticle)}
            style={{
              background: 'white',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 22px 55px rgba(15,42,68,0.13)',
              border: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)',
              cursor: 'pointer'
            }}
          >
            <div style={{ minHeight: 340, position: 'relative', overflow: 'hidden' }}>
              <img src={featuredArticle.image || fallbackImage} alt={featuredArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              <span style={{ position: 'absolute', top: 18, left: 18, background: '#0f766e', color: 'white', padding: '0.42rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800 }}>
                {featuredArticle.category}
              </span>
            </div>
            <div style={{ padding: '2.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem' }}>
                <Clock size={14} /> {formatDate(featuredArticle.createdAt)}
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                <span>{featuredArticle.sourceUrl ? 'Có URL nguồn' : 'Bài viết EstateAI'}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.55rem, 3vw, 2.3rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, margin: '0 0 1rem' }}>{featuredArticle.title}</h2>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7, margin: '0 0 1.5rem' }}>{featuredArticle.excerpt}</p>
              <button type="button" style={{ alignSelf: 'flex-start', background: '#0f2a44', color: 'white', border: 'none', padding: '0.78rem 1.15rem', borderRadius: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
                Đọc chi tiết <ArrowRight size={16} />
              </button>
            </div>
          </motion.article>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '3rem 0 1.4rem' }}>
          <div>
            <div style={{ color: '#0f766e', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Cập nhật mới</div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Bài viết mới nhất</h3>
          </div>
          <button style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f766e', fontWeight: 800, padding: '0.6rem 0.85rem', borderRadius: 10, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}>
            Xem tất cả <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: '1.25rem' }}>
          {gridArticles.map((news, index) => (
            <motion.article
              key={news.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.06, duration: 0.42 }}
              onClick={() => openArticle(news)}
              style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', cursor: 'pointer', boxShadow: '0 10px 28px rgba(15,42,68,0.05)' }}
            >
              <div style={{ position: 'relative', height: 178, overflow: 'hidden' }}>
                <img src={news.image || fallbackImage} alt={news.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.95)', padding: '0.32rem 0.62rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800, color: '#0f766e' }}>{news.category}</div>
              </div>
              <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.76rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                  <Clock size={12} /> {formatDate(news.createdAt)}
                </div>
                <h3 style={{ margin: '0 0 0.65rem', fontSize: '1.02rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.35 }}>{news.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.58, margin: '0 0 1rem', flex: 1 }}>{news.excerpt}</p>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0f766e', fontWeight: 800, fontSize: '0.84rem' }}>
                  Đọc chi tiết
                  <ArrowRight size={15} />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </main>

      {selectedArticle && (
        <div onClick={() => setSelectedArticle(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.62)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <motion.article
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', width: 860, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: 20, boxShadow: '0 30px 90px rgba(15,23,42,0.28)' }}
          >
            <div style={{ position: 'relative', height: 310, overflow: 'hidden' }}>
              <img src={selectedArticle.image || fallbackImage} alt={selectedArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => setSelectedArticle(null)} style={{ position: 'absolute', top: 16, right: 16, width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(15,23,42,0.58)', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
              <div style={{ position: 'absolute', left: 20, bottom: 20, background: '#0f766e', color: 'white', padding: '0.45rem 0.75rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 900 }}>{selectedArticle.category}</div>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#64748b', fontSize: '0.84rem', fontWeight: 700, marginBottom: '1rem' }}>
                <Clock size={14} /> {formatDate(selectedArticle.createdAt)}
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                <span>Bởi {selectedArticle.author || 'Admin'}</span>
              </div>
              <h2 style={{ margin: '0 0 1rem', color: '#0f172a', fontSize: 'clamp(1.55rem, 3vw, 2.35rem)', lineHeight: 1.22, fontWeight: 900 }}>{selectedArticle.title}</h2>
              <p style={{ margin: '0 0 1.5rem', color: '#475569', fontSize: '1rem', lineHeight: 1.75, fontWeight: 600 }}>{selectedArticle.excerpt}</p>
              <div style={{ color: '#334155', fontSize: '0.98rem', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                {selectedArticle.content || 'Bài viết này đang liên kết tới nguồn báo gốc. Bạn có thể mở liên kết bên dưới để đọc toàn bộ nội dung.'}
              </div>
              {selectedArticle.sourceUrl && (
                <a href={selectedArticle.sourceUrl} target="_blank" rel="noreferrer" style={{ marginTop: '1.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', textDecoration: 'none', padding: '0.82rem 1.1rem', borderRadius: 11, fontWeight: 900 }}>
                  Mở bài báo gốc <ExternalLink size={16} />
                </a>
              )}
            </div>
          </motion.article>
        </div>
      )}
    </div>
  );
}
