# 战斗系统集成示例

## 最小集成示例

以下是将战斗系统集成到现有游戏中的最小示例：

### 1. 导入必要模块

```javascript
import { CombatManager } from '../game/combat/combatManager'
```

### 2. 初始化战斗管理器

```javascript
// 在组件中创建ref
const combatManagerRef = useRef(null)

// 在useEffect中初始化
useEffect(() => {
  combatManagerRef.current = new CombatManager()
  combatManagerRef.current.initialize({
    player: playerRef.current,
    bullets: bulletsRef.current,
    enemies: enemiesRef.current
  })

  return () => {
    combatManagerRef.current?.cleanup()
  }
}, [])
```

### 3. 在游戏循环中更新

```javascript
function update(dt) {
  // ... 其他更新逻辑
  
  // 更新战斗系统
  if (combatManagerRef.current) {
    combatManagerRef.current.update(dt, {
      player: playerRef.current,
      bullets: bulletsRef.current,
      enemies: enemiesRef.current
    })
  }
  
  // ... 其他更新逻辑
}
```

### 4. 处理碰撞

```javascript
// 在碰撞检测中使用战斗管理器
bullets.forEach(b => {
  if (!b.alive) return
  enemies.forEach(e => {
    if (!e.alive) return
    
    const dx = b.x - e.x
    const dy = b.y - e.y
    const dist = Math.hypot(dx, dy)
    
    if (dist < b.size + e.size * e.scale) {
      // 使用战斗管理器处理击中
      combatManagerRef.current.handleBulletHit(b, e)
      
      if (e.hp <= 0) {
        e.alive = false
        gainExp(20)
      }
    }
  })
})
```

### 5. 添加技能（示例）

```javascript
// 在升级时添加技能
function onLevelUp() {
  const combatManager = combatManagerRef.current
  
  // 添加技能
  combatManager.addSkill('laptop')
  
  // 或添加强化
  combatManager.addUpgrade('laptop', 'laptop_solid_state')
}
```

## 与现有系统的对比

### 旧系统（GameCanvas.jsx）

```javascript
// 手动管理射击
fireTimerRef.current += dt
if (fireTimerRef.current >= interval) {
  fireBullets({ ... })
  fireTimerRef.current = 0
}

// 手动处理碰撞
handleBulletHit(b, e, store)
```

### 新系统（GameCanvasNew.jsx）

```javascript
// 自动管理射击和技能
combatManager.update(dt, { player, bullets, enemies })

// 统一处理碰撞
combatManager.handleBulletHit(b, e)
```

## 优势

1. **统一管理**：所有战斗逻辑集中在CombatManager中
2. **自动化**：技能冷却、Buff更新、自动射击全部自动处理
3. **易扩展**：添加新技能只需定义和实现，无需修改主循环
4. **易测试**：各模块独立，可单独测试

## 迁移步骤

### 步骤1：保留旧系统作为备份

不要删除 `GameCanvas.jsx`，创建新文件 `GameCanvasNew.jsx`

### 步骤2：逐步迁移功能

1. 先迁移基础射击
2. 再添加技能系统
3. 最后集成Buff和强化

### 步骤3：对比测试

同时运行新旧系统，对比效果，确保功能一致

### 步骤4：完全切换

确认新系统稳定后，将 `Game.jsx` 中的导入切换到新系统

## 注意事项

1. **性能**：新系统增加了一些抽象层，但对性能影响很小
2. **兼容性**：新系统完全兼容现有的弹幕和敌人系统
3. **扩展性**：设计时考虑了未来扩展，可以轻松添加新功能

## 示例：完整的更新函数

```javascript
function update(dt) {
  const player = playerRef.current
  const bullets = bulletsRef.current
  const enemies = enemiesRef.current
  const combatManager = combatManagerRef.current

  // 1. 刷怪
  waveControllerRef.current?.update(dt)

  // 2. 战斗系统更新（包含自动射击、技能触发、Buff更新）
  if (combatManager) {
    combatManager.update(dt, { player, bullets, enemies })
  }

  // 3. 子弹更新
  bullets.forEach(b => {
    if (!b.orbit) {
      b.x += b.vx * dt
      b.y += b.vy * dt
    } else {
      // 轨道运动
      b.orbit.angle += b.orbit.speed * dt
      b.x = b.orbit.centerX + Math.cos(b.orbit.angle) * b.orbit.radius
      b.y = b.orbit.centerY + Math.sin(b.orbit.angle) * b.orbit.radius
    }
    
    if (b.y < -20 || b.y > HEIGHT + 20) {
      b.alive = false
    }
  })

  // 4. 敌人更新（应用减速效果）
  const enemySpeedModifier = combatManager?.getEnemySpeedModifier() || 1.0
  enemies.forEach(e => {
    e.y += e.speed * dt * enemySpeedModifier
    e.scale = 0.6 + e.y / HEIGHT

    if (e.y >= DEFENSE_LINE) {
      hpRef.current -= 1
      e.alive = false
    }
  })

  // 5. 碰撞检测
  bullets.forEach(b => {
    if (!b.alive) return
    enemies.forEach(e => {
      if (!e.alive) return

      const dx = b.x - e.x
      const dy = b.y - e.y
      const dist = Math.hypot(dx, dy)

      if (dist < b.size + e.size * e.scale) {
        if (combatManager) {
          combatManager.handleBulletHit(b, e)
        } else {
          e.hp -= b.damage
          b.alive = false
        }

        if (e.hp <= 0) {
          e.alive = false
          gainExp(20)
        }
      }
    })
  })

  // 6. 清理死亡对象
  cleanArray(bullets)
  cleanArray(enemies)
}
```

这个示例展示了如何在保持原有逻辑的同时，无缝集成新的战斗系统。
