// Section — CartridgeShelf: the Home page's route picker.
// Each page of the site is presented as a Game Boy cartridge you can "load",
// which is what ties the multi-page structure back to the hero's console.

import { Link } from 'react-router-dom';
import { routes, photographyRoute } from '../../lib/routes';

const shelf = [...routes, photographyRoute];

export default function CartridgeShelf() {
  return (
    <section className="section" id="shelf">
      <div className="container">
        <div className="section-label">
          Select a cartridge<span className="section-cart">PORTFOLIO.GB</span>
        </div>
        <h2 className="section-title">Pick a page to load.</h2>
        <p className="section-subtitle">
          Every part of the portfolio is its own page — load whichever one you
          came for.
        </p>

        <div className="cart-grid">
          {shelf.map((r, i) => (
            <Link key={r.path} to={r.path} className="cart-card">
              <span className="cart-card-slot" aria-hidden="true">
                <span className="cart-card-ridge" />
                <span className="cart-card-ridge" />
                <span className="cart-card-ridge" />
              </span>
              <span className="cart-card-body">
                <span className="cart-card-no">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="cart-card-name">{r.cart}</span>
                <span className="cart-card-label">{r.label}</span>
                <span className="cart-card-blurb">{r.blurb}</span>
                <span className="cart-card-load">LOAD ▶</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
