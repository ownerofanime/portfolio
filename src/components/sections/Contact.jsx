// Section — Contact: contact links, resume download, and a live message form.
// Form submissions are sent via Formspree (no backend needed).

import { useState } from 'react';

// To change the form destination: go to formspree.io, create a new form, and paste the endpoint here.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvgzpjkq';

const links = [
  { label: 'Email', value: 'matthewtjandera@gmail.com', href: 'mailto:matthewtjandera@gmail.com' },
  { label: 'LinkedIn', value: 'linkedin.com/in/matthewtjandera', href: 'https://linkedin.com/in/matthewtjandera' },
  { label: 'GitHub', value: 'github.com/tjandera', href: 'https://github.com/tjandera' },
  { label: 'Phone', value: '+65 8980 6759', href: 'tel:+6589806759' },
];

// Entrance animation is owned by usePageIntro's 'boot' variant (see ContactPage.jsx).
export default function Contact() {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section-label">Contact<span className="section-cart">CONTACT.GB</span></div>
        <h2 className="section-title">Let's build something together.</h2>
        <div className="contact-grid" style={{ marginTop: 48 }}>
          <div>
            <p className="contact-note">
              Open to internships, project collaborations, and hackathon teams. Based in Singapore.
            </p>
            <div className="status-badge">
              <span style={{ fontSize: 10 }}>🟢</span> Open to opportunities
            </div>
            <div className="contact-links">
              {links.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="contact-link">
                  <div>
                    <div className="contact-link-label">{link.label}</div>
                    <div>{link.value}</div>
                  </div>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="/Matthew_Tjandera_Resume%20(5).pdf" download="Matthew_Tjandera_Resume.pdf" className="btn btn-ghost">
                Download Resume ↓
              </a>
              <a href="/resume.html" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                View Resume →
              </a>
            </div>
          </div>

          <div>
            {status === 'success' ? (
              <div className="form-success">
                <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
                <strong>Message sent!</strong>
                <p style={{ marginTop: 6, fontSize: 14, color: 'var(--fg-mid)' }}>
                  Thanks for reaching out — I'll get back to you soon.
                </p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    required
                    placeholder="What's on your mind?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                {status === 'error' && (
                  <p className="form-error">Something went wrong. Try emailing me directly at matthewtjandera@gmail.com</p>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
