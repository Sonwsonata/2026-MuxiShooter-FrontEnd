// src/game/skillSystem.js
import { SKILL_POOL } from './skillPool'

export function getRandomSkills({
  ownedSkills = {},
  count = 3
}) {
  const candidates = []

  for (const [category, data] of Object.entries(SKILL_POOL)) {
    const level = ownedSkills[category] || 0

    // 决定当前可抽稀有度
    const tier = getTierByLevel(level)

    const pool = data[tier] || []
    pool.forEach(skill => {
      candidates.push({
        ...skill,
        category,
        tier
      })
    })
  }

  return shuffle(candidates).slice(0, count)
}

/* ============== 稀有度规则 ============== */

function getTierByLevel(level) {
  if (level >= 6) return 'gold'
  if (level >= 3) return 'silver'
  return 'bronze'
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}
