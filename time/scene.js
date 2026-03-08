// ============================================================
//  scene.js — 太空帝国 · canvas 渲染 / 科技场景动画
//  依赖全局变量：window.game, window.planets（由 index.html 注入）
// ============================================================

// Canvas 设置
const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');
let centerX, centerY, scale = 1;
const particles = [];
const hitEffects = [];
const gainPopups = [];
const earthShipStacks = [];
const battleshipSpriteCache = new Map();
const interactiveBodies = [];
const slotHotspots = [];
const selectedShipUnitIds = new Set();
let nextShipUnitId = 1;
let lastShipFrameAt = 0;
let fleetSelectionBox = null;
let suppressPlanetClick = false;
let fleetCommandPanel = null;
let storyEventOpen = false;
let shakeUntil = 0;
let shakeMag = 0;
let lastViewportW = 0;
let lastViewportH = 0;
let resizeRaf = 0;
let canvasDpr = 1;
const earthRenderState = {
    x: 0,
    y: 0,
    r: 0,
    ready: false
};
const planetClickMultiplier = {
    earth: 1,
    moon: 1,
    mars: 1,
    mercury: 1,
    venus: 1,
    jupiter: 1,
    saturn: 1
};
const planetClickStats = {
    earth: { clicks: 0, warningShown: false },
    moon: { clicks: 0, warningShown: false },
    mars: { clicks: 0, rebellionShown: false, peaceShown: false, requirementShown: false },
    mercury: { firstHintShown: false, counterAttackShown: false, conqueredShown: false, gameOverShown: false },
    venus: { clicks: 0, warningShown: false },
    jupiter: { warningShown: false },
    saturn: { warningShown: false }
};
const HOLE_UNLOCK_LEVEL = 4;

const earthWalkerKeys = {
    up: false,
    down: false,
    left: false,
    right: false
};
const earthWalker = {
    localX: 0,
    localY: 0,
    targetLocalX: 0,
    targetLocalY: 0,
    hasTarget: false,
    pendingMoneyGain: 0,
    pendingResearchGain: 0,
    lastSettledMonth: -1,
    nextNotEnoughHintAt: 0,
    nextFactoryHintAt: 0,
    nextTowerHintAt: 0,
    nextLabHintAt: 0,
    nextPortalHintAt: 0,
    holePromptShown: false,
    speed: 150,
    sizeRatio: 0.24,
    lastUpdateAt: performance.now(),
    initialized: false
};
const earthWorkZones = [
    { id: 'factory', label: '工厂', role: 'factory', x: 0.30, y: 0.20, w: 0.34, h: 0.26, color: 'rgba(251, 191, 36, 0.25)', border: '#fde68a' },
    { id: 'lab', label: '实验室', role: 'lab', x: -0.64, y: 0.20, w: 0.34, h: 0.26, color: 'rgba(167, 139, 250, 0.26)', border: '#c4b5fd' },
    { id: 'command_tower', label: '黑洞指挥塔', role: 'tower', x: 0.56, y: -0.02, w: 0.22, h: 0.34, color: 'rgba(251, 113, 133, 0.24)', border: '#fda4af' }
];
const earthPreludeZones = [
    { id: 'time_machine', label: '时空机器', role: 'time_machine', x: 0.18, y: -0.08, w: 0.30, h: 0.28, color: 'rgba(244, 244, 245, 0.18)', border: '#e5e7eb' }
];
const SCHOOL_TUITION_COST = 1000;
const SCHOOL_PROMOTION_HOLD_SECONDS = 3;
const CHAIR_PROMOTION_COST_MONEY = 800000;
const CHAIR_PROMOTION_COST_RESEARCH = 2800;
const LAB_PROMOTION_HOLD_SECONDS = 4;
const FACTORY_STARSHIP_COST_ENGINEER = 280000;
const FACTORY_STARSHIP_COST_CHAIR_NORMAL = 900000;
const FACTORY_STARSHIP_COST_CHAIR_GIANT = 2600000;
const earthSlotRegionNames = [
    '东亚平原',
    '美洲大草原',
    '欧洲大草原',
    '太平洋岛屿',
    '非洲沙漠',
    '南极冰原',
    '海底',
    '地心前哨'
];
const earthSlotAnchorOffsets = [
    { x: 0.45, y: -0.16 },
    { x: 0.58, y: -0.72 },
    { x: -0.74, y: -0.38 },
    { x: 0.76, y: -0.40 },
    { x: -0.70, y: 0.24 },
    { x: -0.16, y: 0.82 },
    { x: 0.70, y: 0.50 },
    { x: -0.40, y: 0.66 }
];
let lastMarsAttackAnimAt = 0;
let lastOreShortageHintAt = 0;
let nextBlackholeAttackHintAt = 0;
const isCoarsePointer = typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: coarse)').matches
    : false;

// 地球/月球贴图（来自 img 文件夹）
const earthImg = new Image();
const earthSplitImg = new Image();
const moonImg = new Image();
const worldMapImg = new Image();
let earthImgLoaded = false;
let earthSplitImgLoaded = false;
let moonImgLoaded = false;
let worldMapImgLoaded = false;
earthImg.onload = () => { earthImgLoaded = true; };
earthSplitImg.onload = () => { earthSplitImgLoaded = true; };
moonImg.onload = () => { moonImgLoaded = true; };
worldMapImg.onload = () => { worldMapImgLoaded = true; };
earthImg.src = 'img/earth.jpg';
earthSplitImg.src = 'img/earth2.jpg';
moonImg.src = 'img/moon.jpg';
worldMapImg.src = 'img/1.jpg';

// 视图层级偶停：0 = 当前科技等级画面，+1 = 退回一个等级的画面
let viewOffset = 0.0;
let viewOffsetTgt = 0.0;
let rollbackLockUntil = 0;
let lastObservedTechLevel = 0;
const SCENE_RENDER_MODE_NORMAL = 'normal';
const SCENE_RENDER_MODE_LEVEL05 = 'level0_5';
let currentSceneRenderMode = SCENE_RENDER_MODE_NORMAL;
let level05MapRect = null;
let level05EndTurnRect = null;
const LEVEL05_FACTION_ORDER = ['us', 'ru', 'cn', 'eu'];
const LEVEL05_FACTION_COLOR = {
    us: 'rgba(59,130,246,0.40)',
    ru: 'rgba(239,68,68,0.40)',
    cn: 'rgba(245,158,11,0.40)',
    eu: 'rgba(168,85,247,0.40)',
    none: 'rgba(15,23,42,0.10)'
};
const LEVEL05_FACTION_FLAG = {
    us: '🇺🇸',
    ru: '🇷🇺',
    cn: '🇨🇳',
    eu: '🇪🇺'
};
const LEVEL05_REGION_LAYOUT = [
    { id: 'na_w', x: 0.16, y: 0.36, r: 0.060, owner: 'us', adj: ['na_e', 'pac'] },
    { id: 'na_e', x: 0.28, y: 0.34, r: 0.058, owner: 'us', adj: ['na_w', 'atl', 'eu_w'] },
    { id: 'pac', x: 0.36, y: 0.52, r: 0.052, owner: 'us', adj: ['na_w', 'cn_s', 'sea'] },
    { id: 'atl', x: 0.43, y: 0.36, r: 0.048, owner: 'eu', adj: ['na_e', 'eu_w', 'af_n'] },
    { id: 'eu_w', x: 0.50, y: 0.30, r: 0.052, owner: 'eu', adj: ['atl', 'eu_e', 'ru_w', 'af_n'] },
    { id: 'eu_e', x: 0.57, y: 0.30, r: 0.050, owner: 'eu', adj: ['eu_w', 'ru_w', 'ru_e', 'me'] },
    { id: 'ru_w', x: 0.62, y: 0.24, r: 0.055, owner: 'ru', adj: ['eu_w', 'eu_e', 'ru_e'] },
    { id: 'ru_e', x: 0.74, y: 0.24, r: 0.058, owner: 'ru', adj: ['ru_w', 'cn_n', 'cn_s'] },
    { id: 'cn_n', x: 0.72, y: 0.40, r: 0.054, owner: 'cn', adj: ['ru_e', 'cn_s', 'me'] },
    { id: 'cn_s', x: 0.73, y: 0.51, r: 0.056, owner: 'cn', adj: ['cn_n', 'sea', 'pac', 'ru_e'] },
    { id: 'me', x: 0.62, y: 0.43, r: 0.050, owner: 'ru', adj: ['eu_e', 'cn_n', 'af_n', 'af_s'] },
    { id: 'af_n', x: 0.54, y: 0.46, r: 0.050, owner: 'eu', adj: ['atl', 'eu_w', 'me', 'af_s'] },
    { id: 'af_s', x: 0.55, y: 0.60, r: 0.052, owner: 'cn', adj: ['af_n', 'me', 'sea'] },
    { id: 'sea', x: 0.66, y: 0.62, r: 0.050, owner: 'cn', adj: ['cn_s', 'af_s', 'pac'] }
];
const LEVEL05_START_OWNER = {
    na_e: 'us',
    ru_w: 'ru',
    cn_n: 'cn',
    eu_w: 'eu'
};

function isLevel05RenderMode() {
    return currentSceneRenderMode === SCENE_RENDER_MODE_LEVEL05;
}

function getFactionPowerScale(faction) {
    if (faction === 'us') return 1.06;
    if (faction === 'ru') return 1.02;
    if (faction === 'cn') return 1.08;
    if (faction === 'eu') return 1.00;
    return 1;
}

function ensureLevel05WarState() {
    if (!window.game) return null;
    if (!window.game.level05War || !window.game.level05War.regions) {
        const regions = {};
        LEVEL05_REGION_LAYOUT.forEach(item => {
            const owner = LEVEL05_START_OWNER[item.id] || 'none';
            regions[item.id] = {
                owner,
                control: owner === 'none' ? (18 + Math.random() * 14) : (72 + Math.random() * 20),
                supply: owner === 'none' ? (24 + Math.random() * 18) : (65 + Math.random() * 28),
                troops: owner === 'none' ? 0 : (9 + ((Math.random() * 4) | 0)),
                ap: owner === 'none' ? 0 : 2
            };
        });
        window.game.level05War = {
            playerFaction: 'cn',
            turn: 1,
            phase: 'player',
            selectedRegionId: null,
            lastActionAt: 0,
            hoverRegionId: null,
            hoverEndTurn: false,
            attackFx: [],
            regions
        };
    }
    const war = window.game.level05War;
    war.phase = war.phase === 'ai' ? 'ai' : 'player';
    war.turn = Math.max(1, Number(war.turn) || 1);
    war.selectedRegionId = typeof war.selectedRegionId === 'string' ? war.selectedRegionId : null;
    war.hoverEndTurn = !!war.hoverEndTurn;
    war.attackFx = Array.isArray(war.attackFx) ? war.attackFx : [];
    LEVEL05_REGION_LAYOUT.forEach(item => {
        const s = war.regions[item.id];
        if (!s) return;
        s.owner = ['us', 'ru', 'cn', 'eu', 'none'].includes(s.owner) ? s.owner : (LEVEL05_START_OWNER[item.id] || 'none');
        s.control = Math.max(1, Math.min(100, Number(s.control) || 60));
        s.supply = Math.max(1, Math.min(100, Number(s.supply) || 60));
        const troopsFloor = s.owner === 'none' ? 0 : 1;
        s.troops = Math.max(troopsFloor, Math.min(40, Math.floor(Number(s.troops) || 0)));
        s.ap = Math.max(0, Math.min(4, Math.floor(Number(s.ap) || 0)));
    });

    return war;
}

function refreshLevel05TurnAp(war) {
    if (!war) return;
    LEVEL05_REGION_LAYOUT.forEach(item => {
        const s = war.regions[item.id];
        if (!s) return;
        if (s.owner === 'none') s.ap = 0;
        else s.ap = s.owner === war.playerFaction ? 2 : 1;
    });
}

function getLevel05FactionRegionCount(war, faction) {
    if (!war || !faction) return 0;
    let count = 0;
    LEVEL05_REGION_LAYOUT.forEach(item => {
        const s = war.regions[item.id];
        if (s && s.owner === faction) count++;
    });
    return count;
}

function getLevel05FactionName(faction) {
    if (faction === 'cn') return '中国';
    if (faction === 'us') return '美国';
    if (faction === 'ru') return '俄罗斯';
    if (faction === 'eu') return '欧盟';
    return '该国家';
}

function triggerLevel05NationDefeat(war, faction) {
    if (!war || war.gameOverShown) return;
    war.gameOverShown = true;
    war.phase = 'gameover';
    const nationName = getLevel05FactionName(faction);
    showStoryEvent(
        '⚠️ 国家灭亡',
        `${nationName} 已失去全部战区，战役失败。`,
        '重开',
        () => {
            try {
                localStorage.removeItem('spaceEmpireV5');
                sessionStorage.setItem('resetFlag', 'true');
            } catch (_) {}
            location.reload(true);
        }
    );
}

function checkLevel05Elimination(war) {
    if (!war) return;
    if (getLevel05FactionRegionCount(war, war.playerFaction) <= 0) {
        triggerLevel05NationDefeat(war, war.playerFaction);
    }
}

function getLevel05RegionScreenPos(def) {
    if (!def || !level05MapRect) return null;
    return {
        x: level05MapRect.x + def.x * level05MapRect.w,
        y: level05MapRect.y + def.y * level05MapRect.h,
        r: Math.max(16, Math.min(level05MapRect.w, level05MapRect.h) * def.r)
    };
}

function getLevel05RegionByPoint(x, y) {
    if (!level05MapRect) return null;
    const rect = level05MapRect;
    for (let i = LEVEL05_REGION_LAYOUT.length - 1; i >= 0; i--) {
        const def = LEVEL05_REGION_LAYOUT[i];
        const px = rect.x + def.x * rect.w;
        const py = rect.y + def.y * rect.h;
        const rr = Math.max(16, Math.min(rect.w, rect.h) * def.r);
        const dx = x - px;
        const dy = y - py;
        if (dx * dx + dy * dy <= rr * rr) return def;
    }
    return null;
}

function resolveLevel05Attack(war, attackerFaction, fromDef, toDef) {
    if (!war || !fromDef || !toDef) return false;
    const fromState = war.regions[fromDef.id];
    const toState = war.regions[toDef.id];
    if (!fromState || !toState) return false;
    if (fromState.owner !== attackerFaction || toState.owner === attackerFaction) return false;
    if (!Array.isArray(fromDef.adj) || !fromDef.adj.includes(toDef.id)) return false;
    if ((Number(fromState.troops) || 0) < 2) return false;
    if ((Number(fromState.ap) || 0) <= 0) return false;

    const committed = Math.max(2, Math.min(8, Math.floor((Number(fromState.troops) || 0) * 0.55)));
    fromState.troops = Math.max(1, (Number(fromState.troops) || 0) - committed);
    fromState.ap = Math.max(0, (Number(fromState.ap) || 0) - 1);

    const attPower = getFactionPowerScale(attackerFaction)
        * (0.72 + fromState.control / 140)
        * (0.75 + fromState.supply / 160)
        * (0.75 + committed / 10);
    const defPower = getFactionPowerScale(toState.owner) * (0.62 + toState.control / 150) * (0.78 + toState.supply / 170);
    const swing = attPower - defPower;
    const damage = Math.max(6, Math.min(26, 13 + swing * 14 + (Math.random() - 0.5) * 5));
    const recoil = Math.max(2, Math.min(9, 4 + defPower * 2.4 + Math.random() * 2.2));

    toState.control -= damage;
    fromState.control = Math.max(24, fromState.control - recoil);
    fromState.supply = Math.max(18, fromState.supply - (3 + Math.random() * 2));
    toState.troops = Math.max(1, (Number(toState.troops) || 0) - Math.max(1, Math.round(committed * (0.35 + Math.random() * 0.25))));

    const fromPos = getLevel05RegionScreenPos(fromDef);
    const toPos = getLevel05RegionScreenPos(toDef);
    if (fromPos && toPos) {
        war.attackFx.push({
            fromX: fromPos.x,
            fromY: fromPos.y,
            toX: toPos.x,
            toY: toPos.y,
            attacker: attackerFaction,
            startAt: performance.now(),
            duration: 460,
            committed
        });
        if (war.attackFx.length > 14) war.attackFx.splice(0, war.attackFx.length - 14);
    }

    if (toState.control <= 0) {
        toState.owner = attackerFaction;
        toState.control = 34 + Math.random() * 18;
        toState.supply = 42 + Math.random() * 20;
        toState.troops = Math.max(2, Math.floor(committed * 0.6));
        if (window.game && attackerFaction === war.playerFaction) {
            window.game.ore = Math.max(0, Number(window.game.ore) || 0) + 180;
            window.game.tech = Math.max(0, Number(window.game.tech) || 0) + 70;
            if (typeof window.updateUI === 'function') window.updateUI();
        }
    }
    return true;
}

function resolveLevel05Move(war, faction, fromDef, toDef) {
    if (!war || !fromDef || !toDef) return false;
    const fromState = war.regions[fromDef.id];
    const toState = war.regions[toDef.id];
    if (!fromState || !toState) return false;
    if (fromState.owner !== faction || toState.owner !== faction) return false;
    if (!Array.isArray(fromDef.adj) || !fromDef.adj.includes(toDef.id)) return false;
    if ((Number(fromState.ap) || 0) <= 0) return false;
    if ((Number(fromState.troops) || 0) < 2) return false;

    const moved = Math.max(1, Math.min(7, Math.floor((Number(fromState.troops) || 0) * 0.45)));
    fromState.troops = Math.max(1, (Number(fromState.troops) || 0) - moved);
    toState.troops = Math.max(1, Math.min(40, (Number(toState.troops) || 0) + moved));
    fromState.ap = Math.max(0, (Number(fromState.ap) || 0) - 1);

    const fromPos = getLevel05RegionScreenPos(fromDef);
    const toPos = getLevel05RegionScreenPos(toDef);
    if (fromPos && toPos) {
        war.attackFx.push({
            fromX: fromPos.x,
            fromY: fromPos.y,
            toX: toPos.x,
            toY: toPos.y,
            attacker: faction,
            startAt: performance.now(),
            duration: 380,
            committed: moved,
            moveOnly: true
        });
        if (war.attackFx.length > 14) war.attackFx.splice(0, war.attackFx.length - 14);
    }
    return true;
}

function runLevel05AiTurn(war, faction) {
    if (!war || faction === war.playerFaction) return;
    for (let step = 0; step < 2; step++) {
        const candidates = [];
        LEVEL05_REGION_LAYOUT.forEach(def => {
            const state = war.regions[def.id];
            if (!state || state.owner !== faction) return;
            if ((Number(state.ap) || 0) <= 0 || (Number(state.troops) || 0) < 2) return;
            (def.adj || []).forEach(adjId => {
                const targetDef = LEVEL05_REGION_LAYOUT.find(r => r.id === adjId);
                const targetState = targetDef ? war.regions[targetDef.id] : null;
                if (!targetDef || !targetState || targetState.owner === faction) return;
                const value = (100 - targetState.control) + (targetState.owner === war.playerFaction ? 16 : 0) + Math.random() * 12;
                candidates.push({ fromDef: def, toDef: targetDef, score: value });
            });
        });
        if (!candidates.length) break;
        candidates.sort((a, b) => b.score - a.score);
        resolveLevel05Attack(war, faction, candidates[0].fromDef, candidates[0].toDef);
    }
}

function finishLevel05Round(war) {
    if (!war) return;
    war.turn = Math.max(1, Number(war.turn) || 1) + 1;
    LEVEL05_FACTION_ORDER.forEach(f => runLevel05AiTurn(war, f));
    Object.keys(war.regions).forEach(id => {
        const state = war.regions[id];
        state.control = Math.max(8, Math.min(100, state.control + 1.5 + Math.random() * 2.2));
        state.supply = Math.max(10, Math.min(100, state.supply + 2.2 + Math.random() * 3));
        if (state.owner === 'none') {
            state.troops = 0;
        } else {
            state.troops = Math.max(1, Math.min(22, (Number(state.troops) || 0) + 1 + (Math.random() < 0.35 ? 1 : 0)));
        }
    });
    refreshLevel05TurnAp(war);
    war.phase = 'player';
    war.selectedRegionId = null;
    checkLevel05Elimination(war);
}

function tryEndLevel05PlayerTurn(war) {
    if (!war || war.phase !== 'player') return;
    war.phase = 'ai';
    finishLevel05Round(war);
}

function handleLevel05MapClick(x, y) {
    const war = ensureLevel05WarState();
    if (!war) return;
    if (war.phase === 'gameover') return;

    if (level05EndTurnRect) {
        const b = level05EndTurnRect;
        const hitPad = 14;
        if (x >= b.x - hitPad && x <= b.x + b.w + hitPad && y >= b.y - hitPad && y <= b.y + b.h + hitPad) {
            tryEndLevel05PlayerTurn(war);
            return;
        }
    }

    const now = performance.now();
    if (now - (war.lastActionAt || 0) < 120) return;
    war.lastActionAt = now;

    if (war.phase !== 'player') return;

    const hit = getLevel05RegionByPoint(x, y);
    if (!hit) {
        war.selectedRegionId = null;
        return;
    }

    const hitState = war.regions[hit.id];
    if (!hitState) return;
    if (!war.selectedRegionId) {
        war.selectedRegionId = hitState.owner === war.playerFaction ? hit.id : null;
        return;
    }

    const fromDef = LEVEL05_REGION_LAYOUT.find(r => r.id === war.selectedRegionId);
    const fromState = fromDef ? war.regions[fromDef.id] : null;
    if (!fromDef || !fromState || fromState.owner !== war.playerFaction) {
        war.selectedRegionId = null;
        return;
    }

    if (hit.id === fromDef.id) {
        war.selectedRegionId = null;
        return;
    }

    if (hitState.owner === war.playerFaction) {
        war.selectedRegionId = hit.id;
        return;
    }

    const attacked = resolveLevel05Attack(war, war.playerFaction, fromDef, hit);
    if (attacked) {
        war.selectedRegionId = fromDef.id;
        checkLevel05Elimination(war);
        return;
    }

    const moved = resolveLevel05Move(war, war.playerFaction, fromDef, hit);
    if (moved) {
        war.selectedRegionId = hit.id;
    }
}

