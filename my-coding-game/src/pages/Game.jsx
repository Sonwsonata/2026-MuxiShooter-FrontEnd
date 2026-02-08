import { useState, useCallback } from 'react'
import GameCanvas from '../game/canvas/GameCanvasNew.jsx'
import SkillSelectModal from '../ui/SkillSelectModal'
import SkillIconsDisplay from '../ui/SkillIconsDisplay'

export default function Game() {
  const [combatManager, setCombatManager] = useState(null)

  // 使用useCallback避免函数每次重新创建
  const handleCombatManagerReady = useCallback((manager) => {
    setCombatManager(manager)
  }, [])

  return (
    <div className="page full">
      <GameCanvas onCombatManagerReady={handleCombatManagerReady} />
      <SkillSelectModal />
      {combatManager && <SkillIconsDisplay combatManager={combatManager} />}
    </div>
  )
}
