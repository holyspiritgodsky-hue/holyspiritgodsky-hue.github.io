(function () {
  "use strict";

  const HERO_STORE_KEY = "warHeroProfile";
  const HERO_SESSION_KEY = "warHeroes";
  const PLAYER_STATE_KEY = "warPlayerState";
  const PLAYER_STATE_SESSION_KEY = "warPlayerStateSession";

  const MAIN_PLAYER_DEFINITION = Object.freeze({
    id: "playerMain",
    name: "阿尼塔",
    style: Object.freeze({
      body: "#c49a58",
      head: "#efdba0",
      accent: "#f3e8b8",
      mounted: false
    }),
    stats: Object.freeze({
      hp: 460,
      speed: 210,
      attackRange: 42,
      radius: 11
    }),
    skill: Object.freeze({
      key: "saber",
      label: "主公斩击",
      damage: 38,
      cooldown: 0.34,
      range: 42
    })
  });

  const HERO_DEFINITIONS = Object.freeze({
    zhugeliang: Object.freeze({
      id: "zhugeliang",
      name: "诸葛亮",
      style: Object.freeze({
        body: "#bddcf4",
        head: "#e8c89a",
        accent: "#7fa9d0",
        mounted: false
      }),
      stats: Object.freeze({
        hp: 300,
        speed: 198,
        attackRange: 310,
        radius: 11
      }),
      skill: Object.freeze({
        key: "lightning",
        label: "卧龙天雷",
        damage: 44,
        cooldown: 1.05,
        range: 310,
        splash: 52
      })
    }),
    lancelot: Object.freeze({
      id: "lancelot",
      name: "兰斯洛特",
      style: Object.freeze({
        body: "#d3d6df",
        head: "#e8c89a",
        accent: "#c53131",
        mounted: false
      }),
      stats: Object.freeze({
        hp: 360,
        speed: 230,
        attackRange: 38,
        radius: 12
      }),
      skill: Object.freeze({
        key: "slash",
        label: "骑士突斩",
        damage: 50,
        cooldown: 0.42,
        range: 46
      })
    }),
    sanada: Object.freeze({
      id: "sanada",
      name: "真田幸村",
      style: Object.freeze({
        body: "#cb3838",
        head: "#e7be90",
        accent: "#f2d07d",
        mounted: true
      }),
      stats: Object.freeze({
        hp: 390,
        speed: 236,
        attackRange: 40,
        radius: 10
      }),
      skill: Object.freeze({
        key: "charge",
        label: "赤备突击",
        damage: 56,
        cooldown: 0.38,
        range: 44
      })
    }),
    sunshangxiang: Object.freeze({
      id: "sunshangxiang",
      name: "孙尚香",
      style: Object.freeze({
        body: "#5f88d8",
        head: "#f0c9a2",
        accent: "#f0d78d",
        mounted: false
      }),
      stats: Object.freeze({
        hp: 280,
        speed: 216,
        attackRange: 285,
        radius: 11
      }),
      skill: Object.freeze({
        key: "arrow",
        label: "尚香箭雨",
        damage: 36,
        cooldown: 0.72,
        range: 285
      })
    }),
    daqiao: Object.freeze({
      id: "daqiao",
      name: "大乔",
      style: Object.freeze({
        body: "#e9a8b4",
        head: "#f0cfac",
        accent: "#ffe6ec",
        mounted: false
      }),
      stats: Object.freeze({
        hp: 250,
        speed: 204,
        attackRange: 0,
        radius: 11
      }),
      skill: Object.freeze({
        key: "goldAura",
        label: "江东财运",
        damage: 0,
        cooldown: 4,
        range: 0
      })
    }),
    xiaoqiao: Object.freeze({
      id: "xiaoqiao",
      name: "小乔",
      style: Object.freeze({
        body: "#d7a7f0",
        head: "#f0cfac",
        accent: "#fbe7ff",
        mounted: false
      }),
      stats: Object.freeze({
        hp: 240,
        speed: 208,
        attackRange: 120,
        radius: 11
      }),
      skill: Object.freeze({
        key: "charm",
        label: "乔音扰心",
        damage: 14,
        cooldown: 1.3,
        range: 120
      })
    }),
    elizabeth: Object.freeze({
      id: "elizabeth",
      name: "伊丽莎白",
      style: Object.freeze({
        body: "#4d5f9a",
        head: "#f0d4b2",
        accent: "#f1deb0",
        mounted: false
      }),
      stats: Object.freeze({
        hp: 300,
        speed: 198,
        attackRange: 0,
        radius: 11
      }),
      skill: Object.freeze({
        key: "healAura",
        label: "王室赐福",
        damage: 0,
        cooldown: 2.4,
        range: 170
      })
    }),
    anita: Object.freeze({
      id: "anita",
      name: "阿妮塔",
      style: Object.freeze({
        body: "#8b2f24",
        head: "#f0cfac",
        accent: "#f6dd97",
        mounted: false
      }),
      stats: Object.freeze({
        hp: 320,
        speed: 224,
        attackRange: 280,
        radius: 11
      }),
      skill: Object.freeze({
        key: "kiteVolley",
        label: "游击点射",
        damage: 34,
        cooldown: 0.9,
        range: 280
      })
    }),
    jeanne: Object.freeze({
      id: "jeanne",
      name: "贞德",
      style: Object.freeze({
        body: "#c49a58",
        head: "#efdba0",
        accent: "#f3e8b8",
        mounted: false
      }),
      stats: Object.freeze({
        hp: 460,
        speed: 210,
        attackRange: 200,
        radius: 11
      }),
      skill: Object.freeze({
        key: "freedom",
        label: "为了自由！",
        shout: "为了自由！",
        damage: 18,
        cooldown: 8,
        range: 200
      })
    })
  });

  const CAMPAIGN_UNIT_TEMPLATES = Object.freeze({
    jeannePlayer: Object.freeze({
      kind: "player",
      team: "ally",
      label: "贞德",
      hp: 520,
      speed: 228,
      attackRange: 46,
      damage: 12,
      radius: 20,
      isPlayer: true,
      stroke: "rgba(98, 56, 20, 0.7)",
      sprite: Object.freeze({
        idleSrc: "img/hero3/idle.png",
        moveSrc: "img/hero3/move.png",
        attackPattern: "img/hero3/attack/attack-{index}.png",
        attackFrames: 17,
        width: 64,
        height: 72,
        offsetX: -32,
        offsetY: -44
      })
    }),
    orleansDefender: Object.freeze({
      kind: "defender",
      team: "ally",
      label: "城防军",
      hp: 110,
      speed: 126,
      attackRange: 34,
      damage: 13,
      radius: 16,
      appearance: Object.freeze({
        body: "#b7bec8",
        head: "#efdbc2",
        accent: "#eef3f8",
        trim: "#556170",
        hair: "#5a3b21",
        weapon: "#f2f6fb",
        plume: "#d9c06b",
        cape: "#8994a5",
        helmet: true,
        surcoat: "#ece6d8",
        horseBody: "#7b6857",
        horseMane: "#47372d",
        horseArmor: "#bfc7d1"
      })
    }),
    englishFootman: Object.freeze({
      kind: "soldier",
      team: "enemy",
      label: "英军步兵",
      hp: 68,
      speed: 110,
      attackRange: 30,
      damage: 9,
      radius: 16,
      appearance: Object.freeze({
        body: "#9c5350",
        head: "#efcfb1",
        accent: "#c9d2df",
        trim: "#4d2320",
        hair: "#3c251a",
        weapon: "#d8e0ea",
        plume: "#d2d8e4",
        cape: "#743331",
        helmet: true
      })
    }),
    englishCommander: Object.freeze({
      kind: "commander",
      team: "enemy",
      label: "塔尔博特",
      hp: 180,
      speed: 84,
      attackRange: 36,
      damage: 18,
      radius: 24,
      isCommander: true,
      stroke: "rgba(72, 18, 11, 0.78)",
      appearance: Object.freeze({
        body: "#7d2f2a",
        head: "#efcfb1",
        accent: "#d9b76b",
        trim: "#2f1210",
        hair: "#251510",
        weapon: "#f0f4f8",
        plume: "#c74435",
        cape: "#53201d",
        helmet: true
      })
    }),
    charles: Object.freeze({
      kind: "vip",
      team: "ally",
	  label: "查理国王",
      hp: 180,
      speed: 116,
      attackRange: 0,
      damage: 0,
      radius: 19,
      isVip: true,
      followDistance: 60,
      appearance: Object.freeze({
        body: "#b89a47",
        head: "#efd4b0",
        accent: "#f3e4aa",
        trim: "#6f5319",
        hair: "#6c521d",
        weapon: "#d9bb65",
        plume: "#f6df8d",
        cape: "#7d5f20"
      })
    }),
    royalEscort: Object.freeze({
      kind: "escort",
      team: "ally",
      label: "护卫骑士",
      hp: 120,
      speed: 132,
      attackRange: 34,
      damage: 15,
      radius: 16,
      appearance: Object.freeze({
        body: "#bcc3cd",
        head: "#efd8bb",
        accent: "#f0f5fb",
        trim: "#505d6e",
        hair: "#4a3728",
        weapon: "#f5f8fc",
        plume: "#f0f2f5",
        cape: "#7a8799",
        helmet: true,
        surcoat: "#ebe5d6"
      })
    }),
    ambusher: Object.freeze({
      kind: "raider",
      team: "enemy",
      label: "伏兵",
      hp: 70,
      speed: 120,
      attackRange: 31,
      damage: 10,
      radius: 16,
      appearance: Object.freeze({
        body: "#9a6044",
        head: "#e8c4a5",
        accent: "#cfb28d",
        trim: "#4b291d",
        hair: "#3c2518",
        weapon: "#dfe6ee",
        plume: "#73442f",
        cape: "#5f3727"
      })
    }),
    prisonGuard: Object.freeze({
      kind: "guard",
      team: "enemy",
      label: "狱卒",
      hp: 96,
      speed: 116,
      attackRange: 30,
      damage: 12,
      radius: 16,
      visionRange: 250,
      visionArc: 0.72,
      appearance: Object.freeze({
        body: "#76808f",
        head: "#e6c6a6",
        accent: "#c8d0d8",
        trim: "#353b45",
        hair: "#2b2f36",
        weapon: "#d7dde5",
        plume: "#9ea6b3",
        cape: "#4d5561",
        helmet: true
      })
    }),
    prisonReinforcement: Object.freeze({
      kind: "guard",
      team: "enemy",
      label: "狱卒援军",
      hp: 92,
      speed: 122,
      attackRange: 32,
      damage: 13,
      radius: 16,
      visionRange: 250,
      visionArc: 0.72,
      appearance: Object.freeze({
        body: "#7c8698",
        head: "#e7c8aa",
        accent: "#d7dde5",
        trim: "#363c47",
        hair: "#2b3038",
        weapon: "#e0e5eb",
        plume: "#b1b8c3",
        cape: "#565e6c",
        helmet: true
      })
    }),
    vikingCaptain: Object.freeze({
      kind: "viking",
      team: "ally",
      label: "维京船长",
      hp: 180,
      speed: 0,
      attackRange: 0,
      damage: 0,
      radius: 22,
      isViking: true,
      appearance: Object.freeze({
        body: "#5d8f97",
        head: "#e4c3a2",
        accent: "#d7ecef",
        trim: "#23454e",
        hair: "#7a5825",
        weapon: "#d9e7ea",
        plume: "#d9d5c6",
        cape: "#355d66",
        beard: true
      })
    }),
    vikingWarrior: Object.freeze({
      kind: "viking",
      team: "ally",
      label: "维京战士",
      hp: 140,
      speed: 138,
      attackRange: 36,
      damage: 16,
      radius: 17,
      isViking: true,
      appearance: Object.freeze({
        body: "#5a98a2",
        head: "#e6c7a7",
        accent: "#deeff3",
        trim: "#1e4750",
        hair: "#7c5d2b",
        weapon: "#ecf3f7",
        plume: "#e6e0cf",
        cape: "#2d616a",
        beard: true
      })
    }),
    zhengheRescuer: Object.freeze({
      kind: "rescuer",
      team: "ally",
      label: "郑和",
      hp: 210,
      speed: 142,
      attackRange: 38,
      damage: 18,
      radius: 18,
      followDistance: 72,
      appearance: Object.freeze({
        body: "#4f768d",
        head: "#e5c5a3",
        accent: "#dbeaf1",
        trim: "#1e3f4e",
        hair: "#2d231c",
        weapon: "#eef4f7",
        plume: "#d9e6ed",
        cape: "#2e5668",
        surcoat: "#d3e2ea",
        beard: true
      })
    }),
    anitaScout: Object.freeze({
      kind: "anita",
      team: "ally",
      label: "阿妮塔",
      hp: 210,
      speed: 172,
      attackRange: 260,
      damage: 18,
      radius: 18,
      followDistance: 180,
      stroke: "rgba(90, 28, 16, 0.72)",
      mounted: false,
      appearance: Object.freeze({
        body: "#8b2f24",
        head: "#efcfac",
        accent: "#f6dd97",
        trim: "#4a1f1d",
        hair: "#3b2418",
        weapon: "#f3f5f7",
        plume: "#d9a43a",
        cape: "#6d241b",
        surcoat: "#f0d68f"
      })
    }),
    spanishGuard: Object.freeze({
      kind: "soldier",
      team: "enemy",
      label: "海岸守军",
      hp: 88,
      speed: 124,
      attackRange: 32,
      damage: 13,
      radius: 16,
      appearance: Object.freeze({
        body: "#a76743",
        head: "#eac8a7",
        accent: "#d7d0c2",
        trim: "#5f2918",
        hair: "#3b2418",
        weapon: "#e9edf2",
        plume: "#ccb48d",
        cape: "#6a3521",
        helmet: true
      })
    }),
    spanishGovernor: Object.freeze({
      kind: "governor",
      team: "enemy",
      label: "西班牙总督",
      hp: 260,
      speed: 96,
      attackRange: 36,
      damage: 26,
      radius: 25,
      isCommander: true,
      stroke: "rgba(71, 17, 12, 0.78)",
      appearance: Object.freeze({
        body: "#783127",
        head: "#eccbad",
        accent: "#e2c36f",
        trim: "#37140d",
        hair: "#2f1812",
        weapon: "#f0f2f5",
        plume: "#cf4d39",
        cape: "#541f18",
        helmet: true
      })
    })
  });

  const HERO_IDS = Object.freeze(Object.keys(HERO_DEFINITIONS));

  function defaultFlags() {
    return {
      zhugeliang: false,
      lancelot: false,
      sanada: false,
      sunshangxiang: false,
      daqiao: false,
      xiaoqiao: false,
      elizabeth: false,
      anita: false,
      jeanne: false
    };
  }

  function normalizeFlags(input) {
    const out = defaultFlags();
    if (!input || typeof input !== "object") return out;
    for (const id of HERO_IDS) {
      out[id] = !!input[id];
    }
    return out;
  }

  function parseJsonSafe(raw) {
    try {
      const value = JSON.parse(raw || "{}");
      return value && typeof value === "object" ? value : {};
    } catch (_e) {
      return {};
    }
  }

  function defaultPlayerState() {
    return {
      mounted: false,
      goldBlade: false,
      jeanneLevel: 1,
      jeanneXp: 0,
	  jeanneTotalXp: 0,
	  jeanneFarmLevel: 0,
	  jeanneHpSkillLevel: 0
    };
  }

  function normalizePlayerState(input) {
    const out = defaultPlayerState();
    if (!input || typeof input !== "object") return out;
    out.mounted = !!input.mounted;
    out.goldBlade = !!input.goldBlade;
    const jeanneLevel = Number(input.jeanneLevel);
    const jeanneXp = Number(input.jeanneXp);
    const jeanneTotalXp = Number(input.jeanneTotalXp);
    const jeanneFarmLevel = Number(input.jeanneFarmLevel);
    const jeanneHpSkillLevel = Number(input.jeanneHpSkillLevel);
    out.jeanneLevel = Number.isFinite(jeanneLevel) ? Math.max(1, Math.floor(jeanneLevel)) : 1;
    out.jeanneXp = Number.isFinite(jeanneXp) ? Math.max(0, Math.floor(jeanneXp)) : 0;
    out.jeanneTotalXp = Number.isFinite(jeanneTotalXp) ? Math.max(0, Math.floor(jeanneTotalXp)) : 0;
  	out.jeanneFarmLevel = Number.isFinite(jeanneFarmLevel) ? Math.max(0, Math.floor(jeanneFarmLevel)) : 0;
  	out.jeanneHpSkillLevel = Number.isFinite(jeanneHpSkillLevel) ? Math.max(0, Math.floor(jeanneHpSkillLevel)) : 0;
    return out;
  }

  function readStoredFlags() {
    const local = parseJsonSafe(localStorage.getItem(HERO_STORE_KEY));
    const session = parseJsonSafe(sessionStorage.getItem(HERO_SESSION_KEY));
    const merged = {};
    for (const id of HERO_IDS) {
      merged[id] = !!(local[id] || session[id]);
    }
    return normalizeFlags(merged);
  }

  function writeStoredFlags(flags) {
    const normalized = normalizeFlags(flags);
    localStorage.setItem(HERO_STORE_KEY, JSON.stringify(normalized));
    sessionStorage.setItem(HERO_SESSION_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function readStoredPlayerState() {
    const local = parseJsonSafe(localStorage.getItem(PLAYER_STATE_KEY));
    const session = parseJsonSafe(sessionStorage.getItem(PLAYER_STATE_SESSION_KEY));
    return normalizePlayerState(Object.assign({}, local, session));
  }

  function writeStoredPlayerState(state) {
    const normalized = normalizePlayerState(state);
    localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(normalized));
    sessionStorage.setItem(PLAYER_STATE_SESSION_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function savePlayerState(patch) {
    const current = readStoredPlayerState();
    const merged = normalizePlayerState(Object.assign({}, current, patch || {}));
    return writeStoredPlayerState(merged);
  }

  function saveFlags(patch) {
    const current = readStoredFlags();
    const merged = normalizeFlags(Object.assign({}, current, patch || {}));
    return writeStoredFlags(merged);
  }

  function getHeroDefinition(id) {
    return HERO_DEFINITIONS[id] || null;
  }

  function getCampaignUnitTemplate(id) {
    return CAMPAIGN_UNIT_TEMPLATES[id] || null;
  }

  function createCampaignUnit(id, x, y, overrides) {
    const def = getCampaignUnitTemplate(id);
    if (!def) return null;
    const base = {
      templateId: id,
      kind: def.kind,
      team: def.team,
      label: def.label,
      x: x,
      y: y,
      hp: def.hp,
      maxHp: def.hp,
      speed: def.speed,
      attackRange: def.attackRange,
      damage: def.damage,
      radius: def.radius,
      r: def.radius,
      stroke: def.stroke || "rgba(0,0,0,0.38)",
      mounted: !!def.mounted,
      followDistance: def.followDistance || 100,
      visionRange: def.visionRange || 240,
      visionArc: def.visionArc || 0.9,
      appearance: def.appearance ? Object.assign({}, def.appearance) : null,
      sprite: def.sprite ? Object.assign({}, def.sprite) : null,
      isCommander: !!def.isCommander,
      isVip: !!def.isVip,
      isViking: !!def.isViking,
      isPlayer: !!def.isPlayer
    };
    return Object.assign(base, overrides || {});
  }

  function createCompanion(id, x, y, overrides) {
    const def = getHeroDefinition(id);
    if (!def) return null;
    const base = {
      heroId: id,
      name: def.name,
      x: x,
      y: y,
      r: def.stats.radius || 10,
      radius: def.stats.radius || 10,
      hp: def.stats.hp || 300,
      maxHp: def.stats.hp || 300,
      speed: def.stats.speed || 205,
      attackRange: def.stats.attackRange || 40,
      attackCd: 0,
      dir: 0,
      dead: false,
      body: def.style.body,
      head: def.style.head,
      accent: def.style.accent,
      mounted: !!def.style.mounted,
      skill: def.skill ? Object.assign({}, def.skill) : null
    };
    return Object.assign(base, overrides || {});
  }

  function createMainPlayer(x, y, overrides) {
    const def = MAIN_PLAYER_DEFINITION;
    const state = readStoredPlayerState();
    const base = {
      heroId: def.id,
      name: def.name,
      x: x,
      y: y,
      r: def.stats.radius || 11,
      radius: def.stats.radius || 11,
      hp: def.stats.hp || 460,
      maxHp: def.stats.hp || 460,
      speed: def.stats.speed || 210,
      attackRange: def.stats.attackRange || 42,
      attackCd: 0,
      dir: 0,
      body: def.style.body,
      head: def.style.head,
      accent: def.style.accent,
      mounted: state.mounted || !!def.style.mounted,
      goldBlade: !!state.goldBlade,
      skill: def.skill ? Object.assign({}, def.skill) : null,
      dead: false
    };
    return Object.assign(base, overrides || {});
  }

  function pushAwayOnly(attacker, target, amount) {
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const d = Math.hypot(dx, dy) || 0.001;
    target.x += (dx / d) * amount;
    target.y += (dy / d) * amount;
  }

  function updateZhugeliangAlly(opts) {
    const a = opts.hero;
    const player = opts.player;
    const enemyUnits = opts.enemyUnits;
    const enemyLeaders = opts.enemyLeaders;
    const dist = opts.dist;
    const moveToward = opts.moveToward;
    const createLightningFx = opts.createLightningFx;
    const skillFx = opts.skillFx;

    a.hitFlash = Math.max(0, (a.hitFlash || 0) - opts.dt * 1.6);
    if (dist(a, player) > 80) {
      moveToward(a, player.x, player.y, a.speed, opts.dt);
    }

    let bestTarget = null;
    let bestD = Infinity;
    const atkRange = a.attackRange || 310;

    for (const u of enemyUnits) {
      if (u.dead) continue;
      const d = dist(a, u);
      if (d < atkRange && d < bestD) {
        bestTarget = u;
        bestD = d;
      }
    }

    for (const l of enemyLeaders) {
      if (l.dead) continue;
      const d = dist(a, l);
      if (d < atkRange && d < bestD) {
        bestTarget = l;
        bestD = d;
      }
    }

    if (!bestTarget || a.attackCd > 0) return;

    a.attackCd = 2.8;
    a.dir = Math.atan2(bestTarget.y - a.y, bestTarget.x - a.x);
    bestTarget.hp -= 55;

    if (bestTarget.hitFlash !== undefined) {
      bestTarget.hitFlash = Math.max(bestTarget.hitFlash || 0, 0.7);
    }

    for (const u of enemyUnits) {
      if (!u.dead && u !== bestTarget && dist(u, bestTarget) < 52) u.hp -= 24;
    }
    for (const l of enemyLeaders) {
      if (!l.dead && l !== bestTarget && dist(l, bestTarget) < 52) l.hp -= 24;
    }

    skillFx.push(createLightningFx(a.x, a.y - 6, bestTarget.x, bestTarget.y - 8));
  }

  function updateLancelotAlly(opts) {
    const a = opts.hero;
    const player = opts.player;
    const enemyUnits = opts.enemyUnits;
    const enemyLeaders = opts.enemyLeaders;
    const dist = opts.dist;
    const moveToward = opts.moveToward;

    let target = null;
    let bestD = Infinity;

    for (const u of enemyUnits) {
      if (u.dead) continue;
      const d = dist(a, u);
      if (d < bestD) {
        bestD = d;
        target = u;
      }
    }

    for (const l of enemyLeaders) {
      if (l.dead) continue;
      const d = dist(a, l);
      if (d < bestD) {
        bestD = d;
        target = l;
      }
    }

    if (target && bestD < 210) {
      a.dir = Math.atan2(target.y - a.y, target.x - a.x);
      if (bestD <= (a.attackRange || 38)) {
        if (a.attackCd <= 0) {
          a.attackCd = 0.38;
          a.slashTimer = 0.14;
          target.hp -= 26;
          if (target.hitFlash !== undefined) target.hitFlash = Math.max(target.hitFlash || 0, 0.5);
          pushAwayOnly(a, target, 10);
        }
      } else {
        moveToward(a, target.x, target.y, a.speed * 1.06, opts.dt);
      }
    } else {
      const dx = player.x - a.x;
      const dy = player.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d > 70) {
        a.x += (dx / d) * Math.min(a.speed * opts.dt, d - 55);
        a.y += (dy / d) * Math.min(a.speed * opts.dt, d - 55);
        a.dir = Math.atan2(dy, dx);
      }
    }
  }

  function drawZhugeliangHero(opts) {
    const h = opts.hero;
    const ctx = opts.ctx;
    const drawHealthBar = opts.drawHealthBar;

    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.scale(1.18, 1.18);

    ctx.fillStyle = "#d8eeff";
    ctx.fillRect(-5, -8, 10, 14);
    ctx.fillStyle = "#aac8e8";
    ctx.fillRect(-6.5, -6.5, 2, 7.5);
    ctx.fillRect(4.5, -6.5, 2, 7.5);
    ctx.fillStyle = "#7a9ec0";
    ctx.fillRect(-5.5, 2, 11, 2.5);
    ctx.fillStyle = "#c2d8f0";
    ctx.fillRect(-3.2, 6, 2.8, 5);
    ctx.fillRect(0.5, 6, 2.8, 5);

    ctx.fillStyle = "#e8c89a";
    ctx.beginPath();
    ctx.arc(0, -12, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#394e6a";
    ctx.fillRect(-5, -15.8, 10, 3);
    ctx.fillStyle = "#28374e";
    ctx.fillRect(-3.8, -17.6, 7.6, 2.2);

    ctx.save();
    ctx.rotate((h.dir || 0) + 0.35);
    ctx.strokeStyle = "#7a5c38";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(1, -8);
    ctx.lineTo(9, -5);
    ctx.stroke();
    ctx.fillStyle = "rgba(228,248,210,0.92)";
    ctx.beginPath();
    ctx.ellipse(13, -3.5, 7.5, 4.2, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(140,190,110,0.7)";
    ctx.lineWidth = 0.7;
    for (let i = -3; i <= 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(8, -3.5 + i * 0.55);
      ctx.lineTo(19, -3.5 + i * 0.65);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(130,195,255," + (0.14 + 0.07 * Math.sin(performance.now() * 0.005)) + ")";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -4, 14.5 + Math.sin(performance.now() * 0.008) * 1.2, 0, Math.PI * 2);
    ctx.stroke();

    if ((h.hitFlash || 0) > 0) {
      ctx.fillStyle = "rgba(190,220,255," + ((h.hitFlash || 0) * 0.45) + ")";
      ctx.beginPath();
      ctx.ellipse(0, -4, 11, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.fillStyle = "#c8e8ff";
    ctx.font = "700 12px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(h.name || "诸葛亮", h.x, h.y - 31);
    drawHealthBar(h.x, h.y - 26, 40, h.hp, h.maxHp, "#6ab8ff");
  }

  function drawLancelotHero(opts) {
    const h = opts.hero;
    const ctx = opts.ctx;
    const drawHealthBar = opts.drawHealthBar;
    const t = performance.now() * 0.001;

    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.scale(1.15, 1.15);
    ctx.fillStyle = "#c8c0b0";
    ctx.fillRect(-4.5, -8, 9, 12);
    ctx.fillStyle = "#cc2222";
    ctx.fillRect(-1.5, -8, 3, 12);
    ctx.fillRect(-4.5, -3, 9, 3);
    ctx.fillStyle = "#a0a8b8";
    ctx.fillRect(-7, -6, 2.5, 8);
    ctx.fillRect(4.5, -6, 2.5, 8);
    ctx.strokeStyle = "#2a2838";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-2.5, 4);
    ctx.lineTo(-3, 12);
    ctx.moveTo(2.5, 4);
    ctx.lineTo(3, 12);
    ctx.stroke();
    ctx.fillStyle = "#e8c89a";
    ctx.beginPath();
    ctx.arc(0, -12, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#909aaa";
    ctx.fillRect(-5, -16.5, 10, 5.5);
    ctx.fillStyle = "#4e5860";
    ctx.fillRect(-3, -14.5, 6, 2);

    ctx.save();
    ctx.rotate((h.dir || 0) + 0.5);
    ctx.strokeStyle = "#d8e4ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(6, -16);
    ctx.lineTo(6, 10);
    ctx.stroke();
    ctx.strokeStyle = "#c09030";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.lineTo(10, -6);
    ctx.stroke();
    ctx.fillStyle = "#ecf4ff";
    ctx.beginPath();
    ctx.moveTo(6, -18);
    ctx.lineTo(4, -12);
    ctx.lineTo(8, -12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const g2 = 0.40 + 0.35 * Math.sin(t * 2.4);
    ctx.strokeStyle = "rgba(140,190,255," + g2 + ")";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -2, 17 + Math.sin(t * 3.5) * 1.5, 0, Math.PI * 2);
    ctx.stroke();

    if ((h.slashTimer || 0) > 0) {
      ctx.strokeStyle = "rgba(220,240,255,0.9)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, -2, 19, (h.dir || 0) - 0.45, (h.dir || 0) + 0.55);
      ctx.stroke();
    }

    ctx.restore();
    ctx.fillStyle = "#b8d8ff";
    ctx.font = "700 12px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(h.name || "兰斯洛特", h.x, h.y - 33);
    drawHealthBar(h.x, h.y - 28, 44, h.hp, h.maxHp, "#70a8ff");
  }

  function resolveAnchor(player, anchorOffset, fallbackOffset) {
    const offset = anchorOffset || fallbackOffset || { x: 0, y: 0 };
    const useRelative = (offset.side !== undefined) || (offset.back !== undefined);
    if (useRelative) {
      const dir = player.dir || 0;
      const rightX = Math.cos(dir + Math.PI / 2);
      const rightY = Math.sin(dir + Math.PI / 2);
      const fwdX = Math.cos(dir);
      const fwdY = Math.sin(dir);
      const side = offset.side || 0;
      const back = offset.back || 0;
      return {
        x: player.x + rightX * side - fwdX * back,
        y: player.y + rightY * side - fwdY * back
      };
    }
    return {
      x: player.x + (offset.x || 0),
      y: player.y + (offset.y || 0)
    };
  }

  function updateSunshangxiang(opts) {
    const h = opts.hero;
    const player = opts.player;
    const dt = opts.dt;
    const dist = opts.dist;
    const moveToward = opts.moveToward;
    const nearestEnemy = opts.nearestEnemy;
    const fireArrow = opts.fireArrow;
    const anchorOffset = opts.anchorOffset;

    h.hitFlash = Math.max(0, (h.hitFlash || 0) - dt * 1.8);
    h.attackCd = Math.max(0, (h.attackCd || 0) - dt);

    const anchor = resolveAnchor(player, anchorOffset, { side: -56, back: 46 });
    const ne = nearestEnemy(h, h.attackRange || 285);

    if (ne && ne.target) {
      h.dir = Math.atan2(ne.target.y - h.y, ne.target.x - h.x);
      if (h.attackCd <= 0) {
        h.attackCd = 0.72;
        fireArrow(h, ne.target, 36);
      }
      if (ne.d < 140) {
        moveToward(h, anchor.x, anchor.y, h.speed * 0.9, dt);
      }
    } else if (dist(h, anchor) > 12) {
      moveToward(h, anchor.x, anchor.y, h.speed, dt);
    }
  }

  function updateDaqiao(opts) {
    const h = opts.hero;
    const player = opts.player;
    const dt = opts.dt;
    const dist = opts.dist;
    const moveToward = opts.moveToward;
    const onGoldTick = opts.onGoldTick;
    const anchorOffset = opts.anchorOffset;

    h.hitFlash = Math.max(0, (h.hitFlash || 0) - dt * 1.8);
    h.goldCd = Math.max(0, (h.goldCd || 0) - dt);
    const anchor = resolveAnchor(player, anchorOffset, { side: 0, back: 68 });
    if (dist(h, anchor) > 10) moveToward(h, anchor.x, anchor.y, h.speed, dt);

    if (h.goldCd <= 0) {
      h.goldCd = 4;
	  const playerState = readStoredPlayerState();
	  const bonusRate = 1 + (playerState.jeanneFarmLevel || 0) * 0.05;
	  if (onGoldTick) onGoldTick(Math.round(100 * bonusRate), h.x, h.y - 26);
    }
  }

  function updateXiaoqiao(opts) {
    const h = opts.hero;
    const player = opts.player;
    const dt = opts.dt;
    const dist = opts.dist;
    const moveToward = opts.moveToward;
    const nearestEnemy = opts.nearestEnemy;
    const anchorOffset = opts.anchorOffset;

    h.hitFlash = Math.max(0, (h.hitFlash || 0) - dt * 1.8);
    h.attackCd = Math.max(0, (h.attackCd || 0) - dt);

    const anchor = resolveAnchor(player, anchorOffset, { side: 56, back: 46 });
    if (dist(h, anchor) > 10) moveToward(h, anchor.x, anchor.y, h.speed, dt);

    const ne = nearestEnemy(h, h.attackRange || 120);
    if (ne && ne.target && h.attackCd <= 0) {
      h.attackCd = 1.3;
      ne.target.hp -= 14;
    }
  }

  function updateElizabeth(opts) {
    const h = opts.hero;
    const player = opts.player;
    const dt = opts.dt;
    const dist = opts.dist;
    const moveToward = opts.moveToward;
    const healTargets = opts.healTargets;
    const onHealFx = opts.onHealFx;
    const anchorOffset = opts.anchorOffset;

    h.hitFlash = Math.max(0, (h.hitFlash || 0) - dt * 1.8);
    h.attackCd = Math.max(0, (h.attackCd || 0) - dt);

    const anchor = resolveAnchor(player, anchorOffset, { side: -84, back: 62 });
    if (dist(h, anchor) > 10) moveToward(h, anchor.x, anchor.y, h.speed * 0.96, dt);

    if (!healTargets || h.attackCd > 0) return;

    const list = healTargets(h) || [];
    let healed = false;
    const healRange = (h.skill && h.skill.range) || h.healRange || 170;
    const healPower = h.healPower || 20;
    for (let i = 0; i < list.length; i += 1) {
      const t = list[i];
      if (!t || t.dead) continue;
      const maxHp = t.maxHp || 0;
      if (maxHp <= 0 || (t.hp || 0) >= maxHp) continue;
      if (dist(h, t) > healRange) continue;
      t.hp = Math.min(maxHp, (t.hp || 0) + healPower);
      healed = true;
      if (onHealFx) onHealFx(h, t, healPower);
    }

    h.attackCd = healed ? ((h.skill && h.skill.cooldown) || 2.4) : 0.8;
  }

  function drawSunshangxiang(opts) {
    const h = opts.hero;
    const ctx = opts.ctx;
    const drawHealthBar = opts.drawHealthBar;
    const getFacing = opts.getFacing;
    const facing = getFacing ? getFacing(h.dir || 0) : (Math.cos(h.dir || 0) >= 0 ? 1 : -1);

    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.scale(facing, 1);
    ctx.fillStyle = "#3f2e2a";
    ctx.beginPath();
    ctx.ellipse(0, -12.5, 5.6, 5.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-3.6, -11.2, 2.1, 3.8, -0.35, 0, Math.PI * 2);
    ctx.ellipse(3.6, -11.2, 2.1, 3.8, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#58423a";
    ctx.fillRect(-3.8, -15.2, 7.6, 1.8);
    ctx.fillStyle = "#5f88d8";
    ctx.fillRect(-4.8, -8.2, 9.6, 12.8);
    ctx.fillStyle = "#f7d6a2";
    ctx.beginPath();
    ctx.arc(0, -12.1, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3f2e2a";
    ctx.beginPath();
    ctx.moveTo(-3.9, -13.8);
    ctx.lineTo(3.8, -13.8);
    ctx.lineTo(2.8, -11.4);
    ctx.lineTo(0.6, -12.1);
    ctx.lineTo(-0.8, -11.1);
    ctx.lineTo(-2.8, -11.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#446db7";
    ctx.fillRect(-5.4, 4.2, 10.8, 2.2);
    ctx.fillStyle = "#f0d78d";
    ctx.fillRect(-1.4, -2.4, 2.8, 7.6);
    ctx.strokeStyle = "#6f472a";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(8.5, -7.5, 7.4, -1.24, 1.04);
    ctx.stroke();
    ctx.strokeStyle = "#e7d3ad";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(10.8, -13.8);
    ctx.lineTo(6.7, -1.1);
    ctx.stroke();
    ctx.fillStyle = "#8a5f3b";
    ctx.fillRect(-7.1, -9.1, 2.3, 7.4);
    ctx.strokeStyle = "#d8e3ef";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6.4, -9.1);
    ctx.lineTo(-5.2, -11.8);
    ctx.moveTo(-5.6, -8.4);
    ctx.lineTo(-4.4, -11.1);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.scale(facing, 1);
    ctx.strokeStyle = "#7f4f2b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(8, -9, 6, -1.2, 1.0);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#e7f2ff";
    ctx.font = "700 12px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(h.name || "孙尚香", h.x, h.y - 33);
    drawHealthBar(h.x, h.y - 28, 42, h.hp, h.maxHp, "#7fc7ff");
  }

  function drawDaqiao(opts) {
    const h = opts.hero;
    const ctx = opts.ctx;
    const drawHealthBar = opts.drawHealthBar;
    const getFacing = opts.getFacing;
    const facing = getFacing ? getFacing(h.dir || 0) : (Math.cos(h.dir || 0) >= 0 ? 1 : -1);

    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.scale(facing, 1);
    const g = ctx.createRadialGradient(0, -4, 2, 0, -4, 18);
    g.addColorStop(0, "rgba(255, 222, 230, 0.48)");
    g.addColorStop(1, "rgba(255, 222, 230, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -4, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = h.body || "#e9a8b4";
    ctx.beginPath();
    ctx.moveTo(0, -8.5);
    ctx.lineTo(-7.6, 7.4);
    ctx.lineTo(7.6, 7.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = h.accent || "#ffe6ec";
    ctx.fillRect(-5.2, -8.8, 10.4, 7.8);
    ctx.fillStyle = "rgba(255, 232, 238, 0.92)";
    ctx.beginPath();
    ctx.ellipse(-7.8, -2.8, 3.2, 2.1, -0.4, 0, Math.PI * 2);
    ctx.ellipse(7.8, -2.8, 3.2, 2.1, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#46372f";
    ctx.beginPath();
    ctx.arc(0, -12.5, 5.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2d5b5";
    ctx.beginPath();
    ctx.arc(0, -11.9, 4.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f7e6a2";
    ctx.fillRect(3.8, -15.8, 3.6, 1.2);
    ctx.restore();

    ctx.fillStyle = "#ffeaf0";
    ctx.font = "700 12px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(h.name || "大乔", h.x, h.y - 33);
    drawHealthBar(h.x, h.y - 28, 40, h.hp, h.maxHp, "#89c2ff");
  }

  function drawXiaoqiao(opts) {
    const h = opts.hero;
    const ctx = opts.ctx;
    const drawSoldier = opts.drawSoldier;
    const drawHealthBar = opts.drawHealthBar;

    drawSoldier(h, true, "#cda3e3", "#f6e9ff");
    ctx.fillStyle = "#f8e7ff";
    ctx.font = "700 12px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(h.name || "小乔", h.x, h.y - 33);
    drawHealthBar(h.x, h.y - 28, 40, h.hp, h.maxHp, "#dfa9ff");
  }

  function drawElizabeth(opts) {
    const h = opts.hero;
    const ctx = opts.ctx;
    const drawHealthBar = opts.drawHealthBar;
    const getFacing = opts.getFacing;
    const facing = getFacing ? getFacing(h.dir || 0) : (Math.cos(h.dir || 0) >= 0 ? 1 : -1);

    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.scale(facing, 1);
    ctx.fillStyle = "rgba(179, 204, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(0, -4, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = h.body || "#4d5f9a";
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-7.5, 7.4);
    ctx.lineTo(7.5, 7.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = h.accent || "#f1deb0";
    ctx.fillRect(-5.2, -8.8, 10.4, 7.6);
    ctx.fillStyle = "#4f3a2f";
    ctx.beginPath();
    ctx.arc(0, -12.2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = h.head || "#f0d4b2";
    ctx.beginPath();
    ctx.arc(0, -11.7, 4.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0c95d";
    ctx.fillRect(-4.2, -16.4, 8.4, 1.5);
    ctx.fillRect(-2.6, -17.9, 1.4, 1.6);
    ctx.fillRect(1.2, -17.9, 1.4, 1.6);
    ctx.restore();

    ctx.fillStyle = "#dce8ff";
    ctx.font = "700 12px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(h.name || "伊丽莎白", h.x, h.y - 33);
    drawHealthBar(h.x, h.y - 28, 40, h.hp, h.maxHp, "#9dc1ff");
  }

  function updateSanada(opts) {
    const a = opts.hero;
    const player = opts.player;
    const dt = opts.dt;
    const dist = opts.dist;
    const moveToward = opts.moveToward;
    const nearestEnemy = opts.nearestEnemy;

    let targetPack = nearestEnemy(a, 260);
    let target = targetPack && targetPack.target ? targetPack.target : null;
    let d = targetPack && targetPack.d !== undefined ? targetPack.d : Infinity;

    if (target) {
      a.dir = Math.atan2(target.y - a.y, target.x - a.x);
      if (d > (a.attackRange || 44)) {
        moveToward(a, target.x, target.y, a.speed * 1.12, dt);
      } else if (a.attackCd <= 0) {
        a.attackCd = 0.38;
        a.slashTimer = 0.34;
        target.hp -= 56;
        if (target.hitFlash !== undefined) target.hitFlash = Math.max(target.hitFlash || 0, 0.55);
      }
      return;
    }

    const anchor = { x: player.x - 90, y: player.y + 2 };
    if (dist(a, anchor) > 10) moveToward(a, anchor.x, anchor.y, a.speed * 0.96, dt);
  }

  function updateCompanion(opts) {
    const a = opts.hero;
    if (!a || a.dead || a.hp <= 0) return;

    a.attackCd = Math.max(0, (a.attackCd || 0) - opts.dt);
    a.slashTimer = Math.max(0, (a.slashTimer || 0) - opts.dt);

    if (a.heroId === "zhugeliang") {
      updateZhugeliangAlly(opts);
      return;
    }
    if (a.heroId === "lancelot") {
      updateLancelotAlly(opts);
      return;
    }
    if (a.heroId === "sunshangxiang") {
      updateSunshangxiang(opts);
      return;
    }
    if (a.heroId === "daqiao") {
      updateDaqiao(opts);
      return;
    }
    if (a.heroId === "xiaoqiao") {
      updateXiaoqiao(opts);
      return;
    }
    if (a.heroId === "elizabeth") {
      updateElizabeth(opts);
      return;
    }
    if (a.heroId === "sanada") {
      updateSanada(opts);
      return;
    }

    // Generic fallback for other companions.
    if (!opts.nearestEnemy) return;
    const pack = opts.nearestEnemy(a, a.attackRange || 40);
    const target = pack && pack.target ? pack.target : null;
    const d = pack && pack.d !== undefined ? pack.d : Infinity;
    if (!target) return;
    if (d > (a.attackRange || 40)) {
      opts.moveToward(a, target.x, target.y, a.speed, opts.dt);
    } else if (a.attackCd <= 0) {
      a.attackCd = (a.skill && a.skill.cooldown) || 0.44;
      if (opts.applySkillHit) opts.applySkillHit(a, target);
      else target.hp -= ((a.skill && a.skill.damage) || 34);
    }
  }

  const detailRuntime = Object.freeze({
    updateZhugeliangAlly,
    updateLancelotAlly,
    drawZhugeliangHero,
    drawLancelotHero,
    updateSunshangxiang,
    updateDaqiao,
    updateXiaoqiao,
    updateElizabeth,
    updateSanada,
    updateCompanion,
    drawSunshangxiang,
    drawDaqiao,
    drawXiaoqiao,
    drawElizabeth
  });

  window.WarHeroes = {
    HERO_STORE_KEY,
    HERO_SESSION_KEY,
    PLAYER_STATE_KEY,
    PLAYER_STATE_SESSION_KEY,
    HERO_IDS,
    HERO_DEFINITIONS,
    defaultFlags,
    loadFlags: readStoredFlags,
    saveFlags,
    defaultPlayerState,
    loadPlayerState: readStoredPlayerState,
    savePlayerState,
    syncPlayerState: function () {
      return writeStoredPlayerState(readStoredPlayerState());
    },
    syncFlags: function () {
      return writeStoredFlags(readStoredFlags());
    },
    MAIN_PLAYER_DEFINITION,
    getHeroDefinition,
    CAMPAIGN_UNIT_TEMPLATES,
    getCampaignUnitTemplate,
    createCampaignUnit,
    createCompanion,
    createMainPlayer,
    detailRuntime
  };
})();
