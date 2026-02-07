# 战斗系统实现说明

## 概述

本项目实现了一个完整的射击游戏战斗系统，基于fgoshooter游戏机制，包含7个主动技能、完整的伤害计算公式、Buff系统、强化系统等。

## 已实现的核心系统

### 1. 伤害计算系统 (`damageSystem.js`)

实现了完整的伤害公式：
```
伤害 = (10 + 攻击力) × (1 + 图鉴攻击加成 + 伤害增加 - 伤害降低 + 其他效果)
     × [暴击时: (1 + 100% + 图鉴爆伤加成 + 其他爆伤加成)]
```

**特性**：
- 支持基础攻击力和玩家攻击力
- 支持多种伤害增减效果累加
- 支持暴击判定和暴击伤害计算
- 支持必定暴击效果

### 2. 弹幕发射模式 (`bulletPatterns.js`)

实现了5种弹幕发射模式：
- **直线模式** (`line`)：向前发射多排多列弹幕（笔记本电脑）
- **两侧模式** (`side`)：在玩家两侧发射弹幕（外卖）
- **横向扇形** (`horizontal`)：横向扩散发射（换鱼宝典）
- **随机模式** (`random`)：随机方向发射（君子六艺）
- **环绕模式** (`orbit`)：围绕玩家旋转（后端技能）

### 3. Buff系统 (`buffSystem.js`)

支持多种临时增益效果：
- 攻速增益
- 移速增益
- 暴击率增益
- 暴击伤害增益
- 伤害增益
- 必定暴击
- 镜像效果
- 敌人减速

**特性**：
- 自动管理Buff持续时间
- 支持Buff叠加/不叠加
- 提供便捷的查询接口

### 4. 技能系统

#### 技能定义 (`skillDefinitions.js`)

定义了7个主动技能，每个技能包含：
- 基础效果配置
- 冷却时间
- 持续时间
- 三级强化选项（金/银/铜）

**已实现的技能**：
1. **笔记本电脑**：向前发射1排3个弹幕，CD 2秒
2. **外卖**：持续5秒在两侧发射弹幕，CD 10秒
3. **换鱼宝典**：发射横向5发弹幕，CD 3秒
4. **电动车**：攻速+100%持续3秒，CD 10秒
5. **AI工具**：生成镜像持续5秒，CD 20秒
6. **期末屠模式**：必定暴击持续5秒，CD 15秒
7. **君子六艺**：随机发射25个弹幕，CD 10秒

#### 技能管理器 (`skillManager.js`)

负责管理玩家拥有的技能：
- 添加和升级技能
- 管理技能冷却
- 应用强化效果
- 追踪激活状态

#### 技能执行器 (`skillExecutor.js`)

负责执行技能效果：
- 根据技能类型执行相应逻辑
- 创建弹幕
- 添加Buff
- 管理持续效果

### 5. 战斗管理器 (`combatManager.js`)

统一管理所有战斗系统：
- 集成伤害计算、Buff、技能系统
- 管理自动射击
- 自动触发就绪的技能
- 处理弹幕击中逻辑
- 应用敌人减速效果

## 文件结构

```
src/game/
├── combat/
│   ├── damageSystem.js        # 伤害计算系统
│   ├── bulletPatterns.js      # 弹幕发射模式
│   ├── combatManager.js       # 战斗管理器
│   ├── bulletTypes.js         # 弹幕类型（原有）
│   ├── bulletHit.js           # 弹幕击中（原有）
│   └── ...
├── skill/
│   ├── skillDefinitions.js    # 技能定义
│   ├── skillManager.js        # 技能管理器
│   └── skillExecutor.js       # 技能执行器
├── buff/
│   └── buffSystem.js          # Buff系统
└── canvas/
    ├── GameCanvas.jsx         # 原游戏画布
    └── GameCanvasNew.jsx      # 新游戏画布（集成战斗系统）
```

## 使用方法

### 1. 基础集成

在游戏主循环中使用 `CombatManager`：

