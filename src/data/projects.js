// ─────────────────────────────────────────────────────────────────────
// Project & Hackathon Data
//
// Each project object supports these fields:
//   id          - unique number
//   title       - project name
//   hackathon   - event name
//   placement   - result label (e.g. "🥇 1st Place", "Top 10 Finalist")
//   year        - string year
//   category    - array of category strings matching the filter tabs
//   desc        - short paragraph shown on the card
//   stack       - array of tech/tool tags
//   featured    - (optional) true → shown in the Featured grid at the top
//   keyResult   - (optional) one-line highlight shown as a pill on the card
//   caseStudy   - (optional) { problem, approach, result } → enables Case Study modal
//   github/demo/youtube/figma - (optional) link buttons shown on the card
//
// hackathonRecord is the full participation list shown in the scrollable table.
// ─────────────────────────────────────────────────────────────────────

export const projects = [
  {
    id: 8,
    title: "Chengdu Bowl Expansion",
    hackathon: "Manus AI × January Capital Mini Hackathon",
    placement: "🥇 1st Place",
    year: "2026",
    category: ["Data & ML"],
    desc: "Chengdu Bowl needed a data-backed strategy to identify the highest-potential U.S. cities for expansion. Built an analytics pipeline using Manus AI to analyse demographics, competitor density, and consumer spending patterns across target markets — producing a scored site-selection ranking with supporting visualisations. Presented directly to the founding team; recommendations were adopted as input to their actual expansion planning.",
    stack: ["Manus AI", "Data Analytics", "Site Selection", "Python"],
    featured: true,
    keyResult: "Adopted by founding team for real U.S. expansion planning",
    caseStudy: {
      problem: "Chengdu Bowl needed a data-backed strategy to identify the highest-potential U.S. cities for expansion — without guessing.",
      approach: "Built an analytics pipeline using Manus AI to analyse demographics, competitor density, and consumer spending patterns across U.S. target markets, producing a scored site-selection ranking with supporting visualisations.",
      result: "Won 1st place across all competing teams. Recommendations were adopted as direct input to the founding team's actual U.S. expansion planning.",
    },
  },
  {
    id: 2,
    title: "ArtSpace",
    hackathon: "PINUS Hack 2026 × Xtremax × Gallery 1819",
    placement: "Top 6 Finalist",
    year: "2026",
    category: ["Product & UX", "Web & Mobile"],
    desc: "Immersive AR art marketplace using LiDAR and WebXR. Browse curated collections and place art at real scale in your physical space.",
    stack: ["WebXR", "LiDAR", "AI Recommendation", "AR"],
    github: "https://github.com/ImNuza/pinusoverclock",
    youtube: "https://www.youtube.com/shorts/92K-bys875o",
    featured: true,
    keyResult: "Top 6 of all competing teams",
    caseStudy: {
      problem: "Art discovery is confined to physical gallery walls — most people never engage with curated art in their everyday environment.",
      approach: "Designed and built an immersive AR art marketplace end-to-end using LiDAR, WebXR, and an AI recommendation engine, letting users place curated art at real scale in their physical space.",
      result: "Reached Top 6 across all competing teams at PINUS Hack 2026, judged by Xtremax and Gallery 1819.",
    },
  },
  {
    id: 3,
    title: "Sirius Tools",
    hackathon: "SMU BIA × Cargill Datathon 2026",
    placement: "Top 10 Finalist",
    year: "2026",
    category: ["Data & ML"],
    desc: "Cargill needed a smarter way to allocate Capesize vessels to cargo routes while minimising bunker costs. Built a voyage optimization engine in Python with a freight rate calculator, vessel-cargo allocation model, and bunker fuel sensitivity analysis — paired with an AI chatbot for non-technical operators to query recommendations in plain language.",
    stack: ["Python", "Predictive ML", "Data Analytics", "AI Chatbot"],
    github: "https://github.com/Xxdsanctuary/siriustools",
    youtube: "https://www.youtube.com/watch?v=miwZCis0xL0",
    featured: true,
    keyResult: "$2.21M USD projected profit for Capesize fleet allocation",
    caseStudy: {
      problem: "Cargill needed smarter Capesize vessel-to-cargo allocation to minimise bunker fuel costs across complex shipping routes.",
      approach: "Built a Python voyage optimisation engine with a freight rate calculator, vessel-cargo allocation model, and bunker fuel sensitivity analysis, paired with an AI chatbot so non-technical operators could query route recommendations in plain language.",
      result: "Reached Top 10 across all university teams. Model projected $2.21M USD total profit for Cargill's Capesize fleet allocation.",
    },
  },
  {
    id: 4,
    title: "OurReceipt",
    hackathon: "SMU Tech Series 2025 (Overclocked)",
    placement: "Top 10 Finalist",
    year: "2025",
    category: ["Web & Mobile", "Product & UX"],
    desc: "Privacy-first iOS app for QR-based digital receipts. Merchant and wallet dual-mode, Firebase auth, automated expense tracking.",
    stack: ["SwiftUI", "Firebase", "QR", "iOS"],
    github: "https://github.com/ownerofanime/Overclocked-Oureceipt-App",
    keyResult: "Top 10 · targeting 1.6M consumers in Singapore",
    caseStudy: {
      problem: "Singapore generates massive paper receipt waste, and consumers have no easy way to track and store digital transaction records.",
      approach: "Designed and built OurReceipt — a QR-based digital receipt iOS app with merchant and wallet dual-mode, Firebase auth, and automated expense tracking using SwiftUI.",
      result: "Reached Top 10 across all competing teams at SMU Tech Series 2025, with the platform targeting Singapore's 1.6M consumers.",
    },
  },
  {
    id: 1,
    title: "SafeSeven",
    hackathon: "NTU FinTech Hackathon",
    placement: "Participated",
    year: "2025",
    category: ["Data & ML", "Web & Mobile"],
    desc: "Integrated wealth wellness hub unifying stocks, crypto, and cash. 8-factor financial health scoring with what-if scenario simulations.",
    stack: ["React", "Python", "Financial APIs", "Data Visualization"],
    github: "https://github.com/ImNuza/sixeven",
    demo: "https://sixeven.vercel.app/",
    demoNote: "Login page only. API keys inactive",
    youtube: "https://www.youtube.com/watch?v=CbAIZN-ZMe0",
    keyResult: "8-factor scoring · live demo deployed",
    caseStudy: {
      problem: "Users manage stocks, crypto, and cash across separate platforms with no unified view of their financial health.",
      approach: "Built an integrated wealth wellness hub with 8-factor financial health scoring, what-if scenario simulations, and real-time financial API integrations using React and Python.",
      result: "Live demo deployed at sixeven.vercel.app. Participated in NTU FinTech Hackathon 2025.",
    },
  },
  {
    id: 5,
    title: "Saver",
    hackathon: "GOSOFT Retail Tech Hackathon",
    placement: "Finalist",
    year: "2025",
    category: ["Web & Mobile"],
    desc: "Hyperlocal marketplace connecting retailers with college students. Near-expiry food at discounted prices, discoverable near campus.",
    stack: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/ownerofanime/ownerofanime.github.io",
    demo: "https://ownerofanime.github.io",
    demoNote: "Static HTML, no backend",
    keyResult: "Finalist · hyperlocal near-expiry food marketplace",
    caseStudy: {
      problem: "Retailers lose revenue on near-expiry food while college students struggle to find affordable meals near campus.",
      approach: "Built a hyperlocal marketplace using HTML, CSS, and JavaScript that surfaces near-expiry food at discounted prices, discoverable by students near campus.",
      result: "Reached Finalist at GOSOFT Retail Tech Hackathon 2025.",
    },
  },
  {
    id: 6,
    title: "UXperience",
    hackathon: "UPH Falcon Project 14 × Qatar Airways",
    placement: "Participated",
    year: "2025",
    category: ["Product & UX"],
    desc: "Passenger-centric digital experience redesign for Qatar Airways. Full design system, journey mapping, and interactive prototype.",
    stack: ["Figma", "UX Research", "Design System", "Prototyping"],
    figma: "https://www.figma.com/design/8qsHbtHf8wgzoIO3ESfR7P/UXperience?node-id=0-1",
    keyResult: "Full design system + interactive prototype",
    caseStudy: {
      problem: "Qatar Airways' digital passenger experience lacked cohesion — journey touchpoints felt disconnected and hard to navigate.",
      approach: "Conducted UX research, built a full design system, mapped end-to-end passenger journey, and delivered an interactive Figma prototype for the redesigned digital experience.",
      result: "Completed a full UX case study with design system, journey maps, and interactive prototype. Participated in UPH Falcon Project 14.",
    },
  },
  {
    id: 7,
    title: "Slay the Python",
    hackathon: "SMU DSAS Bonding Night 2026",
    placement: "Internal Event",
    year: "2026",
    category: ["Web & Mobile"],
    desc: "Retro RPG browser game with gamified DSA challenges, pixel-art UI, boss fights, and live sorting algorithm visualizations.",
    stack: ["HTML", "CSS", "JavaScript", "Game Design"],
    demo: "https://effective-beige-ytmnwby2p7.edgeone.app/",
    keyResult: "Gamified DSA learning · live browser game",
  },
];

