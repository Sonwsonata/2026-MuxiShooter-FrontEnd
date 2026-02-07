// src/game/skill/skillManager.js

import { getSkillDefinition } from './skillDefinitions'

/**
 * 技能管理器
 * 管理玩家拥有的技能、冷却、升级等
 */
export class SkillManager {
  constructor() {
    this.ownedSkills = new Map() // skillId -> skill instance
    this.activeSkills = new Map() // skillId -> active state
  }

  /**
   * 添加技能
   */
  addSkill(skillId) {
    if (this.ownedSkills.has(skillId)) {
      // 技能已存在，升级等级
      const skill = this.ownedSkills.get(skillId)
      skill.level++
      return skill
    }

    // 创建新技能
    const definition = getSkillDefinition(skillId)
    if (!definition) {
      console.error(`Unknown skill: ${skillId}`)
      return null
    }

    const skill = this.createSkillInstance(definition)
    this.ownedSkills.set(skillId, skill)
    return skill
  }

  /**
   * 创建技能实例
   */
  createSkillInstance(definition) {
    return {
      id: definition.id,
      name: definition.name,
      type: definition.type,
      level: 1,
      
      // 冷却相关
      baseCd: definition.cd,
      currentCd: 0,
      cdModifier: 0, // CD减少修正
      
      // 持续时间
      baseDuration: definition.duration,
      durationModifier: 0,
      
      // 效果配置（深拷贝）
      effect: JSON.parse(JSON.stringify(definition.baseEffect)),
      
      // 已选择的强化
      upgrades: [],
      
      // 定义引用
      definition
    }
  }

  /**
   * 添加强化
   */
  addUpgrade(skillId, upgradeId) {
    const skill = this.ownedSkills.get(skillId)
    if (!skill) {
      console.error(`Skill not found: ${skillId}`)
      return false
    }

    // 查找强化定义
    const upgrade = this.findUpgrade(skill.definition, upgradeId)
    if (!upgrade) {
      console.error(`Upgrade not found: ${upgradeId}`)
      return false
    }

    // 添加到已选择列表
    skill.upgrades.push(upgrade)

    // 应用强化效果
    this.applyUpgradeEffect(skill, upgrade.effect)
    
    return true
  }

  /**
   * 查找强化定义
   */
  findUpgrade(definition, upgradeId) {
    const { upgrades } = definition
    
    for (const tier of ['gold', 'silver', 'bronze']) {
      const found = upgrades[tier]?.find(u => u.id === upgradeId)
      if (found) return found
    }
    
    return null
  }

  /**
   * 应用强化效果
   */
  applyUpgradeEffect(skill, effect) {
    // CD相关
    if (effect.cdReduce) {
      skill.cdModifier -= effect.cdReduce
    }
    if (effect.cdIncrease) {
      skill.cdModifier += effect.cdIncrease
    }

    // 持续时间
    if (effect.durationIncrease) {
      skill.durationModifier += effect.durationIncrease
    }

    // 其他效果直接合并到skill.effect
    for (const [key, value] of Object.entries(effect)) {
      if (key === 'cdReduce' || key === 'cdIncrease' || key === 'durationIncrease') {
        continue
      }

      if (typeof value === 'number' && typeof skill.effect[key] === 'number') {
        skill.effect[key] += value
      } else {
        skill.effect[key] = value
      }
    }
  }

  /**
   * 更新冷却
   */
  updateCooldowns(dt) {
    for (const skill of this.ownedSkills.values()) {
      if (skill.currentCd > 0) {
        skill.currentCd -= dt
        if (skill.currentCd < 0) {
          skill.currentCd = 0
        }
      }
    }
  }

  /**
   * 检查技能是否就绪
   */
  isSkillReady(skillId) {
    const skill = this.ownedSkills.get(skillId)
    return skill && skill.currentCd <= 0
  }

  /**
   * 触发技能
   */
  triggerSkill(skillId) {
    const skill = this.ownedSkills.get(skillId)
    if (!skill || skill.currentCd > 0) {
      return null
    }

    // 设置冷却
    const finalCd = skill.baseCd * (1 + skill.cdModifier)
    skill.currentCd = Math.max(0.1, finalCd)

    // 如果是持续技能，标记为激活
    if (skill.baseDuration > 0) {
      const finalDuration = skill.baseDuration * (1 + skill.durationModifier)
      this.activeSkills.set(skillId, {
        skill,
        remaining: finalDuration
      })
    }

    return skill
  }

  /**
   * 更新激活技能
   */
  updateActiveSkills(dt) {
    const expired = []

    for (const [skillId, state] of this.activeSkills.entries()) {
      state.remaining -= dt
      if (state.remaining <= 0) {
        expired.push(skillId)
      }
    }

    // 移除过期技能
    expired.forEach(id => this.activeSkills.delete(id))
  }

  /**
   * 检查技能是否激活中
   */
  isSkillActive(skillId) {
    return this.activeSkills.has(skillId)
  }

  /**
   * 获取技能
   */
  getSkill(skillId) {
    return this.ownedSkills.get(skillId)
  }

  /**
   * 获取所有拥有的技能
   */
  getAllSkills() {
    return Array.from(this.ownedSkills.values())
  }

  /**
   * 获取所有激活的技能
   */
  getActiveSkills() {
    return Array.from(this.activeSkills.values()).map(state => state.skill)
  }

  /**
   * 获取技能剩余冷却时间
   */
  getSkillCooldown(skillId) {
    const skill = this.ownedSkills.get(skillId)
    return skill ? skill.currentCd : 0
  }

  /**
   * 获取技能最大冷却时间
   */
  getSkillMaxCooldown(skillId) {
    const skill = this.ownedSkills.get(skillId)
    return skill ? skill.baseCd * (1 + skill.cdModifier) : 0
  }

  /**
   * 清空所有技能
   */
  clearSkills() {
    this.ownedSkills.clear()
    this.activeSkills.clear()
  }

  /**
   * 添加带有完整效果的技能（用于从升级系统同步）
   */
  addSkillWithEffect(skillData) {
    // skillData 已经包含了完整的效果（基础+所有强化）
    const skill = {
      id: skillData.id,
      name: skillData.name,
      type: skillData.type,
      level: skillData.level || 1,
      
      // 冷却相关
      baseCd: skillData.cd,
      currentCd: 0,
      cdModifier: 0,
      
      // 持续时间
      baseDuration: skillData.duration || 0,
      durationModifier: 0,
      
      // 效果配置（已经包含所有强化）
      effect: skillData.effect || {},
      
      // 已选择的强化
      upgrades: skillData.upgrades || [],
      
      // 定义引用
      definition: skillData
    }
    
    this.ownedSkills.set(skillData.id, skill)
    return skill
  }
}
