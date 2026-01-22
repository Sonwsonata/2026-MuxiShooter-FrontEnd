// src/config/skillRules.js
export function getRarityByLevel(level) {
  if (level <= 3) return ['bronze']
  if (level <= 8) return ['bronze', 'silver', 'gold']
  return ['gold']
}