function drawFactionFlagBadge(faction, x, y, size) {
    const w = Math.max(14, size * 0.95);
    const h = Math.max(10, size * 0.62);
    const left = x - w * 0.5;
    const top = y - h * 0.5;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(left, top, w, h, 2);
    ctx.clip();

    function drawStar(cx, cy, outerR, innerR, points = 5) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const ang = -Math.PI / 2 + (i * Math.PI) / points;
            const rr = i % 2 === 0 ? outerR : innerR;
            const px = cx + Math.cos(ang) * rr;
            const py = cy + Math.sin(ang) * rr;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    if (faction === 'ru') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(left, top, w, h / 3);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(left, top + h / 3, w, h / 3);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(left, top + (h * 2) / 3, w, h / 3);
    } else if (faction === 'cn') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(left, top, w, h);
        ctx.fillStyle = '#facc15';
        drawStar(
            left + w * 0.28,
            top + h * 0.36,
            Math.max(2, h * 0.18),
            Math.max(1, h * 0.075),
            5
        );
    } else if (faction === 'eu') {
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(left, top, w, h);
        ctx.fillStyle = '#facc15';
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const sx = left + w * 0.5 + Math.cos(a) * w * 0.17;
            const sy = top + h * 0.5 + Math.sin(a) * h * 0.22;
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(1, h * 0.04), 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(left, top, w, h);
        ctx.fillStyle = '#ffffff';
        for (let i = 1; i <= 3; i++) {
            ctx.fillRect(left, top + (h * i) / 7, w, Math.max(1, h * 0.08));
        }
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(left, top, w * 0.42, h * 0.56);
    }

    ctx.restore();
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.strokeRect(left, top, w, h);
    ctx.restore();
}

function drawLevel05WarOverlay(panelX, panelY, panelW, panelH) {
    const war = ensureLevel05WarState();
    if (!war) return;
    level05MapRect = { x: panelX, y: panelY, w: panelW, h: panelH };
    if ((Number(war.turn) || 0) <= 1) {
        refreshLevel05TurnAp(war);
    }

    const btnW = Math.max(150, Math.min(210, panelW * 0.23));
    const btnH = Math.max(44, Math.min(58, panelH * 0.10));
    const btnX = panelX + (panelW - btnW) * 0.5;
    let btnY = panelY + panelH - btnH - 12;
    const panelEl = document.querySelector('.bottom-panel');
    if (panelEl && !panelEl.classList.contains('is-collapsed')) {
        const rect = panelEl.getBoundingClientRect();
        btnY = Math.min(btnY, rect.top - btnH - 10);
    }
    level05EndTurnRect = { x: btnX, y: btnY, w: btnW, h: btnH };
    const btnHovered = war.phase === 'player' && !!war.hoverEndTurn;

    ctx.save();
    const selectedDef = LEVEL05_REGION_LAYOUT.find(r => r.id === war.selectedRegionId) || null;
    if (selectedDef) {
        const fromPos = getLevel05RegionScreenPos(selectedDef);
        (selectedDef.adj || []).forEach(adjId => {
            const adjDef = LEVEL05_REGION_LAYOUT.find(r => r.id === adjId);
            const adjPos = getLevel05RegionScreenPos(adjDef);
            if (!fromPos || !adjPos) return;
            const adjState = war.regions[adjId];
            const isEnemy = !!adjState && adjState.owner !== war.playerFaction;
            ctx.save();
            ctx.lineWidth = isEnemy ? 2.4 : 1.3;
            ctx.setLineDash(isEnemy ? [8, 6] : []);
            ctx.strokeStyle = isEnemy ? 'rgba(248,113,113,0.95)' : 'rgba(125,211,252,0.45)';
            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(adjPos.x, adjPos.y);
            ctx.stroke();
            ctx.restore();
        });
    }

    LEVEL05_REGION_LAYOUT.forEach(def => {
        const state = war.regions[def.id];
        if (!state) return;
        const px = panelX + def.x * panelW;
        const py = panelY + def.y * panelH;
        const rr = Math.max(16, Math.min(panelW, panelH) * def.r);
        const factionColor = LEVEL05_FACTION_COLOR[state.owner] || 'rgba(148,163,184,0.38)';
        const selected = war.selectedRegionId === def.id;
        const hovered = war.hoverRegionId === def.id;
        const canAct = (Number(state.ap) || 0) > 0 && state.owner === war.playerFaction;
        const isNeutral = state.owner === 'none';

        ctx.beginPath();
        ctx.arc(px, py, rr, 0, Math.PI * 2);
        ctx.fillStyle = factionColor;
        ctx.fill();

        ctx.lineWidth = selected ? 3.2 : (hovered ? 2.4 : 1.4);
        if (isNeutral) {
            ctx.setLineDash([7, 6]);
            ctx.strokeStyle = selected ? 'rgba(255,255,255,0.86)' : 'rgba(148,163,184,0.72)';
        } else {
            ctx.setLineDash([]);
            ctx.strokeStyle = selected ? 'rgba(255,255,255,0.95)' : (hovered ? 'rgba(255,255,255,0.82)' : 'rgba(226,232,240,0.65)');
        }
        ctx.stroke();
        ctx.setLineDash([]);

        if (!isNeutral) {
            drawFactionFlagBadge(state.owner, px, py - rr * 0.04, rr * 0.95);
        } else {
            ctx.fillStyle = 'rgba(203,213,225,0.8)';
            ctx.font = `${Math.max(10, rr * 0.46)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('□', px, py - rr * 0.05);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = `700 ${Math.max(9, rr * 0.34)}px sans-serif`;
        ctx.fillText(`${Math.max(0, Math.floor(state.troops || 0))}`, px, py + rr * 0.52);

        if (canAct) {
            ctx.fillStyle = 'rgba(255,255,255,0.88)';
            ctx.font = `700 ${Math.max(8, rr * 0.26)}px sans-serif`;
            ctx.fillText(`AP${Math.max(0, Math.floor(state.ap || 0))}`, px, py - rr * 0.62);
        }

        const p = Math.max(0, Math.min(1, state.control / 100));
        ctx.beginPath();
        ctx.arc(px, py, rr + 4, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * p, false);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(250,250,250,0.9)';
        ctx.stroke();
    });

    const now = performance.now();
    war.attackFx = (war.attackFx || []).filter(fx => now - fx.startAt <= fx.duration);
    war.attackFx.forEach(fx => {
        const p = Math.max(0, Math.min(1, (now - fx.startAt) / fx.duration));
        const x = fx.fromX + (fx.toX - fx.fromX) * p;
        const y = fx.fromY + (fx.toY - fx.fromY) * p;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(fx.fromX, fx.fromY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = LEVEL05_FACTION_COLOR[fx.attacker] || 'rgba(255,255,255,0.65)';
        ctx.beginPath();
        ctx.arc(x, y, 3 + fx.committed * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 8);
    const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
    if (war.phase === 'player') {
        if (btnHovered) {
            btnGrad.addColorStop(0, 'rgba(110, 231, 183, 0.99)');
            btnGrad.addColorStop(1, 'rgba(16, 185, 129, 0.99)');
        } else {
            btnGrad.addColorStop(0, 'rgba(52, 211, 153, 0.96)');
            btnGrad.addColorStop(1, 'rgba(5, 150, 105, 0.96)');
        }
    } else {
        btnGrad.addColorStop(0, 'rgba(148, 163, 184, 0.88)');
        btnGrad.addColorStop(1, 'rgba(100, 116, 139, 0.88)');
    }
    ctx.fillStyle = btnGrad;
    ctx.fill();
    const gloss = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH * 0.55);
    gloss.addColorStop(0, 'rgba(255,255,255,0.20)');
    gloss.addColorStop(1, 'rgba(255,255,255,0.00)');
    ctx.fillStyle = gloss;
    ctx.fill();
    ctx.lineWidth = btnHovered ? 2.2 : 1.4;
    ctx.strokeStyle = btnHovered ? 'rgba(220,252,231,0.98)' : 'rgba(255,255,255,0.72)';
    ctx.stroke();
    ctx.shadowColor = btnHovered ? 'rgba(16,185,129,0.65)' : 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = btnHovered ? 16 : 8;
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = btnHovered ? '700 16px sans-serif' : '700 15px sans-serif';
    ctx.fillText('结束回合', btnX + btnW * 0.5, btnY + btnH * 0.52);
    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,0.90)';
    ctx.font = '700 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const phaseText = war.phase === 'player' ? '玩家回合' : 'AI回合';
    ctx.fillText(`回合 ${Math.max(1, Number(war.turn) || 1)}  ${phaseText}`, panelX + 10, panelY + 8);
    ctx.restore();
}

function isRollbackLocked() {
    return performance.now() < rollbackLockUntil;
}

function lockRollback(ms = 1200) {
    rollbackLockUntil = Math.max(rollbackLockUntil, performance.now() + Math.max(0, ms));
}

// 鼠标滚轮：向上滚 = 拉近（看低等级），向下滚 = 拉远（回到当前等级）
window.addEventListener('wheel', (e) => {
    if(e.target && e.target.closest && e.target.closest('button,input,select,.tab-button,.upgrade-card')) return;
    e.preventDefault();
    const maxOff = getSceneLevelFromGame() + 0.5;
    const delta = e.deltaY > 0 ? -0.25 : 0.25; // 上滚+，下滚-
    if (delta > 0 && isRollbackLocked()) return;
    viewOffsetTgt = Math.max(0, Math.min(maxOff, viewOffsetTgt + delta));
}, { passive: false });

// 已禁用双击回到当前等级，避免连点时误触发视角回跳

// 触摸捏合缩放
let _pinchDist = null;
window.addEventListener('touchstart',  (e) => { if(e.touches.length===2) _pinchDist=null; }, {passive:true});
window.addEventListener('touchmove', (e) => {
    if(e.touches.length!==2) return;
    e.preventDefault();
    const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(_pinchDist!==null){
        const maxOff = getSceneLevelFromGame() + 0.5;
        const delta = (d - _pinchDist) / 120 * 0.25; // 张开 = 拉近
        if (delta > 0 && isRollbackLocked()) {
            _pinchDist = d;
            return;
        }
        viewOffsetTgt = Math.max(0, Math.min(maxOff, viewOffsetTgt + delta));
    }
    _pinchDist=d;
}, { passive: false });
window.addEventListener('touchend', ()=>{ _pinchDist=null; }, {passive:true});

// ── 星空（参考 space 项目参数：主星亮、次星暗，双层右移）───────
const STARS = Array.from({length:320}, ()=>(
{
    x:Math.random(), y:Math.random(),
    r:Math.random()*1.5+0.2,
    dx:Math.random()*0.00022+0.00008,
    ph:Math.random()*Math.PI*2,
    ts:Math.random()*0.010+0.002,
    ba:Math.random()*0.07+0.93,
}));
const SMALL_STARS = Array.from({length:220}, ()=>(
{
    x:Math.random(), y:Math.random(),
    r:Math.random()*0.9+0.1,
    dx:Math.random()*0.00012+0.00003,
    ph:Math.random()*Math.PI*2,
    ts:Math.random()*0.008+0.001,
    ba:Math.random()*0.35+0.30,
}));

const earthResidentLines = [
    '开工啦',
    'oh my god!',
    '别内卷',
    '向月球出发',
    '能源不够了',
    '为什么打不过欧盟？',
    'AI别卷我们啦',
    '机器人别卷我们啦'
];

const earthResidentPinnedLines = [
    '为什么朋友们都说难度很难?我明明设计的很简单啊。',
    '这破游戏干嘛的，怎么第一关这么容易死？'
];

const earthResidents = Array.from({ length: 4 }, (_, idx) => ({
    angle: (idx / 4) * Math.PI * 2 + (Math.random() - 0.5) * 0.22,
    radiusFactor: 0.22 + Math.random() * 0.62,
    driftSpeed: 0.2 + Math.random() * 0.5,
    bobSpeed: 0.6 + Math.random() * 0.8,
    bobPhase: Math.random() * Math.PI * 2,
    suitHue: 190 + Math.random() * 85,
    pinnedSpeech: earthResidentPinnedLines[idx] || null,
    speechText: '',
    speechUntil: 0,
    nextSpeechAt: performance.now() + 2200 + Math.random() * 7600
}));

earthResidents.push({
    angle: Math.PI,
    radiusFactor: 0.34,
    driftSpeed: 0.04,
    bobSpeed: 0.7,
    bobPhase: Math.random() * Math.PI * 2,
    suitHue: 0,
    style: 'red',
    pinnedSpeech: 'universe in my hand',
    fixedAngle: Math.PI,
    fixedRadiusFactor: 0.34,
    speechText: '',
    speechUntil: 0,
    nextSpeechAt: performance.now() + 3200
});

const mainDifficultySpeaker = earthResidents.find(r => r.pinnedSpeech === earthResidentPinnedLines[0]);
if (mainDifficultySpeaker) {
    mainDifficultySpeaker.fixedAngle = -Math.PI / 2;
    mainDifficultySpeaker.fixedRadiusFactor = 0.30;
    mainDifficultySpeaker.driftSpeed = 0.03;
}

const earlyDeathSpeaker = earthResidents.find(r => r.pinnedSpeech === earthResidentPinnedLines[1]);
if (earlyDeathSpeaker) {
    earlyDeathSpeaker.boatMode = 'withPilot';
    earlyDeathSpeaker.fixedAngle = Math.PI * 0.21;
    earlyDeathSpeaker.fixedRadiusFactor = 0.60;
    earlyDeathSpeaker.driftSpeed = 0.05;
}

const seaBoatResidents = earthResidents
    .filter(r => r !== mainDifficultySpeaker && r !== earlyDeathSpeaker && !r.pinnedSpeech)
    .slice(0, 2);
if (seaBoatResidents[0]) {
    seaBoatResidents[0].boatMode = 'withPilot';
    seaBoatResidents[0].fixedAngle = Math.PI * 0.14;
    seaBoatResidents[0].fixedRadiusFactor = 0.62;
    seaBoatResidents[0].driftSpeed = 0.05;
}
if (seaBoatResidents[1]) {
    seaBoatResidents[1].boatMode = 'boatOnly';
    seaBoatResidents[1].fixedAngle = Math.PI * 0.27;
    seaBoatResidents[1].fixedRadiusFactor = 0.68;
    seaBoatResidents[1].driftSpeed = 0.06;
}

function drawStars(vis){
    const visFactor = 0.55 + 0.45 * vis;
    for(const s of STARS){
        s.ph += s.ts;
        s.x += s.dx;
        if(s.x > 1){ s.x = 0; s.y = Math.random(); }
        const a = Math.min(1, s.ba * (0.90 + 0.10 * Math.sin(s.ph)) * visFactor);
        if(a < 0.01) continue;
        ctx.beginPath(); ctx.arc(s.x*canvas.width,s.y*canvas.height,s.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${a})`; ctx.fill();
    }
    for(const s of SMALL_STARS){
        s.ph += s.ts;
        s.x += s.dx;
        if(s.x > 1){ s.x = 0; s.y = Math.random(); }
        const a = Math.min(1, s.ba * (0.85 + 0.15 * Math.sin(s.ph)) * visFactor);
        if(a < 0.01) continue;
        ctx.beginPath(); ctx.arc(s.x*canvas.width,s.y*canvas.height,s.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(220,230,255,${a})`; ctx.fill();
    }
}

function drawRoundedBubble(x, y, w, h, r) {
    const radius = Math.max(2, Math.min(r, Math.min(w, h) * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function wrapBubbleText(text, maxWidth) {
    const rows = [];
    let current = '';
    for (const ch of String(text || '')) {
        const trial = current + ch;
        if (current && ctx.measureText(trial).width > maxWidth) {
            rows.push(current);
            current = ch;
        } else {
            current = trial;
        }
    }
    if (current) rows.push(current);
    return rows.length ? rows : [''];
}

function drawEarthCoreMinePit(ex, ey, earthR, now) {
    if (earthR < 18) return;

    const pulse = 0.98 + Math.sin(now * 0.0022) * 0.03;
    const pitOuterR = earthR * 0.20 * pulse;
    const pitInnerR = earthR * 0.10 * pulse;
    const pitX = ex;
    const pitY = ey + earthR * 0.01;

    ctx.save();
    ctx.beginPath();
    ctx.arc(ex, ey, earthR * 0.99, 0, Math.PI * 2);
    ctx.clip();

    const rim = ctx.createRadialGradient(pitX, pitY, pitInnerR * 0.65, pitX, pitY, pitOuterR * 1.28);
    rim.addColorStop(0, 'rgba(10, 10, 14, 0.92)');
    rim.addColorStop(0.45, 'rgba(28, 18, 14, 0.82)');
    rim.addColorStop(0.72, 'rgba(95, 58, 34, 0.55)');
    rim.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(pitX, pitY, pitOuterR * 1.32, 0, Math.PI * 2);
    ctx.fillStyle = rim;
    ctx.fill();

    const inner = ctx.createRadialGradient(
        pitX - pitInnerR * 0.15,
        pitY - pitInnerR * 0.2,
        pitInnerR * 0.08,
        pitX,
        pitY,
        pitInnerR * 1.28
    );
    inner.addColorStop(0, 'rgba(255, 171, 97, 0.24)');
    inner.addColorStop(0.25, 'rgba(93, 47, 24, 0.68)');
    inner.addColorStop(1, 'rgba(8, 8, 12, 0.97)');
    ctx.beginPath();
    ctx.arc(pitX, pitY, pitInnerR * 1.34, 0, Math.PI * 2);
    ctx.fillStyle = inner;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pitX, pitY, pitOuterR, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(1.2, earthR * 0.012);
    ctx.strokeStyle = 'rgba(255, 205, 150, 0.36)';
    ctx.stroke();

    ctx.restore();
}

function drawStarlinkEffect(ex, ey, earthR, now) {
    if (earthR < 18) return;

    const orbitR = earthR * 1.2;
    const satCount = 3;
    const spin = now * 0.00035;
    const arcStart = -Math.PI * 0.94;
    const arcEnd = -Math.PI * 0.06;
    const arcSpan = arcEnd - arcStart;

    ctx.save();

    for (let i = 0; i < satCount; i++) {
        const phase = (i / satCount) * Math.PI * 2;
        const t = ((spin * (1 + i * 0.06) + phase) % (Math.PI * 2)) / (Math.PI * 2);
        const angle = arcStart + t * arcSpan;
        const x = ex + Math.cos(angle) * orbitR * 0.96;
        const y = ey + Math.sin(angle) * orbitR * 0.54 - earthR * 0.08;

        const satW = Math.max(2.8, earthR * 0.043);
        const satH = satW * 0.56;
        const panelW = satW * 0.82;
        const panelH = satH * 0.42;
        const panelGap = satW * 0.10;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);

        const panelGrad = ctx.createLinearGradient(-panelW, 0, panelW, 0);
        panelGrad.addColorStop(0, 'rgba(59, 130, 246, 0.92)');
        panelGrad.addColorStop(1, 'rgba(125, 211, 252, 0.92)');
        ctx.fillStyle = panelGrad;
        ctx.fillRect(-satW * 0.5 - panelGap - panelW, -panelH * 0.5, panelW, panelH);
        ctx.fillRect(satW * 0.5 + panelGap, -panelH * 0.5, panelW, panelH);

        const bodyGrad = ctx.createLinearGradient(-satW * 0.5, -satH * 0.5, satW * 0.5, satH * 0.5);
        bodyGrad.addColorStop(0, 'rgba(248, 250, 252, 0.96)');
        bodyGrad.addColorStop(1, 'rgba(148, 163, 184, 0.96)');
        ctx.fillStyle = bodyGrad;
        ctx.fillRect(-satW * 0.5, -satH * 0.5, satW, satH);

        ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
        ctx.lineWidth = Math.max(0.8, satH * 0.18);
        ctx.strokeRect(-satW * 0.5, -satH * 0.5, satW, satH);

        ctx.fillStyle = 'rgba(226, 232, 240, 0.95)';
        ctx.fillRect(-satW * 0.17, satH * 0.1, satW * 0.34, satH * 0.44);

        ctx.strokeStyle = 'rgba(226, 232, 240, 0.92)';
        ctx.lineWidth = Math.max(0.8, satH * 0.18);
        ctx.beginPath();
        ctx.moveTo(-satW * 0.5 - panelGap, 0);
        ctx.lineTo(satW * 0.5 + panelGap, 0);
        ctx.stroke();

        const dishR = Math.max(0.9, satH * 0.32);
        ctx.beginPath();
        ctx.arc(0, satH * 0.88, dishR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.9)';
        ctx.lineWidth = Math.max(0.7, satH * 0.14);
        ctx.stroke();

        ctx.restore();
    }

    ctx.restore();
}

function drawEarthResidents(ex, ey, earthR, now) {
    if (earthR < 26) return;

    const personSize = Math.max(1.2, Math.min(3.6, earthR * 0.0135));
    const bubbleFontSize = Math.max(8, Math.min(12, earthR * 0.042));

    ctx.save();
    ctx.beginPath();
    ctx.arc(ex, ey, earthR * 0.995, 0, Math.PI * 2);
    ctx.clip();

    for (const resident of earthResidents) {
        const drift = Math.sin(now * 0.001 * resident.driftSpeed + resident.bobPhase) * 0.08;
        const bob = Math.sin(now * 0.0015 * resident.bobSpeed + resident.bobPhase) * personSize * 0.35;
        const baseAngle = Number.isFinite(resident.fixedAngle) ? resident.fixedAngle : resident.angle;
        const baseRadiusFactor = Number.isFinite(resident.fixedRadiusFactor) ? resident.fixedRadiusFactor : resident.radiusFactor;
        const angle = baseAngle + drift;
        const radial = earthR * baseRadiusFactor;
        const x = ex + Math.cos(angle) * radial;
        const y = ey + Math.sin(angle) * radial + bob;

        if (resident.boatMode) {
            const boatW = personSize * 3.35;
            const boatH = personSize * 1.12;
            const tilt = Math.sin(now * 0.0012 + resident.bobPhase) * 0.07;

            ctx.save();
            ctx.translate(x, y + personSize * 0.75);
            ctx.rotate(tilt);

            ctx.beginPath();
            ctx.ellipse(0, boatH * 0.64, boatW * 0.58, boatH * 0.28, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(125, 211, 252, 0.28)';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-boatW * 0.50, -boatH * 0.03);
            ctx.quadraticCurveTo(-boatW * 0.10, boatH * 0.92, boatW * 0.44, boatH * 0.12);
            ctx.lineTo(boatW * 0.50, -boatH * 0.03);
            ctx.lineTo(boatW * 0.34, -boatH * 0.44);
            ctx.lineTo(-boatW * 0.30, -boatH * 0.44);
            ctx.closePath();
            const hullGrad = ctx.createLinearGradient(0, -boatH * 0.45, 0, boatH * 0.9);
            hullGrad.addColorStop(0, 'rgba(224, 155, 88, 0.98)');
            hullGrad.addColorStop(1, 'rgba(124, 66, 28, 0.98)');
            ctx.fillStyle = hullGrad;
            ctx.fill();
            ctx.lineWidth = Math.max(1, personSize * 0.18);
            ctx.strokeStyle = 'rgba(255, 229, 191, 0.78)';
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(-boatW * 0.26, -boatH * 0.30);
            ctx.lineTo(boatW * 0.30, -boatH * 0.30);
            ctx.strokeStyle = 'rgba(255, 243, 224, 0.75)';
            ctx.lineWidth = Math.max(1, personSize * 0.12);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(-boatW * 0.02, -boatH * 0.28);
            ctx.lineTo(-boatW * 0.02, -boatH * 1.30);
            ctx.strokeStyle = 'rgba(229, 231, 235, 0.95)';
            ctx.lineWidth = Math.max(1, personSize * 0.16);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(-boatW * 0.02, -boatH * 1.20);
            ctx.lineTo(-boatW * 0.02, -boatH * 0.58);
            ctx.lineTo(boatW * 0.36, -boatH * 0.88);
            ctx.closePath();
            const sailGrad = ctx.createLinearGradient(0, -boatH * 1.2, boatW * 0.36, -boatH * 0.58);
            sailGrad.addColorStop(0, 'rgba(248, 250, 252, 0.96)');
            sailGrad.addColorStop(1, 'rgba(219, 234, 254, 0.90)');
            ctx.fillStyle = sailGrad;
            ctx.fill();
            ctx.lineWidth = Math.max(1, personSize * 0.1);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.88)';
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(boatW * 0.10, -boatH * 0.44);
            ctx.lineTo(boatW * 0.19, -boatH * 0.90);
            ctx.strokeStyle = 'rgba(255,255,255,0.72)';
            ctx.lineWidth = Math.max(1, personSize * 0.1);
            ctx.stroke();

            if (resident.boatMode === 'withPilot') {
                ctx.beginPath();
                ctx.arc(-boatW * 0.23, -boatH * 0.78, personSize * 0.34, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(245, 250, 255, 0.97)';
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(-boatW * 0.23, -boatH * 0.56);
                ctx.lineTo(-boatW * 0.23, -boatH * 0.10);
                ctx.strokeStyle = 'rgba(230, 244, 255, 0.95)';
                ctx.lineWidth = Math.max(1, personSize * 0.18);
                ctx.stroke();
            }

            ctx.restore();
        } else {

            const isRedResident = resident.style === 'red';
            const suitTop = isRedResident
                ? 'rgba(252, 165, 165, 0.98)'
                : `hsla(${resident.suitHue}, 88%, 72%, 0.98)`;
            const suitBottom = isRedResident
                ? 'rgba(185, 28, 28, 0.98)'
                : `hsla(${resident.suitHue}, 82%, 48%, 0.98)`;

            ctx.beginPath();
            ctx.ellipse(x, y + personSize * 0.65, personSize * 0.95, personSize * 1.15, 0, 0, Math.PI * 2);
            const suitGrad = ctx.createLinearGradient(x, y - personSize * 0.4, x, y + personSize * 1.9);
            suitGrad.addColorStop(0, suitTop);
            suitGrad.addColorStop(1, suitBottom);
            ctx.fillStyle = suitGrad;
            ctx.fill();

            ctx.lineWidth = Math.max(1, personSize * 0.26);
            ctx.strokeStyle = 'rgba(255,255,255,0.85)';
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x - personSize * 0.88, y + personSize * 0.68);
            ctx.lineTo(x + personSize * 0.88, y + personSize * 0.68);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x - personSize * 0.2, y + personSize * 1.7);
            ctx.lineTo(x - personSize * 0.66, y + personSize * 2.3);
            ctx.moveTo(x + personSize * 0.2, y + personSize * 1.7);
            ctx.lineTo(x + personSize * 0.66, y + personSize * 2.3);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x, y - personSize * 0.72, personSize * 0.6, 0, Math.PI * 2);
            const helmet = ctx.createRadialGradient(
                x - personSize * 0.22,
                y - personSize * 0.96,
                personSize * 0.06,
                x,
                y - personSize * 0.72,
                personSize * 0.62
            );
            helmet.addColorStop(0, 'rgba(245, 250, 255, 0.98)');
            helmet.addColorStop(1, isRedResident ? 'rgba(254, 202, 202, 0.95)' : 'rgba(184, 216, 255, 0.95)');
            ctx.fillStyle = helmet;
            ctx.fill();
            ctx.lineWidth = Math.max(1, personSize * 0.2);
            ctx.strokeStyle = isRedResident ? 'rgba(153, 27, 27, 0.62)' : 'rgba(30, 64, 175, 0.58)';
            ctx.stroke();
        }

        if (now >= resident.nextSpeechAt) {
            if (resident.pinnedSpeech) {
                resident.speechText = resident.pinnedSpeech;
                resident.speechUntil = now + 2600 + Math.random() * 1400;
                resident.nextSpeechAt = now + 12000 + Math.random() * 9000;
            } else {
                resident.speechText = earthResidentLines[(Math.random() * earthResidentLines.length) | 0];
                resident.speechUntil = now + 1400 + Math.random() * 1100;
                resident.nextSpeechAt = now + 9000 + Math.random() * 12000;
            }
        }

        if (resident.speechText && now < resident.speechUntil) {
            ctx.font = `700 ${bubbleFontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const text = resident.speechText;
            const maxBubbleTextW = Math.max(90, Math.min(230, earthR * 0.85));
            const lines = wrapBubbleText(text, maxBubbleTextW);
            const textW = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
            const padX = 6;
            const padY = 4;
            const bubbleW = textW + padX * 2;
            const lineHeight = bubbleFontSize + 2;
            const bubbleH = lines.length * lineHeight + padY * 2;
            const bubbleX = x - bubbleW * 0.5;
            const bubbleY = y - personSize * 4.4 - bubbleH;

            drawRoundedBubble(bubbleX, bubbleY, bubbleW, bubbleH, 6);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(191, 219, 254, 0.85)';
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x - 2, bubbleY + bubbleH);
            ctx.lineTo(x + 2, bubbleY + bubbleH);
            ctx.lineTo(x, bubbleY + bubbleH + 4);
            ctx.closePath();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(191, 219, 254, 0.85)';
            ctx.stroke();

            ctx.fillStyle = 'rgba(241, 245, 249, 0.98)';
            lines.forEach((line, idx) => {
                const yOffset = bubbleY + padY + lineHeight * (idx + 0.5);
                ctx.fillText(line, x, yOffset);
            });
        }
    }

    ctx.restore();
}

function drawEarthWorldMapUnfold(ex, ey, earthR, renderLv, now) {
    const unfold = Math.max(0, Math.min(1, (renderLv - 0.06) / 0.44));
    if (unfold <= 0 || earthR < 24) return;

    const W = lastViewportW || canvas.clientWidth || window.innerWidth;
    const H = lastViewportH || canvas.clientHeight || window.innerHeight;
    // Fullscreen map mode: ignore safe UI bounds and cover the whole viewport.
    const safeTop = 0;
    const safeBottom = H;
    const safeH = H;
    const safeCenterY = H * 0.5;

    const startW = earthR * 1.25;
    const startH = earthR * 0.88;
    const startX = ex - startW * 0.5;
    const startY = ey - startH * 0.5;

    const maxW = W;
    const maxH = safeH;
    const targetW = maxW;
    const targetH = maxH;

    const panelW = startW + (targetW - startW) * unfold;
    const panelH = startH + (targetH - startH) * unfold;
    const panelX = startX + ((W - panelW) * 0.5 - startX) * unfold;
    const panelY = startY + ((safeCenterY - panelH * 0.5) - startY) * unfold;
    const cornerBase = Math.max(10, Math.min(24, panelH * 0.06));
    const corner = cornerBase * (1 - unfold);
    const inset = Math.max(0, Math.round(4 * (1 - unfold)));

    ctx.save();
    ctx.globalAlpha = 0.15 + unfold * 0.85;

    // Fade in a fullscreen mask so the L1 Earth never bleeds through when map opens.
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, Math.pow(unfold, 1.25)));
    ctx.fillStyle = 'rgba(2, 10, 28, 1)';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, corner);
    ctx.fillStyle = 'rgba(4, 16, 38, 1)';
    ctx.fill();

    if (worldMapImgLoaded) {
        ctx.save();
        const innerX = panelX + inset;
        const innerY = panelY + inset;
        const innerW = panelW - inset * 2;
        const innerH = panelH - inset * 2;
        ctx.beginPath();
        ctx.roundRect(innerX, innerY, innerW, innerH, Math.max(0, corner - inset));
        ctx.clip();

        // Cover draw: always fill panel, crop overflow from image ratio mismatch.
        const imgW = Math.max(1, worldMapImg.width || 1);
        const imgH = Math.max(1, worldMapImg.height || 1);
        const coverScale = Math.max(innerW / imgW, innerH / imgH);
        const drawW = imgW * coverScale;
        const drawH = imgH * coverScale;
        const drawX = innerX + (innerW - drawW) * 0.5;
        const drawY = innerY + (innerH - drawH) * 0.5;
        ctx.drawImage(worldMapImg, drawX, drawY, drawW, drawH);
        ctx.restore();
    }

    drawLevel05WarOverlay(panelX + inset, panelY + inset, panelW - inset * 2, panelH - inset * 2);

    ctx.restore();
}

