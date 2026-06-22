export function PageShell({ eyebrow, title, description, action, children, className = '' }) {
  return (
    <main className={`page-shell ${className}`}>
      <div className="container">
        {(eyebrow || title || description || action) && (
          <div className="page-heading">
            <div>
              {eyebrow && <span className="eyebrow">{eyebrow}</span>}
              {title && <h1>{title}</h1>}
              {description && <p>{description}</p>}
            </div>
            {action && <div className="page-heading__action">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </main>
  );
}

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function MetricCard({ icon: Icon, label, value, change, tone = 'blue' }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <div className="metric-card__top">
        <span>{label}</span>
        {Icon && <Icon size={20} />}
      </div>
      <strong>{value}</strong>
      {change && <small>{change}</small>}
    </article>
  );
}

export function SidebarNav({ title, items, activeIndex = 0, tone = 'blue', onTabChange }) {
  return (
    <aside className="app-sidebar">
      <div className={`app-sidebar__title tone-${tone}`}>{title}</div>
      <nav className="app-sidebar__nav">
        {items.map((item, index) => (
          <button 
            key={item} 
            className={index === activeIndex ? 'active' : ''}
            onClick={() => onTabChange && onTabChange(index)}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function StatusBadge({ children, tone = 'green' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
