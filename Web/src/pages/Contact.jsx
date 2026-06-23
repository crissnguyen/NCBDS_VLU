import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, User, Clock, CheckCircle } from 'lucide-react';
import { Field } from '../components/ui';
import { dataService } from '../services/data/dataService';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await dataService.createContactRequest({
        name,
        email,
        phone,
        subject,
        message
      });
      if (res.success) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      } else {
        alert(res.message || 'Gửi liên hệ thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi gửi liên hệ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '100px', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: 1140, margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: '#0f766e', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Liên hệ với chúng tôi
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, color: '#0f172a', margin: '0.5rem 0 1rem' }}
          >
            Chúng tôi luôn sẵn sàng lắng nghe bạn
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}
          >
            Gửi thắc mắc, phản hồi hoặc yêu cầu tư vấn bất động sản của bạn. Đội ngũ EstateAI sẽ phản hồi trong vòng 24 giờ làm việc.
          </motion.p>
        </div>

        {/* Content Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          
          {/* Left Column: Contact info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ background: 'white', border: '1px solid var(--border)', padding: '2.5rem', borderRadius: 24, boxShadow: '0 20px 40px rgba(15,23,42,0.05)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Thông tin liên hệ</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>Liên hệ trực tiếp qua Hotline hoặc Email để nhận tư vấn ngay lập tức.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--secondary-soft)', color: 'var(--secondary)', padding: '0.75rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Hotline</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--text-primary)' }}>+84 987 654 321</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--secondary-soft)', color: 'var(--secondary)', padding: '0.75rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Email</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--text-primary)' }}>support@estateai.vn</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--secondary-soft)', color: 'var(--secondary)', padding: '0.75rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Địa chỉ</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 650, marginTop: '0.2rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>Đại học Văn Lang, 69/68 Đặng Thùy Trâm, Phường 13, Bình Thạnh, TP. Hồ Chí Minh</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--secondary-soft)', color: 'var(--secondary)', padding: '0.75rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Giờ làm việc</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 650, marginTop: '0.2rem', color: 'var(--text-primary)' }}>T2 - CN: 08:00 - 20:00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Mock/Placeholder */}
            <div style={{ background: 'white', borderRadius: 24, padding: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)', border: '1px solid #e2e8f0', height: 220, position: 'relative', overflow: 'hidden' }}>
              <iframe 
                title="Văn Lang University Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.925055106173!2d106.69742461462061!3d10.817042461399879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391c49942a6c4df1%3A0xe54e3d37a544c9b9!2zNjkvNjggxJDhurduZyBUaMO5eSBUcsOibSwgUGjGsOG7nW5nIDEzLCBCw6xuaCBUaOG6oW5oLCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1687520000000!5m2!1sen!2s"
                width="100%" 
                height="100%" 
                style={{ border: 0, borderRadius: 16 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ background: 'white', borderRadius: 24, padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(15,23,42,0.05)', display: 'flex', flexDirection: 'column' }}
          >
            {submitted ? (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: '2rem 0' }}
              >
                <div style={{ color: '#0f766e', marginBottom: '1.5rem' }}>
                  <CheckCircle size={64} style={{ fill: '#d8f3ef' }} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Gửi liên hệ thành công!</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 2rem', lineHeight: 1.5 }}>Cảm ơn bạn đã tin tưởng EstateAI. Chúng tôi sẽ phản hồi lại bạn sớm nhất có thể.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="btn btn-primary"
                  style={{ borderRadius: 12, padding: '0.65rem 1.5rem', fontWeight: 700 }}
                >
                  Gửi thêm thư liên hệ
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>Gửi thư cho chúng tôi</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>Điền thông tin của bạn vào form dưới đây.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <Field label="Họ và tên">
                    <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                      <User size={18} />
                      <input 
                        type="text" 
                        placeholder="Nhập họ tên của bạn" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </Field>

                  <Field label="Số điện thoại">
                    <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                      <Phone size={18} />
                      <input 
                        type="tel" 
                        placeholder="Nhập số điện thoại" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </Field>
                </div>

                <Field label="Địa chỉ email">
                  <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                    <Mail size={18} />
                    <input 
                      type="email" 
                      placeholder="Nhập email của bạn" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </Field>

                <Field label="Chủ đề cần tư vấn">
                  <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                    <MessageSquare size={18} />
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Cần mua căn hộ 2 phòng ngủ..." 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                </Field>

                <Field label="Nội dung lời nhắn">
                  <textarea 
                    placeholder="Mô tả chi tiết nhu cầu hoặc thắc mắc của bạn..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      fontSize: '0.92rem',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      color: 'var(--text-primary)',
                      transition: 'border-color var(--transition-fast)'
                    }}
                  />
                </Field>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderRadius: '12px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    width: '100%',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    border: 'none',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.15)',
                    cursor: 'pointer'
                  }}
                >
                  <Send size={18} />
                  {isSubmitting ? 'Đang gửi thông tin...' : 'Gửi liên hệ'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
