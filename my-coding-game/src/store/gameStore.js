import { create } from 'zustand'
import { SkillUpgradeSystem } from '../game/skill/skillUpgradeSystem'

/* ================= 经验曲线 ================= */

// 你以后想换"波动式""阶段式"，只改这里
function calcExpMax(level) {
  return Math.floor(10 + level * level * 1.5)
}

// 创建技能升级系统实例
const skillUpgradeSystem = new SkillUpgradeSystem()

export const useGameStore = create((set, get) => ({
  /* ================= 基础成长 ================= */

  level: 1,
  exp: 0,
  expMax: calcExpMax(1),

  isLevelUp: false,
  pauseGame: false,

  /* ================= 战斗数值 ================= */
  combatStats: {
    attack: 0,             // 额外攻击力
    damageMultiplier: 1,   // 伤害倍率
    critRate: 0.05,        // 暴击率
    critDamage: 1.5        // 暴击伤害倍率
  },

  /* ================= 技能系统 ================= */

  // 技能升级系统实例
  skillUpgradeSystem,

  // 升级选项
  levelUpChoices: [],

  /* ================== 经验获取 ================== */

  gainExp(amount) {
    let { exp, expMax, level } = get()

    exp += amount
    let leveledUp = false

    while (exp >= expMax) {
      exp -= expMax
      level += 1
      expMax = calcExpMax(level)
      leveledUp = true
    }

    if (leveledUp) {
      // 获取升级选项
      const choices = skillUpgradeSystem.getLevelUpOptions(3)

      set({
        exp,
        level,
        expMax,
        isLevelUp: true,
        pauseGame: true,
        levelUpChoices: choices
      })
    } else {
      set({ exp })
    }
  },

  /* ================== 选择技能/强化 ================== */

  pickSkill(option) {
    // 应用选择
    const result = skillUpgradeSystem.selectOption(option)
    
    console.log('[Skill System] Selected:', result)

    set({
      isLevelUp: false,
      pauseGame: false,
      levelUpChoices: []
    })

    // 返回结果供游戏使用
    return result
  },

  /* ================== 获取激活的技能 ================== */

  getActiveSkills() {
    return skillUpgradeSystem.getActiveSkills()
  },

  /* ================== 重置游戏 ================== */

  resetGame() {
    skillUpgradeSystem.reset()
    
    set({
      level: 1,
      exp: 0,
      expMax: calcExpMax(1),
      isLevelUp: false,
      pauseGame: false,
      levelUpChoices: [],
      combatStats: {
        attack: 0,
        damageMultiplier: 1,
        critRate: 0.05,
        critDamage: 1.5
      }
    })
  }
}))

// 导出技能升级系统供外部使用
export { skillUpgradeSystem }
