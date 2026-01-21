// src/game/bulletModifier.js

/**
 * 构建子弹的【行为 & 表现属性】
 * ❗ 不包含任何伤害计算
 * ❗ 不包含敌人 / 命中逻辑
 */
export function buildBulletStats(baseStats, skillStats) {
  return {
    /* ================= 飞行属性 ================= */

    speed:
      baseStats.bulletSpeed *
      (skillStats.bulletSpeedMultiplier || 1),

    /* ================= 尺寸 / 表现 ================= */

    size:
      (baseStats.bulletSize || 6) *
      (1 + (skillStats.sizeUp || 0)),

    /* ================= 穿透 ================= */

    pierce: skillStats.pierce || 0,

    /* ================= 子弹样式（纯装饰） ================= */

    bulletType: skillStats.bulletType || 'normal',

    /* ================= 特殊标记（给 bulletHit 用） ================= */

    forceCrit: skillStats.forceCrit || false,
    ignoreDamageReduce: skillStats.ignoreDamageReduce || false
  }
}
