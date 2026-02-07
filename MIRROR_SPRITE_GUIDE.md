# 镜像素材替换指南

## 当前实现

目前镜像使用Canvas绘制的简单方块，位置和效果如下：

### 视觉效果

```
        ●  ← 青色标记点
      ┌───┐
      │   │ ← 半透明蓝色方块（镜像）
      └───┘
        ↑ 蓝色弹幕


  ┌───┐
  │ █ │ ← 玩家（不透明蓝色）
  └───┘
    ↑ 白色弹幕
```

### 代码位置

文件：`src/game/canvas/GameCanvasNew.jsx`

行号：205-236

```javascript
/* 镜像 */
if (combatManager) {
  const mirrorCount = combatManager.buffManager.getMirrorCount()
  if (mirrorCount > 0) {
    // 设置半透明
    ctx.globalAlpha = 0.4
    
    for (let i = 0; i < mirrorCount; i++) {
      // 计算镜像位置
      const side = i % 2 === 0 ? 1 : -1
      const offsetX = (i + 1) * 50 * side
      
      // 绘制镜像玩家
      ctx.fillStyle = '#4af'
      ctx.fillRect(
        player.x + offsetX - player.size,
        player.y - player.size,
        player.size * 2,
        player.size * 2
      )
      
      // 绘制镜像标记（小圆点）
      ctx.fillStyle = '#0ff'
      ctx.beginPath()
      ctx.arc(player.x + offsetX, player.y - player.size - 8, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // 恢复不透明度
    ctx.globalAlpha = 1.0
  }
}
```

---

## 如何替换为图片素材

### 方案1：使用Image对象（推荐）

#### 1. 准备素材

将镜像图片放到 `public/assets/` 目录下，例如：
- `public/assets/player.png` - 玩家图片
- `public/assets/player_mirror.png` - 镜像图片（可选，如果和玩家不同）

#### 2. 加载图片

在 `GameCanvasNew.jsx` 的初始化部分添加：

```javascript
const playerImageRef = useRef(null)
const mirrorImageRef = useRef(null)

useEffect(() => {
  // 加载玩家图片
  const playerImg = new Image()
  playerImg.src = '/assets/player.png'
  playerImg.onload = () => {
    playerImageRef.current = playerImg
  }
  
  // 加载镜像图片
  const mirrorImg = new Image()
  mirrorImg.src = '/assets/player_mirror.png'
  mirrorImg.onload = () => {
    mirrorImageRef.current = mirrorImg
  }
}, [])
```

#### 3. 修改渲染代码

替换玩家绘制部分：

```javascript
/* 玩家 */
if (playerImageRef.current) {
  // 使用图片
  ctx.drawImage(
    playerImageRef.current,
    player.x - player.size,
    player.y - player.size,
    player.size * 2,
    player.size * 2
  )
} else {
  // 回退到方块
  ctx.fillStyle = '#4af'
  ctx.fillRect(
    player.x - player.size,
    player.y - player.size,
    player.size * 2,
    player.size * 2
  )
}
```

替换镜像绘制部分：

```javascript
/* 镜像 */
if (combatManager) {
  const mirrorCount = combatManager.buffManager.getMirrorCount()
  if (mirrorCount > 0) {
    ctx.globalAlpha = 0.4
    
    for (let i = 0; i < mirrorCount; i++) {
      const side = i % 2 === 0 ? 1 : -1
      const offsetX = (i + 1) * 50 * side
      
      if (mirrorImageRef.current) {
        // 使用图片
        ctx.drawImage(
          mirrorImageRef.current,
          player.x + offsetX - player.size,
          player.y - player.size,
          player.size * 2,
          player.size * 2
        )
      } else {
        // 回退到方块
        ctx.fillStyle = '#4af'
        ctx.fillRect(
          player.x + offsetX - player.size,
          player.y - player.size,
          player.size * 2,
          player.size * 2
        )
      }
      
      // 标记点（可选）
      ctx.fillStyle = '#0ff'
      ctx.beginPath()
      ctx.arc(player.x + offsetX, player.y - player.size - 8, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.globalAlpha = 1.0
  }
}
```

---

### 方案2：使用Sprite Sheet（适合动画）

如果需要动画效果，可以使用精灵图：

#### 1. 准备精灵图

例如：`player_spritesheet.png`
```
[帧1][帧2][帧3][帧4]
```

#### 2. 实现帧动画

```javascript
const spriteRef = useRef({
  image: null,
  frameWidth: 32,
  frameHeight: 32,
  frameCount: 4,
  currentFrame: 0,
  frameTime: 0,
  frameInterval: 0.1 // 每帧0.1秒
})

// 在update函数中更新帧
spriteRef.current.frameTime += dt
if (spriteRef.current.frameTime >= spriteRef.current.frameInterval) {
  spriteRef.current.currentFrame = 
    (spriteRef.current.currentFrame + 1) % spriteRef.current.frameCount
  spriteRef.current.frameTime = 0
}

// 渲染时使用
const sprite = spriteRef.current
if (sprite.image) {
  ctx.drawImage(
    sprite.image,
    sprite.currentFrame * sprite.frameWidth, // 源X
    0, // 源Y
    sprite.frameWidth, // 源宽度
    sprite.frameHeight, // 源高度
    player.x - player.size, // 目标X
    player.y - player.size, // 目标Y
    player.size * 2, // 目标宽度
    player.size * 2 // 目标高度
  )
}
```

---

## 素材规格建议

### 图片尺寸

