// src/game/skill/skillExecutor.js

import { getPattern } from '../combat/bulletPatterns'
import { createBullet } from '../combat/bulletTypes'
import { BuffType } from '../buff/buffSystem'

/**
 * 技能执行器
 * 负责执行各种技能效果
 */
export class SkillExecutor {
  constructor(gameContext) {
    this.ctx = gameContext // { player, bullets, enemies, buffManager, damageCalculator }
  }

  /**
   * 执行技能
   */
  executeSkill(skill) {
    const skillId = skill.id

    switch (skillId) {
      case 'laptop':
        this.executeLaptop(skill)
        break
      case 'takeout':
        this.executeTakeout(skill)
        break
      case 'fish_swap':
        this.executeFishSwap(skill)
        break
      case 'electric_car':
        this.executeElectricCar(skill)
        break
      case 'ai_tool':
        this.executeAITool(skill)
        break
      case 'exam_mode':
        this.executeExamMode(skill)
        break
      case 'six_arts':
        this.executeSixArts(skill)
        break
      default:
        console.warn(`Unknown skill: ${skillId}`)
    }
  }

  /**
   * 笔记本电脑
   */
  executeLaptop(skill) {
    const { effect } = skill
    const pattern = getPattern(effect.pattern || 'line')
    
    // 计算发射次数
    const shots = effect.shots || 1
    
    for (let shot = 0; shot < shots; shot++) {
      setTimeout(() => {
        const positions = pattern({
          x: this.ctx.player.x,
          y: this.ctx.player.y,
          count: effect.bulletCount || 3,
          rows: effect.rows || 1
        })

        // 计算伤害倍率（第二次发射可能有加成）
        let damageMultiplier = effect.damageMultiplier || 1.0
        if (shot === 1 && effect.secondShotBonus) {
          damageMultiplier += effect.secondShotBonus
        }

        positions.forEach(pos => {
          this.createSkillBullet({
            ...pos,
            damageMultiplier,
            pierce: effect.pierce || 0,
            critRate: effect.critRate || 0,
            critDamage: effect.critDamage || 0,
            source: skill.id
          })
        })
      }, shot * 100) // 多次发射间隔100ms
    }
  }

  /**
   * 外卖
   */
  executeTakeout(skill) {
    const { effect } = skill
    const duration = skill.baseDuration * (1 + skill.durationModifier)
    const frequency = (effect.frequency || 4) * (1 + (effect.frequencyBonus || 0))
    const interval = 1 / frequency

    let elapsed = 0
    const timerId = setInterval(() => {
      elapsed += interval

      if (elapsed >= duration) {
        clearInterval(timerId)
        return
      }

      const pattern = getPattern('side')
      const positions = pattern({
        x: this.ctx.player.x,
        y: this.ctx.player.y,
        bulletPerSide: effect.bulletPerSide || 2,
        converge: effect.converge || false
      })

      positions.forEach((pos, index) => {
        // 外圈弹幕伤害加成
        const isOuter = index >= 2
        const damageBonus = isOuter && effect.outerDamageBonus ? effect.outerDamageBonus : 0

        this.createSkillBullet({
          ...pos,
          damageMultiplier: (effect.damageMultiplier || 1.0) + damageBonus,
          critRate: effect.critRate || 0,
          source: skill.id
        })
      })
    }, interval * 1000)

    // 保存定时器引用以便清理
    if (!this.ctx.skillTimers) this.ctx.skillTimers = new Map()
    this.ctx.skillTimers.set(skill.id, timerId)
  }

  /**
   * 换鱼宝典
   */
  executeFishSwap(skill) {
    const { effect } = skill
    const pattern = getPattern('horizontal')
    
    const positions = pattern({
      x: this.ctx.player.x,
      y: this.ctx.player.y,
      count: effect.bulletCount || 5,
      spread: Math.PI / 6 * (1 + (effect.spread || 0))
    })

    positions.forEach((pos, index) => {
      // 中心弹幕伤害加成
      const isCenter = index === Math.floor(positions.length / 2)
      const damageBonus = isCenter && effect.centerDamageBonus ? effect.centerDamageBonus : 0

      this.createSkillBullet({
        ...pos,
        damageMultiplier: (effect.damageMultiplier || 1.0) + damageBonus,
        pierce: effect.pierce || 0,
        pierceDamageBonus: effect.pierceDamageBonus || 0,
        critRate: effect.critRate || 0,
        source: skill.id
      })
    })
  }

