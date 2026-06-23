import { useState } from 'react';
import { MapPin, Bed, Bath, Maximize, ShieldCheck, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { mediaUrl } from '../services/api';

export default function PropertyCard({ id, images, image, title, price, location, beds, baths, area, match, trust, badge, type, intent, onClick }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Parse original images if passed
  const photoList = images && images.length > 0 
    ? images.map(img => mediaUrl(img))
    : [image];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIdx(p => (p === 0 ? photoList.length - 1 : p - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIdx(p => (p === photoList.length - 1 ? 0 : p + 1));
  };

  return (
    <article className="property-card" onClick={() => onClick && onClick(id)} style={{ cursor: 'pointer' }}>
      <div className="property-media" style={{ position: 'relative' }}>
        <img src={photoList[currentIdx] || photoList[0]} alt={title} className="property-image" style={{ objectFit: 'cover' }} />
        <div className="property-media__shade"></div>
        {badge && <div className="badge badge-blue property-badge">{badge}</div>}
        {match && <div className="match-pill"><Sparkles size={13} /> {match}%</div>}
        
        {photoList.length > 1 && (
          <>
            <button onClick={handlePrev} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, color: '#0f172a', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleNext} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, color: '#0f172a', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <ChevronRight size={18} />
            </button>
            
            <div style={{ position: 'absolute', bottom: '0.5rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '4px', zIndex: 2 }}>
              {photoList.map((_, idx) => (
                <div key={idx} style={{ width: 6, height: 6, borderRadius: '50%', background: idx === currentIdx ? 'white' : 'rgba(255,255,255,0.5)', transition: 'background 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="property-info">
        <div className="property-card__topline">
          <div className="property-price">{price}</div>
          {trust && <span className="trust-chip"><ShieldCheck size={14} /> {trust}</span>}
        </div>
        <h3 className="property-title">{title}</h3>
        <div className="property-location">
          <MapPin size={16} />
          {location}
        </div>
        {(type || intent) && (
          <div className="property-tags">
            {type && <span>{type}</span>}
            {intent && <span>{intent}</span>}
          </div>
        )}
        <div className="property-meta">
          {beds > 0 && <div className="meta-item"><Bed size={16} /> {beds} PN</div>}
          {baths > 0 && <div className="meta-item"><Bath size={16} /> {baths} WC</div>}
          <div className="meta-item"><Maximize size={16} /> {area} m²</div>
        </div>
      </div>
    </article>
  );
}
