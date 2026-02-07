# 技能升级系统使用指南

## 系统概述

完整的技能升级系统已经实现，支持：
- ✅ 获取新技能
- ✅ 升级已有技能（添加强化）
- ✅ 技能效果自动叠加
- ✅ 金/银/铜三级强化系统
- ✅ 自动同步到战斗系统

---

## 系统架构

### 核心组件

```
SkillUpgradeSystem (技能升级系统)
    ↓
GameStore (游戏状态管理)
    ↓
SkillSelectModal (技能选择界面)
    ↓
GameCanvas (游戏主循环)
    ↓
CombatManager (战斗管理器)
```

---

## 工作流程

### 1. 升级触发

```javascript
// 玩家获取经验
gainExp(20)

// 经验满后自动升级
if (exp >= expMax) {
  level++
  isLevelUp = true
  pauseGame = true
  
  // 获取3个升级选项
  levelUpChoices = skillUpgradeSystem.getLevelUpOptions(3)
}
```

### 2. 选项生成

系统会生成两种类型的选项：

#### 新技能选项
```javascript
{
  type: 'new_skill',
  skillId: 'laptop',
  name: '笔记本电脑',
  description: '释放技能时向前打出1排3个弹幕',
  tier: 'new'
}
```

#### 强化选项
```javascript
{
  type: 'upgrade',
  skillId: 'laptop',
  skillName: '笔记本电脑',
  upgradeId: 'laptop_solid_state',
  name: '固态硬盘',
  description: '本技能弹幕穿透人数+1',
  tier: 'silver',
  effect: { pierce: 1 }
}
```

### 3. 玩家选择

玩家点击选项后：

```javascript
pickSkill(option)
  ↓
skillUpgradeSystem.selectOption(option)
  ↓
if (type === 'new_skill') {
  acquireSkill(skillId)
} else {
  upgradeSkill(skillId, upgradeId)
}
  ↓
isLevelUp = false
pauseGame = false
```

### 4. 技能同步

选择完成后，技能自动同步到战斗系统：

```javascript
// GameCanvas中的useEffect
useEffect(() => {
  // 获取所有激活的技能
  const activeSkills = getActiveSkills()
  
  // 清空现有技能
  combatManager.clearSkills()
  
  // 添加所有技能（带完整效果）
  activeSkills.forEach(skill => {
    combatManager.addSkillWithEffect(skill)
  })
}, [level])
```

---

## 技能效果叠加

### 基础效果

每个技能都有基础效果：

```javascript
baseEffect: {
  pattern: 'line',
  bulletCount: 3,
  rows: 1,
  damageMultiplier: 2.5,
  pierce: 0
}
```

### 强化效果叠加

选择强化后，效果会自动叠加：

```javascript
// 选择"固态硬盘"强化
effect: { pierce: 1 }

// 最终效果
finalEffect: {
  pattern: 'line',
  bulletCount: 3,
  rows: 1,
  damageMultiplier: 2.5,
  pierce: 1  // ← 叠加后
}
```

### 叠加规则

1. **数值类型**：累加
   ```javascript
   damageMultiplier: 2.5 + 0.2 = 2.7
   pierce: 0 + 1 + 1 = 2
   ```

2. **布尔类型**：或运算
   ```javascript
   permanent: false || true = true
   ```

3. **其他类型**：覆盖
   ```javascript
   pattern: 'line' → 'spread'
   ```

---

## 强化等级系统

### 解锁条件

| 等级 | 可用强化 |
|------|---------|
| Lv.1-2 | 🥉 铜色 |
| Lv.3-5 | 🥉 铜色 + 🥈 银色 |
| Lv.6+ | 🥉 铜色 + 🥈 银色 + 🥇 金色 |

### 强化特点

- **铜色强化**：基础提升，易于获取
- **银色强化**：中等提升，需要一定等级
- **金色强化**：强力提升，高等级解锁

---

## 技能选择界面

### 界面元素

