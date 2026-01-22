const ENEMY_BASE_STATS = {
  mist: {
    hp: 30,
    speed: 40,
    size: 18
  }
}

export function createEnemy({ type, x, y = -20, wave }) {
  const base = ENEMY_BASE_STATS[type]

  if (!base) {
    throw new Error(`Unknown enemy type: ${type}`)
  }

  return {
    type,

    x,
    y,

    size: base.size,

    // 数值被波次放大
    hp: Math.floor(base.hp * wave.hpFactor),
    maxHp: Math.floor(base.hp * wave.hpFactor),

    speed: base.speed * wave.speedFactor,

    scale: 1,
    alive: true
  }
}
