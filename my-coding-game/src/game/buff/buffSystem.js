// src/game/buff/buffSystem.js

/**
 * Buff系统
 * 管理所有临时增益效果
 */

let buffIdCounter = 0

/**
 * Buff类型定义
 */
export const BuffType = {
  ATTACK_SPEED: 'attack_speed',      // 攻速增益
  MOVE_SPEED: 'move_speed',          // 移速增益
  CRIT_RATE: 'crit_rate',            // 暴击率增益
  CRIT_DAMAGE: 'crit_damage',        // 暴击伤害增益
  DAMAGE: 'damage',                  // 伤害增益
  GUARANTEED_CRIT: 'guaranteed_crit', // 必定暴击
  MIRROR: 'mirror',                  // 镜像效果
  ENEMY_SLOW: 'enemy_slow'           // 敌人减速
}

/**
 * 创建Buff
 * @param {Object} config
 * @param {string} config.type - Buff类型
 * @param {number} config.value - 效果值
 * @param {number} config.duration - 持续时间（秒）
 * @param {string} config.source - 来源技能
 * @param {boolean} config.stackable - 是否可叠加
 * @returns {Object} Buff对象
 */
export function createBuff({ type, value, duration, source, stackable = false }) {
  return {
    id: `buff_${++buffIdCounter}`,
    type,
    value,
    duration,
    remaining: duration,
    source,
    stackable,
    active: true
  }
}

/**
 * Buff管理器
 */
export class BuffManager {
  constructor() {
    this.buffs = []
  }

  /**
   * 添加Buff
   */
  addBuff(buffConfig) {
    const newBuff = createBuff(buffConfig)

    // 检查是否可叠加
    if (!newBuff.stackable) {
      // 移除同类型的旧Buff
      this.buffs = this.buffs.filter(b => b.type !== newBuff.type || b.source !== newBuff.source)
    }

    this.buffs.push(newBuff)
    return newBuff
  }

  /**
   * 更新所有Buff
   */
  update(dt) {
    this.buffs.forEach(buff => {
      buff.remaining -= dt
      if (buff.remaining <= 0) {
        buff.active = false
      }
    })

    // 清理过期Buff
    this.buffs = this.buffs.filter(b => b.active)
  }

  /**
   * 获取指定类型的Buff总值
   */
  getBuffValue(type) {
    return this.buffs
      .filter(b => b.type === type && b.active)
      .reduce((sum, b) => sum + b.value, 0)
  }

  /**
   * 检查是否有指定类型的Buff
   */
  hasBuff(type) {
    return this.buffs.some(b => b.type === type && b.active)
  }

  /**
   * 移除指定来源的所有Buff
   */
  removeBuffsBySource(source) {
    this.buffs = this.buffs.filter(b => b.source !== source)
  }

  /**
   * 获取所有激活的Buff
   */
  getActiveBuffs() {
    return this.buffs.filter(b => b.active)
  }

  /**
   * 清除所有Buff
   */
  clear() {
    this.buffs = []
  }

  /**
   * 获取攻速倍率
   */
  getAttackSpeedMultiplier() {
    return 1 + this.getBuffValue(BuffType.ATTACK_SPEED)
  }

  /**
   * 获取移速倍率
   */
  getMoveSpeedMultiplier() {
    return 1 + this.getBuffValue(BuffType.MOVE_SPEED)
  }

  /**
   * 获取暴击率加成
   */
  getCritRateBonus() {
    return this.getBuffValue(BuffType.CRIT_RATE)
  }

  /**
   * 获取暴击伤害加成
   */
  getCritDamageBonus() {
    return this.getBuffValue(BuffType.CRIT_DAMAGE)
  }

  /**
   * 获取伤害加成
   */
  getDamageBonus() {
    return this.getBuffValue(BuffType.DAMAGE)
  }

  /**
   * 是否必定暴击
   */
  isGuaranteedCrit() {
    return this.hasBuff(BuffType.GUARANTEED_CRIT)
  }

  /**
   * 获取镜像数量
   */
  getMirrorCount() {
    return Math.floor(this.getBuffValue(BuffType.MIRROR))
  }

  /**
   * 获取敌人减速效果
   */
  getEnemySlowEffect() {
    return this.getBuffValue(BuffType.ENEMY_SLOW)
  }
}
