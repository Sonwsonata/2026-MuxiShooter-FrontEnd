// src/game/skill/skillDefinitions.js

/**
 * 技能定义
 * 基于PDF文档中的7个技能
 */

export const SKILLS = {
  // 1. 笔记本电脑
  laptop: {
    id: 'laptop',
    name: '笔记本电脑',
    type: 'active',
    cd: 2,
    duration: 0, // 瞬发
    description: '释放技能时向前打出1排3个弹幕',
    
    baseEffect: {
      pattern: 'line',
      bulletCount: 3,
      rows: 1,
      damageMultiplier: 2.5, // 基础倍率300%的平均值(2-3)
      pierce: 0
    },

    upgrades: {
      // 金色强化
      gold: [],
      
      // 银色强化
      silver: [
        {
          id: 'laptop_solid_state',
          name: '固态硬盘',
          tier: 'silver',
          description: '本技能弹幕穿透人数+1',
          effect: { pierce: 1 }
        },
        {
          id: 'laptop_keyboard',
          name: '机械键盘',
          tier: 'silver',
          description: '本技能弹幕爆伤+50%',
          effect: { critDamage: 0.5 }
        },
        {
          id: 'laptop_driver',
          name: '更新驱动',
          tier: 'silver',
          description: '第二次释放的弹幕伤害+50%',
          effect: { secondShotBonus: 0.5 }
        }
      ],
      
      // 铜色强化
      bronze: [
        {
          id: 'laptop_luxury_display',
          name: '豪华显示器',
          tier: 'bronze',
          description: '本技能弹幕可以穿透1名敌人',
          effect: { pierce: 1 }
        },
        {
          id: 'laptop_low_power',
          name: '低耗模式',
          tier: 'bronze',
          description: '本技能弹幕变为2排，但基础伤害-20%',
          effect: { rows: 2, damageMultiplier: -0.2 }
        },
        {
          id: 'laptop_vpn',
          name: '"科学上网"',
          tier: 'bronze',
          description: '本技能弹幕释放2次，但cd+25%',
          effect: { shots: 2, cdIncrease: 0.25 }
        },
        {
          id: 'laptop_disk_cleanup',
          name: '磁盘清理',
          tier: 'bronze',
          description: '本技能弹幕伤害+20%',
          effect: { damageMultiplier: 0.2 }
        },
        {
          id: 'laptop_campus_network',
          name: '校园网',
          tier: 'bronze',
          description: '本技能cd-8%',
          effect: { cdReduce: 0.08 }
        },
        {
          id: 'laptop_hotkey',
          name: '快捷键',
          tier: 'bronze',
          description: '本技能暴击率+8%',
          effect: { critRate: 0.08 }
        }
      ]
    }
  },

  // 2. 外卖
  takeout: {
    id: 'takeout',
    name: '外卖',
    type: 'active',
    cd: 10,
    duration: 5,
    description: '释放技能期间在普攻两侧额外发射弹幕',
    
    baseEffect: {
      pattern: 'side',
      bulletPerSide: 2,
      damageMultiplier: 1.0, // 100%
      frequency: 4, // 每秒4次
      converge: false
    },

    upgrades: {
      gold: [],
      
      silver: [
        {
          id: 'takeout_precise_delivery',
          name: '精准起送',
          tier: 'silver',
          description: '本技能弹幕频率+20%',
          effect: { frequency: 0.2 }
        },
        {
          id: 'takeout_drama',
          name: '下饭剧',
          tier: 'silver',
          description: '本技能持续+8%',
          effect: { durationIncrease: 0.08 }
        }
      ],
      
      bronze: [
        {
          id: 'takeout_locker',
          name: '外卖柜监控',
          tier: 'bronze',
          description: '每次额外发射2发弹幕，但基础伤害-20%',
          effect: { bulletPerSide: 2, damageMultiplier: -0.2 }
        },
        {
          id: 'takeout_light_diet',
          name: '轻量化饮食',
          tier: 'bronze',
          description: '本技能弹幕向中心收束',
          effect: { converge: true }
        },
        {
          id: 'takeout_overtime',
          name: '"搞劳"',
          tier: 'bronze',
          description: '每次额外发射2发弹幕，但cd+40%',
          effect: { bulletPerSide: 2, cdIncrease: 0.4 }
        },
        {
          id: 'takeout_free_delivery',
          name: '免配送费',
          tier: 'bronze',
          description: '外圈弹幕伤害+50%',
          effect: { outerDamageBonus: 0.5 }
        },
        {
          id: 'takeout_discount',
          name: '满减券',
          tier: 'bronze',
          description: '本技能cd-8%',
          effect: { cdReduce: 0.08 }
        },
        {
          id: 'takeout_rush',
          name: '急送',
          tier: 'bronze',
          description: '本技能弹幕伤害+20%',
          effect: { damageMultiplier: 0.2 }
        },
        {
          id: 'takeout_black_liquid',
          name: '黑色液体勺',
          tier: 'bronze',
          description: '本技能暴击率+5%',
          effect: { critRate: 0.05 }
        }
      ]
    }
  },

  // 3. 换鱼宝典
  fish_swap: {
    id: 'fish_swap',
    name: '换鱼宝典',
    type: 'active',
    cd: 3,
    duration: 0,
    description: '施放技能时向前打出横向共计5发弹幕',
    
    baseEffect: {
      pattern: 'horizontal',
      bulletCount: 5,
      damageMultiplier: 1.0, // 100%
      spread: 1.0,
      pierce: 0
    },

    upgrades: {
      gold: [],
      
      silver: [
        {
          id: 'fish_ddl',
          name: 'ddl',
          tier: 'silver',
          description: '枪头弹幕伤害+30%',
          effect: { centerDamageBonus: 0.3 }
        },
        {
          id: 'fish_pretend_work',
          name: '假装工作',
          tier: 'silver',
          description: '穿透伤害+20%',
          effect: { pierceDamageBonus: 0.2 }
        }
      ],
      
      bronze: [
        {
          id: 'fish_radar',
          name: '换鱼雷达',
          tier: 'bronze',
          description: '弹幕范围增加',
          effect: { spread: 0.3 }
        },
        {
          id: 'fish_escape',
          name: '跑路',
          tier: 'bronze',
          description: '枪头弹幕穿透人数+1，但基础伤害-40%',
          effect: { pierce: 1, damageMultiplier: -0.4 }
        },
        {
          id: 'fish_walk_through',
          name: '脚所通走',
          tier: 'bronze',
          description: '弹幕范围进一步增加，但cd+30%',
          effect: { spread: 0.5, cdIncrease: 0.3 }
        },
        {
          id: 'fish_dnd',
          name: '消息免打扰',
          tier: 'bronze',
          description: '枪头弹幕伤害+50%',
          effect: { centerDamageBonus: 0.5 }
        },
        {
          id: 'fish_timer',
          name: '换鱼计时',
          tier: 'bronze',
          description: '本技能cd-8%',
          effect: { cdReduce: 0.08 }
        },
        {
          id: 'fish_drink',
          name: '喝水',
          tier: 'bronze',
          description: '本技能弹幕伤害+20%',
          effect: { damageMultiplier: 0.2 }
        },
        {
          id: 'fish_quick_switch',
          name: '快速切屏',
          tier: 'bronze',
          description: '本技能暴击率+8%',
          effect: { critRate: 0.08 }
        }
      ]
    }
  },

  // 4. 电动车
  electric_car: {
    id: 'electric_car',
    name: '电动车',
    type: 'active',
    cd: 10,
    duration: 3,
    description: '施放技能期间普攻速度增加100%',
    
    baseEffect: {
      attackSpeedBonus: 1.0, // 100%
      moveSpeedBonus: 0,
      permanent: false
    },

    upgrades: {
      gold: [],
      
      silver: [
        {
          id: 'car_helmet',
          name: '头盔',
          tier: 'silver',
          description: '技能期间暴击率+5%',
          effect: { critRate: 0.05 }
        },
        {
          id: 'car_charger',
          name: '充电器',
          tier: 'silver',
          description: '本技能持续时间+8%',
          effect: { durationIncrease: 0.08 }
        },
        {
          id: 'car_charging_station',
          name: '充电桩',
          tier: 'silver',
          description: '本技能cd-8%',
          effect: { cdReduce: 0.08 }
        }
      ],
      
      bronze: [
        {
          id: 'car_magic_plate',
          name: '神奇车牌',
          tier: 'bronze',
          description: '技能期间移速+50%',
          effect: { moveSpeedBonus: 0.5 }
        },
        {
          id: 'car_wuhan_traffic',
          name: '武汉交通',
          tier: 'bronze',
          description: '技能期间敌方移速-15%',
          effect: { enemySlow: 0.15 }
        },
        {
          id: 'car_id_code',
          name: '识别码',
          tier: 'bronze',
          description: '本技能变为常驻，效果受持续和冷却加成',
          effect: { permanent: true }
        }
      ]
    }
  },

  // 5. AI工具
  ai_tool: {
    id: 'ai_tool',
    name: 'AI工具',
    type: 'active',
    cd: 20,
    duration: 5,
    description: '技能期间生成1个镜像，同步攻击',
    
    baseEffect: {
      mirrorCount: 1,
      mirrorDamage: 1.0, // 100%
      mirrorDamageBonus: 0
    },

    upgrades: {
      gold: [],
      
      silver: [],
      
      bronze: [
        {
          id: 'ai_polish',
          name: '一键润色',
          tier: 'bronze',
          description: '额外增加1个镜像，但镜像造成伤害-10%',
          effect: { mirrorCount: 1, mirrorDamage: -0.1 }
        },
        {
          id: 'ai_deep_think',
          name: '深度思考',
          tier: 'bronze',
          description: '额外增加1个镜像，但cd+20%',
          effect: { mirrorCount: 1, cdIncrease: 0.2 }
        },
        {
          id: 'ai_co_create',
          name: '"共创"',
          tier: 'bronze',
          description: '技能期间每个镜像提供15%伤害加成',
          effect: { mirrorDamageBonus: 0.15 }
        },
        {
          id: 'ai_free_quota',
          name: '免费额度',
          tier: 'bronze',
          description: '技能持续时间+8%',
          effect: { durationIncrease: 0.08 }
        },
        {
          id: 'ai_cloud_sync',
          name: '云端同步',
          tier: 'bronze',
          description: '镜像造成伤害+20%',
          effect: { mirrorDamage: 0.2 }
        },
        {
          id: 'ai_prompt_optimize',
          name: '提示词优化',
          tier: 'bronze',
          description: '技能cd-8%',
          effect: { cdReduce: 0.08 }
        }
      ]
    }
  },

  // 6. 期末屠模式
  exam_mode: {
    id: 'exam_mode',
    name: '期末屠模式',
    type: 'active',
    cd: 15,
    duration: 5,
    description: '释放技能期间普攻必暴击',
    
    baseEffect: {
      guaranteedCrit: true,
      critDamageBonus: 0,
      applyToSkills: false,
      ignoreDefense: false
    },

    upgrades: {
      gold: [
        {
          id: 'exam_past_papers',
          name: '历年真题',
          tier: 'gold',
          description: '技能期间无视敌方减伤',
          effect: { ignoreDefense: true }
        }
      ],
      
      silver: [],
      
      bronze: [
        {
          id: 'exam_cheat_sheet',
          name: '小抄',
          tier: 'bronze',
          description: '技能期间爆伤+50%，但cd+30%',
          effect: { critDamageBonus: 0.5, cdIncrease: 0.3 }
        },
        {
          id: 'exam_beg',
          name: '求捞',
          tier: 'bronze',
          description: '效果对其他主动技生效，但cd+25%',
          effect: { applyToSkills: true, cdIncrease: 0.25 }
        },
        {
          id: 'exam_online_course',
          name: '网课',
          tier: 'bronze',
          description: '技能期间爆伤+30%',
          effect: { critDamageBonus: 0.3 }
        },
        {
          id: 'exam_ice_tea',
          name: '热带冰红茶',
          tier: 'bronze',
          description: '本技能持续时间+8%',
          effect: { durationIncrease: 0.08 }
        },
        {
          id: 'exam_ppt',
          name: 'PPT',
          tier: 'bronze',
          description: '本技能cd-8%',
          effect: { cdReduce: 0.08 }
        }
      ]
    }
  },

  // 7. 君子六艺
  six_arts: {
    id: 'six_arts',
    name: '君子六艺',
    type: 'active',
    cd: 10,
    duration: 5,
    description: '释放技能期间随机发射25个弹幕',
    
    baseEffect: {
      pattern: 'random',
      bulletCount: 25,
      damageMultiplier: 1.0, // 100%
      bulletSize: 1.0,
      frequency: 5, // 每秒5发
      permanent: false,
      disableOtherSkills: false
    },

    upgrades: {
      gold: [],
      
      silver: [],
      
      bronze: [
        {
          id: 'arts_mahjong',
          name: '麻',
          tier: 'bronze',
          description: '本技能弹幕数量+100%，但基础伤害-30%',
          effect: { bulletCount: 25, damageMultiplier: -0.3 }
        },
        {
          id: 'arts_filial',
          name: '孝',
          tier: 'bronze',
          description: '本技能弹幕尺寸增大(+25%伤害)，但间隔增加',
          effect: { bulletSize: 0.25, damageMultiplier: 0.25, frequency: -0.2 }
        },
        {
          id: 'arts_music',
          name: '乐',
          tier: 'bronze',
          description: '本技能弹幕常驻，但禁用其他主动技能，每个主动技增伤5%',
          effect: { permanent: true, disableOtherSkills: true, damagePerSkill: 0.05 }
        },
        {
          id: 'arts_taboo',
          name: '忌',
          tier: 'bronze',
          description: '本技能弹幕伤害+20%',
          effect: { damageMultiplier: 0.2 }
        },
        {
          id: 'arts_clam',
          name: '蚌',
          tier: 'bronze',
          description: '本技能弹幕间隔-20%',
          effect: { frequency: 0.2 }
        },
        {
          id: 'arts_classic',
          name: '典',
          tier: 'bronze',
          description: '本技能弹幕暴击率+5%',
          effect: { critRate: 0.05 }
        }
      ]
    }
  }
}

/**
 * 获取技能定义
 */
export function getSkillDefinition(skillId) {
  return SKILLS[skillId]
}

/**
 * 获取所有技能ID
 */
export function getAllSkillIds() {
  return Object.keys(SKILLS)
}
