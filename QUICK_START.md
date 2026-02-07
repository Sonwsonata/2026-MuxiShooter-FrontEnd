# 快速开始指南

## 安装和运行

### 1. 安装依赖

```bash
cd my-coding-game
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

### 3. 打开浏览器

访问 `http://localhost:5173`（或终端显示的地址 ）

## 使用新战斗系统

### 方式一：直接使用新画布（推荐）

修改 `src/pages/Game.jsx`：

```javascript
// 将这一行
import GameCanvas from '../game/canvas/GameCanvas.jsx'

// 改为
import GameCanvas from '../game/canvas/GameCanvasNew.jsx'
```

### 方式二：创建新路由

在 `src/App.jsx` 中添加新路由：

```javascript
import GameCanvasNew from './game/canvas/GameCanvasNew.jsx'

// 在路由中添加
<Route path="/game-new" element={<GameCanvasNew />} />
```

## 测试技能

游戏运行后，使用键盘快捷键添加技能：

| 按键 | 技能 | 效果 |
| --- | --- | --- |
| 1 | 笔记本电脑 | 向前发射1排3个弹幕 |
| 2 | 外卖 | 持续5秒在两侧发射弹幕 |
| 3 | 换鱼宝典 | 发射横向5发弹幕 |
| 4 | 电动车 | 攻速+100%持续3秒 |
| 5 | AI工具 | 生成镜像持续5秒 |
| 6 | 期末屠模式 | 必定暴击持续5秒 |
| 7 | 君子六艺 | 随机发射25个弹幕 |

## 观察效果

游戏画面左上角会显示：

- HP：生命值

- Active Skills：激活中的技能数量

- Buffs：当前Buff数量

## 技能效果说明

### 笔记本电脑（CD: 2秒）

- 瞬发技能

- 向前发射3个弹幕

- 伤害倍率：250%

- 可通过强化增加穿透、排数等

### 外卖（CD: 10秒）

- 持续5秒

- 在玩家两侧持续发射弹幕

- 每秒每侧4发

- 可通过强化增加弹幕数量、收束效果等

### 换鱼宝典（CD: 3秒）

- 瞬发技能

- 发射横向扇形5发弹幕

- 覆盖范围广

- 可通过强化增加穿透、范围等

### 电动车（CD: 10秒）

- 持续3秒

- 攻速+100%（攻击间隔减半）

- 可通过强化增加移速、暴击率等

- 可升级为常驻效果

### AI工具（CD: 20秒）

- 持续5秒

- 生成1个镜像同步攻击

- 镜像位于玩家两侧

- 可通过强化增加镜像数量、伤害等

### 期末屠模式（CD: 15秒）

- 持续5秒

- 普攻必定暴击

- 可通过强化增加爆伤、应用到技能等

- 金色强化可无视敌方减伤

### 君子六艺（CD: 10秒）

- 持续5秒

- 随机方向发射25个弹幕

- 覆盖全屏

- 可通过强化增加数量、变为常驻等

## 调试技巧

### 1. 查看控制台

按 `F12` 打开浏览器开发者工具，查看控制台输出：

- 技能添加信息

- 错误信息

- 调试日志

### 2. 修改参数

可以直接修改技能定义文件 `src/game/skill/skillDefinitions.js` 中的参数：

- `cd`：冷却时间

- `duration`：持续时间

- `damageMultiplier`：伤害倍率

- 等等

### 3. 添加测试代码

在 `GameCanvasNew.jsx` 的初始化部分添加测试技能：

```javascript
useEffect(() => {
  // ... 其他初始化代码
  
  // 添加测试技能
  combatManagerRef.current.addSkill('laptop')
  combatManagerRef.current.addSkill('electric_car')
  
  // 添加强化
  combatManagerRef.current.addUpgrade('laptop', 'laptop_solid_state')
}, [])
```

## 常见问题

### Q: 技能没有触发？

A: 检查技能是否已添加，冷却是否完成。可以在控制台查看技能状态。

### Q: 弹幕看不见？

A: 检查弹幕颜色设置，确保与背景有对比度。

### Q: 游戏卡顿？

A: 可能是弹幕数量过多，尝试减少技能数量或调整发射频率。

### Q: 如何添加强化？

A: 目前需要手动调用 `combatManager.addUpgrade(skillId, upgradeId)`，后续会集成到升级界面。

## 下一步

1. 集成到升级系统：在升级时提供技能和强化选择

1. 添加UI显示：显示技能冷却、Buff图标等

1. 数值平衡：根据游戏体验调整各项数值

1. 添加音效和特效：提升游戏体验

## 反馈

如有问题或建议，请查看 `COMBAT_SYSTEM_README.md` 了解更多细节。

