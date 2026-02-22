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
const interactiveBodies = [];
const slotHotspots = [];
let shakeUntil = 0;
let shakeMag = 0;
let lastViewportW = 0;
let lastViewportH = 0;
let resizeRaf = 0;
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
const isCoarsePointer = typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: coarse)').matches
    : false;

// 地球/月球贴图（来自 img 文件夹）
const earthImg = new Image();
const moonImg = new Image();
let earthImgLoaded = false;
let moonImgLoaded = false;
earthImg.onload = () => { earthImgLoaded = true; };
moonImg.onload = () => { moonImgLoaded = true; };
earthImg.src = 'img/earth.jpg';
moonImg.src = 'img/moon.jpg';

// 视图层级偶停：0 = 当前科技等级画面，+1 = 退回一个等级的画面
let viewOffset = 0.0;
let viewOffsetTgt = 0.0;
let rollbackLockUntil = 0;
let lastObservedTechLevel = 0;

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
    const maxOff = window.game ? (window.game.techLevel || 0) : 0;
    if(maxOff === 0) return; // 等级 0 时无法回退
    const delta = e.deltaY > 0 ? -0.25 : 0.25; // 上滚+，下滚-
    if (delta > 0 && isRollbackLocked()) return;
    viewOffsetTgt = Math.max(0, Math.min(maxOff, viewOffsetTgt + delta));
}, { passive: false });

// 双击还原到当前等级
window.addEventListener('dblclick', (e) => {
    if(e.target && e.target.closest && e.target.closest('button,input,select,.tab-button,.upgrade-card')) return;
    viewOffsetTgt = 0.0;
});