// UI 安全区常量：yf=0 对应顶栏底部，yf=1 对应右侧抽屉不影响时的底部安全线
const UI_TOP = 160;   // 顶栏高度 px
const UI_BOT = 80;    // 底部安全留白 px

// ── 5科技级别场景定义 ─────────────────────────────────────────
// xf: 0-1 = 屏幕宽度比例   yf: 0-1 = 安全绘图区高度比例（UI_TOP ~ H-UI_BOT）
// rf: 相对 min(W,H) 的半径比例
const TECH_LEVELS = [
  // ── Level 0: 行星文明，巨大地球充满视野 ──
        { starVis:0.84, fogR:0.18, fogAlpha:0.36,
    earth:{xf:0.5, yf:0.50, rf:0.42},
        moon:{dxf:0.16,dyf:-0.06,rf:0.10},
        centauri:{xf:0.64,yf:0.50,rf:0.0,alpha:0},
    sun:{xf:0.5,yf:-1.0,rf:0.0,glowR:0,alpha:0,clipXf:null},
    bodies:[], galaxy:false },
  // ── Level 1: 地月文明，地球退到下方，太阳从左侧边缘探入 ──
  { starVis:0.55, fogR:0.65, fogAlpha:0.75,
    earth:{xf:0.5, yf:0.78, rf:0.09},
        moon:{dxf:0.30,dyf:-0.14,rf:0.28},
        centauri:{xf:0.64,yf:0.48,rf:0.0,alpha:0},
    sun:{xf:-0.22,yf:0.42,rf:0.35,glowR:0.38,alpha:1.0,clipXf:0.0},
    bodies:[
        {id:'venus',  xf:0.28,yf:0.30,rf:0.011,label:'金星',col:'#e8c87a'},
        {id:'mercury',xf:0.68,yf:0.50,rf:0.007,label:'水星',col:'#b5b3ac'},
    ], galaxy:false },
  // ── Level 2: 太阳系文明，太阳居中放大 ──
  { starVis:0.75, fogR:1.5, fogAlpha:0.0,
    earth:{xf:0.5, yf:0.90, rf:0.016},
    moon:{dxf:0.20,dyf:-0.18,rf:0.28},
        centauri:{xf:0.64,yf:0.46,rf:0.0,alpha:0},
        sun:{xf:0.50,yf:0.35,rf:0.46,glowR:0.56,alpha:1.0,clipXf:null},
    bodies:[
        {id:'mercury',xf:0.15,yf:0.74,rf:0.005,label:'水星',col:'#b5b3ac'},
        {id:'venus',  xf:0.26,yf:0.65,rf:0.008,label:'金星',col:'#e8c87a'},
        {id:'mars',   xf:0.82,yf:0.70,rf:0.012,label:'火星',col:'#c1440e'},
        {id:'jupiter',xf:0.88,yf:0.44,rf:0.028,label:'木星',col:'#c88b3a'},
        {id:'saturn', xf:0.12,yf:0.38,rf:0.022,label:'土星',col:'#e4d191',rings:true},
    ], galaxy:false },
  // ── Level 3: 星际文明，太阳居中缩小，行星极致聚拢 ──
  { starVis:1.0, fogR:0, fogAlpha:0.0,
    earth:{xf:0.5, yf:0.52, rf:0.0020},
    moon:{dxf:0.22,dyf:-0.18,rf:0.22},
        centauri:{xf:0.62,yf:0.49,rf:0.012,alpha:1.0},
    sun:{xf:0.50,yf:0.50,rf:0.016,glowR:0.08,alpha:1.0,clipXf:null},
    bodies:[
        {id:'mercury',xf:0.511,yf:0.507,rf:0.0011,label:'水星',col:'#b5b3ac'},
        {id:'venus',  xf:0.488,yf:0.511,rf:0.0013,label:'金星',col:'#e8c87a'},
        {id:'mars',   xf:0.516,yf:0.491,rf:0.0024,label:'火星',col:'#c1440e'},
        {id:'jupiter',xf:0.530,yf:0.479,rf:0.0040,label:'木星',col:'#c88b3a'},
        {id:'saturn', xf:0.464,yf:0.476,rf:0.0034,label:'土星',col:'#e4d191',rings:true},
        {id:'uranus', xf:0.536,yf:0.520,rf:0.0020,label:'天王星',col:'#7de8e8'},
        {id:'neptune',xf:0.460,yf:0.526,rf:0.0020,label:'海王星',col:'#3f54ba'},
    ], galaxy:false },
  // ── Level 4: 银河文明，仅太阳孤悬于银河背景中 ──
  { starVis:1.0, fogR:0, fogAlpha:0.0,
    earth:{xf:0.5, yf:0.50, rf:0},
    moon:{dxf:0, dyf:0, rf:0},
        centauri:{xf:0.57,yf:0.50,rf:0.004,alpha:1.0},
    sun:{xf:0.50,yf:0.50,rf:0.002,glowR:0.018,alpha:1.0,clipXf:null},
    bodies:[], galaxy:true },
    // ── Level 5: 奇点文明，黑洞主导视野 ──
    { starVis:1.0, fogR:0, fogAlpha:0.0,
        earth:{xf:0.5, yf:0.50, rf:0},
        moon:{dxf:0, dyf:0, rf:0},
                centauri:{xf:0.56,yf:0.50,rf:0.003,alpha:0.9},
        sun:{xf:0.50,yf:0.50,rf:0.0,glowR:0.0,alpha:0.0,clipXf:null},
        bodies:[], galaxy:true },
];

