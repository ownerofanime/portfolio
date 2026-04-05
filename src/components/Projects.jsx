import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { projects, hackathonRecord } from '../data/projects';
import BorderGlow from './BorderGlow';
import LogoLoop from './LogoLoop';
import TextType from './TextType';
import AnimatedList from './AnimatedList';

const CATEGORY_GLOW = {
  'Data & ML':       { colors: ['#38bdf8', '#6366f1', '#06b6d4'], glow: '210 80 70' },
  'Product & UX':    { colors: ['#f472b6', '#c084fc', '#e879f9'], glow: '320 80 75' },
  'Web & Mobile':    { colors: ['#34d399', '#38bdf8', '#a78bfa'], glow: '160 70 70' },
};

function getGlowProps(category) {
  const cat = Array.isArray(category) ? category[0] : category;
  return CATEGORY_GLOW[cat] || CATEGORY_GLOW['Web & Mobile'];
}

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
        <div className="work-typed-tagline">
          <TextType
            texts={[
              'Built under pressure.',
              'Shipped with a team.',
              'Solving real problems.',
              'Made for the deadline.',
              'Hackathon-hardened.',
            ]}
            typingSpeed={65}
            deletingSpeed={40}
            pauseDuration={2000}
            showCursor
            cursorCharacter="_"
          />
        </div>
        <div className="logoloop-section">
          <p className="logoloop-label">Tools &amp; Technologies</p>
          <LogoLoop speed={0.4} />
        </div>
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
          {filtered.map((p) => {
            const glow = getGlowProps(p.category);
            return (
              <BorderGlow
                key={p.id}
                colors={glow.colors}
                glowColor={glow.glow}
                backgroundColor="var(--white)"
                borderRadius={16}
                glowRadius={30}
                glowIntensity={0.8}
                coneSpread={25}
                edgeSensitivity={30}
              >
                <div className="card project-card">
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
              </BorderGlow>
            );
          })}
        </div>

        <div className="hackathon-list-wrap reveal" ref={tableRef}>
          <div className="hackathon-list-header">
            <span className="section-label" style={{ marginBottom: 0 }}>Full Hackathon Record</span>
            <span className="hackathon-list-count">{hackathonRecord.length} events</span>
          </div>
          <AnimatedList
            items={hackathonRecord}
            showGradients
            enableArrowNavigation
            displayScrollbar={false}
            maxHeight={460}
            renderItem={(h, i, isSelected) => (
              <div className="hackathon-list-row">
                <div className="hackathon-list-left">
                  <span className="hackathon-list-event">{h.event}</span>
                  <span className="hackathon-list-org">{h.organiser} · {h.year}</span>
                </div>
                <span className={`hackathon-list-result${h.result.includes('1st') || h.result.includes('🥇') ? ' result-gold' : h.result.includes('Finalist') ? ' result-finalist' : ''}`}>
                  {h.result}
                </span>
              </div>
            )}
          />
        </div>
      </div>
    </section>
  );
}
