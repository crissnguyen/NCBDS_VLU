import { useState, useEffect } from 'react';
import { Building2, CheckCircle2, Filter, Map as MapIcon, Search as SearchIcon, SlidersHorizontal, Sparkles } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import { Field } from '../../components/ui';
import { mediaUrl } from '../../services/api';
import { dataService } from '../../services/data/dataService';

export default function Search({ setCurrentPage }) {
  const [allProperties, setAllProperties] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState([]);

  // Filter States
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('project');

  const [transactionType, setTransactionType] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [location, setLocation] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [minTrust, setMinTrust] = useState(70);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortMethod, setSortMethod] = useState('match');

  useEffect(() => {
    dataService.getProperties()
      .then(data => {
        // Filter only approved ones (assuming 'status' field exists and represents approval state)
        // Adjust condition based on your actual backend schema
        const approved = Array.isArray(data) ? data.filter(p => p.status === 'Approved') : [];
        setAllProperties(approved);
        // Ban đầu hiển thị theo tab mặc định 'project' (không lọc transactionType)
        setProperties(approved);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi fetch properties:", err);
        setLoading(false);
      });

    // Lấy danh sách tỉnh thành Việt Nam
    fetch('https://provinces.open-api.vn/api/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Lỗi lấy khu vực:", err));
  }, []);

  const applyFilters = () => {
    let filtered = [...allProperties];

    // Lọc theo Tab (Dự án/Mua/Thuê)
    if (tab === 'sale' || tab === 'rent') {
      filtered = filtered.filter(p => p.transactionType === tab);
    } else if (tab === 'project') {
      // Tạm thời hiển thị tất cả tin (hoặc lọc riêng theo propertyType === 'project' nếu có)
      // Nếu Database có propertyType là 'project' thì mở comment dòng dưới:
      // filtered = filtered.filter(p => p.propertyType === 'project');
    }

    // Lọc theo từ khóa (Tìm khu vực, dự án...)
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(q) || 
        p.location?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      );
    }

    // Lọc theo Loại giao dịch (Dropdown)
    if (transactionType !== 'all') {
      filtered = filtered.filter(p => p.transactionType === transactionType);
    }

    // Lọc theo Loại BĐS
    if (propertyType !== 'all') {
      filtered = filtered.filter(p => p.propertyType === propertyType);
    }

    // Lọc theo Khu vực
    if (location !== 'all') {
      filtered = filtered.filter(p => p.location && p.location.includes(location));
    }

    // Lọc theo Khoảng giá (Ước lượng đơn giản dựa trên chuỗi)
    if (priceRange !== 'all') {
      filtered = filtered.filter(p => {
        if (!p.price) return false;
        let val = 0;
        const pStr = p.price.toLowerCase();
        if (pStr.includes('tỷ')) val = parseFloat(pStr) * 1000;
        else if (pStr.includes('triệu')) val = parseFloat(pStr);

        if (priceRange === 'low') return val < 3000;
        if (priceRange === 'mid') return val >= 3000 && val <= 6000;
        if (priceRange === 'high') return val > 6000;
        return true;
      });
    }

    // Lọc theo Điểm tin cậy
    filtered = filtered.filter(p => (p.trustScore || 85) >= minTrust);

    // Lọc Tin xác thực (Giả sử tin xác thực có điểm >= 90)
    if (verifiedOnly) {
      filtered = filtered.filter(p => (p.trustScore || 85) >= 90);
    }

    // Định nghĩa hàm parse giá thành số để phục vụ sắp xếp
    const parsePrice = (priceStr) => {
      if (!priceStr) return Infinity;
      const pStr = String(priceStr).toLowerCase().replace(/\s+/g, '');
      if (pStr === 'liênhệ' || pStr === 'liên hệ' || pStr === '') return Infinity;
      
      let val = 0;
      const matches = pStr.match(/[\d.]+/);
      if (!matches) return Infinity;
      
      val = parseFloat(matches[0]);
      if (pStr.includes('tỷ') || pStr.includes('ty') || pStr.includes('tỉ')) {
        return val * 1000;
      } else if (pStr.includes('triệu') || pStr.includes('trieu') || pStr.includes('tr')) {
        return val;
      }
      return val;
    };

    // Thực hiện sắp xếp
    if (sortMethod === 'priceAsc') {
      filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortMethod === 'trust') {
      filtered.sort((a, b) => (b.trustScore || 90) - (a.trustScore || 90));
    } else if (sortMethod === 'match') {
      filtered.sort((a, b) => (b.aiScore || 85) - (a.aiScore || 85));
    }

    setProperties(filtered);
  };

  const resetFilters = () => {
    setQuery('');
    setTransactionType('all');
    setPropertyType('all');
    setLocation('all');
    setPriceRange('all');
    setMinTrust(70);
    setVerifiedOnly(false);
    
    // Khôi phục lại hiển thị ban đầu của tab
    if (tab === 'sale' || tab === 'rent') {
      setProperties(allProperties.filter(p => p.transactionType === tab));
    } else {
      setProperties(allProperties);
    }
  };

  // Tự động lọc khi đổi Tab
  useEffect(() => {
    if (allProperties.length > 0) {
      applyFilters();
    }
  }, [tab]);

  // Tự động lọc/sắp xếp khi thay đổi tiêu chí sắp xếp
  useEffect(() => {
    if (allProperties.length > 0) {
      applyFilters();
    }
  }, [sortMethod, allProperties]);

  return (
    <main className="search-page">
      <section className="search-hero">
        <div className="container search-hero__inner">
          <div>
            <span className="eyebrow search-eyebrow"><Sparkles size={14} /> AI Property Search</span>
            <h1>Mua bán bất động sản</h1>
            <p>Lọc nhanh theo nhu cầu, xem điểm tin cậy và độ phù hợp AI trước khi liên hệ.</p>
          </div>
          <div className="search-hero__panel">
            <div><strong>{properties.length}</strong><span>Tin phù hợp</span></div>
            <div><strong>91</strong><span>Điểm tin cậy TB</span></div>
            <div><strong>3 khu</strong><span>Đang có tin</span></div>
          </div>
        </div>
      </section>

      <section className="container search-content">
        <div className="filters-layout search-layout">
        <aside className="search-filter-aside">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem', color: '#0f2a44', marginBottom: '0.5rem' }}>
            <Filter size={20} color="#0f2a44" /> Bộ lọc thông minh
          </div>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', padding: '0.75rem 1rem' }}>
            <SearchIcon size={18} color="#64748b" style={{ marginRight: '0.5rem' }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm khu vực, dự án..." style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', color: '#0f2a44' }} />
          </div>

          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 14, padding: '4px' }}>
            <button onClick={() => setTab('project')} style={{ flex: 1, background: tab === 'project' ? '#0f2a44' : 'transparent', color: tab === 'project' ? 'white' : '#475569', borderRadius: 10, padding: '0.6rem', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: tab === 'project' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Dự án</button>
            <button onClick={() => setTab('sale')} style={{ flex: 1, background: tab === 'sale' ? '#0f2a44' : 'transparent', color: tab === 'sale' ? 'white' : '#475569', borderRadius: 10, padding: '0.6rem', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: tab === 'sale' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Mua</button>
            <button onClick={() => setTab('rent')} style={{ flex: 1, background: tab === 'rent' ? '#0f2a44' : 'transparent', color: tab === 'rent' ? 'white' : '#475569', borderRadius: 10, padding: '0.6rem', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: tab === 'rent' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Thuê</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Loại giao dịch</label>
              <select value={transactionType} onChange={e => setTransactionType(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', fontSize: '0.95rem', color: '#0f172a', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}>
                <option value="all">Tất cả</option>
                <option value="sale">Mua bán</option>
                <option value="rent">Cho thuê</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Loại BĐS</label>
              <select value={propertyType} onChange={e => setPropertyType(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', fontSize: '0.95rem', color: '#0f172a', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}>
                <option value="all">Tất cả</option>
                <option value="apartment">Căn hộ</option>
                <option value="house">Nhà phố</option>
                <option value="land">Đất nền</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Khu vực</label>
              <select value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', fontSize: '0.95rem', color: '#0f172a', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}>
                <option value="all">Tất cả khu vực</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Khoảng giá</label>
              <select value={priceRange} onChange={e => setPriceRange(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', fontSize: '0.95rem', color: '#0f172a', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}>
                <option value="all">Tất cả</option>
                <option value="low">Dưới 3 tỷ</option>
                <option value="mid">3 - 6 tỷ</option>
                <option value="high">Trên 6 tỷ</option>
              </select>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' }}>
                <span>Điểm tin cậy tối thiểu</span>
                <span style={{ color: '#2563eb' }}>{minTrust}</span>
              </label>
              <input type="range" min="60" max="100" value={minTrust} onChange={e => setMinTrust(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563eb' }} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem' }}>
              <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#0f766e', cursor: 'pointer' }} />
              <CheckCircle2 size={18} color="#0f766e" />
              <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.95rem' }}>Chỉ hiện tin xác thực</span>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={applyFilters} style={{ width: '100%', padding: '0.85rem', background: '#0f2a44', color: 'white', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,42,68,0.2)' }}>Áp dụng lọc</button>
              <button onClick={resetFilters} style={{ width: '100%', padding: '0.85rem', background: 'white', color: '#0f172a', borderRadius: 12, border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>Đặt lại</button>
            </div>
          </div>
        </aside>

        <section>
          <div className="results-toolbar">
            <div>
              <span className="toolbar-kicker"><Building2 size={16} /> Nha Trang</span>
              <strong>{properties.length} kết quả phù hợp</strong>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} color="var(--text-secondary)" />
                <select style={{ width: 'auto' }} value={sortMethod} onChange={e => setSortMethod(e.target.value)}>
                  <option value="match">Phù hợp nhất</option>
                  <option value="priceAsc">Giá thấp nhất</option>
                  <option value="trust">Tin cậy cao nhất</option>
                </select>
              </div>
              <button className="btn btn-ghost"><MapIcon size={18} /> Xem bản đồ</button>
            </div>
          </div>

          <div className="property-grid search-results-grid">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
                Đang tải danh sách bất động sản...
              </div>
            ) : properties.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                Không có bất động sản nào đang được rao bán.
              </div>
            ) : (
              properties.map((property, index) => {
                const imgUrl = property.images && property.images.length > 0 
                  ? mediaUrl(property.images[0])
                  : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80';
                
                const typeMap = { apartment: 'Căn hộ', house: 'Nhà phố', land: 'Đất nền' };
                const intentMap = { sale: 'Mua bán', rent: 'Cho thuê' };

                return (
                  <div className="result-card-wrap" style={{ '--animation-order': index }} key={property.id}>
                    <PropertyCard 
                      id={property.id}
                      images={property.images}
                      onClick={() => setCurrentPage(`property_detail_${property.id}`)}
                      image={imgUrl}
                      title={property.title}
                      price={property.price}
                      location={property.location}
                      beds={property.beds || 0}
                      baths={property.baths || 0}
                      area={property.area || 0}
                      type={typeMap[property.propertyType] || 'BĐS'}
                      intent={intentMap[property.transactionType] || 'Khác'}
                      match={property.aiScore || 85}
                      trust={property.trustScore || 90}
                      badge={property.isFeatured ? "Tin VIP" : null}
                    />
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
      </section>
    </main>
  );
}
