// ─── KnownInterestPaths.jsx ────────────────────────────────────────────────
// Shows adjacent career pathways based on the student's self-stated interest
// areas from Step 0 of the assessment.
// ──────────────────────────────────────────────────────────────────────────

import Chip from '../ui/Chip'

// ── Hardcoded map: interest area → main paths + adjacent paths ──────────────
const ADJACENT = {
  'Technology & Computing': {
    icon: '💻',
    adjacent: [
      { title: 'UX Designer', why: 'Tech + creativity — design how apps feel, not just how they work', skills: ['Figma', 'User Research', 'Prototyping'] },
      { title: 'Health Informatics Specialist', why: 'Apply tech skills to healthcare data systems and patient records', skills: ['EMR Systems', 'Data Analysis', 'Healthcare IT'] },
      { title: 'Robotics Engineer', why: 'Combine coding with physical hardware and autonomous systems', skills: ['Python', 'ROS', 'Electronics'] },
      { title: 'EdTech Developer', why: 'Build learning platforms and educational software for the future of school', skills: ['LMS', 'Instructional Design', 'Web Dev'] },
    ],
  },
  'Healthcare & Medicine': {
    icon: '🏥',
    adjacent: [
      { title: 'Biomedical Engineer', why: 'Design medical devices and equipment — engineering meets patient care', skills: ['Biology', 'Mechanical Design', 'Clinical Research'] },
      { title: 'Public Health Analyst', why: 'Work on population-level health policy and disease prevention strategies', skills: ['Epidemiology', 'Data Analysis', 'Policy Writing'] },
      { title: 'Medical Illustrator', why: 'Combine art and anatomy to visualise complex medical concepts', skills: ['Scientific Illustration', 'Anatomy', 'Digital Art'] },
      { title: 'Health App Developer', why: 'Build digital health tools — coding skills applied directly to medicine', skills: ['Mobile Dev', 'Healthcare APIs', 'UX Design'] },
    ],
  },
  'Arts & Creative Design': {
    icon: '🎨',
    adjacent: [
      { title: 'Brand Strategist', why: 'Combine visual skills with business thinking to shape brand identity', skills: ['Brand Identity', 'Marketing Strategy', 'Research'] },
      { title: 'Experience Designer (XD)', why: 'Design user experiences for apps and digital products at scale', skills: ['UX Research', 'Wireframing', 'Adobe XD / Figma'] },
      { title: 'Game Art Designer', why: 'Bring game worlds to life — 2D/3D assets, characters, and environments', skills: ['3D Modelling', 'Unity/Unreal', 'Concept Art'] },
      { title: 'Art Director (Advertising)', why: 'Lead creative direction for campaigns across print, digital, and video', skills: ['Creative Direction', 'Concept Development', 'Typography'] },
    ],
  },
  'Business & Entrepreneurship': {
    icon: '💼',
    adjacent: [
      { title: 'Venture Capital Analyst', why: 'Evaluate startups and invest in the companies shaping tomorrow', skills: ['Financial Modelling', 'Due Diligence', 'Market Research'] },
      { title: 'Social Enterprise Manager', why: 'Run a business with a mission to solve real social problems', skills: ['Impact Measurement', 'Grant Writing', 'Operations'] },
      { title: 'Growth Hacker', why: 'Use data and creativity to rapidly grow digital products and user bases', skills: ['SEO/SEM', 'A/B Testing', 'Analytics'] },
      { title: 'Operations Consultant', why: 'Help organisations work smarter — process improvement at scale', skills: ['Lean/Six Sigma', 'Project Management', 'Data Analysis'] },
    ],
  },
  'Science & Research': {
    icon: '🔬',
    adjacent: [
      { title: 'Science Communicator', why: 'Translate complex research into public understanding through media', skills: ['Science Writing', 'Podcast/Video', 'Public Outreach'] },
      { title: 'Bioinformatics Analyst', why: 'Apply computer science to biological data — the future of genomics', skills: ['Python/R', 'Genomic Data', 'Statistical Analysis'] },
      { title: 'Regulatory Affairs Scientist', why: 'Ensure research products meet legal and safety standards before launch', skills: ['Regulatory Compliance', 'Documentation', 'Risk Assessment'] },
      { title: 'Patent Examiner', why: 'Use scientific expertise to evaluate new inventions and grant intellectual property rights', skills: ['IP Law', 'Technical Analysis', 'Research'] },
    ],
  },
  'Education & Teaching': {
    icon: '📚',
    adjacent: [
      { title: 'Curriculum Designer', why: 'Design learning programmes at a system level — beyond the classroom', skills: ['Learning Theory', 'Instructional Design', 'Assessment'] },
      { title: 'Corporate Trainer', why: 'Teach professional skills in companies — often higher pay than school roles', skills: ['Adult Learning', 'Facilitation', 'L&D Platforms'] },
      { title: 'Educational Psychologist', why: 'Support student wellbeing and learning challenges using clinical insights', skills: ['Counselling', 'Assessment', 'Child Development'] },
      { title: 'EdTech Specialist', why: 'Implement and evaluate educational technology across schools and districts', skills: ['LMS', 'Digital Literacy', 'Teacher Training'] },
    ],
  },
  'Law & Policy': {
    icon: '⚖️',
    adjacent: [
      { title: 'Compliance Officer', why: 'Ensure companies follow regulations — growing demand in finance and tech', skills: ['Regulatory Knowledge', 'Risk Management', 'Auditing'] },
      { title: 'Human Rights Advocate', why: 'Work with NGOs and international bodies on rights-based issues', skills: ['International Law', 'Advocacy', 'Research Writing'] },
      { title: 'Mediator / Arbitrator', why: 'Resolve commercial disputes without going to court — high demand', skills: ['Negotiation', 'Conflict Resolution', 'Communication'] },
      { title: 'Legal Tech Product Manager', why: 'Build software tools that modernise the legal industry', skills: ['LegalTech', 'Product Management', 'Legal Knowledge'] },
    ],
  },
  'Engineering & Architecture': {
    icon: '🔧',
    adjacent: [
      { title: 'Sustainability Consultant', why: 'Apply engineering to green buildings and net-zero infrastructure projects', skills: ['LEED / BREEAM', 'Carbon Analysis', 'Building Systems'] },
      { title: 'Urban Planner', why: 'Design the cities of tomorrow — transport, housing, and public spaces', skills: ['GIS Mapping', 'Zoning Law', 'Community Engagement'] },
      { title: 'BIM Specialist', why: 'Use 3D digital models to manage construction projects more efficiently', skills: ['Revit / BIM', 'Project Management', 'Coordination'] },
      { title: 'Aerospace Engineer', why: 'Design aircraft and spacecraft systems — a high-growth sector in the UAE', skills: ['Fluid Dynamics', 'CAD', 'Materials Science'] },
    ],
  },
  'Environment & Sustainability': {
    icon: '🌿',
    adjacent: [
      { title: 'ESG Analyst', why: 'Help companies measure and report their environmental and social impact', skills: ['ESG Reporting', 'Data Analysis', 'Stakeholder Engagement'] },
      { title: 'Renewable Energy Engineer', why: 'Design solar, wind, and clean energy systems for a net-zero future', skills: ['Electrical Engineering', 'Energy Modelling', 'Project Management'] },
      { title: 'Environmental Lawyer', why: 'Use legal skills to fight for climate policy and environmental regulations', skills: ['Environmental Law', 'Litigation', 'Policy Analysis'] },
      { title: 'Marine Biologist', why: 'Study ocean ecosystems — especially relevant for the UAE\'s coastal region', skills: ['Marine Ecology', 'Fieldwork', 'Data Collection'] },
    ],
  },
  'Media & Entertainment': {
    icon: '🎬',
    adjacent: [
      { title: 'Podcast Producer', why: 'One of the fastest-growing media formats — low barrier, high creative freedom', skills: ['Audio Editing', 'Interviewing', 'Distribution Strategy'] },
      { title: 'Social Media Strategist', why: 'Turn content creation skills into a data-driven business role', skills: ['Analytics', 'Community Management', 'Content Strategy'] },
      { title: 'Esports Manager', why: 'Manage competitive gaming teams and events — a booming global industry', skills: ['Event Management', 'Brand Partnerships', 'Gaming Industry'] },
      { title: 'Music Supervisor', why: 'Select music for films, ads, and games — creativity plus licensing law', skills: ['Music Licensing', 'Industry Networks', 'Taste Curation'] },
    ],
  },
  'Finance & Economics': {
    icon: '💰',
    adjacent: [
      { title: 'FinTech Product Manager', why: 'Build financial apps — bridges finance skills with technology and UX', skills: ['Product Strategy', 'Agile', 'Financial Services'] },
      { title: 'Actuary', why: 'Use maths and statistics to price risk — one of the highest-paid graduate careers', skills: ['Statistics', 'Excel / R', 'Risk Modelling'] },
      { title: 'Impact Investor', why: 'Deploy capital into businesses solving global problems for profit and purpose', skills: ['ESG Frameworks', 'Financial Modelling', 'Venture Capital'] },
      { title: 'Forensic Accountant', why: 'Investigate financial fraud — accounting skills combined with detective work', skills: ['Audit Techniques', 'Legal Knowledge', 'Investigation'] },
    ],
  },
  'Aviation & Tourism': {
    icon: '✈️',
    adjacent: [
      { title: 'Aviation Safety Inspector', why: 'Ensure aircraft and airline operations meet the highest safety standards', skills: ['Aviation Regulations', 'Risk Assessment', 'Technical Knowledge'] },
      { title: 'Travel Tech Entrepreneur', why: 'Build the next booking platform or travel planning app', skills: ['Product Management', 'Travel Industry', 'UX Design'] },
      { title: 'Destination Marketing Manager', why: 'Promote cities and countries as tourism destinations — big UAE industry', skills: ['Digital Marketing', 'Content Creation', 'Partnership Management'] },
      { title: 'Air Traffic Controller', why: 'Manage aircraft flow safely — a critical, well-paid career in UAE aviation', skills: ['Spatial Reasoning', 'Communication', 'High-Pressure Decision Making'] },
    ],
  },
}

