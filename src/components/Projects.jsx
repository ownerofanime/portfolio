import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { projects, hackathonRecord } from '../data/projects';

const categories = ['All', 'Data & ML', 'Product & UX', 'Web & Mobile'];

export default function Projects() {
  const [active, setActive] = useState('All');
  const ref = useReveal();
  const tableRef = useReveal();

  const filtered = active === 'All'
    ? projects
    : projects.filter((p) => p.category.includes(active));

  return (
    <section className="section" id="work">
      <div className="container">
        <div className="section-label">Projects & Hackathons</div>
        <h2 className="section-title">Things I've shipped.</h2>
        <p className="section-subtitle">
          Seven hackathon builds across fintech, logistics, AR, mobile, and data. Each built under pressure, with a team, against a deadline.
        </p>
        <div className="filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${active === cat ? 'active' : ''}`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="projects-grid reveal" ref={ref}>
          {filtered.map((p) => (
            <div key={p.id} className="card project-card">
              <div className="project-header">
                <span className="project-placement">{p.placement}</span>
                <span className="project-year">{p.year}</span>
              </div>
              <h3 className="project-title">{p.title}</h3>
              <p className="project-hackathon">{p.hackathon}</p>
              <p className="project-desc">{p.desc}</p>
              <div className="project-stack">
                {p.stack.map((s) => (
                  <span key={s} className="tag">{s}</span>
                ))}
              </div>
              <div className="project-actions">
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    GitHub
                  </a>
                )}
                {p.demo && (
                  <a href={p.demo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    Live Demo
                  </a>
                )}
                {p.youtube && (
                  <a href={p.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    YouTube
                  </a>
                )}
                {p.figma && (
                  <a href={p.figma} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    Figma
                  </a>
                )}
                {!p.github && !p.demo && !p.youtube && !p.figma && (
                  <span className="btn btn-ghost btn-sm" style={{ opacity: 0.5, cursor: 'default' }}>
                    Link coming soon
                  </span>
                )}
              </div>
              {p.demoNote && (
                <p style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 6 }}>{p.demoNote}</p>
              )}
            </div>
          ))}
        </div>

        <div className="hackathon-table-wrap reveal" ref={tableRef}>
          <h3>Full Hackathon Record</h3>
          <table className="hackathon-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Organiser</th>
                <th>Year</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {hackathonRecord.map((h, i) => (
                <tr key={i}>
                  <td>{h.event}</td>
                  <td>{h.organiser}</td>
                  <td>{h.year}</td>
                  <td>{h.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
