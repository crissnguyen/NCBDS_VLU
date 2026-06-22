import { useState } from 'react';
import { Bot, Send, User, X, MessageSquare, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { properties } from '../data/properties';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Chào bạn, tôi là trợ lý AI Estate. Bạn đang tìm mua hay thuê bất động sản?' },
  ]);
  const [input, setInput] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simulate AI thinking and responding
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Tôi đã lọc ra một số căn phù hợp với yêu cầu của bạn. Xem ngay ở dưới nhé!' 
      }]);
      setShowResults(true);
    }, 1000);
  };

  const handleQuickReply = (text) => {
    setInput(text);
    // automatically trigger send in next render tick
    setTimeout(() => {
      document.getElementById('chat-form-submit').click();
    }, 100);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '66px',
              height: '66px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #14b8a6)',
              color: 'white',
              border: '4px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 20px 45px rgba(79, 70, 229, 0.32), 0 0 0 10px rgba(79, 70, 229, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 9999
            }}
          >
            <MessageSquare size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass"
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '400px',
              height: '650px',
              maxHeight: '85vh',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 30px 70px rgba(15, 23, 42, 0.2)',
              zIndex: 9999,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem',
              background: 'linear-gradient(135deg, #4f46e5, #0f766e)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'white', padding: '0.5rem', borderRadius: '50%' }}>
                  <Bot size={20} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>Trợ lý EstateAI</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div>
                    Online
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat History */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  gap: '0.75rem', 
                  alignItems: 'flex-start',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: msg.sender === 'user' ? 'var(--surface-hover)' : 'rgba(79, 70, 229, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: msg.sender === 'user' ? 'var(--text-secondary)' : 'var(--primary)'
                  }}>
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div style={{
                    background: msg.sender === 'user' ? 'var(--primary)' : '#f1f5f9',
                    color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                    padding: '0.75rem 1rem',
                    borderRadius: '16px',
                    borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                    borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    maxWidth: '80%'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Property Suggestions (if triggered) */}
              {showResults && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginLeft: '40px', maxWidth: '80%' }}
                >
                    <div style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    {/* Render a miniature property card or just info */}
                    <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tìm thấy 2 kết quả</span>
                      <Maximize2 size={14} style={{ cursor: 'pointer' }}/>
                    </div>
                    <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {properties.slice(0, 1).map(p => (
                        <div key={p.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: `url(${p.image}) center/cover` }}></div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>{p.price}</div>
                            <div style={{ fontSize: '0.85rem' }}>{p.title.substring(0, 20)}...</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: '#ffffff' }}>
              {/* Quick Replies */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', scrollbarWidth: 'none' }}>
                {['Tôi muốn mua nhà', 'Cho thuê căn hộ', 'Tư vấn pháp lý', 'Thủ tục vay vốn'].map(chip => (
                  <button 
                    key={chip} 
                    onClick={() => handleQuickReply(chip)}
                    style={{ whiteSpace: 'nowrap', padding: '0.4rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-full)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Hỏi AI bất cứ điều gì..." 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-full)', background: '#f8fafc', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                <button 
                  id="chat-form-submit"
                  type="submit" 
                  style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
