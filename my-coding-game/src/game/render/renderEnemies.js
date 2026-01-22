export function renderEnemies(ctx, enemies) {
  enemies.forEach(e => {
    const size = e.size * e.scale

    // 本体
    ctx.fillStyle = 'red'
    ctx.fillRect(
      e.x - size / 2,
      e.y - size / 2,
      size,
      size
    )

    renderEnemyHP(ctx, e, size)
  })
}

function renderEnemyHP(ctx, e, size) {
  ctx.fillStyle = '#000'
  ctx.fillRect(
    e.x - size / 2,
    e.y - size / 2 - 6,
    size,
    4
  )

  ctx.fillStyle = '#0f0'
  ctx.fillRect(
    e.x - size / 2,
    e.y - size / 2 - 6,
    size * (e.hp / e.maxHp),
    4
  )
}