// ── 场景过渡 ──────────────────────────────────────────────────
let sceneFrom=0, sceneTgt=0, sceneP=1, sceneT0=0;
const SCENE_DUR=3000;
function sceneEase(t){ return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
function sLerp(a,b,t){ return a+(b-a)*t; }
function getSceneLevelFromGame(){
    const debugLevel = Number(window.game?.debugSceneLevel);
    if (Number.isFinite(debugLevel)) {
        return Math.max(0, Math.min(5, Math.floor(debugLevel)));
    }
    return Math.max(0, Math.min(5, Math.floor(Number(window.game?.techLevel) || 0)));
}
function triggerSceneTransition(newLv){
    const target = Math.max(0, Math.min(5, Number(newLv) || 0));
    const now = performance.now();
    const liveP = sceneP < 1 ? Math.min(1, (now - sceneT0) / SCENE_DUR) : 1;
    const liveTp = sceneEase(liveP);
    const liveLevel = sLerp(sceneFrom, sceneTgt, liveTp);
    // 同目标重复触发且过渡已完成，直接忽略
    if (target === sceneTgt && sceneP >= 1) return;
    sceneFrom = liveLevel;
    sceneTgt = target;
    sceneT0 = now;
    sceneP = 0;
}

function forceSceneTransitionTo(newLv, immediate = false) {
    const target = Math.max(0, Math.min(5, Number(newLv) || 0));
    if (immediate) {
        sceneFrom = target;
        sceneTgt = target;
        sceneP = 1;
        sceneT0 = performance.now();
        lastObservedTechLevel = target;
        return;
    }
    triggerSceneTransition(target);
    lastObservedTechLevel = target;
}

// ── 绘制辅助函数 ──────────────────────────────────────────────
function sDrawGlow(x,y,innerR,outerR,col,alpha){
    if(outerR<=0||alpha<=0)return;
    const g=ctx.createRadialGradient(x,y,innerR,x,y,outerR);
    g.addColorStop(0,col); g.addColorStop(1,'transparent');
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.beginPath(); ctx.arc(x,y,outerR,0,Math.PI*2);
    ctx.fillStyle=g; ctx.fill(); ctx.restore();
}
function sDrawBall(x,y,r,c0,c1,c2){
    const g=ctx.createRadialGradient(x-r*0.3,y-r*0.32,r*0.04,x,y,r);
    g.addColorStop(0,c0); g.addColorStop(0.55,c1); g.addColorStop(1,c2);
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
}
function sCol(hex,adj){
    const rv=parseInt(hex.slice(1,3),16),gv=parseInt(hex.slice(3,5),16),bv=parseInt(hex.slice(5,7),16);
    return `rgb(${Math.max(0,Math.min(255,rv+adj*255))|0},${Math.max(0,Math.min(255,gv+adj*255))|0},${Math.max(0,Math.min(255,bv+adj*255))|0})`;
}

function drawBlackHole(x, y, radius, alpha, now) {
    if (radius <= 0.5 || alpha <= 0.01) return;
    const t = now * 0.001;
    ctx.save();

    const warpOuter = radius * 5.4;
    const warp = ctx.createRadialGradient(x, y, radius * 0.9, x, y, warpOuter);
    warp.addColorStop(0, 'rgba(0,0,0,0)');
    warp.addColorStop(0.45, `rgba(114,91,255,${0.10 * alpha})`);
    warp.addColorStop(0.75, `rgba(56,28,124,${0.07 * alpha})`);
    warp.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = warp;
    ctx.beginPath();
    ctx.arc(x, y, warpOuter, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 24; i++) {
        const p = i / 24;
        const ang = p * Math.PI * 2 + t * (0.7 + p * 0.9);
        const inner = radius * (1.35 + p * 0.3);
        const outer = radius * (3.4 + Math.sin(t * 1.7 + i) * 0.25);
        const x1 = x + Math.cos(ang) * inner;
        const y1 = y + Math.sin(ang) * inner;
        const x2 = x + Math.cos(ang + 0.55) * outer;
        const y2 = y + Math.sin(ang + 0.55) * outer;
        const streak = ctx.createLinearGradient(x1, y1, x2, y2);
        streak.addColorStop(0, `rgba(255,214,140,${0.00 * alpha})`);
        streak.addColorStop(0.5, `rgba(255,168,86,${0.18 * alpha})`);
        streak.addColorStop(1, `rgba(165,110,255,${0.05 * alpha})`);
        ctx.strokeStyle = streak;
        ctx.lineWidth = Math.max(1, radius * 0.12 * (1 - p * 0.4));
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(x + Math.cos(ang + 0.2) * radius * 2.1, y + Math.sin(ang + 0.2) * radius * 2.1, x2, y2);
        ctx.stroke();
    }

    const ring = ctx.createRadialGradient(x, y, radius * 0.9, x, y, radius * 2.2);
    ring.addColorStop(0, 'rgba(0,0,0,0)');
    ring.addColorStop(0.45, `rgba(255,190,128,${0.28 * alpha})`);
    ring.addColorStop(0.7, `rgba(184,136,255,${0.16 * alpha})`);
    ring.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}
let shimA=0;

function getOreTargetPosition() {
    const oreValue = document.getElementById('oreVal');
    const anchor = oreValue?.closest('.resource-compact') || oreValue;
    if (!anchor) {
        const fallbackW = lastViewportW || canvas.clientWidth || window.innerWidth || 360;
        return { x: fallbackW * 0.5, y: 44 };
    }
    const rect = anchor.getBoundingClientRect();
    return { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 };
}

function triggerScreenShake(mag = 6, durationMs = 90) {
    shakeMag = Math.max(shakeMag, mag);
    shakeUntil = Math.max(shakeUntil, performance.now() + durationMs);
}

function applyScreenShake(now) {
    const layer = document.getElementById('planetLayer');
    if (now < shakeUntil) {
        const dx = (Math.random() * 2 - 1) * shakeMag;
        const dy = (Math.random() * 2 - 1) * shakeMag;
        const t = `translate(${dx}px, ${dy}px)`;
        canvas.style.transform = t;
        if (layer) layer.style.transform = t;
        shakeMag *= 0.92;
    } else {
        canvas.style.transform = 'translate(0px, 0px)';
        if (layer) layer.style.transform = 'translate(0px, 0px)';
        shakeMag = 0;
    }
}

function getViewportSize() {
    const vv = window.visualViewport;
    const width = Math.max(320, Math.floor(vv ? vv.width : window.innerWidth));
    const height = Math.max(480, Math.floor(vv ? vv.height : window.innerHeight));
    return { width, height };
}

function getAttackTargetPosition(targetType) {
    const W = lastViewportW || canvas.clientWidth || window.innerWidth || 1280;
    const H = lastViewportH || canvas.clientHeight || window.innerHeight || 720;
    if (targetType === 'mars') {
        const mars = planets.find(item => item.id === 'mars');
        if (mars && Number.isFinite(mars.screenX) && Number.isFinite(mars.screenY)) {
            return { x: mars.screenX, y: mars.screenY };
        }
        return { x: W * 0.78, y: H * 0.66 };
    }
    if (targetType === 'moon') {
        const moon = planets.find(item => item.id === 'moon');
        if (moon && Number.isFinite(moon.screenX) && Number.isFinite(moon.screenY)) {
            return { x: moon.screenX, y: moon.screenY };
        }
        return { x: W * 0.62, y: H * 0.46 };
    }
    if (targetType === 'outer') {
        return { x: W * 0.9, y: UI_TOP + (H - UI_TOP - UI_BOT) * 0.2 };
    }
    if (targetType === 'blackhole') {
        return { x: W * 0.5, y: H * 0.5 };
    }
    return { x: W * 0.82, y: H * 0.5 };
}

function ensureFleetCommandPanel() {
    if (fleetCommandPanel) return fleetCommandPanel;
    const panel = document.createElement('div');
    panel.style.cssText = `
        position: fixed;
        left: 0.8rem;
        bottom: 0.9rem;
        z-index: 1400;
        background: rgba(15, 23, 42, 0.88);
        border: 1px solid rgba(0, 217, 255, 0.45);
        border-radius: 12px;
        padding: 0.45rem;
        display: none;
        gap: 0.35rem;
        pointer-events: auto;
        backdrop-filter: blur(8px);
    `;
    panel.innerHTML = `
        <button data-attack="moon" style="border:1px solid rgba(125,211,252,0.55);background:rgba(125,211,252,0.14);color:#e0f2fe;border-radius:8px;padding:0.35rem 0.55rem;font-size:0.72rem;cursor:pointer;">🌙 探测月球</button>
        <button data-attack="mars" style="border:1px solid rgba(239,68,68,0.55);background:rgba(239,68,68,0.15);color:#fecaca;border-radius:8px;padding:0.35rem 0.55rem;font-size:0.72rem;cursor:pointer;">⚔️ 进攻火星</button>
        <button data-attack="outer" style="border:1px solid rgba(59,130,246,0.55);background:rgba(59,130,246,0.15);color:#bfdbfe;border-radius:8px;padding:0.35rem 0.55rem;font-size:0.72rem;cursor:pointer;">🛰️ 进攻外太空</button>
        <button data-attack="blackhole" style="border:1px solid rgba(168,85,247,0.6);background:rgba(168,85,247,0.16);color:#e9d5ff;border-radius:8px;padding:0.35rem 0.55rem;font-size:0.72rem;cursor:pointer;">🕳️ 进攻黑洞</button>
    `;
    panel.querySelectorAll('button[data-attack]').forEach(btn => {
        btn.addEventListener('click', () => {
            issueFleetAttack(btn.getAttribute('data-attack') || 'mars');
        });
    });
    document.body.appendChild(panel);
    fleetCommandPanel = panel;
    return panel;
}

function updateFleetCommandPanel() {
    const panel = ensureFleetCommandPanel();
    panel.style.display = selectedShipUnitIds.size > 0 ? 'flex' : 'none';
}

function clearFleetSelection() {
    if (!selectedShipUnitIds.size) return;
    selectedShipUnitIds.clear();
    updateFleetCommandPanel();
}

function issueFleetAttack(targetType) {
    if (!selectedShipUnitIds.size) return;
    if (targetType === 'blackhole') {
        const techLevel = Number(window.game?.techLevel) || 0;
        const inTower = !!window.game?.inCommandTower;
        if (techLevel < 4 || !inTower) {
            const now = performance.now();
            if (now >= nextBlackholeAttackHintAt) {
                nextBlackholeAttackHintAt = now + 1500;
                if (typeof window.showStoryEvent === 'function') {
                    window.showStoryEvent(
                        '🕳️ 黑洞进攻未解锁',
                        '进入黑洞需要满足两个条件：<br>1) 科技等级达到 Lv.4<br>2) 单位位于【黑洞指挥塔】区域内后再下达进攻',
                        '我知道了'
                    );
                }
            }
            return;
        }
    }
    let launchedNormal = 0;
    let launchedGiant = 0;
    let launchedScout = 0;
    earthShipStacks.forEach(item => {
        if (!selectedShipUnitIds.has(item.unitId)) return;
        if (item.attackTarget) return;
        if (targetType === 'moon' && item.shipType !== 'scout') return;
        item.attackTarget = targetType;
        item.attackProgress = 0;
        item.attackOriginX = Number.isFinite(item.screenX) ? item.screenX : (planets.find(p => p.id === 'earth')?.screenX || centerX);
        item.attackOriginY = Number.isFinite(item.screenY) ? item.screenY : (planets.find(p => p.id === 'earth')?.screenY || centerY);
        if (item.shipType === 'giant') launchedGiant++;
        else if (item.shipType === 'scout') launchedScout++;
        else launchedNormal++;
    });

    if (launchedNormal > 0) {
        window.game.shipsBuilt = Math.max(0, Number(window.game.shipsBuilt) - launchedNormal);
    }
    if (launchedGiant > 0) {
        window.game.giantShipsBuilt = Math.max(0, Number(window.game.giantShipsBuilt) - launchedGiant);
    }
    if (launchedScout > 0) {
        window.game.scoutDrones = Math.max(0, Number(window.game.scoutDrones) - launchedScout);
    }

    clearFleetSelection();
    if (typeof window.updateUI === 'function') {
        window.updateUI();
    }
}

function applyFleetSelectionRect(startX, startY, endX, endY) {
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    selectedShipUnitIds.clear();
    earthShipStacks.forEach(item => {
        if (item.attackTarget) return;
        if (!Number.isFinite(item.screenX) || !Number.isFinite(item.screenY)) return;
        if (item.screenX >= minX && item.screenX <= maxX && item.screenY >= minY && item.screenY <= maxY) {
            selectedShipUnitIds.add(item.unitId);
        }
    });
    updateFleetCommandPanel();
}

function drawFleetSelectionBox() {
    if (!fleetSelectionBox || !fleetSelectionBox.active) return;
    const minX = Math.min(fleetSelectionBox.startX, fleetSelectionBox.endX);
    const minY = Math.min(fleetSelectionBox.startY, fleetSelectionBox.endY);
    const w = Math.abs(fleetSelectionBox.endX - fleetSelectionBox.startX);
    const h = Math.abs(fleetSelectionBox.endY - fleetSelectionBox.startY);
    ctx.save();
    ctx.fillStyle = 'rgba(0, 217, 255, 0.12)';
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.fillRect(minX, minY, w, h);
    ctx.strokeRect(minX, minY, w, h);
    ctx.restore();
}

function createHitEffect(planet, hitX, hitY, gain) {
    if (!planet) return;
    const px = planet.screenX || centerX;
    const py = planet.screenY || centerY;
    const pr = Math.max(planet.drawR || 10, 10);
    hitEffects.push({
        planetId: planet.id,
        ox: hitX - px,
        oy: hitY - py,
        spawnR: pr,
        bornAt: performance.now(),
        duration: 220,
        gain
    });
    if (hitEffects.length > 40) hitEffects.shift();
}

function mineEarthResourcesOnClick() {
    return { ironGain: 0, goldGain: 0, uraniumGain: 0 };
}

function ensureEarthWorkState() {
    const g = window.game;
    if (!g) return;
    g.totalMoney = Math.max(0, Number(g.totalMoney) || 0);
    g.researchPoints = Math.max(0, Number(g.researchPoints) || 0);
    g.moneyPerStep = Math.max(0, Number(g.moneyPerStep) || 1);
    g.researchPerStep = Math.max(0, Number(g.researchPerStep) || 0.2);
    g.currentMoneyStepGain = Math.max(0, Number(g.currentMoneyStepGain) || 0);
    g.currentResearchStepGain = Math.max(0, Number(g.currentResearchStepGain) || 0);
    g.rank = ['intern', 'engineer', 'chair'].includes(g.rank) ? g.rank : 'intern';
    g.rankTitle = typeof g.rankTitle === 'string' && g.rankTitle ? g.rankTitle : '见习生';
    g.schoolTrainingProgress = Math.max(0, Number(g.schoolTrainingProgress) || 0);
    g.labPromotionProgress = Math.max(0, Number(g.labPromotionProgress) || 0);
    g.factoryDroneProgress = Math.max(0, Number(g.factoryDroneProgress) || 0);
    g.scoutDrones = Math.max(0, Number(g.scoutDrones) || 0);
    g.moonScanPoints = Math.max(0, Number(g.moonScanPoints) || 0);
    g.moonScouted = !!g.moonScouted;
    g.autoCompanyIncomePerSec = Math.max(0, Number(g.autoCompanyIncomePerSec) || 0);
    g.jetpackOwned = !!g.jetpackOwned;
    g.remoteWorkTerminal = !!g.remoteWorkTerminal;
}

function spawnGainPopup(text, color, x, y, now, options = null) {
    const duration = Math.max(300, Number(options?.duration) || 900);
    const rise = Math.max(4, Number(options?.rise) || (24 + Math.random() * 14));
    const jitter = Math.max(0, Number(options?.jitter) || 12);
    gainPopups.push({
        text,
        color,
        x: x + (Math.random() - 0.5) * jitter,
        y,
        bornAt: now,
        duration,
        rise
    });
    if (gainPopups.length > 40) gainPopups.shift();
}

function drawGainPopups(now) {
    for (let i = gainPopups.length - 1; i >= 0; i--) {
        const item = gainPopups[i];
        const elapsed = now - item.bornAt;
        if (elapsed >= item.duration) {
            gainPopups.splice(i, 1);
            continue;
        }
        const p = elapsed / item.duration;
        const alpha = 1 - p;
        const y = item.y - item.rise * p;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = '700 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.58)';
        ctx.strokeText(item.text, item.x, y);
        ctx.fillStyle = item.color;
        ctx.fillText(item.text, item.x, y);
        ctx.restore();
    }
}

function getRankMeta(rank) {
    if (rank === 'chair') {
        return {
            title: '星盟主席',
            speed: 150,
            moneyMult: 260,
            glow: 1,
            outfit: 'chair'
        };
    }
    if (rank === 'engineer') {
        return {
            title: '初级工程师',
            speed: 115,
            moneyMult: 6,
            glow: 0.56,
            outfit: 'engineer'
        };
    }
    return {
        title: '见习生',
        speed: 85,
        moneyMult: 1,
        glow: 0.2,
        outfit: 'intern'
    };
}

function syncRankTitle() {
    const g = window.game;
    if (!g) return;
    g.rankTitle = getRankMeta(g.rank).title;
}

function tryPromoteToEngineer(dtSeconds, inSchool) {
    const g = window.game;
    if (!g || g.rank !== 'intern') return;
    if (!inSchool) {
        g.schoolTrainingProgress = 0;
        return;
    }
    if (g.totalMoney < SCHOOL_TUITION_COST) {
        g.schoolTrainingProgress = 0;
        return;
    }
    g.schoolTrainingProgress += dtSeconds;
    if (g.schoolTrainingProgress < SCHOOL_PROMOTION_HOLD_SECONDS) return;
    g.totalMoney = Math.max(0, g.totalMoney - SCHOOL_TUITION_COST);
    g.rank = 'engineer';
    g.schoolTrainingProgress = 0;
    syncRankTitle();
}

function tryPromoteToChair(dtSeconds, inLab) {
    const g = window.game;
    if (!g || g.rank !== 'engineer') return;
    if (!inLab) {
        g.labPromotionProgress = 0;
        return;
    }
    if (g.totalMoney < CHAIR_PROMOTION_COST_MONEY || g.researchPoints < CHAIR_PROMOTION_COST_RESEARCH) {
        g.labPromotionProgress = 0;
        return;
    }
    g.labPromotionProgress += dtSeconds;
    if (g.labPromotionProgress < LAB_PROMOTION_HOLD_SECONDS) return;
    g.totalMoney = Math.max(0, g.totalMoney - CHAIR_PROMOTION_COST_MONEY);
    g.researchPoints = Math.max(0, g.researchPoints - CHAIR_PROMOTION_COST_RESEARCH);
    g.rank = 'chair';
    g.labPromotionProgress = 0;
    g.autoCompanyIncomePerSec = 12000;
    syncRankTitle();
}

function enterHolePage() {
    try {
        window.location.href = 'hole.html';
    } catch (_) {}
}

function triggerEarthPreludeJump() {
    const g = window.game;
    if (!g) return;
    if (g.earthTimelineMode !== 'level-1') return;
    if (g.earthPreludeJumping) return;
    g.earthPreludeJumping = true;

    const flash = document.createElement('div');
    flash.style.cssText = [
        'position:fixed',
        'inset:0',
        'background:#ffffff',
        'opacity:0',
        'pointer-events:none',
        'z-index:6200',
        'transition:opacity 0.16s ease'
    ].join(';');
    document.body.appendChild(flash);
    requestAnimationFrame(() => {
        flash.style.opacity = '1';
    });

    setTimeout(() => {
        g.earthTimelineMode = 'normal';
        g.earthPreludeCompleted = true;
        g.earthPreludeJumping = false;
        earthWalker.holePromptShown = false;
        earthWalker.targetLocalX = 0;
        earthWalker.targetLocalY = 0;
        earthWalker.hasTarget = false;
        flash.style.opacity = '0';
    }, 220);

    setTimeout(() => {
        flash.remove();
    }, 560);
}

function getEarthRenderSnapshot(planet = null) {
    if (earthRenderState.ready && Number.isFinite(earthRenderState.x) && Number.isFinite(earthRenderState.y) && Number.isFinite(earthRenderState.r)) {
        return { x: earthRenderState.x, y: earthRenderState.y, r: earthRenderState.r };
    }
    if (planet && Number.isFinite(planet.screenX) && Number.isFinite(planet.screenY) && Number.isFinite(planet.drawR)) {
        return { x: planet.screenX, y: planet.screenY, r: planet.drawR };
    }
    return null;
}

function setEarthWalkerTargetFromScreen(planet, hitX, hitY) {
    const snap = getEarthRenderSnapshot(planet);
    if (!snap) return;
    const earthR = Math.max(8, Number(snap.r) || 8);
    const playerSize = Math.max(10, Math.min(20, earthR * earthWalker.sizeRatio));
    const radiusLimit = Math.max(6, earthR - playerSize * 0.6);
    let localX = hitX - snap.x;
    let localY = hitY - snap.y;
    const dist = Math.hypot(localX, localY);
    if (dist > radiusLimit) {
        const ratio = radiusLimit / dist;
        localX *= ratio;
        localY *= ratio;
    }
    earthWalker.targetLocalX = localX;
    earthWalker.targetLocalY = localY;
    earthWalker.hasTarget = true;
}

function updateEarthWalkerAndOutput(now, ex, ey, earthR) {
    ensureEarthWorkState();
    const g = window.game;
    if (!g) return { activeZones: [], playerRect: null, playerSize: 0 };
    syncRankTitle();
    const rankMeta = getRankMeta(g.rank);
    const moveSpeed = rankMeta.speed * (g.jetpackOwned ? 3 : 1);

    if (!earthWalker.initialized) {
        earthWalker.localX = 0;
        earthWalker.localY = 0;
        earthWalker.pendingMoneyGain = 0;
        earthWalker.pendingResearchGain = 0;
        earthWalker.lastSettledMonth = Math.floor(Math.max(0, Number(g.calendarMonthsElapsed) || 0));
        earthWalker.nextNotEnoughHintAt = 0;
        earthWalker.nextFactoryHintAt = 0;
        earthWalker.nextTowerHintAt = 0;
        earthWalker.nextLabHintAt = 0;
        earthWalker.nextPortalHintAt = 0;
        earthWalker.holePromptShown = false;
        earthWalker.lastUpdateAt = now;
        earthWalker.initialized = true;
    }

    const dt = Math.min(0.08, Math.max(0.001, (now - earthWalker.lastUpdateAt) / 1000));
    earthWalker.lastUpdateAt = now;

    let inputX = 0;
    let inputY = 0;
    if (earthWalkerKeys.left) inputX -= 1;
    if (earthWalkerKeys.right) inputX += 1;
    if (earthWalkerKeys.up) inputY -= 1;
    if (earthWalkerKeys.down) inputY += 1;

    if (inputX !== 0 || inputY !== 0) {
        const len = Math.hypot(inputX, inputY) || 1;
        const nx = inputX / len;
        const ny = inputY / len;
        earthWalker.localX += nx * moveSpeed * dt;
        earthWalker.localY += ny * moveSpeed * dt;
        earthWalker.hasTarget = false;
    } else if (earthWalker.hasTarget) {
        const dx = earthWalker.targetLocalX - earthWalker.localX;
        const dy = earthWalker.targetLocalY - earthWalker.localY;
        const targetDist = Math.hypot(dx, dy);
        const step = moveSpeed * dt;
        if (targetDist <= Math.max(1.2, step)) {
            earthWalker.localX = earthWalker.targetLocalX;
            earthWalker.localY = earthWalker.targetLocalY;
            earthWalker.hasTarget = false;
        } else {
            earthWalker.localX += (dx / targetDist) * step;
            earthWalker.localY += (dy / targetDist) * step;
        }
    }

    const playerSize = Math.max(10, Math.min(20, earthR * earthWalker.sizeRatio));
    const radiusLimit = Math.max(6, earthR - playerSize * 0.6);
    const dist = Math.hypot(earthWalker.localX, earthWalker.localY);
    if (dist > radiusLimit) {
        const ratio = radiusLimit / dist;
        earthWalker.localX *= ratio;
        earthWalker.localY *= ratio;
    }

    const px = ex + earthWalker.localX;
    const py = ey + earthWalker.localY;
    const playerRect = {
        x: px - playerSize / 2,
        y: py - playerSize / 2,
        w: playerSize,
        h: playerSize
    };

    let moneyGain = 0;
    let researchGain = 0;
    const activeZones = [];
    const overlappedZones = [];
    const isPreludeMode = g.earthTimelineMode === 'level-1';
    const zones = isPreludeMode ? earthPreludeZones : earthWorkZones;

    zones.forEach(zone => {
        const zoneRect = {
            x: ex + zone.x * earthR,
            y: ey + zone.y * earthR,
            w: Math.max(16, zone.w * earthR),
            h: Math.max(14, zone.h * earthR)
        };
        const overlap = playerRect.x < zoneRect.x + zoneRect.w
            && playerRect.x + playerRect.w > zoneRect.x
            && playerRect.y < zoneRect.y + zoneRect.h
            && playerRect.y + playerRect.h > zoneRect.y;
        if (!overlap) return;
        activeZones.push(zone.id);
        overlappedZones.push(zone);
    });

    const inSchool = !isPreludeMode && activeZones.includes('school');
    const inLab = !isPreludeMode && activeZones.includes('lab');
    const inPreludeMachine = isPreludeMode && activeZones.includes('time_machine');
    const inPortal = inLab;
    const holeUnlocked = Math.max(
        0,
        Number(g.currentStage) || 0,
        Number(g.techLevel) || 0,
        Number(g.oreTechUnlockLevel) || 0
    ) >= HOLE_UNLOCK_LEVEL;
    const inTower = !isPreludeMode && activeZones.includes('command_tower');
    g.inCommandTower = inTower;
    g.inHolePortal = isPreludeMode ? false : inPortal;

    overlappedZones.forEach(zone => {
        if (isPreludeMode) return;
        if (zone.role === 'company') {
            if (g.rank === 'intern') {
                if (zone.tier === 'slum') moneyGain += 10;
            } else {
                const base = zone.tier === 'cbd' ? 10000 : 10;
                moneyGain += base * rankMeta.moneyMult;
            }
        } else if (zone.role === 'school') {
            if (g.rank === 'intern') {
                researchGain += 0.1;
            } else if (g.rank === 'engineer') {
                researchGain += 3.8;
            } else {
                researchGain += 8.5;
            }
        } else if (zone.role === 'factory') {
            if (g.rank === 'intern') {
                if (now >= earthWalker.nextFactoryHintAt) {
                    spawnGainPopup('工厂需工程师以上', '#f59e0b', px, py - playerSize * 1.35, now);
                    earthWalker.nextFactoryHintAt = now + 2200;
                }
            } else {
                // 提升产线节拍：工程师/主席产舰速度加快
                g.factoryDroneProgress += dt * (g.rank === 'chair' ? 0.55 : 0.32);
                while (g.factoryDroneProgress >= 1) {
                    if (g.rank === 'chair' && (Number(g.totalMoney) || 0) >= FACTORY_STARSHIP_COST_CHAIR_GIANT) {
                        g.totalMoney = Math.max(0, Number(g.totalMoney) - FACTORY_STARSHIP_COST_CHAIR_GIANT);
                        g.giantShipsBuilt = Math.max(0, Number(g.giantShipsBuilt) || 0) + 1;
                        spawnEarthShipStack({ screenX: ex, screenY: ey }, ex + earthR * 1.22, ey, 'giant');
                        spawnGainPopup(`-${FACTORY_STARSHIP_COST_CHAIR_GIANT}`, '#fb7185', px, py - playerSize * 1.55, now);
                        g.factoryDroneProgress -= 1;
                    } else if ((Number(g.totalMoney) || 0) >= (g.rank === 'chair' ? FACTORY_STARSHIP_COST_CHAIR_NORMAL : FACTORY_STARSHIP_COST_ENGINEER)) {
                        const normalCost = g.rank === 'chair' ? FACTORY_STARSHIP_COST_CHAIR_NORMAL : FACTORY_STARSHIP_COST_ENGINEER;
                        g.totalMoney = Math.max(0, Number(g.totalMoney) - normalCost);
                        g.shipsBuilt = Math.max(0, Number(g.shipsBuilt) || 0) + 1;
                        spawnEarthShipStack({ screenX: ex, screenY: ey }, ex + earthR * 1.22, ey, 'normal');
                        spawnGainPopup(`-${normalCost}`, '#fb7185', px, py - playerSize * 1.55, now);
                        g.factoryDroneProgress -= 1;
                    } else {
                        // 资金不足时停止自动产线，避免无意义循环
                        g.factoryDroneProgress = Math.min(g.factoryDroneProgress, 0.95);
                        if (now >= earthWalker.nextNotEnoughHintAt) {
                            const needCost = g.rank === 'chair' ? FACTORY_STARSHIP_COST_CHAIR_NORMAL : FACTORY_STARSHIP_COST_ENGINEER;
                            spawnGainPopup(`资金不足(${needCost})`, '#f87171', px, py - playerSize * 1.35, now);
                            earthWalker.nextNotEnoughHintAt = now + 1800;
                        }
                        break;
                    }
                }
            }
        }
    });

    if (!isPreludeMode) {
        tryPromoteToEngineer(dt, inSchool);
        tryPromoteToChair(dt, inSchool);
    }

    if (!isPreludeMode && g.rank === 'chair') {
        moneyGain += Math.max(0, Number(g.autoCompanyIncomePerSec) || 0) * dt;
        if (inTower) {
            moneyGain += 2200 * dt;
            researchGain += 6.5 * dt;
        }
    } else if (!isPreludeMode && inSchool && g.rank === 'engineer' && now >= earthWalker.nextLabHintAt) {
        const needMoney = Math.max(0, CHAIR_PROMOTION_COST_MONEY - Math.max(0, Number(g.totalMoney) || 0));
        const needResearch = Math.max(0, CHAIR_PROMOTION_COST_RESEARCH - Math.max(0, Number(g.researchPoints) || 0));
        const needMoneyDisplay = Math.ceil(needMoney);
        const needResearchDisplay = Math.ceil(needResearch);
        if (needMoney > 0 || needResearch > 0) {
            spawnGainPopup(
                `晋升缺口: 金${needMoneyDisplay} 研${needResearchDisplay}`,
                '#c4b5fd',
                px,
                py - playerSize * 1.75,
                now,
                { duration: 2600, rise: 10, jitter: 4 }
            );
        }
        earthWalker.nextLabHintAt = now + 4500;
    } else if (!isPreludeMode && inTower && now >= earthWalker.nextTowerHintAt) {
        spawnGainPopup('黑洞条件: 科技Lv.4', '#fb7185', px, py - playerSize * 1.55, now);
        earthWalker.nextTowerHintAt = now + 2200;
    }

    if (inPreludeMachine) {
        if (!earthWalker.holePromptShown) {
            earthWalker.holePromptShown = true;
            triggerEarthPreludeJump();
        }
    }

    if (!isPreludeMode && inPortal) {
        if (!earthWalker.holePromptShown) {
            earthWalker.holePromptShown = true;
        }
        if (holeUnlocked && now >= earthWalker.nextPortalHintAt) {
            spawnGainPopup('实验室: 按 H 进入黑洞区域', '#a78bfa', px, py - playerSize * 1.95, now, { duration: 1800, rise: 8, jitter: 4 });
            earthWalker.nextPortalHintAt = now + 3500;
        }
    } else {
        earthWalker.holePromptShown = false;
    }

    if (!isPreludeMode && inSchool && g.remoteWorkTerminal) {
        moneyGain += 600 * dt;
    }

    if (!isPreludeMode && inSchool) {
        // 工具购买不能挤占主席晋升门槛资金
        const promotionReserve = g.rank === 'engineer' ? CHAIR_PROMOTION_COST_MONEY : 0;
        if (!g.jetpackOwned && g.totalMoney >= 50000 && (g.totalMoney - 50000) >= promotionReserve) {
            g.totalMoney = Math.max(0, Number(g.totalMoney) - 50000);
            g.jetpackOwned = true;
        }
        if (!g.remoteWorkTerminal && g.totalMoney >= 180000 && (g.totalMoney - 180000) >= promotionReserve) {
            g.totalMoney = Math.max(0, Number(g.totalMoney) - 180000);
            g.remoteWorkTerminal = true;
        }
    }

    if (moneyGain > 0) {
        earthWalker.pendingMoneyGain += moneyGain;
    }
    if (researchGain > 0) {
        earthWalker.pendingResearchGain += researchGain;
    }
    g.currentMoneyStepGain = moneyGain;
    g.currentResearchStepGain = researchGain;
    g.moneyPerStep = moneyGain;
    g.researchPerStep = researchGain;

    const monthIndex = Math.floor(Math.max(0, Number(g.calendarMonthsElapsed) || 0));
    if (monthIndex > earthWalker.lastSettledMonth) {
        const settledMoney = Math.max(0, Math.floor(earthWalker.pendingMoneyGain));
        const settledResearch = Math.max(0, earthWalker.pendingResearchGain);
        if (settledMoney > 0) {
            g.totalMoney = Math.max(0, Number(g.totalMoney) || 0) + settledMoney;
        }
        if (settledResearch > 0) {
            g.researchPoints = Math.max(0, Number(g.researchPoints) || 0) + settledResearch;
        }

        const popupAnchorX = px;
        const popupAnchorY = py - playerSize * 1.05;
        if (settledMoney > 0) {
            spawnGainPopup(`+${settledMoney}`, '#fbbf24', popupAnchorX, popupAnchorY, now);
        }
        if (settledResearch >= 0.5) {
            spawnGainPopup(`+${Math.floor(settledResearch)}研`, '#7dd3fc', popupAnchorX, popupAnchorY - 16, now);
        }

        earthWalker.pendingMoneyGain = 0;
        earthWalker.pendingResearchGain = 0;
        earthWalker.lastSettledMonth = monthIndex;
    }

    return { activeZones, playerRect, playerSize, rankMeta, inSchool, inLab, inTower, inPortal };
}

function drawEarthWorkZonesAndWalker(ex, ey, earthR, activeZones, playerRect, workState = null) {
    if (earthR < 24 || !playerRect) return;
    const g = window.game || {};
    const rankMeta = workState?.rankMeta || getRankMeta(g.rank);
    const activeSet = new Set(activeZones || []);
    ctx.save();
    ctx.beginPath();
    ctx.arc(ex, ey, earthR, 0, Math.PI * 2);
    ctx.clip();

    const isPreludeMode = (window.game?.earthTimelineMode === 'level-1');
    const zones = isPreludeMode ? earthPreludeZones : earthWorkZones;
    zones.forEach(zone => {
        const zx = ex + zone.x * earthR;
        const zy = ey + zone.y * earthR;
        const zw = Math.max(16, zone.w * earthR);
        const zh = Math.max(14, zone.h * earthR);
        const isActive = activeSet.has(zone.id);

        ctx.save();
        const baseGrad = ctx.createLinearGradient(zx, zy, zx + zw, zy + zh);
        baseGrad.addColorStop(0, zone.color);
        baseGrad.addColorStop(1, 'rgba(15, 23, 42, 0.35)');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(zx, zy, zw, zh);

        if (zone.role === 'company') {
            ctx.fillStyle = 'rgba(203, 213, 225, 0.88)';
            ctx.fillRect(zx + zw * 0.08, zy + zh * 0.12, zw * 0.84, zh * 0.78);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.45)';
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 3; j++) {
                    ctx.fillRect(zx + zw * (0.14 + i * 0.2), zy + zh * (0.2 + j * 0.24), zw * 0.12, zh * 0.12);
                }
            }
            if (zone.tier === 'cbd') {
                ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
                ctx.fillRect(zx + zw * 0.05, zy + zh * 0.04, zw * 0.9, zh * 0.08);
            }
        } else if (zone.role === 'factory') {
            ctx.fillStyle = 'rgba(180, 83, 9, 0.85)';
            ctx.fillRect(zx + zw * 0.08, zy + zh * 0.24, zw * 0.84, zh * 0.66);
            ctx.fillStyle = 'rgba(120, 53, 15, 0.95)';
            ctx.fillRect(zx + zw * 0.18, zy + zh * 0.08, zw * 0.14, zh * 0.22);
            ctx.fillRect(zx + zw * 0.46, zy + zh * 0.03, zw * 0.12, zh * 0.28);
            ctx.fillStyle = 'rgba(203, 213, 225, 0.58)';
            ctx.beginPath();
            ctx.arc(zx + zw * 0.25, zy + zh * 0.06, zw * 0.08, 0, Math.PI * 2);
            ctx.arc(zx + zw * 0.52, zy + zh * 0.01, zw * 0.07, 0, Math.PI * 2);
            ctx.fill();
        } else if (zone.role === 'school') {
            ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
            ctx.fillRect(zx + zw * 0.1, zy + zh * 0.28, zw * 0.8, zh * 0.62);
            ctx.fillStyle = 'rgba(30, 64, 175, 0.85)';
            ctx.beginPath();
            ctx.moveTo(zx + zw * 0.06, zy + zh * 0.32);
            ctx.lineTo(zx + zw * 0.5, zy + zh * 0.08);
            ctx.lineTo(zx + zw * 0.94, zy + zh * 0.32);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
            ctx.fillRect(zx + zw * 0.46, zy + zh * 0.55, zw * 0.08, zh * 0.35);
        } else if (zone.role === 'lab') {
            ctx.fillStyle = 'rgba(243, 232, 255, 0.88)';
            ctx.fillRect(zx + zw * 0.12, zy + zh * 0.36, zw * 0.76, zh * 0.54);
            ctx.fillStyle = 'rgba(147, 51, 234, 0.75)';
            ctx.beginPath();
            ctx.arc(zx + zw * 0.5, zy + zh * 0.36, Math.min(zw, zh) * 0.24, Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(196, 181, 253, 0.45)';
            ctx.fillRect(zx + zw * 0.2, zy + zh * 0.5, zw * 0.6, zh * 0.15);
        } else if (zone.role === 'tower') {
            ctx.fillStyle = 'rgba(251, 113, 133, 0.85)';
            ctx.fillRect(zx + zw * 0.38, zy + zh * 0.08, zw * 0.24, zh * 0.82);
            ctx.fillStyle = 'rgba(255, 228, 230, 0.9)';
            ctx.fillRect(zx + zw * 0.46, zy, zw * 0.08, zh * 0.14);
        } else if (zone.role === 'time_machine') {
            ctx.fillStyle = 'rgba(250, 250, 250, 0.82)';
            ctx.fillRect(zx + zw * 0.16, zy + zh * 0.26, zw * 0.68, zh * 0.62);
            ctx.strokeStyle = 'rgba(203, 213, 225, 0.92)';
            ctx.lineWidth = Math.max(1.2, earthR * 0.02);
            ctx.beginPath();
            ctx.arc(zx + zw * 0.5, zy + zh * 0.38, Math.min(zw, zh) * 0.20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(59, 130, 246, 0.35)';
            ctx.beginPath();
            ctx.arc(zx + zw * 0.5, zy + zh * 0.38, Math.min(zw, zh) * 0.11, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = isActive ? '#ffffff' : zone.border;
        ctx.lineWidth = isActive ? 2.2 : 1.3;
        ctx.strokeRect(zx, zy, zw, zh);

        ctx.font = `${Math.max(10, Math.min(13, earthR * 0.16))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = 'rgba(0,0,0,0.62)';
        ctx.lineWidth = 2;
        ctx.strokeText(zone.label, zx + zw / 2, zy + zh / 2);
        ctx.fillText(zone.label, zx + zw / 2, zy + zh / 2);
        ctx.restore();
    });

    const px = playerRect.x;
    const py = playerRect.y;
    const pw = playerRect.w;
    const ph = playerRect.h;
    const cx = px + pw / 2;
    const glow = Math.max(0.1, rankMeta.glow || 0.2);

    ctx.save();
    ctx.fillStyle = `rgba(168, 85, 247, ${0.15 + glow * 0.35})`;
    ctx.beginPath();
    ctx.arc(cx, py + ph * 0.55, pw * (0.9 + glow * 0.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 职业外观反馈
    const headR = Math.max(2, pw * 0.18);
    const headY = py + ph * 0.24;
    ctx.save();
    ctx.fillStyle = '#f8d5c4';
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    const bodyW = pw * 0.52;
    const bodyH = ph * 0.44;
    const bodyX = cx - bodyW / 2;
    const bodyY = py + ph * 0.34;
    if (rankMeta.outfit === 'intern') {
        ctx.fillStyle = '#2563eb';
        ctx.strokeStyle = '#bfdbfe';
    } else if (rankMeta.outfit === 'engineer') {
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#9ca3af';
    } else {
        ctx.fillStyle = '#7c3aed';
        ctx.strokeStyle = '#ddd6fe';
    }
    ctx.lineWidth = 1.2;
    ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
    ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

    if (rankMeta.outfit === 'engineer') {
        ctx.fillStyle = 'rgba(14, 116, 144, 0.8)';
        ctx.fillRect(cx - pw * 0.45, py + ph * 0.88, pw * 0.9, ph * 0.08);
    }

    if (rankMeta.outfit === 'chair') {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.85)';
        ctx.fillRect(cx - pw * 0.52, py + ph * 0.28, pw * 1.04, ph * 0.06);
        for (let k = 0; k < 2; k++) {
            const sx = cx + (k === 0 ? -pw * 0.86 : pw * 0.86);
            const sy = py + ph * 0.34 + Math.sin(performance.now() * 0.004 + k * 1.8) * ph * 0.08;
            ctx.fillStyle = 'rgba(192, 132, 252, 0.92)';
            ctx.beginPath();
            ctx.arc(sx, sy, pw * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const legW = Math.max(1.6, pw * 0.16);
    const legH = Math.max(3, ph * 0.22);
    const leftLegX = bodyX + bodyW * 0.18;
    const rightLegX = bodyX + bodyW * 0.66;
    const legY = bodyY + bodyH;
    ctx.fillStyle = '#5b21b6';
    ctx.fillRect(leftLegX, legY, legW, legH);
    ctx.fillRect(rightLegX, legY, legW, legH);

    const armW = Math.max(1.5, pw * 0.12);
    const armH = Math.max(2.2, ph * 0.20);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(bodyX - armW, bodyY + ph * 0.05, armW, armH);
    ctx.fillRect(bodyX + bodyW, bodyY + ph * 0.05, armW, armH);

    const badgeText = g.rankTitle || rankMeta.title;
    const badgeY = py - Math.max(14, ph * 0.46);
    ctx.font = `700 ${Math.max(10, Math.min(14, pw * 0.36))}px sans-serif`;
    const badgeW = ctx.measureText(badgeText).width + 16;
    const badgeH = Math.max(16, ph * 0.3);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
    ctx.fillRect(cx - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);
    ctx.strokeStyle = 'rgba(224, 231, 255, 0.9)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);
    ctx.fillStyle = '#f5f3ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, cx, badgeY);

    if (workState?.inSchool && g.rank === 'intern') {
        const p = Math.max(0, Math.min(1, (Number(g.schoolTrainingProgress) || 0) / SCHOOL_PROMOTION_HOLD_SECONDS));
        const w = pw * 1.45;
        const h = Math.max(4, ph * 0.08);
        const x = cx - w / 2;
        const y = badgeY + badgeH * 0.7;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.95)';
        ctx.fillRect(x, y, w * p, h);
    }

    if (workState?.inSchool && g.rank === 'engineer') {
        const p = Math.max(0, Math.min(1, (Number(g.labPromotionProgress) || 0) / LAB_PROMOTION_HOLD_SECONDS));
        const w = pw * 1.45;
        const h = Math.max(4, ph * 0.08);
        const x = cx - w / 2;
        const y = badgeY + badgeH * 0.7;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.95)';
        ctx.fillRect(x, y, w * p, h);
    }
    ctx.restore();
    ctx.restore();
}

function shouldCaptureWalkerHotkeys(target) {
    if (!target || typeof target.closest !== 'function') return true;
    if (target.closest('input, textarea, select, button, [contenteditable="true"]')) return false;
    return true;
}

window.addEventListener('keydown', (event) => {
    if (!shouldCaptureWalkerHotkeys(event.target)) return;
    const key = event.key;
    if (key === 'ArrowUp' || key === 'w' || key === 'W') earthWalkerKeys.up = true;
    if (key === 'ArrowDown' || key === 's' || key === 'S') earthWalkerKeys.down = true;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') earthWalkerKeys.left = true;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') earthWalkerKeys.right = true;
});

window.addEventListener('keyup', (event) => {
    const key = event.key;
    if (key === 'ArrowUp' || key === 'w' || key === 'W') earthWalkerKeys.up = false;
    if (key === 'ArrowDown' || key === 's' || key === 'S') earthWalkerKeys.down = false;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') earthWalkerKeys.left = false;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') earthWalkerKeys.right = false;
});

window.addEventListener('blur', () => {
    earthWalkerKeys.up = false;
    earthWalkerKeys.down = false;
    earthWalkerKeys.left = false;
    earthWalkerKeys.right = false;
});

function spawnEarthShipStack(planet, hitX, hitY, shipType = 'normal') {
    if (!planet) return;
    const px = planet.screenX || centerX;
    const py = planet.screenY || centerY;
    const aim = Math.atan2(hitY - py, hitX - px);
    earthShipStacks.push({
        unitId: nextShipUnitId++,
        bornAt: performance.now(),
        launchAngle: aim,
        launchLift: Math.random() * 18 + 12,
        wobble: (Math.random() - 0.5) * 0.24,
        popMs: 380 + Math.random() * 140,
        shipType,
        code: 100 + Math.floor(Math.random() * 900),
        firePhase: Math.random() * Math.PI * 2
    });
    if (earthShipStacks.length > 120) {
        earthShipStacks.splice(0, earthShipStacks.length - 120);
    }
}

function spawnMilitaryShipVisual(shipType = 'normal') {
    const earth = planets.find(item => item.id === 'earth');
    if (!earth) return;
    const px = earth.screenX || centerX;
    const py = earth.screenY || centerY;
    const pr = Math.max(earth.drawR || 16, 16);
    const a = Math.random() * Math.PI * 2;
    const hitX = px + Math.cos(a) * pr * (1.25 + Math.random() * 0.5);
    const hitY = py + Math.sin(a) * pr * (1.25 + Math.random() * 0.5);
    spawnEarthShipStack(earth, hitX, hitY, shipType);
}

function getBattleshipSprite(size) {
    const key = Math.max(18, Math.floor(size));
    if (battleshipSpriteCache.has(key)) return battleshipSpriteCache.get(key);

    const px = Math.max(1, Math.round(key * 0.055));
    const w = 18;
    const h = 12;
    const off = document.createElement('canvas');
    off.width = w * px;
    off.height = h * px;
    const sx = off.getContext('2d');
    sx.imageSmoothingEnabled = false;

    const fill = (x, y, ww, hh, col) => {
        sx.fillStyle = col;
        sx.fillRect(x * px, y * px, ww * px, hh * px);
    };

    fill(1, 5, 10, 2, '#60779f');
    fill(2, 5, 8, 1, '#dbe8ff');
    fill(4, 5, 3, 2, '#ba1d2e');

    fill(10, 4, 4, 1, '#3e506d');
    fill(10, 7, 4, 1, '#3e506d');
    fill(13, 4, 3, 2, '#2a374c');
    fill(16, 5, 2, 1, '#8ca4cf');

    fill(2, 4, 3, 1, '#7f95bf');
    fill(3, 4, 1, 1, '#9ce0ff');
    fill(2, 7, 4, 1, '#991727');

    fill(0, 5, 1, 1, '#334157');
    fill(0, 7, 1, 1, '#334157');
    fill(1, 5, 1, 1, '#4bd9ff');
    fill(1, 7, 1, 1, '#4bd9ff');
    fill(17, 5, 1, 1, '#4bd9ff');
    fill(17, 7, 1, 1, '#4bd9ff');

    sx.strokeStyle = '#1a2231';
    sx.lineWidth = 1;
    sx.strokeRect(1 * px, 5 * px, 10 * px, 2 * px);
    sx.strokeRect(10 * px, 4 * px, 4 * px, 4 * px);

    fill(3, 6, 1, 1, '#111827');
    fill(5, 6, 1, 1, '#111827');
    fill(7, 6, 1, 1, '#111827');

    battleshipSpriteCache.set(key, off);
    return off;
}

function drawUnifiedBattleship(x, y, size, alpha = 1, tilt = 0, code = 0, fire = 0) {
    const sprite = getBattleshipSprite(size);
    const drawW = size * 3.1;
    const drawH = size * 1.62;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(size * 0.14, size * 0.44, size * 1.08, size * 0.30, 0.02, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(sprite, -drawW * 0.52, -drawH * 0.5, drawW, drawH);

    ctx.fillStyle = 'rgba(225,236,255,0.9)';
    ctx.font = `${Math.max(7, size * 0.20)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(code || 0), size * 0.08, size * 0.02);

    const pulse = 0.35 + 0.65 * Math.max(0, Math.sin(fire * 5.4));
    const plumeLen = size * (0.72 + 0.34 * pulse);
    const plumeW = size * (0.08 + 0.03 * pulse);
    const plume = ctx.createLinearGradient(-size * 1.46 - plumeLen, 0, -size * 1.02, 0);
    plume.addColorStop(0, 'rgba(78, 214, 255, 0.00)');
    plume.addColorStop(0.45, `rgba(98, 220, 255, ${0.45 * pulse})`);
    plume.addColorStop(1, 'rgba(226, 248, 255, 0.0)');
    ctx.fillStyle = plume;
    ctx.fillRect(-size * 1.46 - plumeLen, -size * 0.11, plumeLen + size * 0.45, plumeW);
    ctx.fillRect(-size * 1.46 - plumeLen, size * 0.11, plumeLen + size * 0.45, plumeW);

    ctx.fillStyle = `rgba(98, 220, 255, ${0.65 * pulse})`;
    ctx.beginPath();
    ctx.ellipse(-size * 1.10, -size * 0.09, size * 0.12, size * 0.05, 0, 0, Math.PI * 2);
    ctx.ellipse(-size * 1.10, size * 0.15, size * 0.12, size * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    if (fire > 0.05) {
        ctx.fillStyle = `rgba(255, 210, 145, ${0.38 * pulse})`;
        ctx.beginPath();
        ctx.arc(size * 0.86, -size * 0.06, size * 0.05 + size * 0.02 * pulse, 0, Math.PI * 2);
        ctx.arc(size * 0.86, size * 0.10, size * 0.05 + size * 0.02 * pulse, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function updateEarthShipStacks(now) {
    if (!earthShipStacks.length) return;
    const earth = planets.find(item => item.id === 'earth');
    if (!earth || !Number.isFinite(earth.screenX) || !Number.isFinite(earth.screenY)) return;

    const dt = lastShipFrameAt > 0 ? Math.max(0.001, Math.min(0.05, (now - lastShipFrameAt) / 1000)) : 1 / 60;
    lastShipFrameAt = now;

    const earthR = Math.max(earth.drawR || 12, 12);
    const shipSizeBase = Math.max(18, Math.min(32, earthR * 0.46));
    const perSectorRow = 5;
    const placedShips = [];
    const sectors = [
        { angle: Math.PI, spread: 0.52 },
        { angle: -2.55, spread: 0.58 },
        { angle: 2.55, spread: 0.58 }
    ];

    const aliveShips = [];
    for (let i = 0; i < earthShipStacks.length; i++) {
        const item = earthShipStacks[i];
        if (!item.attackTarget) {
            aliveShips.push(item);
            continue;
        }

        const target = getAttackTargetPosition(item.attackTarget);
        item.attackProgress = Math.max(0, Number(item.attackProgress) || 0) + dt * (item.shipType === 'giant' ? 0.16 : 0.22);
        const p = Math.max(0, Math.min(1, item.attackProgress));
        const originX = Number.isFinite(item.attackOriginX) ? item.attackOriginX : earth.screenX;
        const originY = Number.isFinite(item.attackOriginY) ? item.attackOriginY : earth.screenY;
        const x = originX + (target.x - originX) * p;
        const y = originY + (target.y - originY) * p - Math.sin(p * Math.PI) * Math.max(10, earthR * 0.36);
        const shipSize = shipSizeBase * (item.shipType === 'giant' ? 1.7 : (item.shipType === 'scout' ? 0.82 : 1));
        const tilt = Math.atan2(target.y - originY, target.x - originX);
        const fire = Math.max(0, Math.sin((now * 0.0024) + item.firePhase));

        item.screenX = x;
        item.screenY = y;

        drawUnifiedBattleship(x, y, shipSize, 0.8, tilt, item.code, fire);

        if (p >= 1) {
            createParticle(x, y, target.x, target.y);
            if (item.attackTarget === 'moon' && item.shipType === 'scout') {
                window.game.moonScanPoints = Math.max(0, Number(window.game.moonScanPoints) || 0) + 1;
                window.game.researchPoints = Math.max(0, Number(window.game.researchPoints) || 0) + 8;
                window.game.totalMoney = Math.max(0, Number(window.game.totalMoney) || 0) + 120;
                window.game.moonScouted = true;
            }
            continue;
        }

        aliveShips.push(item);
    }

    const idleShips = aliveShips.filter(item => !item.attackTarget);

    for (let i = 0; i < idleShips.length; i++) {
        const item = idleShips[i];
        const sectorIndex = i % sectors.length;
        const bandIndex = Math.floor(i / sectors.length);
        const col = bandIndex % perSectorRow;
        const row = Math.floor(bandIndex / perSectorRow);
        const sector = sectors[sectorIndex];
        const typeScale = item.shipType === 'giant' ? 1.7 : (item.shipType === 'scout' ? 0.82 : 1);
        const shipSize = shipSizeBase * (1 - Math.min(0.30, row * 0.06)) * typeScale;

        const nx = Math.cos(sector.angle);
        const ny = Math.sin(sector.angle);
        const tx = -ny;
        const ty = nx;
        const radialDist = earthR * (0.26 + row * 0.30 + sectorIndex * 0.05);
        const lateral = (col - (perSectorRow - 1) / 2) * shipSize * sector.spread;
        const xT = earth.screenX + nx * radialDist + tx * lateral;
        const yT = earth.screenY + ny * radialDist + ty * lateral;

        const elapsed = now - item.bornAt;
        const popDur = Math.max(180, item.popMs || 360);
        const p = Math.max(0, Math.min(1, elapsed / popDur));
        const eased = 1 - Math.pow(1 - p, 3);
        const sx = earth.screenX + Math.cos(item.launchAngle || 0) * earthR * 1.03;
        const sy = earth.screenY + Math.sin(item.launchAngle || 0) * earthR * 1.03;
        const arc = Math.sin(eased * Math.PI) * (item.launchLift || 16);
        const x = sx + (xT - sx) * eased;
        const y = sy + (yT - sy) * eased - arc;

        const depthFade = Math.max(0.50, 1 - row * 0.12);
        const alpha = (0.45 + 0.55 * eased) * depthFade;
        const scaleBoost = p < 1 ? (0.82 + 0.22 * eased + 0.08 * Math.sin(eased * Math.PI)) : 1;
        const preferredTilt = -0.62;
        const sectorTilt = sectorIndex === 0 ? 0.04 : (sectorIndex === 1 ? -0.03 : 0.08);
        const tilt = preferredTilt + sectorTilt + (col - 2) * 0.028 + (item.wobble || 0) * 0.25 * (1 - eased);
        const fire = Math.max(0, Math.sin((now * 0.0024) + item.firePhase + col * 0.5 + sectorIndex * 0.8));

        let finalX = x;
        let finalY = y;
        const selfR = shipSize * scaleBoost * 0.78;
        for (let pass = 0; pass < 2; pass++) {
            for (let j = 0; j < placedShips.length; j++) {
                const prev = placedShips[j];
                const dx = finalX - prev.x;
                const dy = finalY - prev.y;
                const dist = Math.hypot(dx, dy);
                const minDist = selfR + prev.r + shipSize * 0.12;
                if (dist >= minDist) continue;
                const ux = dist > 0.0001 ? (dx / dist) : Math.cos(sector.angle - Math.PI * 0.5);
                const uy = dist > 0.0001 ? (dy / dist) : Math.sin(sector.angle - Math.PI * 0.5);
                const push = (minDist - dist);
                finalX += ux * push;
                finalY += uy * push;
            }
        }

        placedShips.push({ x: finalX, y: finalY, r: selfR });

        ctx.save();
        ctx.globalAlpha = alpha * 0.30;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.beginPath();
        ctx.ellipse(
            finalX + Math.cos(sector.angle) * shipSize * 0.18,
            finalY + Math.sin(sector.angle) * shipSize * 0.18,
            shipSize * 0.95,
            shipSize * 0.26,
            tilt,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        drawUnifiedBattleship(finalX, finalY, shipSize * scaleBoost, alpha, tilt, item.code, fire);

        item.screenX = finalX;
        item.screenY = finalY;

        if (selectedShipUnitIds.has(item.unitId)) {
            ctx.save();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.92)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(finalX, finalY, Math.max(8, shipSize * 0.62), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    earthShipStacks.length = 0;
    aliveShips.forEach(item => earthShipStacks.push(item));

    if (selectedShipUnitIds.size > 0) {
        const aliveIds = new Set(earthShipStacks.map(item => item.unitId));
        for (const id of Array.from(selectedShipUnitIds)) {
            if (!aliveIds.has(id)) {
                selectedShipUnitIds.delete(id);
            }
        }
        updateFleetCommandPanel();
    }
}


function showStoryEvent(title, contentHtml, buttonText = '继续', onConfirm = null) {
    if (storyEventOpen) return;
    storyEventOpen = true;
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(520px, 88vw);
        background: rgba(10, 16, 30, 0.96);
        border: 2px solid rgba(251, 191, 36, 0.85);
        border-radius: 16px;
        box-shadow: 0 0 36px rgba(251, 191, 36, 0.28);
        padding: 1.2rem 1.3rem;
        z-index: 10050;
        color: #e5e7eb;
        text-align: center;
        backdrop-filter: blur(8px);
    `;
    modal.innerHTML = `
        <div style="font-size:1.35rem;font-weight:800;color:#fbbf24;margin-bottom:0.55rem;">${title}</div>
        <div style="line-height:1.7;color:#cbd5e1;margin-bottom:1rem;">${contentHtml}</div>
        <button style="
            border:none;
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            color:#fff;
            font-weight:700;
            border-radius:10px;
            padding:0.65rem 1rem;
            cursor:pointer;
            width:100%;
        ">${buttonText}</button>
    `;
    document.body.appendChild(modal);
    modal.querySelector('button').addEventListener('click', () => {
        modal.remove();
        storyEventOpen = false;
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });
}

function showEarthDestroyedEvent(reasonText = '机器人军团被水星微生物打败！地球灭亡') {
    if (storyEventOpen) return;
    storyEventOpen = true;
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(520px, 88vw);
        background: rgba(28, 8, 10, 0.97);
        border: 2px solid rgba(239, 68, 68, 0.9);
        border-radius: 16px;
        box-shadow: 0 0 40px rgba(239, 68, 68, 0.3);
        padding: 1.2rem 1.3rem;
        z-index: 10060;
        color: #fee2e2;
        text-align: center;
        backdrop-filter: blur(8px);
    `;
    modal.innerHTML = `
        <div style="font-size:1.45rem;font-weight:900;color:#ef4444;margin-bottom:0.55rem;">💥 地球灭亡</div>
        <div style="line-height:1.75;color:#fecaca;margin-bottom:1rem;">${reasonText}</div>
        <button style="
            border:none;
            background: linear-gradient(135deg, #ef4444, #b91c1c);
            color:#fff;
            font-weight:800;
            border-radius:10px;
            padding:0.68rem 1rem;
            cursor:pointer;
            width:100%;
        ">重新开始</button>
    `;
    document.body.appendChild(modal);
    modal.querySelector('button').addEventListener('click', () => {
        try {
            localStorage.removeItem('spaceEmpireV5');
            sessionStorage.setItem('resetFlag', 'true');
        } catch (_) {}
        location.reload(true);
    });
}

function playEarthToMarsAttackAnimation(force = false) {
    const earth = planets.find(item => item.id === 'earth');
    const mars = planets.find(item => item.id === 'mars');
    if (!earth || !mars) return;
    if (!Number.isFinite(earth.screenX) || !Number.isFinite(earth.screenY)) return;
    if (!Number.isFinite(mars.screenX) || !Number.isFinite(mars.screenY)) return;

    const now = performance.now();
    if (!force && now - lastMarsAttackAnimAt < 280) return;
    lastMarsAttackAnimAt = now;

    const sx = earth.screenX;
    const sy = earth.screenY;
    const tx = mars.screenX;
    const ty = mars.screenY;
    const dx = tx - sx;
    const dy = ty - sy;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const duration = force ? 900 : 680;
    const icon = document.createElement('div');
    icon.textContent = '🚀';
    icon.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        font-size: ${force ? 24 : 20}px;
        pointer-events: none;
        z-index: 10070;
        filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.75));
        transform: translate(${sx}px, ${sy}px) rotate(${Math.atan2(dy, dx)}rad);
    `;
    document.body.appendChild(icon);

    const startedAt = performance.now();
    function tick(frameNow) {
        const p = Math.min(1, (frameNow - startedAt) / duration);
        const eased = 1 - Math.pow(1 - p, 2);
        const x = sx + dx * eased;
        const y = sy + dy * eased - Math.sin(eased * Math.PI) * Math.min(28, distance * 0.1);
        const scale = 0.9 + 0.35 * Math.sin(eased * Math.PI);
        icon.style.transform = `translate(${x}px, ${y}px) rotate(${Math.atan2(dy, dx)}rad) scale(${scale})`;
        icon.style.opacity = `${1 - p * 0.25}`;
        if (p < 1) {
            requestAnimationFrame(tick);
            return;
        }
        icon.remove();

        const boom = document.createElement('div');
        boom.textContent = '💥';
        boom.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            font-size: 22px;
            pointer-events: none;
            z-index: 10071;
            transform: translate(${tx}px, ${ty}px) scale(0.7);
            filter: drop-shadow(0 0 12px rgba(248, 113, 113, 0.9));
            transition: transform 280ms ease, opacity 280ms ease;
        `;
        document.body.appendChild(boom);
        requestAnimationFrame(() => {
            boom.style.transform = `translate(${tx}px, ${ty}px) scale(1.22)`;
            boom.style.opacity = '0';
        });
        setTimeout(() => boom.remove(), 320);
    }
    requestAnimationFrame(tick);
}

function updateHitEffects(now) {
    for (let i = hitEffects.length - 1; i >= 0; i--) {
        const e = hitEffects[i];
        const p = planets.find(pl => pl.id === e.planetId);
        if (!p || !p.drawR || !p.screenX || !p.screenY) {
            hitEffects.splice(i, 1);
            continue;
        }
        const elapsed = now - e.bornAt;
        if (elapsed >= e.duration) {
            hitEffects.splice(i, 1);
            continue;
        }
        const t = elapsed / e.duration;
        const alpha = 1 - t;
        const scaleR = p.drawR / Math.max(1, e.spawnR);
        const x = p.screenX + e.ox * scaleR;
        const y = p.screenY + e.oy * scaleR;
        const ringR = p.drawR * (0.35 + 0.85 * t);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.58 * alpha;
        ctx.beginPath();
        ctx.arc(x, y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.5, p.drawR * 0.08 * alpha + 0.8);
        ctx.stroke();

        ctx.globalAlpha = 0.75 * alpha;
        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(2, p.drawR * (0.32 + 0.28 * t)));
        g.addColorStop(0, 'rgba(255,255,255,0.95)');
        g.addColorStop(1, 'rgba(255,180,80,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, p.drawR * (0.32 + 0.28 * t)), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.8 * alpha;
        ctx.fillStyle = '#fbbf24';
        ctx.font = '700 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`+${Math.max(1, Math.floor(e.gain))}`, x, y - p.drawR * (0.75 + 0.35 * t));
        ctx.restore();
    }
}

function handlePlanetMineClick(planet, event) {
    if (storyEventOpen) return;
    if (!planet || planet.isSun) return;
    const unlocked = game.unlockedPlanets.includes(planet.id) || game.currentStage >= planet.unlockStage;
    if (!unlocked) return;

    const hitX = event?.clientX ?? (planet.screenX || centerX);
    const hitY = event?.clientY ?? (planet.screenY || centerY);
    game.totalClicks = (game.totalClicks || 0) + 1;

    createHitEffect(planet, hitX, hitY, 0);

    if (planet.id === 'earth') {
        const st = planetClickStats.earth;
        st.clicks++;
        mineEarthResourcesOnClick();
        if (typeof window.handleEarthConquestClick === 'function') {
            window.handleEarthConquestClick();
        }
    }

    if (planet.id === 'moon') {
        if (typeof window.handlePlanetTaskClick === 'function') {
            window.handlePlanetTaskClick('moon');
        }
        const st = planetClickStats.moon;
        st.clicks++;
        if (!st.warningShown && st.clicks >= 10) {
            st.warningShown = true;
            planetClickMultiplier.moon = 0.05;
            showStoryEvent(
                '⚠️ 月球矿产预警',
                '月球矿脉已进入枯竭期！<br>月球点击收益下降 95%，需要开辟更深空资源。',
                '明白，继续扩张'
            );
        }
    }

    if (planet.id === 'mars') {
        if (typeof window.handlePlanetTaskClick === 'function') {
            window.handlePlanetTaskClick('mars');
        }
        const st = planetClickStats.mars;
        st.clicks++;
        const marsBattleWon = !!window.game?.marsBattleWon;
        const marsClicks = Math.max(0, Number(window.game?.marsClickCount) || 0);
        const marsBattleUnlockClicks = 5;

        if (!st.rebellionShown && marsClicks >= marsBattleUnlockClicks) {
            st.rebellionShown = true;
            planetClickMultiplier.mars = 0.05;
            playEarthToMarsAttackAnimation(true);
            showStoryEvent(
                '🚨 火星地底人反抗',
                '火星地底势力发起反扑，地球采矿据点遭到袭击。<br>请在任务栏点击战斗按钮主动进攻火星前线。',
                '前往战斗',
                () => {
                    if (typeof window.openMarsBattle === 'function') {
                        window.openMarsBattle();
                    }
                }
            );
        }

        if (!marsBattleWon) {
            planetClickMultiplier.mars = 0.05;
            playEarthToMarsAttackAnimation(false);
            if (marsClicks >= marsBattleUnlockClicks && typeof window.openMarsBattle === 'function' && st.clicks % 4 === 0) {
                window.openMarsBattle();
            }
        } else if (!st.peaceShown) {
            st.peaceShown = true;
            planetClickMultiplier.mars = 1;
            playEarthToMarsAttackAnimation(true);
        }
    }

    if (planet.id === 'mercury') {
        if (typeof window.handlePlanetTaskClick === 'function') {
            window.handlePlanetTaskClick('mercury');
        }
        const st = planetClickStats.mercury;
        const mercuryClicks = Math.max(0, Number(game.mercuryClickCount) || 0);

        if (!st.firstHintShown && mercuryClicks >= 5) {
            st.firstHintShown = true;
            planetClickMultiplier.mercury = 0;
            showStoryEvent(
                '🪨 水星勘探报告',
                '水星发现高活性微生物群，已对前线采矿构成威胁。请派机器人军团清剿。',
                '继续点击'
            );
            if (typeof updateUI === 'function') updateUI();
            if (typeof checkStageProgress === 'function') checkStageProgress();
            return;
        }

        if (st.firstHintShown && !st.counterAttackShown && mercuryClicks >= 6) {
            st.counterAttackShown = true;
            let previewRobotCount = 0;
            if (typeof window.getBuildingCount === 'function') {
                previewRobotCount = Math.max(0, Number(window.getBuildingCount('robotLegion')) || 0);
            }
            showStoryEvent(
                '⚠️ 紧急战报',
                `水星微生物群开始反攻地球前线据点！<br>当前有效机器人军团：${previewRobotCount}/3`,
                '准备防御',
                () => {
                    let robotCount = 0;
                    if (typeof window.getBuildingCount === 'function') {
                        robotCount = Math.max(0, Number(window.getBuildingCount('robotLegion')) || 0);
                    }

                    if (robotCount < 3 && !st.gameOverShown) {
                        st.gameOverShown = true;
                        showEarthDestroyedEvent();
                    }
                }
            );
            if (typeof updateUI === 'function') updateUI();
            if (typeof checkStageProgress === 'function') checkStageProgress();
            return;
        }

        if (st.counterAttackShown && !st.gameOverShown && !st.conqueredShown && mercuryClicks >= 10) {
            st.conqueredShown = true;
            showStoryEvent(
                '🏁 战役完成',
                '地球人消灭了水星上的一切微生物，寸草不留',
                '继续远征'
            );
        }
    }

    if (planet.id === 'venus') {
        if (typeof window.handlePlanetTaskClick === 'function') {
            window.handlePlanetTaskClick('venus');
        }
        const st = planetClickStats.venus;
        st.clicks = Math.max(0, Number(game.venusClickCount) || 0);
        if (!st.warningShown && st.clicks >= 5) {
            st.warningShown = true;
            planetClickMultiplier.venus = 0;
            showStoryEvent(
                '🌫️ 金星勘探报告',
                '金星上没有金子，也没有任何方便开采的矿石。',
                '知道了'
            );
        }
    }

    if (planet.id === 'jupiter') {
        if (typeof window.handlePlanetTaskClick === 'function') {
            window.handlePlanetTaskClick('jupiter');
        }
        const st = planetClickStats.jupiter;
        if (!st.warningShown) {
            st.warningShown = true;
            showStoryEvent(
                '🛰️ 木星开采受阻',
                '科技落后，开采难度太大！<br>建议先提升科技等级后再进行深空开采。',
                '先发展科技'
            );
        }
    }

    if (planet.id === 'saturn') {
        if (typeof window.handlePlanetTaskClick === 'function') {
            window.handlePlanetTaskClick('saturn');
        }
        const st = planetClickStats.saturn;
        if (!st.warningShown) {
            st.warningShown = true;
            showStoryEvent(
                '🪐 土星开采受阻',
                '科技落后，开采难度太大！<br>建议先提升科技等级后再挑战土星资源。',
                '先发展科技'
            );
        }
    }

    if (typeof updateUI === 'function') updateUI();
    if (typeof checkStageProgress === 'function') checkStageProgress();
}

function hitTestBody(x, y) {
    for (let i = interactiveBodies.length - 1; i >= 0; i--) {
        const body = interactiveBodies[i];
        const dx = x - body.x;
        const dy = y - body.y;
        if (dx * dx + dy * dy <= body.r * body.r) return body;
    }
    return null;
}

function hitTestSlot(x, y) {
    for (let i = slotHotspots.length - 1; i >= 0; i--) {
        const slot = slotHotspots[i];
        const dx = x - slot.x;
        const dy = y - slot.y;
        if (dx * dx + dy * dy <= slot.r * slot.r) return slot;
    }
    return null;
}

function getCanvasPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const source = event?.touches?.[0] || event?.changedTouches?.[0] || event;
    const clientX = source?.clientX ?? 0;
    const clientY = source?.clientY ?? 0;
    const logicalW = lastViewportW || canvas.clientWidth || rect.width || window.innerWidth;
    const logicalH = lastViewportH || canvas.clientHeight || rect.height || window.innerHeight;
    const scaleX = logicalW / Math.max(1, rect.width);
    const scaleY = logicalH / Math.max(1, rect.height);
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return {
        x: Math.max(0, Math.min(logicalW, x)),
        y: Math.max(0, Math.min(logicalH, y))
    };
}

function drawEarthSlots(ex, ey, earthR, viewLevel = 0) {
    slotHotspots.length = 0;
    if (viewLevel !== 0) return;
    if (earthR < 18) return;
    if (!window.getPlanetSlotAssignments) return;

    const assignments = window.getPlanetSlotAssignments('earth') || [];
    const total = assignments.length;
    if (!total) return;

    const mobileSlotScale = isCoarsePointer ? 0.68 : 1;
    const slotR = Math.max(13, Math.min(24, earthR * 0.215 * mobileSlotScale));
    const spreadR = earthR * 0.9;
    const isCollapsedEarth = !!window.game?.earthPermanentThreeSlots;
    const activeRegionNames = isCollapsedEarth
        ? ['东亚平原', '欧洲草原', '美洲草原']
        : earthSlotRegionNames;
    const activeAnchorOffsets = isCollapsedEarth
        ? [earthSlotAnchorOffsets[0], earthSlotAnchorOffsets[2], earthSlotAnchorOffsets[1]]
        : earthSlotAnchorOffsets;

    for (let index = 0; index < total; index++) {
        const anchor = activeAnchorOffsets[index] || {
            x: Math.cos((index / Math.max(1, total)) * Math.PI * 2) * 0.45,
            y: Math.sin((index / Math.max(1, total)) * Math.PI * 2) * 0.45
        };
        const x = ex + anchor.x * spreadR;
        const y = ey + anchor.y * spreadR;
        const slotType = assignments[index] || null;

        slotHotspots.push({ planetId: 'earth', index, x, y, r: slotR, slotType });

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, slotR, 0, Math.PI * 2);
        if (slotType === 'autoFactory') {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.98)';
        } else if (slotType === 'robotLegion') {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.98)';
        } else if (slotType === 'energyStation') {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.99)';
        } else if (slotType === 'researchCenter') {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.99)';
        } else {
            ctx.fillStyle = 'rgba(30, 41, 59, 0.84)';
        }
        ctx.shadowColor = slotType ? 'rgba(255,255,255,0.28)' : 'rgba(56,189,248,0.48)';
        ctx.shadowBlur = slotType ? 6 : 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = Math.max(2.2, slotR * 0.16);
        ctx.strokeStyle = slotType ? 'rgba(255,255,255,0.96)' : 'rgba(125,211,252,0.96)';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, slotR - 2.4), 0, Math.PI * 2);
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = slotType ? 'rgba(15,23,42,0.72)' : 'rgba(15,23,42,0.88)';
        ctx.stroke();

        const icon = slotType === 'autoFactory'
            ? '🏭'
            : slotType === 'robotLegion'
                ? '🤖'
                : slotType === 'energyStation'
                    ? '⚡'
                    : slotType === 'researchCenter'
                        ? '🔬'
                        : '+';
        ctx.fillStyle = slotType ? '#ffffff' : 'rgba(224,242,254,0.98)';
        ctx.font = `${Math.max(13, slotR * 1.1)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.68)';
        ctx.shadowBlur = 3;
        ctx.fillText(icon, x, y + 0.5);
        ctx.shadowBlur = 0;

        const regionName = activeRegionNames[index] || `地表区域${index + 1}`;
        const labelFontSize = Math.max(
            isCoarsePointer ? 8 : 10,
            Math.min(isCoarsePointer ? 11 : 13, slotR * (isCoarsePointer ? 0.48 : 0.6))
        );
        const labelX = x;
        const labelY = y + slotR + labelFontSize + 2;
        ctx.font = `700 ${labelFontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textW = ctx.measureText(regionName).width;
        const padX = 6;
        const labelW = textW + padX * 2;
        const labelH = labelFontSize + 6;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.fillRect(labelX - labelW / 2, labelY - labelH / 2, labelW, labelH);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.78)';
        ctx.strokeRect(labelX - labelW / 2, labelY - labelH / 2, labelW, labelH);
        ctx.fillStyle = 'rgba(224, 242, 254, 0.98)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.66)';
        ctx.shadowBlur = 2;
        ctx.fillText(regionName, labelX, labelY);
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

function drawSinglePlanetSlot(planetId, visibleBodyIds = null) {
    if (!window.getPlanetSlotAssignments) return;
    if (typeof window.isSlotPlanetUnlocked === 'function' && !window.isSlotPlanetUnlocked(planetId)) return;
    if (visibleBodyIds && !visibleBodyIds.has(planetId)) return;
    const meta = planets.find(p => p.id === planetId);
    if (!meta || !meta.screenX || !meta.screenY || !meta.drawR) return;
    const assignments = window.getPlanetSlotAssignments(planetId) || [];
    if (!assignments.length) return;

    const total = assignments.length;
    const mobileSlotScale = isCoarsePointer ? 0.72 : 1;
    const baseSlotR = Math.max(11, Math.min(20, meta.drawR * 0.66 + 4));
    const slotRBase = total <= 2 ? baseSlotR : Math.max(10, Math.min(17, baseSlotR * 0.94));
    const slotR = Math.max(9, slotRBase * mobileSlotScale);
    const ringDist = Math.max(meta.drawR * 1.1, slotR * (total <= 2 ? 1.4 : 2.0));
    const startAngle = -Math.PI / 2;

    for (let index = 0; index < total; index++) {
        const slotType = assignments[index] || null;
        const angle = total === 1
            ? -Math.PI / 4
            : startAngle + (index / total) * Math.PI * 2;
        const x = meta.screenX + Math.cos(angle) * ringDist;
        const y = meta.screenY + Math.sin(angle) * ringDist;

        slotHotspots.push({ planetId, index, x, y, r: slotR, slotType });

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, slotR, 0, Math.PI * 2);
        if (slotType === 'autoFactory') {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.98)';
        } else if (slotType === 'robotLegion') {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.98)';
        } else if (slotType === 'energyStation') {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.99)';
        } else if (slotType === 'researchCenter') {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.99)';
        } else {
            ctx.fillStyle = 'rgba(30, 41, 59, 0.84)';
        }
        ctx.shadowColor = slotType ? 'rgba(255,255,255,0.28)' : 'rgba(56,189,248,0.48)';
        ctx.shadowBlur = slotType ? 6 : 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = Math.max(2.2, slotR * 0.16);
        ctx.strokeStyle = slotType ? 'rgba(255,255,255,0.96)' : 'rgba(125,211,252,0.96)';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, slotR - 2.3), 0, Math.PI * 2);
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = slotType ? 'rgba(15,23,42,0.72)' : 'rgba(15,23,42,0.88)';
        ctx.stroke();

        const icon = slotType === 'autoFactory'
            ? '🏭'
            : slotType === 'robotLegion'
                ? '🤖'
                : slotType === 'energyStation'
                    ? '⚡'
                    : slotType === 'researchCenter'
                        ? '🔬'
                        : '+';
        ctx.fillStyle = slotType ? '#ffffff' : 'rgba(224,242,254,0.98)';
        ctx.font = `${Math.max(13, slotR * 1.08)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.68)';
        ctx.shadowBlur = 3;
        ctx.fillText(icon, x, y + 0.5);
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

canvas.addEventListener('click', (event) => {
    if (suppressPlanetClick) {
        suppressPlanetClick = false;
        return;
    }
    const pointer = getCanvasPointerPosition(event);
    const x = pointer.x;
    const y = pointer.y;
    if (isLevel05RenderMode()) {
        handleLevel05MapClick(x, y);
        return;
    }
    const earth = planets.find(p => p.id === 'earth');
    const earthSnap = getEarthRenderSnapshot(earth);

    // 优先支持地球点击走位：命中检测失败时也允许在地球可视范围内设定目标点
    if (earthSnap) {
        const dxEarth = x - earthSnap.x;
        const dyEarth = y - earthSnap.y;
        const earthHitR = Math.max(14, earthSnap.r * 1.2);
        if (dxEarth * dxEarth + dyEarth * dyEarth <= earthHitR * earthHitR) {
            setEarthWalkerTargetFromScreen(earth, x, y);
            return;
        }
    }

    const body = hitTestBody(x, y);
    if (!body) return;

    if (selectedShipUnitIds.size > 0 && body.id === 'mars') {
        issueFleetAttack('mars');
        return;
    }

    const planet = planets.find(p => p.id === body.id);
    if (!planet) return;
    if (body.id === 'earth') {
        setEarthWalkerTargetFromScreen(planet, x, y);
        return;
    }
    handlePlanetMineClick(planet, { clientX: x, clientY: y });
});

canvas.addEventListener('mousedown', (event) => {
    if (isLevel05RenderMode()) return;
    if (event.button !== 0) return;
    const pointer = getCanvasPointerPosition(event);
    fleetSelectionBox = {
        active: true,
        startX: pointer.x,
        startY: pointer.y,
        endX: pointer.x,
        endY: pointer.y
    };
});

canvas.addEventListener('mousemove', (event) => {
    if (isLevel05RenderMode()) {
        const war = ensureLevel05WarState();
        if (war) {
            const pointer = getCanvasPointerPosition(event);
            let hoverEndTurn = false;
            if (level05EndTurnRect && war.phase === 'player') {
                const b = level05EndTurnRect;
                const hitPad = 14;
                hoverEndTurn = pointer.x >= b.x - hitPad && pointer.x <= b.x + b.w + hitPad
                    && pointer.y >= b.y - hitPad && pointer.y <= b.y + b.h + hitPad;
            }
            war.hoverEndTurn = hoverEndTurn;
            canvas.style.cursor = hoverEndTurn ? 'pointer' : 'default';
            if (war.phase === 'player') {
                const hit = getLevel05RegionByPoint(pointer.x, pointer.y);
                war.hoverRegionId = hit ? hit.id : null;
            } else {
                war.hoverRegionId = null;
            }
        }
        return;
    }
    canvas.style.cursor = 'default';
    if (!fleetSelectionBox || !fleetSelectionBox.active) return;
    const pointer = getCanvasPointerPosition(event);
    fleetSelectionBox.endX = pointer.x;
    fleetSelectionBox.endY = pointer.y;
});

canvas.addEventListener('mouseup', () => {
    if (!fleetSelectionBox || !fleetSelectionBox.active) return;
    const dx = fleetSelectionBox.endX - fleetSelectionBox.startX;
    const dy = fleetSelectionBox.endY - fleetSelectionBox.startY;
    const dragged = Math.hypot(dx, dy) > 8;
    if (dragged) {
        applyFleetSelectionRect(
            fleetSelectionBox.startX,
            fleetSelectionBox.startY,
            fleetSelectionBox.endX,
            fleetSelectionBox.endY
        );
        suppressPlanetClick = true;
    }
    fleetSelectionBox = null;
});

canvas.addEventListener('touchstart', (event) => {
    if (!event.touches || event.touches.length !== 1) return;
    event.preventDefault();
    const pointer = getCanvasPointerPosition(event);
    const x = pointer.x;
    const y = pointer.y;
    if (isLevel05RenderMode()) {
        handleLevel05MapClick(x, y);
        return;
    }
    const earth = planets.find(p => p.id === 'earth');
    const earthSnap = getEarthRenderSnapshot(earth);

    if (earthSnap) {
        const dxEarth = x - earthSnap.x;
        const dyEarth = y - earthSnap.y;
        const earthHitR = Math.max(14, earthSnap.r * 1.2);
        if (dxEarth * dxEarth + dyEarth * dyEarth <= earthHitR * earthHitR) {
            setEarthWalkerTargetFromScreen(earth, x, y);
            return;
        }
    }

    const body = hitTestBody(x, y);
    if (!body) return;
    const planet = planets.find(p => p.id === body.id);
    if (!planet) return;
    if (body.id === 'earth') {
        setEarthWalkerTargetFromScreen(planet, x, y);
        return;
    }
    handlePlanetMineClick(planet, { clientX: x, clientY: y });
}, { passive: false });

// ── Canvas 尺寸 ───────────────────────────────────────────────
function resizeCanvas() {
    const viewport = getViewportSize();
    const width = viewport.width;
    const height = viewport.height;

    if (width === lastViewportW && height === lastViewportH) return;
    lastViewportW = width;
    lastViewportH = height;

    canvasDpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = Math.round(width * canvasDpr);
    canvas.height = Math.round(height * canvasDpr);
    ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);

    centerX = width / 2;

    const topBar = document.querySelector('.top-bar');
    const topBarRect = topBar ? topBar.getBoundingClientRect() : null;
    const uiTopHeight = Math.max(120, Math.round((topBarRect?.height || 150) + 8));

    const panel = document.querySelector('.bottom-panel');
    const progressBar = document.querySelector('.top-progress-bar');
    let bottomPanelHeight = 84;
    if (panel && !panel.classList.contains('is-collapsed')) {
        const rect = panel.getBoundingClientRect();
        bottomPanelHeight = Math.max(84, Math.round(canvas.height - rect.top + 10));
    } else if (progressBar) {
        const rect = progressBar.getBoundingClientRect();
        bottomPanelHeight = Math.max(84, Math.round(canvas.height - rect.top + 10));
    }

    const availableH = height - uiTopHeight - bottomPanelHeight;
    centerY = uiTopHeight + availableH / 2;
    const availableW = width * 0.9;
    scale = Math.min(availableW, availableH) / (450 * 2 + 80);
}

function scheduleViewportResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        resizeCanvas();
    });
}

window.addEventListener('resize', scheduleViewportResize, { passive: true });
window.addEventListener('orientationchange', scheduleViewportResize, { passive: true });
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleViewportResize, { passive: true });
    window.visualViewport.addEventListener('scroll', scheduleViewportResize, { passive: true });
}
window.scheduleViewportResize = scheduleViewportResize;

// ── 主渲染帧（solar-scale 插值方式）──────────────────────────
function drawSolarSystem() {
    const now = performance.now();
    const currentTechLevel = getSceneLevelFromGame();
    if (currentTechLevel !== lastObservedTechLevel) {
        if (sceneTgt !== currentTechLevel) {
            triggerSceneTransition(currentTechLevel);
        }
        if (currentTechLevel > lastObservedTechLevel) {
            lockRollback(1400);
        }
        lastObservedTechLevel = currentTechLevel;
    } else if (sceneTgt !== currentTechLevel && sceneP >= 1) {
        // 自愈：目标与当前等级漂移时，重新拉起过渡
        triggerSceneTransition(currentTechLevel);
    }
    shimA += 0.007;
    interactiveBodies.length = 0;
    slotHotspots.length = 0;
    if(sceneP < 1) sceneP = Math.min(1, (now - sceneT0) / SCENE_DUR);
    const tp = sceneEase(sceneP);
    const fromLv = Math.max(0, Math.min(5, Number(sceneFrom) || 0));
    const toLv = Math.max(0, Math.min(5, Number(sceneTgt) || 0));
    const W = lastViewportW || canvas.clientWidth || window.innerWidth;
    const H = lastViewportH || canvas.clientHeight || window.innerHeight;
    const M = Math.min(W, H);
    const cx2 = W/2, cy2 = H/2;
    // 安全绘图区：yf=0 贴顶栏底，yf=1 贴底部面板顶
    const dTop = UI_TOP, dH = H - UI_TOP - UI_BOT;
    function safeY(yf){ return dTop + yf * dH; }

    // 背景
    ctx.fillStyle='#00000a'; ctx.fillRect(0,0,W,H);

    // 平滑视图偏移（科技等级切换期间自动归零）
    if(sceneP < 1) { viewOffsetTgt = 0; viewOffset *= 0.85; }
    viewOffset += (viewOffsetTgt - viewOffset) * 0.10;

    // 计算实际渲染用的场景 rA/rB/rtp
    let rA, rB, rtp;
    let renderLv;
    let showLevel05Map = false;
    level05MapRect = null;
    level05EndTurnRect = null;
    currentSceneRenderMode = SCENE_RENDER_MODE_NORMAL;
    if(sceneP < 1 || viewOffset < 0.01){
        renderLv = sLerp(fromLv, toLv, tp);
        const lo = Math.max(0, Math.min(5, Math.floor(renderLv)));
        const hi = Math.max(0, Math.min(5, lo + 1));
        rA = TECH_LEVELS[lo];
        rB = TECH_LEVELS[hi];
        rtp = renderLv - lo;
    } else {
        const effectiveRawLv = sceneTgt - viewOffset;
        if (effectiveRawLv >= 0) {
            const lo = Math.max(0, Math.min(5, Math.floor(effectiveRawLv)));
            const hi = Math.min(lo + 1, 5);
            rA = TECH_LEVELS[lo];
            rB = TECH_LEVELS[hi];
            rtp = effectiveRawLv - lo;
            renderLv = effectiveRawLv;
        } else {
            // 0.5 地图模式：固定渲染地球层，不再插值到月球层
            rA = TECH_LEVELS[0];
            rB = TECH_LEVELS[0];
            rtp = 0;
            renderLv = Math.max(0, Math.min(0.5, -effectiveRawLv));
            showLevel05Map = true;
            currentSceneRenderMode = SCENE_RENDER_MODE_LEVEL05;
        }
    }

    // 星空
    drawStars(sLerp(rA.starVis, rB.starVis, rtp));

    // 下方所有绘制都用 rA/rB/rtp

    const eA=rA.earth, eB=rB.earth;
    const ex=sLerp(eA.xf,eB.xf,rtp)*W;
    const ey=safeY(sLerp(eA.yf,eB.yf,rtp));
    const earthR=sLerp(eA.rf,eB.rf,rtp)*M;

    // 插值太阳
    const sA=rA.sun, sB=rB.sun;
    const sy=safeY(sLerp(sA.yf,sB.yf,rtp));
    const sunR=sLerp(sA.rf,sB.rf,rtp)*M;
    const sunGlowR=sLerp(sA.glowR,sB.glowR,rtp)*M;
    const sunAlpha=sLerp(sA.alpha,sB.alpha,rtp);
    const cA=(sA.clipXf!=null)?sA.clipXf:null, cB=(sB.clipXf!=null)?sB.clipXf:null;
    // 裁剪边界平滑过渡：
    //   两端都有裁剪 → 插值
    //   仅起点有裁剪（如L1→L2）→ 裁剪边界从 cA*W 滑出到 -W（屏幕外左侧），剪切区消失
    //   仅终点有裁剪（如L0→L1）→ 裁剪边界从 -W 滑入到 cB*W
    let sunClipX=null;
    if(cA!=null&&cB!=null) sunClipX=sLerp(cA,cB,rtp)*W;
    else if(cA!=null) sunClipX=sLerp(cA*W, -W, rtp);   // 裁剪边向左退出
    else if(cB!=null) sunClipX=sLerp(-W, cB*W, rtp);   // 裁剪边从左进入
    // sx 在两个状态的"真实圆心"之间插值，确保整个过渡是连续位移
    const sxFrom = (cA!=null) ? (cA*W - sA.rf*M*0.50) : sA.xf*W;
    const sxTo   = (cB!=null) ? (cB*W - sB.rf*M*0.50) : sB.xf*W;
    const sx = sLerp(sxFrom, sxTo, rtp);

    // 画太阳（含边缘探出效果）
    if(sunAlpha>0.01){
        const level2Blend = Math.max(0, 1 - Math.min(1, Math.abs(renderLv - 2) / 0.55));
        const dimScale = 1 - level2Blend * 0.48;
        const warmOuter = level2Blend > 0.15;
        ctx.save();
        if(sunClipX!=null){
            ctx.beginPath(); ctx.rect(sunClipX,0,W-sunClipX,H); ctx.clip();
        }
        ctx.globalAlpha=sunAlpha;
        sDrawGlow(sx,sy,sunR,sunGlowR*5,'#7f3a16',0.04 * dimScale);
        sDrawGlow(sx,sy,sunR,sunGlowR*3,warmOuter ? '#b65c1f' : '#FF8800',0.07 * dimScale);
        sDrawGlow(sx,sy,sunR,sunGlowR*1.5,warmOuter ? '#d88b2a' : '#FFB300',0.16 * dimScale);
        sDrawGlow(sx,sy,sunR,sunGlowR,warmOuter ? '#f0c056' : '#FFD700',0.32 * dimScale);
        if(sunClipX==null){
            ctx.globalAlpha=sunAlpha*0.05*dimScale;
            for(let i=0;i<12;i++){
                const ang=(i/12)*Math.PI*2+shimA*0.4;
                const r1=sunR*1.2, r2=sunGlowR*(1.2+0.3*Math.sin(shimA*1.5+i));
                const grd=ctx.createLinearGradient(sx+Math.cos(ang)*r1,sy+Math.sin(ang)*r1,sx+Math.cos(ang)*r2,sy+Math.sin(ang)*r2);
                grd.addColorStop(0,warmOuter ? '#d07a2e' : '#FDB813'); grd.addColorStop(1,'transparent');
                ctx.strokeStyle=grd; ctx.lineWidth=2+Math.sin(shimA+i*0.7);
                ctx.beginPath(); ctx.moveTo(sx+Math.cos(ang)*r1,sy+Math.sin(ang)*r1);
                ctx.lineTo(sx+Math.cos(ang)*r2,sy+Math.sin(ang)*r2); ctx.stroke();
            }
        }
        ctx.globalAlpha=sunAlpha;
        const sdg=ctx.createRadialGradient(sx-sunR*0.2,sy-sunR*0.2,0,sx,sy,Math.max(sunR,1));
        sdg.addColorStop(0,warmOuter ? '#fff3cc' : '#ffffff');
        sdg.addColorStop(0.25,warmOuter ? '#ffd38a' : '#fff5c0');
        sdg.addColorStop(1,warmOuter ? '#d07a2e' : '#FDB813');
        ctx.beginPath(); ctx.arc(sx,sy,Math.max(sunR,1.5),0,Math.PI*2); ctx.fillStyle=sdg; ctx.fill();

        if (sunR > 10) {
            const inner = sunR * 1.03;
            const outer = sunR * 1.36;
            const sampleR = outer * 1.15;

            ctx.save();
            ctx.beginPath();
            ctx.arc(sx, sy, outer, 0, Math.PI * 2);
            ctx.arc(sx, sy, inner, 0, Math.PI * 2, true);
            ctx.clip();

            const hazeAlpha = sunAlpha * (0.22 + 0.14 * level2Blend) * dimScale;
            for (let i = 0; i < 5; i++) {
                const phase = shimA * (1.05 + i * 0.42) + i * 1.7;
                const dx = Math.cos(phase) * sunR * (0.020 + i * 0.007);
                const dy = Math.sin(phase * 1.31) * sunR * (0.017 + i * 0.006);
                const wobX = Math.sin(phase * 1.9) * sunR * 0.018;
                const wobY = Math.cos(phase * 1.6) * sunR * 0.018;
                ctx.globalAlpha = hazeAlpha * Math.max(0.16, 0.95 - i * 0.17);
                ctx.drawImage(
                    canvas,
                    sx - sampleR + dx,
                    sy - sampleR + dy,
                    sampleR * 2,
                    sampleR * 2,
                    sx - sampleR + wobX,
                    sy - sampleR + wobY,
                    sampleR * 2,
                    sampleR * 2
                );
            }

            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 16; i++) {
                const t = i / 16;
                const ang = t * Math.PI * 2 + shimA * 0.75;
                const jitter = Math.sin(shimA * 3.2 + i * 1.8) * sunR * 0.020;
                const r1 = inner + sunR * 0.02 + jitter;
                const r2 = outer + sunR * 0.05 + jitter;
                const x1 = sx + Math.cos(ang) * r1;
                const y1 = sy + Math.sin(ang) * r1;
                const x2 = sx + Math.cos(ang) * r2;
                const y2 = sy + Math.sin(ang) * r2;
                const grd = ctx.createLinearGradient(x1, y1, x2, y2);
                grd.addColorStop(0, warmOuter ? 'rgba(255,200,105,0.00)' : 'rgba(255,235,180,0.00)');
                grd.addColorStop(0.55, warmOuter ? 'rgba(255,194,96,0.24)' : 'rgba(255,235,180,0.21)');
                grd.addColorStop(1, 'rgba(255,140,60,0.00)');
                ctx.strokeStyle = grd;
                ctx.lineWidth = Math.max(1.2, sunR * 0.020);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            const hazeRing = ctx.createRadialGradient(sx, sy, inner, sx, sy, outer);
            hazeRing.addColorStop(0, 'rgba(255, 230, 170, 0)');
            hazeRing.addColorStop(0.45, warmOuter ? 'rgba(255, 204, 120, 0.15)' : 'rgba(255, 236, 185, 0.13)');
            hazeRing.addColorStop(1, 'rgba(255, 140, 60, 0.05)');
            ctx.globalAlpha = sunAlpha * dimScale;
            ctx.fillStyle = hazeRing;
            ctx.beginPath();
            ctx.arc(sx, sy, outer, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }

    // 半人马星座（Lv3 出现，Lv4 缩小）
    const ctA=rA.centauri||{xf:0.62,yf:0.5,rf:0,alpha:0};
    const ctB=rB.centauri||{xf:0.62,yf:0.5,rf:0,alpha:0};
    const cx=sLerp(ctA.xf,ctB.xf,rtp)*W;
    const cy=safeY(sLerp(ctA.yf,ctB.yf,rtp));
    const cR=sLerp(ctA.rf,ctB.rf,rtp)*M;
    const cAlpha=sLerp(ctA.alpha,ctB.alpha,rtp);
    if(cAlpha>0.02 && cR>0.8){
        const stars=[
            {x:-0.9,y:-0.3,s:1.1},
            {x:-0.25,y:-0.55,s:0.8},
            {x:0.3,y:-0.1,s:1.0},
            {x:-0.05,y:0.45,s:0.9},
            {x:0.78,y:0.15,s:1.2}
        ];
        ctx.save();
        ctx.globalAlpha=cAlpha;
        ctx.strokeStyle='rgba(180,220,255,0.45)';
        ctx.lineWidth=Math.max(1, cR*0.08);
        ctx.beginPath();
        ctx.moveTo(cx+stars[0].x*cR, cy+stars[0].y*cR);
        ctx.lineTo(cx+stars[1].x*cR, cy+stars[1].y*cR);
        ctx.lineTo(cx+stars[2].x*cR, cy+stars[2].y*cR);
        ctx.lineTo(cx+stars[3].x*cR, cy+stars[3].y*cR);
        ctx.lineTo(cx+stars[4].x*cR, cy+stars[4].y*cR);
        ctx.stroke();

        for(const st of stars){
            const sx2=cx+st.x*cR, sy2=cy+st.y*cR;
            const sr=Math.max(1.4, cR*0.12*st.s);
            sDrawGlow(sx2,sy2,sr*0.6,sr*3.6,'#9bd6ff',0.38*cAlpha);
            ctx.beginPath();
            ctx.arc(sx2,sy2,sr,0,Math.PI*2);
            ctx.fillStyle='rgba(230,245,255,0.95)';
            ctx.fill();
        }

        ctx.font=`${Math.max(9,Math.min(13,cR*0.45))}px sans-serif`;
        ctx.fillStyle='rgba(180,220,255,0.75)';
        ctx.textAlign='left';
        ctx.fillText('半人马星座', cx + cR * 1.02, cy + cR * 0.18);
        ctx.restore();
    }

    // 画其他行星（插值出现/消失）
    const visibleBodyIds = new Set();
    const allIds=new Set([...rA.bodies.map(b=>b.id),...rB.bodies.map(b=>b.id)]);
    const drawOrder=['neptune','uranus','saturn','jupiter','mars','venus','mercury'];
    for(const id of drawOrder){
        if(!allIds.has(id))continue;
        const fa=rA.bodies.find(b=>b.id===id), fb=rB.bodies.find(b=>b.id===id);
        const body=fb||fa;
        const alpha=sLerp(fa?1:0,fb?1:0,rtp);
        if(alpha<0.02)continue;
        const bx=sLerp(fa?fa.xf:fb.xf,fb?fb.xf:fa.xf,rtp)*W;
        const by=safeY(sLerp(fa?fa.yf:fb.yf,fb?fb.yf:fa.yf,rtp));
        const br=Math.max(sLerp(fa?fa.rf:fb.rf,fb?fb.rf:fa.rf,rtp)*M,1.2);
        const meta = planets.find(p => p.id === id);
        if (meta) {
            meta.screenX = bx;
            meta.screenY = by;
            meta.drawR = br;
            visibleBodyIds.add(id);
            const unlocked = game.unlockedPlanets.includes(meta.id) || game.currentStage >= meta.unlockStage;
            if (unlocked) {
                const touchBoost = isCoarsePointer ? 1.45 : 1;
                const clickR = id === 'mars'
                    ? Math.max(br * 2.2 * touchBoost, 24)
                    : Math.max(br * touchBoost, isCoarsePointer ? 16 : 10);
                interactiveBodies.push({ id, x: bx, y: by, r: clickR });
            }
        }
        ctx.save(); ctx.globalAlpha=alpha;
        sDrawGlow(bx,by,br,br*3.5,body.col,0.3);
        sDrawGlow(bx,by,br,br*1.8,body.col,0.45);
        if(br>2.5) sDrawBall(bx,by,br,sCol(body.col,0.4),body.col,sCol(body.col,-0.4));
        else{ ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2); ctx.fillStyle=body.col; ctx.fill(); }
        if(body.rings&&br>3){
            ctx.globalAlpha=alpha*0.5;
            ctx.beginPath(); ctx.ellipse(bx,by,br*2.4,br*0.5,0.3,0,Math.PI*2);
            ctx.strokeStyle='rgba(212,185,96,0.55)'; ctx.lineWidth=br*0.5; ctx.stroke();
        }
        if(br>=1.5){
            const labelAlpha = Math.max(0.66, alpha * (0.78 + Math.min(0.22, br / 10)));
            ctx.globalAlpha = labelAlpha;
            ctx.font = `${Math.max(11, Math.min(14, br * 1.9))}px sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.lineWidth = Math.max(1.4, br * 0.14);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.58)';
            ctx.strokeText(body.label, bx + br + 5, by + 3.5);
            ctx.fillStyle = 'rgba(238, 242, 255, 0.98)';
            ctx.fillText(body.label, bx + br + 5, by + 3.5);
        }
        ctx.restore();
    }

    // 月球
    if(earthR>1){
        const mA=rA.moon, mB=rB.moon;
        const moonDx=sLerp(mA.dxf,mB.dxf,rtp);
        const moonDy=sLerp(mA.dyf,mB.dyf,rtp);
        const mx=ex+moonDx*earthR*4.5, my=ey+moonDy*earthR*4.5;
        const moonR=Math.max(earthR*0.27,1.2);
        const moonMeta = planets.find(p => p.id === 'moon');
        if (moonMeta) {
            moonMeta.screenX = mx;
            moonMeta.screenY = my;
            moonMeta.drawR = moonR;
            visibleBodyIds.add('moon');
            const unlocked = game.unlockedPlanets.includes('moon') || game.currentStage >= moonMeta.unlockStage;
            if (unlocked) {
                const touchBoost = isCoarsePointer ? 1.45 : 1;
                interactiveBodies.push({ id: 'moon', x: mx, y: my, r: Math.max(moonR * touchBoost, isCoarsePointer ? 16 : 10) });
            }
        }
        if(moonR>0.8){
            ctx.save();
            sDrawGlow(mx,my,moonR,moonR*2.2,'#aaaaaa',0.18);
            if(moonImgLoaded){
                ctx.beginPath(); ctx.arc(mx,my,moonR,0,Math.PI*2); ctx.clip();
                ctx.drawImage(moonImg, mx-moonR, my-moonR, moonR*2, moonR*2);
            } else {
                sDrawBall(mx,my,moonR,'#d0cfc8','#9a9890','#555450');
            }
            const mg=ctx.createRadialGradient(mx+moonR*0.35,my,0,mx,my,moonR*1.01);
            mg.addColorStop(0,'transparent'); mg.addColorStop(0.5,'transparent'); mg.addColorStop(1,'rgba(0,0,8,0.78)');
            ctx.beginPath(); ctx.arc(mx,my,moonR,0,Math.PI*2); ctx.fillStyle=mg; ctx.fill();
            ctx.restore();
        }
    }

    // 地球
    if(earthR>=1){
        earthRenderState.x = ex;
        earthRenderState.y = ey;
        earthRenderState.r = earthR;
        earthRenderState.ready = true;
        const earthMeta = planets.find(p => p.id === 'earth');
        if (earthMeta) {
            earthMeta.screenX = ex;
            earthMeta.screenY = ey;
            earthMeta.drawR = earthR;
            visibleBodyIds.add('earth');
            const unlocked = game.unlockedPlanets.includes('earth') || game.currentStage >= earthMeta.unlockStage;
            if (unlocked) {
                const touchBoost = isCoarsePointer ? 1.4 : 1;
                interactiveBodies.push({ id: 'earth', x: ex, y: ey, r: Math.max(earthR * touchBoost, isCoarsePointer ? 24 : 12) });
            }
        }
        ctx.save();
        const ag=ctx.createRadialGradient(ex,ey,earthR*0.9,ex,ey,earthR*1.4);
        ag.addColorStop(0,'transparent'); ag.addColorStop(0.6,'rgba(90,180,255,0.12)'); ag.addColorStop(1,'transparent');
        ctx.beginPath(); ctx.arc(ex,ey,earthR*1.4,0,Math.PI*2); ctx.fillStyle=ag; ctx.fill();
        sDrawGlow(ex,ey,earthR,earthR*2.2,'#58b7ff',0.22);
        const useSplitEarth = !!window.game?.earthCatastropheTriggered || window.game?.earthTimelineMode === 'level-1';
        const earthTexture = useSplitEarth && earthSplitImgLoaded ? earthSplitImg : (earthImgLoaded ? earthImg : null);
        if(earthTexture){
            ctx.save();
            ctx.beginPath(); ctx.arc(ex,ey,earthR,0,Math.PI*2); ctx.clip();
            ctx.drawImage(earthTexture, ex-earthR, ey-earthR, earthR*2, earthR*2);
            ctx.restore();
        } else {
            sDrawBall(ex,ey,earthR,'#7ae0ff','#1a7ac0','#09305a');
            if(earthR>22){
                ctx.globalAlpha=0.22; ctx.fillStyle='#3a7a2a';
                const blobs=[[0.12,-0.28,0.22,0.18],[-0.28,-0.08,0.18,0.28],[0.04,0.32,0.14,0.12],[-0.08,-0.42,0.12,0.10]];
                for(const[dx,dy,rw,rh]of blobs){
                    ctx.beginPath(); ctx.ellipse(ex+dx*earthR,ey+dy*earthR,rw*earthR,rh*earthR,dx,0,Math.PI*2); ctx.fill();
                }
            }
        }

        if (earthR > 16) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(ex, ey, earthR, 0, Math.PI * 2);
            ctx.clip();

            const cloudShift = Math.sin(shimA * 1.35) * earthR * 0.08;
            const cloudShift2 = Math.cos(shimA * 1.12 + 1.4) * earthR * 0.07;

            const cloudA = ctx.createLinearGradient(
                ex - earthR * 0.8 + cloudShift,
                ey - earthR * 0.25,
                ex + earthR * 0.9 + cloudShift,
                ey + earthR * 0.15
            );
            cloudA.addColorStop(0, 'rgba(255,255,255,0)');
            cloudA.addColorStop(0.35, 'rgba(255,255,255,0.12)');
            cloudA.addColorStop(0.7, 'rgba(255,255,255,0.04)');
            cloudA.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = cloudA;
            ctx.fillRect(ex - earthR, ey - earthR, earthR * 2, earthR * 2);

            const cloudB = ctx.createLinearGradient(
                ex - earthR * 0.95 + cloudShift2,
                ey + earthR * 0.08,
                ex + earthR * 0.92 + cloudShift2,
                ey + earthR * 0.44
            );
            cloudB.addColorStop(0, 'rgba(255,255,255,0)');
            cloudB.addColorStop(0.45, 'rgba(226,244,255,0.10)');
            cloudB.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = cloudB;
            ctx.fillRect(ex - earthR, ey - earthR, earthR * 2, earthR * 2);

            const polarGlow = ctx.createRadialGradient(
                ex - earthR * 0.24,
                ey - earthR * 0.62,
                0,
                ex - earthR * 0.24,
                ey - earthR * 0.62,
                earthR * 0.95
            );
            polarGlow.addColorStop(0, 'rgba(167,243,208,0.12)');
            polarGlow.addColorStop(1, 'rgba(167,243,208,0)');
            ctx.fillStyle = polarGlow;
            ctx.fillRect(ex - earthR, ey - earthR, earthR * 2, earthR * 2);
            ctx.restore();
        }

        if (!showLevel05Map) {
            const starlinkBuilt = !!window.game?.upgrades?.special?.some(
                item => item.id === 'sp1' && (Number(item.level) || 0) > 0
            );
            if (starlinkBuilt) {
                drawStarlinkEffect(ex, ey, earthR, now);
            }

            const coreMineBuilt = !!window.game?.upgrades?.special?.some(
                item => item.id === 'sp6' && (Number(item.level) || 0) > 0
            );
            if (coreMineBuilt) {
                drawEarthCoreMinePit(ex, ey, earthR, now);
            }

            const workResult = updateEarthWalkerAndOutput(now, ex, ey, earthR);
            drawEarthWorkZonesAndWalker(ex, ey, earthR, workResult.activeZones, workResult.playerRect, workResult);
            drawEarthResidents(ex, ey, earthR, now);
        } else {
            // L0.5 使用独立图层，避免地球主线逻辑影响地图模式。
            drawEarthWorldMapUnfold(ex, ey, earthR, renderLv, now);
        }

        if (!showLevel05Map) {
            const tg2=ctx.createRadialGradient(ex+earthR*0.4,ey-earthR*0.1,0,ex,ey,earthR*1.02);
            tg2.addColorStop(0,'transparent'); tg2.addColorStop(0.6,'transparent'); tg2.addColorStop(1,'rgba(0,0,12,0.10)');
            ctx.globalAlpha=1; ctx.beginPath(); ctx.arc(ex,ey,earthR,0,Math.PI*2); ctx.fillStyle=tg2; ctx.fill();
        }
        ctx.restore();

    }

    // 银河带（level 4）
    if(rB.galaxy&&rtp>0.3){
        const galAlpha=(rtp-0.3)/0.7*0.18;
        ctx.save(); ctx.globalAlpha=galAlpha;
        const gg=ctx.createLinearGradient(0,H*0.25,W,H*0.65);
        gg.addColorStop(0,'transparent'); gg.addColorStop(0.3,'rgba(100,60,180,0.35)');
        gg.addColorStop(0.5,'rgba(160,100,255,0.45)'); gg.addColorStop(0.7,'rgba(100,60,180,0.35)');
        gg.addColorStop(1,'transparent');
        ctx.fillStyle=gg; ctx.fillRect(0,H*0.2,W,H*0.55);
        ctx.restore();
    }

    const blackHoleBlend = Math.max(0, Math.min(1, renderLv - 4));
    if (blackHoleBlend > 0.01) {
        const bhR = Math.max(8, M * (0.016 + blackHoleBlend * 0.028));
        drawBlackHole(cx2, cy2, bhR, 0.92 * blackHoleBlend, now);
    }

    // 空间雾（低科技等级遮挡远景）
    const fogR=sLerp(rA.fogR,rB.fogR,rtp)*M;
    const fogAl=sLerp(rA.fogAlpha,rB.fogAlpha,rtp);
    if(fogAl>0.02&&fogR>0){
        const fg=ctx.createRadialGradient(ex,ey,fogR*0.3,ex,ey,fogR*2);
        fg.addColorStop(0,'transparent'); fg.addColorStop(1,`rgba(0,0,10,${fogAl})`);
        ctx.fillStyle=fg; ctx.fillRect(0,0,W,H);
    }

    // 边缘暗角
    const vig=ctx.createRadialGradient(cx2,cy2,M*0.25,cx2,cy2,Math.max(W,H)*0.85);
    vig.addColorStop(0,'transparent'); vig.addColorStop(1,'rgba(0,0,0,0.5)');
    ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);

    // 视图偏移提示
    const techNames = ['🌍L1行星', '🌙L2地月', '☀️L3太阳系', '🌠L4星际', '🌌L5银河', '🕳️奇点'];
    if(viewOffset > 0.08){
        const showRaw = sceneTgt - viewOffset;
        let label = '🗺️L0.5世界地图';
        if (showRaw >= 0) {
            const loLv = Math.floor(showRaw);
            const frac = showRaw - loLv;
            label = frac < 0.15 ? techNames[loLv]
                : frac > 0.85 ? techNames[Math.min(loLv+1,5)]
                : `${techNames[loLv]} → ${techNames[Math.min(loLv+1,5)]}`;
        }
        ctx.save();
        const tw = ctx.measureText(label).width + 28;
        ctx.fillStyle='rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.roundRect(W/2-tw/2, 12, tw, 26, 6); ctx.fill();
        ctx.fillStyle='rgba(160,220,255,0.9)';
        ctx.font='13px sans-serif'; ctx.textAlign='center';
        ctx.fillText('🔍 ' + label + '視角   双击还原', W/2, 30);
        ctx.restore();
    }

    updateHitEffects(now);
    updateEarthShipStacks(now);
    drawGainPopups(now);
    drawFleetSelectionBox();
    updateParticles();
    applyScreenShake(now);
    updatePlanetDivs();
}

