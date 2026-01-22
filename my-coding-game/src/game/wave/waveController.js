// src/game/waveController.js
import { createEnemy } from '../enemy/enemyFactory'
import { ENEMY_TYPES } from '../enemy/enemyTypes'

export function createWaveController(stage, enemies) {
  let currentWaveIndex = 0
  let spawnTimer = 0
  let spawnedInWave = 0
  let state = 'RUNNING'

  const waves = stage.waves

  function update(dt) {
    if (state !== 'RUNNING') return state

    const wave = waves[currentWaveIndex]
    if (!wave) {
      state = 'STAGE_CLEAR'
      return state
    }

    spawnTimer += dt

    if (
      spawnedInWave < wave.count &&
      spawnTimer >= wave.interval
    ) {
      spawnTimer = 0
      spawnedInWave++

      const base = ENEMY_TYPES[wave.enemyType]

      enemies.push(
        createEnemy({
        type: wave.enemyType,
        x: randomX(),
        y: -30,
        wave
      })
      )
    }

    const noAliveEnemy = enemies.every(e => !e.alive)

    if (spawnedInWave >= wave.count && noAliveEnemy) {
      currentWaveIndex++
      spawnedInWave = 0
      spawnTimer = 0
    }

    return state
  }

  return {
    update,
    getState(){
      return state
    },
    getCurrentWave() {
      return currentWaveIndex + 1
    },
    getCurrentWaveConfig() {
      return waves[currentWaveIndex]
    }
  }
}

function randomX() {
  return 40 + Math.random() * (360 - 80)
}
