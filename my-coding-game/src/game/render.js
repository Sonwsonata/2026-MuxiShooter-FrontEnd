// src/game/render.js

export function renderGame(ctx, state, config) {
  const {
    player,
    bullets,
    enemies,
    hp,
    exp,
    expMax
  } = state

  const { WIDTH, HEIGHT, DEFENSE_LINE } = config

  renderBackground(ctx, WIDTH, HEIGHT)
  renderDefenseLine(ctx, WIDTH, DEFENSE_LINE)
  renderPlayer(ctx, player, DEFENSE_LINE)
  renderBullets(ctx, bullets)
  renderEnemies(ctx, enemies)
  renderUI(ctx, hp, exp, expMax)
}

/* ================= 私有渲染函数 ================= */

function renderBackground(ctx, w, h) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
}

function renderDefenseLine(ctx, w, y) {
  ctx.strokeStyle = '#444'
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(w, y)
  ctx.stroke()
}

function renderPlayer(ctx, player, defenseLine) {
  ctx.fillStyle = '#4af'
  ctx.fillRect(player.x - 15, defenseLine + 10, 30, 30)
}

function renderBullets(ctx, bullets) {
  ctx.fillStyle = '#fff'
  bullets.forEach(b => {
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2)
    ctx.fill()
  })
}

function renderEnemies(ctx, enemies) {
  enemies.forEach(e => {
    const size = e.size * e.scale

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

function renderUI(ctx, hp, exp, expMax) {
  ctx.fillStyle = '#fff'
  ctx.fillText(`HP: ${hp}`, 10, 20)

  const ratio = exp / expMax
  ctx.fillRect(10, 30, 100 * ratio, 6)
}
