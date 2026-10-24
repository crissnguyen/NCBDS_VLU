import { useEffect, useRef, useState } from 'react';
import { FileText, Upload, LoaderCircle, CheckCircle, X } from 'lucide-react';
import { apiUrl, authFetch } from '../services/api';

const LABELS = {
  title: 'Tiêu đề', transactionType: 'Giao dịch', propertyType: 'Loại bất động sản',
  location: 'Địa chỉ', price: 'Giá', area: 'Diện tích (m²)', beds: 'Phòng ngủ', baths: 'Phòng tắm', legalStatus: 'Pháp lý',
};
const OPTIONS = {
  transactionType: { sale: 'Bán', rent: 'Cho thuê' },
  propertyType: { apartment: 'Căn hộ', house: 'Nhà phố', land: 'Đất nền' },
  legalStatus: { 'pink-book': 'Sổ hồng', 'red-book': 'Sổ đỏ', contract: 'Hợp đồng mua bán', unknown: 'Đang cập nhật' },
};

export default function PropertyDocumentImport({ onApply, disabled }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [applied, setApplied] = useState('');
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const input = useRef(null);
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);

  const readFile = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setApplied('');
    setPreview(null);
    if (!/\.(pdf|docx|txt|md)$/i.test(file.name)) {
      setError('Chỉ hỗ trợ PDF có chữ, Word (.docx), .txt và .md.');
      return;
    }
    if (!file.size || file.size > 5 * 1024 * 1024) {
      setError(file.size ? 'Tài liệu vượt quá 5MB.' : 'Tài liệu không có nội dung.');
      return;
    }
    controller.current?.abort();
    const requestController = new AbortController();
    controller.current = requestController;
    const timeout = setTimeout(() => requestController.abort(), 60000);
    setBusy(true);
    try {
      const body = new FormData();
      body.append('document', file);
      const response = await authFetch(apiUrl('properties/import-document'), {
        method: 'POST', body, signal: requestController.signal,
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Không thể đọc tài liệu.');
      setPreview({ ...result.data, filename: file.name });
      setOnlyEmpty(false);
    } catch (error) {
      setError(error.name === 'AbortError' ? 'Đọc tài liệu quá lâu. Vui lòng thử lại với file nhỏ hơn.' : error.message || 'Không thể kết nối máy chủ.');
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  };

  const apply = () => {
    for (const field of ['area', 'beds', 'baths']) {
      const value = preview.property[field];
      if (value === undefined || value === '') continue;
      const number = Number(value);
      if (!Number.isFinite(number) || number < 0 || (field === 'area' ? number === 0 : !Number.isInteger(number))) {
        setError(`${LABELS[field]} phải là ${field === 'area' ? 'số lớn hơn 0' : 'số nguyên từ 0 trở lên'}.`);
        return;
      }
    }
    setError('');
    onApply(preview.property, { onlyEmpty });
    setApplied(preview.filename);
    setPreview(null);
  };

  return <section className="document-import" aria-label="Nhập tài liệu bất động sản" aria-busy={busy}>
    <div className="document-import-heading">
      <span className="document-import-icon"><FileText size={23} /></span>
      <div><h4>Điền tin từ tài liệu</h4><p>Tải PDF có chữ để tự nhận diện thông tin và bố cục bài đăng.</p></div>
    </div>
    <div className="document-import-toolbar">
      <input ref={input} type="file" accept=".pdf,.docx,.txt,.md" aria-label="Chọn tài liệu bất động sản" onChange={readFile} hidden disabled={busy || disabled} />
      <button type="button" onClick={() => input.current?.click()} disabled={busy || disabled}>
        {busy ? <LoaderCircle size={16} className="document-import-spinner" /> : <Upload size={16} />}
        {busy ? 'Đang đọc và nhận diện…' : 'Chọn tài liệu'}
      </button>
      <a href="/mau-tai-lieu-bat-dong-san.docx" download>Tải mẫu Word (.docx)</a>
    </div>
    <p className="document-import-help">PDF có chữ, DOCX, TXT, MD · Tối đa 5MB · Một bất động sản mỗi file</p>
    <p className="document-import-help">Nhận diện nội dung, đề mục và xuống dòng; bạn có thể chỉnh lại trước khi đăng. PDF scan ảnh cần OCR trước.</p>
    {error && <p className="document-import-error" role="alert">{error}</p>}
    {applied && <p className="document-import-success" role="status"><CheckCircle size={15} /> Đã điền từ “{applied}”. Kiểm tra thông tin bên dưới và bổ sung hình ảnh.</p>}
    {preview && <div className="document-import-preview">
      <div className="document-import-preview-heading"><strong>Kết quả: {preview.filename}</strong><button type="button" className="document-import-dismiss" aria-label="Đóng kết quả nhập" onClick={() => setPreview(null)}><X size={17} /></button></div>
      <p className="document-import-help">{preview.method === 'ai' ? 'Đã kết hợp AI để nhận diện nội dung.' : 'Đã nhận diện theo nhãn và nội dung tài liệu.'} Kiểm tra và sửa kết quả trước khi áp dụng.</p>
      <div className="document-import-fields">
        {Object.entries(LABELS).map(([field, label]) => <label key={field}>
          <span>{label}</span>
          {OPTIONS[field] ? <select value={preview.property[field] ?? ''} onChange={event => setPreview(previous => ({ ...previous, property: { ...previous.property, [field]: event.target.value } }))}>
            <option value="">Chưa nhận diện</option>
            {Object.entries(OPTIONS[field]).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
          </select> : <input
            type={['area', 'beds', 'baths'].includes(field) ? 'number' : 'text'}
            min={field === 'area' ? '0.01' : '0'} step={field === 'area' ? 'any' : '1'}
            value={preview.property[field] ?? ''} placeholder="Chưa nhận diện"
            onChange={event => setPreview(previous => ({ ...previous, property: { ...previous.property, [field]: event.target.value } }))}
          />}
        </label>)}
      </div>
      <label className="document-import-description"><span>Mô tả chi tiết</span><textarea rows={7} value={preview.property.description || ''} onChange={event => setPreview(previous => ({ ...previous, property: { ...previous.property, description: event.target.value } }))} /></label>
      {preview.missingFields.length > 0 && <p className="document-import-notice">Chưa nhận diện: {preview.missingFields.map(field => LABELS[field]).join(', ')}. Các mục trống sẽ giữ giá trị hiện tại trên form.</p>}
      {preview.warnings.length > 0 && <ul className="document-import-notice">{preview.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}
      <details className="document-import-source"><summary>Xem nội dung chữ từ tài liệu</summary><pre>{preview.text}</pre></details>
      <label className="document-import-checkbox"><input type="checkbox" checked={onlyEmpty} onChange={event => setOnlyEmpty(event.target.checked)} />Chỉ điền những trường đang trống</label>
      <p className="document-import-help">{onlyEmpty ? 'Các thông tin bạn đã nhập sẽ được giữ lại.' : 'Các trường có kết quả sẽ thay thế thông tin tương ứng trên form.'}</p>
      <button type="button" onClick={apply} disabled={disabled}><CheckCircle size={16} /> Áp dụng vào bài đăng</button>
    </div>}
  </section>;
}
