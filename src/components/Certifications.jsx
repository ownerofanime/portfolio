import { useState, useRef, useCallback, useEffect } from 'react';
import { useReveal } from '../hooks/useReveal';
import { certifications } from '../data/certifications';
import BorderGlow from './BorderGlow';

const tabs = ['All', 'Scholarships', 'Awards', 'Data & Python', 'Management', 'Networking', 'Languages'];

const CERT_GLOW = {
  Scholarships:    { colors: ['#C9A84C', '#f59e0b', '#eab308'], glow: '45 80 55' },
  Awards:          { colors: ['#f472b6', '#ec4899', '#f43f5e'], glow: '340 80 65' },
  'Data & Python': { colors: ['#38bdf8', '#6366f1', '#06b6d4'], glow: '210 80 70' },
  Management:      { colors: ['#34d399', '#10b981', '#059669'], glow: '160 70 60' },
  Networking:      { colors: ['#a78bfa', '#8b5cf6', '#7c3aed'], glow: '260 80 70' },
  Languages:       { colors: ['#fb923c', '#f97316', '#ea580c'], glow: '25 90 60' },
};

function ZoomableImage({ src, alt }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);

  const clampTranslate = useCallback((x, y, s) => {
    if (s <= 1) return { x: 0, y: 0 };
    const el = containerRef.current;
    if (!el) return { x, y };
    const maxX = (el.offsetWidth * (s - 1)) / 2;
    const maxY = (el.offsetHeight * (s - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setScale((prev) => {
      const next = Math.max(1, Math.min(5, prev - e.deltaY * 0.003));
      if (next <= 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (scale <= 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    translateStart.current = { ...translate };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [scale, translate]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setTranslate(clampTranslate(translateStart.current.x + dx, translateStart.current.y + dy, scale));
  }, [scale, clampTranslate]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }, [scale]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastPinchDist.current > 0) {
          const delta = dist - lastPinchDist.current;
          setScale((prev) => {
            const next = Math.max(1, Math.min(5, prev + delta * 0.008));
            if (next <= 1) setTranslate({ x: 0, y: 0 });
            return next;
          });
        }
        lastPinchDist.current = dist;
      }
    };

    const handleTouchEnd = () => { lastPinchDist.current = 0; };

    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Reset zoom when image source changes
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [src]);

  return (
    <div
      ref={containerRef}
      className="lightbox-zoom-container"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.2s ease-out',
        }}
      />
      {scale > 1 && (
        <div className="lightbox-zoom-badge">{Math.round(scale * 100)}%</div>
      )}
      <div className="lightbox-zoom-hint">
        {scale <= 1 ? 'Scroll or pinch to zoom · Double-click to zoom in' : 'Drag to pan · Double-click to reset'}
      </div>
    </div>
  );
}

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

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') {
        const imgs = getImages(lightbox);
        if (imgs.length > 1) setLightboxImgIdx((prev) => (prev + 1) % imgs.length);
      }
      if (e.key === 'ArrowLeft') {
        const imgs = getImages(lightbox);
        if (imgs.length > 1) setLightboxImgIdx((prev) => (prev - 1 + imgs.length) % imgs.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

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
            const glow = CERT_GLOW[cert.category] || CERT_GLOW['Data & Python'];
            return (
              <BorderGlow
                key={i}
                colors={glow.colors}
                glowColor={glow.glow}
                backgroundColor="var(--white)"
                borderRadius={12}
                glowRadius={25}
                glowIntensity={0.8}
                coneSpread={25}
                edgeSensitivity={30}
                className={isScholarship ? 'cert-glow-scholarship' : ''}
              >
                <div
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
              </BorderGlow>
            );
          })}
        </div>
      </div>

      {lightbox && (() => {
        const imgs = getImages(lightbox);
        return (
          <div className="lightbox-overlay" onClick={closeLightbox}>
            <div className="lightbox-content lightbox-content-zoom" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={closeLightbox}>×</button>

              {imgs.length > 0 && (
                <div className="lightbox-img-wrap">
                  <ZoomableImage src={imgs[lightboxImgIdx]} alt={lightbox.name} />
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