```javascript
import { CombatManager } from './game/combat/combatManager'

// 初始化
const combatManager = new CombatManager()
combatManager.initialize({
  player: playerRef.current,
  bullets: bulletsRef.current,
  enemies: enemiesRef.current
})

// 每帧更新
combatManager.update(dt, {
  player,
  bullets,
  enemies
})
```

### 2. 添加技能

```javascript
// 添加技能
combatManager.addSkill('laptop')
combatManager.addSkill('takeout')

// 添加强化
combatManager.addUpgrade('laptop', 'laptop_solid_state')
```

### 3. 测试技能

在 `GameCanvasNew.jsx` 中，可以使用键盘快捷键测试技能：
- 按 `1` 添加笔记本电脑
- 按 `2` 添加外卖
- 按 `3` 添加换鱼宝典
- 按 `4` 添加电动车
- 按 `5` 添加AI工具
- 按 `6` 添加期末屠模式
- 按 `7` 添加君子六艺

### 4. 切换到新画布

修改 `src/pages/Game.jsx`：

```javascript
import GameCanvasNew from '../game/canvas/GameCanvasNew.jsx'

export default function Game() {
  return (
    <div className="page full">
      <GameCanvasNew />
    </div>
  )
}
```

## 技能强化系统

每个技能都有多个强化选项，分为三个等级：

### 铜色强化（Bronze）
- 基础数值提升
- 简单效果修改
- 示例：CD-8%、伤害+20%、暴击率+8%

### 银色强化（Silver）
- 高级效果
- 特殊机制
- 示例：穿透+1、持续时间+8%、爆伤+50%

### 金色强化（Gold）
- 稀有独特效果
- 改变游戏机制
- 示例：无视减伤、常驻效果

## 扩展指南

### 添加新技能

1. 在 `skillDefinitions.js` 中定义技能：
```javascript
new_skill: {
  id: 'new_skill',
  name: '新技能',
  type: 'active',
  cd: 5,
  duration: 0,
  baseEffect: { /* 效果配置 */ },
  upgrades: { /* 强化选项 */ }
}
```

2. 在 `skillExecutor.js` 中实现执行逻辑：
```javascript
executeNewSkill(skill) {
  // 实现技能效果
}
```

3. 在 `executeSkill` 方法中添加分支：
```javascript
case 'new_skill':
  this.executeNewSkill(skill)
  break
```

### 添加新弹幕模式

在 `bulletPatterns.js` 中添加新模式：
```javascript
export function newPattern({ x, y, ...params }) {
  const bullets = []
  // 计算弹幕位置和速度
  return bullets
}
```

### 添加新Buff类型

在 `buffSystem.js` 中添加新类型：
```javascript
export const BuffType = {
  // ...
  NEW_BUFF: 'new_buff'
}
```

## 性能优化建议

1. **对象池**：为弹幕和敌人实现对象池，减少GC压力
2. **空间分区**：使用四叉树优化碰撞检测
3. **批量渲染**：合并相同类型的渲染调用
4. **定时器管理**：及时清理不需要的定时器

## 已知问题和待完成功能

### 待完成
- [ ] 所有强化效果的完整实现
- [ ] 技能UI显示（冷却进度、激活状态）
- [ ] 升级时的技能选择界面集成
- [ ] 数值平衡调整
- [ ] 音效和特效

### 已知问题
- 部分强化效果可能需要进一步调试
- 镜像系统的渲染可能需要优化
- 持续技能的定时器清理需要测试

## 测试建议

1. 启动开发服务器：
```bash
cd my-coding-game
pnpm install
pnpm dev
```

2. 打开浏览器访问游戏

3. 使用键盘快捷键（1-7）添加技能进行测试

4. 观察技能效果、弹幕模式、Buff状态

## 参考文档

- `combat_system_design.md`：详细的系统设计文档
- `skill_analysis.md`：技能分析文档
- PDF文档：原始技能定义

## 贡献指南

如需添加新功能或修复问题：
1. 遵循现有的代码结构和命名规范
2. 为新功能添加注释
3. 测试功能是否正常工作
4. 更新相关文档

## 联系方式

如有问题或建议，请通过GitHub Issues反馈。
