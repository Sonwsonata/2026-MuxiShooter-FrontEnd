// src/game/combat/bulletPatterns.js

/**
 * 弹幕发射模式
 * 定义各种不同的弹幕发射模式
 */

/**
 * 直线发射模式（笔记本电脑）
 * @param {Object} params
 * @param {number} params.x - 发射起点X
 * @param {number} params.y - 发射起点Y
 * @param {number} params.count - 弹幕数量
 * @param {number} params.rows - 排数
 * @param {number} params.spacing - 间距
 * @returns {Array} 弹幕位置和速度数组
 */
export function linePattern({ x, y, count = 3, rows = 1, spacing = 15 }) {
  const bullets = []
  const rowSpacing = 10

  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < count; i++) {
      const offsetX = (i - (count - 1) / 2) * spacing
      bullets.push({
        x: x + offsetX,
        y: y - r * rowSpacing,
        vx: 0,
        vy: -420 // 向上发射
      })
    }
  }

  return bullets
}

/**
 * 两侧发射模式（外卖）
 * @param {Object} params
 * @param {number} params.x - 发射起点X
 * @param {number} params.y - 发射起点Y
 * @param {number} params.bulletPerSide - 每侧弹幕数量
 * @param {number} params.converge - 是否向中心收束
 * @returns {Array} 弹幕位置和速度数组
 */
export function sidePattern({ x, y, bulletPerSide = 2, converge = false }) {
  const bullets = []
  const sideOffset = 25

  for (let i = 0; i < bulletPerSide; i++) {
    // 左侧
    const leftX = x - sideOffset
    const leftVx = converge ? 50 : 0
    bullets.push({
      x: leftX,
      y: y,
      vx: leftVx,
      vy: -400
    })

    // 右侧
    const rightX = x + sideOffset
    const rightVx = converge ? -50 : 0
    bullets.push({
      x: rightX,
      y: y,
      vx: rightVx,
      vy: -400
    })
  }

  return bullets
}

/**
 * 横向扇形发射模式（换鱼宝典）
 * @param {Object} params
 * @param {number} params.x - 发射起点X
 * @param {number} params.y - 发射起点Y
 * @param {number} params.count - 弹幕数量
 * @param {number} params.spread - 扩散角度（弧度）
 * @param {number} params.range - 范围倍率
 * @returns {Array} 弹幕位置和速度数组
 */
export function horizontalPattern({ x, y, count = 5, spread = Math.PI / 6, range = 1.0 }) {
  const bullets = []
  const baseSpeed = 400
  const adjustedSpread = spread * range

  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (i - (count - 1) / 2) * (adjustedSpread / (count - 1))
    bullets.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * baseSpeed,
      vy: Math.sin(angle) * baseSpeed
    })
  }

  return bullets
}

/**
 * 随机发射模式（君子六艺）
 * @param {Object} params
 * @param {number} params.x - 发射起点X
 * @param {number} params.y - 发射起点Y
 * @param {number} params.count - 弹幕数量
 * @param {number} params.speed - 弹幕速度
 * @returns {Array} 弹幕位置和速度数组
 */
export function randomPattern({ x, y, count = 25, speed = 350 }) {
  const bullets = []

  for (let i = 0; i < count; i++) {
    // 随机角度（向上半球）
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI
    bullets.push({
      x: x + (Math.random() - 0.5) * 40, // 稍微分散起点
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    })
  }

  return bullets
}

/**
 * 环绕旋转模式（后端-分布式集群）
 * @param {Object} params
 * @param {number} params.x - 中心点X
 * @param {number} params.y - 中心点Y
 * @param {number} params.count - 弹幕数量
 * @param {number} params.radius - 旋转半径
 * @param {number} params.angleOffset - 角度偏移
 * @returns {Array} 弹幕位置和速度数组（包含轨道信息）
 */
export function orbitPattern({ x, y, count = 3, radius = 40, angleOffset = 0 }) {
  const bullets = []
  const angleStep = (Math.PI * 2) / count

  for (let i = 0; i < count; i++) {
    const angle = angleOffset + i * angleStep
    bullets.push({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      orbit: {
        centerX: x,
        centerY: y,
        radius: radius,
        angle: angle,
        speed: 3 // 旋转速度（弧度/秒）
      }
    })
  }

  return bullets
}

/**
 * 获取弹幕模式函数
 * @param {string} patternName - 模式名称
 * @returns {Function} 模式函数
 */
export function getPattern(patternName) {
  const patterns = {
    line: linePattern,
    side: sidePattern,
    horizontal: horizontalPattern,
    random: randomPattern,
    orbit: orbitPattern
  }

  return patterns[patternName] || linePattern
}
