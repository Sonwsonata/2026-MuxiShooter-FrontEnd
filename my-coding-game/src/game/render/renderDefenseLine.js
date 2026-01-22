export function renderDefenseLine(ctx, w, y) {
  ctx.strokeStyle = '#444'
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(w, y)
  ctx.stroke()
}
