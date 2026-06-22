import { useState } from 'react';
import { AlertCircle, CheckCircle2, Sparkles, ImagePlus, X } from 'lucide-react';
import { Field, PageShell } from '../components/ui';

export default function PostProperty({ currentUser }) {
  const [formData, setFormData] = useState({
    transactionType: 'sale',
    propertyType: 'apartment',
    location: '',
    price: '',
    area: '',
    beds: '',
    baths: '',
    legalStatus: 'pink-book',
    description: ''
  });
  
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Lỗi lấy khu vực:", err));
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title && !formData.location) {
      alert("Vui lòng nhập tiêu đề hoặc vị trí!");
      return;
    }

    setLoading(true);
    const submitData = new FormData();
    submitData.append('title', formData.propertyType === 'apartment' ? `Bán căn hộ tại ${formData.location}` : `Bán nhà tại ${formData.location}`);
    
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    if (currentUser?.id) {
      submitData.append('authorId', currentUser.id);
    }

    images.forEach(image => {
      submitData.append('images', image);
    });

    try {
      const response = await fetch('http://localhost:5001/api/properties', {
        method: 'POST',
        body: submitData,
      });
      const result = await response.json();
      if (result.success) {
        alert("Đăng tin thành công! Tin của bạn đang chờ Admin phê duyệt.");
        setFormData({
          transactionType: 'sale', propertyType: 'apartment', location: '', price: '', area: '', beds: '', baths: '', legalStatus: 'pink-book', description: ''
        });
        setImages([]);
        setPreviewUrls([]);
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="Đăng tin"
      title="Đăng tin bất động sản"
      description="Form được chia theo bước: loại tin, thông tin lõi, ảnh, mô tả AI và xác thực. Sidebar AI luôn cho biết tin còn thiếu gì."
    >
      <div className="post-layout">
        <section className="form-panel">
          <div className="stepper">
            {['Loại tin', 'Thông tin', 'Ảnh', 'AI mô tả', 'Xác thực'].map((step, index) => (
              <span key={step} className={index < 3 ? 'active' : ''}>{step}</span>
            ))}
          </div>

          <div className="form-grid">
            <Field label="Loại giao dịch">
              <select name="transactionType" value={formData.transactionType} onChange={handleChange}>
                <option value="sale">Bán</option>
                <option value="rent">Cho thuê</option>
              </select>
            </Field>
            <Field label="Loại BĐS">
              <select name="propertyType" value={formData.propertyType} onChange={handleChange}>
                <option value="apartment">Căn hộ</option>
                <option value="house">Nhà phố</option>
                <option value="land">Đất nền</option>
              </select>
            </Field>
            <Field label="Khu vực">
              <select name="location" value={formData.location} onChange={handleChange}>
                <option value="" disabled>-- Chọn Tỉnh / Thành phố --</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Giá">
              <input name="price" value={formData.price} onChange={handleChange} placeholder="Ví dụ: 2.85 Tỷ" />
            </Field>
            <Field label="Diện tích (m²)">
              <input name="area" type="number" value={formData.area} onChange={handleChange} placeholder="Ví dụ: 68" />
            </Field>
            <Field label="Số phòng ngủ">
              <input name="beds" type="number" value={formData.beds} onChange={handleChange} placeholder="Ví dụ: 2" />
            </Field>
            <Field label="Số phòng tắm">
              <input name="baths" type="number" value={formData.baths} onChange={handleChange} placeholder="Ví dụ: 2" />
            </Field>
            <Field label="Pháp lý">
              <select name="legalStatus" value={formData.legalStatus} onChange={handleChange}>
                <option value="pink-book">Sổ hồng</option>
                <option value="contract">Hợp đồng mua bán</option>
                <option value="unknown">Đang cập nhật</option>
              </select>
            </Field>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Field label="Upload Ảnh">
              <div style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                <ImagePlus size={32} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Kéo thả hoặc click để chọn nhiều ảnh</p>
              </div>
              
              {previewUrls.length > 0 && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {previewUrls.map((url, index) => (
                    <div key={index} style={{ position: 'relative', width: 100, height: 100, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={() => removeImage(index)}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: 4, cursor: 'pointer', display: 'flex' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Field label="Mô tả chi tiết">
              <textarea name="description" rows={4} value={formData.description} onChange={handleChange} placeholder="Mô tả về bất động sản của bạn..." />
            </Field>
          </div>

          <div className="flex justify-end gap-3" style={{ marginTop: '1.25rem' }}>
            <button className="btn btn-ghost" disabled={loading}>Lưu nháp</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang xử lý...' : <><Sparkles size={18} /> Gửi duyệt tin đăng</>}
            </button>
          </div>
        </section>

        <aside className="side-panel">
          <h3 className="flex items-center gap-2"><Sparkles size={20} color="var(--primary)" /> AI chấm điểm tin</h3>
          <div className="score-ring"><strong>{formData.images?.length > 0 ? '90' : '65'}</strong><span>/100</span></div>
          <ul className="check-list">
            <li><CheckCircle2 size={17} color="var(--secondary)" /> Thông tin cơ bản đầy đủ.</li>
            <li><CheckCircle2 size={17} color="var(--secondary)" /> Giá thấp hơn trung bình khu vực khoảng 4%.</li>
            {previewUrls.length === 0 && <li><AlertCircle size={17} color="var(--warning)" /> Bạn cần tải lên ít nhất 1 ảnh.</li>}
            {formData.description.length < 50 && <li><AlertCircle size={17} color="var(--warning)" /> Mô tả hơi ngắn, nên chi tiết hơn.</li>}
            <li><AlertCircle size={17} color="var(--warning)" /> Upload sổ hồng để nhận badge xác thực.</li>
          </ul>
        </aside>
      </div>
    </PageShell>
  );
}
