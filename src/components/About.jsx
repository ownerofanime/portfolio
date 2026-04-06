import { useReveal } from '../hooks/useReveal';
import ProfileCard from './ProfileCard';

export default function About() {
  const ref = useReveal();

  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-label">About</div>
        <div className="about-grid reveal" ref={ref}>
          <div className="about-photo">
            <ProfileCard
              avatarUrl="/new photo.png"
              miniAvatarUrl="/favicon.svg"
              name="Matthew Tjandera"
              title="Information Systems @ SMU"
              handle=""
              status="Open to opportunities"
              contactText="Contact Me"
              showUserInfo
              enableTilt={true}
              enableMobileTilt={false}
              behindGlowEnabled
              behindGlowColor="hsla(271, 100%, 70%, 0.6)"
              innerGradient="linear-gradient(145deg,hsla(271, 40%, 45%, 0.55) 0%,hsla(264, 60%, 70%, 0.27) 100%)"
              onContactClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
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
