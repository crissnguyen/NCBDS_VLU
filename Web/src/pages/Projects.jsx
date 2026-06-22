import { PageShell, StatusBadge } from '../components/ui';
import { projects } from '../data/properties';

export default function Projects() {
  return (
    <PageShell
      eyebrow="Dự án"
      title="Dự án nổi bật"
      description="Theo dõi tiến độ, pháp lý, giá bán và mức quan tâm để so sánh dự án trước khi xem từng căn."
    >
      <div className="project-grid">
        {projects.map((project) => (
          <article key={project.id} className="project-card">
            <img src={project.image} alt={project.title} />
            <div className="project-card__body">
              <StatusBadge tone={project.status === 'Đang mở bán' ? 'yellow' : 'blue'}>{project.status}</StatusBadge>
              <h3 style={{ marginTop: '0.85rem' }}>{project.title}</h3>
              <p>{project.location} · {project.category}</p>
              <div className="project-card__meta">
                <div><span>Giá từ</span><strong>{project.price}</strong></div>
                <div><span>Pháp lý</span><strong>{project.legal}</strong></div>
                <div><span>Quan tâm</span><strong>{project.interest}</strong></div>
              </div>
              <button className="btn btn-ghost" style={{ width: '100%' }}>Xem chi tiết</button>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
