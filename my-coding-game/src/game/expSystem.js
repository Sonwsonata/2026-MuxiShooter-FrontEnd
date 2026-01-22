/**
 * 经验系统
 * 普通怪 = 固定经验
 */

export function gainEnemyExp(enemy, gameStore) {
  const EXP_PER_ENEMY = 20

  gameStore.getState().gainExp(EXP_PER_ENEMY)
}
