import { Search } from 'lucide-react';
import { properties } from '../../data/properties';

export default function MapPage() {
  const pinPositions = [
    { top: '38%', left: '28%' },
    { top: '52%', left: '47%' },
    { top: '34%', left: '63%' },
  ];

  return (
    <main className="map-layout">
      <aside className="map-sidebar">
        <div className="map-sidebar__top">
          <div className="search-box">
            <Search size={18} color="var(--text-secondary)" />
            <input type="text" placeholder="Tìm khu vực, đường, dự án..." />
          </div>
          <div className="chip-row" style={{ marginTop: '0.85rem' }}>
            <button className="active">Giá</button>
            <button>Tiện ích</button>
            <button>Đầu tư</button>
          </div>
        </div>

        <div className="map-list">
          {properties.slice(0, 3).map((property) => (
            <article key={property.id} className="map-result">
              <div className="flex gap-3">
                <img src={property.image} alt={property.title} style={{ width: 104, height: 82, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                <div>
                  <strong style={{ color: 'var(--primary)' }}>{property.price}</strong>
                  <h3 style={{ marginTop: '0.2rem', fontSize: '0.96rem' }}>{property.title}</h3>
                  <p style={{ fontSize: '0.82rem' }}>{property.area} m² · {property.beds} PN · {property.match}% phù hợp</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </aside>

      <section className="map-area">
        <div className="map-overlay">Bản đồ bất động sản Nha Trang</div>
        {properties.slice(0, 3).map((property, index) => (
          <button
            key={property.id}
            className={`map-pin ${index === 0 ? 'active' : ''}`}
            style={pinPositions[index]}
          >
            {property.price}
          </button>
        ))}
        <div className="map-insight">
          <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>AI phân tích khu vực</strong>
          <p style={{ fontSize: '0.92rem', marginBottom: '1rem' }}>Lộc Thọ có giá cao hơn trung bình nhưng thanh khoản tốt, phù hợp khai thác cho thuê ngắn hạn.</p>
          <button className="btn btn-ghost" style={{ width: '100%' }}>Xem báo cáo</button>
        </div>
      </section>
    </main>
  );
}