// ── CSS 行星 div：初始化 ──────────────────────────────────────
function initPlanetDivs() {
    const layer = document.getElementById('planetLayer');
    planets.forEach(planet => {
        const div = document.createElement('div');
        div.className = `planet-div ${planet.cssClass} locked`;
        div.id = `pdiv-${planet.id}`;
        const r = Math.max(planet.radius, planet.isSun ? 32 : 8);
        div.style.width  = r * 2 + 'px';
        div.style.height = r * 2 + 'px';
        div.style.left   = '-9999px';
        div.style.top    = '-9999px';
        layer.appendChild(div);
    });
}

// ── CSS 行星 div：每帧同步位置 ────────────────────────────────
function updatePlanetDivs() {
    planets.forEach(planet => {
        const div = document.getElementById(`pdiv-${planet.id}`);
        if (!div) return;

        const unlocked = game.unlockedPlanets.includes(planet.id)
                      || game.currentStage >= planet.unlockStage;
        const drawR = Math.max(planet.radius * scale, planet.isSun ? 32 : 8);
        let x, y;
        if (planet.isSun) {
            x = centerX; y = centerY;
        } else {
            const rad = planet.angle * Math.PI / 180;
            x = centerX + Math.cos(rad) * planet.distance * scale;
            y = centerY + Math.sin(rad)  * planet.distance * scale;
        }

        div.style.width  = drawR * 2 + 'px';
        div.style.height = drawR * 2 + 'px';
        div.style.left   = x + 'px';
        div.style.top    = y + 'px';

        if (unlocked && div.classList.contains('locked')) {
            div.classList.remove('locked');
            div.classList.add('appearing');
            setTimeout(() => div.classList.remove('appearing'), 900);
        } else if (!unlocked && !div.classList.contains('locked')) {
            div.classList.add('locked');
        }

        div.style.pointerEvents = 'none';

        planet.screenX = x;
        planet.screenY = y;
        planet.drawR   = drawR;
    });
}


