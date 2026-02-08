# 技能图标素材替换指南

## 当前实现

目前技能图标使用 **Emoji** 作为占位符：

| 技能ID | Emoji | 名称 |
|--------|-------|------|
| laptop | 💻 | 笔记本电脑 |
| takeout | 🍱 | 外卖 |
| fishing | 🎣 | 摸鱼宝典 |
| ebike | 🛵 | 电动车 |
| ai_tool | 🤖 | AI工具 |
| exam_mode | 📝 | 期末周模式 |
| six_arts | 🎨 | 君子六艺 |

---

## 素材规格

### 推荐尺寸
- **标准尺寸**: 64x64px
- **高清尺寸**: 128x128px（支持Retina显示）
- **最小尺寸**: 48x48px

### 文件格式
- **推荐**: PNG（支持透明）
- **备选**: SVG（矢量，可缩放）
- **不推荐**: JPG（不支持透明）

### 设计要求
- **背景**: 透明
- **风格**: 简洁、清晰、易识别
- **颜色**: 建议使用亮色（在深色背景上显示）
- **细节**: 避免过于复杂的细节（图标较小）

---

## 替换方法

### 方法1：使用图片文件（推荐）

#### 步骤1：准备素材

将图片放到 `public/assets/skills/` 目录：

```
public/
└── assets/
    └── skills/
        ├── laptop.png
        ├── takeout.png
        ├── fishing.png
        ├── ebike.png
        ├── ai_tool.png
        ├── exam_mode.png
        └── six_arts.png
```

#### 步骤2：修改代码

打开 `src/ui/SkillIconsDisplay.jsx`，修改 `getSkillIcon` 函数：

```javascript
// 在组件顶部添加
const skillImages = useRef({})

// 在useEffect中预加载图片
useEffect(() => {
  const skillIds = ['laptop', 'takeout', 'fishing', 'ebike', 'ai_tool', 'exam_mode', 'six_arts']
  
  skillIds.forEach(id => {
    const img = new Image()
    img.src = `/assets/skills/${id}.png`
    img.onload = () => {
      skillImages.current[id] = img
    }
  })
}, [])

// 修改SkillIcon组件的渲染
function SkillIcon({ skill, cooldown, index }) {
  const getSkillIcon = () => {
    if (!skill) return '?'
    return skill.id // 返回ID而不是Emoji
  }

  const renderIcon = () => {
    if (!skill) {
      return <span className="skill-icon-symbol">?</span>
    }
    
    const img = skillImages.current[skill.id]
    if (img) {
      return (
        <img 
          src={img.src} 
          alt={skill.id}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      )
    }
    
    // 降级到Emoji
    const iconMap = {
      laptop: '💻',
      takeout: '🍱',
      // ... 其他映射
    }
    return <span className="skill-icon-symbol">{iconMap[skill.id] || '⭐'}</span>
  }

  return (
    <div className={`skill-icon ${skill ? 'active' : 'empty'} ${cooldown?.ready ? 'ready' : ''}`}>
      <div className="skill-icon-diamond">
        <div className="skill-icon-inner">
          {renderIcon()}
        </div>
        
        {/* 冷却遮罩和文本 */}
        {skill && cooldown && !cooldown.ready && (
          <>
            <div 
              className="skill-cooldown-overlay"
              style={{ height: `${getCooldownPercent()}%` }}
            />
            <div className="skill-cooldown-text">
              {getCooldownText()}
            </div>
          </>
        )}
      </div>
      
      <div className="skill-slot-number">{index + 1}</div>
    </div>
  )
}
```

---

### 方法2：使用Sprite Sheet（适合动画）

#### 步骤1：准备Sprite Sheet

创建一个包含所有技能图标的大图：

```
[💻][🍱][🎣][🛵]
[🤖][📝][🎨][  ]
```

文件：`public/assets/skills/sprite.png`（512x256px，每个图标64x64px）

#### 步骤2：定义Sprite位置

