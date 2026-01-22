export function updateEnemies(enemies, dt, defenseLine, onReachLine) {
  enemies.forEach(e => {
    if (!e.alive) return

    // 直线向下
    e.y += e.speed * dt

    // 视觉缩放（假透视）
    e.scale = 0.6 + e.y / 640

    // 到达防守线
    if (e.y >= defenseLine) {
      e.alive = false
      onReachLine?.(e)
    }
  })
}
