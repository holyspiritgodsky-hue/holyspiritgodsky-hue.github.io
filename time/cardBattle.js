/**
 * cardBattle.js — Hearthstone-style Card Battle for Level 0.5
 * 民心值 replaces mana crystals.
 */
(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    //  CARD DATABASE
    // ═══════════════════════════════════════════════════════════
    const CARDS = {
        // ── Minions ──────────────────────────────────────────────
        militia:          { name: '民兵',      icon: '👤', cost: 0, atk: 1, hp: 1, type: 'minion', rarity: 'common',    desc: '' },
        infantry:         { name: '步兵班',    icon: '🪖', cost: 1, atk: 1, hp: 2, type: 'minion', rarity: 'common',    desc: '' },
        drone:            { name: '无人机',    icon: '🚁', cost: 2, atk: 2, hp: 1, type: 'minion', rarity: 'common',    desc: '突袭',      ability: 'rush'             },
        mg_nest:          { name: '机枪阵地',  icon: '🛡️', cost: 2, atk: 1, hp: 4, type: 'minion', rarity: 'common',    desc: '嘲讽',      ability: 'taunt'            },
        special_forces:   { name: '特种部队',  icon: '🎖️', cost: 3, atk: 3, hp: 3, type: 'minion', rarity: 'rare',      desc: '突袭',      ability: 'rush'             },
        air_defense:      { name: '防空系统',  icon: '🚀', cost: 3, atk: 2, hp: 5, type: 'minion', rarity: 'common',    desc: '嘲讽',      ability: 'taunt'            },
        artillery:        { name: '炮兵营',    icon: '💥', cost: 3, atk: 4, hp: 2, type: 'minion', rarity: 'common',    desc: '' },
        naval_fleet:      { name: '海军舰队',  icon: '⚓', cost: 4, atk: 4, hp: 4, type: 'minion', rarity: 'common',    desc: '' },
        strategic_bomber: { name: '战略轰炸机',icon: '✈️', cost: 5, atk: 5, hp: 3, type: 'minion', rarity: 'rare',      desc: '' },
        armored_div:      { name: '装甲师',    icon: '🔵', cost: 5, atk: 4, hp: 7, type: 'minion', rarity: 'rare',      desc: '嘲讽',      ability: 'taunt'            },
        nuclear_sub:      { name: '核潜艇',    icon: '🌊', cost: 6, atk: 5, hp: 5, type: 'minion', rarity: 'epic',      desc: '隐身',      ability: 'stealth'          },
        heavy_tank:       { name: '重型坦克',  icon: '🔩', cost: 6, atk: 6, hp: 6, type: 'minion', rarity: 'epic',      desc: '嘲讽·突袭', ability: 'taunt_rush'       },
        field_commander:  { name: '前线司令',  icon: '⭐', cost: 7, atk: 5, hp: 5, type: 'minion', rarity: 'legendary', desc: '战吼：所有友方随从+1/+1', ability: 'battlecry_buff_all' },
        // ── Spells ───────────────────────────────────────────────
        recon_satellite:  { name: '侦察卫星',  icon: '📡', cost: 1, type: 'spell', rarity: 'common',    desc: '摸1张牌',              effect: 'draw1'                        },
        propaganda:       { name: '宣传攻势',  icon: '📢', cost: 2, type: 'spell', rarity: 'common',    desc: '摸2张牌',              effect: 'draw2'                        },
        cyber_attack:     { name: '网络攻击',  icon: '💻', cost: 2, type: 'spell', rarity: 'rare',      desc: '对一个目标造成3点伤害', effect: 'damage_target', value: 3, needsTarget: true },
        airstrike:        { name: '空袭',      icon: '💣', cost: 3, type: 'spell', rarity: 'common',    desc: '对一个目标造成4点伤害', effect: 'damage_target', value: 4, needsTarget: true },
        economic_sanctions:{ name:'经济制裁',  icon: '📋', cost: 3, type: 'spell', rarity: 'rare',      desc: '沉默一个敌方随从',     effect: 'silence_target',              needsTarget: true },
        reinforcements:   { name: '战略增援',  icon: '🏭', cost: 4, type: 'spell', rarity: 'rare',      desc: '召唤两个2/2步兵',      effect: 'summon_2_2_x2'                },
        missile_defense:  { name: '导弹防御',  icon: '🛡️', cost: 4, type: 'spell', rarity: 'rare',      desc: '获得8点护甲',          effect: 'gain_armor',    value: 8       },
        people_uprising:  { name: '人民起义',  icon: '✊', cost: 5, type: 'spell', rarity: 'epic',      desc: '对敌方英雄造成6点伤害', effect: 'damage_hero',   value: 6       },
        nuclear_deterrent:{ name: '核威慑',    icon: '☢️', cost: 8, type: 'spell', rarity: 'legendary', desc: '对所有敌方随从造成8点伤害', effect: 'aoe_damage', value: 8     },
    };

    const RARITY_COLORS = { common: '#64748b', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' };
    const RARITY_GLOWS  = { common: 'rgba(100,116,139,0.5)', rare: 'rgba(59,130,246,0.7)', epic: 'rgba(168,85,247,0.7)', legendary: 'rgba(245,158,11,0.8)' };

    // ═══════════════════════════════════════════════════════════
    //  NATION CONFIGS (player selectable)
    // ═══════════════════════════════════════════════════════════
    const NATION_CONFIGS = {
        us: {
            name: '美国', heroName: '合众国司令', heroHp: 30,
            heroPowerName: '空中打击', heroPowerCost: 2, heroPowerDesc: '对任意目标造成1点伤害',
            heroPowerEffect: 'damage_target_1', heroPowerIcon: '✈️', color: '#3b82f6',
            deck: ['infantry','infantry','drone','drone','special_forces','special_forces',
                   'airstrike','airstrike','recon_satellite','recon_satellite','strategic_bomber',
                   'nuclear_sub','field_commander','nuclear_deterrent','armored_div',
                   'air_defense','people_uprising','propaganda','missile_defense','heavy_tank']
        },
        cn: {
            name: '中国', heroName: '人民军总指挥', heroHp: 30,
            heroPowerName: '人民战争', heroPowerCost: 1, heroPowerDesc: '召唤一个1/1民兵',
            heroPowerEffect: 'summon_1_1', heroPowerIcon: '👤', color: '#ef4444',
            deck: ['militia','militia','infantry','infantry','infantry','drone','drone',
                   'mg_nest','mg_nest','artillery','artillery','special_forces',
                   'reinforcements','propaganda','cyber_attack','armored_div',
                   'heavy_tank','field_commander','recon_satellite','airstrike']
        },
        ru: {
            name: '俄罗斯', heroName: '北极熊统帅', heroHp: 35,
            heroPowerName: '钢铁意志', heroPowerCost: 2, heroPowerDesc: '给一个友方随从+0/+2',
            heroPowerEffect: 'buff_hp_2', heroPowerIcon: '🛡️', color: '#94a3b8',
            deck: ['mg_nest','mg_nest','air_defense','air_defense','armored_div','armored_div',
                   'heavy_tank','heavy_tank','artillery','infantry','infantry','naval_fleet',
                   'naval_fleet','field_commander','missile_defense','missile_defense',
                   'reinforcements','nuclear_deterrent','economic_sanctions','propaganda']
        },
        eu: {
            name: '欧盟', heroName: '布鲁塞尔议长', heroHp: 30,
            heroPowerName: '外交斡旋', heroPowerCost: 2, heroPowerDesc: '摸1张牌',
            heroPowerEffect: 'draw1', heroPowerIcon: '📜', color: '#a855f7',
            deck: ['recon_satellite','recon_satellite','propaganda','propaganda',
                   'cyber_attack','cyber_attack','economic_sanctions','economic_sanctions',
                   'airstrike','missile_defense','people_uprising','nuclear_deterrent',
                   'infantry','infantry','drone','naval_fleet','strategic_bomber',
                   'field_commander','air_defense','special_forces']
        }
    };

    function getEnemyNationConfig(factionId) {
        if (NATION_CONFIGS[factionId]) return { ...NATION_CONFIGS[factionId], factionId };
        const extra = {
            in:  { name:'印度',    heroName:'英迪拉将军', heroHp:28, heroPowerName:'人口红利', heroPowerCost:2, heroPowerDesc:'召唤一个1/2随从', heroPowerEffect:'summon_1_2', heroPowerIcon:'🪖', color:'#f472b6' },
            jp:  { name:'日本',    heroName:'武士将军',   heroHp:25, heroPowerName:'科技优势', heroPowerCost:2, heroPowerDesc:'对一个随从造成2伤害', heroPowerEffect:'damage_target_2', heroPowerIcon:'⚡', color:'#f87171' },
            ir:  { name:'伊朗',    heroName:'圣战将帅',   heroHp:28, heroPowerName:'圣战动员', heroPowerCost:1, heroPowerDesc:'召唤一个2/1随从', heroPowerEffect:'summon_2_1', heroPowerIcon:'🔥', color:'#2dd4bf' },
            tw:  { name:'台湾',    heroName:'岛防指挥官', heroHp:25, heroPowerName:'神盾防御', heroPowerCost:2, heroPowerDesc:'给英雄+3护甲', heroPowerEffect:'gain_armor_3', heroPowerIcon:'🛡️', color:'#fb923c' },
            ve:  { name:'委内瑞拉',heroName:'石油将领',   heroHp:25, heroPowerName:'石油资源', heroPowerCost:2, heroPowerDesc:'获得1点临时民心', heroPowerEffect:'gain_mana_1_temp', heroPowerIcon:'🛢️', color:'#fde047' },
            ua:  { name:'乌克兰', heroName:'铁血将军',   heroHp:28, heroPowerName:'顽强抵抗', heroPowerCost:2, heroPowerDesc:'给一个友方随从+0/+3', heroPowerEffect:'buff_hp_3', heroPowerIcon:'💪', color:'#38bdf8' },
            br:  { name:'巴西',    heroName:'热带统帅',   heroHp:28, heroPowerName:'热带攻势', heroPowerCost:2, heroPowerDesc:'召唤一个2/2随从', heroPowerEffect:'summon_2_2', heroPowerIcon:'🌴', color:'#4ade80' },
            eg:  { name:'埃及',    heroName:'法老指挥官', heroHp:25, heroPowerName:'法老军团', heroPowerCost:2, heroPowerDesc:'召唤一个1/1随从', heroPowerEffect:'summon_1_1', heroPowerIcon:'🏺', color:'#fbbf24' },
            sa:  { name:'沙特',    heroName:'沙漠雄狮',   heroHp:30, heroPowerName:'石油财富', heroPowerCost:2, heroPowerDesc:'获得5点护甲', heroPowerEffect:'gain_armor_5', heroPowerIcon:'🛢️', color:'#a3e635' },
            pa:  { name:'巴拿马', heroName:'运河守将',   heroHp:20, heroPowerName:'运河要道', heroPowerCost:2, heroPowerDesc:'摸1张牌', heroPowerEffect:'draw1', heroPowerIcon:'⚓', color:'#f87171' },
            mx:  { name:'墨西哥', heroName:'仙人掌将领', heroHp:25, heroPowerName:'边境防线', heroPowerCost:2, heroPowerDesc:'召唤一个1/2随从', heroPowerEffect:'summon_1_2', heroPowerIcon:'🌵', color:'#6ee7b7' },
            ca:  { name:'加拿大', heroName:'枫叶司令',   heroHp:28, heroPowerName:'冰原战术', heroPowerCost:2, heroPowerDesc:'给一个随从+1/+1', heroPowerEffect:'buff_target_1_1', heroPowerIcon:'🍁', color:'#fca5a5' },
            il:  { name:'以色列', heroName:'情报将军',   heroHp:25, heroPowerName:'情报优势', heroPowerCost:2, heroPowerDesc:'对一个随从造成2点伤害', heroPowerEffect:'damage_target_2', heroPowerIcon:'🔍', color:'#93c5fd' },
            iq:  { name:'伊拉克', heroName:'两河将帅',   heroHp:25, heroPowerName:'石油动员', heroPowerCost:2, heroPowerDesc:'召唤一个2/1随从', heroPowerEffect:'summon_2_1', heroPowerIcon:'🛢️', color:'#86efac' },
            none:{ name:'中立地区',heroName:'中立守卫',  heroHp:20, heroPowerName:'防御阵线', heroPowerCost:2, heroPowerDesc:'召唤一个1/1随从', heroPowerEffect:'summon_1_1', heroPowerIcon:'🏴', color:'#64748b' },
        };
        return { ...(extra[factionId] || extra.none), factionId: factionId };
    }

    function generateEnemyDeck(factionId) {
        const base = ['infantry','infantry','mg_nest','artillery','drone','naval_fleet',
                      'armored_div','special_forces','air_defense','airstrike',
                      'recon_satellite','propaganda','reinforcements','missile_defense','infantry'];
        const extras = {
            in:  ['infantry','infantry','militia','militia','artillery','reinforcements'],
            jp:  ['drone','drone','cyber_attack','cyber_attack','strategic_bomber','nuclear_sub'],
            ir:  ['militia','artillery','airstrike','people_uprising','mg_nest','mg_nest'],
            tw:  ['drone','special_forces','cyber_attack','nuclear_sub','missile_defense','recon_satellite'],
            ve:  ['militia','militia','infantry','artillery','propaganda','people_uprising'],
            ua:  ['mg_nest','mg_nest','air_defense','air_defense','armored_div','heavy_tank'],
            br:  ['infantry','infantry','naval_fleet','naval_fleet','field_commander','reinforcements'],
            eg:  ['infantry','artillery','airstrike','propaganda','militia','militia'],
            sa:  ['drone','strategic_bomber','naval_fleet','nuclear_sub','missile_defense','economic_sanctions'],
            pa:  ['militia','infantry','drone','airstrike','recon_satellite','cyber_attack'],
            mx:  ['militia','infantry','infantry','artillery','airstrike','propaganda'],
            ca:  ['naval_fleet','strategic_bomber','missile_defense','air_defense','armored_div','propaganda'],
            il:  ['cyber_attack','cyber_attack','drone','special_forces','nuclear_sub','economic_sanctions'],
            iq:  ['militia','infantry','artillery','airstrike','people_uprising','mg_nest'],
            none:['militia','infantry','mg_nest','air_defense','propaganda','reinforcements'],
        };
        const specific = extras[factionId] || [];
        let deck = [...specific, ...base];
        while (deck.length < 20) deck.push(base[deck.length % base.length]);
        return deck.slice(0, 20);
    }

    // ═══════════════════════════════════════════════════════════
    //  GAME STATE
    // ═══════════════════════════════════════════════════════════
    let G = null;
    let overlay = null;
    let selectedHandIdx = null;
    let selectedMinionUid = null;
    let pendingSpell = null;
    let heroPowerNeedsTarget = false;
    let onVictoryCb = null;
    let onDefeatCb = null;
    let aiTimer = null;
    let resultAutoCloseTimer = null;
    let uidSeq = 0;
    let vfxSeq = 0;
    let audioCtx = null;
    let audioMasterGain = null;
    let audioMusicGain = null;
    let audioSfxGain = null;
    let audioCompressor = null;
    let audioMusicTimer = null;
    let audioMusicStep = 0;
    let audioMuted = false;
    let audioTheme = {
        name: 'default',
        seq: [196, 220, 247, 196, 293, 247, 220, 174],
        bass: [98, 98, 110, 98],
        stepMs: 640,
        accentEvery: 2,
        leadType: 'sine',
        bassType: 'triangle'
    };

    function uid() { return 'm' + (++uidSeq); }

    function nextVfxId() { return 'cbvfx_' + (++vfxSeq); }

    function ensureAudioContext() {
        if (audioCtx) return audioCtx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        audioCtx = new AC();
        audioMasterGain = audioCtx.createGain();
        audioMusicGain = audioCtx.createGain();
        audioSfxGain = audioCtx.createGain();
        audioCompressor = audioCtx.createDynamicsCompressor();
        audioCompressor.threshold.value = -16;
        audioCompressor.knee.value = 24;
        audioCompressor.ratio.value = 4;
        audioCompressor.attack.value = 0.003;
        audioCompressor.release.value = 0.20;
        audioMasterGain.gain.value = 0.56;
        audioMusicGain.gain.value = 0.52;
        audioSfxGain.gain.value = 0.95;
        audioMusicGain.connect(audioMasterGain);
        audioSfxGain.connect(audioMasterGain);
        audioMasterGain.connect(audioCompressor);
        audioCompressor.connect(audioCtx.destination);
        return audioCtx;
    }

    function resumeAudioContext() {
        const ctx = ensureAudioContext();
        if (!ctx) return null;
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
        return ctx;
    }

    function playTone(freq, durationMs, opts) {
        const ctx = resumeAudioContext();
        if (!ctx || audioMuted) return;
        const options = opts || {};
        const now = ctx.currentTime + (options.delay || 0);
        const dur = Math.max(0.03, (durationMs || 120) / 1000);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = options.type || 'triangle';
        osc.frequency.setValueAtTime(Math.max(40, freq || 220), now);
        if (Number.isFinite(options.detune)) {
            osc.detune.setValueAtTime(options.detune, now);
        }
        const vol = Math.max(0.001, Math.min(1, options.volume || 0.14));
        const atk = Math.min(0.03, dur * 0.25);
        const rel = Math.min(0.16, dur * 0.72);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(vol, now + atk);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur + rel);
        osc.connect(gain);
        gain.connect(audioSfxGain);
        osc.start(now);
        osc.stop(now + dur + rel + 0.02);
    }

    function startBattleMusic() {
        if (audioMuted || audioMusicTimer) return;
        const ctx = ensureAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
        const seq = audioTheme.seq;
        const bassSeq = audioTheme.bass || [];
        const stepMs = Math.max(360, Number(audioTheme.stepMs) || 640);
        const accentEvery = Math.max(1, Number(audioTheme.accentEvery) || 2);
        const leadType = audioTheme.leadType || 'sine';
        const bassType = audioTheme.bassType || 'triangle';
        audioMusicStep = 0;
        const tick = () => {
            if (!G || !overlay || overlay.style.display === 'none' || audioMuted) return;
            const n = seq[audioMusicStep % seq.length];
            const b = bassSeq.length ? bassSeq[audioMusicStep % bassSeq.length] : (n * 0.5);
            playTone(n, 320, { type: leadType, volume: 0.085 });
            playTone(b, 420, { type: bassType, volume: 0.056, delay: 0.02 });
            if (audioMusicStep % accentEvery === accentEvery - 1) {
                playTone(n * 1.5, 180, { type: 'triangle', volume: 0.038, delay: 0.07 });
            }
            audioMusicStep++;
        };
        tick();
        audioMusicTimer = setInterval(tick, stepMs);
    }

    function getThemeByFaction(factionId, enemyFactionId) {
        const id = String(factionId || '').toLowerCase();
        const enemyId = String(enemyFactionId || '').toLowerCase();
        if (id === 'cn') {
            return {
                name: 'cn',
                seq: [196, 220, 247, 294, 247, 220, 196, 174],
                bass: [98, 98, 110, 87],
                stepMs: 620,
                accentEvery: 2,
                leadType: 'triangle',
                bassType: 'sine'
            };
        }
        if (id === 'us') {
            return {
                name: 'us',
                seq: [220, 247, 277, 330, 277, 247, 220, 196],
                bass: [110, 123, 139, 123],
                stepMs: 560,
                accentEvery: 2,
                leadType: 'square',
                bassType: 'triangle'
            };
        }
        if (id === 'ru') {
            return {
                name: 'ru',
                seq: [174, 196, 220, 196, 233, 220, 196, 164],
                bass: [87, 98, 87, 82],
                stepMs: 680,
                accentEvery: 3,
                leadType: 'sawtooth',
                bassType: 'triangle'
            };
        }
        if (id === 'eu') {
            return {
                name: 'eu',
                seq: [196, 247, 294, 330, 294, 247, 220, 196],
                bass: [98, 110, 123, 110],
                stepMs: 640,
                accentEvery: 2,
                leadType: 'sine',
                bassType: 'triangle'
            };
        }
        // Minor/neutral factions reuse a lighter adaptive theme based on enemy.
        const tension = (enemyId === 'none' || !enemyId) ? 0 : 1;
        return {
            name: 'minor',
            seq: tension ? [196, 220, 247, 262, 247, 220, 196, 174] : [196, 220, 247, 220, 247, 220, 196, 174],
            bass: [98, 98, 110, 98],
            stepMs: 640,
            accentEvery: 2,
            leadType: 'triangle',
            bassType: 'sine'
        };
    }

    function stopBattleMusic() {
        if (audioMusicTimer) {
            clearInterval(audioMusicTimer);
            audioMusicTimer = null;
        }
    }

    function playSfxCard(card) {
        if (!card) return;
        if (card.type === 'spell') {
            playTone(520, 110, { type: 'triangle', volume: 0.13 });
            playTone(760, 90, { type: 'sine', volume: 0.08, delay: 0.05 });
        } else {
            playTone(280, 90, { type: 'square', volume: 0.14 });
            playTone(200, 120, { type: 'triangle', volume: 0.09, delay: 0.03 });
        }
    }

    function playSfxAttack() {
        playTone(210, 80, { type: 'sawtooth', volume: 0.13 });
        playTone(130, 120, { type: 'triangle', volume: 0.11, delay: 0.03 });
    }

    function playSfxHeroPower() {
        playTone(420, 130, { type: 'triangle', volume: 0.12 });
        playTone(630, 160, { type: 'sine', volume: 0.08, delay: 0.04 });
    }

    function playSfxTurnEnd() {
        playTone(300, 80, { type: 'triangle', volume: 0.08 });
        playTone(240, 120, { type: 'sine', volume: 0.06, delay: 0.05 });
    }

    function playSfxResult(victory) {
        if (victory) {
            playTone(392, 140, { type: 'triangle', volume: 0.14 });
            playTone(523, 170, { type: 'triangle', volume: 0.12, delay: 0.1 });
            playTone(659, 220, { type: 'sine', volume: 0.11, delay: 0.2 });
        } else {
            playTone(220, 180, { type: 'sawtooth', volume: 0.12 });
            playTone(164, 220, { type: 'triangle', volume: 0.11, delay: 0.12 });
        }
    }

    function updateSoundButton() {
        if (!overlay) return;
        const btn = overlay.querySelector('#cbSound');
        if (!btn) return;
        btn.textContent = audioMuted ? '🔇 静音' : '🔊 声音';
        btn.title = audioMuted ? '点击开启音乐和音效' : '点击静音';
    }

    function log(msg) {
        if (!G) return;
        G.log.unshift(msg);
        if (G.log.length > 40) G.log.pop();
    }

    function makeCard(id) {
        const t = CARDS[id];
        if (!t) return null;
        return { ...t, cardId: id, uid: uid() };
    }

    function makeMinion(cardId, isPlayer) {
        const t = CARDS[cardId];
        if (!t || t.type !== 'minion') return null;
        const ab = t.ability || '';
        return {
            uid: uid(), cardId, name: t.name, icon: t.icon || '🪖',
            isPlayer, atk: t.atk, hp: t.hp, maxHp: t.hp,
            taunt: ab.includes('taunt'), stealth: ab.includes('stealth'),
            silenced: false, frozen: false,
            canAttack: ab.includes('rush'), hasAttacked: false,
            justPlayed: !ab.includes('rush'),
            fxSpawnUntil: 0
        };
    }

    function makeTempMinion(atk, hp, isPlayer, icon) {
        return {
            uid: uid(), cardId: 'militia', name: (atk + '/' + hp + '随从'), icon: icon || '👤',
            isPlayer, atk, hp, maxHp: hp,
            taunt: false, stealth: false, silenced: false, frozen: false,
            canAttack: false, hasAttacked: false, justPlayed: true, fxSpawnUntil: 0
        };
    }

    function getCardPhotoUrl(card) {
        if (!card) return '';
        const id = String(card.cardId || '').toLowerCase();
        const map = {
            airstrike: 'https://picsum.photos/seed/cb-airstrike/360/220',
            nuclear_deterrent: 'https://picsum.photos/seed/cb-nuclear/360/220',
            naval_fleet: 'https://picsum.photos/seed/cb-fleet/360/220',
            strategic_bomber: 'https://picsum.photos/seed/cb-bomber/360/220',
            recon_satellite: 'https://picsum.photos/seed/cb-satellite/360/220',
            cyber_attack: 'https://picsum.photos/seed/cb-cyber/360/220',
            propaganda: 'https://picsum.photos/seed/cb-propaganda/360/220',
            missile_defense: 'https://picsum.photos/seed/cb-defense/360/220',
            economic_sanctions: 'https://picsum.photos/seed/cb-economy/360/220',
            reinforcements: 'https://picsum.photos/seed/cb-reinforce/360/220',
            people_uprising: 'https://picsum.photos/seed/cb-uprising/360/220',
            armored_div: 'img/car.png',
            heavy_tank: 'img/tank.png',
            artillery: 'https://picsum.photos/seed/cb-artillery/360/220',
            special_forces: 'https://picsum.photos/seed/cb-forces/360/220',
            infantry: 'img/soldier.png',
            drone: 'https://picsum.photos/seed/cb-drone/360/220'
        };
        map.naval_fleet = 'img/ship.png';
        if (map[id]) return map[id];
        if (card.type === 'spell') return 'https://picsum.photos/seed/cb-spell/360/220';
        return 'https://picsum.photos/seed/cb-minion/360/220';
    }

    function playCardCastEffect(card, sourceEl, isMinion) {
        if (!overlay) return;
        const handEl = overlay.querySelector('#cbHand');
        const playerFieldEl = overlay.querySelector('#cbPlayerField');
        if (!handEl || !playerFieldEl) return;

        const srcRect = sourceEl ? sourceEl.getBoundingClientRect() : handEl.getBoundingClientRect();
        const dstRect = (isMinion ? playerFieldEl : overlay.querySelector('#cbCenter')).getBoundingClientRect();

        const startX = srcRect.left + srcRect.width * 0.5;
        const startY = srcRect.top + srcRect.height * 0.52;
        const endX = dstRect.left + dstRect.width * 0.5;
        const endY = dstRect.top + dstRect.height * (isMinion ? 0.6 : 0.5);
        const dx = endX - startX;
        const dy = endY - startY;

        const fly = document.createElement('div');
        fly.className = 'cb-cast-card' + (isMinion ? '' : ' spell');
        fly.id = nextVfxId();
        fly.style.left = Math.round(startX - 42) + 'px';
        fly.style.top = Math.round(startY - 56) + 'px';
        fly.style.setProperty('--cb-dx', Math.round(dx) + 'px');
        fly.style.setProperty('--cb-dy', Math.round(dy) + 'px');
        fly.innerHTML = `<div class="cb-cast-card-inner">${card.icon || '❖'}</div>`;

        const impact = document.createElement('div');
        impact.className = 'cb-cast-impact' + (isMinion ? '' : ' spell');
        impact.style.left = Math.round(endX) + 'px';
        impact.style.top = Math.round(endY) + 'px';

        overlay.appendChild(fly);
        overlay.appendChild(impact);

        setTimeout(() => { if (fly.parentNode) fly.parentNode.removeChild(fly); }, 520);
        setTimeout(() => { if (impact.parentNode) impact.parentNode.removeChild(impact); }, 480);
    }

    function shuffled(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function drawCard(side, n) {
        n = n || 1;
        for (let i = 0; i < n; i++) {
            if (side.hand.length >= 10) {
                side.fatigue++;
                side.hero.hp -= side.fatigue;
                log(`💀 ${side.hero.name} 疲劳 -${side.fatigue}!`);
            } else if (side.deck.length === 0) {
                side.fatigue++;
                side.hero.hp -= side.fatigue;
                log(`📭 ${side.hero.name} 牌库已空，疲劳 -${side.fatigue}!`);
            } else {
                side.hand.push(side.deck.shift());
            }
        }
    }

    function initSide(cfg, deckIds, isPlayer) {
        return {
            hero: { name: cfg.heroName, hp: cfg.heroHp, maxHp: cfg.heroHp, armor: 0, isPlayer },
            deck: shuffled(deckIds.map(id => makeCard(id)).filter(Boolean)),
            hand: [], field: [],
            mana: { cur: 0, max: 0 },
            heroPowerUsed: false,
            fatigue: 0,
            cfg
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  DAMAGE / EFFECTS
    // ═══════════════════════════════════════════════════════════
    function dmgHero(side, d) {
        d = Math.max(0, d);
        if (side.hero.armor >= d) { side.hero.armor -= d; }
        else { side.hero.hp -= (d - side.hero.armor); side.hero.armor = 0; }
    }

    function dmgMinion(m, d) { m.hp -= Math.max(0, d); }

    function sweep() {
        if (!G) return;
        G.player.field = G.player.field.filter(m => m.hp > 0);
        G.enemy.field  = G.enemy.field.filter(m => m.hp > 0);
    }

    function checkOver() {
        if (!G) return false;
        if (G.gameOver) return true;
        if (G.player.hero.hp <= 0 || G.enemy.hero.hp <= 0) {
            G.gameOver = true;
            G.winner = G.enemy.hero.hp <= 0 ? 'player' : 'enemy';
            return true;
        }
        return false;
    }

    function applyEffect(effect, value, targetUid, isPlayer) {
        const caster  = isPlayer ? G.player : G.enemy;
        const foe     = isPlayer ? G.enemy  : G.player;
        const allMin  = [...G.player.field, ...G.enemy.field];

        switch (effect) {
            case 'draw1': drawCard(caster, 1); log(`📥 ${caster.hero.name} 摸1张牌`); break;
            case 'draw2': drawCard(caster, 2); log(`📥 ${caster.hero.name} 摸2张牌`); break;

            case 'damage_target': {
                const hit = allMin.find(m => m.uid === targetUid);
                if (hit) { dmgMinion(hit, value); log(`💥 法术对 ${hit.name} 造成 ${value} 伤害`); }
                else if (targetUid === 'foe_hero') { dmgHero(foe, value); log(`💥 法术对 ${foe.hero.name} 造成 ${value} 伤害`); }
                break;
            }

            case 'silence_target': {
                const hit = foe.field.find(m => m.uid === targetUid);
                if (hit) { hit.silenced = true; hit.taunt = false; hit.stealth = false; log(`🔇 ${hit.name} 被沉默`); }
                break;
            }

            case 'gain_armor': caster.hero.armor += (value || 0); log(`🛡️ ${caster.hero.name} 获得 ${value} 护甲`); break;
            case 'damage_hero': dmgHero(foe, value); log(`💥 ${foe.hero.name} 受到 ${value} 法术伤害`); break;

            case 'aoe_damage':
                foe.field.forEach(m => dmgMinion(m, value));
                log(`☢️ AOE: 所有敌方随从受到 ${value} 伤害`);
                break;

            case 'summon_2_2_x2':
                for (let i = 0; i < 2 && caster.field.length < 7; i++) {
                    caster.field.push(makeTempMinion(2, 2, isPlayer, '🪖'));
                }
                log(`🏭 召唤2个 2/2 步兵`);
                break;

            default: break;
        }
        sweep(); checkOver();
    }

    function applyHeroPower(effect, targetUid, isPlayer) {
        const caster = isPlayer ? G.player : G.enemy;
        const foe    = isPlayer ? G.enemy  : G.player;
        const allMin = [...G.player.field, ...G.enemy.field];

        switch (effect) {
            case 'damage_target_1': case 'damage_target_2': {
                const d = effect.endsWith('1') ? 1 : 2;
                const hit = allMin.find(m => m.uid === targetUid);
                if (hit) { dmgMinion(hit, d); log(`⚡ 英雄技能对 ${hit.name} 造成 ${d} 伤害`); }
                else if (targetUid === 'foe_hero') { dmgHero(foe, d); log(`⚡ 英雄技能对 ${foe.hero.name} 造成 ${d} 伤害`); }
                sweep(); checkOver(); break;
            }
            case 'summon_1_1': { if (caster.field.length < 7) { caster.field.push(makeTempMinion(1,1,isPlayer,'👤')); log('英雄技能: 召唤1/1随从'); } break; }
            case 'summon_2_1': { if (caster.field.length < 7) { caster.field.push(makeTempMinion(2,1,isPlayer,'🔴')); log('英雄技能: 召唤2/1随从'); } break; }
            case 'summon_1_2': { if (caster.field.length < 7) { caster.field.push(makeTempMinion(1,2,isPlayer,'🟢')); log('英雄技能: 召唤1/2随从'); } break; }
            case 'summon_2_2': { if (caster.field.length < 7) { caster.field.push(makeTempMinion(2,2,isPlayer,'🪖')); log('英雄技能: 召唤2/2随从'); } break; }
            case 'draw1': drawCard(caster,1); log('英雄技能: 摸1张牌'); break;
            case 'buff_hp_2': case 'buff_hp_3': {
                const b = effect.endsWith('2') ? 2 : 3;
                const hit = caster.field.find(m => m.uid === targetUid);
                if (hit) { hit.hp += b; hit.maxHp += b; log(`英雄技能: ${hit.name} +${b}生命`); }
                break;
            }
            case 'gain_armor_3': caster.hero.armor += 3; log('英雄技能: +3护甲'); break;
            case 'gain_armor_5': caster.hero.armor += 5; log('英雄技能: +5护甲'); break;
            case 'gain_mana_1_temp': caster.mana.cur = Math.min(caster.mana.max + 1, caster.mana.cur + 1); log('英雄技能: +1临时民心'); break;
            case 'buff_target_1_1': {
                const hit = caster.field.find(m => m.uid === targetUid);
                if (hit) { hit.atk++; hit.hp++; hit.maxHp++; log(`英雄技能: ${hit.name} +1/+1`); }
                break;
            }
            default: break;
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  PLAYER ACTIONS
    // ═══════════════════════════════════════════════════════════
    function canPlayCard(card) {
        if (!G || G.turn !== 'player') return false;
        if (G.player.mana.cur < card.cost) return false;
        if (card.type === 'minion' && G.player.field.length >= 7) return false;
        return true;
    }

    function playCard(idx) {
        if (!G || G.turn !== 'player' || G.gameOver) return;
        if (idx < 0 || idx >= G.player.hand.length) return;
        const card = G.player.hand[idx];
        if (!canPlayCard(card)) {
            if (G.player.mana.cur < card.cost) log('❌ 民心值不足！');
            else log('❌ 战场已满（最多7个随从）');
            return;
        }
        if (card.type === 'spell' && card.needsTarget) {
            selectedHandIdx = idx;
            pendingSpell = { idx, card };
            log(`🎯 请选择目标以施放《${card.name}》`);
            renderAll();
            return;
        }
        commitPlayCard(idx, null);
    }

    function commitPlayCard(idx, targetUid) {
        const card = G.player.hand[idx];
        const handCards = overlay ? overlay.querySelectorAll('#cbHand .cb-card') : null;
        const sourceEl = handCards && handCards[idx] ? handCards[idx] : null;
        playCardCastEffect(card, sourceEl, card.type === 'minion');
        playSfxCard(card);
        G.player.mana.cur -= card.cost;
        G.player.hand.splice(idx, 1);
        if (card.type === 'minion') {
            const m = makeMinion(card.cardId, true);
            m.fxSpawnUntil = performance.now() + 380;
            G.player.field.push(m);
            log(`▶ 出牌：《${card.name}》`);
            if (card.ability === 'battlecry_buff_all') {
                G.player.field.forEach(m2 => { if (m2 !== m) { m2.atk++; m2.hp++; m2.maxHp++; } });
                log(`⭐ ${card.name} 战吼！所有友方随从+1/+1`);
            }
        } else {
            applyEffect(card.effect, card.value || 0, targetUid, true);
            log(`✨ 施放：《${card.name}》`);
        }
        selectedHandIdx = null;
        pendingSpell = null;
        sweep(); checkOver(); renderAll();
        if (G.gameOver) setTimeout(showResult, 400);
    }

    function resolveSpellTarget(targetUid) {
        if (!G || !pendingSpell) return;
        const { idx } = pendingSpell;
        commitPlayCard(idx, targetUid);
    }

    function selectMinion(mUid) {
        if (!G || G.turn !== 'player' || G.gameOver) return;
        if (pendingSpell || heroPowerNeedsTarget) {
            // clicking own minion while targeting: cancel
            cancelTargeting();
            return;
        }
        const m = G.player.field.find(x => x.uid === mUid);
        if (!m) return;
        if (selectedMinionUid === mUid) { selectedMinionUid = null; }
        else { selectedMinionUid = mUid; }
        renderAll();
    }

    function attackTarget(targetUid) {
        if (!G || G.turn !== 'player' || G.gameOver) return;

        if (pendingSpell) { resolveSpellTarget(targetUid); return; }
        if (heroPowerNeedsTarget) { resolveHeroPowerTarget(targetUid); return; }

        if (!selectedMinionUid) return;
        const atk = G.player.field.find(m => m.uid === selectedMinionUid);
        if (!atk || !atk.canAttack || atk.hasAttacked || atk.frozen) {
            log('❌ 该随从无法攻击'); return;
        }
        const hasTauntEnemies = G.enemy.field.some(m => m.taunt && !m.stealth);
        if (targetUid === 'foe_hero') {
            if (hasTauntEnemies) { log('❌ 必须先攻击嘲讽随从！'); return; }
            atk.stealth = false; atk.hasAttacked = true; atk.canAttack = false;
            dmgHero(G.enemy, atk.atk);
            log(`⚔️ ${atk.name} 攻击 ${G.enemy.hero.name} 造成 ${atk.atk} 伤害`);
            playSfxAttack();
        } else {
            const def = G.enemy.field.find(m => m.uid === targetUid);
            if (!def) return;
            if (def.stealth) { log('❌ 无法攻击隐身随从！'); return; }
            if (hasTauntEnemies && !def.taunt) { log('❌ 必须先攻击嘲讽随从！'); return; }
            atk.stealth = false; atk.hasAttacked = true; atk.canAttack = false;
            dmgMinion(def, atk.atk);
            dmgMinion(atk, def.atk);
            log(`⚔️ ${atk.name}(${atk.atk}/${atk.hp}) vs ${def.name}(${def.atk}/${def.hp})`);
            playSfxAttack();
        }
        selectedMinionUid = null;
        sweep(); checkOver(); renderAll();
        if (G.gameOver) setTimeout(showResult, 400);
    }

    function useHeroPower() {
        if (!G || G.turn !== 'player' || G.gameOver) return;
        if (G.player.heroPowerUsed) { log('❌ 英雄技能本回合已使用'); return; }
        const cfg = G.player.cfg;
        if (G.player.mana.cur < cfg.heroPowerCost) { log('❌ 民心值不足'); return; }
        const needsTarget = ['damage_target_1','damage_target_2','buff_hp_2','buff_hp_3','buff_target_1_1'].includes(cfg.heroPowerEffect);
        if (needsTarget) {
            heroPowerNeedsTarget = true;
            log(`🎯 英雄技能《${cfg.heroPowerName}》—请选择目标`);
            renderAll(); return;
        }
        G.player.mana.cur -= cfg.heroPowerCost;
        G.player.heroPowerUsed = true;
        applyHeroPower(cfg.heroPowerEffect, null, true);
        playSfxHeroPower();
        sweep(); checkOver(); renderAll();
        if (G.gameOver) setTimeout(showResult, 400);
    }

    function resolveHeroPowerTarget(targetUid) {
        if (!G || !heroPowerNeedsTarget) return;
        const cfg = G.player.cfg;
        G.player.mana.cur -= cfg.heroPowerCost;
        G.player.heroPowerUsed = true;
        heroPowerNeedsTarget = false;
        applyHeroPower(cfg.heroPowerEffect, targetUid, true);
        playSfxHeroPower();
        sweep(); checkOver(); renderAll();
        if (G.gameOver) setTimeout(showResult, 400);
    }

    function cancelTargeting() {
        selectedHandIdx = null;
        pendingSpell = null;
        heroPowerNeedsTarget = false;
        renderAll();
    }

    function endTurn() {
        if (!G || G.turn !== 'player' || G.gameOver) return;
        G.turn = 'enemy';
        selectedHandIdx = null; selectedMinionUid = null;
        pendingSpell = null; heroPowerNeedsTarget = false;
        log('── 玩家结束回合，AI行动中... ──');
        playSfxTurnEnd();
        renderAll();
        aiTimer = setTimeout(runAI, 900);
    }

    // ═══════════════════════════════════════════════════════════
    //  AI LOGIC
    // ═══════════════════════════════════════════════════════════
    function runAI() {
        if (!G) return;
        G.turnNumber++;
        const e = G.enemy;
        e.mana.max = Math.min(10, e.mana.max + 1);
        e.mana.cur = e.mana.max;
        e.heroPowerUsed = false;
        e.field.forEach(m => { m.justPlayed = false; m.canAttack = true; m.hasAttacked = false; });
        drawCard(e, 1);
        if (checkOver()) { renderAll(); showResult(); return; }

        aiPlayCards();
        if (checkOver()) { renderAll(); showResult(); return; }

        aiAttacks();
        if (checkOver()) { renderAll(); showResult(); return; }

        aiHeroPower();
        if (checkOver()) { renderAll(); showResult(); return; }

        renderAll();
        aiTimer = setTimeout(startPlayerTurn, 1100);
    }

    function aiPlayCards() {
        const e = G.enemy;
        const sortedHand = [...e.hand].sort((a, b) => b.cost - a.cost);
        let plays = 0;
        for (const card of sortedHand) {
            if (plays >= 4) break;
            if (card.cost > e.mana.cur) continue;
            if (card.type === 'minion' && e.field.length >= 7) continue;
            const idx = e.hand.findIndex(c => c.uid === card.uid);
            if (idx < 0) continue;
            e.mana.cur -= card.cost;
            e.hand.splice(idx, 1);
            if (card.type === 'minion') {
                const m = makeMinion(card.cardId, false);
                e.field.push(m);
                log(`🤖 敌方出牌：《${card.name}》`);
                if (card.ability === 'battlecry_buff_all') {
                    e.field.forEach(m2 => { if (m2 !== m) { m2.atk++; m2.hp++; m2.maxHp++; } });
                }
            } else {
                aiSpell(card);
            }
            plays++;
            sweep();
            if (checkOver()) return;
        }
    }

    function aiSpell(card) {
        log(`🤖 敌方施放：《${card.name}》`);
        const p = G.player;
        switch (card.effect) {
            case 'draw1': drawCard(G.enemy, 1); break;
            case 'draw2': drawCard(G.enemy, 2); break;
            case 'damage_target': {
                const d = card.value || 0;
                const killable = p.field.filter(m => m.hp <= d && !m.stealth);
                if (killable.length) { dmgMinion(killable[0], d); }
                else { dmgHero(p, d); }
                break;
            }
            case 'aoe_damage': p.field.forEach(m => dmgMinion(m, card.value || 0)); break;
            case 'gain_armor': G.enemy.hero.armor += (card.value || 0); break;
            case 'damage_hero': dmgHero(p, card.value || 0); break;
            case 'summon_2_2_x2':
                for (let i = 0; i < 2 && G.enemy.field.length < 7; i++)
                    G.enemy.field.push(makeTempMinion(2, 2, false, '🪖'));
                break;
            case 'silence_target':
                if (p.field.length) {
                    const t = p.field.reduce((b, m) => (!b || m.atk > b.atk) ? m : b, null);
                    if (t) { t.silenced = true; t.taunt = false; t.stealth = false; }
                }
                break;
            default: break;
        }
    }

    function aiAttacks() {
        const e = G.enemy;
        const p = G.player;
        const attackers = e.field.filter(m => m.canAttack && !m.hasAttacked && !m.frozen && m.atk > 0);
        for (const a of attackers) {
            a.stealth = false;
            const taunts = p.field.filter(m => m.taunt && !m.stealth);
            if (taunts.length) {
                const t = taunts[Math.floor(Math.random() * taunts.length)];
                dmgMinion(t, a.atk); dmgMinion(a, t.atk);
                log(`🤖 ${a.name} 攻击嘲讽随从 ${t.name}`);
            } else {
                const killable = p.field.filter(m => m.hp <= a.atk && !m.stealth);
                if (killable.length) {
                    const t = killable[0];
                    dmgMinion(t, a.atk); dmgMinion(a, t.atk);
                    log(`🤖 ${a.name} 消灭 ${t.name}`);
                } else {
                    const playerMinions = p.field.filter(m => !m.stealth);
                    if (playerMinions.length && Math.random() < 0.35) {
                        const t = playerMinions[Math.floor(Math.random() * playerMinions.length)];
                        dmgMinion(t, a.atk); dmgMinion(a, t.atk);
                        log(`🤖 ${a.name} 攻击 ${t.name}`);
                    } else {
                        dmgHero(p, a.atk);
                        log(`🤖 ${a.name} 攻击你的英雄造成 ${a.atk} 伤害`);
                    }
                }
            }
            a.hasAttacked = true; a.canAttack = false;
            sweep();
            if (checkOver()) return;
        }
    }

    function aiHeroPower() {
        const e = G.enemy;
        if (e.heroPowerUsed) return;
        const cfg = e.cfg;
        if (!cfg || e.mana.cur < cfg.heroPowerCost) return;
        e.mana.cur -= cfg.heroPowerCost;
        e.heroPowerUsed = true;
        const eff = cfg.heroPowerEffect || '';
        log(`🤖 敌方英雄技能：《${cfg.heroPowerName}》`);
        if (eff.startsWith('summon')) { applyHeroPower(eff, null, false); }
        else if (eff.startsWith('damage_target')) {
            const d = eff.endsWith('1') ? 1 : 2;
            const killable = G.player.field.find(m => m.hp <= d && !m.stealth);
            applyHeroPower(eff, killable ? killable.uid : 'foe_hero', false);
        } else if (eff.startsWith('gain_armor')) { applyHeroPower(eff, null, false); }
        else if (eff === 'draw1') { drawCard(e, 1); }
        else if (eff.startsWith('buff_hp')) {
            if (e.field.length) {
                const t = e.field.reduce((b, m) => (!b || m.atk > b.atk) ? m : b, null);
                if (t) applyHeroPower(eff, t.uid, false);
            }
        } else if (eff === 'buff_target_1_1') {
            if (e.field.length) {
                const t = e.field.reduce((b, m) => (!b || m.atk > b.atk) ? m : b, null);
                if (t) applyHeroPower(eff, t.uid, false);
            }
        } else { applyHeroPower(eff, null, false); }
        sweep(); checkOver();
    }

    function startPlayerTurn() {
        if (!G) return;
        G.turnNumber++;
        const p = G.player;
        p.mana.max = Math.min(10, p.mana.max + 1);
        p.mana.cur = p.mana.max;
        p.heroPowerUsed = false;
        p.field.forEach(m => { m.justPlayed = false; m.canAttack = true; m.hasAttacked = false; });
        drawCard(p, 1);
        G.turn = 'player';
        log(`── 你的回合 ${G.turnNumber >> 1} (民心值 ${p.mana.cur}/${p.mana.max}) ──`);
        if (checkOver()) { renderAll(); showResult(); return; }
        renderAll();
    }

    // ═══════════════════════════════════════════════════════════
    //  UI RENDERING
    // ═══════════════════════════════════════════════════════════
    function createOverlay() {
        const el = document.createElement('div');
        el.id = 'cbOverlay';
        el.innerHTML = `
<style>
#cbOverlay {
  position:fixed; inset:0; z-index:6000;
    display:none;
    flex-direction:column;
    align-items:stretch;
    justify-content:flex-start;
    background-color:#020507;
    background-image:
        radial-gradient(circle at 18% 22%, rgba(0, 243, 255, 0.12), transparent 36%),
        radial-gradient(circle at 82% 76%, rgba(0, 200, 255, 0.08), transparent 42%),
        url('https://www.transparenttextures.com/patterns/stardust.png'),
        radial-gradient(circle at 50% 46%, #0f1a26 0%, #071019 48%, #020507 100%);
    font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
  overflow:hidden; user-select:none;
}
#cbOverlay::before {
  content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
    background: repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,243,255,0.03) 4px, rgba(0,243,255,0.03) 6px);
        animation: cbScanline 22s linear infinite;
}
@keyframes cbScanline { 0%{transform:translateY(0)} 100%{transform:translateY(72px)} }

#cbBoard {
    position:absolute;
    z-index:1;
    left:50%;
    top:8px;
    bottom:176px;
    transform:translateX(-50%);
    width:min(1240px, 96vw);
    height:auto;
    border:1px solid rgba(0,243,255,0.24);
    border-radius:18px;
    background:
        linear-gradient(180deg, rgba(6,10,16,0.78), rgba(3,7,12,0.88)),
        radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.05), transparent 60%);
    box-shadow: 0 22px 48px rgba(0,0,0,0.58), inset 0 0 0 1px rgba(255,255,255,0.04);
    display:grid;
    grid-template-rows: 86px 1fr 70px 1fr 86px;
    overflow:hidden;
}

#cbBoard::after {
    content:'';
    position:absolute; left:8%; right:8%; top:50%; height:2px;
    background:linear-gradient(90deg, transparent, rgba(0,243,255,0.32), transparent);
    transform:translateY(-50%);
    pointer-events:none;
}

#cbHandDock {
    position:absolute;
    z-index:2;
    left:50%;
    transform:translateX(-50%);
    bottom:max(0px, env(safe-area-inset-bottom));
    width:min(1240px, 96vw);
    height:168px;
    min-height:168px;
    max-height:168px;
    display:flex;
    align-items:flex-end;
    justify-content:center;
    padding:8px 0 10px;
    background:
        linear-gradient(180deg, rgba(3,8,13,0.25), rgba(2,5,8,0.92));
    border-top:1px solid rgba(0,243,255,0.22);
}

.cb-row { position:relative; z-index:1; display:flex; align-items:center; }

/* ─── Hero Bars ─── */
#cbEnemyHero {
    display:flex; align-items:center; gap:8px; padding:10px 16px;
    background:linear-gradient(180deg, rgba(60,12,12,0.55), rgba(35,8,8,0.36));
    border-bottom:1px solid rgba(239,68,68,0.25);
  min-height:52px; flex-shrink:0;
}
.cb-hero-portrait {
    width:46px; height:46px; border-radius:50%; border:2px solid rgba(255,255,255,0.3);
  display:flex; align-items:center; justify-content:center; font-size:1.3rem;
    background:linear-gradient(145deg, rgba(22,27,34,0.95), rgba(10,14,18,0.95));
    box-shadow:0 0 12px rgba(0,243,255,0.15);
    flex-shrink:0;
}
.cb-hero-side {
    display:flex;
    align-items:center;
    gap:8px;
    min-width:150px;
    flex-shrink:0;
}
.cb-flag-portrait {
    width:46px;
    height:46px;
    border-radius:50%;
    border:2px solid rgba(0,243,255,0.32);
    background:linear-gradient(145deg, rgba(12,18,24,0.95), rgba(6,10,14,0.95));
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:1.28rem;
    box-shadow:0 0 12px rgba(0,243,255,0.24);
    flex-shrink:0;
    overflow:hidden;
}
.cb-flag-img {
    width:100%;
    height:100%;
    object-fit:cover;
    border-radius:50%;
    display:block;
}
.cb-flag-portrait {
    width:46px;
    height:46px;
    border-radius:50%;
    border:2px solid rgba(0,243,255,0.32);
    background:linear-gradient(145deg, rgba(12,18,24,0.95), rgba(6,10,14,0.95));
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:1.28rem;
    box-shadow:0 0 12px rgba(0,243,255,0.24);
    flex-shrink:0;
}
.cb-hero-side {
    display:flex;
    align-items:center;
    gap:8px;
    flex-shrink:0;
}
.cb-hero-name { font-weight:700; font-size:0.85rem; color:#fca5a5; }
.cb-hero-hp-bar { flex:1; height:10px; background:rgba(0,0,0,0.5); border-radius:5px; overflow:hidden; min-width:80px; border:1px solid rgba(255,255,255,0.08); }
.cb-hero-hp-fill { height:100%; background:linear-gradient(90deg,#ef4444,#f97316); border-radius:5px; transition:width 0.4s ease; }
.cb-hero-stats { display:flex; align-items:center; gap:4px; font-size:0.8rem; white-space:nowrap; }
.cb-armor-badge {
  background:rgba(148,163,184,0.25); border:1px solid rgba(148,163,184,0.5);
  border-radius:4px; padding:1px 5px; color:#cbd5e1; font-size:0.72rem; font-weight:700;
}
.cb-mana-crystals { display:flex; gap:3px; align-items:center; }
.cb-crystal { width:12px; height:12px; border-radius:50%; border:1px solid rgba(255,255,255,0.4); }
.cb-crystal.full { background:radial-gradient(circle, #c084fc, #7c3aed); box-shadow:0 0 5px rgba(168,85,247,0.7); }
.cb-crystal.empty { background:rgba(30,20,60,0.7); }

/* ─── Field Lanes ─── */
#cbEnemyField {
    display:flex; align-items:center; justify-content:center; gap:8px;
    padding:10px 14px;
    border-bottom:1px dashed rgba(239,68,68,0.14);
    background:
        linear-gradient(180deg, rgba(45,6,8,0.22), rgba(8,14,24,0.12)),
        repeating-linear-gradient(90deg, transparent, transparent 58px, rgba(255,255,255,0.018) 58px, rgba(255,255,255,0.018) 59px),
        repeating-linear-gradient(0deg, transparent, transparent 58px, rgba(255,255,255,0.012) 58px, rgba(255,255,255,0.012) 59px);
    position:relative;
}

/* ─── Center Bar ─── */
#cbCenter {
    display:flex; align-items:center; gap:10px; padding:8px 12px;
    background:
        linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.78)),
        radial-gradient(circle at 50% 50%, rgba(0,243,255,0.1), transparent 68%);
    border-top:1px solid rgba(0,243,255,0.22);
    border-bottom:1px solid rgba(0,243,255,0.22);
    min-height:56px;
    box-shadow:0 0 18px rgba(0,243,255,0.05) inset;
}
#cbLog {
    flex:1; font-size:0.75rem; color:#b6c6d8; overflow:hidden;
    max-height:36px; line-height:1.35;
    letter-spacing:0.3px;
}
#cbEndTurn {
    border:1.5px solid rgba(52,211,153,0.7); background:linear-gradient(135deg, rgba(16,185,129,0.28), rgba(5,150,105,0.22));
  color:#6ee7b7; border-radius:6px; padding:5px 14px; font-family:inherit;
    font-size:0.80rem; font-weight:700; cursor:pointer; flex-shrink:0;
  transition:all 0.2s ease; backdrop-filter:blur(4px);
}
#cbEndTurn:hover:not(:disabled) { background:rgba(16,185,129,0.35); box-shadow:0 0 10px rgba(52,211,153,0.4); }
#cbEndTurn:disabled { opacity:0.4; cursor:not-allowed; }
#cbHeroPower {
    border:1.5px solid rgba(0,243,255,0.45); background:linear-gradient(135deg, rgba(12,22,34,0.88), rgba(8,14,22,0.84));
  color:#c4b5fd; border-radius:6px; padding:5px 10px; font-family:inherit;
  font-size:0.78rem; font-weight:700; cursor:pointer; flex-shrink:0;
  transition:all 0.2s ease; text-align:center;
}
#cbHeroPower:hover:not(:disabled) { box-shadow:0 0 14px rgba(0,243,255,0.35); transform:translateY(-1px); }
#cbHeroPower:disabled { opacity:0.4; cursor:not-allowed; }
.cb-enemy-power {
    border:1.2px solid rgba(251,191,36,0.45);
    background:rgba(30,20,8,0.55);
    color:#fcd34d;
    border-radius:6px;
    padding:3px 7px;
    font-size:0.66rem;
    font-weight:700;
    line-height:1.2;
    white-space:nowrap;
}
.cb-enemy-power {
    border:1.2px solid rgba(251,191,36,0.45);
    background:rgba(30,20,8,0.55);
    color:#fcd34d;
    border-radius:6px;
    padding:3px 7px;
    font-size:0.66rem;
    font-weight:700;
    line-height:1.2;
    white-space:nowrap;
}

/* ─── Player Field ─── */
#cbPlayerField {
    display:flex; align-items:center; justify-content:center; gap:8px;
    padding:10px 14px;
    background:
        linear-gradient(180deg, rgba(8,14,24,0.12), rgba(5,28,48,0.22)),
        repeating-linear-gradient(90deg, transparent, transparent 58px, rgba(255,255,255,0.018) 58px, rgba(255,255,255,0.018) 59px),
        repeating-linear-gradient(0deg, transparent, transparent 58px, rgba(255,255,255,0.012) 58px, rgba(255,255,255,0.012) 59px);
    position:relative;
}

/* ─── Player Hero Bar ─── */
#cbPlayerHero {
    display:flex; align-items:center; gap:8px; padding:10px 16px;
    background:linear-gradient(180deg, rgba(8,22,40,0.38), rgba(8,16,30,0.54));
    border-top:1px solid rgba(59,130,246,0.25);
  min-height:52px; flex-shrink:0;
}
#cbPlayerHero .cb-hero-hp-fill { background:linear-gradient(90deg,#3b82f6,#22d3ee); }
#cbPlayerHero .cb-hero-name { color:#93c5fd; }

.cb-player-mana-row { display:flex; align-items:center; gap:6px; margin-left:auto; }
.cb-mana-label { font-size:0.72rem; color:#c4b5fd; white-space:nowrap; }

/* ─── Hand ─── */
#cbHand {
    display:flex; align-items:flex-end; justify-content:center;
    gap:0; padding:4px 14px 0;
    width:min(1100px, 98vw);
    min-height:126px; max-height:188px;
    overflow-x:auto; overflow-y:visible;
    border-top:1px solid rgba(0,243,255,0.18);
    background:linear-gradient(180deg, rgba(5,8,12,0.2), rgba(2,5,8,0.65));
    border-radius:14px 14px 0 0;
}

/* ─── Cards ─── */
.cb-card {
  position:relative; flex-shrink:0;
  width:104px; min-height:154px;
  margin-left:-14px;
  background:linear-gradient(160deg, #131929 0%, #0a101e 50%, #060c18 100%);
  color:#dce8f5;
  clip-path:polygon(0 0, 85% 0, 100% 12%, 100% 100%, 0 100%);
  cursor:pointer;
  transition:transform 0.22s cubic-bezier(0.165,0.84,0.44,1), filter 0.22s ease, box-shadow 0.22s ease;
  display:flex; flex-direction:column; align-items:stretch;
  font-family:inherit;
  transform-origin:center bottom;
  border:1px solid rgba(0,243,255,0.28);
  border-top:2px solid #00f3ff;
  box-shadow:0 6px 22px rgba(0,0,0,0.65), inset 0 1px 0 rgba(0,243,255,0.14);
  overflow:hidden;
}
.cb-card::before {
  content:'';
  position:absolute; right:0; top:0; width:2px; height:38%;
  background:linear-gradient(180deg, #00f3ff, transparent);
  pointer-events:none; z-index:2;
}
.cb-card:hover { transform:translateY(-18px) rotate(0deg) scale(1.08) !important; z-index:30; box-shadow:0 14px 40px rgba(0,0,0,0.72), 0 0 22px rgba(0,243,255,0.22); }
.cb-card.selected { filter:drop-shadow(0 0 18px rgba(251,191,36,0.95)); transform:translateY(-22px) rotate(0deg) scale(1.12) !important; z-index:40; }
.cb-card.unaffordable { opacity:0.4; filter:grayscale(0.55); }
.cb-card.targeting { filter:drop-shadow(0 0 8px rgba(251,191,36,0.85)) brightness(0.82); }
.cb-card-cost {
  position:absolute; top:4px; left:4px; z-index:10;
  width:24px; height:24px;
  background:radial-gradient(circle at 40% 35%, #a855f7, #6d28d9 54%, #3b0764);
  border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-weight:900; font-size:0.86rem; color:#fff;
  box-shadow:0 0 10px rgba(168,85,247,0.75), 0 2px 6px rgba(0,0,0,0.5);
  border:1.5px solid rgba(216,180,254,0.55);
  text-shadow:0 1px 3px rgba(0,0,0,0.7);
}
.cb-card-art {
  width:100%; height:72px;
  display:flex; align-items:center; justify-content:center;
  position:relative; flex-shrink:0;
  background:linear-gradient(145deg, rgba(12,22,38,0.82), rgba(4,10,20,0.92));
  border-bottom:1px solid rgba(0,243,255,0.22);
  overflow:hidden;
}
.cb-card-photo {
    width:100%;
    height:100%;
    object-fit:cover;
    filter:saturate(1.05) contrast(1.08) brightness(0.88);
    display:block;
}
.cb-card-art::before {
  content:'';
  position:absolute; inset:0;
  background:radial-gradient(ellipse at 50% 65%, rgba(0,243,255,0.1), transparent 68%);
}
.cb-card-art::after {
  content:'';
  position:absolute; left:0; right:0; bottom:0; height:28%;
  background:linear-gradient(0deg, rgba(6,12,24,0.72), transparent);
  pointer-events:none;
}
.cb-card-art-icon {
    font-size:2.2rem; position:absolute; z-index:2;
  filter:drop-shadow(0 2px 8px rgba(0,0,0,0.85));
    display:none;
}
.cb-card-scanline {
  position:absolute; width:100%; height:2px;
  background:rgba(0,243,255,0.14); top:0;
    animation:none;
    opacity:0;
  pointer-events:none; z-index:3;
}
@keyframes cbCardScan { 0%{top:0} 100%{top:72px} }
.cb-card:hover .cb-card-scanline,
.cb-card.selected .cb-card-scanline {
    animation:cbCardScan 2.4s linear infinite;
    opacity:1;
}
.cb-card-body {
  flex:1; display:flex; flex-direction:column; align-items:center;
  padding:4px 5px 3px; position:relative; z-index:1; min-height:0;
  background:linear-gradient(180deg, transparent, rgba(0,0,0,0.16));
}
.cb-card-name { font-size:0.64rem; font-weight:700; text-align:center; line-height:1.2; margin-bottom:2px; letter-spacing:0.3px; color:#e2eaf8; text-shadow:0 1px 4px rgba(0,0,0,0.9); width:100%; }
.cb-card-desc { font-size:0.52rem; color:#8ba3b8; text-align:center; line-height:1.26; flex:1; width:100%; }
.cb-card-stats { display:flex; justify-content:space-between; width:100%; margin-top:auto; padding-top:3px; }
.cb-card-atk { background:rgba(249,115,22,0.22); border:1px solid rgba(249,115,22,0.5); border-radius:4px; padding:1px 5px; font-size:0.76rem; font-weight:900; color:#fb923c; }
.cb-card-hp  { background:rgba(239,68,68,0.22); border:1px solid rgba(239,68,68,0.5); border-radius:4px; padding:1px 5px; font-size:0.76rem; font-weight:900; color:#f87171; }

/* ─── Minion on Field ─── */
.cb-minion {
  position:relative; flex-shrink:0;
  width:92px; height:118px;
  background:linear-gradient(160deg, #111825 0%, #0a1018 60%, #060c14 100%);
  clip-path:polygon(0 0, 85% 0, 100% 12%, 100% 100%, 0 100%);
  display:flex; flex-direction:column; align-items:stretch; justify-content:flex-start;
  cursor:pointer;
  transition:transform 0.16s cubic-bezier(0.165,0.84,0.44,1), filter 0.16s ease, box-shadow 0.16s ease;
  font-family:inherit;
  border:1px solid rgba(0,243,255,0.28);
  border-top:1.5px solid rgba(0,243,255,0.65);
  box-shadow:0 4px 16px rgba(0,0,0,0.55);
  overflow:hidden;
}
.cb-minion:hover { transform:scale(1.09) translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.65); }
.cb-minion.selected  { filter:drop-shadow(0 0 12px rgba(251,191,36,1)); transform:scale(1.12) translateY(-3px); }
.cb-minion.can-attack{ border-top-color:rgba(52,211,153,0.9); filter:drop-shadow(0 0 8px rgba(52,211,153,0.65)); }
.cb-minion.used      { opacity:0.52; filter:grayscale(0.3); }
.cb-minion.taunt-badge::after {
  content:'嘲讽'; position:absolute; bottom:0; left:50%; transform:translateX(-50%);
  font-size:0.48rem; background:rgba(251,191,36,0.18); color:#fbbf24;
  border:1px solid rgba(251,191,36,0.45); border-radius:3px; padding:0 3px; white-space:nowrap;
}
.cb-minion.stealth-badge { opacity:0.6; filter:brightness(0.7) drop-shadow(0 0 6px rgba(168,85,247,0.65)); }
.cb-minion.enemy-target:hover { filter:drop-shadow(0 0 12px rgba(239,68,68,0.95)); border-top-color:rgba(239,68,68,0.8); }
.cb-minion-art {
  width:100%; height:58px;
  display:flex; align-items:center; justify-content:center;
  position:relative; flex-shrink:0;
  background:linear-gradient(145deg, rgba(10,18,32,0.75), rgba(4,10,20,0.88));
  border-bottom:1px solid rgba(0,243,255,0.16);
  overflow:hidden;
}
.cb-minion-art::before {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse at 50% 70%, rgba(0,243,255,0.08), transparent 65%);
}
.cb-minion-art-icon { font-size:1.75rem; position:relative; z-index:1; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.85)); }
.cb-minion-photo { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0; opacity:0.92; filter:saturate(1.05) contrast(1.08) brightness(0.82); }
.cb-minion-photo + .cb-minion-art-icon { display:none; }
.cb-minion-body {
  flex:1; display:flex; flex-direction:column; align-items:center;
  padding:3px 4px 0; gap:2px;
}
.cb-minion-name { font-size:0.56rem; font-weight:700; text-align:center; color:#e2eaf8; line-height:1.2; width:100%; }
.cb-minion-badges { display:flex; gap:2px; flex-wrap:wrap; justify-content:center; min-height:10px; }
.cb-badge { font-size:0.46rem; padding:1px 3px; border-radius:3px; }
.cb-badge-taunt  { background:rgba(251,191,36,0.22); color:#fbbf24; border:1px solid rgba(251,191,36,0.5); }
.cb-badge-stealth{ background:rgba(168,85,247,0.22); color:#c4b5fd; border:1px solid rgba(168,85,247,0.5); }
.cb-badge-rush   { background:rgba(52,211,153,0.22); color:#6ee7b7; border:1px solid rgba(52,211,153,0.5); }
.cb-badge-frozen { background:rgba(96,165,250,0.22); color:#93c5fd; border:1px solid rgba(96,165,250,0.5); }
.cb-minion-footer {
  display:flex; justify-content:space-between; align-items:center;
  padding:2px 5px 4px; width:100%; margin-top:auto;
}
.cb-m-atk { font-size:0.8rem; font-weight:900; color:#fb923c; background:rgba(249,115,22,0.2); border:1px solid rgba(249,115,22,0.4); border-radius:4px; padding:0 5px; }
.cb-m-hp  { font-size:0.8rem; font-weight:900; color:#f87171; background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.4); border-radius:4px; padding:0 5px; }
.cb-m-hp.good  { color:#4ade80; background:rgba(74,222,128,0.2); border-color:rgba(74,222,128,0.4); }
.cb-m-hp.warn  { color:#fb923c; background:rgba(251,146,60,0.2); border-color:rgba(251,146,60,0.4); }
.cb-m-hp.crit  { color:#f87171; background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.4); }

/* ─── Status text ─── */
.cb-status-bar {
  text-align:center; font-size:0.72rem; color:#94a3b8; padding:2px 0;
  flex-shrink:0; position:relative; z-index:1;
}
.cb-targeting-hint {
  display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
    background:rgba(0,243,255,0.10); border:1.5px solid rgba(0,243,255,0.62);
  border-radius:10px; padding:8px 20px; color:#fbbf24; font-size:0.85rem; font-weight:700;
  z-index:6010; pointer-events:none; backdrop-filter:blur(8px);
  animation:cbPulse 1s ease-in-out infinite;
}
@keyframes cbPulse { 0%,100%{opacity:0.7;} 50%{opacity:1;} }

/* ─── Card Cast Effects ─── */
.cb-cast-card {
    position:fixed;
    width:84px;
    height:112px;
    border:1px solid rgba(0,243,255,0.45);
    border-top:2px solid #00f3ff;
    clip-path:polygon(0 0, 86% 0, 100% 12%, 100% 100%, 0 100%);
    background:linear-gradient(160deg, rgba(12,20,30,0.95), rgba(5,10,18,0.95));
    box-shadow:0 6px 20px rgba(0,0,0,0.6), 0 0 16px rgba(0,243,255,0.25);
    z-index:6200;
    pointer-events:none;
    animation:cbCastFly 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}
.cb-cast-card.spell {
    border-color:rgba(168,85,247,0.56);
    border-top-color:#a855f7;
    box-shadow:0 8px 24px rgba(0,0,0,0.7), 0 0 16px rgba(168,85,247,0.32);
}
.cb-cast-card-inner {
    width:100%;
    height:100%;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:2rem;
    text-shadow:0 2px 10px rgba(0,0,0,0.8);
}
.cb-cast-impact {
    position:fixed;
    width:16px;
    height:16px;
    border-radius:50%;
    z-index:6199;
    pointer-events:none;
    transform:translate(-50%,-50%);
}
.cb-cast-impact::before,
.cb-cast-impact::after {
    content:'';
    position:absolute;
    left:50%;
    top:50%;
    border-radius:50%;
    border:2px solid rgba(0,243,255,0.6);
    transform:translate(-50%,-50%);
    animation:cbImpactRing 0.42s ease-out forwards;
}
.cb-cast-impact::after {
    animation-delay:0.08s;
    border-color:rgba(251,191,36,0.55);
}
.cb-cast-impact.spell::before,
.cb-cast-impact.spell::after {
    border-color:rgba(168,85,247,0.7);
}
@keyframes cbCastFly {
    0%   { transform:translate(0,0) rotate(0deg) scale(1); opacity:0.98; }
    60%  { transform:translate(calc(var(--cb-dx) * 0.7), calc(var(--cb-dy) * 0.7 - 18px)) rotate(8deg) scale(1.08); opacity:1; }
    100% { transform:translate(var(--cb-dx), var(--cb-dy)) rotate(0deg) scale(0.68); opacity:0; }
}
@keyframes cbImpactRing {
    0%   { width:10px; height:10px; opacity:0.85; }
    100% { width:96px; height:96px; opacity:0; }
}
@keyframes cbSummonPop {
    0% { transform:translateY(18px) scale(0.8); opacity:0; filter:brightness(1.35); }
    65% { transform:translateY(-4px) scale(1.08); opacity:1; filter:brightness(1.08); }
    100% { transform:translateY(0) scale(1); opacity:1; filter:brightness(1); }
}
.cb-minion.spawn-pop {
    animation:cbSummonPop 0.32s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* ─── Enemy hero clickable (for direct attacks) ─── */
.cb-hero-target { cursor:crosshair; }
.cb-hero-target:hover .cb-hero-portrait { box-shadow:0 0 12px rgba(239,68,68,0.8); }

/* ─── Result Screen ─── */
#cbResult {
  display:none; position:absolute; inset:0; z-index:6100;
  background:rgba(0,3,8,0.93);
  backdrop-filter:blur(4px);
  flex-direction:column;
  align-items:center; justify-content:center; gap:20px;
}
#cbResult.show { display:flex; animation:cbFadeIn 0.6s cubic-bezier(0.165,0.84,0.44,1); }
@keyframes cbFadeIn { 0%{opacity:0; transform:scale(0.88)} 100%{opacity:1; transform:scale(1)} }
.cb-result-title { font-size:3rem; font-weight:900; text-shadow:0 0 30px currentColor, 0 0 60px currentColor; letter-spacing:4px; text-transform:uppercase; }
.cb-result-sub { font-size:0.95rem; color:#94a3b8; text-align:center; max-width:360px; line-height:1.65; }
.cb-result-btn {
  border:none; border-radius:8px; padding:11px 36px;
  font-family:inherit; font-size:1rem; font-weight:700; cursor:pointer;
  transition:transform 0.2s ease, box-shadow 0.2s ease; letter-spacing:0.5px;
}
.cb-result-btn:hover { transform:scale(1.06); }
.cb-result-btn.continue { background:linear-gradient(135deg,#00d9ff,#a855f7); color:#fff; box-shadow:0 6px 24px rgba(0,217,255,0.3); }
.cb-result-btn.retreat  { background:rgba(239,68,68,0.15); color:#fca5a5; border:1.5px solid rgba(239,68,68,0.5); }

/* ─── Flee button ─── */
#cbFlee {
    position:absolute; top:10px; right:14px; z-index:6005;
  border:1px solid rgba(239,68,68,0.45); background:rgba(239,68,68,0.12);
  color:#fca5a5; border-radius:6px; padding:4px 10px;
  font-family:inherit; font-size:0.7rem; font-weight:700; cursor:pointer;
  transition:all 0.2s ease;
}
#cbFlee:hover { background:rgba(239,68,68,0.25); }

#cbSound {
        position:absolute; top:10px; right:92px; z-index:6005;
    border:1px solid rgba(96,165,250,0.45); background:rgba(59,130,246,0.14);
    color:#bfdbfe; border-radius:6px; padding:4px 10px;
    font-family:inherit; font-size:0.7rem; font-weight:700; cursor:pointer;
    transition:all 0.2s ease;
}
#cbSound:hover { background:rgba(59,130,246,0.26); }

/* ─── Turn indicator ─── */
#cbTurnBadge {
    position:absolute; top:10px; left:50%; transform:translateX(-50%);
  font-size:0.72rem; font-weight:700; padding:3px 12px; border-radius:12px;
  z-index:6005; white-space:nowrap;
}
#cbTurnBadge.player-turn { background:rgba(52,211,153,0.2); color:#6ee7b7; border:1px solid rgba(52,211,153,0.4); }
#cbTurnBadge.enemy-turn  { background:rgba(239,68,68,0.2);  color:#fca5a5; border:1px solid rgba(239,68,68,0.4); }

@media (max-width: 900px) {
    #cbBoard {
        top:6px;
        bottom:154px;
        transform:translateX(-50%);
        width:98vw;
        height:auto;
        grid-template-rows: 72px 1fr 60px 1fr 72px;
    }
    #cbHandDock { width:98vw; height:148px; min-height:148px; max-height:148px; }
    #cbHand { min-height:120px; }
    .cb-card { width:88px; min-height:130px; margin-left:-12px; }
    .cb-card-art { height:58px; }
    .cb-card-art-icon { font-size:1.85rem; }
    .cb-minion { width:80px; height:106px; }
    .cb-minion-art { height:50px; }
    .cb-minion-art-icon { font-size:1.5rem; }
    .cb-hero-portrait, .cb-flag-portrait { width:40px; height:40px; font-size:1.08rem; }
    .cb-hero-side { min-width:128px; }
}

@media (max-width: 560px) {
    #cbBoard {
        top:4px;
        bottom:136px;
        transform:translateX(-50%);
        width:99vw;
        height:auto;
        grid-template-rows: 62px 1fr 52px 1fr 62px;
        border-radius:12px;
    }
    #cbCenter { padding:6px 8px; gap:6px; }
    #cbLog { font-size:0.66rem; }
    #cbHeroPower, #cbEndTurn { font-size:0.68rem; padding:4px 8px; }
    #cbHandDock { width:99vw; min-height:132px; height:132px; max-height:132px; }
    #cbHand { padding-left:8px; padding-right:8px; min-height:106px; }
    .cb-card { width:76px; min-height:116px; margin-left:-10px; }
    .cb-card-art { height:50px; }
    .cb-card-art-icon { font-size:1.6rem; }
    .cb-card-name { font-size:0.58rem; }
    .cb-card-desc { font-size:0.50rem; }
    .cb-minion { width:70px; height:94px; }
    .cb-minion-art { height:44px; }
    .cb-minion-art-icon { font-size:1.35rem; }
    .cb-minion-name { font-size:0.52rem; }
    .cb-cast-card { width:66px; height:92px; }
}
</style>

<div id="cbTurnBadge" class="player-turn">你的回合</div>
<button id="cbFlee">撤退</button>
<button id="cbSound">🔊 声音</button>
<div class="cb-targeting-hint" id="cbTargetHint">🎯 请点击目标</div>

<div id="cbBoard">
    <div id="cbEnemyHero" class="cb-hero-target"></div>
    <div id="cbEnemyField"></div>
    <div id="cbCenter" class="cb-row">
        <div id="cbLog">准备开战...</div>
        <button id="cbEndTurn">结束回合</button>
    </div>
    <div id="cbPlayerField"></div>
    <div id="cbPlayerHero"></div>
</div>

<div id="cbHandDock">
    <div id="cbHand"></div>
</div>

<!-- Result overlay -->
<div id="cbResult"></div>
`;
        document.body.appendChild(el);

        el.querySelector('#cbFlee').addEventListener('click', () => fleeBattle());
        el.querySelector('#cbEndTurn').addEventListener('click', () => endTurn());
        el.querySelector('#cbSound').addEventListener('click', () => {
            audioMuted = !audioMuted;
            if (audioMuted) {
                stopBattleMusic();
            } else {
                resumeAudioContext();
                startBattleMusic();
                playTone(660, 70, { type: 'sine', volume: 0.08 });
            }
            updateSoundButton();
        });
        el.addEventListener('pointerdown', () => {
            resumeAudioContext();
        }, { passive: true });

        // Enemy hero click (direct attack or hero power target)
        el.querySelector('#cbEnemyHero').addEventListener('click', () => {
            if (pendingSpell || heroPowerNeedsTarget) { attackTarget('foe_hero'); }
            else if (selectedMinionUid) { attackTarget('foe_hero'); }
        });

        updateSoundButton();

        return el;
    }

    function renderAll() {
        if (!overlay || !G) return;
        renderEnemyHero();
        renderEnemyField();
        renderPlayerField();
        renderPlayerHero();
        renderCenter();
        renderHand();
        updateTargetHint();
        updateTurnBadge();
    }

    function manaBar(cur, max, isFull) {
        let html = '';
        for (let i = 0; i < 10; i++) {
            const fill = i < max ? (i < cur ? 'full' : 'empty') : '';
            if (!fill) continue;
            html += `<div class="cb-crystal ${fill}"></div>`;
        }
        return `<span class="cb-mana-label">${cur}/${max} 民心</span><div class="cb-mana-crystals">${html}</div>`;
    }

    function getFactionFlag(factionId) {
        const id = String(factionId || '').toLowerCase();
        const flags = {
            us: '🇺🇸',
            cn: '🇨🇳',
            ru: '🇷🇺',
            eu: '🇪🇺',
            in: '🇮🇳',
            jp: '🇯🇵',
            ir: '🇮🇷',
            tw: '🇹🇼',
            ve: '🇻🇪',
            ua: '🇺🇦',
            br: '🇧🇷',
            eg: '🇪🇬',
            sa: '🇸🇦',
            pa: '🇵🇦',
            mx: '🇲🇽',
            ca: '🇨🇦',
            il: '🇮🇱',
            iq: '🇮🇶',
            none: '🏳️'
        };
        return flags[id] || '🏳️';
    }

    function getFactionFlagIso(factionId) {
        const id = String(factionId || '').toLowerCase();
        const map = {
            us: 'us',
            cn: 'cn',
            ru: 'ru',
            eu: 'eu',
            in: 'in',
            jp: 'jp',
            ir: 'ir',
            tw: 'tw',
            ve: 've',
            ua: 'ua',
            br: 'br',
            eg: 'eg',
            sa: 'sa',
            pa: 'pa',
            mx: 'mx',
            ca: 'ca',
            il: 'il',
            iq: 'iq'
        };
        return map[id] || null;
    }

    function hpColor(hp, maxHp) {
        const pct = maxHp > 0 ? hp / maxHp : 0;
        if (pct > 0.5) return 'good';
        if (pct > 0.25) return 'warn';
        return 'crit';
    }

    function renderHeroBar(side, el, isFriendly) {
        const h = side.hero;
        const cfg = side.cfg;
        const hpPct = Math.max(0, Math.min(100, h.maxHp > 0 ? h.hp / h.maxHp * 100 : 0));
        const flagIcon = getFactionFlag(cfg.factionId);
        const flagIso = getFactionFlagIso(cfg.factionId);
        const flagNode = flagIso
            ? `<img class="cb-flag-img" src="https://flagcdn.com/w80/${flagIso}.png" alt="${cfg.name || ''}旗帜" onerror="this.remove(); this.parentElement.textContent='${flagIcon}';">`
            : flagIcon;
        const fillColor = isFriendly
            ? 'linear-gradient(90deg,#3b82f6,#22d3ee)'
            : 'linear-gradient(90deg,#ef4444,#f97316)';

        const powerAside = isFriendly
            ? `<button id="cbHeroPower" title="英雄技能"></button>`
            : `<div class="cb-enemy-power" title="${cfg.heroPowerDesc || ''}">${cfg.heroPowerIcon || '⚡'} ${cfg.heroPowerName || '技能'}</div>`;
        el.innerHTML = `
            <div class="cb-hero-side">
                <div class="cb-flag-portrait">${flagNode}</div>
                ${powerAside}
            </div>
            <div style="flex:1; min-width:0;">
                <div class="cb-hero-name">${h.name}</div>
                <div class="cb-hero-hp-bar">
                    <div class="cb-hero-hp-fill" style="width:${hpPct}%; background:${fillColor}"></div>
                </div>
            </div>
            <div class="cb-hero-stats">
                ${h.armor > 0 ? `<div class="cb-armor-badge">🛡️${h.armor}</div>` : ''}
                <div style="font-size:0.82rem; font-weight:700; color:${isFriendly ? '#93c5fd' : '#fca5a5'};">
                    ❤️${Math.max(0,h.hp)}/${h.maxHp}
                </div>
                ${manaBar(side.mana.cur, side.mana.max, isFriendly)}
            </div>`;
    }

    function renderEnemyHero() {
        renderHeroBar(G.enemy, overlay.querySelector('#cbEnemyHero'), false);
    }

    function renderPlayerHero() {
        renderHeroBar(G.player, overlay.querySelector('#cbPlayerHero'), true);
    }

    function renderMinionEl(m, isPlayerOwned) {
        const canAtk = isPlayerOwned && m.canAttack && !m.hasAttacked && !m.frozen && G.turn === 'player' && !G.gameOver;
        const isSel  = m.uid === selectedMinionUid;
        const isTarget = (pendingSpell || heroPowerNeedsTarget || selectedMinionUid) && !isPlayerOwned;
        const badges = [];
        if (!m.silenced) {
            if (m.taunt)   badges.push('<span class="cb-badge cb-badge-taunt">嘲讽</span>');
            if (m.stealth) badges.push('<span class="cb-badge cb-badge-stealth">隐身</span>');
        } else {
            badges.push('<span class="cb-badge" style="color:#475569;border-color:#334155;">沉默</span>');
        }
        if (m.frozen) badges.push('<span class="cb-badge cb-badge-frozen">冻结</span>');

        const hpCls = hpColor(m.hp, m.maxHp);
        let cls = 'cb-minion';
        if (isSel) cls += ' selected';
        else if (canAtk && !pendingSpell && !heroPowerNeedsTarget) cls += ' can-attack';
        else if (isTarget) cls += ' enemy-target';
        if (m.hasAttacked && isPlayerOwned) cls += ' used';
        if (m.stealth && !isPlayerOwned) cls += ' stealth-badge';
        if (isPlayerOwned && Number(m.fxSpawnUntil || 0) > performance.now()) cls += ' spawn-pop';

        const div = document.createElement('div');
        div.className = cls;
        div.title = [m.name, m.silenced ? '' : (m.taunt ? '嘲讽' : ''), m.stealth ? '隐身' : ''].filter(Boolean).join(' · ') || m.name;
        const photoUrl = getCardPhotoUrl(m);
        div.innerHTML = `
            <div class="cb-minion-art">
                <img class="cb-minion-photo" src="${photoUrl}" alt="${m.name}" loading="lazy" decoding="async" onerror="this.style.display='none';">
                <div class="cb-minion-art-icon">${m.icon || '🪖'}</div>
            </div>
            <div class="cb-minion-body">
                <div class="cb-minion-name">${m.name}</div>
                <div class="cb-minion-badges">${badges.join('')}</div>
            </div>
            <div class="cb-minion-footer">
                <span class="cb-m-atk">${m.atk}</span>
                <span class="cb-m-hp ${hpCls}">${m.hp}</span>
            </div>`;

        if (isPlayerOwned) {
            div.addEventListener('click', () => {
                if (pendingSpell || heroPowerNeedsTarget) { cancelTargeting(); return; }
                selectMinion(m.uid);
            });
        } else {
            div.addEventListener('click', () => {
                if (pendingSpell || heroPowerNeedsTarget) { attackTarget(m.uid); return; }
                if (selectedMinionUid) { attackTarget(m.uid); return; }
            });
        }
        return div;
    }

    function renderEnemyField() {
        const el = overlay.querySelector('#cbEnemyField');
        el.innerHTML = '';
        if (!G.enemy.field.length) {
            el.innerHTML = '<div style="color:rgba(255,255,255,0.15);font-size:0.75rem;">— 敌方战场 —</div>';
        }
        G.enemy.field.forEach(m => el.appendChild(renderMinionEl(m, false)));
    }

    function renderPlayerField() {
        const el = overlay.querySelector('#cbPlayerField');
        el.innerHTML = '';
        if (!G.player.field.length) {
            el.innerHTML = '<div style="color:rgba(255,255,255,0.15);font-size:0.75rem;">— 我方战场 —</div>';
        }
        G.player.field.forEach(m => el.appendChild(renderMinionEl(m, true)));
    }

    function renderCenter() {
        const logEl   = overlay.querySelector('#cbLog');
        const hpEl    = overlay.querySelector('#cbHeroPower');
        const endEl   = overlay.querySelector('#cbEndTurn');
        const isPlayer = G.turn === 'player' && !G.gameOver;
        const cfg = G.player.cfg;

        logEl.textContent = G.log[0] || '...';
        logEl.title = G.log.slice(0, 12).join('\n');

        if (hpEl) {
            hpEl.disabled = !isPlayer || G.player.heroPowerUsed || G.player.mana.cur < cfg.heroPowerCost;
            hpEl.innerHTML = `${cfg.heroPowerIcon || '⚡'}<br><span style="font-size:0.6rem">${cfg.heroPowerName}</span><br><span style="font-size:0.6rem">💜${cfg.heroPowerCost}</span>`;
            hpEl.title = cfg.heroPowerDesc;
            hpEl.onclick = () => useHeroPower();
        }

        endEl.disabled = !isPlayer;
        endEl.textContent = isPlayer ? '🔚 结束回合' : '⏳ AI回合...';
    }

    function renderHand() {
        const el = overlay.querySelector('#cbHand');
        el.innerHTML = '';
        const totalCards = G.player.hand.length;
        const fanSpan = Math.min(26, Math.max(0, totalCards - 1) * 4.2);
        G.player.hand.forEach((card, i) => {
            const affordable = G.player.mana.cur >= card.cost;
            const isSpell = card.type === 'spell';
            const isSel   = i === selectedHandIdx;
            const waiting = pendingSpell && pendingSpell.idx !== i;

            let cls = 'cb-card';
            if (!affordable) cls += ' unaffordable';
            if (isSel) cls += ' selected';
            if (waiting) cls += ' targeting';

            const rarityColor = RARITY_COLORS[card.rarity] || '#64748b';
            const rarityGlow  = RARITY_GLOWS[card.rarity]  || 'rgba(100,116,139,0.5)';
            const ratio = totalCards > 1 ? i / (totalCards - 1) : 0.5;
            const rotate = (ratio - 0.5) * fanSpan;
            const lift = 6 - Math.abs(ratio - 0.5) * 12;

            const div = document.createElement('div');
            div.className = cls;
            div.style.cssText = `border:1px solid ${rarityColor}30; border-top:2px solid ${rarityColor}; box-shadow:0 6px 22px rgba(0,0,0,0.65), 0 0 12px ${rarityGlow}; transform: translateY(${Math.round(lift)}px) rotate(${rotate.toFixed(2)}deg);`;
            const photoUrl = getCardPhotoUrl(card);
            div.innerHTML = `
                <div class="cb-card-cost">${card.cost}</div>
                <div class="cb-card-art">
                    <img class="cb-card-photo" src="${photoUrl}" alt="${card.name}照片" loading="lazy" decoding="async" onerror="this.style.display='none'; const icon=this.parentElement.querySelector('.cb-card-art-icon'); if(icon) icon.style.display='flex';">
                    <div class="cb-card-scanline"></div>
                    <div class="cb-card-art-icon">${card.icon || '❓'}</div>
                </div>
                <div class="cb-card-body">
                    <div class="cb-card-name">${card.name}</div>
                    ${isSpell ? `<div class="cb-card-desc">${card.desc || ''}</div>` : ''}
                    ${!isSpell ? `<div class="cb-card-stats"><span class="cb-card-atk">${card.atk}</span><span class="cb-card-hp">${card.hp}</span></div>` : ''}
                </div>`;
            div.title = `${card.name} (费: ${card.cost})\n${card.desc || ''}${card.type === 'minion' ? `\n攻击: ${card.atk}  生命: ${card.hp}` : ''}`;
            div.addEventListener('click', () => {
                if (G.turn !== 'player' || G.gameOver) return;
                if (pendingSpell || heroPowerNeedsTarget) { cancelTargeting(); return; }
                playCard(i);
            });
            el.appendChild(div);
        });

        // Empty slots
        const remaining = Math.max(0, 4 - G.player.hand.length);
        for (let i = 0; i < remaining; i++) {
            const ph = document.createElement('div');
            ph.style.cssText = 'width:70px;min-height:95px;border:1px dashed rgba(255,255,255,0.1);border-radius:6px;opacity:0.3;';
            el.appendChild(ph);
        }
    }

    function updateTargetHint() {
        const hint = overlay.querySelector('#cbTargetHint');
        if (pendingSpell) {
            hint.style.display = 'block';
            hint.textContent = `🎯 请选择目标施放《${pendingSpell.card.name}》（点击其他地方取消）`;
        } else if (heroPowerNeedsTarget) {
            hint.style.display = 'block';
            hint.textContent = `🎯 英雄技能：请选择目标（点击其他地方取消）`;
        } else {
            hint.style.display = 'none';
        }
    }

    function updateTurnBadge() {
        const badge = overlay.querySelector('#cbTurnBadge');
        if (G.turn === 'player') {
            badge.className = 'player-turn';
            badge.textContent = `你的回合 · 第${Math.ceil(G.turnNumber / 2)}轮`;
        } else {
            badge.className = 'enemy-turn';
            badge.textContent = `AI回合中...`;
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  RESULT & FLEE
    // ═══════════════════════════════════════════════════════════
    function showResult() {
        if (!overlay || !G || !G.gameOver) return;
        const won = G.winner === 'player';
        playSfxResult(won);
        const el = overlay.querySelector('#cbResult');
        el.style.display = '';
        el.innerHTML = `
            <div class="cb-result-title" style="color:${won ? '#34d399' : '#f87171'}">
                ${won ? '🏆 胜利！' : '💀 失败'}
            </div>
            <div class="cb-result-sub">
                ${won
                    ? `成功占领 ${G.enemy.cfg.name} 的战区！\n民心大涨，疆土扩张！`
                    : `${G.enemy.cfg.name} 的防线坚不可摧，\n我方撤退——民心受损。`}
            </div>
            <div style="display:flex;gap:12px;margin-top:8px;">
                <button class="cb-result-btn continue" id="cbContinueBtn">确认</button>
            </div>`;
        el.classList.add('show');
        el.querySelector('#cbContinueBtn').addEventListener('click', () => {
            closeBattle(won);
        });

        if (resultAutoCloseTimer) {
            clearTimeout(resultAutoCloseTimer);
            resultAutoCloseTimer = null;
        }
        // Failsafe: if result button is not clicked, still finish and apply capture/retreat.
        resultAutoCloseTimer = setTimeout(() => {
            if (!G || !G.gameOver) return;
            closeBattle(won);
        }, 7000);
    }

    function fleeBattle() {
        if (aiTimer) { clearTimeout(aiTimer); aiTimer = null; }
        closeBattle(false);
    }

    function closeBattle(victory) {
        if (overlay) overlay.style.display = 'none';
        stopBattleMusic();
        if (aiTimer) { clearTimeout(aiTimer); aiTimer = null; }
        if (resultAutoCloseTimer) { clearTimeout(resultAutoCloseTimer); resultAutoCloseTimer = null; }
        const wasVictory = victory === true;
        G = null;
        selectedHandIdx = null; selectedMinionUid = null;
        pendingSpell = null; heroPowerNeedsTarget = false;
        if (wasVictory && typeof onVictoryCb === 'function') { onVictoryCb(); }
        else if (!wasVictory && typeof onDefeatCb === 'function') { onDefeatCb(); }
        onVictoryCb = null; onDefeatCb = null;
    }

    // ═══════════════════════════════════════════════════════════
    //  PUBLIC API — START
    // ═══════════════════════════════════════════════════════════
    function start(playerFactionId, enemyFactionId, callbacks) {
        if (!overlay) overlay = createOverlay();
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        const resultEl = overlay.querySelector('#cbResult');
        resultEl.classList.remove('show');
        resultEl.style.display = '';
        if (resultAutoCloseTimer) { clearTimeout(resultAutoCloseTimer); resultAutoCloseTimer = null; }

        onVictoryCb = callbacks?.onVictory || null;
        onDefeatCb  = callbacks?.onDefeat  || null;

        // Resolve player config — map game.country → faction id
        const countryMap = { usa: 'us', china: 'cn', eu: 'eu', russia: 'ru' };
        const resolvedPlayer = countryMap[playerFactionId] || playerFactionId;
        audioTheme = getThemeByFaction(resolvedPlayer, enemyFactionId);
        stopBattleMusic();
        resumeAudioContext();
        startBattleMusic();
        updateSoundButton();
        const playerCfg = { ...(NATION_CONFIGS[resolvedPlayer] || NATION_CONFIGS.cn), factionId: resolvedPlayer };
        const enemyCfg  = { ...getEnemyNationConfig(enemyFactionId), factionId: enemyFactionId };
        const playerDeck = NATION_CONFIGS[resolvedPlayer]
            ? [...NATION_CONFIGS[resolvedPlayer].deck]
            : generateEnemyDeck(resolvedPlayer);
        const enemyDeck  = NATION_CONFIGS[enemyFactionId]
            ? [...NATION_CONFIGS[enemyFactionId].deck]
            : generateEnemyDeck(enemyFactionId);

        if (aiTimer) { clearTimeout(aiTimer); aiTimer = null; }

        G = {
            player: initSide(playerCfg, playerDeck, true),
            enemy:  initSide(enemyCfg,  enemyDeck,  false),
            turn: 'player', turnNumber: 1,
            log: [], gameOver: false, winner: null
        };
        selectedHandIdx = null; selectedMinionUid = null;
        pendingSpell = null; heroPowerNeedsTarget = false;

        // Initial draw
        drawCard(G.player, 3);
        drawCard(G.enemy,  3);

        // Player's first turn setup
        G.player.mana.max = 1;
        G.player.mana.cur = 1;
        G.turn = 'player';
        log(`⚔️ 战斗开始！对战 ${enemyCfg.name || enemyFactionId}`);
        log(`── 你先行动 (民心值 1/1) ──`);

        renderAll();
    }

    window.CardBattle = {
        start,
        isActive: () => !!G && !G.gameOver,
        close: fleeBattle
    };
})();
