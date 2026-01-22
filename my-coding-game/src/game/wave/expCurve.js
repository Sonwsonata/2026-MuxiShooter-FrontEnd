/**
 * 第一关经验曲线（可替换 / 可复用）
 * @param {Object} params
 */
export function getWaveExpFactor({
  stageId,
  waveIndex,
  elapsedTime,
  totalTime
}) {
  // 第一关：4 波，60 秒

  const progress = elapsedTime / totalTime

  // 波次基础调节
  const waveFactor = [
    0.6, // wave 0
    0.9, // wave 1
    1.2, // wave 2
    1.6  // wave 3
  ][waveIndex] ?? 1

  // 时间波动（中段稍降，后段抬升）
  let timeFactor = 1
  if (progress < 0.25) timeFactor = 1.2
  else if (progress < 0.6) timeFactor = 0.9
  else timeFactor = 1.3

  return waveFactor * timeFactor
}
