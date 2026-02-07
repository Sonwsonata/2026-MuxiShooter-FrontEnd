// src/game/combat/combatManager.js

import { DamageCalculator } from './damageSystem'
import { BuffManager } from '../buff/buffSystem'
import { SkillManager } from '../skill/skillManager'
import { SkillExecutor } from '../skill/skillExecutor'

/**
 * 战斗管理器
 * 统一管理战斗系统的各个模块
 */
export class CombatManager {
  constructor() {
    this.damageCalculator = new DamageCalculator()
    this.buffManager = new BuffManager()
    this.skillManager = new SkillManager()
    this.skillExecutor = null // 需要游戏上下文后初始化
    
    // 自动射击相关
    this.baseFireRate = 0.25 // 基础攻速（每秒4次）
    this.fireTimer = 0
    
    // 技能定时器
    this.skillTimers = new Map()
    
    // 特殊状态
    this.examModeActive = false
    this.ignoreDefense = false
  }

  /**
   * 初始化（需要游戏上下文）
   */
  initialize(gameContext) {
    this.skillExecutor = new SkillExecutor({
      ...gameContext,
      buffManager: this.buffManager,
      damageCalculator: this.damageCalculator,
      skillTimers: this.skillTimers,
      examModeActive: this.examModeActive,
      ignoreDefense: this.ignoreDefense
    })
  }

  /**
   * 更新战斗系统
   */
  update(dt, gameContext) {
    // 更新Buff
    this.buffManager.update(dt)
    
    // 更新技能冷却
    this.skillManager.updateCooldowns(dt)
    
    // 更新激活技能
    this.skillManager.updateActiveSkills(dt)
    
    // 自动触发就绪的技能
    this.autoTriggerSkills(gameContext)
    
    // 自动射击
    this.updateAutoFire(dt, gameContext)
  }

  /**
   * 自动触发就绪的技能
   */
  autoTriggerSkills(gameContext) {
    const skills = this.skillManager.getAllSkills()
    
    for (const skill of skills) {
      if (this.skillManager.isSkillReady(skill.id)) {
        this.triggerSkill(skill.id, gameContext)
      }
    }
  }

  /**
   * 触发技能
   */
  triggerSkill(skillId, gameContext) {
    const skill = this.skillManager.triggerSkill(skillId)
    if (!skill) return false

    // 更新执行器上下文
    if (this.skillExecutor) {
      this.skillExecutor.ctx = {
        ...gameContext,
        buffManager: this.buffManager,
        damageCalculator: this.damageCalculator,
        skillTimers: this.skillTimers,
        examModeActive: this.examModeActive,
        ignoreDefense: this.ignoreDefense
      }
      
      this.skillExecutor.executeSkill(skill)
    }

    return true
  }

  /**
   * 自动射击
   */
  updateAutoFire(dt, gameContext) {
    this.fireTimer += dt
    
    // 计算实际攻速（基础攻速 × Buff加成）
    const attackSpeedMultiplier = this.buffManager.getAttackSpeedMultiplier()
    const actualFireRate = this.baseFireRate / attackSpeedMultiplier
    
    if (this.fireTimer >= actualFireRate) {
      this.fireBasicAttack(gameContext)
      this.fireTimer = 0
    }
  }

  /**
   * 发射普通攻击
   */
  fireBasicAttack(gameContext) {
    const { player, bullets } = gameContext
    
    // 计算伤害
    const guaranteedCrit = this.buffManager.isGuaranteedCrit()
    const critRateBonus = this.buffManager.getCritRateBonus()
    const critDamageBonus = this.buffManager.getCritDamageBonus()
    const damageBonus = this.buffManager.getDamageBonus()
    
    // 更新伤害计算器
    this.damageCalculator.setGuaranteedCrit(guaranteedCrit)
    this.damageCalculator.critRate = Math.min(1, this.damageCalculator.critRate + critRateBonus)
    this.damageCalculator.additionalCritDamage = critDamageBonus
    this.damageCalculator.damageIncrease = damageBonus
    
    const damageResult = this.damageCalculator.calculate(1.0)
    
    // 获取镜像数量
    const mirrorCount = this.buffManager.getMirrorCount()
    
    // 调试日志
    if (mirrorCount > 0) {
      console.log('[Mirror] Creating mirror bullets, count:', mirrorCount)
    }
    
    // 发射主弹幕
    this.createBasicBullet({
      x: player.x,
      y: player.y,
      damage: damageResult.damage,
      isCrit: damageResult.isCrit,
      bullets,
      isMirror: false  // 明确标记为非镜像
    })
    
    // 发射镜像弹幕
    if (mirrorCount > 0) {
      console.log('[Mirror] Starting to create', mirrorCount, 'mirror bullets')
      for (let i = 0; i < mirrorCount; i++) {
        // 交替在左右两侧
        const side = i % 2 === 0 ? 1 : -1
        const offsetX = Math.floor((i + 1) / 2) * 50 * side
        
        console.log('[Mirror] Creating mirror bullet', i + 1, 'at offsetX:', offsetX)
        
        this.createBasicBullet({
          x: player.x + offsetX,
          y: player.y,
          damage: damageResult.damage,
          isCrit: damageResult.isCrit,
          bullets,
          isMirror: true
        })
      }
      console.log('[Mirror] Total bullets after creation:', bullets.length)
    }
    
    // 重置临时效果
    this.damageCalculator.resetTemporaryEffects()
  }
  /**
   * 创建基础弹幕
   */
  createBasicBullet({ x, y, damage, isCrit, bullets, isMirror = false }) {
    bullets.push({
      x,
      y,
      vx: 0,
      vy: -420,
      damage,
      isCrit,
      pierce: 0,
      maxPierce: 0,
      size: 4,
      color: isMirror ? (isCrit ? '#f0f' : '#4af') : (isCrit ? '#ff0' : '#fff'),
      alive: true
    })
  }

  /**
   * 处理弹幕击中
   */
  handleBulletHit(bullet, enemy) {
    // 计算伤害
    let finalDamage = bullet.damage
    
    // 穿透伤害加成
    if (bullet.pierce < bullet.maxPierce && bullet.pierceDamageBonus) {
      finalDamage *= (1 + bullet.pierceDamageBonus)
    }
    
    // 应用伤害
    enemy.hp -= finalDamage
    
    // 穿透处理
    if (bullet.pierce > 0) {
      bullet.pierce--
    } else {
      bullet.alive = false
    }
    
    return finalDamage
  }

  /**
   * 添加技能
   */
  addSkill(skillId) {
    return this.skillManager.addSkill(skillId)
  }

  /**
   * 添加强化
   */
  addUpgrade(skillId, upgradeId) {
    return this.skillManager.addUpgrade(skillId, upgradeId)
  }

  /**
   * 获取敌人速度修正
   */
  getEnemySpeedModifier() {
    const slowEffect = this.buffManager.getEnemySlowEffect()
    return 1 - slowEffect
  }

  /**
   * 清理
   */
  cleanup() {
    // 清理所有定时器
    for (const timerId of this.skillTimers.values()) {
      clearInterval(timerId)
    }
    this.skillTimers.clear()
    
    // 清理Buff
    this.buffManager.clear()
  }
}
