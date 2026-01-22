import { SKILL_POOL } from '../config/skillPool'

/**
 * 根据当前技能状态，抽取可选技能
 */
export function getRandomSkills({
  skillLevels,
  pickedCategories,
  maxCategories = 3
}) {
  const results = []

  const allCategories = Object.keys(SKILL_POOL)

  const unpicked = allCategories.filter(
    c => !pickedCategories.includes(c)
  )

  // 1️⃣ 还没选满 3 个大类
  if (pickedCategories.length < maxCategories) {
    // 未选大类随机 2 个
    shuffle(unpicked).slice(0, 2).forEach(cat => {
      results.push(randomSkillFromCategory(cat, skillLevels))
    })

    // 已选大类随机 1 个
    if (pickedCategories.length > 0) {
      const picked =
        pickedCategories[Math.floor(Math.random() * pickedCategories.length)]
      results.push(randomSkillFromCategory(picked, skillLevels))
    }
  } else {
    // 2️⃣ 已选满 3 个大类 → 只强化
    pickedCategories.forEach(cat => {
      results.push(randomSkillFromCategory(cat, skillLevels))
    })
  }

  return results.filter(Boolean).slice(0, 3)
}

/* ================= 单类抽技能 ================= */

function randomSkillFromCategory(category, skillLevels) {
  const data = SKILL_POOL[category]
  if (!data) return null

  const level = skillLevels[category] || 0

  let pool = data.bronze
  if (level >= 3) pool = pool.concat(data.silver)
  if (level >= 7) pool = pool.concat(data.gold)

  if (pool.length === 0) return null

  const skill = pool[Math.floor(Math.random() * pool.length)]

  return {
    category,
    ...skill
  }
}

/* ================= 工具 ================= */

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}
