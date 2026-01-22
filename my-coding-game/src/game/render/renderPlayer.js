export function renderPlayer(ctx, player, defenseLine) {
  ctx.fillStyle = '#4af'
  ctx.fillRect(
    player.x - 15,
    defenseLine + 10,
    30,
    30
  )
}
