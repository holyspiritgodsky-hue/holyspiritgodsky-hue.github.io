(function () {
  "use strict";

  const STYLE_ID = "war-sense-shared-style";

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function getFacing(dir) {
    return Math.cos(dir || 0) >= 0 ? 1 : -1;
  }

  function drawHealthBar(ctx, x, y, w, hp, maxHp, color, bg, h) {
    const barH = h || 4;
    ctx.fillStyle = bg || "rgba(0,0,0,0.6)";
    ctx.fillRect(x - w / 2, y, w, barH);
    ctx.fillStyle = color || "#8ed0ff";
    const ratio = clamp((hp || 0) / Math.max(1, maxHp || 1), 0, 1);
    ctx.fillRect(x - w / 2 + 1, y + 1, (w - 2) * ratio, Math.max(1, barH - 2));
  }

  function drawUprightUnit(ctx, entity, options) {
    const opts = options || {};
    const x = entity.x || 0;
    const y = entity.y || 0;
    const facing = getFacing(entity.dir || 0);
    const unitScale = opts.unitScale || 1;
    const bodyW = (opts.bodyWidth || 8.8) * unitScale;
    const bodyH = (opts.bodyHeight || 11.8) * unitScale;
    const bodyTop = (opts.bodyTop !== undefined ? opts.bodyTop : -7.8) * unitScale;
    const headR = (opts.headRadius || 4.4) * unitScale;
    const headY = (opts.headY !== undefined ? opts.headY : -10.6) * unitScale;
    const accentW = (opts.accentWidth || 5.6) * unitScale;
    const accentH = (opts.accentHeight || 1.5) * unitScale;
    const legLen = (opts.legLength || 7) * unitScale;
    const shadowY = (opts.shadowY !== undefined ? opts.shadowY : 12) * unitScale;
    const shadowRX = (opts.shadowRX || 9) * unitScale;
    const shadowRY = (opts.shadowRY || 2.8) * unitScale;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);

    if (!opts.hideShadow) {
      ctx.fillStyle = opts.shadowColor || "rgba(0,0,0,0.16)";
      ctx.beginPath();
      ctx.ellipse(0, shadowY, shadowRX, shadowRY, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (entity.mounted) {
      ctx.fillStyle = opts.mountBody || "#8d1d1d";
      ctx.beginPath();
      ctx.ellipse(-2 * unitScale, 10 * unitScale, (opts.mountW || 13) * unitScale, (opts.mountH || 6.8) * unitScale, 0, 0, Math.PI * 2);
      ctx.fill();
      if (!opts.mountSimple) {
        ctx.fillStyle = opts.mountHead || "#7a1515";
        ctx.beginPath();
        ctx.ellipse(9 * unitScale, 6 * unitScale, 6.2 * unitScale, 4.8 * unitScale, -0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      if (opts.mountLegs) {
        ctx.strokeStyle = opts.mountLegColor || "#5a3010";
        ctx.lineWidth = Math.max(1, 2.2 * unitScale);
        ctx.beginPath();
        ctx.moveTo(-9 * unitScale, 18 * unitScale);
        ctx.lineTo(-10 * unitScale, 26 * unitScale);
        ctx.moveTo(-3 * unitScale, 20 * unitScale);
        ctx.lineTo(-3 * unitScale, 28 * unitScale);
        ctx.moveTo(3 * unitScale, 20 * unitScale);
        ctx.lineTo(4 * unitScale, 28 * unitScale);
        ctx.moveTo(9 * unitScale, 17 * unitScale);
        ctx.lineTo(10 * unitScale, 25 * unitScale);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = opts.limbColor || "rgba(0,0,0,0.32)";
    ctx.lineWidth = Math.max(1, 1.8 * unitScale);
    ctx.beginPath();
    ctx.moveTo(-2.2 * unitScale, (bodyTop + bodyH - 0.8 * unitScale));
    ctx.lineTo(-2.6 * unitScale, (bodyTop + bodyH - 0.8 * unitScale) + legLen);
    ctx.moveTo(2.2 * unitScale, (bodyTop + bodyH - 0.8 * unitScale));
    ctx.lineTo(2.6 * unitScale, (bodyTop + bodyH - 0.8 * unitScale) + legLen);
    ctx.stroke();

    ctx.fillStyle = opts.body || entity.body || "#c49a58";
    ctx.fillRect(-bodyW * 0.5, bodyTop, bodyW, bodyH);

    ctx.fillStyle = opts.head || entity.head || "#efdba0";
    ctx.beginPath();
    ctx.arc(0, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    if (!opts.hideHeadband) {
      ctx.fillStyle = opts.headbandColor || "#2f1e16";
      ctx.fillRect(-4.6 * unitScale, (headY - headR - 1.2 * unitScale), 9.2 * unitScale, 2.1 * unitScale);
    }

    ctx.fillStyle = opts.accent || entity.accent || "#8f6d35";
    ctx.fillRect(3 * unitScale, -3.5 * unitScale, accentW, accentH);
    ctx.restore();
  }

  function drawLightningFx(ctx, fx) {
    if (!fx || !fx.segs || fx.segs.length < 2) return;
    const a = fx.life !== undefined ? fx.life : 1;
    ctx.save();
    ctx.shadowColor = "rgba(100,200,255," + (a * 0.8) + ")";
    ctx.shadowBlur = 22 * a;
    ctx.strokeStyle = "rgba(160,220,255," + (a * 0.85) + ")";
    ctx.lineWidth = 3.5 * a;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(fx.segs[0].x, fx.segs[0].y);
    for (let i = 1; i < fx.segs.length; i += 1) ctx.lineTo(fx.segs[i].x, fx.segs[i].y);
    ctx.stroke();

    ctx.shadowBlur = 8 * a;
    ctx.strokeStyle = "rgba(255,255,255," + (a * 0.9) + ")";
    ctx.lineWidth = 1.5 * a;
    ctx.beginPath();
    ctx.moveTo(fx.segs[0].x, fx.segs[0].y);
    for (let i = 1; i < fx.segs.length; i += 1) ctx.lineTo(fx.segs[i].x, fx.segs[i].y);
    ctx.stroke();
    ctx.restore();

    if (fx.tx !== undefined && fx.ty !== undefined && fx.splashR !== undefined) {
      ctx.strokeStyle = "rgba(180,230,255," + (a * 0.55) + ")";
      ctx.lineWidth = 2.2 * a;
      ctx.beginPath();
      ctx.arc(fx.tx, fx.ty, fx.splashR * (0.6 + (1 - a) * 0.5), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".sense-btn{position:fixed;top:14px;z-index:8;height:36px;padding:0 14px;border-radius:8px;",
      "border:1px solid rgba(255,255,255,0.35);color:#f2f5ee;font-size:13px;font-weight:600;",
      "line-height:1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;",
      "background:rgba(34,46,24,0.86);}",
      ".sense-btn:hover{background:rgba(52,70,35,0.92);}",
      ".sense-btn.sense-music{background:rgba(34,46,24,0.86);}",
      ".sense-btn.sense-music:hover{background:rgba(52,70,35,0.92);}",
      ".sense-panel-btn{border:1px solid rgba(255,255,255,0.35);color:#f2f5ee;height:36px;padding:0 14px;",
      "border-radius:8px;font-size:13px;font-weight:600;line-height:1;box-sizing:border-box;display:inline-flex;",
      "align-items:center;justify-content:center;text-decoration:none;background:rgba(34,46,24,0.86);}",
      ".sense-panel-btn:hover{background:rgba(52,70,35,0.92);}",
      ".sense-mini-wrap{border-radius:10px !important;border:1px solid rgba(255,255,255,0.28) !important;",
      "background:rgba(10,12,18,0.66) !important;box-shadow:0 10px 24px rgba(0,0,0,0.35);overflow:hidden !important;}"
    ].join("");
    document.head.appendChild(style);
  }

  function ensureButton(id, text) {
    let btn = document.getElementById(id);
    if (!btn) {
      btn = document.createElement("button");
      btn.id = id;
      btn.type = "button";
      btn.textContent = text;
      document.body.appendChild(btn);
    }
    return btn;
  }

  function createBgmController() {
    let audioCtx = null;
    let timer = null;
    let step = 0;
    let enabled = true;

    const melody = [64, 67, 69, 71, 72, 71, 69, 67, 64, 67, 69, 72, 71, 69, 67, 66];
    const bass = [40, 40, 43, 43, 45, 45, 43, 43, 40, 40, 43, 43, 47, 45, 43, 42];
    const beat = 0.28;

    function noteFreq(note) {
      return 440 * Math.pow(2, (note - 69) / 12);
    }

    function playTone(note, duration, volume, type, when) {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(noteFreq(note), when);
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(volume, when + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(when);
      osc.stop(when + duration + 0.02);
    }

    function startLoop() {
      if (!audioCtx || timer || !enabled) return;
      timer = setInterval(function () {
        if (!audioCtx || audioCtx.state !== "running" || !enabled) return;
        const when = audioCtx.currentTime + 0.02;
        const i = step % melody.length;
        playTone(melody[i], beat * 0.95, 0.06, "triangle", when);
        if (step % 2 === 0) playTone(bass[i], beat * 1.8, 0.048, "sine", when);
        step += 1;
      }, beat * 1000);
    }

    function stopLoop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function ensureContextAndResume() {
      if (!enabled) return;
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
      }
      audioCtx.resume().then(function () {
        startLoop();
      }).catch(function () {});
    }

    return {
      isEnabled: function () { return enabled; },
      setEnabled: function (v) {
        enabled = !!v;
        if (!enabled) {
          stopLoop();
          if (audioCtx && audioCtx.state === "running") audioCtx.suspend();
        } else {
          ensureContextAndResume();
        }
      },
      tryStart: function () { ensureContextAndResume(); }
    };
  }

  function initSharedUI(options) {
    ensureStyle();
    const opts = options || {};
    const miniWrapId = opts.miniWrapId || "miniWrap";
    const miniWrap = document.getElementById(miniWrapId);
    if (miniWrap) miniWrap.classList.add("sense-mini-wrap");

    const addPauseMusic = !!opts.addPauseMusic;
    let pauseBtn = null;
    let musicBtn = null;

    if (addPauseMusic) {
      pauseBtn = ensureButton(opts.pauseButtonId || "pauseBtn", "暂停");
      musicBtn = ensureButton(opts.musicButtonId || "musicBtn", "音乐: 开");
    } else {
      pauseBtn = document.getElementById(opts.pauseButtonId || "pauseBtn");
      musicBtn = document.getElementById(opts.musicButtonId || "musicBtn");
    }

    const rightStart = opts.rightStart !== undefined ? opts.rightStart : 14;
    if (pauseBtn) {
      pauseBtn.classList.add("sense-btn", "sense-panel-btn");
      pauseBtn.style.right = rightStart + "px";
      pauseBtn.style.top = (opts.top !== undefined ? opts.top : 14) + "px";
    }
    if (musicBtn) {
      musicBtn.classList.add("sense-btn", "sense-music", "sense-panel-btn");
      musicBtn.style.right = (rightStart + 82) + "px";
      musicBtn.style.top = (opts.top !== undefined ? opts.top : 14) + "px";
    }

    const bgm = createBgmController();
    let paused = false;

    function syncPauseText() {
      if (pauseBtn) pauseBtn.textContent = paused ? "继续" : "暂停";
    }

    function syncMusicText() {
      if (musicBtn) musicBtn.textContent = "音乐: " + (bgm.isEnabled() ? "开" : "关");
    }

    function setPaused(v) {
      paused = !!v;
      syncPauseText();
      if (opts.onPauseChange) opts.onPauseChange(paused);
    }

    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        setPaused(!paused);
      });
    }

    if (musicBtn) {
      musicBtn.addEventListener("click", function () {
        bgm.setEnabled(!bgm.isEnabled());
        syncMusicText();
      });
    }

    window.addEventListener("keydown", function (e) {
      if (e.code === "Space" || (e.key && e.key.toLowerCase() === "p")) {
        if (!pauseBtn) return;
        e.preventDefault();
        setPaused(!paused);
      }
      if (e.key && e.key.toLowerCase() === "m") {
        if (!musicBtn) return;
        bgm.setEnabled(!bgm.isEnabled());
        syncMusicText();
      }
    });

    window.addEventListener("pointerdown", function () {
      bgm.tryStart();
    }, { once: false });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && bgm.isEnabled()) bgm.tryStart();
    });

    syncPauseText();
    syncMusicText();

    return {
      isPaused: function () { return paused; },
      setPaused: setPaused,
      drawPauseOverlay: function (ctx, width, height) {
        if (!paused) return;
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "rgba(255,250,220,0.95)";
        ctx.font = "700 34px Microsoft YaHei";
        ctx.textAlign = "center";
        ctx.fillText("已暂停", width * 0.5, height * 0.5 - 8);
        ctx.font = "600 14px Microsoft YaHei";
        ctx.fillText("点击继续或按 P/空格", width * 0.5, height * 0.5 + 24);
        ctx.restore();
      }
    };
  }

  function layoutTopPanelButtons(options) {
    ensureStyle();
    const opts = options || {};
    const ids = opts.ids || ["pauseBtn", "musicBtn", "labBtn", "cardsBtn"];
    const rightStart = opts.rightStart !== undefined ? opts.rightStart : 14;
    const top = opts.top !== undefined ? opts.top : 14;
    const gap = opts.gap !== undefined ? opts.gap : 8;
    const compact = !!opts.compact;
    let right = rightStart;

    for (let i = 0; i < ids.length; i += 1) {
      const el = document.getElementById(ids[i]);
      if (!el) continue;

      el.classList.add("sense-panel-btn", "sense-btn");
      el.style.top = top + "px";
      el.style.right = right + "px";
      el.style.height = compact ? "40px" : "36px";
      el.style.padding = compact ? "0 14px" : "0 14px";
      el.style.fontSize = compact ? "14px" : "13px";

      const w = Math.max(70, Math.ceil(el.getBoundingClientRect().width || el.offsetWidth || 70));
      right += w + gap;
    }
  }

  window.WarSense = {
    initSharedUI: initSharedUI,
    layoutTopPanelButtons: layoutTopPanelButtons,
    getFacing: getFacing,
    drawHealthBar: drawHealthBar,
    drawUprightUnit: drawUprightUnit,
    drawLightningFx: drawLightningFx
  };
})();
