import { useEffect, useRef, useState } from 'react';
import { Building2, Headphones, MapPin, Sparkles } from 'lucide-react';

const numberFormat = new Intl.NumberFormat('vi-VN');
const COUNT_DURATION_MS = 3000;
const stats = [
  { icon: Building2, category: 'Đa dạng lựa chọn', target: 12000, suffix: '+', spokenValue: 'Hơn 12 nghìn', label: 'Tin đăng bất động sản', accent: '#0f766e', rgb: '15, 118, 110' },
  { icon: Sparkles, category: 'Gợi ý thông minh', target: 98, suffix: '%', spokenValue: '98 phần trăm', label: 'Mức độ phù hợp AI', accent: '#0284c7', rgb: '2, 132, 199' },
  { icon: Headphones, category: 'Luôn đồng hành', target: 24, suffix: '/7', spokenValue: '24 trên 7', label: 'Tư vấn trực tuyến', accent: '#b7791f', rgb: '183, 121, 31' },
  { icon: MapPin, category: 'Am hiểu địa phương', text: 'Nha Trang', spokenValue: 'Nha Trang', label: 'Thị trường trọng tâm', accent: '#7560b6', rgb: '117, 96, 182' },
];

function TrustStat({ stat, index }) {
  const card = useRef(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let observer;
    let started = false;
    let revealed = false;

    const reveal = () => {
      if (started) return;
      started = true;
      observer?.disconnect();
      const start = performance.now() + index * 100;
      const tick = now => {
        if (!revealed) {
          setVisible(true);
          revealed = true;
        }
        if (motionPreference.matches || !stat.target) {
          setProgress(1);
          return;
        }
        const elapsed = Math.min(1, Math.max(0, (now - start) / COUNT_DURATION_MS));
        // Start gently and slow down again as the count reaches its target.
        setProgress((1 - Math.cos(Math.PI * elapsed)) / 2);
        if (elapsed < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const handleMotionChange = event => {
      if (event.matches && started) {
        cancelAnimationFrame(frame);
        setVisible(true);
        setProgress(1);
      }
    };
    motionPreference.addEventListener('change', handleMotionChange);
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) reveal();
      }, { threshold: 0.3 });
      observer.observe(card.current);
    } else {
      reveal();
    }
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      motionPreference.removeEventListener('change', handleMotionChange);
    };
  }, [index, stat.target]);

  const Icon = stat.icon;
  return <article
    ref={card}
    className={`trust-stat${visible ? ' is-visible' : ''}`}
    style={{ '--stat-accent': stat.accent, '--stat-rgb': stat.rgb, '--stat-delay': `${index * 100}ms` }}
  >
    <div className="trust-stat__heading">
      <span className="trust-stat__icon" aria-hidden="true"><Icon size={21} strokeWidth={1.7} /></span>
      <span className="trust-stat__category">{stat.category}</span>
    </div>
    <p className={`trust-stat__value${stat.text ? ' trust-stat__value--place' : ''}`}>
      <span className="trust-stat__accessible">{stat.spokenValue}</span>
      <span className="trust-stat__digits" aria-hidden="true">{stat.text || numberFormat.format(Math.round(stat.target * progress))}</span>
      {stat.suffix && <span className="trust-stat__suffix" aria-hidden="true">{stat.suffix}</span>}
    </p>
    <p className="trust-stat__label">{stat.label}</p>
    <span className="trust-stat__decoration" aria-hidden="true"><Icon size={116} strokeWidth={0.7} /></span>
  </article>;
}

export default function TrustStats() {
  return <section className="landing-trust-strip" aria-label="EstateAI qua những con số">
    <div className="container">
      {stats.map((stat, index) => <TrustStat key={stat.label} stat={stat} index={index} />)}
    </div>
  </section>;
}
