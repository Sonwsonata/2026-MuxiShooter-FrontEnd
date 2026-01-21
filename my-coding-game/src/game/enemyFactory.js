export function createEnemy(config) {
  return {
    x: config.x,
    y: config.y,
    size: config.size || 16,
    speed: config.speed || 40,

    maxHp: config.hp,
    hp: config.hp,

    alive: true,
    scale: 0.5,

    gold: config.gold || 0
  }
}
