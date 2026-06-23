import { PostPropertyForm } from '../../../components/DashboardShared';

export default function PostPropertyTab({ currentUser, toast, fetchData }) {
  return (
    <>
{/* TAB 3: Đăng tin */}
                        <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Đăng tin bất động sản mới</h2><p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Tin đăng từ Admin sẽ được phê duyệt tự động và hiển thị ngay lập tức.</p></div>
              <PostPropertyForm currentUser={currentUser} toast={toast} onSuccess={fetchData} />
            
          
    </>
  );
}