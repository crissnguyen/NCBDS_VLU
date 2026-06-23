import { Search } from 'lucide-react';
import { properties } from '../../data/properties';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon path issues with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapPage() {
  // Tọa độ trung tâm thành phố Nha Trang
  const nhaTrangPosition = [12.245, 109.18];

  return (
    <main className="map-layout" style={{ display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      
      {/* CỘT BÊN TRÁI: DANH SÁCH BẤT ĐỘNG SẢN */}
      <aside className="map-sidebar" style={{ width: 400, background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div className="map-sidebar__top" style={{ padding: '1.5rem', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <div className="search-box" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: 12, padding: '0.75rem 1rem', gap: '0.75rem' }}>
            <Search size={18} color="#64748b" />
            <input 
              type="text" 
              placeholder="Tìm khu vực, đường, dự án..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem' }} 
            />
          </div>
          <div className="chip-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button style={{ padding: '0.4rem 1rem', borderRadius: 20, border: '1px solid #0f766e', background: '#f0fdfa', color: '#0f766e', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Giá</button>
            <button style={{ padding: '0.4rem 1rem', borderRadius: 20, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Tiện ích</button>
            <button style={{ padding: '0.4rem 1rem', borderRadius: 20, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Đầu tư</button>
          </div>
        </div>

        <div className="map-list" style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
          {properties.map((property) => (
            <article key={property.id} className="map-result" style={{ marginBottom: '1.25rem', padding: '1rem', background: 'white', borderRadius: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <img src={property.image} alt={property.title} style={{ width: 110, height: 90, borderRadius: 10, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#0f766e', display: 'block', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{property.price}</strong>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.4, color: '#0f172a' }}>{property.title}</h3>
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>{property.area} m² · {property.beds} PN</p>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#0284c7', background: '#e0f2fe', display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{property.location}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </aside>

      {/* CỘT BÊN PHẢI: BẢN ĐỒ TƯƠNG TÁC LEAFLET */}
      <section className="map-area" style={{ flex: 1, position: 'relative', height: '100%' }}>
        
        {/* Bản đồ Leaflet */}
        <MapContainer 
          center={nhaTrangPosition} 
          zoom={13} 
          style={{ width: '100%', height: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {properties.map((property) => (
            property.lat && property.lng && (
              <Marker key={property.id} position={[property.lat, property.lng]}>
                <Popup className="custom-popup">
                  <div style={{ width: 220 }}>
                    <img src={property.image} alt={property.title} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                    <strong style={{ color: '#0f766e', fontSize: '1.2rem', display: 'block', fontWeight: 800 }}>{property.price}</strong>
                    <h4 style={{ margin: '4px 0', fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.4 }}>{property.title}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{property.location}</span>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>

        {/* Khung phân tích AI nổi trên bản đồ */}
        <div className="map-insight" style={{ zIndex: 1000, position: 'absolute', bottom: 30, right: 30, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.12)', width: 320, border: '1px solid rgba(255,255,255,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', boxShadow: '0 0 10px #0ea5e9' }}></div>
            <strong style={{ color: '#0ea5e9', fontSize: '1rem' }}>AI phân tích khu vực</strong>
          </div>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem', color: '#475569', lineHeight: 1.6 }}>
            Khu vực <strong>Lộc Thọ</strong> và <strong>Vĩnh Hải</strong> đang có thanh khoản tốt. Giá trị trung bình tăng <strong>4.2%</strong> trong quý này. Phù hợp đầu tư dài hạn.
          </p>
          <button style={{ width: '100%', padding: '0.75rem', borderRadius: 10, background: '#f8fafc', color: '#0f172a', fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
            Xem báo cáo chi tiết
          </button>
        </div>
        
      </section>
    </main>
  );
}
