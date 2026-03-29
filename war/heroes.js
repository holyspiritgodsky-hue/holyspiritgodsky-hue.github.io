(function () {
  "use strict";

  const HERO_STORE_KEY = "warHeroProfile";
  const HERO_SESSION_KEY = "warHeroes";
  const PLAYER_STATE_KEY = "warPlayerState";
  const PLAYER_STATE_SESSION_KEY = "warPlayerStateSession";

  const MAIN_PLAYER_DEFINITION = Object.freeze({
    id: "playerMain",
    name: "张飞",
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
      elizabeth: false
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
      goldBlade: false
    };
  }

  function normalizePlayerState(input) {
    const out = defaultPlayerState();
    if (!input || typeof input !== "object") return out;
    out.mounted = !!input.mounted;
    out.goldBlade = !!input.goldBlade;
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
      if (onGoldTick) onGoldTick(100, h.x, h.y - 26);
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
    createCompanion,
    createMainPlayer,
    detailRuntime
  };
})();
