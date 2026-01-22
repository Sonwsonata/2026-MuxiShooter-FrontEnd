import { renderBackground } from './renderBackground'
import { renderDefenseLine } from './renderDefenseLine'
import { renderPlayer } from './renderPlayer'
import { renderBullets } from './renderBullets'
import { renderEnemies } from './renderEnemies'
import { renderUI } from './renderUI'

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
  renderUI(ctx, { hp, exp, expMax })
}
