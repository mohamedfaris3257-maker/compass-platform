import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts'
import { themeNames } from '../../data/riasec-questions'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy text-white px-3 py-2 rounded-lg text-sm font-body shadow-lg">
        <p className="font-semibold">{payload[0]?.payload?.fullName}</p>
        <p className="text-gold">{payload[0]?.value?.toFixed(1)} / 7</p>
      </div>
    )
  }
  return null
}

export default function RiasecRadar({ scores = {} }) {
  const data = ['R','I','A','S','E','C'].map(key => ({
    theme: key,
    fullName: themeNames[key] || key,
    score: parseFloat((scores[key] || 0).toFixed(2)),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#DDD8CF" />
        <PolarAngleAxis
          dataKey="fullName"
          tick={{ fill: '#1D334F', fontSize: 12, fontFamily: 'DM Sans' }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 7]}
          tickCount={4}
          tick={{ fill: '#6B7C8D', fontSize: 10 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#EDC163"
          fill="#EDC163"
          fillOpacity={0.35}
          strokeWidth={2}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
