import { formatDate } from '../../utils/ageCalc'

export default function ReportCover({ student, assessment }) {
  return (
    <section id="cover" className="report-section bg-navy min-h-screen flex flex-col items-center justify-center text-center px-8 py-16 page-break">
      <div className="max-w-lg mx-auto">
        <div className="text-7xl mb-6">🧭</div>
        <p className="text-gold font-mono-data text-sm uppercase tracking-widest mb-4">Compass Career Indicator</p>
        <h1 className="font-display text-5xl text-white mb-6">Student Report</h1>
        <div className="w-24 h-1 bg-gold mx-auto rounded mb-8" />
        <div className="grid grid-cols-2 gap-4 text-left">
          {[
            ['Full Name', student?.full_name],
            ['Date of Birth', formatDate(student?.date_of_birth)],
            ['Age', student?.age ? `${student.age} years` : '—'],
            ['School', student?.school_name],
            ['Curriculum', student?.curriculum],
            ['Test Date', formatDate(assessment?.completed_at)],
            ['Version', '2.0'],
            ['Report ID', assessment?.id?.slice(0, 8)?.toUpperCase()],
          ].map(([label, value]) => (
            <div key={label} className="bg-navyMid/50 rounded-lg px-4 py-3">
              <p className="text-white/40 text-xs font-mono-data uppercase tracking-wide mb-1">{label}</p>
              <p className="text-white font-body font-medium text-sm">{value || '—'}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-navyMid">
          <p className="text-white/30 text-xs font-body">Proplr &bull; For exploratory use only</p>
        </div>
      </div>
    </section>
  )
}
