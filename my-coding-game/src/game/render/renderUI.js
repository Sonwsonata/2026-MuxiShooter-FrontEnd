export function renderUI(ctx, { hp, exp, expMax }) {
  ctx.fillStyle = '#fff'
  ctx.fillText(`HP: ${hp}`, 10, 20)

  const ratio = exp / expMax
  ctx.fillRect(10, 30, 100 * ratio, 6)
}
