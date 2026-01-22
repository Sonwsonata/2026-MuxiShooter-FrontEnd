// src/game/expFactor.js

export function getWaveExpFactor(progress) {
  // progress: 0 ~ 1（当前关卡进度）
  return (
    1.2 +
    1.1 * progress +
    0.4 * Math.sin(progress * Math.PI * 2)
  )
}
