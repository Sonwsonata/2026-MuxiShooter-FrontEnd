// src/game/bulletTypes.js

const BULLET_STYLES = {
  basic: {
    size: 4,
    color: '#ffffff'
  },

  heavy: {
    size: 6,
    color: '#ffd700'
  },

  laser: {
    size: 2,
    color: '#00ffff',
    render(ctx, b) {
      ctx.fillStyle = '#00ffff'
      ctx.fillRect(b.x - 1, b.y - 20, 2, 20)
    }
  }
}

/**
 * 子弹构造器（永远返回合法子弹）
 */
export function createBullet({
  x,
  y,
  bulletType = 'basic',
  bulletStats
}) {
  const style = BULLET_STYLES[bulletType] || BULLET_STYLES.basic

  return {
    /* 位置 */
    x,
    y,

    /* 生命周期 */
    alive: true,

    /* 数值（唯一来源） */
    speed: bulletStats.speed,
    damage: bulletStats.damage,
    pierce: bulletStats.pierce,
    critRate: bulletStats.critRate,
    critDamage: bulletStats.critDamage,

    /* 表现 */
    bulletType,
    size: style.size,
    color: style.color,
    render: style.render
  }
}