// ── 粒子系统 ──────────────────────────────────────────────────
function createParticle(x, y, targetX, targetY) {
    if (particles.length > 100) return;
    const techLevel = game.techLevel || 0;
    const particleCount = 1 + Math.floor(techLevel * 0.3);
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x, y, targetX, targetY,
            vx: (targetX - x) / 50,
            vy: (targetY - y) / 50,
            life: 50, maxLife: 50,
            techLevel: techLevel
        });
    }
}

function updateParticles() {
    const colorValues = [
        [251, 191, 36], [0, 217, 255], [168, 85, 247], [255, 0, 255], [255, 255, 255]
    ];
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        const alpha = p.life / p.maxLife;
        const rgb = colorValues[Math.min(p.techLevel || 0, 4)];
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + (p.techLevel || 0) * 0.5, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
    }
}

// ── 场景触发桥接（被游戏逻辑调用）───────────────────────────
function updateSolarOverlay() {
    const overlay = document.getElementById('solarSystemOverlay');
    if (overlay) overlay.style.display = 'none';
    forceSceneTransitionTo(getSceneLevelFromGame());
}

// 兼容占位（旧代码调用点保留）
function applyUserZoom() {
    viewOffsetTgt = 0.0;
    viewOffset = 0.0;
}

window.showStoryEvent = showStoryEvent;
window.showEarthDestroyedEvent = showEarthDestroyedEvent;
window.lockLevelRollback = lockRollback;
window.spawnMilitaryShipVisual = spawnMilitaryShipVisual;
window.forceSceneTransitionTo = forceSceneTransitionTo;
