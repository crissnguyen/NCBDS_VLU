import { Check, X, ShieldCheck, Image as ImageIcon } from 'lucide-react';

export default function PendingPropertiesTab({ pendingProperties, handleApproveProperty }) {
  return (
    <>
{/* TAB 2: Phê duyệt */}
                        <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Phê duyệt tin đăng</h2><p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>{pendingProperties.length > 0 ? `${pendingProperties.length} tin đang chờ xét duyệt` : 'Không có tin nào cần duyệt'}</p></div>
              {pendingProperties.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 14, padding: '3.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#d8f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><ShieldCheck size={28} color="#0f766e"/></div>
                  <h3 style={{ margin: '0 0 0.4rem' }}>Tất cả tin đã được xử lý!</h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>Mọi thứ đã xong, không có gì cần làm ngay lúc này.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {pendingProperties.map(p => (
                    <div key={p.id} className="pending-property-card">
                      <div style={{ width: 140, height: 96, borderRadius: 10, overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, position: 'relative' }}>
                        {p.images?.length > 0 ? <img src={(p.images[0].startsWith('http') || p.images[0].startsWith('data:image') ? p.images[0] : `https://ncbds-vlu.onrender.com${p.images[0]}`)} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:3 }}><ImageIcon size={22} color="#cbd5e1"/><span style={{fontSize:'0.68rem',color:'#cbd5e1'}}>Chưa có ảnh</span></div>}
                        {p.images?.length > 1 && <div style={{ position:'absolute',top:5,right:5,background:'rgba(0,0,0,0.55)',color:'white',borderRadius:5,fontSize:'0.68rem',fontWeight:700,padding:'1px 6px' }}>+{p.images.length-1}</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',marginBottom:'0.3rem' }}>
                          <h3 style={{ margin:0,fontSize:'0.95rem',fontWeight:700,color:'#0f172a' }}>{p.title}</h3>
                          <span style={{ background:'#fef3c7',color:'#d97706',padding:'2px 9px',borderRadius:99,fontSize:'0.7rem',fontWeight:700,flexShrink:0 }}>⏳ Chờ duyệt</span>
                        </div>
                        <div style={{ fontSize:'1rem',fontWeight:800,color:'#ef4444',marginBottom:'0.4rem' }}>{p.price||'Liên hệ'}</div>
                        <div style={{ display:'flex',gap:'0.75rem',fontSize:'0.78rem',color:'#64748b',marginBottom:'0.4rem' }}>
                          {p.location && <span>📍 {p.location}</span>}
                          {p.area && <span>📐 {p.area}m²</span>}
                        </div>
                        <div style={{ fontSize:'0.78rem',color:'#64748b' }}>Đăng bởi: <strong style={{color:'#0f172a'}}>{p.author?.name||'Ẩn danh'}</strong>{p.author?.email && <span style={{color:'#94a3b8'}}> · {p.author.email}</span>}</div>
                      </div>
                      <div className="pending-property-card-actions">
                        <button onClick={() => handleApproveProperty(p.id, 'approve')} style={{ background:'linear-gradient(135deg,#0f766e,#0891b2)',color:'white',border:'none',borderRadius:9,padding:'0.55rem 1rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.82rem',boxShadow:'0 2px 6px rgba(15,118,110,0.3)' }}><Check size={14}/> Phê duyệt</button>
                        <button onClick={() => handleApproveProperty(p.id, 'reject')} style={{ background:'#fef2f2',color:'#ef4444',border:'1px solid #fecaca',borderRadius:9,padding:'0.55rem 1rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.82rem' }}><X size={14}/> Từ chối</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            

          
    </>
  );
}