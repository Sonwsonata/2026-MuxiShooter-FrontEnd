// src/game/inputController.js
//控制游戏输入状态的模块
/**
 * 统一输入状态
 * GameCanvas / Engine 只读取这里
 */
export const inputState = {
  moveX: 0, // -1 ~ 1
  moveY: 0, // -1 ~ 1（你之后会限制幅度）
  isFiring: false
}

/* ================= 内部状态 ================= */

let isPointerDown = false
let startX = 0
let startY = 0

// 灵敏度（可调）
const MOVE_SENSITIVITY_X = 80
const MOVE_SENSITIVITY_Y = 120

// Y 方向限制（前后只能小幅移动）
const MAX_MOVE_Y = 0.4

/* ================= 工具函数 ================= */

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

/* ================= 输入处理 ================= */

function onPointerDown(x, y) {
  isPointerDown = true
  startX = x
  startY = y
  inputState.isFiring = true
}

function onPointerMove(x, y) {
  if (!isPointerDown) return

  const dx = x - startX
  const dy = y - startY

  inputState.moveX = clamp(dx / MOVE_SENSITIVITY_X, -1, 1)
  inputState.moveY = clamp(dy / MOVE_SENSITIVITY_Y, -MAX_MOVE_Y, MAX_MOVE_Y)
}

function onPointerUp() {
  isPointerDown = false
  inputState.moveX = 0
  inputState.moveY = 0
  inputState.isFiring = false
}

/* ================= 绑定到 Canvas ================= */

/**
 * 绑定输入事件
 * @param {HTMLCanvasElement} canvas
 */
export function bindInput(canvas) {
  /* ===== 鼠标 ===== */

  canvas.addEventListener('mousedown', e => {
    onPointerDown(e.clientX, e.clientY)
  })

  canvas.addEventListener('mousemove', e => {
    onPointerMove(e.clientX, e.clientY)
  })

  window.addEventListener('mouseup', () => {
    onPointerUp()
  })

  /* ===== 触控 ===== */

  canvas.addEventListener(
    'touchstart',
    e => {
      const t = e.touches[0]
      onPointerDown(t.clientX, t.clientY)
    },
    { passive: false }
  )

  canvas.addEventListener(
    'touchmove',
    e => {
      const t = e.touches[0]
      onPointerMove(t.clientX, t.clientY)
    },
    { passive: false }
  )

  canvas.addEventListener(
    'touchend',
    () => {
      onPointerUp()
    },
    { passive: false }
  )
}
