import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from 'recharts'
import { traitNames } from '../../data/bigfive-questions'

const levelColors = {
  High: '#22C55E',
  Mid: '#F59E0B',
  Low: '#60A5FA',
}

const getLevel = (score) => score >= 4.0 ? 'High' : score >= 2.5 ? 'Mid' : 'Low'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-navy text-white px-3 py-2 rounded-lg text-sm font-body shadow-lg">
        <p className="font-semibold">{d.fullName}</p>
        <p className="text-gold">{d.score.toFixed(1)} / 5 · {d.level}</p>
      </div>
    )
  }
  return null
}

export default function BigFiveBars({ scores = {}, levels = {} }) {
  const data = ['O','C','E','A','N'].map(key => ({
    trait: key,
    fullName: traitNames[key] || key,
    score: parseFloat((scores[key] || 0).toFixed(2)),
    level: levels[key] || getLevel(scores[key] || 0),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 60, bottom: 5, left: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CF" horizontal={false} />
        <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2.5, 4, 5]} tick={{ fontSize: 11, fill: '#6B7C8D' }} />
        <YAxis
          type="category"
          dataKey="fullName"
          tick={{ fontSize: 12, fill: '#1D334F', fontFamily: 'DM Sans' }}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.trait} fill={levelColors[entry.level] || '#9CA3AF'} />
          ))}
          <LabelList
            dataKey="level"
            position="right"
            style={{ fontSize: 11, fill: '#6B7C8D', fontFamily: 'DM Sans' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
