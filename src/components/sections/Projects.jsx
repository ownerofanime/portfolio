// Section — Projects & Hackathons: featured grid, all-projects grid, hackathon record table,
// case study modal, and GitHub contribution strip.
// Edit src/data/projects.js to add projects. Set `featured: true` to pin to the top grid.
// Add a `caseStudy: { problem, approach, result }` object to enable the Case Study modal.

import { useState, useEffect } from 'react';
import { useReveal } from '../../hooks/useReveal';
import { projects, hackathonRecord } from '../../data/projects';
import BorderGlow from '../ui/BorderGlow';
import LogoLoop from '../ui/LogoLoop';
import TextType from '../ui/TextType';
import AnimatedList from '../ui/AnimatedList';

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

function StarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/>
    </svg>
  );
}

function ProjectCard({ p, onCaseStudy }) {
  const glow = getGlowProps(p.category);
  return (
    <BorderGlow
      colors={glow.colors}
      glowColor={glow.glow}
      backgroundColor="var(--bg-secondary)"
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
        {p.keyResult && (
          <div className="project-key-result">
            <StarIcon />
            {p.keyResult}
          </div>
        )}
        <h3 className="project-title">{p.title}</h3>
        <p className="project-hackathon">{p.hackathon}</p>
        <p className="project-desc">{p.desc}</p>
        <div className="project-stack">
          {p.stack.map((s) => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>
        <div className="project-actions">
          {p.caseStudy && (
            <button className="btn-case-study" onClick={() => onCaseStudy(p)}>
              Case Study →
            </button>
          )}
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
          {!p.caseStudy && !p.github && !p.demo && !p.youtube && !p.figma && (
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
}

export default function Projects() {
  const [active, setActive] = useState('All');
  const [caseStudy, setCaseStudy] = useState(null);
  const ref = useReveal();
  const tableRef = useReveal();
  const githubRef = useReveal();

  const featuredProjects = projects.filter((p) => p.featured);
  const filtered = active === 'All'
    ? projects.filter((p) => !p.featured)
    : projects.filter((p) => p.category.includes(active));

  useEffect(() => {
    if (!caseStudy) return;
    const onKey = (e) => { if (e.key === 'Escape') setCaseStudy(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [caseStudy]);

  return (
    <section className="section" id="work">
      <div className="container">
        <div className="section-label">Projects & Hackathons<span className="section-cart">PROJECTS.GB</span></div>
        <h2 className="section-title">Things I've shipped.</h2>
        <p className="section-subtitle">
          Eight hackathon builds across fintech, logistics, AR, mobile, and data. Each built under pressure, with a team, against a deadline.
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

        {active === 'All' && (
          <div className="featured-section">
            <div className="featured-section-header">
              <span className="featured-label">Featured Work</span>
              <span className="featured-sublabel">{featuredProjects.length} highlighted builds</span>
            </div>
            <div className="featured-grid">
              {featuredProjects.map((p) => (
                <ProjectCard key={p.id} p={p} onCaseStudy={setCaseStudy} />
              ))}
            </div>
            <div className="featured-divider">
              <span className="featured-divider-label">All projects</span>
            </div>
          </div>
        )}

        <div className="projects-grid reveal" ref={ref}>
          {filtered.map((p) => (
            <ProjectCard key={p.id} p={p} onCaseStudy={setCaseStudy} />
          ))}
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
            renderItem={(h) => (
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

        <div className="github-strip reveal" ref={githubRef}>
          <div className="github-strip-left">
            <div className="section-label" style={{ marginBottom: 4 }}>Code & Open Source</div>
            <h3 className="github-strip-title">Building in public</h3>
            <p className="github-strip-desc">Most hackathon projects are open source. Follow along as I build.</p>
            <a href="https://github.com/tjandera" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              github.com/tjandera →
            </a>
          </div>
          <div className="github-chart-wrap">
            <img
              src="https://ghchart.rshah.org/6366f1/tjandera"
              alt="GitHub contribution chart"
              className="github-chart"
            />
          </div>
        </div>
      </div>

      {caseStudy && (
        <div className="case-study-overlay" onClick={() => setCaseStudy(null)}>
          <div className="case-study-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setCaseStudy(null)}>×</button>
            <div className="case-study-meta">
              <span className="project-placement">{caseStudy.placement}</span>
              <span className="case-study-hackathon">{caseStudy.hackathon}</span>
            </div>
            <h3 className="case-study-title">{caseStudy.title}</h3>
            {caseStudy.keyResult && (
              <div className="project-key-result" style={{ marginBottom: 24 }}>
                <StarIcon />
                {caseStudy.keyResult}
              </div>
            )}
            <div className="case-study-steps">
              <div className="case-study-step">
                <div className="case-study-step-label">Problem</div>
                <p className="case-study-step-text">{caseStudy.caseStudy.problem}</p>
              </div>
              <div className="case-study-step">
                <div className="case-study-step-label">Approach</div>
                <p className="case-study-step-text">{caseStudy.caseStudy.approach}</p>
              </div>
              <div className="case-study-step">
                <div className="case-study-step-label">Result</div>
                <p className="case-study-step-text">{caseStudy.caseStudy.result}</p>
              </div>
            </div>
            {(caseStudy.github || caseStudy.demo || caseStudy.youtube || caseStudy.figma) && (
              <div className="case-study-actions">
                {caseStudy.github && <a href={caseStudy.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">GitHub</a>}
                {caseStudy.demo && <a href={caseStudy.demo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Live Demo</a>}
                {caseStudy.youtube && <a href={caseStudy.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">YouTube</a>}
                {caseStudy.figma && <a href={caseStudy.figma} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Figma</a>}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
