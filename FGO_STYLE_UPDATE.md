# FGO风格UI更新说明

## 更新概述

根据视频参考，实现了FGO风格的技能系统UI，包括技能选择界面和技能图标显示。

---

## 核心功能

### 1. 技能数量限制 ✅

**限制规则**：
- 最多选择 **3个大类技能**
- 达到上限后，升级时只能选择已有技能的强化
- 不能再获取新技能

**实现位置**：
```javascript
// skillUpgradeSystem.js
getLevelUpOptions(count = 3) {
  const ownedSkillCount = Object.keys(this.ownedSkills).length
  const maxSkills = 3 // 最多3个大类技能
  
  if (ownedSkillCount < maxSkills) {
    // 可以获取新技能
  } else {
    // 只能选择强化
  }
}
```

---

### 2. FGO风格技能选择界面 ✅

**视觉特点**：
- 深色背景（90%透明黑色）
- 金色发光标题 "LEVEL UP"
- 3列网格布局
- 技能卡片带边框光效

**卡片设计**：
```
┌─────────────────────┐
│ ◆ GOLD              │ ← 等级标签
├─────────────────────┤
│ 笔记本电脑 - 固态硬盘│ ← 技能名称
│ 本技能弹幕穿透+1     │ ← 描述
│ [穿透+1]            │ ← 效果标签
├─────────────────────┤
│ 点击选择            │ ← 提示
└─────────────────────┘
```

**颜色系统**：
| 等级 | 边框颜色 | 发光效果 |
|------|---------|---------|
| 新技能 | 青色 #00ffff | 青色光晕 |
| 铜色 | 橙铜 #cd7f32 | 橙色光晕 |
| 银色 | 银白 #c0c0c0 | 银色光晕 |
| 金色 | 金黄 #ffd700 | 金色光晕 |

**动画效果**：
- 标题发光脉动（2秒循环）
- 卡片悬停上浮
- 边框光效流动

---

### 3. 右上角技能图标显示 ✅

**布局**：
```
屏幕右上角
    ↓
  ┌─┐
  │1│ ← 技能槽1
  └─┘
  ┌─┐
  │2│ ← 技能槽2
  └─┘
  ┌─┐
  │3│ ← 技能槽3
  └─┘
```

**菱形设计**：
```
    ◆
   ╱ ╲
  ╱💻 ╲  ← 技能图标
 ╱     ╲
◆───────◆
 ╲     ╱
  ╲   ╱
   ╲ ╱
    ◆
```

**状态显示**：

1. **未激活**：
   - 显示问号 `?`
   - 深灰色边框
   - 暗淡背景

2. **已激活（冷却中）**：
   - 显示技能图标（如💻）
   - 蓝色边框
   - 黑色遮罩（从下往上）
   - 冷却时间文本（如 `3.5s`）

3. **就绪状态**：
   - 绿色边框
   - 绿色发光
   - 脉动动画

**冷却显示**：
- 实时更新（每100ms）
- 遮罩高度 = 剩余冷却 / 总冷却 × 100%
- 显示精确到0.1秒

---

## 技术实现

### 组件结构

```
Game.jsx
├── GameCanvas.jsx
├── SkillSelectModal.jsx  ← 技能选择界面
└── SkillIconsDisplay.jsx ← 技能图标显示
```

### 数据流

```
GameCanvas
    ↓ onCombatManagerReady
Game.jsx
    ↓ combatManager prop
SkillIconsDisplay
    ↓ 每100ms轮询
获取技能状态和冷却时间
```

### 关键代码

**1. 限制技能数量**
```javascript
// skillUpgradeSystem.js
const ownedSkillCount = Object.keys(this.ownedSkills).length
const maxSkills = 3

if (ownedSkillCount < maxSkills) {
  newSkillOptions = this.getNewSkillOptions()
}
```

**2. 技能图标更新**
```javascript
// SkillIconsDisplay.jsx
useEffect(() => {
  const interval = setInterval(() => {
    const activeSkills = useGameStore.getState().getActiveSkills()
    setSkills(activeSkills)
    
    // 获取冷却时间
    const cds = {}
    activeSkills.forEach(skill => {
      const cd = combatManager.skillManager.getSkillCooldown(skill.id)
      cds[skill.id] = { current: cd, max: maxCd, ready: cd <= 0 }
    })
    setCooldowns(cds)
  }, 100)
  
  return () => clearInterval(interval)
}, [combatManager])
```

**3. 冷却遮罩**
```javascript
const getCooldownPercent = () => {
  if (!cooldown || !cooldown.max) return 0
  return (cooldown.current / cooldown.max) * 100
}

<div 
  className="skill-cooldown-overlay"
  style={{ height: `${getCooldownPercent()}%` }}
/>
```

---

## 使用说明

### 1. 拉取最新代码

```bash
git pull origin main
```

### 2. 刷新浏览器

按 `Ctrl + F5` 强制刷新

### 3. 测试流程

