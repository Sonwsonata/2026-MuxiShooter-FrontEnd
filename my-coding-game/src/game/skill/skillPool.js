// src/config/skillPool.js
export const SKILL_POOL = {
  /* ================= 笔记本电脑（你已有，这里保留） ================= */
  笔记本电脑: {
    base: { cd: 2, rows: 1, cols: 3, multiplier: 3 },

    bronze: [
      { id: '磁盘清理', dmgUp: 0.2 },
      { id: '校园网', cdReduce: 0.08 },
      { id: '快捷键', critRate: 0.08 }
    ],
    silver: [
      { id: '固态硬盘', pierce: 1 },
      { id: '机械键盘', critDmg: 0.5 },
      { id: '更新驱动', secondCastDmg: 0.5 }
    ],
    gold: [
      { id: '豪华显示器', pierce: 1 },
      { id: '低耗模式', rows: 2, dmgDown: 0.2 },
      { id: '科学上网', doubleCast: true, cdUp: 0.25 }
    ]
  },

  /* ================= 外卖 ================= */
  外卖: {
    base: {
      duration: 5,
      multiplier: 1,
      extraBullets: 2,
      cd: 10
    },

    bronze: [
      { id: '满减券', cdReduce: 0.08 },
      { id: '急送', dmgUp: 0.2 },
      { id: '黑色液体勺', critRate: 0.05 }
    ],

    silver: [
      { id: '精准起送', fireRateUp: 0.2 },
      { id: '下饭剧', durationUp: 8 }
    ],

    gold: [
      { id: '外卖柜监控', extraBullets: 2, dmgDown: 0.2 },
      { id: '轻量化饮食', converge: true },
      { id: '犒劳', extraBullets: 2, cdUp: 0.4 },
      { id: '免配送费', outerRingDmg: 0.5 }
    ]
  },

  /* ================= 摸鱼宝典 ================= */
  摸鱼宝典: {
    base: {
      bullets: 5,
      multiplier: 1,
      cd: 3
    },

    bronze: [
      { id: '摸鱼计时', cdReduce: 0.08 },
      { id: '喝水', dmgUp: 0.2 },
      { id: '快速切屏', critRate: 0.08 }
    ],

    silver: [
      { id: 'ddl', dmgUp: 0.3 },
      { id: '假装工作', pierceDmgUp: 0.2 }
    ],

    gold: [
      { id: '摸鱼雷达', rangeUp: 0.3 },
      { id: '跑路枪头', pierce: 1, dmgDown: 0.4 },
      { id: '厕所遁走', rangeUp: 0.5, cdUp: 0.3 },
      { id: '消息免打扰', dmgUp: 0.5 }
    ]
  },

  /* ================= 电动车 ================= */
  电动车: {
    base: {
      atkSpeedUp: 1,
      duration: 3,
      cd: 10
    },

    bronze: [
      { id: '头盔', critRate: 0.05 },
      { id: '充电器', durationUp: 8 },
      { id: '充电桩', cdReduce: 0.08 }
    ],

    silver: [],

    gold: [
      { id: '神奇车牌', moveSpeedUp: 0.5 },
      { id: '武汉交通', enemySlow: 0.15 },
      { id: '识别码', permanent: true }
    ]
  },

  /* ================= AI 工具 ================= */
  AI工具: {
    base: {
      mirror: 1,
      duration: 5,
      cd: 20
    },

    bronze: [
      { id: '共创', mirrorDmgBuff: 0.15 },
      { id: '免费额度', durationUp: 8 },
      { id: '云端同步', mirrorDmgUp: 0.2 },
      { id: '提示词优化', cdReduce: 0.08 }
    ],

    silver: [],

    gold: [
      { id: '一键润色', mirror: 1, mirrorDmgDown: 0.1 },
      { id: '深度思考', mirror: 1, cdUp: 0.2 }
    ]
  },

  /* ================= 期末周模式 ================= */
  期末周模式: {
    base: {
      duration: 5,
      cd: 15,
      forceCrit: true
    },

    bronze: [
      { id: '网课', critDmg: 0.3 },
      { id: '热带冰红茶', durationUp: 8 },
      { id: 'PPT', cdReduce: 0.08 }
    ],

    silver: [],

    gold: [
      { id: '小抄', critDmg: 0.5, cdUp: 0.3 },
      { id: '求捞', affectOtherSkills: true, cdUp: 0.25 },
      { id: '历年真题', ignoreDamageReduce: true }
    ]
  },

  /* ================= 君子六艺 ================= */
  君子六艺: {
    base: {
      randomBullets: 25,
      multiplier: 1,
      duration: 5,
      cd: 10
    },

    bronze: [
      { id: '急', dmgUp: 0.2 },
      { id: '蚌', intervalReduce: 0.2 },
      { id: '典', critRate: 0.05 }
    ],

    silver: [],

    gold: [
      { id: '麻', bulletCountUp: 1, dmgDown: 0.3 },
      { id: '孝', sizeUp: 0.25, intervalUp: 0.2 },
      {
        id: '乐',
        permanent: true,
        disableOtherActive: true,
        activeSkillDmgBuff: 0.05
      }
    ]
  }
}
