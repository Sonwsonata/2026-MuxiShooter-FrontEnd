/**
 * 子弹 vs 敌人 碰撞检测
 */

export function handleBulletEnemyCollision({
  bullets,
  enemies,
  onEnemyKilled
}) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i]

    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j]
      if (!e.alive) continue

      if (circleRectHit(b, e)) {
        // 伤害结算
        e.hp -= b.damage

        // 子弹消失
        bullets.splice(i, 1)

        if (e.hp <= 0) {
          e.alive = false
          onEnemyKilled?.(e)
        }

        break
      }
    }
  }
}

/* ================= 碰撞算法 ================= */

/**
 * 圆（子弹） vs 方形（敌人）
 */
function circleRectHit(bullet, enemy) {
  const size = enemy.size * enemy.scale

  const dx = Math.abs(bullet.x - enemy.x)
  const dy = Math.abs(bullet.y - enemy.y)

  if (dx > size / 2 + bullet.size) return false
  if (dy > size / 2 + bullet.size) return false

  return true
}
