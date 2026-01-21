import { create } from 'zustand'
import { getRandomSkills } from '../game/skillSystem'

export const useGameStore = create((set, get) => ({
  /* ================= 基础成长 ================= */

  level: 1,
  exp: 0,
  nextExp: 10,

  isLevelUp: false,
  pauseGame: false,

  /* ================= 技能系统 ================= */

  skillLevels: {},      // { attack: 2, rows: 1 }
  skillEffects: [],     // 具体技能 effect
  levelUpChoices: [],   // 本次升级给的技能选项

  /* ================== 升级相关 ================== */

  gainExp(amount) {
    const { exp, nextExp } = get()
    const newExp = exp + amount

    if (newExp >= nextExp) {
      set({
        exp: newExp - nextExp,
        level: get().level + 1,
        nextExp: Math.floor(nextExp * 1.5),
        isLevelUp: true,
        pauseGame: true,
        levelUpChoices: getRandomSkills(get().skillLevels, 3)
      })
    } else {
      set({ exp: newExp })
    }
  },

  pickSkill(skill) {
    set(state => ({
      skillLevels: {
        ...state.skillLevels,
        [skill.key]: (state.skillLevels[skill.key] || 0) + 1
      },
      skillEffects: [...state.skillEffects, skill],
      isLevelUp: false,
      pauseGame: false,
      levelUpChoices: []
    }))
  }
}))
