// src/game/waveController.js
import { createEnemy } from './enemyFactory'

/**
 * 创建刷怪控制器
 * @param {Object} stage 关卡配置（来自 config/stages.js）
 * @param {Array} enemies 敌人数组（GameCanvas 里那一个）
 */
export function createWaveController(stage, enemies) {
  let currentWaveIndex = 0
  let spawnTimer = 0
  let spawnedInWave = 0
  let state = 'RUNNING' // RUNNING | STAGE_CLEAR

  const waves = stage.waves

  function update(dt) {
    if (state !== 'RUNNING') return state

    const wave = waves[currentWaveIndex]
    if (!wave) {
      state = 'STAGE_CLEAR'
      return state
    }

    spawnTimer += dt

    /* ================= 刷怪 ================= */

    if (
      spawnedInWave < wave.count &&
      spawnTimer >= wave.interval
    ) {
      spawnTimer = 0
      spawnedInWave++

      enemies.push(
        createEnemy({
          type: wave.enemyType,
          x: randomX(),
          y: -30
        })
      )
    }

    /* ================= 波次结束判定 ================= */

    const noAliveEnemy = enemies.every(e => !e.alive)

    if (
      spawnedInWave >= wave.count &&
      noAliveEnemy
    ) {
      currentWaveIndex++
      spawnedInWave = 0
      spawnTimer = 0
    }

    return state
  }

  return {
    update,
    getState() {
      return state
    },
    getCurrentWave() {
      return currentWaveIndex + 1
    }
  }
}

/* ================= 工具 ================= */

function randomX() {
  return 40 + Math.random() * (360 - 80)
}
