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
    <div className="skill-select-overlay">
      <div className="skill-select-container">
        <div className="skill-select-header">
          <h2 className="level-up-title">LEVEL UP</h2>
          <div className="level-display">Lv.{level}</div>
          <p className="skill-select-subtitle">选择技能或强化</p>
        </div>

        <div className="skill-options-grid">
          {levelUpChoices.map((option, index) => (
            <SkillCard
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

function SkillCard({ option, onSelect }) {
  const { type, tier, name, description } = option

  const getTierClass = () => {
    if (type === 'new_skill') return 'new'
    return tier
  }

  const getTierLabel = () => {
    if (type === 'new_skill') return 'NEW'
    
    const tierLabels = {
      bronze: 'BRONZE',
      silver: 'SILVER',
      gold: 'GOLD'
    }
    return tierLabels[tier] || 'UPGRADE'
  }

  const getTierIcon = () => {
    if (type === 'new_skill') return '★'
    
    const tierIcons = {
      bronze: '◆',
      silver: '◆',
      gold: '◆'
    }
    return tierIcons[tier] || '◆'
  }

  const getCardTitle = () => {
    if (type === 'new_skill') {
      return name
    } else {
      return name
    }
  }

  const getCardSubtitle = () => {
    if (type === 'upgrade') {
      return option.skillName
    }
    return null
  }

  return (
    <div 
      className={`skill-card tier-${getTierClass()}`}
      onClick={onSelect}
    >
      <div className="skill-card-border"></div>
      
      <div className="skill-card-header">
        <div className="skill-tier-badge">
          <span className="tier-icon">{getTierIcon()}</span>
          <span className="tier-label">{getTierLabel()}</span>
        </div>
      </div>

      <div className="skill-card-body">
        {getCardSubtitle() && (
          <div className="skill-category">{getCardSubtitle()}</div>
        )}
        <h3 className="skill-title">{getCardTitle()}</h3>
        <p className="skill-description">{description}</p>
      </div>

      {type === 'upgrade' && option.effect && (
        <div className="skill-effects">
          {renderEffects(option.effect)}
        </div>
      )}

      <div className="skill-card-footer">
        <div className="select-hint">点击选择</div>
      </div>
    </div>
  )
}

function renderEffects(effect) {
  const effects = []
  
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
    effects.push('常驻效果')
  }

  if (effect.shots) {
    effects.push(`释放${effect.shots}次`)
  }

  return effects.map((eff, i) => (
    <span key={i} className="effect-item">{eff}</span>
  ))
}
