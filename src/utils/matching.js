// Euclidean distance between student and career on RIASEC dimensions
export const euclideanDist = (student, career) => {
  const dims = ['r', 'i', 'a', 's', 'e', 'c']
  let sum = 0
  dims.forEach(d => {
    const sv = student[d] || 0
    const cv = career[`${d}_score`] || 0
    sum += Math.pow(sv - cv, 2)
  })
  return Math.sqrt(sum)
}

export const matchPct = (dist, maxDist = 25) => {
  return Math.max(0, Math.round((1 - dist / maxDist) * 100))
}

export const getHollandMatches = (studentScores, careers) => {
  const student = {
    r: studentScores.R || 0,
    i: studentScores.I || 0,
    a: studentScores.A || 0,
    s: studentScores.S || 0,
    e: studentScores.E || 0,
    c: studentScores.C || 0,
  }

  return careers
    .map(career => ({
      ...career,
      match_score: matchPct(euclideanDist(student, career)),
      match_type: 'holland',
    }))
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10)
}

// Map OCEAN to RIASEC dimensions for personality matching
export const getPersonalityMatches = (oceanScores, careers) => {
  const student = {
    r: 3.5,  // neutral baseline
    i: oceanScores.O * 1.4 || 0,
    a: oceanScores.O * 1.2 || 0,
    s: oceanScores.A * 1.4 || 0,
    e: oceanScores.E * 1.4 || 0,
    c: oceanScores.C * 1.4 || 0,
  }

  return careers
    .map(career => ({
      ...career,
      match_score: matchPct(euclideanDist(student, career)),
      match_type: 'personality',
    }))
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10)
}

const tokenize = (text) => {
  if (!text) return []
  return text.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3)
}

export const getHobbyRelevance = (hobbies, career) => {
  if (!hobbies) return 0
  const hobbyTokens = tokenize(hobbies)
  const careerText = `${career.title} ${career.description || ''}`.toLowerCase()
  let matches = 0
  hobbyTokens.forEach(token => {
    if (careerText.includes(token)) matches++
  })
  return Math.min(100, Math.round((matches / Math.max(1, hobbyTokens.length)) * 100))
}

export const getBlendedMatches = (riasecScores, oceanScores, hobbies, careers) => {
  const student = {
    r: riasecScores.R || 0,
    i: riasecScores.I || 0,
    a: riasecScores.A || 0,
    s: riasecScores.S || 0,
    e: riasecScores.E || 0,
    c: riasecScores.C || 0,
  }

  const personality = {
    r: 3.5,
    i: (oceanScores.O || 0) * 1.4,
    a: (oceanScores.O || 0) * 1.2,
    s: (oceanScores.A || 0) * 1.4,
    e: (oceanScores.E || 0) * 1.4,
    c: (oceanScores.C || 0) * 1.4,
  }

  return careers
    .map(career => {
      const riasecMatch = matchPct(euclideanDist(student, career))
      const personalityMatch = matchPct(euclideanDist(personality, career))
      const hobbyRelevance = getHobbyRelevance(hobbies, career)
      const blended = Math.round(0.40 * riasecMatch + 0.35 * personalityMatch + 0.25 * hobbyRelevance)

      return {
        ...career,
        match_score: blended,
        match_type: 'blended',
      }
    })
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10)
}
