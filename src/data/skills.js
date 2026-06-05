// ─────────────────────────────────────────────────────────────────────
// Skills Data
//
// Three tiers rendered in the Skills section:
//   proficient  - actively used in shipped projects; shown with an accent colour
//   familiar    - used but still developing depth; shown in neutral style
//   platforms   - day-to-day tools; shown as simple text pills
//
// proficient / familiar entries: { name, context }
//   context is the one-line proof shown beneath the skill name (e.g. which project used it)
// platforms entries: plain strings
// ─────────────────────────────────────────────────────────────────────

export const skills = {
  proficient: [
    { name: "Python", context: "Cargill datathon, Manus AI pipeline, DQlab certifications" },
    { name: "SQL", context: "Data Management coursework, DQlab Case Study Bootcamp" },
    { name: "HTML / CSS / JS", context: "VIVACE website, Saver marketplace, Slay the Python" },
    { name: "Data Analytics", context: "Chengdu Bowl expansion, Cargill voyage optimisation" },
    { name: "Data Visualization", context: "pandas, matplotlib, site-selection ranking outputs" },
    { name: "Figma & UX Design", context: "Qatar Airways redesign, ArtSpace UI, design systems" },
  ],
  familiar: [
    { name: "React", context: "SafeSeven wealth hub, this portfolio" },
    { name: "SwiftUI", context: "OurReceipt iOS app (SMU Tech Series)" },
    { name: "scikit-learn / ML", context: "DQlab ML course, predictive modelling" },
    { name: "BigQuery / GCP", context: "Google Cloud cert, data analytics pipeline" },
    { name: "WebXR / AR", context: "ArtSpace AR marketplace (PINUS Hack)" },
    { name: "Firebase", context: "OurReceipt backend & auth" },
  ],
  platforms: [
    "VS Code", "MySQL Workbench", "Google Cloud", "Git / GitHub", "Linux CLI", "MS Office", "Manus AI",
  ],
};