- **玩家大小**：当前是 `player.size * 2 = 32px`
- **推荐素材尺寸**：64x64px（2倍分辨率，适配高清屏）
- **最小尺寸**：32x32px
- **最大尺寸**：128x128px

### 图片格式

- **推荐**：PNG（支持透明背景）
- **备选**：WebP（更小的文件大小）
- **不推荐**：JPG（不支持透明）

### 透明度

- **玩家**：不透明（alpha = 1.0）
- **镜像**：代码中已设置40%透明度（`ctx.globalAlpha = 0.4`）
  - 如果素材本身有透明度，最终效果会叠加

---

## 镜像位置计算

镜像的位置与弹幕发射位置完全一致：

```javascript
// 1个镜像：右侧 +50px
// 2个镜像：右侧 +50px，左侧 -100px
// 3个镜像：右侧 +50px，左侧 -100px，右侧 +150px

for (let i = 0; i < mirrorCount; i++) {
  const side = i % 2 === 0 ? 1 : -1  // 交替左右
  const offsetX = (i + 1) * 50 * side
  // 镜像位置：player.x + offsetX
}
```

---

## 特效增强建议

### 1. 添加光晕效果

```javascript
// 在镜像周围绘制光晕
ctx.shadowColor = '#4af'
ctx.shadowBlur = 20
ctx.drawImage(mirrorImage, x, y, w, h)
ctx.shadowBlur = 0
```

### 2. 添加粒子效果

```javascript
// 在镜像周围生成粒子
for (let j = 0; j < 3; j++) {
  const angle = Math.random() * Math.PI * 2
  const radius = 20
  const px = player.x + offsetX + Math.cos(angle) * radius
  const py = player.y + Math.sin(angle) * radius
  
  ctx.fillStyle = 'rgba(74, 170, 255, 0.5)'
  ctx.beginPath()
  ctx.arc(px, py, 2, 0, Math.PI * 2)
  ctx.fill()
}
```

### 3. 添加闪烁效果

```javascript
// 使用正弦波实现闪烁
const time = Date.now() / 1000
const alpha = 0.3 + Math.sin(time * 5) * 0.1 // 0.2-0.4之间闪烁
ctx.globalAlpha = alpha
```

---

## 调试技巧

### 查看镜像数量

打开浏览器控制台，输入：
```javascript
// 在游戏运行时
console.log('Mirror count:', combatManagerRef.current?.buffManager.getMirrorCount())
```

### 查看镜像位置

在渲染代码中添加：
```javascript
console.log('Mirror position:', player.x + offsetX, player.y)
```

### 绘制调试框

```javascript
// 绘制镜像的碰撞框
ctx.strokeStyle = '#f00'
ctx.strokeRect(
  player.x + offsetX - player.size,
  player.y - player.size,
  player.size * 2,
  player.size * 2
)
```

---

## 性能优化

### 1. 图片预加载

确保图片在游戏开始前加载完成，避免闪烁。

### 2. 避免重复创建Image对象

使用 `useRef` 存储Image对象，不要在每帧创建。

### 3. 使用离屏Canvas

如果镜像效果复杂，可以预渲染到离屏Canvas：

```javascript
const offscreenCanvas = document.createElement('canvas')
const offscreenCtx = offscreenCanvas.getContext('2d')
// 预渲染镜像效果
// 然后在主Canvas中使用 drawImage
```

---

## 示例：完整的图片替换代码

```javascript
// 在组件顶部
const playerImageRef = useRef(null)

// 在初始化useEffect中
useEffect(() => {
  const img = new Image()
  img.src = '/assets/player.png'
  img.onload = () => {
    playerImageRef.current = img
    console.log('Player image loaded')
  }
  img.onerror = () => {
    console.error('Failed to load player image')
  }
}, [])

// 在render函数中
/* 玩家 */
const playerImg = playerImageRef.current
if (playerImg) {
  ctx.drawImage(
    playerImg,
    player.x - player.size,
    player.y - player.size,
    player.size * 2,
    player.size * 2
  )
} else {
  // 加载中显示占位符
  ctx.fillStyle = '#4af'
  ctx.fillRect(
    player.x - player.size,
    player.y - player.size,
    player.size * 2,
    player.size * 2
  )
}

/* 镜像 */
if (combatManager) {
  const mirrorCount = combatManager.buffManager.getMirrorCount()
  if (mirrorCount > 0 && playerImg) {
    ctx.globalAlpha = 0.4
    
    for (let i = 0; i < mirrorCount; i++) {
      const side = i % 2 === 0 ? 1 : -1
      const offsetX = (i + 1) * 50 * side
      
      ctx.drawImage(
        playerImg,
        player.x + offsetX - player.size,
        player.y - player.size,
        player.size * 2,
        player.size * 2
      )
    }
    
    ctx.globalAlpha = 1.0
  }
}
```

---

## 常见问题

### Q: 图片不显示？
A: 检查：
1. 图片路径是否正确
2. 图片是否加载完成（查看控制台）
3. 图片格式是否支持

### Q: 图片模糊？
A: 
1. 使用更高分辨率的素材
2. 关闭图片平滑：`ctx.imageSmoothingEnabled = false`

### Q: 性能下降？
A:
1. 优化图片大小
2. 使用离屏Canvas预渲染
3. 减少每帧的drawImage调用

---

## 后续扩展

1. **镜像动画**：添加出现/消失动画
2. **镜像特效**：添加粒子、光晕等特效
3. **镜像皮肤**：支持不同的镜像外观
4. **镜像行为**：让镜像有独立的动作（如转向）

---

需要帮助实现这些功能，随时告诉我！
