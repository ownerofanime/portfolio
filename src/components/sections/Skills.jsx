// Section — Skills: three-tier skill display (Proficient / Familiar / Platforms & Tools).
// Edit src/data/skills.js to update skills, contexts, and categories.

import { useState, useEffect, useRef } from 'react';
import { skills } from '../../data/skills';

export default function Skills() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section" id="skills">
      <div className="container">
        <div className="section-label">Skills<span className="section-cart">SKILLS.GB</span></div>
        <h2 className="section-title">What I actually know.</h2>
        <p className="section-subtitle">
          Skills proven through shipped projects and certifications — not just coursework.
        </p>
        <div className={`skills-tiers ${visible ? 'visible' : ''}`} ref={ref}>
          <div className="skills-tier">
            <div className="skills-tier-header">
              <span className="skills-tier-label">Proficient</span>
              <span className="skills-tier-desc">Used in shipped projects and certifications</span>
            </div>
            <div className="skills-tag-list">
              {skills.proficient.map((skill) => (
                <div key={skill.name} className="skill-tag skill-tag-proficient">
                  <span className="skill-tag-name">{skill.name}</span>
                  <span className="skill-tag-context">{skill.context}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="skills-tier">
            <div className="skills-tier-header">
              <span className="skills-tier-label">Familiar</span>
              <span className="skills-tier-desc">Used in projects, still developing depth</span>
            </div>
            <div className="skills-tag-list">
              {skills.familiar.map((skill) => (
                <div key={skill.name} className="skill-tag skill-tag-familiar">
                  <span className="skill-tag-name">{skill.name}</span>
                  <span className="skill-tag-context">{skill.context}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="skills-tier">
            <div className="skills-tier-header">
              <span className="skills-tier-label">Platforms & Tools</span>
              <span className="skills-tier-desc">Day-to-day environment</span>
            </div>
            <div className="skills-tag-list">
              {skills.platforms.map((name) => (
                <span key={name} className="skill-tag skill-tag-tool">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
