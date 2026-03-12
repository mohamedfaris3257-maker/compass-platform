// RIASEC reverse score items
const riasecReverseItems = ['R3', 'I4', 'A3', 'S4', 'E3', 'C4']

const reverseScore = (s) => 6 - s

export const calculateRiasecScores = (answers) => {
  const themes = ['R', 'I', 'A', 'S', 'E', 'C']
  const raw = {}
  const scores = {}

  themes.forEach(theme => {
    const ids = Object.keys(answers).filter(id => id.startsWith(theme))
    let sum = 0
    ids.forEach(id => {
      const val = answers[id]
      sum += riasecReverseItems.includes(id) ? reverseScore(val) : val
    })
    raw[theme] = sum
    // Normalize: raw range is 5-25, normalize to 0-7
    scores[theme] = parseFloat(((sum - 5) / 20 * 7).toFixed(2))
  })

  return { raw, scores }
}

export const getTop3 = (scores) => {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k)
    .join('')
}

export const getFullOrder = (scores) => {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}:${v.toFixed(1)}`)
    .join(' > ')
}

// Big Five reverse items
const bigFiveReverseItems = ['B2', 'B4', 'B6', 'B8', 'B9']

export const calculateOceanScores = (answers) => {
  const traitMap = {
    O: ['B1', 'B2'],
    C: ['B3', 'B4'],
    E: ['B5', 'B6'],
    A: ['B7', 'B8'],
    N: ['B9', 'B10'],
  }

  const scores = {}
  const levels = {}

  Object.entries(traitMap).forEach(([trait, ids]) => {
    let sum = 0
    ids.forEach(id => {
      const val = answers[id] || 3
      sum += bigFiveReverseItems.includes(id) ? reverseScore(val) : val
    })
    const avg = parseFloat((sum / ids.length).toFixed(2))
    scores[trait] = avg
    levels[trait] = avg >= 4.0 ? 'High' : avg >= 2.5 ? 'Mid' : 'Low'
  })

  return { scores, levels }
}

export const getDominantTrait = (scores) => {
  const traitNames = { O: 'Openness', C: 'Conscientiousness', E: 'Extraversion', A: 'Agreeableness', N: 'Stress Sensitivity' }
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return { code: top[0], name: traitNames[top[0]], score: top[1] }
}
