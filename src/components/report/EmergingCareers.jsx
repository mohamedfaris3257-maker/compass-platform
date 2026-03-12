import Spinner from '../ui/Spinner'

const SOC_NAMES = {
  '11': 'Management', '13': 'Business & Finance', '15': 'Technology',
  '17': 'Engineering', '19': 'Science', '21': 'Social Services',
  '23': 'Law', '25': 'Education', '27': 'Arts & Media',
  '29': 'Healthcare', '33': 'Public Safety', '41': 'Sales',
}

const EMERGING_MAP = {
  '15': [
    { role: 'AI/ML Engineer', why: 'Your analytical interests align with building intelligent systems.', skills: ['Python', 'Machine Learning', 'Data Pipelines'], salary: '$110k–$180k' },
    { role: 'Cybersecurity Analyst', why: 'Investigative nature suits threat detection and security research.', skills: ['Network Security', 'Penetration Testing', 'SIEM'], salary: '$80k–$130k' },
    { role: 'Cloud Solutions Architect', why: 'Systems thinking matches designing scalable cloud infrastructure.', skills: ['AWS/Azure', 'DevOps', 'System Design'], salary: '$130k–$200k' },
    { role: 'Data Scientist', why: 'Your quantitative profile fits extracting insights from complex data.', skills: ['Statistics', 'Python', 'Data Visualisation'], salary: '$95k–$160k' },
  ],
  '29': [
    { role: 'Precision Medicine Specialist', why: 'Healthcare interest meets the future of personalised treatment.', skills: ['Genomics', 'Clinical Research', 'Bioinformatics'], salary: '$90k–$150k' },
    { role: 'Mental Health Technologist', why: 'Combining care and technology to reach more people.', skills: ['CBT Fundamentals', 'Digital Health', 'Patient Communication'], salary: '$70k–$110k' },
    { role: 'Health Informatics Analyst', why: 'Bridging clinical and data skills in a growing field.', skills: ['EHR Systems', 'Data Analysis', 'Healthcare Compliance'], salary: '$75k–$120k' },
    { role: 'Telemedicine Coordinator', why: 'Managing remote care delivery in an increasingly virtual world.', skills: ['Telehealth Platforms', 'Patient Coordination', 'Digital Communication'], salary: '$55k–$85k' },
  ],
  '17': [
    { role: 'Robotics Engineer', why: 'Engineering creativity meets autonomous systems design.', skills: ['CAD/CAM', 'Control Systems', 'Embedded Programming'], salary: '$95k–$155k' },
    { role: 'Sustainable Infrastructure Designer', why: 'Building for the future with environmental responsibility.', skills: ['Green Building Standards', 'Civil Engineering', 'BIM Software'], salary: '$80k–$130k' },
    { role: 'Drone Systems Engineer', why: 'Combines aerospace, electronics, and real-world applications.', skills: ['Aerodynamics', 'Firmware', 'Remote Sensing'], salary: '$85k–$140k' },
    { role: '3D Printing Specialist', why: 'Additive manufacturing transforms design into physical product.', skills: ['CAD', 'Material Science', 'Product Design'], salary: '$65k–$100k' },
  ],
  '19': [
    { role: 'Climate Scientist', why: 'Scientific curiosity meets one of the defining challenges of our time.', skills: ['Climate Modelling', 'Data Analysis', 'Remote Sensing'], salary: '$75k–$120k' },
    { role: 'Biotechnology Researcher', why: 'Life science exploration at the frontier of medicine and agriculture.', skills: ['Lab Techniques', 'Bioinformatics', 'Research Methods'], salary: '$80k–$130k' },
    { role: 'Environmental Data Analyst', why: 'Turning environmental data into actionable insights.', skills: ['GIS', 'Statistical Analysis', 'Environmental Science'], salary: '$65k–$100k' },
    { role: 'Space Systems Scientist', why: 'Exploring beyond Earth with data-driven curiosity.', skills: ['Astrophysics', 'Instrumentation', 'Data Processing'], salary: '$90k–$150k' },
  ],
  '27': [
    { role: 'UX/UI Designer', why: 'Creative vision meets the science of human-centred design.', skills: ['Figma', 'User Research', 'Prototyping'], salary: '$75k–$130k' },
    { role: 'Content Strategist', why: 'Storytelling and structure drive digital brand communication.', skills: ['Content Planning', 'SEO', 'Analytics'], salary: '$60k–$100k' },
    { role: 'Motion Graphics Designer', why: 'Animation and visual design tell stories across platforms.', skills: ['After Effects', 'Cinema 4D', 'Storyboarding'], salary: '$60k–$110k' },
    { role: 'VR/AR Experience Designer', why: 'Immersive design is reshaping entertainment, training, and retail.', skills: ['Unity/Unreal', '3D Modelling', 'Interaction Design'], salary: '$80k–$140k' },
  ],
  '21': [
    { role: 'Social Impact Analyst', why: 'Using data to measure and amplify community programmes.', skills: ['Impact Measurement', 'Data Analysis', 'Grant Writing'], salary: '$55k–$85k' },
    { role: 'Mental Health Counsellor (Tech-Assisted)', why: 'Human empathy supported by digital tools for broader reach.', skills: ['Counselling', 'Digital Literacy', 'CBT Techniques'], salary: '$50k–$80k' },
    { role: 'Nonprofit Programme Manager', why: 'Organising mission-driven work with real community outcomes.', skills: ['Project Management', 'Community Engagement', 'Fundraising'], salary: '$50k–$75k' },
  ],
  '11': [
    { role: 'Chief Sustainability Officer', why: 'Leadership role shaping corporate environmental strategy.', skills: ['ESG Reporting', 'Strategic Planning', 'Stakeholder Management'], salary: '$130k–$220k' },
    { role: 'Startup Founder/CEO', why: 'Entrepreneurial drive meets execution and team leadership.', skills: ['Business Development', 'Fundraising', 'Product Strategy'], salary: 'Varies' },
    { role: 'Product Manager (Tech)', why: 'Orchestrating cross-functional teams to ship digital products.', skills: ['Roadmap Planning', 'Agile', 'User Research'], salary: '$100k–$170k' },
  ],
  '13': [
    { role: 'FinTech Analyst', why: 'Finance meets technology in a fast-moving sector.', skills: ['Financial Modelling', 'Python', 'Regulatory Compliance'], salary: '$80k–$140k' },
    { role: 'ESG Investment Analyst', why: 'Sustainable finance is now mainstream in asset management.', skills: ['ESG Frameworks', 'Financial Analysis', 'Sector Research'], salary: '$85k–$140k' },
    { role: 'Crypto/Digital Asset Advisor', why: 'Emerging asset classes require specialist knowledge.', skills: ['Blockchain Fundamentals', 'Portfolio Analysis', 'DeFi'], salary: '$90k–$160k' },
  ],
  '25': [
    { role: 'EdTech Curriculum Designer', why: 'Building learning experiences that work in digital environments.', skills: ['Learning Design', 'LMS Platforms', 'Instructional Writing'], salary: '$65k–$100k' },
    { role: 'Online Learning Specialist', why: 'Facilitating remote education with technology and pedagogy.', skills: ['e-Learning Tools', 'Virtual Facilitation', 'Assessment Design'], salary: '$55k–$90k' },
    { role: 'AI Literacy Educator', why: 'Teaching the next generation to understand and use AI responsibly.', skills: ['AI Fundamentals', 'Pedagogy', 'Ethics'], salary: '$60k–$95k' },
  ],
}

