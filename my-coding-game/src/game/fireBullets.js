import { createBullet } from './bulletTypes'
import { buildBulletStats } from './bulletModifier'

export function fireBullets({
  player,
  baseStats,
  skillStats,
  bullets,
  bulletType = 'basic'
}) {
  const bulletStats = buildBulletStats(baseStats, skillStats)

  const rows = skillStats.rows || 1
  const cols = skillStats.cols || 1
  const mirrors = skillStats.mirror || 0

  const colSpacing = 12
  const rowSpacing = 10

  function spawn(offsetX) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bullets.push(
          createBullet({
            bulletType,
            bulletStats,
            x:
              player.x +
              offsetX +
              (c - (cols - 1) / 2) * colSpacing,
            y: player.y - r * rowSpacing
          })
        )
      }
    }
  }

  // 本体
  spawn(0)

  // 镜像（复制发射器）
  for (let i = 0; i < mirrors; i++) {
    const offset = (i + 1) * 30
    spawn(offset)
    spawn(-offset)
  }
}
