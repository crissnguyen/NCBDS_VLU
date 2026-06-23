import { Settings, Bell, ShieldCheck } from 'lucide-react';

export default function SettingsTab() {
  return (
    <>
{/* TAB 5: Cài đặt */}
                        <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Cài đặt hệ thống</h2></div>
              {[
                { title: 'Thông báo email tự động', desc: 'Gửi email khi có tin đăng mới hoặc cần phê duyệt', on: true },
                { title: 'Phê duyệt tự động (Sale hiệu suất cao)', desc: 'Tự động duyệt tin từ Sale có hiệu suất > 90%', on: false },
                { title: 'AI Copilot phân tích giá', desc: 'Gợi ý giá thị trường hợp lý dựa trên AI', on: true },
                { title: 'Chế độ bảo trì', desc: 'Tạm thời ẩn website khỏi người dùng thông thường', on: false },
              ].map((s, i) => (
                <div key={i} style={{ background:'white',borderRadius:14,border:'1px solid #e2e8f0',padding:'1.1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div><div style={{ fontWeight:700,color:'#0f172a',fontSize:'0.9rem',marginBottom:3 }}>{s.title}</div><div style={{ fontSize:'0.8rem',color:'#64748b' }}>{s.desc}</div></div>
                  <div style={{ width:46,height:25,borderRadius:13,background:s.on?'#0f766e':'#e2e8f0',position:'relative',cursor:'pointer',flexShrink:0 }}>
                    <div style={{ position:'absolute',top:3,left:s.on?24:3,width:19,height:19,borderRadius:'50%',background:'white',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
                  </div>
                </div>
              ))}
            

        
    </>
  );
}