// src/game/canvas/GameCanvasNew.jsx
import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { STAGES } from '../config/stages'
import { createWaveController } from '../wave/waveController'
import { CombatManager } from '../combat/combatManager'

const WIDTH = 360
const HEIGHT = 640
const DEFENSE_LINE = 520

export default function GameCanvasNew() {
  const canvasRef = useRef(null)
  const lastTimeRef = useRef(0)
  const waveControllerRef = useRef(null)
  const combatManagerRef = useRef(null)

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
  const isLevelUp = useGameStore(state => state.isLevelUp)
  const level = useGameStore(state => state.level)
  const exp = useGameStore(state => state.exp)
  const expMax = useGameStore(state => state.expMax)

  /* ================= 初始化 ================= */

  useEffect(() => {
    // 初始化关卡
    const stage = STAGES[0]
    waveControllerRef.current = createWaveController(
      stage,
      enemiesRef.current
    )

    // 初始化战斗管理器
    combatManagerRef.current = new CombatManager()
    combatManagerRef.current.initialize({
      player: playerRef.current,
      bullets: bulletsRef.current,
      enemies: enemiesRef.current
    })

    // 添加测试技能（可选）
    // combatManagerRef.current.addSkill('laptop')
    // combatManagerRef.current.addSkill('takeout')

    return () => {
      combatManagerRef.current?.cleanup()
    }
  }, [])

  /* ================= 处理升级 ================= */
  // 升级后会显示技能选择界面，由 SkillSelectModal 组件处理

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
    const combatManager = combatManagerRef.current

    /* ---- 刷怪 ---- */
    waveControllerRef.current?.update(dt)

    /* ---- 战斗系统更新 ---- */
    if (combatManager) {
      combatManager.update(dt, {
        player,
        bullets,
        enemies
      })
    }

    /* ---- 子弹更新 ---- */
    bullets.forEach(b => {
      // 普通移动
      if (!b.orbit) {
        b.x += b.vx * dt
        b.y += b.vy * dt
      } else {
        // 轨道运动
        b.orbit.angle += b.orbit.speed * dt
        b.x = b.orbit.centerX + Math.cos(b.orbit.angle) * b.orbit.radius
        b.y = b.orbit.centerY + Math.sin(b.orbit.angle) * b.orbit.radius
      }

      // 边界检测
      if (b.y < -20 || b.y > HEIGHT + 20 || b.x < -20 || b.x > WIDTH + 20) {
        b.alive = false
      }
    })

    /* ---- 敌人更新 ---- */
    const enemySpeedModifier = combatManager?.getEnemySpeedModifier() || 1.0
    
    enemies.forEach(e => {
      e.y += e.speed * dt * enemySpeedModifier
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
          // 使用战斗管理器处理击中
          if (combatManager) {
            combatManager.handleBulletHit(b, e)
          } else {
            e.hp -= b.damage
            b.alive = false
          }

          if (e.hp <= 0) {
            e.alive = false
            useGameStore.getState().gainExp(20)
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
    const combatManager = combatManagerRef.current

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
    bullets.forEach(b => {
      ctx.fillStyle = b.color || '#fff'
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
    ctx.font = '14px Arial'
    
    // HP
    ctx.fillText(`HP: ${hpRef.current}`, 10, 20)
    
    // 等级
    ctx.fillText(`Level: ${level}`, 10, 40)
    
    // 经验条背景
    ctx.fillStyle = '#333'
    ctx.fillRect(10, 50, 200, 10)
    
    // 经验条
    ctx.fillStyle = '#0f0'
    const expPercent = exp / expMax
    ctx.fillRect(10, 50, 200 * expPercent, 10)
    
    // 经验文本
    ctx.fillStyle = '#fff'
    ctx.font = '10px Arial'
    ctx.fillText(`${exp}/${expMax}`, 15, 58)
    
    // 显示激活的技能
    ctx.font = '14px Arial'
    if (combatManager) {
      const activeSkills = combatManager.skillManager.getActiveSkills()
      ctx.fillText(`Active Skills: ${activeSkills.length}`, 10, 80)

      // 显示Buff数量
      const buffs = combatManager.buffManager.getActiveBuffs()
      ctx.fillText(`Buffs: ${buffs.length}`, 10, 100)
    }
    
    // 升级提示
    if (isLevelUp) {
      ctx.fillStyle = '#ff0'
      ctx.font = 'bold 24px Arial'
      ctx.fillText('LEVEL UP!', WIDTH / 2 - 60, HEIGHT / 2)
      ctx.font = '16px Arial'
      ctx.fillText('自动继续游戏...', WIDTH / 2 - 70, HEIGHT / 2 + 30)
    }
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

  /* ================= 技能快捷键（测试用） ================= */

  useEffect(() => {
    function handleKeyPress(e) {
      const combatManager = combatManagerRef.current
      if (!combatManager) return

      switch (e.key) {
        case '1':
          combatManager.addSkill('laptop')
          console.log('Added skill: laptop')
          break
        case '2':
          combatManager.addSkill('takeout')
          console.log('Added skill: takeout')
          break
        case '3':
          combatManager.addSkill('fish_swap')
          console.log('Added skill: fish_swap')
          break
        case '4':
          combatManager.addSkill('electric_car')
          console.log('Added skill: electric_car')
          break
        case '5':
          combatManager.addSkill('ai_tool')
          console.log('Added skill: ai_tool')
          break
        case '6':
          combatManager.addSkill('exam_mode')
          console.log('Added skill: exam_mode')
          break
        case '7':
          combatManager.addSkill('six_arts')
          console.log('Added skill: six_arts')
          break
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
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