  /**
   * 电动车
   */
  executeElectricCar(skill) {
    const { effect } = skill
    const duration = skill.baseDuration * (1 + skill.durationModifier)

    // 添加攻速Buff
    if (effect.attackSpeedBonus) {
      this.ctx.buffManager.addBuff({
        type: BuffType.ATTACK_SPEED,
        value: effect.attackSpeedBonus,
        duration: effect.permanent ? 9999 : duration,
        source: skill.id
      })
    }

    // 添加移速Buff
    if (effect.moveSpeedBonus) {
      this.ctx.buffManager.addBuff({
        type: BuffType.MOVE_SPEED,
        value: effect.moveSpeedBonus,
        duration: effect.permanent ? 9999 : duration,
        source: skill.id
      })
    }

    // 添加暴击率Buff
    if (effect.critRate) {
      this.ctx.buffManager.addBuff({
        type: BuffType.CRIT_RATE,
        value: effect.critRate,
        duration: effect.permanent ? 9999 : duration,
        source: skill.id
      })
    }

    // 敌人减速
    if (effect.enemySlow) {
      this.ctx.buffManager.addBuff({
        type: BuffType.ENEMY_SLOW,
        value: effect.enemySlow,
        duration: duration,
        source: skill.id
      })
    }
  }

  /**
   * AI工具
   */
  executeAITool(skill) {
    const { effect } = skill
    const duration = skill.baseDuration * (1 + skill.durationModifier)
    const mirrorCount = effect.mirrorCount || 1

    // 添加镜像Buff
    this.ctx.buffManager.addBuff({
      type: BuffType.MIRROR,
      value: mirrorCount,
      duration,
      source: skill.id
    })

    // 如果有镜像伤害加成
    if (effect.mirrorDamageBonus) {
      const totalBonus = mirrorCount * effect.mirrorDamageBonus
      this.ctx.buffManager.addBuff({
        type: BuffType.DAMAGE,
        value: totalBonus,
        duration,
        source: skill.id + '_bonus'
      })
    }
  }

  /**
   * 期末屠模式
   */
  executeExamMode(skill) {
    const { effect } = skill
    const duration = skill.baseDuration * (1 + skill.durationModifier)

    // 必定暴击
    if (effect.guaranteedCrit) {
      this.ctx.buffManager.addBuff({
        type: BuffType.GUARANTEED_CRIT,
        value: 1,
        duration,
        source: skill.id
      })
    }

    // 暴击伤害加成
    if (effect.critDamageBonus) {
      this.ctx.buffManager.addBuff({
        type: BuffType.CRIT_DAMAGE,
        value: effect.critDamageBonus,
        duration,
        source: skill.id
      })
    }

    // 存储特殊效果到上下文
    if (effect.applyToSkills) {
      this.ctx.examModeActive = true
      setTimeout(() => {
        this.ctx.examModeActive = false
      }, duration * 1000)
    }

    if (effect.ignoreDefense) {
      this.ctx.ignoreDefense = true
      setTimeout(() => {
        this.ctx.ignoreDefense = false
      }, duration * 1000)
    }
  }

  /**
   * 君子六艺
   */
  executeSixArts(skill) {
    const { effect } = skill
    const duration = skill.baseDuration * (1 + skill.durationModifier)
    const frequency = (effect.frequency || 5) * (1 + (effect.frequencyBonus || 0))
    const interval = 1 / frequency
    const bulletCount = effect.bulletCount || 25

    let elapsed = 0
    let fired = 0
    const totalBullets = effect.permanent ? Infinity : bulletCount

    const timerId = setInterval(() => {
      elapsed += interval

      if ((!effect.permanent && elapsed >= duration) || fired >= totalBullets) {
        clearInterval(timerId)
        return
      }

      const pattern = getPattern('random')
      const positions = pattern({
        x: this.ctx.player.x,
        y: this.ctx.player.y,
        count: 1,
        speed: 350
      })

      positions.forEach(pos => {
        this.createSkillBullet({
          ...pos,
          damageMultiplier: effect.damageMultiplier || 1.0,
          size: 4 * (1 + (effect.bulletSize || 0)),
          critRate: effect.critRate || 0,
          source: skill.id
        })
      })

      fired++
    }, interval * 1000)

    if (!this.ctx.skillTimers) this.ctx.skillTimers = new Map()
    this.ctx.skillTimers.set(skill.id, timerId)
  }

  /**
   * 创建技能弹幕
   */
  createSkillBullet({
    x, y, vx, vy,
    damageMultiplier = 1.0,
    pierce = 0,
    critRate = 0,
    critDamage = 0,
    size = 4,
    source = 'unknown',
    pierceDamageBonus = 0
  }) {
    // 计算伤害
    const baseDamage = this.ctx.damageCalculator.calculate(damageMultiplier)

    const bullet = {
      x, y,
      vx: vx || 0,
      vy: vy || -420,
      damage: baseDamage.damage,
      isCrit: baseDamage.isCrit,
      pierce,
      maxPierce: pierce,
      pierceDamageBonus,
      critRate,
      critDamage,
      size,
      color: baseDamage.isCrit ? '#ff0' : '#fff',
      alive: true,
      source
    }

    this.ctx.bullets.push(bullet)
    return bullet
  }
}
