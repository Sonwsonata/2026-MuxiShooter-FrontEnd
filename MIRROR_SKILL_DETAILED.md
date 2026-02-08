# 镜像技能（AI工具）详细讲解

## 目录

1. [技能概述](#技能概述)
2. [核心原理](#核心原理)
3. [实现流程](#实现流程)
4. [代码详解](#代码详解)
5. [可视化说明](#可视化说明)
6. [强化系统](#强化系统)
7. [常见问题](#常见问题)

---

## 技能概述

### 基本信息

| 属性 | 值 |
|------|-----|
| 技能ID | `ai_tool` |
| 技能名称 | AI工具 |
| 冷却时间 | 20秒 |
| 持续时间 | 5秒 |
| 镜像数量 | 1个 |

### 效果描述

**激活后，在玩家旁边生成一个半透明的镜像，镜像会同步发射弹幕，持续5秒。**

---

## 核心原理

### 什么是镜像？

镜像是玩家的"分身"，它会：
1. **显示在玩家旁边**（左侧或右侧，距离50px）
2. **跟随玩家移动**（位置相对固定）
3. **同步发射弹幕**（玩家发射时，镜像也发射）
4. **持续一段时间**（5秒后消失）

### 工作机制

```
玩家激活技能 → 添加镜像Buff
    ↓
游戏循环中：
    ├── 渲染：绘制镜像玩家（半透明）
    └── 射击：为镜像创建弹幕
    ↓
5秒后 → Buff过期 → 镜像消失
```

---

## 实现流程

### 流程图

```
┌─────────────────┐
│ 1. 玩家按键盘5  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 2. 检查冷却时间 │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 3. 执行AI工具   │
│    技能逻辑     │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 4. 添加镜像Buff │
│    type: mirror │
│    value: 1     │
│    duration: 5s │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 5. 游戏循环更新 │
└────────┬────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────┐
│ 渲染   │ │ 射击   │
│ 镜像   │ │ 弹幕   │
└────────┘ └────────┘
    ↓         ↓
┌─────────────────┐
│ 6. 5秒后Buff过期│
└─────────────────┘
    ↓
┌─────────────────┐
│ 7. 镜像消失     │
└─────────────────┘
```

---

## 代码详解

### 第1步：技能定义

**文件**：`src/game/skill/skillDefinitions.js`

```javascript
export const SKILLS = {
  ai_tool: {
    id: 'ai_tool',
    name: 'AI工具',
    description: '生成镜像，镜像会同步发射弹幕',
    cooldown: 20,
    icon: '🤖',
    
    // 基础效果
    baseEffect: {
      duration: 5,      // 持续5秒
      mirrorCount: 1    // 1个镜像
    },
    
    // 强化选项
    upgrades: {
      bronze: [
        {
          id: 'ai_upgrade',
          name: 'AI升级',
          tier: 'bronze',
          description: '镜像数量+1',
          effect: { mirrorCount: 1 }
        }
      ],
      silver: [
        {
          id: 'persistent_ai',
          name: '持久AI',
          tier: 'silver',
          description: '持续时间+3秒',
          effect: { duration: 3 }
        }
      ],
      gold: [
        {
          id: 'smart_optimization',
          name: '智能优化',
          tier: 'gold',
          description: '镜像伤害+20%',
          effect: { mirrorDamage: 0.2 }
        }
      ]
    }
  }
}
```

---

### 第2步：技能执行

**文件**：`src/game/skill/skillExecutor.js`

```javascript
class SkillExecutor {
  // AI工具技能执行
  executeAITool(effect) {
    const { 
      duration = 5,      // 持续时间
      mirrorCount = 1    // 镜像数量
    } = effect
    
    console.log('[AI Tool] Executing, mirrorCount:', mirrorCount, 'duration:', duration)
    
    // 添加镜像Buff到Buff管理器
    this.ctx.buffManager.addBuff({
      type: 'mirror',           // Buff类型
      value: mirrorCount,       // 镜像数量
      duration: duration        // 持续时间（秒）
    })
    
    console.log('[AI Tool] Buff added, current buffs:', 
                this.ctx.buffManager.getActiveBuffs().length)
  }
}
```

**关键点**：
- 不直接创建镜像对象
- 而是添加一个 `mirror` 类型的Buff
- Buff的 `value` 就是镜像数量
- 其他系统会读取这个Buff来决定是否渲染/发射

---

### 第3步：Buff管理

**文件**：`src/game/buff/buffSystem.js`

```javascript
class BuffManager {
  constructor() {
    this.buffs = []  // Buff数组
  }
  
  // 添加Buff
  addBuff(buff) {
    const now = Date.now()
    
    this.buffs.push({
      type: buff.type,              // 'mirror'
      value: buff.value,            // 1
      duration: buff.duration,      // 5
      startTime: now,               // 当前时间戳
      endTime: now + buff.duration * 1000  // 过期时间戳
    })
  }
  
  // 更新Buff（移除过期的）
  update() {
    const now = Date.now()
    
    // 过滤掉已过期的Buff
    this.buffs = this.buffs.filter(buff => {
      return buff.endTime > now
    })
  }
  
  // 获取镜像数量
  getMirrorCount() {
    let total = 0
    const now = Date.now()
    
    for (const buff of this.buffs) {
      // 检查是否是镜像Buff且未过期
      if (buff.type === 'mirror' && 
          buff.startTime <= now && 
          now < buff.endTime) {
        total += buff.value
      }
    }
    
    return total
  }
  
  // 获取所有激活的Buff
  getActiveBuffs() {
    const now = Date.now()
    return this.buffs.filter(buff => 
      buff.startTime <= now && now < buff.endTime
    )
  }
}
```

**Buff结构示例**：
```javascript
{
  type: 'mirror',
  value: 1,
  duration: 5,
  startTime: 1234567890000,
  endTime: 1234567895000
}
```

---

### 第4步：镜像渲染

**文件**：`src/game/canvas/GameCanvasNew.jsx`

```javascript
// 在渲染函数中
function render() {
  const player = playerRef.current
  const combatManager = combatManagerRef.current
  
  // ... 其他渲染代码 ...
  
  // 渲染玩家
  ctx.fillStyle = '#4af'
  ctx.fillRect(
    player.x - player.size,
    player.y - player.size,
    player.size * 2,
    player.size * 2
  )
  
  // 渲染镜像
  if (combatManager) {
    const mirrorCount = combatManager.buffManager.getMirrorCount()
    
    if (mirrorCount > 0) {
      console.log('[Render] Drawing', mirrorCount, 'mirrors')
      
      for (let i = 0; i < mirrorCount; i++) {
        // 计算镜像位置
        const side = i % 2 === 0 ? 1 : -1  // 交替左右
        const offsetX = (i + 1) * 50 * side
        
        // 设置半透明
        ctx.globalAlpha = 0.4
        
        // 绘制镜像玩家（蓝色方块）
        ctx.fillStyle = '#4af'
        ctx.fillRect(
          player.x + offsetX - player.size,
          player.y - player.size,
          player.size * 2,
          player.size * 2
        )
        
        // 绘制镜像标记（青色小圆点）
        ctx.fillStyle = '#0ff'
        ctx.beginPath()
        ctx.arc(
          player.x + offsetX,
          player.y - player.size - 10,
          3,
          0,
          Math.PI * 2
        )
        ctx.fill()
        
        // 恢复不透明
        ctx.globalAlpha = 1.0
      }
    }
  }
}
```

**位置计算逻辑**：

```javascript
// 镜像数量 = 1
i = 0:
  side = 0 % 2 === 0 ? 1 : -1 = 1 (右侧)
  offsetX = (0 + 1) * 50 * 1 = 50
  位置 = player.x + 50

// 镜像数量 = 2
i = 0: offsetX = 50 (右侧)
i = 1: 
  side = 1 % 2 === 0 ? 1 : -1 = -1 (左侧)
  offsetX = (1 + 1) * 50 * -1 = -100
  位置 = player.x - 100

// 镜像数量 = 3
i = 0: offsetX = 50 (右侧)
i = 1: offsetX = -100 (左侧)
i = 2: offsetX = 150 (右侧)
```

---

### 第5步：镜像弹幕

**文件**：`src/game/combat/combatManager.js`

```javascript
class CombatManager {
  // 创建弹幕
  createBullets(config) {
    const bullets = []
    
    // 1. 创建主弹幕（玩家发射的）
    const mainBullets = this.bulletPatterns[config.pattern](
      this.ctx.player,
      config.count
    )
    
    // 标记为主弹幕
    mainBullets.forEach(b => {
      b.isMirror = false
      bullets.push(b)
    })
    
    // 2. 获取镜像数量
    const mirrorCount = this.buffManager.getMirrorCount()
    
    console.log('[Mirror] Creating mirror bullets, count:', mirrorCount)
    
    if (mirrorCount > 0) {
      console.log('[Mirror] Starting to create', mirrorCount, 'mirror bullets')
      
      // 3. 为每个镜像创建弹幕
      for (let i = 0; i < mirrorCount; i++) {
        // 计算镜像位置（与渲染位置一致）
        const side = i % 2 === 0 ? 1 : -1
        const offsetX = (i + 1) * 50 * side
        
        console.log('[Mirror] Creating mirror bullet', i + 1, 'at offsetX:', offsetX)
        
        // 创建镜像弹幕（位置偏移）
        const mirrorBullets = this.bulletPatterns[config.pattern](
          {
            ...this.ctx.player,
            x: this.ctx.player.x + offsetX  // 偏移X坐标
          },
          config.count
        )
        
        // 标记为镜像弹幕
        mirrorBullets.forEach(b => {
          b.isMirror = true  // 标记为镜像
          bullets.push(b)
        })
      }
      
      console.log('[Mirror] Total bullets after creation:', bullets.length)
    }
    
    // 4. 添加到游戏中
    this.ctx.bullets.push(...bullets)
    
    return bullets
  }
}
```

**关键点**：
- 主弹幕：从玩家位置发射
- 镜像弹幕：从 `player.x + offsetX` 位置发射
- 使用 `isMirror` 标记区分（用于渲染不同颜色）

---

### 第6步：弹幕渲染

**文件**：`src/game/canvas/GameCanvasNew.jsx`

```javascript
// 渲染弹幕
for (const bullet of bullets) {
  // 根据类型选择颜色
  if (bullet.isMirror) {
    // 镜像弹幕
    if (bullet.isCrit) {
      ctx.fillStyle = '#f0f'  // 紫色（暴击）
    } else {
      ctx.fillStyle = '#4af'  // 蓝色（普通）
    }
  } else {
    // 主弹幕
    if (bullet.isCrit) {
      ctx.fillStyle = '#ff0'  // 黄色（暴击）
    } else {
      ctx.fillStyle = '#fff'  // 白色（普通）
    }
  }
  
  // 绘制弹幕
  ctx.fillRect(
    bullet.x - bullet.size / 2,
    bullet.y - bullet.size / 2,
    bullet.size,
    bullet.size
  )
}
```

**颜色方案**：

| 弹幕类型 | 普通 | 暴击 |
|---------|------|------|
| 主弹幕 | 白色 #fff | 黄色 #ff0 |
| 镜像弹幕 | 蓝色 #4af | 紫色 #f0f |

---

## 可视化说明

### 镜像位置分布

#### 1个镜像

```
        ↑ 蓝色弹幕
        |
      ┌───┐
      │░░░│ ← 镜像（半透明）
      └───┘
        ●  ← 青色标记点



  ┌───┐
  │███│ ← 玩家
  └───┘
    ↑ 白色弹幕
```

**距离**：右侧 +50px

---

#### 2个镜像

```
  ┌───┐                    ┌───┐
  │░░░│ ← 镜像2            │░░░│ ← 镜像1
  └───┘                    └───┘
    ●                        ●
    ↑ 蓝色弹幕               ↑ 蓝色弹幕


            ┌───┐
            │███│ ← 玩家
            └───┘
              ↑ 白色弹幕
```

**距离**：
- 镜像1：右侧 +50px
- 镜像2：左侧 -100px

---

#### 3个镜像

```
  ┌───┐          ┌───┐                    ┌───┐
  │░░░│          │███│                    │░░░│
  └───┘          └───┘                    └───┘
    ●              ↑                        ●
    ↑         白色弹幕                      ↑
镜像2                                    镜像1
左侧-100px                              右侧+50px


                            ┌───┐
                            │░░░│
                            └───┘
                              ●
                              ↑
                            镜像3
                          右侧+150px
```

**距离**：
- 镜像1：右侧 +50px
- 镜像2：左侧 -100px
- 镜像3：右侧 +150px

---

### 弹幕发射示例

假设玩家使用"笔记本电脑"技能（发射3发直线弹幕），同时有1个镜像：

```
发射前：
  ┌───┐          ┌───┐
  │░░░│          │███│
  └───┘          └───┘
  镜像            玩家

发射后：
  ↑ ↑ ↑          ↑ ↑ ↑
  蓝 蓝 蓝        白 白 白
  ┌───┐          ┌───┐
  │░░░│          │███│
  └───┘          └───┘
  镜像            玩家

总共：6发弹幕
- 3发白色（玩家）
- 3发蓝色（镜像）
```

---

### 时间线

```
t=0s    玩家按键盘5，激活AI工具
        ↓
        添加镜像Buff
        ↓
t=0.1s  开始渲染镜像（半透明蓝色方块）
        ↓
t=0.5s  玩家发射弹幕
        ├── 主弹幕：3发白色
        └── 镜像弹幕：3发蓝色
        ↓
t=1.0s  玩家再次发射
        ├── 主弹幕：3发白色
        └── 镜像弹幕：3发蓝色
        ↓
t=2.0s  玩家继续发射...
        ↓
t=5.0s  Buff过期
        ↓
        镜像消失
        ↓
t=5.1s  只有玩家发射弹幕（没有镜像）
```

---

## 强化系统

### 强化选项

#### 🥉 铜色强化

**AI升级**
- 效果：镜像数量 +1
- 实现：`mirrorCount += 1`
- 结果：2个镜像（右侧+50px，左侧-100px）

**示例**：
```javascript
// 基础效果
{ mirrorCount: 1 }

// 选择"AI升级"后
{ mirrorCount: 2 }

// 渲染
for (let i = 0; i < 2; i++) {
  // i=0: 右侧+50px
  // i=1: 左侧-100px
}
```

---

#### 🥈 银色强化

**持久AI**
- 效果：持续时间 +3秒
- 实现：`duration += 3`
- 结果：持续8秒（原5秒 + 3秒）

**示例**：
```javascript
// 基础效果
{ duration: 5 }

// 选择"持久AI"后
{ duration: 8 }

// Buff
addBuff({
  type: 'mirror',
  value: 1,
  duration: 8  // 8秒后过期
})
```

---

#### 🥇 金色强化

**智能优化**
- 效果：镜像伤害 +20%
- 实现：镜像弹幕伤害加成
- 结果：镜像弹幕伤害提升

**示例**：
```javascript
// 创建镜像弹幕时
const mirrorBullets = this.bulletPatterns[config.pattern](...)

mirrorBullets.forEach(b => {
  b.isMirror = true
  
  // 应用镜像伤害加成
  if (effect.mirrorDamage) {
    b.damage *= (1 + effect.mirrorDamage)  // 1.2倍伤害
  }
})
```

---

### 强化叠加

**场景**：选择了"AI升级"和"持久AI"

```javascript
// 基础效果
{
  duration: 5,
  mirrorCount: 1
}

// 选择"AI升级"（铜色）
{
  duration: 5,
  mirrorCount: 2  // +1
}

// 选择"持久AI"（银色）
{
  duration: 8,    // +3
  mirrorCount: 2
}

// 最终效果
- 2个镜像
- 持续8秒
```

---

## 常见问题

### Q1: 为什么镜像不会移动？

**A**: 镜像不是独立的对象，而是基于玩家位置的**相对偏移**。

```javascript
// 镜像位置 = 玩家位置 + 偏移
mirrorX = player.x + offsetX

// 玩家移动时
player.x = 200  // 镜像X = 200 + 50 = 250
player.x = 220  // 镜像X = 220 + 50 = 270

// 镜像自动跟随
```

---

### Q2: 镜像弹幕和主弹幕有什么区别？

**A**: 只有**颜色**和**发射位置**不同，伤害和其他属性完全相同。

| 属性 | 主弹幕 | 镜像弹幕 |
|------|--------|---------|
| 发射位置 | player.x | player.x + offsetX |
| 颜色 | 白色/黄色 | 蓝色/紫色 |
| 伤害 | 相同 | 相同 |
| 速度 | 相同 | 相同 |
| 穿透 | 相同 | 相同 |

---

### Q3: 可以有多个镜像吗？

**A**: 可以！通过强化"AI升级"可以增加镜像数量。

```javascript
// 1个镜像
mirrorCount = 1
位置：右侧+50px

// 2个镜像
mirrorCount = 2
位置：右侧+50px，左侧-100px

// 3个镜像
mirrorCount = 3
位置：右侧+50px，左侧-100px，右侧+150px

// 4个镜像
mirrorCount = 4
位置：右侧+50px，左侧-100px，右侧+150px，左侧-200px
```

**规律**：
- 奇数镜像：右侧
- 偶数镜像：左侧
- 距离递增：50px, 100px, 150px, 200px...

---

### Q4: 镜像会受到伤害吗？

**A**: 不会。镜像只是**视觉效果**，没有碰撞体积，敌人无法攻击。

---

### Q5: 镜像技能可以叠加吗？

**A**: 可以！如果在Buff未过期时再次激活，会添加新的Buff。

```javascript
// t=0s: 激活AI工具
addBuff({ type: 'mirror', value: 1, duration: 5 })
// 镜像数量 = 1

// t=3s: 再次激活
addBuff({ type: 'mirror', value: 1, duration: 5 })
// 镜像数量 = 2（两个Buff同时生效）

// t=5s: 第一个Buff过期
// 镜像数量 = 1

// t=8s: 第二个Buff过期
// 镜像数量 = 0
```

---

### Q6: 如何修改镜像的颜色？

**A**: 修改渲染代码中的 `fillStyle`：

```javascript
// GameCanvasNew.jsx
// 原代码：蓝色
ctx.fillStyle = '#4af'

// 改为红色
ctx.fillStyle = '#f44'

// 改为绿色
ctx.fillStyle = '#4f4'

// 改为半透明金色
ctx.fillStyle = 'rgba(255, 215, 0, 0.4)'
```

---

### Q7: 如何修改镜像的位置？

**A**: 修改 `offsetX` 的计算：

```javascript
// 原代码：50px间距
const offsetX = (i + 1) * 50 * side

// 改为100px间距（更分散）
const offsetX = (i + 1) * 100 * side

// 改为30px间距（更紧凑）
const offsetX = (i + 1) * 30 * side

// 固定位置（不交替左右）
const offsetX = (i + 1) * 50  // 全部在右侧
```

---

### Q8: 如何让镜像发射不同的弹幕？

**A**: 在创建镜像弹幕时修改参数：

```javascript
// 原代码：相同弹幕
const mirrorBullets = this.bulletPatterns[config.pattern](...)

// 改为不同模式
const mirrorBullets = this.bulletPatterns['fan_horizontal'](
  { ...this.ctx.player, x: this.ctx.player.x + offsetX },
  5  // 镜像发射5发扇形弹幕
)

// 改为不同颜色
mirrorBullets.forEach(b => {
  b.isMirror = true
  b.color = '#f0f'  // 紫色
})
```

---

## 总结

### 核心要点

1. **镜像不是对象**
   - 只是基于玩家位置的相对渲染
   - 没有独立的状态和逻辑

2. **Buff驱动**
   - 通过 `mirror` 类型的Buff控制
   - Buff过期后自动消失

3. **同步发射**
   - 玩家发射时，为每个镜像创建弹幕
   - 位置偏移，其他属性相同

4. **视觉区分**
   - 镜像：半透明蓝色
   - 镜像弹幕：蓝色/紫色

### 实现流程

```
激活技能 → 添加Buff → 游戏循环
                        ├── 渲染镜像
                        └── 发射弹幕
                              ├── 主弹幕
                              └── 镜像弹幕
```

### 扩展建议

1. **镜像AI**
   - 让镜像独立移动
   - 追踪最近的敌人

2. **镜像特效**
   - 生成/消失动画
   - 粒子效果

3. **镜像技能**
   - 镜像释放不同技能
   - 镜像自动释放技能

---

希望这个详细讲解能帮助您完全理解镜像技能的实现！如有任何疑问，欢迎继续提问！🤖✨
