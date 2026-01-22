/**
 * 子弹更新
 */

export function updateBullets(bullets, dt, height) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i]

    b.y -= b.speed * dt

    // 超出屏幕 → 删除
    if (b.y < -20) {
      bullets.splice(i, 1)
    }
  }
}
