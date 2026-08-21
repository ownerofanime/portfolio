// Section — Experience: timeline of work roles with bullet descriptions.
// Edit src/data/experience.js to add or update roles.

import { experience } from '../../data/experience';

// Entrance animation is owned by usePageIntro's 'timeline' variant (see ExperiencePage.jsx).
export default function Experience() {
  return (
    <section className="section" id="experience">
      <div className="container">
        <div className="section-label">Experience<span className="section-cart">EXPERIENCE.GB</span></div>
        <h2 className="section-title">Where I've worked.</h2>

        <div className="timeline" style={{ marginTop: 48 }}>
          {experience.map((exp, i) => (
            <div key={i} className="timeline-item">
              <div className={`timeline-dot ${exp.current ? 'current' : ''}`} />
              <div className="timeline-header">
                <span className="timeline-role">{exp.role}</span>
                <span className="timeline-period">{exp.period}</span>
              </div>
              <p className="timeline-org">{exp.org}</p>
              <p className="timeline-location">{exp.location}</p>
              <ul className="timeline-bullets">
                {exp.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
