// src/game/combat/damageSystem.js

/**
 * 伤害计算系统
 * 实现完整的伤害公式：
 * 伤害 = (10 + 攻击力) × (1 + 图鉴攻击加成 + 所有伤害增加效果 - 所有伤害降低效果 + 其他效果)
 *      × [暴击时: (1 + 100% + 图鉴爆伤加成 + 其他爆伤加成)]
 */

/**
 * 计算最终伤害
 * @param {Object} params - 伤害计算参数
 * @param {number} params.baseAttack - 基础攻击力（默认10）
 * @param {number} params.playerAttack - 玩家攻击力
 * @param {number} params.codexBonus - 图鉴攻击加成
 * @param {number} params.damageIncrease - 伤害增加效果（累加）
 * @param {number} params.damageDecrease - 伤害降低效果（累加）
 * @param {number} params.otherEffects - 其他效果（如技能倍率）
 * @param {number} params.critRate - 暴击率（0-1）
 * @param {number} params.baseCritDamage - 基础暴击伤害（默认1.0，表示额外100%）
 * @param {number} params.codexCritDamage - 图鉴爆伤加成
 * @param {number} params.additionalCritDamage - 其他爆伤加成
 * @param {boolean} params.guaranteedCrit - 是否必定暴击
 * @returns {Object} { damage: number, isCrit: boolean }
 */
export function calculateDamage({
  baseAttack = 10,
  playerAttack = 0,
  codexBonus = 0,
  damageIncrease = 0,
  damageDecrease = 0,
  otherEffects = 0,
  critRate = 0,
  baseCritDamage = 1.0,
  codexCritDamage = 0,
  additionalCritDamage = 0,
  guaranteedCrit = false
}) {
  // 第一部分：基础攻击力
  const totalAttack = baseAttack + playerAttack

  // 第二部分：伤害倍率
  const damageMultiplier = 1 + codexBonus + damageIncrease - damageDecrease + otherEffects

  // 基础伤害
  let damage = totalAttack * damageMultiplier

  // 暴击判定
  const isCrit = guaranteedCrit || Math.random() < critRate

  // 暴击伤害计算
  if (isCrit) {
    const critMultiplier = 1 + baseCritDamage + codexCritDamage + additionalCritDamage
    damage *= critMultiplier
  }

  return {
    damage: Math.max(1, Math.floor(damage)), // 最低1点伤害
    isCrit
  }
}

/**
 * 创建伤害计算器
 * 用于管理全局伤害参数
 */
export class DamageCalculator {
  constructor() {
    this.baseAttack = 10
    this.playerAttack = 0
    this.codexBonus = 0
    this.damageIncrease = 0
    this.damageDecrease = 0
    this.critRate = 0
    this.baseCritDamage = 1.0
    this.codexCritDamage = 0
    this.additionalCritDamage = 0
    this.guaranteedCrit = false
  }

  /**
   * 更新玩家攻击力
   */
  setPlayerAttack(value) {
    this.playerAttack = value
  }

  /**
   * 添加伤害增加效果
   */
  addDamageIncrease(value) {
    this.damageIncrease += value
  }

  /**
   * 添加暴击率
   */
  addCritRate(value) {
    this.critRate = Math.min(1, this.critRate + value)
  }

  /**
   * 添加暴击伤害
   */
  addCritDamage(value) {
    this.additionalCritDamage += value
  }

  /**
   * 设置必定暴击
   */
  setGuaranteedCrit(value) {
    this.guaranteedCrit = value
  }

  /**
   * 计算伤害（带技能倍率）
   */
  calculate(skillMultiplier = 1.0) {
    return calculateDamage({
      baseAttack: this.baseAttack,
      playerAttack: this.playerAttack,
      codexBonus: this.codexBonus,
      damageIncrease: this.damageIncrease,
      damageDecrease: this.damageDecrease,
      otherEffects: skillMultiplier - 1, // 技能倍率转换为效果
      critRate: this.critRate,
      baseCritDamage: this.baseCritDamage,
      codexCritDamage: this.codexCritDamage,
      additionalCritDamage: this.additionalCritDamage,
      guaranteedCrit: this.guaranteedCrit
    })
  }

  /**
   * 重置临时效果
   */
  resetTemporaryEffects() {
    this.guaranteedCrit = false
  }
}
