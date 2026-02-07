import { useGameStore } from '../store/gameStore'
import './SkillSelectModal.css'

export default function SkillSelectModal() {
  const isLevelUp = useGameStore(state => state.isLevelUp)
  const levelUpChoices = useGameStore(state => state.levelUpChoices)
  const pickSkill = useGameStore(state => state.pickSkill)
  const level = useGameStore(state => state.level)

  if (!isLevelUp) return null

  const handleSelect = (skill) => {
    pickSkill(skill)
  }

  return (
    <div className="skill-select-modal-overlay">
      <div className="skill-select-modal">
        <h2 className="modal-title">升级到 Lv.{level}！</h2>
        <p className="modal-subtitle">选择一个技能或强化</p>
        
        <div className="skill-choices">
          {levelUpChoices.map((skill, index) => (
            <div 
              key={index} 
              className={`skill-card skill-tier-${skill.tier}`}
              onClick={() => handleSelect(skill)}
            >
              <div className="skill-tier-badge">{getTierName(skill.tier)}</div>
              <div className="skill-category">{skill.category}</div>
              <div className="skill-name">{skill.name}</div>
              {skill.desc && (
                <div className="skill-desc">{skill.desc}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getTierName(tier) {
  const tierMap = {
    gold: '金色',
    silver: '银色',
    bronze: '铜色'
  }
  return tierMap[tier] || tier
}
