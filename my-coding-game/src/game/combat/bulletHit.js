// src/game/bulletHit.js

/**
 * 子弹命中敌人时的统一处理
 * ⚠️ 这是【纯战斗逻辑层】
 *
 * @param {Object} bullet 子弹对象
 * @param {Object} enemy  敌人对象
 * @param {Object} store  useGameStore.getState()
 */
export function handleBulletHit(bullet, enemy, store) {
  if (!bullet.alive || !enemy.alive) return

  const { combatStats } = store

  /* ================= 1. 基础伤害 ================= */

  // (10 + 攻击力) * 伤害倍率
  let damage =
    (10 + combatStats.attack) *
    combatStats.damageMultiplier

  /* ================= 2. 暴击判定 ================= */

  let isCrit = false
  if (Math.random() < combatStats.critRate) {
    damage *= combatStats.critDamage
    isCrit = true
  }

  damage = Math.floor(damage)

  /* ================= 3. 扣血 ================= */

  enemy.hp -= damage
  enemy.lastHitCrit = isCrit
  enemy.hitFlashTime = 5

  /* ================= 4. 子弹穿透 ================= */

  if (bullet.pierce > 0) {
    bullet.pierce--
  } else {
    bullet.alive = false
  }

  /* ================= 5. 敌人死亡 ================= */

  if (enemy.hp <= 0) {
    enemy.alive = false
    onEnemyKilled(enemy, store)
  }
}

/* ================= 敌人死亡处理 ================= */

function onEnemyKilled(enemy, store) {
  // ⚠️ 这里只做“数值层”的事，不碰 UI

  if (enemy.exp) {
    store.gainExp(enemy.exp)
  }

  if (enemy.gold) {
    store.addGold(enemy.gold)
  }
}
