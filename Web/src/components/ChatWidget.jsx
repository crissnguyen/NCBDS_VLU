import { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, X, Maximize2, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { properties } from '../data/properties';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyA3zyV9shYc8yYAKH70nQAkqj_KwKbzFNY";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi là trợ lý AI thông minh của EstateAI. 👋 Bạn cần tìm mua nhà, thuê căn hộ hay xem định giá?' },
  ]);
  const [input, setInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, showResults]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Build history for fetch API
      const contents = [];
      for (let i = 1; i < messages.length; i++) {
        const role = messages[i].sender === 'user' ? 'user' : 'model';
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += "\n" + messages[i].text;
        } else {
          contents.push({ role, parts: [{ text: messages[i].text }] });
        }
      }
      
      // Ensure alternating roles and correct ending
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents.push({ role: 'model', parts: [{ text: 'Đồng ý.' }] });
      }
      
      // Add current input
      contents.push({ role: 'user', parts: [{ text: input }] });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            role: 'system',
            parts: [{ text: "Bạn là trợ lý AI của nền tảng bất động sản EstateAI. TUYỆT ĐỐI trả lời cực kỳ ngắn gọn, súc tích, đi thẳng vào vấn đề. Tối đa 2-3 câu. Không chào hỏi dài dòng." }]
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Lỗi kết nối API");
      }

      const responseText = data.candidates[0].content.parts[0].text;
      
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: responseText
      }]);
      setShowResults(false);
    } catch (error) {
      console.error("Gemini Error:", error);
      let errorMsg = "Xin lỗi, hệ thống AI đang gặp chút sự cố kết nối.";
      if (error.message.includes("quota") || error.message.includes("429")) {
        errorMsg = "API Key của bạn đã đạt giới hạn truy cập tạm thời (quá tải). Vui lòng đợi khoảng 10-15 giây rồi thử lại nhé!";
      } else {
        errorMsg = `Xin lỗi, có lỗi xảy ra: ${error.message}`;
      }
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: errorMsg 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (text) => {
    setInput(text);
    setTimeout(() => {
      document.getElementById('chat-form-submit')?.click();
    }, 50);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}
          >
            {/* Glowing ring animation behind button */}
            <div style={{
              position: 'absolute', inset: -5, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              filter: 'blur(15px)', opacity: 0.6, animation: 'pulse 2s infinite'
            }} />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'white',
                border: '3px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Bot size={30} />
            </motion.button>
            <style>{`@keyframes pulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(0.95); opacity: 0.5; } }`}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{
              position: 'fixed', bottom: '2rem', right: '2rem',
              width: '400px', height: '650px', maxHeight: '85vh',
              borderRadius: '24px',
              display: 'flex', flexDirection: 'column',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 25px 80px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(255,255,255,0.5) inset',
              zIndex: 9999, overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--secondary) 100%)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ position: 'relative', display: 'flex' }}>
                  <div style={{ background: 'linear-gradient(135deg, #fff, #e2e8f0)', padding: '0.55rem', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', display: 'flex' }}>
                    <Bot size={22} color="var(--secondary)" />
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: '#10b981', borderRadius: '50%', border: '2px solid var(--primary-dark)' }}></div>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: 800, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    EstateAI <Sparkles size={14} color="var(--accent)" />
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#e2f3f1', fontWeight: 500 }}>Sẵn sàng hỗ trợ 24/7</div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat History */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'linear-gradient(180deg, rgba(248,250,252,0.8) 0%, rgba(255,255,255,0.5) 100%)' }}>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', margin: '-0.5rem 0 0.5rem' }}>Hôm nay</div>
              
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  style={{ 
                    display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: msg.sender === 'user' ? 'var(--surface-muted)' : 'linear-gradient(135deg, var(--secondary), var(--primary-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: msg.sender === 'user' ? '#475569' : 'white',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                  }}>
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div 
                    style={{
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--primary-light), var(--primary))' : 'white',
                      color: msg.sender === 'user' ? 'white' : '#1e293b',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '20px',
                      borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px',
                      borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '20px',
                      fontSize: '0.92rem', lineHeight: 1.5, maxWidth: '78%',
                      boxShadow: msg.sender === 'user' ? '0 8px 20px rgba(15, 42, 68, 0.2)' : '0 4px 15px rgba(0,0,0,0.03)',
                      border: msg.sender === 'bot' ? '1px solid #f1f5f9' : 'none'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />')
                    }}
                  />
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--secondary), var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Bot size={16} />
                  </div>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '20px', borderBottomLeftRadius: '4px', display: 'flex', gap: '0.3rem', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%' }} />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%' }} />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%' }} />
                  </div>
                </motion.div>
              )}

              {showResults && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ marginLeft: '40px', maxWidth: '82%' }}
                >
                  <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} color="var(--secondary)" /> Kết quả đề xuất</span>
                      <Maximize2 size={14} style={{ cursor: 'pointer', color: 'var(--secondary)' }}/>
                    </div>
                    <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {properties.slice(0, 1).map(p => (
                        <div key={p.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer' }}>
                          <div style={{ width: '65px', height: '65px', borderRadius: '10px', background: `url(${p.image}) center/cover` }}></div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--secondary)' }}>{p.price}</div>
                            <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{p.location}</div>
                          </div>
                        </div>
                      ))}
                      <button style={{ width: '100%', padding: '0.5rem', background: 'var(--secondary-soft)', color: 'var(--secondary)', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.2rem' }}>Xem chi tiết (2 căn)</button>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.95)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              {/* Quick Replies */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.85rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`::-webkit-scrollbar { display: none; }`}</style>
                {['Môi giới viên', 'Căn hộ Hà Nội', 'Giá đất quận 2', 'Lãi suất vay mua nhà'].map(chip => (
                  <button 
                    key={chip} 
                    onClick={() => handleQuickReply(chip)}
                    style={{ whiteSpace: 'nowrap', padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: 600, borderRadius: '20px', background: 'white', border: '1px solid #cbd5e1', color: '#475569', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--secondary)'; e.currentTarget.style.color = 'var(--secondary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', position: 'relative' }}>
                <textarea 
                  placeholder="Hỏi EstateAI điều gì đó..." 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  rows={1}
                  style={{ flex: 1, padding: '0.85rem 1.25rem', paddingRight: '3rem', borderRadius: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none', resize: 'none', fontSize: '0.9rem', lineHeight: 1.4, transition: 'all 0.3s' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--secondary)'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
                <button 
                  id="chat-form-submit"
                  type="submit" 
                  disabled={!input.trim()}
                  style={{ position: 'absolute', right: '0.35rem', bottom: '0.35rem', width: '36px', height: '36px', borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : '#e2e8f0', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.3s' }}
                >
                  <Send size={16} style={{ marginLeft: '-2px' }} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
