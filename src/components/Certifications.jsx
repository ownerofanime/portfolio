import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { certifications } from '../data/certifications';

const tabs = ['All', 'Data & Python', 'Cloud', 'Management', 'Networking', 'Languages'];

export default function Certifications() {
  const [active, setActive] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const ref = useReveal();

  const filtered = active === 'All'
    ? certifications
    : certifications.filter((c) => c.category === active);

  return (
    <section className="section" id="certifications">
      <div className="container">
        <div className="section-label">Certifications</div>
        <h2 className="section-title">Certified & Learning.</h2>
        <div className="cert-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`cert-tab ${active === tab ? 'active' : ''}`}
              onClick={() => setActive(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="cert-grid reveal" ref={ref}>
          {filtered.map((cert, i) => (
            <div
              key={i}
              className="card cert-card"
              style={cert.image ? { cursor: 'pointer' } : {}}
              onClick={() => cert.image && setLightbox(cert)}
            >
              {cert.image ? (
                <div className="cert-thumb">
                  <img src={cert.image} alt={cert.name} loading="lazy" />
                </div>
              ) : (
                <div className="cert-monogram">
                  {cert.issuer.charAt(0)}
                </div>
              )}
              <p className="cert-issuer">{cert.issuer}</p>
              <p className="cert-name">{cert.name}</p>
              {cert.badge && <span className="cert-badge">{cert.badge}</span>}
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>×</button>
            <img src={lightbox.image} alt={lightbox.name} />
            <div className="lightbox-caption">
              <p className="cert-issuer" style={{ marginBottom: 4 }}>{lightbox.issuer}</p>
              <p className="cert-name">{lightbox.name}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