// ── Sub-components ────────────────────────────────────────────────────────────
function PathCard({ career }) {
  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #e8eef4',
      borderRadius: 14,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <p style={{
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 700,
        fontSize: '0.95rem',
        color: '#013147',
        margin: 0,
      }}>
        {career.title}
      </p>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.8rem',
        color: '#64748b',
        lineHeight: 1.5,
        margin: 0,
      }}>
        {career.why}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
        {career.skills.map(s => (
          <span key={s} style={{
            background: '#e8f6fb',
            color: '#1a7a93',
            border: '1px solid rgba(34,158,188,0.2)',
            borderRadius: 999,
            padding: '3px 10px',
            fontSize: 11,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
          }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

function InterestSection({ area, data }) {
  return (
    <div style={{ marginBottom: 36 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
        paddingBottom: 10, borderBottom: '1.5px solid #e8eef4',
      }}>
        <span style={{ fontSize: 22 }}>{data.icon}</span>
        <h3 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 800,
          fontSize: '1.1rem',
          color: '#013147',
          margin: 0,
        }}>
          {area}
        </h3>
        <span style={{
          fontSize: 11,
          color: '#229ebc',
          fontFamily: 'IBM Plex Mono, monospace',
          background: '#e8f6fb',
          padding: '2px 10px',
          borderRadius: 6,
          marginLeft: 'auto',
        }}>
          ADJACENT PATHS
        </span>
      </div>

      {/* Path cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 12,
      }}>
        {data.adjacent.map(c => (
          <PathCard key={c.title} career={c} />
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function KnownInterestPaths({ assessment }) {
  const interests = assessment?.known_interests || []

  // Filter to only known-interest areas that have data
  const activeAreas = interests.filter(i => ADJACENT[i])

  if (activeAreas.length === 0) return null

  return (
    <section id="known-paths" className="report-section max-w-4xl mx-auto px-6 py-12 page-break">
      {/* Section header */}
      <div className="border-l-4 border-gold pl-6 mb-3">
        <h2 className="font-display text-3xl text-navy">Your Interest Areas — Adjacent Pathways</h2>
      </div>
      <p className="text-muted font-body text-sm mb-2 pl-6">
        Based on the fields you told us you're already drawn to, here are careers you might not have considered —
        but could be a great fit given your direction.
      </p>

      {/* Callout banner */}
      <div style={{
        background: 'linear-gradient(135deg, #e8f6fb, #f0f9ff)',
        border: '1px solid rgba(34,158,188,0.2)',
        borderRadius: 14,
        padding: '14px 20px',
        marginBottom: 32,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20 }}>🧭</span>
        <div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#013147', margin: '0 0 4px' }}>
            Why explore adjacent careers?
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            Most people only know the obvious roles in a field — doctor, engineer, lawyer. But every industry has
            dozens of specialist, emerging, and hybrid roles that are less competitive and often more interesting.
            These adjacents might suit your full profile better than the "headline" career.
          </p>
        </div>
      </div>

      {/* One section per selected interest area */}
      {activeAreas.map(area => (
        <InterestSection key={area} area={area} data={ADJACENT[area]} />
      ))}

      {/* Footer tip */}
      <div style={{
        background: '#fffbea',
        border: '1px solid rgba(255,183,5,0.3)',
        borderRadius: 12,
        padding: '12px 18px',
        marginTop: 8,
      }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#92630a', margin: 0, lineHeight: 1.6 }}>
          💡 <strong>Next step:</strong> Pick 1–2 adjacent careers that excite you and use the Career Finder or
          University Finder to explore what qualifications and programmes can get you there.
        </p>
      </div>
    </section>
  )
}