export const hackathonRecord = [
  { event: "Manus AI × January Capital Mini Hackathon", organiser: "Manus AI / January Capital", year: "2026", result: "🥇 1st Place" },
  { event: "PINUS Hack 2026 × Xtremax × Gallery 1819", organiser: "PINUS / Xtremax", year: "2026", result: "Top 6 Finalist" },
  { event: "SMU BIA × Cargill Datathon 2026", organiser: "SMU BIA / Cargill", year: "2026", result: "Top 10 Finalist" },
  { event: "SMU Tech Series 2025 (Overclocked)", organiser: "SMU", year: "2025", result: "Top 10 Finalist" },
  { event: "NTU FinTech Hackathon", organiser: "NTU", year: "2025", result: "Participated" },
  { event: "GOSOFT Retail Tech Hackathon", organiser: "GOSOFT", year: "2025", result: "Finalist" },
  { event: "UPH Falcon Project 14 × Qatar Airways", organiser: "UPH / Qatar Airways", year: "2025", result: "Participated" },
  { event: "Accenture UIC 2026", organiser: "Accenture", year: "2026", result: "Participated" },
  { event: "PSA Code Sprint 2025", organiser: "PSA", year: "2025", result: "Participated" },
  { event: "Singapore Hackomania 2026", organiser: "Hackomania", year: "2026", result: "Participated" },
  { event: "FinTech Innovators' Hackathon 2026", organiser: "FinTech Innovators", year: "2026", result: "Participated" },
  { event: "SMU DSAS Bonding Night 2026", organiser: "SMU DSAS", year: "2026", result: "Internal Event" },
];
