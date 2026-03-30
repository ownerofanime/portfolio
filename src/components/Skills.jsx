import { useState, useEffect, useRef } from 'react';
import { skills } from '../data/skills';

const columns = [
  { key: 'data', label: 'Data & Analytics' },
  { key: 'development', label: 'Development' },
  { key: 'tools', label: 'Tools & Soft Skills' },
];

export default function Skills() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section" id="skills">
      <div className="container">
        <div className="section-label">Skills</div>
        <h2 className="section-title">What I actually know.</h2>
        <div className={`skills-grid ${visible ? 'visible' : ''}`} ref={ref} style={{ marginTop: 48 }}>
          {columns.map((col) => (
            <div key={col.key} className="skills-col">
              <h3>{col.label}</h3>
              {skills[col.key].map((skill, i) => (
                <div key={i} className="skill-item">
                  <div className="skill-header">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-pct">{skill.pct}%</span>
                  </div>
                  <div className="skill-bar">
                    <div
                      className="skill-fill"
                      style={{ width: visible ? `${skill.pct}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