export default function EmergingCareers({ clusters }) {
  if (!clusters || clusters.length === 0) return null

  const relevantClusters = clusters
    .filter(c => EMERGING_MAP[c.prefix])
    .slice(0, 3)

  if (relevantClusters.length === 0) return null

  return (
    <section id="emerging" className="report-section px-4 md:px-8 py-10" style={{ background: '#f5f4f0' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-mono-data text-muted uppercase tracking-wide mb-1">Section 8</p>
          <h2 className="font-display text-2xl" style={{ color: '#013147' }}>Emerging Careers to Watch</h2>
          <p style={{ color: '#64748b', fontSize: '14px', fontFamily: 'Inter, sans-serif', marginTop: '6px' }}>
            Roles that sit at the frontier of your interest clusters — not yet mainstream, but growing fast.
          </p>
        </div>

        {relevantClusters.map(cluster => {
          const careers = EMERGING_MAP[cluster.prefix] ?? []
          return (
            <div key={cluster.prefix} className="mb-8">
              <h3 className="font-display text-lg mb-4" style={{ color: '#013147' }}>
                <span style={{ background: '#fb8403', color: '#fff', borderRadius: '8px', padding: '2px 10px', fontSize: '12px', marginRight: '10px', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  {cluster.prefix}
                </span>
                {SOC_NAMES[cluster.prefix] ?? 'Occupational Group'} — Emerging Roles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careers.map(career => (
                  <div
                    key={career.role}
                    style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(1,49,71,0.07)', padding: '20px' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-display text-base" style={{ color: '#013147', flex: 1, paddingRight: '8px' }}>{career.role}</h4>
                      <span style={{ background: '#e0f7fa', color: '#229ebc', borderRadius: '999px', fontSize: '11px', padding: '2px 8px', fontFamily: 'Inter, sans-serif', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {career.salary}
                      </span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '13px', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, marginBottom: '12px' }}>
                      {career.why}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {career.skills.map(skill => (
                        <span
                          key={skill}
                          style={{ background: '#e8edf0', color: '#013147', borderRadius: '999px', fontSize: '11px', padding: '3px 10px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
