// Section — RouteCardSwap: the Home page's route picker, replacing the old
// grid "cartridge shelf". Each page of the site is a card in an animated
// stack (react-bits CardSwap) that auto-cycles, showing one page at a time;
// clicking the front card loads that page.
//
// Hovering the deck captures the mouse wheel: scroll down/up cycles the
// cards forward/back instead of scrolling the page, so you can deliberately
// browse the stack. Moving the cursor off the deck hands scrolling straight
// back to the page — nothing lingers captured.
//
// Respects prefers-reduced-motion: CardSwap cycles on an indefinite timer,
// which the rest of the site avoids for that setting (the 3-D Game Boy skips
// entirely for the same reason) — so reduced-motion gets a plain static grid
// of the same cards instead.

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CardSwap, { Card } from '../ui/CardSwap/CardSwap';
import { routes, photographyRoute } from '../../lib/routes';

const deck = [...routes, photographyRoute];

// Minimum time between wheel-triggered cycles. A single scroll gesture
// (especially a trackpad) fires many small deltaY events in a burst — without
// a cooldown one flick would blow through the whole deck instead of stepping
// one card at a time.
const WHEEL_COOLDOWN_MS = 550;

function CardContent({ index, route }) {
  return (
    <>
      <span className="route-card-strip" aria-hidden="true">
        <span className="route-card-ridge" />
        <span className="route-card-ridge" />
        <span className="route-card-ridge" />
      </span>
      <span className="route-card-body">
        <span className="route-card-no">{String(index + 1).padStart(2, '0')}</span>
        <span className="route-card-cart">{route.cart}</span>
        <span className="route-card-title">{route.label}</span>
        <span className="route-card-blurb">{route.blurb}</span>
        <span className="route-card-load">LOAD ▶</span>
      </span>
    </>
  );
}

export default function RouteCardSwap() {
  const navigate = useNavigate();
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  const stageRef = useRef(null);
  const swapApiRef = useRef(null);
  const lastWheelRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Wheel-to-cycle, scoped to the stage element only — scrolling anywhere
  // else on the page is completely unaffected.
  useEffect(() => {
    if (reducedMotion) return;
    const node = stageRef.current;
    if (!node) return;

    const onWheel = (e) => {
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheelRef.current < WHEEL_COOLDOWN_MS) return;
      lastWheelRef.current = now;
      if (e.deltaY > 0) swapApiRef.current?.next();
      else if (e.deltaY < 0) swapApiRef.current?.prev();
    };

    // non-passive: preventDefault only works on a wheel listener that opts
    // out of the browser's passive-by-default scroll optimisation.
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [reducedMotion]);

  const onKeyDown = (e, path) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(path); }
  };

  return (
    <section className="section" id="shelf">
      <div className="container">
        <div className="route-swap-layout">
          <div className="route-swap-intro">
            <div className="section-label">
              Select a cartridge<span className="section-cart">PORTFOLIO.GB</span>
            </div>
            <h2 className="section-title">Pick a page to load.</h2>
            <p className="section-subtitle">
              {reducedMotion
                ? 'Every part of the portfolio is its own page — load whichever one you came for.'
                : 'Every part of the portfolio is its own page. Hover the stack and scroll to browse, or click the front card to load it.'}
            </p>
          </div>

          {reducedMotion ? (
            <div className="route-static-grid">
              {deck.map((r, i) => (
                <Link key={r.path} to={r.path} className="route-card">
                  <CardContent index={i} route={r} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="route-swap-stage" ref={stageRef}>
              <CardSwap
                ref={swapApiRef}
                width={380}
                height={230}
                cardDistance={44}
                verticalDistance={36}
                skewAmount={4}
                delay={5000}
                easing="power"
                pauseOnHover
              >
                {deck.map((r, i) => (
                  <Card
                    key={r.path}
                    customClass="route-card"
                    role="link"
                    tabIndex={0}
                    aria-label={`Load ${r.label}`}
                    onClick={() => navigate(r.path)}
                    onKeyDown={(e) => onKeyDown(e, r.path)}
                  >
                    <CardContent index={i} route={r} />
                  </Card>
                ))}
              </CardSwap>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
