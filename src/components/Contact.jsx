import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';

const links = [
  { label: 'Email', value: 'matthewtjandera@gmail.com', href: 'mailto:matthewtjandera@gmail.com' },
  { label: 'LinkedIn', value: 'linkedin.com/in/matthewtjandera', href: 'https://linkedin.com/in/matthewtjandera' },
  { label: 'GitHub', value: 'github.com/ownerofanime', href: 'https://github.com/ownerofanime' },
  { label: 'Phone', value: '+65 8980 6759', href: 'tel:+6589806759' },
];

export default function Contact() {
  const ref = useReveal();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    setSubmitted(true);
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section-label">Contact</div>
        <h2 className="section-title">Let's build something together.</h2>
        <div className="contact-grid reveal" ref={ref} style={{ marginTop: 48 }}>
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
            <div style={{ marginTop: 24 }}>
              <a href="/Matthew_Tjandera_Resume.pdf" download className="btn btn-ghost">
                Download Resume ↗
              </a>
            </div>
          </div>
          <div>
            {submitted ? (
              <div className="form-success">
                Thanks for reaching out! I'll get back to you soon.
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
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
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
