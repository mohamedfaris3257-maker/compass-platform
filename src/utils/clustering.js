export const clusterBySocPrefix = (careers) => {
  const clusters = {}
  careers.forEach(career => {
    const prefix = career.soc_code ? career.soc_code.substring(0, 2) : 'XX'
    if (!clusters[prefix]) clusters[prefix] = []
    clusters[prefix].push(career)
  })
  return clusters
}

export const getAdjacentCareers = (seedCodes, allCareers, limit = 12) => {
  const seedPrefixes = seedCodes.map(code => code.substring(0, 2))
  const seedCodeSet = new Set(seedCodes)

  return allCareers
    .filter(career => {
      const prefix = career.soc_code ? career.soc_code.substring(0, 2) : 'XX'
      return seedPrefixes.includes(prefix) && !seedCodeSet.has(career.soc_code)
    })
    .slice(0, limit)
}

export const getTopClusters = (matches, allCareers, maxClusters = 3) => {
  const prefixCounts = {}
  matches.forEach(match => {
    const prefix = match.soc_code ? match.soc_code.substring(0, 2) : 'XX'
    prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1
  })

  const topPrefixes = Object.entries(prefixCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxClusters)
    .map(([prefix]) => prefix)

  return topPrefixes.map(prefix => {
    const seedCareers = matches.filter(m => m.soc_code && m.soc_code.startsWith(prefix))
    const adjacent = getAdjacentCareers(seedCareers.map(c => c.soc_code), allCareers)
    return {
      prefix,
      seedCareers,
      adjacentCareers: adjacent,
    }
  })
}

export const SOC_GROUP_NAMES = {
  '11': 'Management',
  '13': 'Business & Finance',
  '15': 'Technology',
  '17': 'Engineering',
  '19': 'Science',
  '21': 'Social Services',
  '23': 'Law',
  '25': 'Education',
  '27': 'Arts & Media',
  '29': 'Healthcare',
  '33': 'Public Safety',
  '41': 'Sales',
}
