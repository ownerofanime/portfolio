import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { certifications } from '../data/certifications';

const tabs = ['All', 'Scholarships', 'Awards', 'Data & Python', 'Management', 'Networking', 'Languages'];

export default function Certifications() {
  const [active, setActive] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [lightboxImgIdx, setLightboxImgIdx] = useState(0);
  const ref = useReveal();

  const filtered = active === 'All'
    ? certifications
    : certifications.filter((c) => c.category === active);

  const openLightbox = (cert) => {
    setLightbox(cert);
    setLightboxImgIdx(0);
  };

  const closeLightbox = () => setLightbox(null);

  // Normalise: support both `image` (string) and `images` (array)
  const getImages = (cert) => {
    if (cert.images) return cert.images;
    if (cert.image) return [cert.image];
    return [];
  };

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
          {filtered.map((cert, i) => {
            const imgs = getImages(cert);
            const isScholarship = cert.category === 'Scholarships';
            return (
              <div
                key={i}
                className={`card cert-card ${isScholarship ? 'cert-card-scholarship' : ''}`}
                style={imgs.length > 0 || cert.pdf ? { cursor: 'pointer' } : {}}
                onClick={() => {
                  if (imgs.length > 0) openLightbox(cert);
                  else if (cert.pdf) window.open(cert.pdf, '_blank');
                }}
              >
                {isScholarship ? (
                  <div className="cert-scholarship-gallery">
                    {imgs.map((src, idx) => (
                      <div key={idx} className="cert-scholarship-thumb">
                        <img src={src} alt={`${cert.name} ${idx + 1}`} loading="lazy" />
                      </div>
                    ))}
                  </div>
                ) : imgs.length > 0 ? (
                  <div className={`cert-thumb ${cert.isBadge ? 'cert-thumb-badge' : ''}`}>
                    <img src={imgs[0]} alt={cert.name} loading="lazy" />
                  </div>
                ) : (
                  <div className={`cert-monogram ${cert.pdf ? 'cert-monogram-pdf' : ''}`}>
                    {cert.pdf ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                      </svg>
                    ) : cert.issuer.charAt(0)}
                  </div>
                )}
                <p className="cert-issuer">{cert.issuer}</p>
                <p className="cert-name">{cert.name}</p>
                {cert.scholarshipMeta && (
                  <p className="cert-scholarship-meta">{cert.scholarshipMeta}</p>
                )}
                {cert.badge && <span className="cert-badge">{cert.badge}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {lightbox && (() => {
        const imgs = getImages(lightbox);
        return (
          <div className="lightbox-overlay" onClick={closeLightbox}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={closeLightbox}>×</button>

              {imgs.length > 0 && (
                <div className="lightbox-img-wrap">
                  <img src={imgs[lightboxImgIdx]} alt={lightbox.name} />
                  {imgs.length > 1 && (
                    <>
                      <button
                        className="lightbox-arrow lightbox-arrow-prev"
                        onClick={(e) => { e.stopPropagation(); setLightboxImgIdx((lightboxImgIdx - 1 + imgs.length) % imgs.length); }}
                      >‹</button>
                      <button
                        className="lightbox-arrow lightbox-arrow-next"
                        onClick={(e) => { e.stopPropagation(); setLightboxImgIdx((lightboxImgIdx + 1) % imgs.length); }}
                      >›</button>
                      <div className="lightbox-dots">
                        {imgs.map((_, idx) => (
                          <span
                            key={idx}
                            className={`lightbox-dot ${idx === lightboxImgIdx ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLightboxImgIdx(idx); }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="lightbox-caption">
                <p className="cert-issuer" style={{ marginBottom: 4 }}>{lightbox.issuer}</p>
                <p className="cert-name">{lightbox.name}</p>
                {lightbox.scholarshipMeta && (
                  <p style={{ fontSize: 13, color: 'var(--fg-faint)', marginTop: 6 }}>
                    {lightbox.scholarshipMeta}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