```javascript
const SPRITE_MAP = {
  laptop: { x: 0, y: 0 },
  takeout: { x: 64, y: 0 },
  fishing: { x: 128, y: 0 },
  ebike: { x: 192, y: 0 },
  ai_tool: { x: 0, y: 64 },
  exam_mode: { x: 64, y: 64 },
  six_arts: { x: 128, y: 64 }
}
```

#### 步骤3：使用CSS Background

```css
.skill-icon-sprite {
  width: 64px;
  height: 64px;
  background-image: url('/assets/skills/sprite.png');
  background-size: 512px 256px;
}

.skill-icon-sprite.laptop {
  background-position: 0 0;
}

.skill-icon-sprite.takeout {
  background-position: -64px 0;
}

/* ... 其他位置 */
```

---

### 方法3：使用SVG（矢量图标）

#### 步骤1：准备SVG文件

```
public/
└── assets/
    └── skills/
        └── laptop.svg
```

#### 步骤2：直接使用SVG

```javascript
function SkillIcon({ skill }) {
  if (!skill) return <span>?</span>
  
  return (
    <img 
      src={`/assets/skills/${skill.id}.svg`}
      alt={skill.id}
      className="skill-icon-svg"
    />
  )
}
```

```css
.skill-icon-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8));
}
```

---

## 完整示例代码

### SkillIconsDisplay.jsx（使用图片）

```javascript
import React, { useEffect, useState, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import './SkillIconsDisplay.css'

export default function SkillIconsDisplay({ combatManager }) {
  const [skills, setSkills] = useState([])
  const [cooldowns, setCooldowns] = useState({})
  const skillImagesRef = useRef({})
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // 预加载技能图片
  useEffect(() => {
    const skillIds = ['laptop', 'takeout', 'fishing', 'ebike', 'ai_tool', 'exam_mode', 'six_arts']
    let loadedCount = 0
    
    skillIds.forEach(id => {
      const img = new Image()
      img.src = `/assets/skills/${id}.png`
      img.onload = () => {
        skillImagesRef.current[id] = img
        loadedCount++
        if (loadedCount === skillIds.length) {
          setImagesLoaded(true)
        }
      }
      img.onerror = () => {
        console.warn(`Failed to load skill icon: ${id}`)
        loadedCount++
        if (loadedCount === skillIds.length) {
          setImagesLoaded(true)
        }
      }
    })
  }, [])

  useEffect(() => {
    if (!combatManager) return

    const interval = setInterval(() => {
      const activeSkills = useGameStore.getState().getActiveSkills()
      setSkills(activeSkills)

      const cds = {}
      activeSkills.forEach(skill => {
        const cd = combatManager.skillManager.getSkillCooldown(skill.id)
        const maxCd = combatManager.skillManager.getSkillMaxCooldown(skill.id)
        cds[skill.id] = {
          current: cd,
          max: maxCd,
          ready: cd <= 0
        }
      })
      setCooldowns(cds)
    }, 100)

    return () => clearInterval(interval)
  }, [combatManager])

  const slots = [0, 1, 2]

  return (
    <div className="skill-icons-container">
      {slots.map(index => {
        const skill = skills[index]
        const cd = skill ? cooldowns[skill.id] : null

        return (
          <SkillIcon
            key={index}
            skill={skill}
            cooldown={cd}
            index={index}
            skillImage={skill ? skillImagesRef.current[skill.id] : null}
          />
        )
      })}
    </div>
  )
}

function SkillIcon({ skill, cooldown, index, skillImage }) {
  const getCooldownPercent = () => {
    if (!cooldown || !cooldown.max) return 0
    return (cooldown.current / cooldown.max) * 100
  }

  const getCooldownText = () => {
    if (!cooldown || cooldown.ready) return ''
    return cooldown.current.toFixed(1) + 's'
  }

  // Emoji降级方案
  const getEmojiIcon = () => {
    if (!skill) return '?'
    
    const iconMap = {
      laptop: '💻',
      takeout: '🍱',
      fishing: '🎣',
      ebike: '🛵',
      ai_tool: '🤖',
      exam_mode: '📝',
      six_arts: '🎨'
    }
    
    return iconMap[skill.id] || '⭐'
  }

  return (
    <div className={`skill-icon ${skill ? 'active' : 'empty'} ${cooldown?.ready ? 'ready' : ''}`}>
      <div className="skill-icon-diamond">
        <div className="skill-icon-inner">
          {skillImage ? (
            <img 
              src={skillImage.src}
              alt={skill?.id}
              className="skill-icon-image"
            />
          ) : (
            <span className="skill-icon-symbol">{getEmojiIcon()}</span>
          )}
        </div>
        
        {skill && cooldown && !cooldown.ready && (
          <>
            <div 
              className="skill-cooldown-overlay"
              style={{ height: `${getCooldownPercent()}%` }}
            />
            <div className="skill-cooldown-text">
              {getCooldownText()}
            </div>
          </>
        )}
      </div>
      
      <div className="skill-slot-number">{index + 1}</div>
    </div>
  )
}
```

