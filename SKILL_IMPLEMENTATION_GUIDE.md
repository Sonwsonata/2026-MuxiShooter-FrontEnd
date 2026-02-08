# 技能实现详细讲解

本文档详细讲解每个技能的实现原理、代码逻辑和效果机制。

---

## 目录

1. [技能系统架构](#技能系统架构)
2. [技能执行流程](#技能执行流程)
3. [各技能详细讲解](#各技能详细讲解)
4. [Buff系统](#buff系统)
5. [伤害计算](#伤害计算)
6. [弹幕系统](#弹幕系统)

---

## 技能系统架构

### 核心组件

```
SkillManager (技能管理器)
    ├── SkillExecutor (技能执行器)
    ├── BuffManager (Buff管理器)
    └── CombatManager (战斗管理器)
```

### 数据流

```
玩家按键 → SkillManager.tryActivateSkill()
    ↓
检查冷却 → 如果就绪
    ↓
SkillExecutor.execute() → 执行技能逻辑
    ↓
BuffManager.addBuff() / CombatManager.createBullets()
    ↓
游戏循环更新 → 应用效果
```

---

## 技能执行流程

### 1. 技能触发

```javascript
// skillManager.js
tryActivateSkill(skillId) {
  // 检查技能是否存在
  const skill = this.skills.get(skillId)
  if (!skill) return false
  
  // 检查冷却
  if (skill.currentCooldown > 0) return false
  
  // 执行技能
  this.executor.execute(skillId, skill.effect)
  
  // 设置冷却
  skill.currentCooldown = skill.cooldown
  
  return true
}
```

### 2. 冷却更新

```javascript
// 每帧更新
update(deltaTime) {
  for (const [skillId, skill] of this.skills) {
    if (skill.currentCooldown > 0) {
      skill.currentCooldown -= deltaTime
      if (skill.currentCooldown < 0) {
        skill.currentCooldown = 0
      }
    }
  }
}
```

---

## 各技能详细讲解

### 1. 笔记本电脑 (laptop)

**基础效果**：向前发射多排多列弹幕

#### 实现原理

```javascript
// skillExecutor.js
executeLaptop(effect) {
  const { bulletCount = 3, rows = 1, damageMultiplier = 2.5, pierce = 0 } = effect
  
  // 使用直线发射模式
  this.ctx.combatManager.createBullets({
    pattern: 'line',
    count: bulletCount,
    rows: rows,
    damage: 10 * damageMultiplier,
    pierce: pierce
  })
}
```

#### 弹幕发射逻辑

```javascript
// bulletPatterns.js - 直线模式
line(player, count, rows) {
  const bullets = []
  const spacing = 20 // 列间距
  const rowSpacing = 30 // 行间距
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < count; col++) {
      const offsetX = (col - (count - 1) / 2) * spacing
      const offsetY = -row * rowSpacing
      
      bullets.push({
        x: player.x + offsetX,
        y: player.y + offsetY,
        vx: 0,
        vy: -300, // 向上飞行
        damage: 10,
        size: 4
      })
    }
  }
  
  return bullets
}
```

#### 强化效果

| 强化名称 | 效果 | 实现 |
|---------|------|------|
| 磁盘清理 | 伤害+20% | `damageMultiplier += 0.2` |
| 固态硬盘 | 穿透+1 | `pierce += 1` |
| 低耗模式 | 排数+2，伤害-20% | `rows += 2; damageMultiplier -= 0.2` |

---

### 2. 外卖 (takeout)

**基础效果**：在玩家两侧持续发射弹幕

#### 实现原理

```javascript
executeTakeout(effect) {
  const { duration = 5, shots = 5, damageMultiplier = 1.5 } = effect
  
  // 创建持续发射的定时器
  let shotCount = 0
  const interval = duration / shots // 每次发射的间隔
  
  const timer = setInterval(() => {
    if (shotCount >= shots) {
      clearInterval(timer)
      return
    }
    
    // 使用两侧发射模式
    this.ctx.combatManager.createBullets({
      pattern: 'sides',
      count: 2,
      damage: 8 * damageMultiplier
    })
    
    shotCount++
  }, interval * 1000)
}
```

#### 两侧发射逻辑

```javascript
// bulletPatterns.js - 两侧模式
sides(player, count) {
  const bullets = []
  const sideOffset = 40 // 两侧距离
  
  // 左侧
  bullets.push({
    x: player.x - sideOffset,
    y: player.y,
    vx: 0,
    vy: -300,
    damage: 8,
    size: 4
  })
  
  // 右侧
  bullets.push({
    x: player.x + sideOffset,
    y: player.y,
    vx: 0,
    vy: -300,
    damage: 8,
    size: 4
  })
  
  return bullets
}
```

#### 强化效果

| 强化名称 | 效果 | 实现 |
|---------|------|------|
| 外卖加速 | 释放次数+3 | `shots += 3` |
| 双倍套餐 | 伤害+30% | `damageMultiplier += 0.3` |
| 持久配送 | 持续时间+2秒 | `duration += 2` |

---

### 3. 摸鱼宝典 (fishing)

**基础效果**：横向扇形发射多发弹幕

#### 实现原理

```javascript
executeFishing(effect) {
  const { bulletCount = 5, damageMultiplier = 2.0, critRate = 0 } = effect
  
  // 使用横向扇形模式
  this.ctx.combatManager.createBullets({
    pattern: 'fan_horizontal',
    count: bulletCount,
    damage: 12 * damageMultiplier,
    critRate: critRate
  })
}
```

#### 横向扇形逻辑

```javascript
// bulletPatterns.js - 横向扇形
fan_horizontal(player, count) {
  const bullets = []
  const angleSpread = 60 // 扇形角度（度）
  const angleStep = angleSpread / (count - 1)
  const startAngle = -angleSpread / 2
  
  for (let i = 0; i < count; i++) {
    const angle = (startAngle + angleStep * i) * Math.PI / 180
    const speed = 300
    
    bullets.push({
      x: player.x,
      y: player.y,
      vx: speed * Math.sin(angle),
      vy: -speed * Math.cos(angle),
      damage: 12,
      size: 4
    })
  }
  
  return bullets
}
```

#### 强化效果

| 强化名称 | 效果 | 实现 |
|---------|------|------|
| 摸鱼大师 | 弹幕数+3 | `bulletCount += 3` |
| 暴击摸鱼 | 暴击率+20% | `critRate += 0.2` |
| 深度摸鱼 | 伤害+25% | `damageMultiplier += 0.25` |

---

### 4. 电动车 (ebike)

**基础效果**：提升攻速持续一段时间

#### 实现原理

```javascript
executeEbike(effect) {
  const { duration = 3, attackSpeed = 1.0 } = effect
  
  // 添加攻速Buff
  this.ctx.buffManager.addBuff({
    type: 'attack_speed',
    value: attackSpeed,
    duration: duration
  })
}
```

#### Buff应用

```javascript
// buffManager.js
addBuff(buff) {
  this.buffs.push({
    ...buff,
    startTime: Date.now(),
    endTime: Date.now() + buff.duration * 1000
  })
}

// 获取当前攻速加成
getAttackSpeedBonus() {
  let bonus = 0
  
  for (const buff of this.buffs) {
    if (buff.type === 'attack_speed' && this.isActive(buff)) {
      bonus += buff.value
    }
  }
  
  return bonus
}
```

#### 在战斗中应用

```javascript
// combatManager.js
update(deltaTime) {
  // 获取攻速加成
  const attackSpeedBonus = this.buffManager.getAttackSpeedBonus()
  const actualFireRate = this.baseFireRate * (1 + attackSpeedBonus)
  
  // 更新射击计时器
  this.fireTimer += deltaTime * (1 + attackSpeedBonus)
  
  if (this.fireTimer >= 1 / actualFireRate) {
    this.fire()
    this.fireTimer = 0
  }
}
```

#### 强化效果

| 强化名称 | 效果 | 实现 |
|---------|------|------|
| 电池升级 | 持续时间+2秒 | `duration += 2` |
| 超速模式 | 攻速+50% | `attackSpeed += 0.5` |
| 移速联动 | 额外移速+30% | 添加移速Buff |

---

### 5. AI工具 (ai_tool)

**基础效果**：生成镜像，镜像会同步发射弹幕

#### 实现原理

```javascript
executeAITool(effect) {
  const { duration = 5, mirrorCount = 1 } = effect
  
  // 添加镜像Buff
  this.ctx.buffManager.addBuff({
    type: 'mirror',
    value: mirrorCount,
    duration: duration
  })
}
```

#### 镜像弹幕创建

```javascript
// combatManager.js
createBullets(config) {
  const bullets = []
  
  // 创建主弹幕
  const mainBullets = this.bulletPatterns[config.pattern](
    this.ctx.player,
    config.count
  )
  bullets.push(...mainBullets)
  
  // 获取镜像数量
  const mirrorCount = this.buffManager.getMirrorCount()
  
  if (mirrorCount > 0) {
    // 为每个镜像创建弹幕
    for (let i = 0; i < mirrorCount; i++) {
      const side = i % 2 === 0 ? 1 : -1
      const offsetX = (i + 1) * 50 * side
      
      // 创建镜像弹幕（位置偏移）
      const mirrorBullets = this.bulletPatterns[config.pattern](
        {
          ...this.ctx.player,
          x: this.ctx.player.x + offsetX
        },
        config.count
      )
      
      // 标记为镜像弹幕（用于渲染不同颜色）
      mirrorBullets.forEach(b => {
        b.isMirror = true
        bullets.push(b)
      })
    }
  }
  
  return bullets
}
```

#### 镜像渲染

```javascript
// GameCanvasNew.jsx
// 渲染镜像玩家
if (combatManager) {
  const mirrorCount = combatManager.buffManager.getMirrorCount()
  
  for (let i = 0; i < mirrorCount; i++) {
    const side = i % 2 === 0 ? 1 : -1
    const offsetX = (i + 1) * 50 * side
    
    // 半透明蓝色方块
    ctx.globalAlpha = 0.4
    ctx.fillStyle = '#4af'
    ctx.fillRect(
      player.x + offsetX - player.size,
      player.y - player.size,
      player.size * 2,
      player.size * 2
    )
    
    // 标记点
    ctx.fillStyle = '#0ff'
    ctx.beginPath()
    ctx.arc(player.x + offsetX, player.y - player.size - 10, 3, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.globalAlpha = 1.0
  }
}
```

#### 强化效果

| 强化名称 | 效果 | 实现 |
|---------|------|------|
| AI升级 | 镜像数+1 | `mirrorCount += 1` |
| 持久AI | 持续时间+3秒 | `duration += 3` |
| 智能优化 | 镜像伤害+20% | 镜像弹幕伤害加成 |

---

### 6. 期末周模式 (exam_mode)

**基础效果**：必定暴击持续一段时间

#### 实现原理

```javascript
executeExamMode(effect) {
  const { duration = 5, critDamage = 0 } = effect
  
  // 添加必定暴击Buff
  this.ctx.buffManager.addBuff({
    type: 'guaranteed_crit',
    value: 1,
    duration: duration
  })
  
  // 如果有额外暴击伤害
  if (critDamage > 0) {
    this.ctx.buffManager.addBuff({
      type: 'crit_damage',
      value: critDamage,
      duration: duration
    })
  }
}
```

#### 暴击判定

```javascript
// damageSystem.js
calculateDamage(baseDamage, attacker, target, buffManager) {
  let damage = baseDamage
  
  // 应用攻击力
  damage += attacker.attack || 0
  
  // 应用伤害倍率
  const damageBonus = buffManager.getDamageBonus()
  damage *= (1 + damageBonus)
  
  // 暴击判定
  let isCrit = false
  
  // 检查必定暴击Buff
  if (buffManager.hasGuaranteedCrit()) {
    isCrit = true
  } else {
    // 正常暴击判定
    const critRate = (attacker.critRate || 0.05) + buffManager.getCritRateBonus()
    isCrit = Math.random() < critRate
  }
  
  // 应用暴击伤害
  if (isCrit) {
    const critDamage = (attacker.critDamage || 1.5) + buffManager.getCritDamageBonus()
    damage *= critDamage
  }
  
  return { damage, isCrit }
}
```

#### 强化效果

| 强化名称 | 效果 | 实现 |
|---------|------|------|
| 考前冲刺 | 持续时间+3秒 | `duration += 3` |
| 超常发挥 | 暴击伤害+50% | `critDamage += 0.5` |
| 全科满分 | 额外伤害+30% | 添加伤害Buff |

---

### 7. 君子六艺 (six_arts)

**基础效果**：随机方向发射大量弹幕

#### 实现原理

```javascript
executeSixArts(effect) {
  const { bulletCount = 25, damageMultiplier = 1.2 } = effect
  
  // 使用随机发射模式
  this.ctx.combatManager.createBullets({
    pattern: 'random',
    count: bulletCount,
    damage: 6 * damageMultiplier
  })
}
```

#### 随机发射逻辑

```javascript
// bulletPatterns.js - 随机模式
random(player, count) {
  const bullets = []
  
  for (let i = 0; i < count; i++) {
    // 随机角度（-90度到90度，即向前的半圆）
    const angle = (Math.random() * 180 - 90) * Math.PI / 180
    const speed = 250 + Math.random() * 100 // 随机速度
    
    bullets.push({
      x: player.x,
      y: player.y,
      vx: speed * Math.sin(angle),
      vy: -speed * Math.cos(angle),
      damage: 6,
      size: 3
    })
  }
  
  return bullets
}
```

#### 强化效果

| 强化名称 | 效果 | 实现 |
|---------|------|------|
| 六艺精通 | 弹幕数+10 | `bulletCount += 10` |
| 艺术爆发 | 伤害+30% | `damageMultiplier += 0.3` |
| 文武双全 | 弹幕数+5，伤害+15% | 两者都加 |

---

## Buff系统

### Buff类型

```javascript
const BUFF_TYPES = {
  // 攻击相关
  'attack_speed': '攻速加成',
  'damage': '伤害加成',
  'crit_rate': '暴击率加成',
  'crit_damage': '暴击伤害加成',
  'guaranteed_crit': '必定暴击',
  
  // 移动相关
  'move_speed': '移速加成',
  
  // 特殊效果
  'mirror': '镜像',
  'slow_enemies': '敌人减速'
}
```

### Buff结构

```javascript
{
  type: 'attack_speed',    // Buff类型
  value: 1.0,              // 效果值（100%攻速加成）
  duration: 5,             // 持续时间（秒）
  startTime: 1234567890,   // 开始时间戳
  endTime: 1234567895      // 结束时间戳
}
```

### Buff管理

```javascript
class BuffManager {
  constructor() {
    this.buffs = []
  }
  
  // 添加Buff
  addBuff(buff) {
    this.buffs.push({
      ...buff,
      startTime: Date.now(),
      endTime: Date.now() + buff.duration * 1000
    })
  }
  
  // 更新Buff（移除过期的）
  update() {
    const now = Date.now()
    this.buffs = this.buffs.filter(buff => buff.endTime > now)
  }
  
  // 检查Buff是否激活
  isActive(buff) {
    const now = Date.now()
    return buff.startTime <= now && now < buff.endTime
  }
  
  // 获取特定类型的Buff总和
  getBuffValue(type) {
    let total = 0
    for (const buff of this.buffs) {
      if (buff.type === type && this.isActive(buff)) {
        total += buff.value
      }
    }
    return total
  }
  
  // 检查是否有特定Buff
  hasBuff(type) {
    return this.buffs.some(buff => 
      buff.type === type && this.isActive(buff)
    )
  }
}
```

---

## 伤害计算

### 完整伤害公式

```
最终伤害 = (基础伤害 + 攻击力) × (1 + 伤害加成) × 暴击倍率
```

### 实现代码

```javascript
function calculateDamage(baseDamage, attacker, target, buffManager) {
  // 1. 基础伤害 + 攻击力
  let damage = baseDamage + (attacker.attack || 0)
  
  // 2. 应用伤害加成
  const damageBonus = buffManager.getBuffValue('damage')
  damage *= (1 + damageBonus)
  
  // 3. 暴击判定
  let isCrit = false
  
  if (buffManager.hasBuff('guaranteed_crit')) {
    // 必定暴击
    isCrit = true
  } else {
    // 计算暴击率
    const baseCritRate = attacker.critRate || 0.05
    const critRateBonus = buffManager.getBuffValue('crit_rate')
    const finalCritRate = baseCritRate + critRateBonus
    
    // 暴击判定
    isCrit = Math.random() < finalCritRate
  }
  
  // 4. 应用暴击伤害
  if (isCrit) {
    const baseCritDamage = attacker.critDamage || 1.5
    const critDamageBonus = buffManager.getBuffValue('crit_damage')
    const finalCritDamage = baseCritDamage + critDamageBonus
    
    damage *= finalCritDamage
  }
  
  return {
    damage: Math.floor(damage),
    isCrit
  }
}
```

### 示例计算

**场景**：笔记本电脑技能 + 期末周模式

```
基础伤害 = 10
技能倍率 = 2.5
玩家攻击力 = 5
伤害加成 = 0（无Buff）
必定暴击 = true
暴击伤害 = 1.5

计算过程：
1. 技能伤害 = 10 × 2.5 = 25
2. 加上攻击力 = 25 + 5 = 30
3. 伤害加成 = 30 × (1 + 0) = 30
4. 暴击 = 30 × 1.5 = 45

最终伤害 = 45
```

---

## 弹幕系统

### 弹幕结构

```javascript
{
  x: 180,           // X坐标
  y: 500,           // Y坐标
  vx: 0,            // X方向速度
  vy: -300,         // Y方向速度（负数=向上）
  damage: 10,       // 伤害
  size: 4,          // 大小
  pierce: 0,        // 穿透次数
  isCrit: false,    // 是否暴击
  isMirror: false   // 是否镜像弹幕
}
```

### 弹幕更新

```javascript
// combatManager.js
updateBullets(deltaTime) {
  for (const bullet of this.ctx.bullets) {
    // 更新位置
    bullet.x += bullet.vx * deltaTime
    bullet.y += bullet.vy * deltaTime
    
    // 移除屏幕外的弹幕
    if (bullet.y < -10 || bullet.y > 650 || 
        bullet.x < -10 || bullet.x > 370) {
      bullet.alive = false
    }
  }
  
  // 移除死亡的弹幕
  this.ctx.bullets = this.ctx.bullets.filter(b => b.alive !== false)
}
```

### 弹幕渲染

```javascript
// GameCanvasNew.jsx
for (const bullet of bullets) {
  // 根据类型选择颜色
  if (bullet.isMirror) {
    // 镜像弹幕
    ctx.fillStyle = bullet.isCrit ? '#f0f' : '#4af'
  } else {
    // 主弹幕
    ctx.fillStyle = bullet.isCrit ? '#ff0' : '#fff'
  }
  
  ctx.fillRect(
    bullet.x - bullet.size / 2,
    bullet.y - bullet.size / 2,
    bullet.size,
    bullet.size
  )
}
```

### 碰撞检测

```javascript
// combatManager.js
checkCollisions() {
  for (const bullet of this.ctx.bullets) {
    for (const enemy of this.ctx.enemies) {
      if (!enemy.alive) continue
      
      // 简单矩形碰撞
      const dx = bullet.x - enemy.x
      const dy = bullet.y - enemy.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < bullet.size + enemy.size) {
        // 计算伤害
        const { damage, isCrit } = this.damageSystem.calculateDamage(
          bullet.damage,
          this.ctx.player,
          enemy,
          this.buffManager
        )
        
        // 应用伤害
        enemy.hp -= damage
        bullet.isCrit = isCrit
        
        // 检查穿透
        if (bullet.pierce > 0) {
          bullet.pierce--
        } else {
          bullet.alive = false
        }
        
        // 检查敌人死亡
        if (enemy.hp <= 0) {
          enemy.alive = false
          // 掉落经验
          this.ctx.gainExp(20)
        }
        
        break // 一个弹幕只能击中一个敌人（除非有穿透）
      }
    }
  }
}
```

---

## 总结

### 技能实现要点

1. **模块化设计**
   - 每个技能独立的执行函数
   - 通过配置驱动效果

2. **Buff系统**
   - 统一的Buff管理
   - 时间控制和过期清理

3. **弹幕系统**
   - 多种发射模式
   - 灵活的参数配置

4. **伤害计算**
   - 清晰的计算公式
   - Buff效果叠加

### 扩展建议

1. **添加新技能**
   - 在 `skillDefinitions.js` 定义
   - 在 `skillExecutor.js` 实现
   - 在 `bulletPatterns.js` 添加新模式（如需要）

2. **添加新Buff**
   - 在 `buffManager.js` 添加类型
   - 在相应系统中应用效果

3. **优化性能**
   - 对象池（避免频繁创建销毁）
   - 空间分区（优化碰撞检测）
   - 离屏剔除（不渲染屏幕外的对象）

---

需要更详细的讲解或有其他问题，请随时提问！