// 触摸捏合缩放
let _pinchDist = null;
window.addEventListener('touchstart',  (e) => { if(e.touches.length===2) _pinchDist=null; }, {passive:true});
window.addEventListener('touchmove', (e) => {
    if(e.touches.length!==2) return;
    e.preventDefault();
    const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(_pinchDist!==null){
        const maxOff = window.game ? (window.game.techLevel || 0) : 0;
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

// UI 安全区常量：yf=0 对应顶栏底部，yf=1 对应右侧抽屉不影响时的底部安全线
const UI_TOP = 160;   // 顶栏高度 px
const UI_BOT = 80;    // 底部安全留白 px

// ── 5科技级别场景定义 ─────────────────────────────────────────
// xf: 0-1 = 屏幕宽度比例   yf: 0-1 = 安全绘图区高度比例（UI_TOP ~ H-UI_BOT）
// rf: 相对 min(W,H) 的半径比例
const TECH_LEVELS = [
  // ── Level 0: 行星文明，巨大地球充满视野 ──
  { starVis:0.10, fogR:0.22, fogAlpha:0.95,
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
];

// ── 场景过渡 ──────────────────────────────────────────────────
let sceneFrom=0, sceneTgt=0, sceneP=1, sceneT0=0;
const SCENE_DUR=3000;
function sceneEase(t){ return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
function sLerp(a,b,t){ return a+(b-a)*t; }
function triggerSceneTransition(newLv){
    sceneFrom=sceneTgt; sceneTgt=Math.min(newLv,4);
    sceneT0=performance.now(); sceneP=0;
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
let shimA=0;

function getOreTargetPosition() {
    const oreValue = document.getElementById('oreVal');
    const anchor = oreValue?.closest('.resource-compact') || oreValue;
    if (!anchor) return { x: canvas.width * 0.5, y: 44 };
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

function showStoryEvent(title, contentHtml, buttonText = '继续') {
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
    modal.querySelector('button').addEventListener('click', () => modal.remove());
}

function showEarthDestroyedEvent() {
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
        <div style="line-height:1.75;color:#fecaca;margin-bottom:1rem;">机器人军团被水星微生物腐蚀！地球灭亡</div>
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
    if (!planet || planet.isSun) return;
    const unlocked = game.unlockedPlanets.includes(planet.id) || game.currentStage >= planet.unlockStage;
    if (!unlocked) return;

    const hitX = event?.clientX ?? (planet.screenX || centerX);
    const hitY = event?.clientY ?? (planet.screenY || centerY);
    const mult = planetClickMultiplier[planet.id] ?? 1;
    const gain = Math.max(1, Math.floor(game.clickPower * (planet.clickMulti || 1) * mult));

    game.ore += gain;
    game.totalEarned += gain;
    game.totalClicks = (game.totalClicks || 0) + 1;

    const oreTarget = getOreTargetPosition();
    createParticle(hitX, hitY, oreTarget.x, oreTarget.y);
    createHitEffect(planet, hitX, hitY, gain);
    triggerScreenShake(Math.min(9, 3 + gain / 120), 90);

    if (planet.id === 'earth') {
        const st = planetClickStats.earth;
        st.clicks++;
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
        const st = planetClickStats.mars;
        st.clicks++;
        if (!st.rebellionShown && st.clicks >= 5) {
            st.rebellionShown = true;
            planetClickMultiplier.mars = 0.05;
            showStoryEvent(
                '🚨 火星地底人反抗',
                '火星地底势力发起反扑，地球采矿据点遭到袭击。<br>火星点击收益下降 95%。',
                '继续镇压反抗'
            );
        }

        if (st.rebellionShown && !st.peaceShown && st.clicks >= 20) {
            let robotCount = 0;
            if (typeof window.getBuildingCount === 'function') {
                robotCount = Math.max(0, Number(window.getBuildingCount('robotLegion')) || 0);
            }

            if (robotCount < 5) {
                if (!st.requirementShown) {
                    st.requirementShown = true;
                    showStoryEvent(
                        '🛡️ 火星防线过强',
                        `火星地底人构建了深层防线，当前机器人军团不足（${robotCount}/5）。<br>至少需要 5 个机器人军团才能完成征服。`,
                        '继续扩军'
                    );
                }
            } else {
                st.peaceShown = true;
                planetClickMultiplier.mars = 1;
                showStoryEvent(
                    '🏁 火星战役完成',
                    '地球远征军已全面控制火星地表与地底据点。<br>火星点击收益已恢复。'
                    + '<div style="margin-top:0.9rem;border:1px solid rgba(251,191,36,0.6);border-radius:10px;overflow:hidden;background:rgba(251,191,36,0.08);">'
                    + '<img src="img/KTV.PNG" alt="火星KTV" style="display:block;width:100%;height:180px;object-fit:cover;" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<div style=\'height:160px;display:flex;align-items:center;justify-content:center;color:#fbbf24;\'>KTV 图片加载失败</div>\'" />'
                    + '</div>',
                    '去唱一首，继续开采'
                );
            }
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
        }

        if (st.firstHintShown && !st.counterAttackShown && mercuryClicks >= 6) {
            st.counterAttackShown = true;
            showStoryEvent(
                '⚠️ 紧急战报',
                '水星微生物群开始反攻地球前线据点！',
                '准备防御'
            );

            let robotCount = 0;
            if (typeof window.getBuildingCount === 'function') {
                robotCount = Math.max(0, Number(window.getBuildingCount('robotLegion')) || 0);
            }

            if (robotCount < 3 && !st.gameOverShown) {
                st.gameOverShown = true;
                showEarthDestroyedEvent();
                return;
            }
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

    const vv = window.visualViewport;
    if (vv) {
        const scaleX = canvas.width / Math.max(1, rect.width);
        const scaleY = canvas.height / Math.max(1, rect.height);
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        return {
            x: Math.max(0, Math.min(canvas.width, x)),
            y: Math.max(0, Math.min(canvas.height, y))
        };
    }

    const scaleX = canvas.width / Math.max(1, rect.width);
    const scaleY = canvas.height / Math.max(1, rect.height);
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
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

    const slotR = Math.max(13, Math.min(22, earthR * 0.20));
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const spreadR = earthR * 0.78;

    for (let index = 0; index < total; index++) {
        const t = (index + 0.5) / total;
        const radial = Math.sqrt(t) * spreadR;
        const angle = index * goldenAngle;
        const x = ex + Math.cos(angle) * radial;
        const y = ey + Math.sin(angle) * radial * 0.86;
        const slotType = assignments[index] || null;

        slotHotspots.push({ planetId: 'earth', index, x, y, r: slotR, slotType });

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, slotR, 0, Math.PI * 2);
        if (slotType === 'autoFactory') {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.95)';
        } else if (slotType === 'robotLegion') {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.95)';
        } else if (slotType === 'energyStation') {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.96)';
        } else if (slotType === 'researchCenter') {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.96)';
        } else {
            ctx.fillStyle = 'rgba(148, 163, 184, 0.52)';
        }
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = slotType ? 'rgba(255,255,255,0.75)' : 'rgba(148,163,184,0.6)';
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
        ctx.fillStyle = slotType ? '#ffffff' : 'rgba(226,232,240,0.85)';
        ctx.font = `${Math.max(12, slotR * 1.05)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, x, y + 0.5);
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

    const slotType = assignments[0] || null;
    const slotR = Math.max(11, Math.min(19, meta.drawR * 0.65 + 5));
    const angle = -Math.PI / 4;
    const dist = Math.max(meta.drawR * 0.95, slotR * 1.3);
    const x = meta.screenX + Math.cos(angle) * dist;
    const y = meta.screenY + Math.sin(angle) * dist;

    slotHotspots.push({ planetId, index: 0, x, y, r: slotR, slotType });

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, slotR, 0, Math.PI * 2);
    if (slotType === 'autoFactory') {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.95)';
    } else if (slotType === 'robotLegion') {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.95)';
    } else if (slotType === 'energyStation') {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.96)';
    } else if (slotType === 'researchCenter') {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.96)';
    } else {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.52)';
    }
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = slotType ? 'rgba(255,255,255,0.78)' : 'rgba(148,163,184,0.72)';
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
    ctx.fillStyle = slotType ? '#ffffff' : 'rgba(226,232,240,0.9)';
    ctx.font = `${Math.max(12, slotR * 1.02)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, x, y + 0.5);
    ctx.restore();
}

canvas.addEventListener('click', (event) => {
    const pointer = getCanvasPointerPosition(event);
    const x = pointer.x;
    const y = pointer.y;

    const slot = hitTestSlot(x, y);
    if (slot) {
        if (typeof window.openSlotBuildMenu === 'function') {
            window.openSlotBuildMenu(slot.planetId, slot.index);
        }
        return;
    }

    const body = hitTestBody(x, y);
    if (!body) return;
    const planet = planets.find(p => p.id === body.id);
    if (!planet) return;
    handlePlanetMineClick(planet, { clientX: x, clientY: y });
});

canvas.addEventListener('touchstart', (event) => {
    if (!event.touches || event.touches.length !== 1) return;
    event.preventDefault();
    const pointer = getCanvasPointerPosition(event);
    const x = pointer.x;
    const y = pointer.y;

    const slot = hitTestSlot(x, y);
    if (slot) {
        if (typeof window.openSlotBuildMenu === 'function') {
            window.openSlotBuildMenu(slot.planetId, slot.index);
        }
        return;
    }

    const body = hitTestBody(x, y);
    if (!body) return;
    const planet = planets.find(p => p.id === body.id);
    if (!planet) return;
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

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = width;
    canvas.height = height;

    centerX = canvas.width / 2;

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

    const availableH = canvas.height - uiTopHeight - bottomPanelHeight;
    centerY = uiTopHeight + availableH / 2;
    const availableW = canvas.width * 0.9;
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
    const currentTechLevel = Math.max(0, window.game?.techLevel || 0);
    if (currentTechLevel !== lastObservedTechLevel) {
        if (currentTechLevel > lastObservedTechLevel) {
            lockRollback(1400);
        }
        lastObservedTechLevel = currentTechLevel;
    }
    shimA += 0.007;
    interactiveBodies.length = 0;
    slotHotspots.length = 0;
    if(sceneP < 1) sceneP = Math.min(1, (now - sceneT0) / SCENE_DUR);
    const tp = sceneEase(sceneP);
    const A = TECH_LEVELS[sceneFrom], B = TECH_LEVELS[sceneTgt];
    const W = canvas.width, H = canvas.height, M = Math.min(W,H);
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
    if(sceneP < 1 || viewOffset < 0.01){
        rA = A; rB = B; rtp = tp;
        renderLv = sLerp(sceneFrom, sceneTgt, tp);
    } else {
        const effectiveLv = Math.max(0, sceneTgt - viewOffset);
        const lo = Math.floor(effectiveLv);
        const hi = Math.min(lo + 1, 4);
        rA = TECH_LEVELS[lo]; rB = TECH_LEVELS[hi]; rtp = effectiveLv - lo;
        renderLv = effectiveLv;
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
            ctx.globalAlpha=alpha*Math.min(1,br/4)*0.7;
            ctx.font=`${Math.max(10,Math.min(12,br*1.8))}px sans-serif`;
            ctx.fillStyle='#bbb'; ctx.textAlign='left';
            ctx.fillText(body.label,bx+br+5,by+4);
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
        if(earthImgLoaded){
            ctx.save();
            ctx.beginPath(); ctx.arc(ex,ey,earthR,0,Math.PI*2); ctx.clip();
            ctx.drawImage(earthImg, ex-earthR, ey-earthR, earthR*2, earthR*2);
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
        const tg2=ctx.createRadialGradient(ex+earthR*0.4,ey-earthR*0.1,0,ex,ey,earthR*1.02);
        tg2.addColorStop(0,'transparent'); tg2.addColorStop(0.6,'transparent'); tg2.addColorStop(1,'rgba(0,0,12,0.10)');
        ctx.globalAlpha=1; ctx.beginPath(); ctx.arc(ex,ey,earthR,0,Math.PI*2); ctx.fillStyle=tg2; ctx.fill();
        ctx.restore();

    }

    const slotViewLv = sceneP < 1 || viewOffset < 0.01
        ? Math.max(0, Math.min(4, Math.round(sLerp(sceneFrom, sceneTgt, tp))))
        : Math.max(0, Math.min(4, Math.round(sceneTgt - viewOffset)));
    if (slotViewLv === 0) {
        drawEarthSlots(ex, ey, earthR, slotViewLv);
    } else if (slotViewLv === 1) {
        ['moon', 'venus', 'mercury'].forEach(id => drawSinglePlanetSlot(id, visibleBodyIds));
    } else if (slotViewLv === 2) {
        ['mars', 'jupiter', 'saturn'].forEach(id => drawSinglePlanetSlot(id, visibleBodyIds));
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
    const techNames = ['🌍行星','🌙地月','☀️太阳系','🌠星际','🌌銀河'];
    if(viewOffset > 0.08){
        const showLv = Math.max(0, sceneTgt - viewOffset);
        const loLv = Math.floor(showLv), frac = showLv - loLv;
        const label = frac < 0.15 ? techNames[loLv]
                    : frac > 0.85 ? techNames[Math.min(loLv+1,4)]
                    : `${techNames[loLv]} → ${techNames[Math.min(loLv+1,4)]}`;
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
    triggerSceneTransition(game.techLevel || 0);
}

// 兼容占位（旧代码调用点保留）
function applyUserZoom() {
    viewOffsetTgt = 0.0;
    viewOffset = 0.0;
}

window.lockLevelRollback = lockRollback;
