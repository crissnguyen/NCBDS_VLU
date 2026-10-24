import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, MapPin, Search, ShieldCheck, Sparkles, X } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    number: '01', category: 'Nhu cầu', icon: Search, title: 'Hiểu đúng nhu cầu',
    description: 'Khu vực, ngân sách và loại bất động sản. Tìm kiếm bắt đầu từ những ưu tiên của bạn.',
    action: 'Tìm theo nhu cầu', detailTitle: 'Xác định tiêu chí tìm kiếm',
    details: [
      ['Khu vực', 'Chọn nơi bạn muốn sinh sống hoặc đầu tư.'],
      ['Ngân sách', 'Đặt khoảng giá phù hợp với kế hoạch của bạn.'],
      ['Loại bất động sản', 'Lọc theo loại hình và nhu cầu mua hoặc thuê.'],
    ],
  },
  {
    number: '02', category: 'Phân tích', icon: Sparkles, title: 'Tham khảo cùng AI',
    description: 'Tham khảo giá, vị trí và chất lượng tin đăng để nhận diện những lựa chọn phù hợp.',
    action: 'Xem gợi ý phù hợp', detailTitle: 'Những thông tin nên tham khảo',
    details: [
      ['Giá và diện tích', 'Đối chiếu thông tin được công bố trong từng tin.'],
      ['Chất lượng tin', 'Tham khảo điểm đánh giá và mức độ đầy đủ.'],
      ['Pháp lý', 'Đọc thông tin người đăng cung cấp và xác minh thêm.'],
    ],
  },
  {
    number: '03', category: 'Lựa chọn', icon: ShieldCheck, title: 'Chọn nơi phù hợp',
    description: 'Xem thông tin chi tiết, so sánh và kết nối với người đăng khi bạn sẵn sàng.',
    action: 'Khám phá tin đăng', detailTitle: 'Trước khi đưa ra quyết định',
    details: [
      ['Xem chi tiết', 'Xem hình ảnh, mô tả và đặc điểm bất động sản.'],
      ['So sánh', 'Cân nhắc các lựa chọn theo tiêu chí của bạn.'],
      ['Kết nối', 'Liên hệ người đăng để trao đổi và hẹn xem.'],
    ],
  },
];

function StepVisual({ index }) {
  const Marker = [MapPin, Sparkles, ShieldCheck][index];
  return <div className={`how-visual how-visual--${index + 1}`} aria-hidden="true">
    <svg className="how-visual__drawing" viewBox="0 0 400 220" fill="none">
      <ellipse cx="200" cy="185" rx="145" ry="22" fill="currentColor" opacity=".04" />
      {index === 0 && <>
        <path d="M26 146 122 108 240 146 374 97M35 188 130 151 248 189 383 140M92 74 130 151 113 206M265 70 248 189 267 216" stroke="currentColor" strokeOpacity=".12" strokeWidth="1.5" />
        <ellipse cx="201" cy="171" rx="89" ry="29" stroke="currentColor" strokeOpacity=".2" strokeDasharray="5 5" />
        <path d="m139 96 57-25 68 32-57 26z" fill="white" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m139 96 68 33v60l-68-33z" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m207 129 57-26v60l-57 26z" fill="white" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m153 121 12 6v15l-12-6zm26 13 12 6v15l-12-6z" fill="currentColor" fillOpacity=".18" />
        <path d="m222 140 26-12m-26 30 26-12" stroke="currentColor" strokeOpacity=".4" strokeWidth="2" />
        <circle cx="99" cy="119" r="5" fill="currentColor" fillOpacity=".22" />
        <circle cx="303" cy="154" r="4" fill="currentColor" fillOpacity=".3" />
      </>}
      {index === 1 && <>
        <ellipse cx="200" cy="124" rx="139" ry="57" stroke="currentColor" strokeOpacity=".16" strokeDasharray="4 6" transform="rotate(-15 200 124)" />
        <path d="m126 159 74-37 74 37-74 37z" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeOpacity=".25" />
        <path d="m126 137 74-37 74 37-74 37z" fill="white" fillOpacity=".8" stroke="currentColor" strokeOpacity=".4" />
        <path d="m126 115 74-37 74 37-74 37z" fill="white" stroke="currentColor" strokeWidth="1.6" />
        <path d="m156 115 44-22 44 22-44 22z" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeOpacity=".35" />
        <path d="m200 93 0 44m-44-22h88" stroke="currentColor" strokeOpacity=".25" />
        <circle cx="75" cy="146" r="7" fill="white" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="319" cy="88" r="5" fill="currentColor" fillOpacity=".4" />
        <path d="M105 79h30m-15-15v30M294 167h18m-9-9v18" stroke="currentColor" strokeOpacity=".4" strokeWidth="1.5" strokeLinecap="round" />
      </>}
      {index === 2 && <>
        <path d="M62 183h276M89 167v16m221-16v16" stroke="currentColor" strokeOpacity=".25" strokeWidth="1.5" strokeLinecap="round" />
        <path d="m119 121 65-48 65 48v62H119z" fill="white" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m106 124 78-59 78 59" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M249 123h45v60h-45z" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="1.6" />
        <path d="M175 143h26v40h-26z" fill="currentColor" fillOpacity=".14" stroke="currentColor" strokeOpacity=".5" />
        <path d="M137 128h22v23h-22zM213 128h20v23h-20z" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeOpacity=".5" />
        <path d="M148 128v23m-11-12h22m64-11v23m-10-12h20" stroke="currentColor" strokeOpacity=".4" />
        <path d="M84 167v-23m0 12c-26-7-19-33-5-34 10-17 32-1 22 14 10 12-1 25-17 20Z" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeOpacity=".4" strokeWidth="1.5" />
      </>}
    </svg>
    <span className="how-visual__marker"><Marker size={24} strokeWidth={1.6} /></span>
    <span className="how-visual__caption">{['Bắt đầu từ nơi bạn muốn sống', 'Kết nối dữ liệu với nhu cầu', 'Sẵn sàng cho lựa chọn của bạn'][index]}</span>
  </div>;
}

