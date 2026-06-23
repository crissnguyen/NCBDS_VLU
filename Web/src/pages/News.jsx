import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Clock, ChevronRight } from 'lucide-react';

export default function News() {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://ncbds-vlu.onrender.com/api/news')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNewsData(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải tin tức:', err);
        setLoading(false);
      });
  }, []);

  const featuredArticle = newsData.find(n => n.featured);
  const gridArticles = newsData.filter(n => !n.featured);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        Đang tải tin tức...
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 0, minHeight: '100vh', background: '#f8fafc', paddingBottom: '5rem', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Hero Banner with Background Image */}
      <div style={{ 
        position: 'relative',
        background: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80") center/cover no-repeat',
        padding: '6rem 2rem 8rem',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Dark overlay for contrast */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,23,42,0.8), rgba(15,118,110,0.85))' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span style={{ display: 'inline-block', padding: '0.5rem 1.2rem', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '30px', backdropFilter: 'blur(10px)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              EstateAI News
            </span>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, margin: '0 0 1.5rem', color: '#ffffff', lineHeight: 1.15, textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              Tin tức Thị trường
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.9)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6, fontWeight: 400 }}>
              Cập nhật chuyên sâu về diễn biến thị trường, phân tích đầu tư và xu hướng quy hoạch bất động sản tại Việt Nam.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 1.25rem', position: 'relative', zIndex: 10 }}>
        
        {/* Featured Article (Lifted up over the hero) */}
        {featuredArticle && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ 
              marginTop: '-5rem', 
              marginBottom: '4rem',
              background: 'white', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap'
            }}
            className="featured-article"
          >
            <style>{`
              .featured-img-wrapper { flex: 1; min-width: 300px; min-height: 350px; position: relative; overflow: hidden; }
              .featured-content { flex: 1; min-width: 300px; padding: 3.5rem; display: flex; flex-direction: column; justify-content: center; }
              @media (max-width: 768px) { .featured-content { padding: 2rem; } }
            `}</style>
            <div className="featured-img-wrapper">
              <img 
                src={featuredArticle.image} 
                alt={featuredArticle.title} 
                style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(15,118,110,0.95)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {featuredArticle.category}
              </div>
            </div>
            <div className="featured-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {new Date(featuredArticle.createdAt).toLocaleDateString('vi-VN')}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                <span>Bởi {featuredArticle.author}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, margin: '0 0 1.25rem' }}>
                {featuredArticle.title}
              </h2>
              <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, margin: '0 0 2rem' }}>
                {featuredArticle.excerpt}
              </p>
              <div>
                <button style={{ 
                  background: '#0f172a', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.8rem 1.5rem', 
                  borderRadius: '12px', 
                  fontWeight: 600, 
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#0f766e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Đọc toàn bộ <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Bài viết mới nhất</h3>
          <button style={{ background: 'none', border: 'none', color: '#0f766e', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}>
            Xem tất cả <ChevronRight size={16} />
          </button>
        </div>

        {/* Grid Articles */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2rem' 
        }}>
          {gridArticles.map((news, index) => (
            <motion.article 
              key={news.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              style={{ 
                background: 'white', 
                borderRadius: '20px', 
                overflow: 'hidden', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img 
                  src={news.image} 
                  alt={news.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  className="card-img"
                />
                <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.95)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', backdropFilter: 'blur(4px)' }}>
                  {news.category}
                </div>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> {new Date(news.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <h3 style={{ margin: '0 0 0.8rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4, transition: 'color 0.2s' }}>
                  {news.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.5rem', flex: 1 }}>
                  {news.excerpt}
                </p>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Bởi {news.author}</span>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f766e', transition: 'background 0.2s' }}>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
