import GameCanvas from '../game/canvas/GameCanvasNew.jsx'
import SkillSelectModal from '../ui/SkillSelectModal'

export default function Game() {
  return (
    <div className="page full">
      <GameCanvas />
      <SkillSelectModal />
    </div>
  )
}