### SkillIconsDisplay.css（添加图片样式）

```css
.skill-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8));
}

.skill-icon.empty .skill-icon-image {
  opacity: 0.3;
  filter: grayscale(100%) drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8));
}

.skill-icon.ready .skill-icon-image {
  filter: drop-shadow(0 0 8px rgba(0, 255, 0, 0.8));
}
```

---

## 设计建议

### 图标风格

1. **扁平化设计**
   - 简洁的形状
   - 纯色或简单渐变
   - 易于识别

2. **线条风格**
   - 白色线条
   - 透明背景
   - 适合深色主题

3. **FGO风格**
   - 金色边框
   - 华丽装饰
   - 符合游戏主题

### 颜色方案

- **主色调**: 白色/金色（在深色背景上显示）
- **强调色**: 根据技能类型（攻击=红色，辅助=蓝色）
- **背景**: 透明或深色

### 动画效果（可选）

```css
/* 就绪时旋转 */
.skill-icon.ready .skill-icon-image {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 冷却中灰度 */
.skill-icon:not(.ready) .skill-icon-image {
  filter: grayscale(50%);
}
```

---

## 常见问题

### Q: 图片加载失败怎么办？

A: 代码中已包含降级方案，会自动使用Emoji。

### Q: 如何支持Retina显示？

A: 使用2倍尺寸的图片（128x128px），CSS中设置为64x64px。

### Q: 可以使用动画GIF吗？

A: 可以，但不推荐（性能问题）。建议使用CSS动画或Sprite Sheet。

### Q: 如何批量生成图标？

A: 可以使用工具如：
- Figma（设计）
- ImageMagick（批量处理）
- SVGO（SVG优化）

---

## 性能优化

### 预加载

```javascript
// 游戏启动时预加载所有图标
const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = url
        img.onload = resolve
        img.onerror = reject
      })
    })
  )
}
```

### 懒加载

```javascript
// 只加载当前激活的技能图标
useEffect(() => {
  skills.forEach(skill => {
    if (!skillImagesRef.current[skill.id]) {
      const img = new Image()
      img.src = `/assets/skills/${skill.id}.png`
      img.onload = () => {
        skillImagesRef.current[skill.id] = img
        forceUpdate() // 触发重新渲染
      }
    }
  })
}, [skills])
```

### 使用WebP格式

```javascript
// 检测浏览器支持
const supportsWebP = () => {
  const canvas = document.createElement('canvas')
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

// 使用WebP或PNG
const ext = supportsWebP() ? 'webp' : 'png'
img.src = `/assets/skills/${id}.${ext}`
```

---

## 总结

1. **当前**: 使用Emoji占位符
2. **推荐**: PNG图片（64x64px，透明背景）
3. **高级**: Sprite Sheet或SVG
4. **位置**: `public/assets/skills/`
5. **代码**: 修改 `SkillIconsDisplay.jsx`

需要帮助实现图片替换，请告诉我！
