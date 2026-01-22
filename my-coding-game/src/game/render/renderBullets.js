export function renderBullets(ctx, bullets) {
  ctx.fillStyle = '#fff'

  bullets.forEach(b => {
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2)
    ctx.fill()
  })
}