#### 第一次升级（Lv.1 → Lv.2）
1. 击杀敌人获取经验
2. 升级后弹出技能选择界面
3. 看到3个新技能选项（青色边框）
4. 选择一个技能（如"笔记本电脑"）
5. 右上角第1个槽位显示技能图标💻

#### 第二次升级（Lv.2 → Lv.3）
1. 继续击杀敌人
2. 升级后再次弹出选择界面
3. 看到2个新技能 + 1个强化选项
4. 选择第二个技能（如"外卖"）
5. 右上角第2个槽位显示🍱

#### 第三次升级（Lv.3 → Lv.4）
1. 继续升级
2. 选择第三个技能（如"摸鱼宝典"）
3. 右上角第3个槽位显示🎣
4. **此时已达到3个技能上限**

#### 第四次升级（Lv.4 → Lv.5）
1. 继续升级
2. **只能看到强化选项**（铜/银/金色边框）
3. 选择一个强化（如"笔记本电脑 - 固态硬盘"）
4. 技能效果提升，但图标不变

### 4. 观察冷却时间

1. 按键盘 **1-7** 手动触发技能
2. 观察右上角对应槽位：
   - 蓝色边框 → 冷却中
   - 黑色遮罩从下往上消失
   - 显示剩余时间（如 `2.3s`）
3. 冷却结束：
   - 边框变绿色
   - 发光脉动
   - 可以再次使用

---

## 技能图标映射

| 技能ID | 图标 | 名称 |
|--------|-----|------|
| laptop | 💻 | 笔记本电脑 |
| takeout | 🍱 | 外卖 |
| fishing | 🎣 | 摸鱼宝典 |
| ebike | 🛵 | 电动车 |
| ai_tool | 🤖 | AI工具 |
| exam_mode | 📝 | 期末周模式 |
| six_arts | 🎨 | 君子六艺 |

---

## 样式定制

### 修改技能槽位数量

```javascript
// SkillIconsDisplay.jsx
const slots = [0, 1, 2] // 改为 [0, 1, 2, 3] 可以显示4个槽位
```

### 修改最大技能数量

```javascript
// skillUpgradeSystem.js
const maxSkills = 3 // 改为4可以选择4个大类技能
```

### 修改菱形大小

```css
/* SkillIconsDisplay.css */
.skill-icon {
  width: 60px;  /* 改为70px可以变大 */
  height: 60px;
}
```

### 修改冷却更新频率

```javascript
// SkillIconsDisplay.jsx
setInterval(() => {
  // ...
}, 100) // 改为50可以更流畅（但更耗性能）
```

---

## 响应式设计

### 移动端适配

- 槽位大小：60px → 50px
- 图标字体：24px → 20px
- 冷却文本：14px → 12px
- 位置：右侧20px → 10px

### 平板适配

- 保持桌面端样式
- 触摸优化（更大的点击区域）

---

## 性能优化

### 冷却时间更新

- 使用 `setInterval` 而非 `requestAnimationFrame`
- 100ms更新一次（平衡流畅度和性能）
- 组件卸载时清理定时器

### CSS动画

- 使用 `transform` 而非 `top/left`（GPU加速）
- 使用 `will-change` 提示浏览器优化
- 避免频繁重绘

---

## 已知问题

### 1. 技能图标可能重叠

**原因**：固定定位可能与其他UI冲突

**解决**：调整 `top` 和 `right` 值

### 2. 冷却时间不够精确

**原因**：100ms更新间隔

**解决**：改为50ms或使用 `requestAnimationFrame`

### 3. 移动端可能遮挡游戏内容

**原因**：固定定位

**解决**：添加媒体查询调整位置

---

## 后续改进建议

### 1. 技能图标素材

当前使用Emoji，建议替换为：
- PNG图标（64x64px）
- SVG矢量图标
- Sprite Sheet（动画效果）

### 2. 音效

添加音效：
- 技能选择：确认音效
- 技能就绪：提示音
- 技能释放：释放音效

### 3. 触摸优化

- 长按查看技能详情
- 滑动切换技能页面
- 震动反馈

### 4. 技能详情面板

点击技能图标显示：
- 技能名称
- 当前等级
- 已选择的强化
- 详细数值

### 5. 技能快捷键提示

在图标下方显示：
- 键盘快捷键（1/2/3）
- 触摸手势提示

---

## 文件清单

**新增文件**：
- `SkillIconsDisplay.jsx` - 技能图标组件
- `SkillIconsDisplay.css` - 技能图标样式
- `FGO_STYLE_UPDATE.md` - 本文档

**修改文件**：
- `skillUpgradeSystem.js` - 添加3技能限制
- `SkillSelectModal.jsx` - 重新设计UI
- `SkillSelectModal.css` - FGO风格样式
- `Game.jsx` - 集成技能图标显示
- `GameCanvasNew.jsx` - 传递combatManager

---

## Git提交

**Commit**: `815ac00`

**变更统计**：
- 7个文件修改
- +695行添加
- -209行删除

---

需要帮助或有疑问，请查看代码注释或联系开发者！
