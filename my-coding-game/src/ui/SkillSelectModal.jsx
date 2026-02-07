import React from 'react'
import { useGameStore } from '../store/gameStore'
import './SkillSelectModal.css'

export default function SkillSelectModal() {
  const isLevelUp = useGameStore(state => state.isLevelUp)
  const levelUpChoices = useGameStore(state => state.levelUpChoices)
  const pickSkill = useGameStore(state => state.pickSkill)
  const level = useGameStore(state => state.level)

  if (!isLevelUp || levelUpChoices.length === 0) {
    return null
  }

  const handleSelect = (option) => {
    pickSkill(option)
  }

  return (
    <div className="skill-select-modal-overlay">
      <div className="skill-select-modal">
        <h2 className="modal-title">🎉 升级到 Lv.{level}！</h2>
        <p className="modal-subtitle">选择一个技能或强化</p>
        
        <div className="skill-choices">
          {levelUpChoices.map((option, index) => (
            <SkillOption
              key={index}
              option={option}
              onSelect={() => handleSelect(option)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SkillOption({ option, onSelect }) {
  const { type, tier, name, description } = option

  // 根据类型和等级确定样式
  const getTierClass = () => {
    if (type === 'new_skill') return 'tier-new'
    return `tier-${tier}`
  }

  const getTierLabel = () => {
    if (type === 'new_skill') return '🆕 新技能'
    
    const tierLabels = {
      bronze: '🥉 铜色',
      silver: '🥈 银色',
      gold: '🥇 金色'
    }
    return tierLabels[tier] || '强化'
  }

  const getTitle = () => {
    if (type === 'new_skill') {
      return name
    } else {
      return `${option.skillName} - ${name}`
    }
  }

  return (
    <div 
      className={`skill-card skill-${getTierClass()}`}
      onClick={onSelect}
    >
      <div className="skill-tier-badge">{getTierLabel()}</div>
      
      {type === 'upgrade' && (
        <div className="skill-category">{option.skillName}</div>
      )}

      <div className="skill-name">{getTitle()}</div>
      
      {description && (
        <div className="skill-desc">{description}</div>
      )}

      {type === 'upgrade' && option.effect && (
        <div className="skill-effect-preview">
          {renderEffectPreview(option.effect)}
        </div>
      )}
    </div>
  )
}

function renderEffectPreview(effect) {
  const effects = []
  
  // 解析效果
  if (effect.damageMultiplier) {
    const sign = effect.damageMultiplier > 0 ? '+' : ''
    effects.push(`伤害${sign}${(effect.damageMultiplier * 100).toFixed(0)}%`)
  }
  
  if (effect.pierce) {
    effects.push(`穿透+${effect.pierce}`)
  }
  
  if (effect.critRate) {
    effects.push(`暴击率+${(effect.critRate * 100).toFixed(0)}%`)
  }
  
  if (effect.critDamage) {
    effects.push(`暴击伤害+${(effect.critDamage * 100).toFixed(0)}%`)
  }
  
  if (effect.cdReduce) {
    effects.push(`冷却-${(effect.cdReduce * 100).toFixed(0)}%`)
  }
  
  if (effect.cdIncrease) {
    effects.push(`冷却+${(effect.cdIncrease * 100).toFixed(0)}%`)
  }
  
  if (effect.rows) {
    effects.push(`排数+${effect.rows}`)
  }
  
  if (effect.bulletCount) {
    effects.push(`弹幕+${effect.bulletCount}`)
  }
  
  if (effect.mirrorCount) {
    effects.push(`镜像+${effect.mirrorCount}`)
  }
  
  if (effect.duration) {
    effects.push(`持续+${effect.duration}秒`)
  }
  
  if (effect.attackSpeed) {
    effects.push(`攻速+${(effect.attackSpeed * 100).toFixed(0)}%`)
  }
  
  if (effect.moveSpeed) {
    effects.push(`移速+${(effect.moveSpeed * 100).toFixed(0)}%`)
  }

  if (effect.permanent) {
    effects.push('⚡ 常驻')
  }

  if (effect.shots) {
    effects.push(`×${effect.shots}`)
  }

  return (
    <div className="effect-tags">
      {effects.map((eff, i) => (
        <span key={i} className="effect-tag">{eff}</span>
      ))}
    </div>
  )
}