function StepDetails({ step, onClose }) {
  return <div className="how-details__content">
    <div className="how-details__header">
      <span className="how-details__heading">{step.detailTitle}</span>
      <button type="button" className="how-details__close" onClick={onClose} aria-label="Thu gọn chi tiết"><X size={16} aria-hidden="true" /></button>
    </div>
    <ul className="how-details__list">
      {step.details.map(([title, description], index) => <li key={title}>
        <span className="how-details__index" aria-hidden="true">0{index + 1}</span>
        <div><strong>{title}</strong><p>{description}</p></div>
      </li>)}
    </ul>
  </div>;
}

export default function HowItWorks({ setCurrentPage }) {
  const section = useRef(null);
  const board = useRef(null);
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const hoverTimer = useRef(null);
  const closeTimer = useRef(null);
  const usingPointer = useRef(false);

  const cancelPending = useCallback(() => {
    clearTimeout(hoverTimer.current);
    clearTimeout(closeTimer.current);
  }, []);

  const openStep = useCallback((index, delay = 0) => {
    cancelPending();
    const open = () => {
      setActiveStep(index);
    };
    if (delay) hoverTimer.current = setTimeout(open, delay);
    else open();
  }, [cancelPending]);

  const dismiss = useCallback(() => {
    cancelPending();
    // Keep keyboard focus on the control that opened the details.
    if (board.current?.querySelector('.how-details:focus-within')) {
      board.current.querySelector('.how-step.is-open .how-step__trigger')?.focus();
    }
    setActiveStep(null);
  }, [cancelPending]);

  const scheduleClose = useCallback(() => {
    cancelPending();
    closeTimer.current = setTimeout(() => setActiveStep(null), 220);
  }, [cancelPending]);

  useEffect(() => {
    const onPointer = event => {
      usingPointer.current = true;
      if (!board.current?.contains(event.target)) dismiss();
    };
    const onKey = event => {
      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) usingPointer.current = false;
      if (event.key === 'Escape') dismiss();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      cancelPending();
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [cancelPending, dismiss]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  const navigate = () => setCurrentPage('search');

  return <section ref={section} className={`how-it-works${visible ? ' is-visible' : ''}`} aria-labelledby="how-it-works-title">
    <div className="container">
      <div className="how-it-works__header">
        <div>
          <span className="how-it-works__eyebrow">Cách EstateAI hoạt động</span>
          <h2 id="how-it-works-title">Hiểu nhu cầu.<br /><span>Tìm đúng nơi.</span></h2>
        </div>
        <div className="how-it-works__intro">
          <p>Ba bước giúp bạn tìm kiếm rõ ràng hơn,<br className="how-it-works__desktop-break" /> từ mong muốn ban đầu đến lựa chọn phù hợp.</p>
          <button type="button" className="how-it-works__start" onClick={navigate}>Bắt đầu tìm kiếm<ArrowUpRight size={17} aria-hidden="true" /></button>
        </div>
      </div>

      <div
        ref={board}
        className="how-it-works__board"
        onPointerEnter={event => {
          if (event.pointerType === 'mouse') cancelPending();
        }}
        onPointerLeave={event => {
          if (event.pointerType === 'mouse' && (usingPointer.current || !event.currentTarget.querySelector(':focus-visible'))) scheduleClose();
        }}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose();
        }}
      >
        <ol className="how-it-works__steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isOpen = activeStep === index;
            return <li
              key={step.number}
              className={`how-step how-step--${index + 1}${isOpen ? ' is-open' : ''}`}
              style={{ '--step-delay': `${index * 100}ms` }}
              onPointerEnter={event => {
                if (event.pointerType === 'mouse') openStep(index, 120);
              }}
            >
              <div className="how-step__top">
                <span className="how-step__label"><span className="how-step__number">{step.number}</span>{step.category}</span>
                <Icon className="how-step__icon" size={20} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <h3 id={`how-step-${step.number}-title`}>{step.title}</h3>
              <p className="how-step__description">{step.description}</p>
              <div className="how-step__stage">
                <StepVisual index={index} />
                <div
                  id={`how-step-${step.number}-details`}
                  className={`how-details${isOpen ? ' is-open' : ''}`}
                  role="region"
                  aria-labelledby={`how-step-${step.number}-title`}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                ><StepDetails step={step} onClose={dismiss} /></div>
              </div>
              <div className="how-step__footer">
                <button
                  type="button"
                  className="how-step__trigger"
                  aria-expanded={isOpen}
                  aria-controls={`how-step-${step.number}-details`}
                  aria-label={`${isOpen ? 'Thu gọn' : 'Xem chi tiết'}: ${step.title}`}
                  onFocus={event => {
                    if (!usingPointer.current && event.target.matches(':focus-visible')) openStep(index);
                  }}
                  onClick={() => {
                    if (isOpen) dismiss();
                    else openStep(index);
                  }}
                >{isOpen ? 'Thu gọn hướng dẫn' : 'Xem cách thực hiện'}<ChevronDown size={15} aria-hidden="true" /></button>
                <button type="button" className="how-step__navigate" onClick={navigate} aria-label={step.action}><ArrowUpRight size={19} aria-hidden="true" /></button>
              </div>
            </li>;
          })}
        </ol>
      </div>
      <p className="how-it-works__note"><ShieldCheck size={15} aria-hidden="true" />AI hỗ trợ tìm kiếm. Quyết định luôn là của bạn.</p>
    </div>
  </section>;
}
