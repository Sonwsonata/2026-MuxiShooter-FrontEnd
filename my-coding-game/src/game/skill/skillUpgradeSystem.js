/**
 * 技能升级系统
 * 统一管理技能获取、升级和强化选择
 */

import { SKILLS } from './skillDefinitions'

/**
 * 技能状态管理
 */
export class SkillUpgradeSystem {
  constructor() {
    // 玩家拥有的技能
    // 格式: { skillId: { level: 1, upgrades: ['upgrade_id_1', ...] } }
    this.ownedSkills = {}
  }

  /**
   * 获取升级选项
   * @param {number} count - 选项数量
   * @returns {Array} 升级选项列表
   */
  getLevelUpOptions(count = 3) {
    const options = []
    
    // 1. 获取新技能选项
    const newSkillOptions = this.getNewSkillOptions()
    
    // 2. 获取技能升级选项（已有技能的强化）
    const upgradeOptions = this.getSkillUpgradeOptions()
    
    // 3. 合并并随机选择
    const allOptions = [...newSkillOptions, ...upgradeOptions]
    
    // 随机打乱
    const shuffled = allOptions.sort(() => Math.random() - 0.5)
    
    // 返回指定数量
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  /**
   * 获取新技能选项（未拥有的技能）
   */
  getNewSkillOptions() {
    const options = []
    
    for (const [skillId, skillDef] of Object.entries(SKILLS)) {
      // 如果还没有这个技能
      if (!this.ownedSkills[skillId]) {
        options.push({
          type: 'new_skill',
          skillId,
          name: skillDef.name,
          description: skillDef.description,
          tier: 'new', // 新技能标记
          icon: skillDef.icon || '🆕'
        })
      }
    }
    
    return options
  }

  /**
   * 获取技能升级选项（已有技能的强化）
   */
  getSkillUpgradeOptions() {
    const options = []
    
    for (const [skillId, skillState] of Object.entries(this.ownedSkills)) {
      const skillDef = SKILLS[skillId]
      if (!skillDef) continue
      
      const level = skillState.level || 1
      const ownedUpgrades = skillState.upgrades || []
      
      // 根据等级确定可用的强化等级
      let availableTiers = []
      if (level >= 1) availableTiers.push('bronze')
      if (level >= 3) availableTiers.push('silver')
      if (level >= 6) availableTiers.push('gold')
      
      // 获取所有可用的强化
      for (const tier of availableTiers) {
        const upgrades = skillDef.upgrades[tier] || []
        
        for (const upgrade of upgrades) {
          // 如果还没有这个强化
          if (!ownedUpgrades.includes(upgrade.id)) {
            options.push({
              type: 'upgrade',
              skillId,
              skillName: skillDef.name,
              upgradeId: upgrade.id,
              name: upgrade.name,
              description: upgrade.description,
              tier: upgrade.tier,
              effect: upgrade.effect
            })
          }
        }
      }
    }
    
    return options
  }

  /**
   * 选择一个选项
   * @param {Object} option - 选项对象
   * @returns {Object} 更新后的技能状态
   */
  selectOption(option) {
    if (option.type === 'new_skill') {
      // 获取新技能
      return this.acquireSkill(option.skillId)
    } else if (option.type === 'upgrade') {
      // 升级已有技能
      return this.upgradeSkill(option.skillId, option.upgradeId)
    }
  }

  /**
   * 获取新技能
   */
  acquireSkill(skillId) {
    if (!this.ownedSkills[skillId]) {
      this.ownedSkills[skillId] = {
        level: 1,
        upgrades: []
      }
    }
    
    return {
      action: 'acquire',
      skillId,
      skill: SKILLS[skillId],
      state: this.ownedSkills[skillId]
    }
  }

  /**
   * 升级技能（添加强化）
   */
  upgradeSkill(skillId, upgradeId) {
    if (!this.ownedSkills[skillId]) {
      // 如果没有这个技能，先获取
      this.acquireSkill(skillId)
    }
    
    const skillState = this.ownedSkills[skillId]
    
    // 添加强化
    if (!skillState.upgrades.includes(upgradeId)) {
      skillState.upgrades.push(upgradeId)
      skillState.level += 1
    }
    
    return {
      action: 'upgrade',
      skillId,
      upgradeId,
      skill: SKILLS[skillId],
      state: skillState
    }
  }

  /**
   * 获取技能的完整效果（基础+所有强化）
   */
  getSkillEffect(skillId) {
    const skillDef = SKILLS[skillId]
    const skillState = this.ownedSkills[skillId]
    
    if (!skillDef || !skillState) return null
    
    // 从基础效果开始
    const effect = { ...skillDef.baseEffect }
    
    // 应用所有强化
    for (const upgradeId of skillState.upgrades) {
      const upgrade = this.findUpgrade(skillDef, upgradeId)
      if (upgrade && upgrade.effect) {
        // 合并效果
        for (const [key, value] of Object.entries(upgrade.effect)) {
          if (typeof value === 'number') {
            // 数值类型：累加
            effect[key] = (effect[key] || 0) + value
          } else if (typeof value === 'boolean') {
            // 布尔类型：或运算
            effect[key] = effect[key] || value
          } else {
            // 其他类型：覆盖
            effect[key] = value
          }
        }
      }
    }
    
    return {
      ...skillDef,
      effect,
      level: skillState.level,
      upgrades: skillState.upgrades
    }
  }

  /**
   * 查找强化定义
   */
  findUpgrade(skillDef, upgradeId) {
    for (const tier of ['bronze', 'silver', 'gold']) {
      const upgrades = skillDef.upgrades[tier] || []
      const found = upgrades.find(u => u.id === upgradeId)
      if (found) return found
    }
    return null
  }

  /**
   * 获取所有已激活的技能
   */
  getActiveSkills() {
    const skills = []
    
    for (const skillId of Object.keys(this.ownedSkills)) {
      const skillEffect = this.getSkillEffect(skillId)
      if (skillEffect) {
        skills.push(skillEffect)
      }
    }
    
    return skills
  }

  /**
   * 重置（用于测试）
   */
  reset() {
    this.ownedSkills = {}
  }

  /**
   * 导出状态（用于存档）
   */
  exportState() {
    return JSON.parse(JSON.stringify(this.ownedSkills))
  }

  /**
   * 导入状态（用于读档）
   */
  importState(state) {
    this.ownedSkills = JSON.parse(JSON.stringify(state))
  }
}
