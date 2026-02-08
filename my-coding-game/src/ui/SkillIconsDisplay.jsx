import React, { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import './SkillIconsDisplay.css'

/**
 * 技能图标显示组件
 * 显示在右上角，FGO风格菱形图标
 */
export default function SkillIconsDisplay({ combatManager }) {
  const [skills, setSkills] = useState([])
  const [cooldowns, setCooldowns] = useState({})

  useEffect(() => {
    if (!combatManager) return

    // 更新技能列表和冷却时间
    const interval = setInterval(() => {
      const activeSkills = useGameStore.getState().getActiveSkills()
      setSkills(activeSkills)

      // 获取冷却时间
      const cds = {}
      activeSkills.forEach(skill => {
        const cd = combatManager.skillManager.getSkillCooldown(skill.id)
        const maxCd = combatManager.skillManager.getSkillMaxCooldown(skill.id)
        cds[skill.id] = {
          current: cd,
          max: maxCd,
          ready: cd <= 0
        }
      })
      setCooldowns(cds)
    }, 100) // 每100ms更新一次

    return () => clearInterval(interval)
  }, [combatManager])

  // 固定显示3个槽位
  const slots = [0, 1, 2]

  return (
    <div className="skill-icons-container">
      {slots.map(index => {
        const skill = skills[index]
        const cd = skill ? cooldowns[skill.id] : null

        return (
          <SkillIcon
            key={index}
            skill={skill}
            cooldown={cd}
            index={index}
          />
        )
      })}
    </div>
  )
}

function SkillIcon({ skill, cooldown, index }) {
  const getSkillIcon = () => {
    if (!skill) return '?'
    
    // 根据技能ID返回对应的图标
    const iconMap = {
      laptop: '💻',
      takeout: '🍱',
      fishing: '🎣',
      ebike: '🛵',
      ai_tool: '🤖',
      exam_mode: '📝',
      six_arts: '🎨'
    }
    
    return iconMap[skill.id] || '⭐'
  }

  const getCooldownPercent = () => {
    if (!cooldown || !cooldown.max) return 0
    return (cooldown.current / cooldown.max) * 100
  }

  const getCooldownText = () => {
    if (!cooldown || cooldown.ready) return ''
    return cooldown.current.toFixed(1) + 's'
  }

  return (
    <div className={`skill-icon ${skill ? 'active' : 'empty'} ${cooldown?.ready ? 'ready' : ''}`}>
      <div className="skill-icon-diamond">
        <div className="skill-icon-inner">
          <span className="skill-icon-symbol">{getSkillIcon()}</span>
        </div>
        
        {skill && cooldown && !cooldown.ready && (
          <>
            <div 
              className="skill-cooldown-overlay"
              style={{ height: `${getCooldownPercent()}%` }}
            />
            <div className="skill-cooldown-text">
              {getCooldownText()}
            </div>
          </>
        )}
      </div>
      
      <div className="skill-slot-number">{index + 1}</div>
    </div>
  )
}
