import { useReveal } from '../hooks/useReveal';

const tags = ['Singapore', 'SMU IS', 'Data Builder', 'Hackathon Competitor', 'IELTS 8.0'];

export default function About() {
  const ref = useReveal();

  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-label">About</div>
        <div className="about-grid reveal" ref={ref}>
          <div className="about-photo">
            <img src="/matthew.jpeg" alt="Matthew Tjandera" className="photo-real" />
            <p className="photo-caption">Matthew Tjandera</p>
            <div className="about-tags">
              {tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </div>
          <div className="about-text">
            <p>
              I'm Matthew, a year-one Information Systems student at Singapore Management University who builds data-driven solutions to real problems. From shipping optimizers to AR art marketplaces, I show up to hackathons to ship, not just participate.
            </p>
            <p>
              With seven hackathon builds under my belt spanning fintech, logistics, mobile, and UX design, I've learned how to scope, build, and present under pressure. I'm most at home in Python and data workflows, but I'm comfortable reaching for React, SwiftUI, or Figma when the problem calls for it.
            </p>
            <p>
              Outside of building, I direct events for SMU's Data Science & Analytics Society and help organize free education programs for underprivileged youth through Youthspace.id.
            </p>
            <div className="about-edu">
              <h3>Education</h3>
              <div className="edu-item">
                <div className="edu-school">Singapore Management University</div>
                <div className="edu-degree">B.Sc. Information Systems, Jan 2025 – Present</div>
                <div className="edu-detail">
                  Coursework: Programming & Computational Thinking, Data Management, Algorithms.
                  Events Director, DSAS (Jan 2026 – Present).
                </div>
              </div>
              <div className="edu-item">
                <div className="edu-school">Saint Nicholas School</div>
                <div className="edu-degree">High School, Jakarta</div>
                <div className="edu-detail">
                  President, Student Council 2023–2024. 1st Place Computer Competition.
                  Scholarship recipient (Rp 5,000,000). Model Student 8x.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