```
┌─────────────────────────────┐
│   🎉 升级到 Lv.3！          │
│   选择一个技能或强化         │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🆕 新技能                │ │
│ │ 笔记本电脑               │ │
│ │ 释放技能时向前打出...    │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🥈 银色                  │ │
│ │ 外卖 - 精准起送          │ │
│ │ 攻速+20%                 │ │
│ │ [攻速+20%]               │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🥉 铜色                  │ │
│ │ 摸鱼宝典 - 摸鱼计时      │ │
│ │ 冷却-8%                  │ │
│ │ [冷却-8%]                │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### 颜色标识

- **新技能**：青色边框
- **铜色强化**：橙铜色边框
- **银色强化**：银白色边框
- **金色强化**：金黄色边框

---

## API参考

### SkillUpgradeSystem

#### getLevelUpOptions(count)
获取升级选项

```javascript
const options = skillUpgradeSystem.getLevelUpOptions(3)
// 返回: Array<Option>
```

#### selectOption(option)
选择一个选项

```javascript
const result = skillUpgradeSystem.selectOption(option)
// 返回: { action, skillId, skill, state }
```

#### getSkillEffect(skillId)
获取技能的完整效果

```javascript
const effect = skillUpgradeSystem.getSkillEffect('laptop')
// 返回: { ...skillDef, effect, level, upgrades }
```

#### getActiveSkills()
获取所有激活的技能

```javascript
const skills = skillUpgradeSystem.getActiveSkills()
// 返回: Array<SkillData>
```

---

## 使用示例

### 测试技能系统

1. **启动游戏**
   ```bash
   npm run dev
   ```

2. **进入游戏**
   - 从主页进入关卡

3. **获取经验**
   - 击杀敌人获取经验
   - 经验满后自动升级

4. **选择技能**
   - 第一次升级：选择一个新技能
   - 后续升级：可以选择新技能或强化已有技能

5. **观察效果**
   - 按键盘1-7手动触发技能（测试用）
   - 观察技能效果是否正确

---

## 调试技巧

### 查看当前技能

```javascript
// 在浏览器控制台
const store = useGameStore.getState()
const skills = store.getActiveSkills()
console.log('Active skills:', skills)
```

### 查看技能效果

```javascript
const effect = store.skillUpgradeSystem.getSkillEffect('laptop')
console.log('Laptop effect:', effect)
```

### 强制升级

```javascript
// 直接添加经验
store.gainExp(1000)
```

### 重置游戏

```javascript
store.resetGame()
```

---

## 常见问题

### Q: 升级后技能没有生效？

A: 检查以下几点：
1. 技能是否正确同步到CombatManager
2. 查看控制台是否有 `[Game] Synced skills: X` 日志
3. 检查技能ID是否匹配

### Q: 强化效果没有叠加？

A: 检查：
1. `getSkillEffect` 是否正确合并效果
2. 效果类型是否正确（数值/布尔/其他）
3. 查看控制台日志确认强化被添加

### Q: 选择界面不显示？

A: 检查：
1. `isLevelUp` 状态是否为 true
2. `levelUpChoices` 是否有内容
3. `SkillSelectModal` 是否正确渲染

### Q: 技能冷却不正常？

A: 检查：
1. CD修正是否正确应用
2. `cdReduce` 和 `cdIncrease` 是否正确计算
3. 技能触发时是否正确设置冷却

---

## 后续扩展

### 1. 技能预览

在选择界面添加技能演示动画：

```javascript
<SkillPreview skillId={option.skillId} />
```

### 2. 技能树

可视化技能升级路径：

```javascript
<SkillTree skills={ownedSkills} />
```

### 3. 技能重置

允许玩家重置技能选择：

```javascript
resetSkills() {
  skillUpgradeSystem.reset()
  // 返还部分资源
}
```

### 4. 技能组合

检测特定技能组合，给予额外奖励：

```javascript
checkSkillCombos() {
  const skills = getActiveSkills()
  if (hasCombo(skills, ['laptop', 'takeout'])) {
    applyComboBonus()
  }
}
```

### 5. 技能存档

保存和加载技能配置：

```javascript
// 导出
const saveData = skillUpgradeSystem.exportState()
localStorage.setItem('skills', JSON.stringify(saveData))

// 导入
const saveData = JSON.parse(localStorage.getItem('skills'))
skillUpgradeSystem.importState(saveData)
```

---

## 技术细节

### 效果合并算法

```javascript
function mergeEffect(base, upgrade) {
  const result = { ...base }
  
  for (const [key, value] of Object.entries(upgrade)) {
    if (typeof value === 'number') {
      result[key] = (result[key] || 0) + value
    } else if (typeof value === 'boolean') {
      result[key] = result[key] || value
    } else {
      result[key] = value
    }
  }
  
  return result
}
```

### 技能同步机制

```javascript
// 等级变化时触发同步
useEffect(() => {
  syncSkillsToCombat()
}, [level])

function syncSkillsToCombat() {
  const skills = getActiveSkills()
  combatManager.clearSkills()
  skills.forEach(skill => {
    combatManager.addSkillWithEffect(skill)
  })
}
```

---

需要帮助或有疑问，请查看代码注释或联系开发者！
