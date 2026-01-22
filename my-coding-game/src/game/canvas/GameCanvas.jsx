// src/game/GameCanvas.jsx
import { useEffect, useRef } from 'react'
import { fireBullets } from '../combat/fireBullets'
import { handleBulletHit } from '../combat/bulletHit'
import { getFireInterval } from '../fireController'
import { useGameStore } from '../../store/gameStore'
import { STAGES } from '../config/stages'
import { createWaveController } from '../wave/waveController'

const WIDTH = 360
const HEIGHT = 640
const DEFENSE_LINE = 520

export default function GameCanvas() {
  const canvasRef = useRef(null)
  const lastTimeRef = useRef(0)
  const fireTimerRef = useRef(0)
  const waveControllerRef = useRef(null)

  /* ================= 战斗态（不进 store） ================= */

  const playerRef = useRef({
    x: WIDTH / 2,
    baseY: DEFENSE_LINE + 20,
    y: DEFENSE_LINE + 20,
    size: 16
  })

  const bulletsRef = useRef([])
  const enemiesRef = useRef([])
  const hpRef = useRef(10)

  /* ================= 规则态（来自 store） ================= */

  const pauseGame = useGameStore(state => state.pauseGame)
  const gainExp = useGameStore(state => state.gainExp)

  /* ================= 初始化关卡 ================= */

  useEffect(() => {
    const stage = STAGES[0]
    waveControllerRef.current = createWaveController(
      stage,
      enemiesRef.current
    )
  }, [])

  /* ================= 主循环 ================= */

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function loop(time) {
      let dt = (time - lastTimeRef.current) / 1000
      dt = Math.min(dt, 0.033)
      lastTimeRef.current = time

      if (!pauseGame) {
        update(dt)
      }

      render(ctx)
      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
  }, [pauseGame])

  /* ================= 更新逻辑 ================= */

  function update(dt) {
    const player = playerRef.current
    const bullets = bulletsRef.current
    const enemies = enemiesRef.current

    /* ---- 刷怪 ---- */
    waveControllerRef.current?.update(dt)

    /* ---- 自动射击 ---- */
    fireTimerRef.current += dt
    const interval = getFireInterval(0.25, {}) // 基础攻速

    if (fireTimerRef.current >= interval) {
      fireBullets({
        player,
        baseStats: {
          attack: 0,
          critRate: 0.1,
          critDmg: 1
        },
        skillStats: {},
        bullets
      })
      fireTimerRef.current = 0
    }

    /* ---- 子弹更新 ---- */
    bullets.forEach(b => {
      b.y -= b.speed * dt
      if (b.y < -20) b.alive = false
    })

    /* ---- 敌人更新（直线推进） ---- */
    enemies.forEach(e => {
      e.y += e.speed * dt
      e.scale = 0.6 + e.y / HEIGHT

      if (e.y >= DEFENSE_LINE) {
        hpRef.current -= 1
        e.alive = false
      }
    })

    /* ---- 碰撞检测 ---- */
    bullets.forEach(b => {
      if (!b.alive) return
      enemies.forEach(e => {
        if (!e.alive) return

        const dx = b.x - e.x
        const dy = b.y - e.y
        const dist = Math.hypot(dx, dy)

        if (dist < b.size + e.size * e.scale) {
          handleBulletHit(b, e)

          if (e.hp <= 0) {
            e.alive = false
            gainExp(20) // 第一关基础经验
          }
        }
      })
    })

    cleanArray(bullets)
    cleanArray(enemies)
  }

  /* ================= 渲染 ================= */

  function render(ctx) {
    const player = playerRef.current
    const bullets = bulletsRef.current
    const enemies = enemiesRef.current

    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    /* 背景 */
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    /* 防守线 */
    ctx.strokeStyle = '#444'
    ctx.beginPath()
    ctx.moveTo(0, DEFENSE_LINE)
    ctx.lineTo(WIDTH, DEFENSE_LINE)
    ctx.stroke()

    /* 玩家 */
    ctx.fillStyle = '#4af'
    ctx.fillRect(
      player.x - player.size,
      player.y - player.size,
      player.size * 2,
      player.size * 2
    )

    /* 子弹 */
    ctx.fillStyle = '#fff'
    bullets.forEach(b => {
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2)
      ctx.fill()
    })

    /* 敌人 */
    enemies.forEach(e => {
      const size = e.size * e.scale

      ctx.fillStyle = 'red'
      ctx.fillRect(e.x - size / 2, e.y - size / 2, size, size)

      // 血条
      ctx.fillStyle = '#000'
      ctx.fillRect(e.x - size / 2, e.y - size / 2 - 6, size, 4)
      ctx.fillStyle = '#0f0'
      ctx.fillRect(
        e.x - size / 2,
        e.y - size / 2 - 6,
        size * (e.hp / e.maxHp),
        4
      )
    })

    /* UI */
    ctx.fillStyle = '#fff'
    ctx.fillText(`HP: ${hpRef.current}`, 10, 20)
  }

  /* ================= 触控 / 鼠标 ================= */

  useEffect(() => {
    const canvas = canvasRef.current
    const player = playerRef.current

    function move(e) {
      const p = e.touches ? e.touches[0] : e
      const rect = canvas.getBoundingClientRect()

      const x = p.clientX - rect.left
      player.x = Math.max(20, Math.min(WIDTH - 20, x))
    }

    canvas.addEventListener('mousemove', move)
    canvas.addEventListener('touchmove', move)

    return () => {
      canvas.removeEventListener('mousemove', move)
      canvas.removeEventListener('touchmove', move)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}

/* ================= 工具 ================= */

function cleanArray(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (!arr[i].alive) arr.splice(i, 1)
  }
}
