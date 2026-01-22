// src/config/stages.js
export const STAGES = [
  {
    id: 'stage-1',
    duration: 120,
    waves: [
      {
        enemyType: 'mist',
        count: 60,
        interval: 1.2,
        hpFactor: 1.0,
        speedFactor: 1.0,
        expFactor: 1.0
      },
      {
        enemyType: 'mist',
        count: 70,
        interval: 1.1,
        hpFactor: 1.6,
        speedFactor: 1.1,
        expFactor: 1.2
      },
      {
        enemyType: 'mist',
        count: 80,
        interval: 1.0,
        hpFactor: 2.4,
        speedFactor: 1.2,
        expFactor: 1.5
      },
      {
        enemyType: 'mist',
        count: 90,
        interval: 0.9,
        hpFactor: 3.5,
        speedFactor: 1.3,
        expFactor: 1.8
      }
    ]
  }
]
