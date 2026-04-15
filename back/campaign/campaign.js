(function () {
	"use strict";

	const STAGES = {
		orleans: {
			chapter: "第1关 奥尔良",
			subtitle: "历史还原，解围城",
			nextPage: "reims.html",
			nextLabel: "前往兰斯",
			theme: {
				sky: "#89afc3",
				mist: "rgba(255, 241, 210, 0.16)",
				accent: "#f0cb75",
				accentStrong: "#ffe4a0"
			},
			briefingTitle: "1429年，奥尔良城外",
			briefing: "英军已经压到城门前。\n\n守住奥尔良，击破塔尔博特。",
			victoryTitle: "奥尔良解围",
			victoryText: "奥尔良守住了。\n\n下一站，兰斯加冕。",
			world: { width: 2400, height: 1400 },
			playerSpawn: { x: 560, y: 760 },
			gate: { x: 390, y: 700, w: 92, h: 240, hp: 320 },
			goalText: "守住奥尔良城门，击败塔尔博特",
			infoText: (state) => `城门耐久 ${Math.max(0, Math.ceil(state.gate.hp))} / ${state.gate.maxHp}`
		},
		reims: {
			chapter: "第2关 兰斯",
			subtitle: "国王加冕，贞德功成",
			nextPage: "tavern.html",
			nextLabel: "前往酒馆休整",
			theme: {
				sky: "#afbea5",
				mist: "rgba(255, 241, 219, 0.18)",
				accent: "#e4c06e",
				accentStrong: "#ffe0a2"
			},
			briefingTitle: "1429年，通往兰斯的道路",
			briefing: "查理国王终于北上去兰斯。\n\n护送他穿过伏兵，完成加冕。",
			victoryTitle: "兰斯加冕",
			victoryText: "查理国王完成加冕。\n\n今夜先去兰斯酒馆缓口气，明天再进皮卡第。",
			world: { width: 2400, height: 1400 },
			playerSpawn: { x: 540, y: 1080 },
			goalZone: { x: 1880, y: 300, r: 120 },
			goalText: "护送查理国王抵达兰斯主教座堂",
			infoText: (state) => {
				const vip = state.vip;
				return vip ? `查理国王 ${Math.max(0, Math.ceil(vip.hp))} / ${vip.maxHp}` : "查理国王平安";
			}
		},
		picardy: {
			chapter: "第3关 皮卡第",
			subtitle: "加冕之后，背叛合围",
			nextPage: "england.html",
			nextLabel: "押往英格兰",
			theme: {
				sky: "#8c8a78",
				mist: "rgba(255, 240, 204, 0.12)",
				accent: "#d8b16d",
				accentStrong: "#f2d69a"
			},
			briefingTitle: "1430年，皮卡第边境",
			briefing: "皮卡第本该是推进战。\n\n但前面有敌军，后面也有人准备出卖你。",
			victoryTitle: "皮卡第的背叛",
			victoryText: "皮卡第没有凯旋。",
			defeatTitle: "皮卡第的背叛",
			defeatText: "援军没来，退路先被封死。\n\n接下来，是英格兰的审判。",
			world: { width: 2400, height: 1400 },
			playerSpawn: { x: 620, y: 860 },
			goalText: "掩护前锋推进，守住皮卡第阵线",
			infoText: (state) => {
				if (state.betrayalTriggered) return `崩溃 ${Math.round(state.despair)}%`;
				return `忠诚者 ${state.allies.filter((unit) => !unit.dead).length} / ${state.initialAllies}`;
			}
		},
		england: {
			chapter: "第4关 英格兰火刑台",
			subtitle: "审判，火焰，白光",
			nextPage: "rouen.html",
			nextLabel: "坠入地牢",
			theme: {
				sky: "#5f4f49",
				mist: "rgba(255, 224, 181, 0.08)",
				accent: "#e2a25b",
				accentStrong: "#ffd49a"
			},
			briefingTitle: "1431年，英格兰审判场",
			briefing: "你被绑上火刑台。\n\n现在能做的，只有看着火焰升起。",
			victoryTitle: "火中白光",
			victoryText: "火焰升起时，白光先一步吞没了视线。\n\n再睁眼时，你已在英格兰地下监狱。",
			world: { width: 2400, height: 1400 },
			playerSpawn: { x: 1200, y: 860 },
			goalText: "等待火焰燃起",
			infoText: (state) => `火焰 ${Math.round(state.fireProgress)}%`
		},
		rouen: {
			chapter: "第5关 英格兰地牢",
			subtitle: "郑和救人，地牢突围",
			nextPage: "spain.html",
			nextLabel: "前往西班牙",
			theme: {
				sky: "#4a5468",
				mist: "rgba(196, 213, 255, 0.08)",
				accent: "#9bb7ff",
				accentStrong: "#cfe0ff"
			},
			briefingTitle: "英格兰地下监狱",
			briefing: "你没死。郑和把你拖进了地牢深处。\n\n跟着他闯出去，冲到船边。",
			victoryTitle: "逃离英格兰",
			victoryText: "你和郑和逃出了地牢。\n\n下一站，西班牙海岸。",
			world: { width: 2400, height: 1400 },
			playerSpawn: { x: 280, y: 1110 },
			escapeZone: { x: 2160, y: 1110, w: 180, h: 180 },
			goalText: "跟着郑和躲开守卫，冲到船边",
			infoText: (state) => `警戒值 ${Math.round(state.detection)}%`
		},
		spain: {
			chapter: "第6关 西班牙",
			subtitle: "离开法兰西后的第一场新战役",
			nextPage: "portugal.html",
			nextLabel: "前往葡萄牙",
			theme: {
				sky: "#c9b487",
				mist: "rgba(255, 233, 182, 0.12)",
				accent: "#f0cc82",
				accentStrong: "#ffe5aa"
			},
			briefingTitle: "西班牙海岸",
			briefing: "你已离开法兰西。\n\n先夺下滩头，再击倒总督。",
			victoryTitle: "西班牙立足",
			victoryText: "你们在西班牙站稳了脚。\n\n新的远征才刚开始。",
			world: { width: 2400, height: 1400 },
			playerSpawn: { x: 430, y: 1020 },
			captureZone: { x: 820, y: 880, r: 170 },
			goalText: "夺下滩头并击倒西班牙总督",
			infoText: (state) => `滩头占领 ${Math.round(state.captureProgress * 100)}%`
		},
		portugal: {
			chapter: "第7关 葡萄牙",
			subtitle: "夺港，拿航线",
			nextPage: "brazilCoast.html",
			nextLabel: "横渡巴西",
			theme: {
				sky: "#a7c3d2",
				mist: "rgba(232, 244, 255, 0.12)",
				accent: "#e4c07b",
				accentStrong: "#ffe3a6"
			},
			briefingTitle: "葡萄牙海港",
			briefing: "拿下港口和补给船。\n\n从这里，航线才真正属于你。",
			victoryTitle: "葡萄牙易手",
			victoryText: "港口和船都到手了。\n\n下一站，巴西。",
			world: { width: 2400, height: 1400 },
			playerSpawn: { x: 360, y: 980 },
			captureZone: { x: 1720, y: 760, r: 190 },
			goalText: "夺下港口并击倒港务总督",
			infoText: (state) => `港口控制 ${Math.round(state.captureProgress * 100)}%`
		},
		brazilCoast: {
			chapter: "第8关 巴西海岸",
			subtitle: "新大陆第一脚",
			nextPage: "brazilJungle.html",
			nextLabel: "深入雨林",
			theme: {
				sky: "#7fc6d8",
				mist: "rgba(205, 252, 228, 0.14)",
				accent: "#f3d46f",
				accentStrong: "#fff0aa"
			},
			briefingTitle: "巴西海岸",
			briefing: "你和郑和第一次踏上新大陆。\n\n阿妮塔已经在海岸前线开打了。",
			victoryTitle: "站上新大陆",
			victoryText: "海岸已经站稳。\n\n阿妮塔先一步钻进雨林了。",
			world: { width: 2400, height: 1400 },
			playerSpawn: { x: 320, y: 1040 },
			captureZone: { x: 900, y: 900, r: 185 },
			goalText: "接应阿妮塔，守住登陆点并击倒海岸总督",
			infoText: (state) => `登陆点 ${Math.round(state.captureProgress * 100)}%`
		},
		brazilJungle: {
			chapter: "第9关 巴西雨林",
			subtitle: "旧情，伏兵，烂摊子",
			nextPage: "brazilRise.html",
			nextLabel: "建立据点",
			theme: {
				sky: "#5ea579",
				mist: "rgba(210, 255, 225, 0.16)",
				accent: "#d8e37d",
				accentStrong: "#f2ffb4"
			},
			briefingTitle: "巴西雨林",
			briefing: "阿妮塔一路骂着佩德罗钻进雨林。\n\n先追上她，再把补给营夺回来。",
			victoryTitle: "雨林里的旧账",
			victoryText: "补给营拿回来了。\n\n阿妮塔终于承认，她追到这里不只为旗，也为佩德罗留下的那封信。",
			world: { width: 2400, height: 1400 },
			playerSpawn: { x: 300, y: 1120 },
			goalZone: { x: 2000, y: 280, r: 140 },
			goalText: "与阿妮塔会合，夺回补给营",
			infoText: (state) => `深入 ${Math.round(clamp((state.player ? state.player.x : 0) / 2000, 0, 1) * 100)}%`
		},
		brazilRise: {
			chapter: "第10关 巴西起势",
			subtitle: "旗和烂桃花一起落地",
			nextPage: "camp-brazil.html",
			nextLabel: "回营休整",
			theme: {
				sky: "#c79c58",
				mist: "rgba(255, 239, 180, 0.12)",
				accent: "#f1c96e",
				accentStrong: "#ffe69b"
			},
			briefingTitle: "巴西据点",
			briefing: "补给营刚稳，佩德罗就带着半真半假的求婚信露面了。\n\n守住据点，别让这场烂桃花把义军先拆散。",
			victoryTitle: "巴西起势",
			victoryText: "旗已经插稳。\n\n佩德罗没跑，阿妮塔也没开枪。狗血归狗血，这面旗终于有人肯一起扛。",
			world: { width: 2400, height: 1400 },
			playerSpawn: { x: 560, y: 820 },
			gate: { x: 420, y: 760, w: 120, h: 240, hp: 420 },
			gateLabel: "巴西据点",
			goalText: "守住巴西据点，击退殖民军队长",
			infoText: (state) => `据点耐久 ${Math.max(0, Math.ceil(state.gate.hp))} / ${state.gate.maxHp}`
		},
		mali: {
			chapter: "第11关 马里",
			subtitle: "黄金商路，先谈再打",
			nextPage: "mali.html",
			nextLabel: "非洲待续",
			theme: {
				sky: "#d4b16a",
				mist: "rgba(255, 231, 184, 0.14)",
				accent: "#f0cf79",
				accentStrong: "#ffebb0"
			},
			briefingTitle: "马里商路",
			briefing: "巴西的烂账还没理完，你们又被黄金商路卷进了新站队。\n\n先护住营火，再击退想吞商队的卫队长。",
			victoryTitle: "马里立足",
			victoryText: "商路暂时稳住了。\n\n阿妮塔和佩德罗总算能坐下说话，而非洲线也真正展开了。",
			world: { width: 2400, height: 1400 },
			playerSpawn: { x: 420, y: 930 },
			captureZone: { x: 1160, y: 760, r: 190 },
			goalText: "护住商队营火，击退黄金卫队长",
			infoText: (state) => `营火安定 ${Math.round(state.captureProgress * 100)}%`
		}
	};

	const stageId = document.body.dataset.stage || "orleans";
	const stage = STAGES[stageId];
	if (!stage) return;

	const canvas = document.getElementById("game");
	const ctx = canvas.getContext("2d");
	const heroStore = window.WarHeroes || null;
	const unlockedHeroes = heroStore && heroStore.loadFlags ? heroStore.loadFlags() : {};
	const storedPlayerState = heroStore && heroStore.loadPlayerState ? heroStore.loadPlayerState() : null;
	const chapterTitleEl = document.getElementById("chapterTitle");
	const chapterSubtitleEl = document.getElementById("chapterSubtitle");
	const objectiveEl = document.getElementById("objectiveText");
	const playerHpEl = document.getElementById("playerHpText");
	const stageInfoEl = document.getElementById("stageInfoText");
	const skillBtn = document.getElementById("skillBtn");
	const pauseBtn = document.getElementById("pauseBtn");
	const storyBtn = document.getElementById("storyBtn");
	const storyBtnDefaultText = storyBtn ? storyBtn.textContent : "查看剧情";
	const chapterNavToggleDesktopText = "章节";
	const chapterNavToggleMobileText = "关卡";
	const upgradeToggleText = "技能";
	const skillBadgeHitboxes = [];
	const chapterNavEl = document.querySelector(".chapterNav");
	const chapterNavToggleEl = document.createElement("button");
	const upgradeToggleEl = document.createElement("button");
	const upgradePanelEl = document.createElement("div");
	chapterNavToggleEl.type = "button";
	chapterNavToggleEl.className = "chapterNavToggle";
	chapterNavToggleEl.setAttribute("aria-expanded", "false");
	chapterNavToggleEl.setAttribute("aria-label", "展开章节导航");
	chapterNavToggleEl.textContent = "章节";
	upgradeToggleEl.type = "button";
	upgradeToggleEl.className = "upgradeToggle";
	upgradeToggleEl.setAttribute("aria-expanded", "false");
	upgradeToggleEl.setAttribute("aria-label", "展开技能升级");
	upgradeToggleEl.textContent = "技能";
	upgradePanelEl.className = "upgradePanel";
	upgradePanelEl.innerHTML = [
		'<div class="upgradePanelTitle">技能升级</div>',
		'<div class="upgradePoints" id="upgradePointsText"></div>',
		'<button type="button" class="upgradeCard" data-upgrade="farm">',
			'<span class="upgradeName">种田</span>',
			'<span class="upgradeValue" id="farmUpgradeText"></span>',
		'</button>',
		'<button type="button" class="upgradeCard" data-upgrade="hp">',
			'<span class="upgradeName">体魄</span>',
			'<span class="upgradeValue" id="hpUpgradeText"></span>',
		'</button>'
	].join("");
	if (chapterNavEl) {
		chapterNavEl.id = chapterNavEl.id || "chapterNavMenu";
		chapterNavToggleEl.setAttribute("aria-controls", chapterNavEl.id);
		chapterNavEl.parentNode.insertBefore(chapterNavToggleEl, chapterNavEl);
		chapterNavEl.parentNode.insertBefore(upgradeToggleEl, chapterNavEl);
		document.body.appendChild(upgradePanelEl);
	}
	const upgradePointsEl = upgradePanelEl.querySelector("#upgradePointsText");
	const farmUpgradeTextEl = upgradePanelEl.querySelector("#farmUpgradeText");
	const hpUpgradeTextEl = upgradePanelEl.querySelector("#hpUpgradeText");
	const mobileStickEl = document.createElement("div");
	mobileStickEl.className = "mobileStick";
	mobileStickEl.setAttribute("aria-hidden", "true");
	mobileStickEl.innerHTML = '<div class="mobileStickKnob"></div>';
	document.body.appendChild(mobileStickEl);
	const mobileStickKnobEl = mobileStickEl.querySelector(".mobileStickKnob");
	const dialogEl = document.getElementById("dialog");
	const dialogTitleEl = document.getElementById("dialogTitle");
	const dialogTextEl = document.getElementById("dialogText");
	const dialogBtn = document.getElementById("dialogBtn");
	const resultEl = document.getElementById("result");
	const resultTitleEl = document.getElementById("resultTitle");
	const resultTextEl = document.getElementById("resultText");
	const nextStageBtn = document.getElementById("nextStageBtn");
	let isMobileUI = false;
	const JEANNE_XP_PER_LEVEL = 1;
	const JEANNE_HP_PER_LEVEL = 28;
	const JEANNE_HP_SKILL_BONUS = 10;

	const playerSpriteIdle = new Image();
	const playerSpriteMove = new Image();
	const terrainAtlas = new Image();
	const terrainTileAtlas = new Image();
	const lpcHouseAtlas = new Image();
	const lpcTreeAtlas = new Image();
	const lpcCastleWallsAtlas = new Image();
	const lpcCastleOutsideAtlas = new Image();
	const lpcGrassTileAtlas = new Image();
	const lpcDirtTileAtlas = new Image();
	const lpcRockTileAtlas = new Image();
	const playerAttackFrames = [];
	const PLAYER_ATTACK_FRAME_COUNT = 17;
	const TERRAIN_TILE_W = 37;
	const TERRAIN_TILE_H = 37;
	const TERRAIN_TILE_COLS = 5;
	const TERRAIN_TILE_INSET = 1;
	const MAGECITY_PATTERN_SLICES = Object.freeze({
		wall: { x: 0, y: 112, w: 64, h: 64 },
		stone: { x: 0, y: 222, w: 64, h: 64 },
		road: { x: 0, y: 1048, w: 72, h: 72 }
	});
	const TERRAIN_SPRITES = Object.freeze({
		blueRoofHouse: { x: 0, y: 596, w: 124, h: 222 },
		stoneChapel: { x: 56, y: 788, w: 144, h: 142 },
		redRoofHouse: { x: 124, y: 596, w: 132, h: 222 },
		redChapel: { x: 0, y: 112, w: 118, h: 112 },
		roundBarn: { x: 44, y: 366, w: 112, h: 194 },
		timberHall: { x: 0, y: 1204, w: 108, h: 168 },
		longHut: { x: 12, y: 1310, w: 176, h: 104 },
		woodHouse: { x: 74, y: 790, w: 128, h: 156 },
		goldHall: { x: 0, y: 1288, w: 202, h: 158 },
		pineGreen: { x: 0, y: 934, w: 104, h: 116 },
		pineGold: { x: 104, y: 934, w: 104, h: 116 },
		smallPine: { x: 214, y: 370, w: 30, h: 86 },
		tallPine: { x: 94, y: 336, w: 126, h: 220 }
	});
	const TERRAIN_TILE_GROUPS = Object.freeze({
		wallVertical: [createTile(0, 0)],
		wallHorizontal: [createTile(4, 0)],
		tree: createTileGroup(4, 5),
		goldRoad: createTileGroup(7, 7),
		rock: createTileGroup(6, 7)
	});

	function createTile(col, row) {
		return { x: col * TERRAIN_TILE_W, y: row * TERRAIN_TILE_H, w: TERRAIN_TILE_W, h: TERRAIN_TILE_H };
	}

	function createTileGroup(startRow, endRow) {
		const tiles = [];
		for (let row = startRow; row <= endRow; row += 1) {
			for (let col = 0; col < TERRAIN_TILE_COLS; col += 1) {
				tiles.push(createTile(col, row));
			}
		}
		return tiles;
	}

	function resolveCampaignAssetPath(assetPath) {
		if (!assetPath) return assetPath;
		if (/^(?:[a-z]+:|\/|\.\.\/)/i.test(assetPath)) return assetPath;
		if (assetPath.startsWith("img/")) return `../${assetPath}`;
		return assetPath;
	}

	const jeanneTemplate = heroStore && heroStore.getCampaignUnitTemplate ? heroStore.getCampaignUnitTemplate("jeannePlayer") : null;
	const jeanneSpriteSource = jeanneTemplate && jeanneTemplate.sprite ? jeanneTemplate.sprite : {
		idleSrc: "../img/hero3/idle.png",
		moveSrc: "../img/hero3/move.png",
		attackPattern: "../img/hero3/attack/attack-{index}.png",
		attackFrames: 17,
		width: 64,
		height: 72,
		offsetX: -32,
		offsetY: -44
	};
	const jeanneSprite = {
		idleSrc: resolveCampaignAssetPath(jeanneSpriteSource.idleSrc),
		moveSrc: resolveCampaignAssetPath(jeanneSpriteSource.moveSrc),
		attackPattern: resolveCampaignAssetPath(jeanneSpriteSource.attackPattern),
		attackFrames: jeanneSpriteSource.attackFrames,
		width: jeanneSpriteSource.width,
		height: jeanneSpriteSource.height,
		offsetX: jeanneSpriteSource.offsetX,
		offsetY: jeanneSpriteSource.offsetY
	};
	playerSpriteIdle.src = jeanneSprite.idleSrc;
	playerSpriteMove.src = jeanneSprite.moveSrc;
	terrainAtlas.src = resolveCampaignAssetPath("img/medieval/magecity-transparent.png");
	terrainTileAtlas.src = resolveCampaignAssetPath("img/2.png");
	lpcHouseAtlas.src = resolveCampaignAssetPath("img/lpc/house_transparent.png");
	lpcTreeAtlas.src = resolveCampaignAssetPath("img/lpc/treetop.png");
	lpcCastleWallsAtlas.src = resolveCampaignAssetPath("img/lpc/castlewalls.png");
	lpcCastleOutsideAtlas.src = resolveCampaignAssetPath("img/lpc/castle_outside.png");
	lpcGrassTileAtlas.src = resolveCampaignAssetPath("img/lpc-temp/lpc_base_assets/LPC Base Assets/tiles/grass.png");
	lpcDirtTileAtlas.src = resolveCampaignAssetPath("img/lpc-temp/lpc_base_assets/LPC Base Assets/tiles/dirt2.png");
	lpcRockTileAtlas.src = resolveCampaignAssetPath("img/lpc-temp/lpc_base_assets/LPC Base Assets/tiles/rock.png");
	for (let i = 0; i < (jeanneSprite.attackFrames || PLAYER_ATTACK_FRAME_COUNT); i += 1) {
		const img = new Image();
		img.src = (jeanneSprite.attackPattern || "../img/hero3/attack/attack-{index}.png").replace("{index}", String(i).padStart(2, "0"));
		playerAttackFrames.push(img);
	}

	const keys = { up: false, down: false, left: false, right: false };
	const camera = { x: 0, y: 0, scale: 1 };
	const mobileStick = {
		active: false,
		pointerId: null,
		x: 0,
		y: 0,
		magnitude: 0,
		maxRadius: 34
	};

	const state = {
		player: null,
		allies: [],
		enemies: [],
		shouts: [],
		shockwaves: [],
		mistBursts: [],
		swordSweeps: [],
		tracers: [],
		muzzleFlashes: [],
		hitSparks: [],
		particles: [],
		moveTarget: null,
		dialogOpen: true,
		resultOpen: false,
		paused: false,
		over: false,
		lastTime: 0,
		worldW: stage.world.width,
		worldH: stage.world.height,
		detection: 0,
		captureProgress: 0,
		alarm: false,
		spawnTimer: 0,
		spawnsLeft: 0,
		gate: null,
		vip: null,
		escapeZone: stage.escapeZone || null,
		captureZone: stage.captureZone || null,
		goalZone: stage.goalZone || null,
		obstacles: [],
		wavesTriggered: [],
		screenShout: null,
		objectiveText: stage.goalText,
		stageTimer: 0,
		betrayalTriggered: false,
		collapseTimer: 0,
		allyLossTimer: 0,
		initialAllies: 0,
		peaceScenesShown: {},
		anitaJoined: !!unlockedHeroes.anita,
		despair: 0,
		fireProgress: 0,
		whiteFlash: 0,
		cinematicTriggered: false,
		jeanneProgress: {
			level: Math.max(1, storedPlayerState && storedPlayerState.jeanneLevel ? storedPlayerState.jeanneLevel : 1),
			xp: Math.max(0, storedPlayerState && storedPlayerState.jeanneXp ? storedPlayerState.jeanneXp : 0),
			totalXp: Math.max(0, storedPlayerState && storedPlayerState.jeanneTotalXp ? storedPlayerState.jeanneTotalXp : 0)
		},
		jeanneUpgrades: {
			farm: Math.max(0, storedPlayerState && storedPlayerState.jeanneFarmLevel ? storedPlayerState.jeanneFarmLevel : 0),
			hp: Math.max(0, storedPlayerState && storedPlayerState.jeanneHpSkillLevel ? storedPlayerState.jeanneHpSkillLevel : 0)
		}
	};

	chapterTitleEl.textContent = stage.chapter;
	chapterSubtitleEl.textContent = stage.subtitle;
	objectiveEl.textContent = stage.goalText;
	nextStageBtn.href = stage.nextPage;
	nextStageBtn.textContent = stage.nextLabel;
	document.title = `贞德：逆转时空 - ${stage.chapter.replace(/^第\d+关\s*/, "")}`;

	for (const [name, value] of Object.entries(stage.theme)) {
		document.documentElement.style.setProperty(`--${name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`, value);
	}

	document.querySelectorAll("[data-stage-link]").forEach((link) => {
		if (link.getAttribute("data-stage-link") === stageId) link.classList.add("active");
	});

	function clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	function rand(min, max) {
		return min + Math.random() * (max - min);
	}

	function dist(a, b) {
		return Math.hypot(a.x - b.x, a.y - b.y);
	}

	function hasHeroFlag(heroId) {
		return !!unlockedHeroes[heroId];
	}

	function unlockHeroFlag(heroId) {
		if (!heroId || unlockedHeroes[heroId]) return;
		unlockedHeroes[heroId] = true;
		if (heroStore && heroStore.saveFlags) heroStore.saveFlags({ [heroId]: true });
	}

	function angleTo(a, b) {
		return Math.atan2(b.y - a.y, b.x - a.x);
	}

	function getJeanneXpForNextLevel() {
		return JEANNE_XP_PER_LEVEL;
	}

	function persistJeanneProgress() {
		if (!heroStore || !heroStore.savePlayerState) return;
		heroStore.savePlayerState({
			jeanneLevel: state.jeanneProgress.level,
			jeanneXp: state.jeanneProgress.xp,
			jeanneTotalXp: state.jeanneProgress.totalXp,
			jeanneFarmLevel: state.jeanneUpgrades.farm,
			jeanneHpSkillLevel: state.jeanneUpgrades.hp
		});
	}

	function getJeanneSkillPointsLeft() {
		const spent = state.jeanneUpgrades.farm + state.jeanneUpgrades.hp;
		return Math.max(0, (state.jeanneProgress.level - 1) - spent);
	}

	function applyJeanneProgressToPlayer(player, refillHp) {
		if (!player) return;
		const previousMaxHp = player.maxHp || player.hp || 0;
		player.baseMaxHp = player.baseMaxHp || player.maxHp;
		player.level = state.jeanneProgress.level;
		player.maxHp = player.baseMaxHp + (player.level - 1) * JEANNE_HP_PER_LEVEL + state.jeanneUpgrades.hp * JEANNE_HP_SKILL_BONUS;
		if (refillHp) {
			player.hp = player.maxHp;
			return;
		}
		const hpDelta = player.maxHp - previousMaxHp;
		player.hp = clamp(player.hp + Math.max(0, hpDelta), 0, player.maxHp);
	}

	function getJeanneKillReward(unit) {
		if (!unit || unit.team !== "enemy") return 0;
		return unit.isCommander ? 3 : 1;
	}

	function awardJeanneExperience(amount) {
		if (!amount || amount <= 0) return;
		let leveledUp = false;
		state.jeanneProgress.totalXp += amount;
		state.jeanneProgress.xp += amount;
		while (state.jeanneProgress.xp >= getJeanneXpForNextLevel()) {
			state.jeanneProgress.xp -= getJeanneXpForNextLevel();
			state.jeanneProgress.level += 1;
			leveledUp = true;
		}
		persistJeanneProgress();
		if (state.player) applyJeanneProgressToPlayer(state.player, false);
		if (leveledUp && state.player) {
			state.shouts.push({ x: state.player.x, y: state.player.y - 76, text: `Level ${state.jeanneProgress.level}`, life: 1.35 });
		}
		renderUpgradePanel();
	}

	function renderUpgradePanel() {
		if (!upgradePanelEl) return;
		const pointsLeft = getJeanneSkillPointsLeft();
		if (upgradePointsEl) upgradePointsEl.textContent = `可用点数 ${pointsLeft}`;
		if (farmUpgradeTextEl) farmUpgradeTextEl.textContent = `Lv.${state.jeanneUpgrades.farm} · 收成 +${state.jeanneUpgrades.farm * 5}%`;
		if (hpUpgradeTextEl) hpUpgradeTextEl.textContent = `Lv.${state.jeanneUpgrades.hp} · HP +${state.jeanneUpgrades.hp * JEANNE_HP_SKILL_BONUS}`;
		upgradePanelEl.querySelectorAll("[data-upgrade]").forEach((button) => {
			button.disabled = pointsLeft <= 0;
		});
	}

	function setUpgradePanelOpen(open) {
		upgradePanelEl.classList.toggle("open", open);
		upgradeToggleEl.classList.toggle("open", open);
		upgradeToggleEl.setAttribute("aria-expanded", open ? "true" : "false");
		upgradeToggleEl.setAttribute("aria-label", open ? "收起技能升级" : "展开技能升级");
	}

	function upgradeJeanneSkill(kind) {
		if (getJeanneSkillPointsLeft() <= 0) return;
		if (kind === "farm") state.jeanneUpgrades.farm += 1;
		if (kind === "hp") state.jeanneUpgrades.hp += 1;
		persistJeanneProgress();
		if (state.player) applyJeanneProgressToPlayer(state.player, false);
		renderUpgradePanel();
	}

	function normalizeAngle(angle) {
		let result = angle;
		while (result > Math.PI) result -= Math.PI * 2;
		while (result < -Math.PI) result += Math.PI * 2;
		return result;
	}

	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		applyResponsiveUi();
	}

	function applyResponsiveUi() {
		isMobileUI = window.matchMedia("(max-width: 920px),(pointer: coarse)").matches;
		camera.scale = isMobileUI ? (window.innerWidth <= 640 ? 0.72 : 0.8) : 1;
		document.body.classList.toggle("mobile-ui", isMobileUI);
		if (!isMobileUI) resetMobileStick();
		if (chapterNavToggleEl) chapterNavToggleEl.textContent = isMobileUI ? chapterNavToggleMobileText : chapterNavToggleDesktopText;
		if (upgradeToggleEl) upgradeToggleEl.textContent = upgradeToggleText;
		if (storyBtn) storyBtn.textContent = isMobileUI ? "剧情" : storyBtnDefaultText;
	}

	function setChapterNavOpen(open) {
		if (!chapterNavEl) return;
		chapterNavEl.classList.toggle("open", open);
		chapterNavToggleEl.classList.toggle("open", open);
		chapterNavToggleEl.setAttribute("aria-expanded", open ? "true" : "false");
		chapterNavToggleEl.setAttribute("aria-label", open ? "收起章节导航" : "展开章节导航");
	}

	function updateMobileStickKnob() {
		if (!mobileStickKnobEl) return;
		mobileStickKnobEl.style.transform = `translate(${mobileStick.x}px, ${mobileStick.y}px)`;
	}

	function resetMobileStick() {
		mobileStick.active = false;
		mobileStick.pointerId = null;
		mobileStick.x = 0;
		mobileStick.y = 0;
		mobileStick.magnitude = 0;
		updateMobileStickKnob();
	}

	function updateMobileStick(event) {
		const rect = mobileStickEl.getBoundingClientRect();
		const centerX = rect.left + rect.width * 0.5;
		const centerY = rect.top + rect.height * 0.5;
		const rawX = event.clientX - centerX;
		const rawY = event.clientY - centerY;
		const distance = Math.hypot(rawX, rawY);
		const limited = distance > mobileStick.maxRadius && distance > 0 ? mobileStick.maxRadius / distance : 1;
		mobileStick.x = rawX * limited;
		mobileStick.y = rawY * limited;
		mobileStick.magnitude = clamp(distance / mobileStick.maxRadius, 0, 1);
		updateMobileStickKnob();
	}

	function worldFromClient(clientX, clientY) {
		const rect = canvas.getBoundingClientRect();
		return {
			x: camera.x + (clientX - rect.left) / camera.scale,
			y: camera.y + (clientY - rect.top) / camera.scale
		};
	}

	function screenFromWorld(x, y) {
		return {
			x: (x - camera.x) * camera.scale,
			y: (y - camera.y) * camera.scale
		};
	}

	function clipRect(x, y, w, h) {
		ctx.beginPath();
		ctx.rect(x, y, w, h);
		ctx.clip();
	}

	function drawAnimatedWalkSprite(unit) {
		const time = performance.now() * 0.012;
		const stride = Math.sin(time);
		const bounce = Math.sin(time * 2);
		const bodyBobY = bounce * 0.9;
		const bodySwayX = stride * 0.7;
		const legShiftX = stride * 2.4;
		const legBobY = Math.abs(stride) * 1.2;

		ctx.save();
		clipRect(-28, -6 + bodyBobY, 56, 36);
		ctx.drawImage(playerSpriteMove, -32 + legShiftX, -44 + bodyBobY + legBobY, 64, 72);
		ctx.restore();

		ctx.save();
		clipRect(-30, -44 + bodyBobY, 60, 42);
		ctx.drawImage(playerSpriteMove, -32 + bodySwayX, -44 + bodyBobY, 64, 72);
		ctx.restore();
	}

	function createUnit(config) {
		return {
			kind: config.kind || config.team,
			team: config.team,
			label: config.label,
			x: config.x,
			y: config.y,
			dir: config.dir || 0,
			radius: config.radius || 18,
			hp: config.hp,
			maxHp: config.hp,
			speed: config.speed || 120,
			attackRange: config.attackRange || 28,
			damage: config.damage || 16,
			attackCd: 0,
			attackAnim: 0,
			skillCd: 0,
			boost: 0,
			dead: false,
			color: config.color,
			stroke: config.stroke || "rgba(0,0,0,0.38)",
			appearance: config.appearance || null,
			sprite: config.sprite || null,
			mounted: !!config.mounted,
			followDistance: config.followDistance || 100,
			anchor: config.anchor || null,
			patrol: config.patrol || null,
			patrolIndex: 0,
			visionRange: config.visionRange || 240,
			visionArc: config.visionArc || 0.9,
			alerted: 0,
			isCommander: !!config.isCommander,
			isVip: !!config.isVip,
			isViking: !!config.isViking,
			isPlayer: !!config.isPlayer,
			hitFlash: 0
		};
	}

	function createStageUnit(templateId, x, y, overrides) {
		if (heroStore && heroStore.createCampaignUnit) {
			const built = heroStore.createCampaignUnit(templateId, x, y, overrides);
			if (built) return createUnit(built);
		}
		return createUnit(Object.assign({ x, y }, overrides || {}));
	}

	function spawnZhengHe(x, y) {
		return createStageUnit("zhengheRescuer", x, y, {
			anchor: { x, y }
		});
	}

	function spawnAnita(x, y) {
		return createStageUnit("anitaScout", x, y, {
			anchor: { x, y }
		});
	}

	function spawnPedro(x, y) {
		return createStageUnit("royalEscort", x, y, {
			label: "佩德罗",
			hp: 260,
			speed: 116,
			damage: 19,
			isCommander: true,
			anchor: { x, y },
			appearance: {
				body: "#6f4f38",
				head: "#e7c9a7",
				accent: "#d8c476",
				trim: "#3f2618",
				hair: "#2b1b13",
				weapon: "#f0f2f3",
				plume: "#c1a553",
				cape: "#6b2430"
			}
		});
	}

	function isPeaceSceneReady(scene) {
		if (!scene || !scene.trigger || !state.player) return false;
		const trigger = scene.trigger;
		if (typeof trigger.minTimer === "number" && state.stageTimer < trigger.minTimer) return false;
		if (trigger.type === "player-x") return state.player.x >= trigger.value;
		if (trigger.type === "timer") return state.stageTimer >= trigger.value;
		if (trigger.type === "capture-progress") return state.captureProgress >= trigger.value;
		if (trigger.type === "enemy-count-below") return state.enemies.filter((enemy) => !enemy.dead).length <= trigger.value;
		return false;
	}

	function maybeTriggerPeaceScene() {
		if (state.resultOpen || state.dialogOpen || !stage.peaceScenes || !stage.peaceScenes.length) return false;
		for (const scene of stage.peaceScenes) {
			if (!scene || !scene.key || state.peaceScenesShown[scene.key]) continue;
			if (!isPeaceSceneReady(scene)) continue;
			state.peaceScenesShown[scene.key] = true;
			showDialog(scene.title, scene.text, "继续前进");
			return true;
		}
		return false;
	}

	function updateAnitaAlly(ally, dt) {
		const target = nearestLiving(state.enemies, ally, ally.attackRange + 120);
		if (target) {
			const desiredRange = Math.max(170, ally.attackRange - 30);
			const retreatRange = Math.max(120, desiredRange - 85);
			const currentDistance = dist(ally, target);
			ally.dir = angleTo(ally, target);

			if (currentDistance < retreatRange) {
				const retreatAngle = ally.dir + Math.PI;
				const retreatStep = ally.speed * 1.08 * dt;
				moveUnit(ally, Math.cos(retreatAngle) * retreatStep, Math.sin(retreatAngle) * retreatStep);
				return;
			}

			if (currentDistance <= ally.attackRange + target.radius + ally.radius) {
				attemptAttack(ally, target, dt);
				if (currentDistance < desiredRange) {
					const driftAngle = ally.dir + Math.PI;
					moveUnit(ally, Math.cos(driftAngle) * ally.speed * 0.34 * dt, Math.sin(driftAngle) * ally.speed * 0.34 * dt);
				}
				return;
			}

			const advanceStep = Math.min(ally.speed * dt, Math.max(0, currentDistance - desiredRange));
			moveUnit(ally, Math.cos(ally.dir) * advanceStep, Math.sin(ally.dir) * advanceStep);
			return;
		}

		const home = stageId === "brazilCoast" && ally.anchor ? ally.anchor : state.player;
		if (!home) return;
		const spacing = stageId === "brazilCoast" ? 36 : ally.followDistance;
		const homeDistance = dist(ally, home);
		if (homeDistance > spacing) {
			ally.dir = angleTo(ally, home);
			const step = Math.min(ally.speed * dt, homeDistance - spacing);
			moveUnit(ally, Math.cos(ally.dir) * step, Math.sin(ally.dir) * step);
		}
	}

	function seedStage() {
		state.player = createStageUnit("jeannePlayer", stage.playerSpawn.x, stage.playerSpawn.y);
		applyJeanneProgressToPlayer(state.player, true);

		if (stageId === "orleans") {
			state.gate = {
				x: stage.gate.x,
				y: stage.gate.y,
				w: stage.gate.w,
				h: stage.gate.h,
				hp: stage.gate.hp,
				maxHp: stage.gate.hp
			};
			state.spawnsLeft = 3;
			state.spawnTimer = 8;
			for (let i = 0; i < 5; i += 1) {
				state.allies.push(createStageUnit("orleansDefender", 520 + (i % 2) * 68, 580 + i * 80, {
					mounted: i < 2,
					anchor: { x: 520 + (i % 2) * 68, y: 580 + i * 80 }
				}));
			}
			for (let i = 0; i < 9; i += 1) {
				state.enemies.push(createStageUnit("englishFootman", 1550 + (i % 3) * 130 + rand(-26, 26), 470 + Math.floor(i / 3) * 170 + rand(-24, 24)));
			}
			state.enemies.push(createStageUnit("englishCommander", 1960, 700));
		}

		if (stageId === "reims") {
			state.vip = createStageUnit("charles", 480, 1130);
			state.allies.push(state.vip);
			for (let i = 0; i < 4; i += 1) {
				state.allies.push(createStageUnit("royalEscort", 430 + i * 44, 1040 + (i % 2) * 90));
			}
			for (let i = 0; i < 6; i += 1) {
				state.enemies.push(createStageUnit("ambusher", 980 + (i % 3) * 90, 820 + Math.floor(i / 3) * 120));
			}
			state.wavesTriggered = [false, false];
		}

		if (stageId === "picardy") {
			state.obstacles = [
				{ x: 960, y: 0, w: 80, h: 540 },
				{ x: 960, y: 700, w: 80, h: 700 },
				{ x: 1320, y: 320, w: 260, h: 80 },
				{ x: 1320, y: 980, w: 260, h: 80 },
				{ x: 1710, y: 0, w: 80, h: 620 },
				{ x: 1710, y: 780, w: 80, h: 620 }
			];
			for (let i = 0; i < 4; i += 1) {
				state.allies.push(createStageUnit("royalEscort", 520 + i * 58, 760 + (i % 2) * 90, {
					anchor: { x: 520 + i * 58, y: 760 + (i % 2) * 90 }
				}));
			}
			for (let i = 0; i < 4; i += 1) {
				state.allies.push(createStageUnit("orleansDefender", 760 + (i % 2) * 72, 560 + Math.floor(i / 2) * 150, {
					anchor: { x: 760 + (i % 2) * 72, y: 560 + Math.floor(i / 2) * 150 }
				}));
			}
			state.initialAllies = state.allies.length;
			for (let i = 0; i < 6; i += 1) {
				state.enemies.push(createStageUnit("ambusher", 1440 + (i % 3) * 120 + rand(-18, 18), 500 + Math.floor(i / 3) * 220 + rand(-20, 20), {
					label: "勃艮第枪兵"
				}));
			}
			state.enemies.push(createStageUnit("englishCommander", 1920, 700, {
				label: "勃艮第公爵",
				hp: 320,
				damage: 28,
				speed: 94
			}));
			state.enemies.push(createStageUnit("englishCommander", 2040, 420, {
				label: "考雄主教",
				hp: 260,
				damage: 22,
				speed: 84,
				appearance: {
					body: "#6f4d63",
					head: "#efcfb1",
					accent: "#d9c8a6",
					trim: "#2a1827",
					hair: "#2d1a17",
					weapon: "#eceff4",
					plume: "#b79bb3",
					cape: "#4b3346",
					helmet: true
				}
			}));
		}

		if (stageId === "england") {
			state.player.speed = 0;
			state.player.dir = -Math.PI / 2;
			state.objectiveText = "等待火焰燃起";
		}

		if (stageId === "rouen") {
			state.obstacles = [
				{ x: 540, y: 0, w: 80, h: 980 },
				{ x: 1040, y: 420, w: 80, h: 500 },
				{ x: 1520, y: 0, w: 80, h: 1000 },
				{ x: 600, y: 920, w: 420, h: 80 },
				{ x: 1120, y: 340, w: 360, h: 80 },
				{ x: 1600, y: 920, w: 340, h: 80 }
			];
			const patrols = [
				[{ x: 460, y: 1100 }, { x: 460, y: 700 }],
				[{ x: 820, y: 1110 }, { x: 820, y: 840 }],
				[{ x: 1180, y: 620 }, { x: 1450, y: 620 }],
				[{ x: 1740, y: 1080 }, { x: 2060, y: 1080 }],
				[{ x: 1740, y: 540 }, { x: 2060, y: 540 }]
			];
			for (const patrol of patrols) {
				state.enemies.push(createStageUnit("prisonGuard", patrol[0].x, patrol[0].y, {
					patrol,
				}));
			}
			state.allies.push(spawnZhengHe(360, 1180));
		}

		if (stageId === "spain") {
			state.allies.push(spawnZhengHe(460, 980));
			for (let i = 0; i < 3; i += 1) {
				state.allies.push(createStageUnit("vikingWarrior", 360 + i * 70, 1110 + (i % 2) * 60));
			}
			for (let i = 0; i < 8; i += 1) {
				state.enemies.push(createStageUnit("spanishGuard", 980 + (i % 4) * 120, 680 + Math.floor(i / 4) * 160));
			}
			state.enemies.push(createStageUnit("spanishGovernor", 1870, 520));
			state.spawnsLeft = 3;
			state.spawnTimer = 7;
		}

		if (stageId === "portugal") {
			state.allies.push(spawnZhengHe(420, 940));
			for (let i = 0; i < 2; i += 1) {
				state.allies.push(createStageUnit("vikingWarrior", 300 + i * 90, 1060 + i * 40));
			}
			for (let i = 0; i < 8; i += 1) {
				state.enemies.push(createStageUnit("spanishGuard", 1220 + (i % 4) * 130, 620 + Math.floor(i / 4) * 190, {
					label: "港口卫兵"
				}));
			}
			state.enemies.push(createStageUnit("spanishGovernor", 1880, 700, {
				label: "港务总督"
			}));
			state.spawnsLeft = 2;
			state.spawnTimer = 6.5;
		}

		if (stageId === "brazilCoast") {
			state.allies.push(spawnZhengHe(420, 1000));
			state.allies.push(spawnAnita(560, 980));
			state.screenShout = {
				text: hasHeroFlag("anita") ? "阿妮塔：海岸这边我来压，你们往前推。" : "阿妮塔：终于到了？别看了，先把海岸打下来。",
				life: 1.4
			};
			state.shouts.push({ x: 560, y: 920, text: "阿妮塔", life: 1.5 });
			for (let i = 0; i < 8; i += 1) {
				state.enemies.push(createStageUnit("spanishGuard", 980 + (i % 4) * 120, 720 + Math.floor(i / 4) * 170, {
					label: "海岸卫兵"
				}));
			}
			state.enemies.push(createStageUnit("spanishGovernor", 1740, 520, {
				label: "海岸总督"
			}));
			state.spawnsLeft = 3;
			state.spawnTimer = 7.5;
		}

		if (stageId === "brazilJungle") {
			state.allies.push(spawnZhengHe(360, 1080));
			state.allies.push(spawnAnita(620, 1040));
			state.anitaJoined = true;
			state.screenShout = {
				text: hasHeroFlag("anita") ? "阿妮塔：雨林这段我熟，跟我压过去。" : "阿妮塔：这边，先跟我穿过去。",
				life: 1.35
			};
			state.shouts.push({ x: 620, y: 980, text: hasHeroFlag("anita") ? "阿妮塔已在队伍中" : "阿妮塔现身", life: 1.45 });
			for (let i = 0; i < 2; i += 1) {
				state.allies.push(createStageUnit("royalEscort", 260 + i * 70, 1160 - i * 50, {
					label: "雨林向导"
				}));
			}
			for (let i = 0; i < 7; i += 1) {
				state.enemies.push(createStageUnit("ambusher", 920 + (i % 3) * 220 + rand(-20, 20), 860 - Math.floor(i / 3) * 230 + rand(-20, 20), {
					label: "雨林伏兵"
				}));
			}
			state.enemies.push(createStageUnit("englishCommander", 1880, 320, {
				label: "林地猎长",
				hp: 280,
				damage: 24,
				speed: 102,
				appearance: {
					body: "#5d6b33",
					head: "#e7c9a7",
					accent: "#d9d28a",
					trim: "#273014",
					hair: "#33241a",
					weapon: "#eef3f4",
					plume: "#85904d",
					cape: "#465322"
				}
			}));
			state.wavesTriggered = [false, false];
		}

		if (stageId === "brazilRise") {
			state.gate = {
				x: stage.gate.x,
				y: stage.gate.y,
				w: stage.gate.w,
				h: stage.gate.h,
				hp: stage.gate.hp,
				maxHp: stage.gate.hp
			};
			state.allies.push(spawnZhengHe(500, 880));
			if (hasHeroFlag("anita")) state.allies.push(spawnAnita(620, 900));
			state.allies.push(spawnPedro(470, 840));
			for (let i = 0; i < 2; i += 1) {
				state.allies.push(createStageUnit("vikingWarrior", 560 + i * 80, 960 + (i % 2) * 70));
				state.allies.push(createStageUnit("royalEscort", 420 + i * 70, 640 + i * 90, {
					label: "巴西义军"
				}));
			}
			for (let i = 0; i < 9; i += 1) {
				state.enemies.push(createStageUnit("spanishGuard", 1460 + (i % 3) * 150 + rand(-24, 24), 420 + Math.floor(i / 3) * 200 + rand(-18, 18), {
					label: "殖民军"
				}));
			}
			state.enemies.push(createStageUnit("englishCommander", 1940, 720, {
				label: "殖民队长",
				hp: 300,
				damage: 25,
				speed: 92
			}));
			state.spawnsLeft = 3;
			state.spawnTimer = 7.2;
		}

		if (stageId === "mali") {
			state.allies.push(spawnZhengHe(520, 900));
			if (hasHeroFlag("anita")) state.allies.push(spawnAnita(630, 960));
			state.allies.push(spawnPedro(450, 980));
			for (let i = 0; i < 3; i += 1) {
				state.allies.push(createStageUnit("royalEscort", 340 + i * 80, 860 + i * 70, {
					label: "商队护卫"
				}));
			}
			for (let i = 0; i < 8; i += 1) {
				state.enemies.push(createStageUnit("spanishGuard", 1380 + (i % 4) * 120 + rand(-18, 18), 460 + Math.floor(i / 4) * 210 + rand(-18, 18), {
					label: "商路卫兵"
				}));
			}
			state.enemies.push(createStageUnit("englishCommander", 1890, 680, {
				label: "黄金卫队长",
				hp: 320,
				damage: 26,
				speed: 94,
				appearance: {
					body: "#71522f",
					head: "#e6c6a0",
					accent: "#d4b45b",
					trim: "#362112",
					hair: "#20150e",
					weapon: "#f3f1e8",
					plume: "#e0c164",
					cape: "#5b2a16"
				}
			}));
			state.spawnsLeft = 2;
			state.spawnTimer = 8.4;
		}
	}

	function resolveObstacles(unit) {
		for (const obstacle of state.obstacles) {
			const closestX = clamp(unit.x, obstacle.x, obstacle.x + obstacle.w);
			const closestY = clamp(unit.y, obstacle.y, obstacle.y + obstacle.h);
			const dx = unit.x - closestX;
			const dy = unit.y - closestY;
			const d = Math.hypot(dx, dy);
			if (d > 0 && d < unit.radius) {
				const overlap = unit.radius - d;
				unit.x += (dx / d) * overlap;
				unit.y += (dy / d) * overlap;
			}
		}
		unit.x = clamp(unit.x, unit.radius, state.worldW - unit.radius);
		unit.y = clamp(unit.y, unit.radius, state.worldH - unit.radius);
	}

	function moveUnit(unit, dx, dy) {
		unit.x += dx;
		resolveObstacles(unit);
		unit.y += dy;
		resolveObstacles(unit);
	}

	function hitUnit(unit, damage, sourceAngle, sourceUnit) {
		if (!unit || unit.dead) return;
		unit.hp -= damage;
		unit.hitFlash = 0.16;
		if (unit.hp <= 0) {
			unit.dead = true;
			if (sourceUnit && sourceUnit.isPlayer) {
				awardJeanneExperience(getJeanneKillReward(unit));
			}
			for (let i = 0; i < 10; i += 1) {
				state.particles.push({
					x: unit.x,
					y: unit.y,
					vx: Math.cos(rand(0, Math.PI * 2)) * rand(40, 120),
					vy: Math.sin(rand(0, Math.PI * 2)) * rand(40, 120),
					life: rand(0.25, 0.65),
					color: unit.team === "enemy" ? "rgba(245,120,92,0.85)" : "rgba(255,232,180,0.75)"
				});
			}
		}
		if (typeof sourceAngle === "number") {
			unit.x += Math.cos(sourceAngle) * 10;
			unit.y += Math.sin(sourceAngle) * 10;
			resolveObstacles(unit);
		}
	}

	function nearestLiving(list, origin, range) {
		let best = null;
		let bestDist = range || Infinity;
		for (const unit of list) {
			if (!unit || unit.dead) continue;
			const d = dist(origin, unit);
			if (d < bestDist) {
				bestDist = d;
				best = unit;
			}
		}
		return best;
	}

	function spawnSwordSweep(attacker) {
		state.swordSweeps.push({
			x: attacker.x,
			y: attacker.y - 4,
			dir: attacker.dir,
			life: 0.22,
			maxLife: 0.22,
			radius: 58
		});
	}

	function spawnHitSparks(target, angle) {
		for (let i = 0; i < 7; i += 1) {
			const spread = angle + rand(-0.65, 0.65);
			state.hitSparks.push({
				x: target.x + Math.cos(spread) * rand(8, 18),
				y: target.y + Math.sin(spread) * rand(8, 18),
				vx: Math.cos(spread) * rand(70, 180),
				vy: Math.sin(spread) * rand(70, 180),
				life: rand(0.08, 0.18),
				maxLife: 0.18,
				color: i % 2 === 0 ? "rgba(255, 244, 176, 0.95)" : "rgba(255, 197, 103, 0.9)"
			});
		}
	}

	function spawnAnitaShotFx(attacker, target) {
		const muzzleX = attacker.x + Math.cos(attacker.dir) * 18;
		const muzzleY = attacker.y - 8 + Math.sin(attacker.dir) * 18;
		const impactX = target.x;
		const impactY = target.y - 6;
		state.tracers.push({
			x1: muzzleX,
			y1: muzzleY,
			x2: impactX,
			y2: impactY,
			life: 0.11,
			maxLife: 0.11
		});
		state.muzzleFlashes.push({
			x: muzzleX,
			y: muzzleY,
			dir: attacker.dir,
			life: 0.09,
			maxLife: 0.09,
			radius: 15
		});
		for (let i = 0; i < 4; i += 1) {
			const spread = attacker.dir + rand(-0.22, 0.22);
			state.particles.push({
				x: muzzleX,
				y: muzzleY,
				vx: Math.cos(spread) * rand(110, 240),
				vy: Math.sin(spread) * rand(110, 240),
				life: rand(0.05, 0.12),
				color: i % 2 === 0 ? "rgba(255, 228, 162, 0.95)" : "rgba(255, 144, 86, 0.82)"
			});
		}
	}

	function attemptAttack(attacker, target, dt) {
		if (!target || target.dead || attacker.dead) return false;
		const d = dist(attacker, target);
		if (d <= attacker.attackRange + target.radius + attacker.radius) {
			if (attacker.attackCd <= 0) {
				attacker.attackCd = attacker.kind === "player" ? 0.42 : attacker.kind === "anita" ? 0.92 : 0.7;
				attacker.attackAnim = attacker.kind === "player" ? 0.42 : attacker.kind === "anita" ? 0.22 : 0.18;
				if (attacker.kind === "player") spawnSwordSweep(attacker);
				hitUnit(target, attacker.damage, attacker.kind === "anita" ? undefined : attacker.dir, attacker);
				if (attacker.kind === "player") {
					spawnHitSparks(target, attacker.dir);
					for (let i = 0; i < 5; i += 1) {
						state.particles.push({
							x: target.x,
							y: target.y,
							vx: rand(-60, 60),
							vy: rand(-60, 60),
							life: rand(0.1, 0.3),
							color: "rgba(255, 230, 177, 0.8)"
						});
					}
				} else if (attacker.kind === "anita") {
					spawnAnitaShotFx(attacker, target);
					spawnHitSparks(target, attacker.dir);
					state.particles.push({
						x: attacker.x,
						y: attacker.y - 8,
						vx: Math.cos(attacker.dir) * 260,
						vy: Math.sin(attacker.dir) * 260,
						life: 0.12,
						color: "rgba(255, 228, 162, 0.95)"
					});
					target.alerted = Math.max(target.alerted || 0, 0.9);
				}
			}
			return true;
		}
		const step = (attacker.speed * (attacker.boost > 0 ? 1.18 : 1)) * dt;
		attacker.dir = angleTo(attacker, target);
		moveUnit(attacker, Math.cos(attacker.dir) * step, Math.sin(attacker.dir) * step);
		return false;
	}

	function castFreedomCry() {
		const player = state.player;
		if (stageId === "england") return;
		if (state.dialogOpen || state.resultOpen || state.paused || player.dead || player.skillCd > 0) return;
		player.skillCd = 8;
		state.shouts.push({ x: player.x, y: player.y - 58, text: "为了自由！", life: 1.45 });
		state.shockwaves.push({ x: player.x, y: player.y, r: 8, life: 1 });
		state.screenShout = { text: "为了自由！", life: 1.05 };
		for (const ally of state.allies) {
			if (!ally.dead && dist(player, ally) < 220) ally.boost = 2.6;
		}
		for (const enemy of state.enemies) {
			if (enemy.dead) continue;
			const d = dist(player, enemy);
			if (d < 220) {
				const ang = angleTo(player, enemy);
				hitUnit(enemy, 38, ang, player);
				enemy.x += Math.cos(ang) * 48;
				enemy.y += Math.sin(ang) * 48;
				resolveObstacles(enemy);
				enemy.alerted = 1.2;
			}
		}
	}

	function castZhengHeSkill(ally) {
		if (!ally || ally.dead || ally.skillCd > 0) return false;
		const nearbyThreat = state.enemies.some((enemy) => !enemy.dead && dist(ally, enemy) < 185);
		const shouldCast = nearbyThreat || (stageId === "rouen" && state.detection > 28);
		if (!shouldCast) return false;
		const nauticalLines = ["借潮过去。", "起雾，走。", "顺风脱身。"];

		ally.skillCd = stageId === "rouen" ? 9.5 : 12;
		state.shouts.push({ x: ally.x, y: ally.y - 54, text: "海雾护航", life: 1.25 });
		state.shouts.push({ x: ally.x, y: ally.y - 84, text: nauticalLines[Math.floor(Math.random() * nauticalLines.length)], life: 1.05 });
		state.shockwaves.push({ x: ally.x, y: ally.y, r: 10, life: 0.82 });
		state.mistBursts.push({ x: ally.x, y: ally.y, r: 26, life: 0.95, maxLife: 0.95 });

		for (const friendly of [state.player, ...state.allies]) {
			if (!friendly || friendly.dead) continue;
			if (dist(ally, friendly) < 220) {
				friendly.boost = Math.max(friendly.boost || 0, 2.4);
				friendly.hp = Math.min(friendly.maxHp, friendly.hp + 14);
			}
		}

		for (const enemy of state.enemies) {
			if (!enemy || enemy.dead) continue;
			const d = dist(ally, enemy);
			if (d < 180) {
				const ang = angleTo(ally, enemy);
				hitUnit(enemy, 20, ang);
				enemy.x += Math.cos(ang) * 34;
				enemy.y += Math.sin(ang) * 34;
				resolveObstacles(enemy);
				enemy.alerted = 0;
			}
		}

		if (stageId === "rouen") state.detection = clamp(state.detection - 40, 0, 100);

		for (let i = 0; i < 14; i += 1) {
			state.particles.push({
				x: ally.x + rand(-28, 28),
				y: ally.y + rand(-20, 20),
				vx: rand(-70, 70),
				vy: rand(-70, 70),
				life: rand(0.18, 0.4),
				color: i % 2 === 0 ? "rgba(196, 233, 247, 0.85)" : "rgba(130, 190, 214, 0.72)"
			});
		}
		return true;
	}

	function castAnitaSkill(ally) {
		if (!ally || ally.dead || ally.skillCd > 0) return false;
		const threats = state.enemies.filter((enemy) => !enemy.dead && dist(ally, enemy) < 280);
		if (threats.length < 2) return false;

		ally.skillCd = 10.5;
		state.shouts.push({ x: ally.x, y: ally.y - 54, text: "点掉前排！", life: 1.15 });
		state.screenShout = { text: "阿妮塔：拉开，放他们空枪。", life: 1.05 };
		state.shockwaves.push({ x: ally.x, y: ally.y, r: 12, life: 0.88 });

		for (const friendly of [state.player, ...state.allies]) {
			if (!friendly || friendly.dead) continue;
			if (dist(ally, friendly) < 170) friendly.boost = Math.max(friendly.boost || 0, 1.8);
		}

		for (const enemy of threats.slice(0, 4)) {
			const ang = angleTo(ally, enemy);
			hitUnit(enemy, 24, ang);
			enemy.x += Math.cos(ang) * 18;
			enemy.y += Math.sin(ang) * 18;
			resolveObstacles(enemy);
			enemy.alerted = 1.4;
			spawnHitSparks(enemy, ang);
		}

		for (let i = 0; i < 16; i += 1) {
			state.particles.push({
				x: ally.x + rand(-26, 26),
				y: ally.y + rand(-18, 18),
				vx: rand(-92, 92),
				vy: rand(-84, 84),
				life: rand(0.18, 0.42),
				color: i % 2 === 0 ? "rgba(255, 210, 112, 0.88)" : "rgba(208, 80, 50, 0.8)"
			});
		}
		return true;
	}

	function getUnitSkillBadge(unit) {
		if (!unit || unit.dead) return null;
		if (unit.isPlayer) {
			if (stageId === "england") return null;
			return {
				label: unit.skillCd > 0 ? `${Math.ceil(unit.skillCd)}s` : "为了自由",
				ready: unit.skillCd <= 0,
				action: castFreedomCry
			};
		}
		return null;
	}

	function updatePlayer(dt) {
		const player = state.player;
		player.attackCd = Math.max(0, player.attackCd - dt);
		player.attackAnim = Math.max(0, player.attackAnim - dt);
		player.skillCd = Math.max(0, player.skillCd - dt);
		player.hitFlash = Math.max(0, player.hitFlash - dt);
		if (player.dead) return;
		if (stageId === "england") {
			state.moveTarget = null;
			return;
		}

		let moveX = 0;
		let moveY = 0;
		if (isMobileUI && mobileStick.magnitude > 0.08) {
			moveX += mobileStick.x / mobileStick.maxRadius;
			moveY += mobileStick.y / mobileStick.maxRadius;
		}
		if (keys.up) moveY -= 1;
		if (keys.down) moveY += 1;
		if (keys.left) moveX -= 1;
		if (keys.right) moveX += 1;

		if (moveX || moveY) {
			const len = Math.hypot(moveX, moveY) || 1;
			moveX /= len;
			moveY /= len;
			player.dir = Math.atan2(moveY, moveX);
			moveUnit(player, moveX * player.speed * dt, moveY * player.speed * dt);
			state.moveTarget = null;
		} else if (state.moveTarget) {
			const d = dist(player, state.moveTarget);
			if (d > 6) {
				player.dir = angleTo(player, state.moveTarget);
				const step = Math.min(d, player.speed * dt);
				moveUnit(player, Math.cos(player.dir) * step, Math.sin(player.dir) * step);
			} else {
				state.moveTarget = null;
			}
		}

		const target = nearestLiving(state.enemies, player, 70);
		if (target) attemptAttack(player, target, dt);
	}

	function updateAllies(dt) {
		const player = state.player;
		for (const ally of state.allies) {
			if (!ally || ally.dead) continue;
			ally.attackCd = Math.max(0, ally.attackCd - dt);
			ally.attackAnim = Math.max(0, ally.attackAnim - dt);
			ally.skillCd = Math.max(0, ally.skillCd - dt);
			ally.hitFlash = Math.max(0, ally.hitFlash - dt);
			ally.boost = Math.max(0, ally.boost - dt);

			if (ally.kind === "rescuer") castZhengHeSkill(ally);
			if (ally.kind === "anita") castAnitaSkill(ally);
			if (ally.kind === "anita") {
				updateAnitaAlly(ally, dt);
				continue;
			}

			if (ally.isVip) {
				const guardDistance = dist(player, ally);
				if (guardDistance < 220) {
					const follow = { x: player.x - 40, y: player.y + 18 };
					const d = dist(ally, follow);
					if (d > 12) {
						ally.dir = angleTo(ally, follow);
						moveUnit(ally, Math.cos(ally.dir) * Math.min(d, ally.speed * dt), Math.sin(ally.dir) * Math.min(d, ally.speed * dt));
					}
				}
				continue;
			}

			if (stageId === "rouen" && ally.isViking) continue;

			const target = nearestLiving(state.enemies, ally, 170);
			if (target) {
				attemptAttack(ally, target, dt);
				continue;
			}

			let followPoint = player;
			if ((stageId === "orleans" || stageId === "picardy") && ally.anchor && !state.betrayalTriggered) followPoint = ally.anchor;
			const desired = typeof followPoint.x === "number" ? followPoint : player;
			const d = dist(ally, desired);
			if (d > ally.followDistance) {
				ally.dir = angleTo(ally, desired);
				const step = ally.speed * (ally.boost > 0 ? 1.15 : 1) * dt;
				moveUnit(ally, Math.cos(ally.dir) * Math.min(step, d), Math.sin(ally.dir) * Math.min(step, d));
			}
		}
	}

	function enemyStageTarget(enemy) {
		if (stageId === "england") return null;
		if (stageId === "orleans") {
			const playerNear = dist(enemy, state.player) < 220 ? state.player : null;
			if (playerNear) return playerNear;
			const ally = nearestLiving(state.allies, enemy, 200);
			if (ally) return ally;
			return state.gate;
		}
		if (stageId === "reims") {
			const vip = state.vip && !state.vip.dead ? state.vip : null;
			if (vip && dist(enemy, vip) < 210) return vip;
			const ally = nearestLiving([state.player, ...state.allies], enemy, 220);
			return ally || state.player;
		}
		if (stageId === "rouen") {
			if (enemy.alerted > 0 || state.alarm) return state.player;
			return null;
		}
		const ally = nearestLiving([state.player, ...state.allies], enemy, 220);
		return ally || state.player;
	}

	function updateEnemies(dt) {
		for (const enemy of state.enemies) {
			if (!enemy || enemy.dead) continue;
			enemy.attackCd = Math.max(0, enemy.attackCd - dt);
			enemy.attackAnim = Math.max(0, enemy.attackAnim - dt);
			enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
			enemy.boost = Math.max(0, enemy.boost - dt);
			enemy.alerted = Math.max(0, enemy.alerted - dt);

			if (stageId === "rouen" && enemy.patrol && enemy.alerted <= 0 && !state.alarm) {
				const toPlayer = angleTo(enemy, state.player);
				const seenDistance = dist(enemy, state.player);
				const diff = Math.abs(normalizeAngle(toPlayer - enemy.dir));
				if (seenDistance < enemy.visionRange && diff < enemy.visionArc) {
					state.detection = clamp(state.detection + 72 * dt, 0, 100);
					enemy.alerted = 1.2;
				}
				const patrolPoint = enemy.patrol[enemy.patrolIndex];
				const d = dist(enemy, patrolPoint);
				if (d < 10) {
					enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
				} else {
					enemy.dir = angleTo(enemy, patrolPoint);
					moveUnit(enemy, Math.cos(enemy.dir) * enemy.speed * dt, Math.sin(enemy.dir) * enemy.speed * dt);
				}
				continue;
			}

			const target = enemyStageTarget(enemy);
			if (!target) continue;

			if (stageId === "orleans" && target === state.gate) {
				const gateCenter = { x: state.gate.x, y: state.gate.y };
				const d = dist(enemy, gateCenter);
				enemy.dir = angleTo(enemy, gateCenter);
				if (d <= 64) {
					if (enemy.attackCd <= 0) {
						enemy.attackCd = 0.85;
						state.gate.hp -= enemy.isCommander ? 18 : 9;
					}
				} else {
					moveUnit(enemy, Math.cos(enemy.dir) * enemy.speed * dt, Math.sin(enemy.dir) * enemy.speed * dt);
				}
				continue;
			}

			attemptAttack(enemy, target, dt);
		}
	}

	function spawnEnemyWave(count, area, label) {
		const templateId = label === "狱卒援军"
			? "prisonReinforcement"
			: stageId === "orleans"
				? "englishFootman"
				: stageId === "reims" || stageId === "brazilJungle"
					? "ambusher"
					: stageId === "spain" || stageId === "portugal" || stageId === "brazilCoast" || stageId === "brazilRise" || stageId === "mali"
						? "spanishGuard"
						: "englishFootman";
		for (let i = 0; i < count; i += 1) {
			state.enemies.push(createStageUnit(templateId, rand(area.x1, area.x2), rand(area.y1, area.y2), label ? { label: label } : null));
		}
	}

	function triggerPicardyBetrayal() {
		if (stageId !== "picardy" || state.betrayalTriggered) return;
		state.betrayalTriggered = true;
		state.objectiveText = "背叛已经开始，尽量撑住阵线";
		state.collapseTimer = 18;
		state.allyLossTimer = 2.8;
		state.spawnTimer = 2.6;
		state.despair = 18;
		state.screenShout = { text: "被出卖了！", life: 1.2 };
		state.shouts.push({ x: state.player.x, y: state.player.y - 60, text: "退路被关上了！", life: 1.5 });
		state.enemies.push(createStageUnit("englishCommander", 320, 1100, {
			label: "拉特雷穆瓦耶",
			kind: "traitor",
			hp: 280,
			damage: 24,
			speed: 98,
			appearance: {
				body: "#6f6c78",
				head: "#ebcfb1",
				accent: "#d8dce6",
				trim: "#2b2e36",
				hair: "#2f1f19",
				weapon: "#eef2f7",
				plume: "#c9ced7",
				cape: "#505661",
				helmet: true,
				surcoat: "#c7ccd6"
			}
		}));
		for (let i = 0; i < 4; i += 1) {
			state.enemies.push(createStageUnit("royalEscort", 380 + (i % 2) * 72, 900 + Math.floor(i / 2) * 110, {
				team: "enemy",
				kind: "traitor",
				label: "宫廷侍卫"
			}));
		}
		for (let i = 0; i < 4; i += 1) {
			state.enemies.push(createStageUnit("ambusher", 1660 + (i % 2) * 150, 470 + Math.floor(i / 2) * 300, {
				label: "勃艮第枪兵"
			}));
		}
		const doomed = state.allies.filter((unit) => !unit.dead).slice(0, 3);
		for (const ally of doomed) {
			hitUnit(ally, ally.hp + 999, angleTo(state.player, ally));
		}
	}

	function updateStageLogic(dt) {
		state.stageTimer += dt;
		const player = state.player;
		if (maybeTriggerPeaceScene()) return;
		if (stageId === "orleans") {
			if (state.spawnsLeft > 0) {
				state.spawnTimer -= dt;
				if (state.spawnTimer <= 0) {
					state.spawnTimer = 10.5;
					state.spawnsLeft -= 1;
					spawnEnemyWave(4, { x1: 1800, x2: 2200, y1: 380, y2: 1040 });
				}
			}
			if (state.gate.hp <= 0) {
				showResult(false, "奥尔良失守", "城门被彻底击穿，奥尔良落入英军手中。\n\n这一关的核心就是顶住第一轮压力，再去斩塔尔博特。", stage.nextPage);
			}
			const commanderAlive = state.enemies.some((enemy) => enemy.isCommander && !enemy.dead);
			const livingEnemies = state.enemies.some((enemy) => !enemy.dead);
			if (!commanderAlive && !livingEnemies) {
				showResult(true, stage.victoryTitle, stage.victoryText, stage.nextPage);
			}
		}

		if (stageId === "reims") {
			if (!state.wavesTriggered[0] && player.x > 980) {
				state.wavesTriggered[0] = true;
				spawnEnemyWave(4, { x1: 1180, x2: 1400, y1: 620, y2: 980 });
			}
			if (!state.wavesTriggered[1] && player.x > 1480) {
				state.wavesTriggered[1] = true;
				spawnEnemyWave(5, { x1: 1580, x2: 1760, y1: 380, y2: 740 });
			}
			if (state.vip && state.vip.hp <= 0 && !state.vip.dead) state.vip.dead = true;
			if (state.vip && state.vip.dead) {
				showResult(false, "加冕失败", "查理国王倒在路上，兰斯的钟声不会为他而鸣。\n\n这一关要保持你与查理国王距离不要太远。", stage.nextPage);
			}
			if (state.vip && !state.vip.dead) {
				const goal = stage.goalZone;
				if (Math.hypot(state.vip.x - goal.x, state.vip.y - goal.y) < goal.r && Math.hypot(player.x - goal.x, player.y - goal.y) < goal.r + 20) {
					showResult(true, stage.victoryTitle, stage.victoryText, stage.nextPage);
				}
			}
		}

		if (stageId === "picardy") {
			if (!state.betrayalTriggered && (state.stageTimer >= 12 || player.x > 1040)) {
				triggerPicardyBetrayal();
			}
			if (state.betrayalTriggered) {
				state.collapseTimer = Math.max(0, state.collapseTimer - dt);
				state.despair = clamp((1 - state.collapseTimer / 18) * 100, 0, 100);
				state.spawnTimer -= dt;
				if (state.spawnTimer <= 0) {
					state.spawnTimer = 3.3;
					for (let i = 0; i < 2; i += 1) {
						state.enemies.push(createStageUnit("ambusher", rand(1620, 2000), rand(360, 1020), {
							label: "勃艮第枪兵"
						}));
						state.enemies.push(createStageUnit("royalEscort", rand(260, 520), rand(880, 1200), {
							team: "enemy",
							kind: "traitor",
							label: "宫廷侍卫"
						}));
					}
				}
				state.allyLossTimer -= dt;
				if (state.allyLossTimer <= 0) {
					state.allyLossTimer = 3.1;
					const doomedAlly = state.allies.find((unit) => !unit.dead);
					if (doomedAlly) hitUnit(doomedAlly, doomedAlly.hp + 999, angleTo(state.player, doomedAlly));
				}
				if (state.collapseTimer <= 0) {
					showResult(false, stage.defeatTitle, stage.defeatText, stage.nextPage, stage.nextLabel, true);
				}
			} else {
				state.despair = clamp(10 + state.stageTimer * 2.5, 0, 35);
			}
		}

		if (stageId === "england") {
			state.fireProgress = clamp((state.stageTimer - 1.2) * 22, 0, 100);
			if (state.stageTimer > 1.1) state.objectiveText = "火焰开始升起";
			if (!state.wavesTriggered[0] && state.stageTimer > 1.6) {
				state.wavesTriggered[0] = true;
				state.screenShout = { text: "英王：点火。", life: 1.1 };
			}
			if (state.stageTimer > 2 && Math.random() < 0.58) {
				state.particles.push({
					x: player.x + rand(-48, 48),
					y: player.y + rand(24, 68),
					vx: rand(-20, 20),
					vy: rand(-120, -40),
					life: rand(0.18, 0.42),
					color: Math.random() < 0.5 ? "rgba(255,188,92,0.85)" : "rgba(255,120,72,0.78)"
				});
			}
			if (!state.wavesTriggered[1] && state.stageTimer > 3.5) {
				state.wavesTriggered[1] = true;
				state.screenShout = { text: "主教：异端当焚。", life: 1.1 };
			}
			if (!state.wavesTriggered[2] && state.stageTimer > 4.9) {
				state.wavesTriggered[2] = true;
				state.screenShout = { text: "郑和：别死。", life: 1.1 };
			}
			if (!state.cinematicTriggered && state.stageTimer > 5.3) {
				state.cinematicTriggered = true;
			}
			if (state.stageTimer > 5.5) state.whiteFlash = Math.min(1, state.whiteFlash + dt * 3.8);
			if (state.stageTimer > 6.2) {
				showResult(true, stage.victoryTitle, stage.victoryText, stage.nextPage, stage.nextLabel);
			}
		}

		if (stageId === "rouen") {
			if (!state.cinematicTriggered) {
				state.cinematicTriggered = true;
				state.screenShout = { text: "郑和：跟紧我，我带你出去。", life: 1.2 };
			}
			if (!state.alarm && state.detection >= 100) {
				state.alarm = true;
				spawnEnemyWave(6, { x1: 1880, x2: 2180, y1: 420, y2: 1040 }, "狱卒援军");
			}
			if (!state.alarm) state.detection = clamp(state.detection - 22 * dt, 0, 100);
			if (state.escapeZone) {
				const zone = state.escapeZone;
				if (player.x > zone.x && player.x < zone.x + zone.w && player.y > zone.y && player.y < zone.y + zone.h) {
					showResult(true, stage.victoryTitle, stage.victoryText, stage.nextPage);
				}
			}
		}

		if (stageId === "spain") {
			const zone = stage.captureZone;
			const alliesInside = [player, ...state.allies].filter((unit) => !unit.dead && Math.hypot(unit.x - zone.x, unit.y - zone.y) < zone.r).length;
			const enemiesInside = state.enemies.filter((unit) => !unit.dead && Math.hypot(unit.x - zone.x, unit.y - zone.y) < zone.r).length;
			if (alliesInside > 0 && enemiesInside === 0) {
				state.captureProgress = clamp(state.captureProgress + 0.15 * dt * alliesInside, 0, 1);
			} else if (enemiesInside > 0) {
				state.captureProgress = clamp(state.captureProgress - 0.08 * dt * enemiesInside, 0, 1);
			}
			if (state.spawnsLeft > 0) {
				state.spawnTimer -= dt;
				if (state.spawnTimer <= 0) {
					state.spawnTimer = 11;
					state.spawnsLeft -= 1;
					spawnEnemyWave(4, { x1: 1680, x2: 2040, y1: 360, y2: 760 });
				}
			}
			const governorAlive = state.enemies.some((enemy) => enemy.kind === "governor" && !enemy.dead);
			if (!governorAlive && state.captureProgress >= 1) {
				showResult(true, stage.victoryTitle, stage.victoryText, stage.nextPage);
			}
		}

		if (stageId === "portugal") {
			const zone = stage.captureZone;
			const alliesInside = [player, ...state.allies].filter((unit) => !unit.dead && Math.hypot(unit.x - zone.x, unit.y - zone.y) < zone.r).length;
			const enemiesInside = state.enemies.filter((unit) => !unit.dead && Math.hypot(unit.x - zone.x, unit.y - zone.y) < zone.r).length;
			if (alliesInside > 0 && enemiesInside === 0) state.captureProgress = clamp(state.captureProgress + 0.16 * dt * alliesInside, 0, 1);
			else if (enemiesInside > 0) state.captureProgress = clamp(state.captureProgress - 0.09 * dt * enemiesInside, 0, 1);
			if (state.spawnsLeft > 0) {
				state.spawnTimer -= dt;
				if (state.spawnTimer <= 0) {
					state.spawnTimer = 9;
					state.spawnsLeft -= 1;
					spawnEnemyWave(4, { x1: 1780, x2: 2160, y1: 320, y2: 1080 }, "港口卫兵");
				}
			}
			const admiralAlive = state.enemies.some((enemy) => enemy.label === "港务总督" && !enemy.dead);
			if (!admiralAlive && state.captureProgress >= 1) showResult(true, stage.victoryTitle, stage.victoryText, stage.nextPage);
		}

		if (stageId === "brazilCoast") {
			const zone = stage.captureZone;
			const alliesInside = [player, ...state.allies].filter((unit) => !unit.dead && Math.hypot(unit.x - zone.x, unit.y - zone.y) < zone.r).length;
			const enemiesInside = state.enemies.filter((unit) => !unit.dead && Math.hypot(unit.x - zone.x, unit.y - zone.y) < zone.r).length;
			if (alliesInside > 0 && enemiesInside === 0) state.captureProgress = clamp(state.captureProgress + 0.17 * dt * alliesInside, 0, 1);
			else if (enemiesInside > 0) state.captureProgress = clamp(state.captureProgress - 0.08 * dt * enemiesInside, 0, 1);
			if (state.spawnsLeft > 0) {
				state.spawnTimer -= dt;
				if (state.spawnTimer <= 0) {
					state.spawnTimer = 8.5;
					state.spawnsLeft -= 1;
					spawnEnemyWave(4, { x1: 1480, x2: 2120, y1: 360, y2: 940 }, "海岸卫兵");
				}
			}
			const governorAlive = state.enemies.some((enemy) => enemy.label === "海岸总督" && !enemy.dead);
			if (!governorAlive && state.captureProgress >= 1) showResult(true, stage.victoryTitle, stage.victoryText, stage.nextPage);
		}

		if (stageId === "brazilJungle") {
			if (!state.wavesTriggered[0] && player.x > 980) {
				state.wavesTriggered[0] = true;
				spawnEnemyWave(4, { x1: 1140, x2: 1460, y1: 520, y2: 980 }, "雨林伏兵");
			}
			if (!state.wavesTriggered[1] && player.x > 1540) {
				state.wavesTriggered[1] = true;
				spawnEnemyWave(5, { x1: 1640, x2: 1940, y1: 220, y2: 720 }, "雨林伏兵");
			}
			const chiefAlive = state.enemies.some((enemy) => enemy.label === "林地猎长" && !enemy.dead);
			const zhengHe = state.allies.find((unit) => !unit.dead && unit.label === "郑和");
			const goal = stage.goalZone;
			if (!chiefAlive && state.anitaJoined && goal && Math.hypot(player.x - goal.x, player.y - goal.y) < goal.r && zhengHe && Math.hypot(zhengHe.x - goal.x, zhengHe.y - goal.y) < goal.r + 30) {
				unlockHeroFlag("anita");
				showResult(true, stage.victoryTitle, stage.victoryText, stage.nextPage);
			}
		}

		if (stageId === "brazilRise") {
			if (state.spawnsLeft > 0) {
				state.spawnTimer -= dt;
				if (state.spawnTimer <= 0) {
					state.spawnTimer = 9.2;
					state.spawnsLeft -= 1;
					spawnEnemyWave(4, { x1: 1720, x2: 2200, y1: 340, y2: 1120 }, "殖民军");
				}
			}
			if (state.gate.hp <= 0) {
				showResult(false, "据点失守", "巴西据点被攻破了。\n\n这一关要先守住入口，再出去追杀指挥官。", stage.nextPage);
			}
			const commanderAlive = state.enemies.some((enemy) => enemy.label === "殖民队长" && !enemy.dead);
			const livingEnemies = state.enemies.some((enemy) => !enemy.dead);
			if (!commanderAlive && !livingEnemies) {
				unlockHeroFlag("anita");
				showResult(true, stage.victoryTitle, stage.victoryText, stage.nextPage);
			}
		}

		if (stageId === "mali") {
			const zone = stage.captureZone;
			const alliesInside = [player, ...state.allies].filter((unit) => !unit.dead && Math.hypot(unit.x - zone.x, unit.y - zone.y) < zone.r).length;
			const enemiesInside = state.enemies.filter((unit) => !unit.dead && Math.hypot(unit.x - zone.x, unit.y - zone.y) < zone.r).length;
			if (alliesInside > 0 && enemiesInside === 0) state.captureProgress = clamp(state.captureProgress + 0.15 * dt * alliesInside, 0, 1);
			else if (enemiesInside > 0) state.captureProgress = clamp(state.captureProgress - 0.08 * dt * enemiesInside, 0, 1);
			if (state.spawnsLeft > 0) {
				state.spawnTimer -= dt;
				if (state.spawnTimer <= 0) {
					state.spawnTimer = 9.6;
					state.spawnsLeft -= 1;
					spawnEnemyWave(4, { x1: 1620, x2: 2140, y1: 380, y2: 980 }, "商路卫兵");
				}
			}
			const captainAlive = state.enemies.some((enemy) => enemy.label === "黄金卫队长" && !enemy.dead);
			if (!captainAlive && state.captureProgress >= 1) {
				showResult(true, stage.victoryTitle, stage.victoryText, stage.nextPage, stage.nextLabel);
			}
		}

		if (player.dead) {
			if (stageId === "picardy") {
				showResult(false, stage.defeatTitle, stage.defeatText, stage.nextPage, stage.nextLabel, true);
				return;
			}
			showResult(false, "贞德倒下了", "这一章失败了。\n\n你的核心节奏应该是先站住位，再用“为了自由！”打出破口。", stage.nextPage);
		}
	}

	function updateEffects(dt) {
		for (let i = state.shouts.length - 1; i >= 0; i -= 1) {
			const shout = state.shouts[i];
			shout.life -= 1.1 * dt;
			shout.y -= 30 * dt;
			if (shout.life <= 0) state.shouts.splice(i, 1);
		}
		for (let i = state.shockwaves.length - 1; i >= 0; i -= 1) {
			const ring = state.shockwaves[i];
			ring.life -= 1.35 * dt;
			ring.r += 330 * dt;
			if (ring.life <= 0) state.shockwaves.splice(i, 1);
		}
		for (let i = state.mistBursts.length - 1; i >= 0; i -= 1) {
			const burst = state.mistBursts[i];
			burst.life -= 1.1 * dt;
			burst.r += 180 * dt;
			if (burst.life <= 0) state.mistBursts.splice(i, 1);
		}
		for (let i = state.swordSweeps.length - 1; i >= 0; i -= 1) {
			const sweep = state.swordSweeps[i];
			sweep.life -= dt;
			if (sweep.life <= 0) state.swordSweeps.splice(i, 1);
		}
		for (let i = state.tracers.length - 1; i >= 0; i -= 1) {
			const tracer = state.tracers[i];
			tracer.life -= dt;
			if (tracer.life <= 0) state.tracers.splice(i, 1);
		}
		for (let i = state.muzzleFlashes.length - 1; i >= 0; i -= 1) {
			const flash = state.muzzleFlashes[i];
			flash.life -= dt;
			flash.radius += 34 * dt;
			if (flash.life <= 0) state.muzzleFlashes.splice(i, 1);
		}
		for (let i = state.hitSparks.length - 1; i >= 0; i -= 1) {
			const spark = state.hitSparks[i];
			spark.life -= dt;
			spark.x += spark.vx * dt;
			spark.y += spark.vy * dt;
			spark.vx *= 0.84;
			spark.vy *= 0.84;
			if (spark.life <= 0) state.hitSparks.splice(i, 1);
		}
		for (let i = state.particles.length - 1; i >= 0; i -= 1) {
			const particle = state.particles[i];
			particle.life -= dt;
			particle.x += particle.vx * dt;
			particle.y += particle.vy * dt;
			particle.vx *= 0.94;
			particle.vy *= 0.94;
			if (particle.life <= 0) state.particles.splice(i, 1);
		}
		if (state.screenShout) {
			state.screenShout.life -= dt;
			if (state.screenShout.life <= 0) state.screenShout = null;
		}
		state.whiteFlash = Math.max(0, state.whiteFlash - dt * 0.65);
	}

	function updateCamera() {
		const viewportW = canvas.width / camera.scale;
		const viewportH = canvas.height / camera.scale;
		camera.x = clamp(state.player.x - viewportW * 0.5, 0, Math.max(0, state.worldW - viewportW));
		camera.y = clamp(state.player.y - viewportH * 0.5, 0, Math.max(0, state.worldH - viewportH));
	}

	function drawGroundPattern(colorA) {
		ctx.fillStyle = colorA;
		ctx.fillRect(0, 0, state.worldW, state.worldH);
		ctx.fillStyle = "rgba(255,255,255,0.04)";
		for (let x = 0; x < state.worldW; x += 90) {
			for (let y = 0; y < state.worldH; y += 90) {
				ctx.beginPath();
				ctx.arc(x + ((x * 13 + y * 7) % 19), y + ((x * 3 + y * 5) % 23), 2, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}

	function drawTerrainSprite(spriteId, x, y, scale, opacity) {
		const sprite = TERRAIN_SPRITES[spriteId];
		if (!sprite) return;
		const atlas = sprite.atlas || terrainAtlas;
		if (!atlas.complete) return;
		const spriteScale = scale || 1;
		const drawW = sprite.w * spriteScale;
		const drawH = sprite.h * spriteScale;
		ctx.save();
		if (typeof opacity === "number") ctx.globalAlpha = opacity;
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(atlas, sprite.x, sprite.y, sprite.w, sprite.h, x - drawW * 0.5, y - drawH, drawW, drawH);
		ctx.restore();
	}

	function fillRegionWithPattern(image, x, y, width, height, options) {
		if (!image || !image.complete || width <= 0 || height <= 0) return false;
		const opacity = options && typeof options.opacity === "number" ? options.opacity : 1;
		const patternScale = options && options.patternScale ? options.patternScale : 1;
		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.imageSmoothingEnabled = false;
		ctx.beginPath();
		ctx.rect(x, y, width, height);
		ctx.clip();
		ctx.translate(x, y);
		ctx.scale(patternScale, patternScale);
		const pattern = ctx.createPattern(image, "repeat");
		if (!pattern) {
			ctx.restore();
			return false;
		}
		ctx.fillStyle = pattern;
		ctx.fillRect(0, 0, width / patternScale, height / patternScale);
		ctx.restore();
		return true;
	}

	function fillRegionWithAtlasSlice(image, source, x, y, width, height, options) {
		if (!image || !image.complete || !source || width <= 0 || height <= 0) return false;
		const opacity = options && typeof options.opacity === "number" ? options.opacity : 1;
		const tileScale = options && options.tileScale ? options.tileScale : 1;
		const tileW = source.w * tileScale;
		const tileH = source.h * tileScale;
		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.imageSmoothingEnabled = false;
		ctx.beginPath();
		ctx.rect(x, y, width, height);
		ctx.clip();
		for (let drawY = y; drawY < y + height; drawY += tileH) {
			for (let drawX = x; drawX < x + width; drawX += tileW) {
				ctx.drawImage(image, source.x, source.y, source.w, source.h, drawX, drawY, tileW, tileH);
			}
		}
		ctx.restore();
		return true;
	}

	function fillTreeRegion(x, y, width, height, options) {
		const opacity = options && typeof options.opacity === "number" ? options.opacity : 1;
		const baseFilled = fillRegionWithPattern(lpcGrassTileAtlas, x, y, width, height, {
			opacity,
			patternScale: 2
		});
		if (!baseFilled) return false;
		fillRegionWithPattern(lpcTreeAtlas, x, y, width, height, {
			opacity: Math.min(1, opacity * 0.72),
			patternScale: 1.35
		});
		return true;
	}

	function getTerrainPatternFill(groupName, width, height) {
		if (groupName === "tree") return () => fillTreeRegion;
		if (groupName === "goldRoad") return { image: terrainAtlas, source: MAGECITY_PATTERN_SLICES.road, tileScale: 1.6 };
		if (groupName === "rock") return { image: terrainAtlas, source: MAGECITY_PATTERN_SLICES.stone, tileScale: 1.3 };
		if ((groupName === "wallVertical" || groupName === "wallHorizontal") && (width > 0 || height > 0)) {
			return { image: terrainAtlas, source: MAGECITY_PATTERN_SLICES.wall, tileScale: 1.55 };
		}
		return null;
	}

	function drawAtlasSlice(image, source, destination, opacity) {
		if (!image || !image.complete || !source || !destination) return;
		ctx.save();
		if (typeof opacity === "number") ctx.globalAlpha = opacity;
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(
			image,
			source.x,
			source.y,
			source.w,
			source.h,
			destination.x,
			destination.y,
			destination.w,
			destination.h
		);
		ctx.restore();
	}

	function pickTerrainTile(groupName, tileX, tileY, seed) {
		const variants = TERRAIN_TILE_GROUPS[groupName];
		if (!variants || !variants.length) return null;
		const hash = Math.abs((((tileX + 1) * 73856093) ^ ((tileY + 1) * 19349663) ^ ((seed || 0) * 83492791)) >>> 0);
		return variants[hash % variants.length];
	}

	function pickTerrainTileCoarse(groupName, tileX, tileY, seed, coarseX, coarseY) {
		return pickTerrainTile(
			groupName,
			Math.floor(tileX / Math.max(1, coarseX || 1)),
			Math.floor(tileY / Math.max(1, coarseY || 1)),
			seed
		);
	}

	function drawTerrainTile(tile, drawX, drawY, drawW, drawH, options) {
		const requestedInset = options && typeof options.inset === "number" ? options.inset : TERRAIN_TILE_INSET;
		const insetX = options && typeof options.insetX === "number" ? options.insetX : requestedInset;
		const insetY = options && typeof options.insetY === "number" ? options.insetY : requestedInset;
		const overlap = options && typeof options.overlap === "number" ? options.overlap : 0;
		const cropX = Math.min(insetX, Math.floor(tile.w * 0.4));
		const cropY = Math.min(insetY, Math.floor(tile.h * 0.4));
		const srcX = tile.x + cropX;
		const srcY = tile.y + cropY;
		const srcW = tile.w - cropX * 2;
		const srcH = tile.h - cropY * 2;
		if (srcW <= 0 || srcH <= 0) return;
		ctx.drawImage(terrainTileAtlas, srcX, srcY, srcW, srcH, drawX - overlap, drawY - overlap, drawW + overlap * 2, drawH + overlap * 2);
	}

	function fillTerrainRegion(groupName, x, y, width, height, options) {
		if (groupName === "tree" && fillTreeRegion(x, y, width, height, options)) return true;
		const patternFill = getTerrainPatternFill(groupName, width, height);
		if (patternFill && patternFill.image && patternFill.source) {
			return fillRegionWithAtlasSlice(patternFill.image, patternFill.source, x, y, width, height, {
				opacity: options && typeof options.opacity === "number" ? options.opacity : 1,
				tileScale: patternFill.tileScale
			});
		}
		if (patternFill && patternFill.image) {
			return fillRegionWithPattern(patternFill.image, x, y, width, height, {
				opacity: options && typeof options.opacity === "number" ? options.opacity : 1,
				patternScale: patternFill.patternScale
			});
		}
		if (!terrainTileAtlas.complete) return false;
		const variants = TERRAIN_TILE_GROUPS[groupName];
		if (!variants || !variants.length || width <= 0 || height <= 0) return false;
		const scale = options && options.scale ? options.scale : 1;
		const seed = options && typeof options.seed === "number" ? options.seed : 0;
		const opacity = options && typeof options.opacity === "number" ? options.opacity : 1;
		const coarseX = options && options.coarseX ? options.coarseX : 1;
		const coarseY = options && options.coarseY ? options.coarseY : 1;
		const tileInset = options && typeof options.tileInset === "number" ? options.tileInset : TERRAIN_TILE_INSET;
		const tileInsetX = options && typeof options.tileInsetX === "number" ? options.tileInsetX : tileInset;
		const tileInsetY = options && typeof options.tileInsetY === "number" ? options.tileInsetY : tileInset;
		const tileOverlap = options && typeof options.tileOverlap === "number" ? options.tileOverlap : 0;
		const tileW = TERRAIN_TILE_W * scale;
		const tileH = TERRAIN_TILE_H * scale;
		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.imageSmoothingEnabled = false;
		ctx.beginPath();
		ctx.rect(x, y, width, height);
		ctx.clip();
		for (let drawY = y; drawY < y + height; drawY += tileH) {
			const gridY = Math.floor((drawY - y) / tileH);
			for (let drawX = x; drawX < x + width; drawX += tileW) {
				const gridX = Math.floor((drawX - x) / tileW);
				const tile = pickTerrainTileCoarse(groupName, gridX, gridY, seed, coarseX, coarseY);
				if (!tile) continue;
				drawTerrainTile(tile, drawX, drawY, tileW, tileH, { inset: tileInset, insetX: tileInsetX, insetY: tileInsetY, overlap: tileOverlap });
			}
		}
		ctx.restore();
		return true;
	}

	function fillWallRegion(x, y, width, height, options) {
		if (fillRegionWithAtlasSlice(terrainAtlas, MAGECITY_PATTERN_SLICES.wall, x, y, width, height, {
			opacity: options && typeof options.opacity === "number" ? options.opacity : 1,
			tileScale: 1.55
		})) return true;
		if (!terrainTileAtlas.complete || width <= 0 || height <= 0) return false;
		const scale = options && options.scale ? options.scale : 1;
		const opacity = options && typeof options.opacity === "number" ? options.opacity : 1;
		const tileW = TERRAIN_TILE_W * scale;
		const tileH = TERRAIN_TILE_H * scale;
		const horizontal = width >= height;
		const tile = horizontal ? TERRAIN_TILE_GROUPS.wallHorizontal[0] : TERRAIN_TILE_GROUPS.wallVertical[0];
		if (!tile) return false;
		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.imageSmoothingEnabled = false;
		ctx.beginPath();
		ctx.rect(x, y, width, height);
		ctx.clip();
		for (let drawY = y; drawY < y + height; drawY += tileH) {
			for (let drawX = x; drawX < x + width; drawX += tileW) {
				drawTerrainTile(tile, drawX, drawY, tileW, tileH);
			}
		}
		ctx.restore();
		return true;
	}

	function drawTreeCluster(trees) {
		for (const tree of trees) {
			drawTerrainSprite(tree.sprite, tree.x, tree.y, tree.scale, tree.opacity);
		}
	}

	function drawOrleansTownBackdrop() {
		ctx.fillStyle = "#6f8650";
		ctx.fillRect(0, 0, state.worldW, state.worldH);

		ctx.fillStyle = "#789260";
		ctx.fillRect(0, 0, 380, state.worldH);
		ctx.fillStyle = "rgba(255, 244, 216, 0.08)";
		ctx.fillRect(12, 360, 314, 760);
		ctx.fillRect(28, 1124, 286, 170);
		ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
		ctx.fillRect(336, 0, 24, state.worldH);

		const leftBuildings = [
			{ sprite: "timberHall", x: 176, y: 650, scale: 2.18 },
			{ sprite: "roundBarn", x: 84, y: 742, scale: 1.42 },
			{ sprite: "stoneChapel", x: 300, y: 728, scale: 1.24 },
			{ sprite: "redRoofHouse", x: 92, y: 960, scale: 1.46 },
			{ sprite: "blueRoofHouse", x: 278, y: 954, scale: 1.54 },
			{ sprite: "woodHouse", x: 176, y: 1116, scale: 2.02 },
			{ sprite: "redChapel", x: 318, y: 1104, scale: 1.3 },
			{ sprite: "longHut", x: 92, y: 1230, scale: 1.3 }
		];
		for (const building of leftBuildings) {
			ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
			ctx.beginPath();
			ctx.ellipse(building.x, building.y + 12, 108, 18, 0, 0, Math.PI * 2);
			ctx.fill();
			drawTerrainSprite(building.sprite, building.x, building.y, building.scale, 0.96);
		}

		ctx.fillStyle = "#68814b";
		ctx.fillRect(470, 0, state.worldW - 470, state.worldH);
		fillTerrainRegion("tree", 1740, 0, state.worldW - 1740, 340, {
			scale: 2,
			seed: 45,
			opacity: 0.58,
			coarseX: 2,
			coarseY: 2,
			tileInset: 0
		});
		fillTerrainRegion("tree", 1710, 930, state.worldW - 1710, state.worldH - 930, {
			scale: 2,
			seed: 57,
			opacity: 0.62,
			coarseX: 2,
			coarseY: 2,
			tileInset: 0
		});
		ctx.fillStyle = "rgba(255,255,255,0.04)";
		ctx.beginPath();
		ctx.moveTo(620, 0);
		ctx.lineTo(1650, 0);
		ctx.lineTo(1840, 230);
		ctx.lineTo(820, 360);
		ctx.closePath();
		ctx.fill();
	}

	function drawOrleansRoadDetails() {
		ctx.fillStyle = "rgba(86, 112, 61, 0.2)";
		ctx.fillRect(1680, 0, state.worldW - 1680, state.worldH);

		ctx.fillStyle = "#90724a";
		ctx.beginPath();
		ctx.moveTo(520, 1400);
		ctx.lineTo(900, 1270);
		ctx.bezierCurveTo(1260, 1130, 1540, 970, 1840, 690);
		ctx.bezierCurveTo(2020, 520, 2160, 398, 2400, 226);
		ctx.lineTo(2400, 452);
		ctx.bezierCurveTo(2160, 616, 2020, 730, 1830, 886);
		ctx.bezierCurveTo(1540, 1120, 1240, 1260, 930, 1370);
		ctx.lineTo(520, 1400);
		ctx.closePath();
		ctx.fill();

		fillTerrainRegion("goldRoad", 930, 1228, 500, 36, {
			scale: 2,
			seed: 63,
			opacity: 0.96,
			coarseX: 2,
			coarseY: 1,
			tileInset: 0
		});
		fillTerrainRegion("goldRoad", 1290, 1064, 430, 36, {
			scale: 2,
			seed: 71,
			opacity: 0.96,
			coarseX: 2,
			coarseY: 1,
			tileInset: 0
		});
		fillTerrainRegion("goldRoad", 1560, 856, 360, 36, {
			scale: 2,
			seed: 79,
			opacity: 0.96,
			coarseX: 2,
			coarseY: 1,
			tileInset: 0
		});
		fillTerrainRegion("goldRoad", 1810, 632, 290, 36, {
			scale: 2,
			seed: 87,
			opacity: 0.96,
			coarseX: 2,
			coarseY: 1,
			tileInset: 0
		});

		drawTreeCluster([
			{ sprite: "pineGreen", x: 820, y: 356, scale: 0.98, opacity: 0.96 },
			{ sprite: "smallPine", x: 980, y: 318, scale: 0.96, opacity: 0.92 },
			{ sprite: "pineGold", x: 1135, y: 392, scale: 1.02, opacity: 0.95 },
			{ sprite: "smallPine", x: 1288, y: 334, scale: 0.92, opacity: 0.9 },
			{ sprite: "pineGreen", x: 1460, y: 380, scale: 1.0, opacity: 0.94 },
			{ sprite: "tallPine", x: 1648, y: 438, scale: 1.18, opacity: 0.96 },
			{ sprite: "pineGold", x: 1860, y: 468, scale: 1.08, opacity: 0.94 },
			{ sprite: "smallPine", x: 2050, y: 396, scale: 0.94, opacity: 0.9 },
			{ sprite: "pineGreen", x: 1788, y: 1004, scale: 1.06, opacity: 0.94 },
			{ sprite: "smallPine", x: 1955, y: 1112, scale: 0.98, opacity: 0.9 },
			{ sprite: "pineGold", x: 2120, y: 1212, scale: 1.0, opacity: 0.92 },
			{ sprite: "tallPine", x: 2290, y: 1096, scale: 1.12, opacity: 0.94 },
			{ sprite: "smallPine", x: 2390, y: 1254, scale: 0.96, opacity: 0.88 }
		]);
	}

	function drawOrleansGate() {
		const gateLeft = state.gate.x - state.gate.w * 0.5;
		const gateTop = state.gate.y - state.gate.h * 0.5;
		if (!fillWallRegion(300, 0, 170, state.worldH, { scale: 2, opacity: 0.98 })) {
			ctx.fillStyle = "#634f36";
			ctx.fillRect(300, 0, 170, state.worldH);
		}
		ctx.fillStyle = "rgba(255, 232, 187, 0.06)";
		ctx.fillRect(458, 0, 8, state.worldH);
		ctx.fillStyle = "rgba(92, 71, 46, 0.94)";
		for (let y = 20; y < state.worldH; y += 74) {
			if (y > gateTop - 18 && y < gateTop + state.gate.h - 20) continue;
			ctx.fillRect(312, y, 24, 28);
			ctx.fillRect(420, y + 10, 22, 22);
		}

		ctx.fillStyle = "#8b6e49";
		ctx.fillRect(gateLeft, gateTop, state.gate.w, state.gate.h);
		ctx.fillStyle = "rgba(255, 230, 186, 0.12)";
		ctx.fillRect(gateLeft + 8, gateTop, 8, state.gate.h);
		ctx.fillStyle = "rgba(63, 42, 24, 0.84)";
		ctx.fillRect(gateLeft + 12, gateTop + 30, state.gate.w - 24, state.gate.h - 52);
		ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
		ctx.fillRect(gateLeft + 18, gateTop + 30, 6, state.gate.h - 52);
		ctx.fillRect(gateLeft + state.gate.w - 24, gateTop + 30, 6, state.gate.h - 52);
		ctx.fillStyle = "rgba(191, 160, 116, 0.64)";
		for (let y = gateTop + 46; y < gateTop + state.gate.h - 24; y += 28) {
			ctx.fillRect(gateLeft + 22, y, state.gate.w - 44, 4);
		}
	}

	function drawGateHealthBar() {
		if (!state.gate) return;
		const pos = screenFromWorld(state.gate.x, state.gate.y - state.gate.h * 0.5 - 38);
		const width = 112;
		const height = 10;
		const ratio = clamp(state.gate.hp / state.gate.maxHp, 0, 1);
		ctx.save();
		ctx.fillStyle = "rgba(0, 0, 0, 0.54)";
		ctx.fillRect(pos.x - width * 0.5, pos.y, width, height);
		ctx.fillStyle = "rgba(109, 40, 30, 0.95)";
		ctx.fillRect(pos.x - width * 0.5 + 1, pos.y + 1, width - 2, height - 2);
		ctx.fillStyle = "#e5c36f";
		ctx.fillRect(pos.x - width * 0.5 + 1, pos.y + 1, (width - 2) * ratio, height - 2);
		ctx.font = "700 12px Microsoft YaHei";
		ctx.textAlign = "center";
		ctx.textBaseline = "bottom";
		ctx.fillStyle = "#fff2d1";
		ctx.fillText(`城门 ${Math.max(0, Math.ceil(state.gate.hp))} / ${state.gate.maxHp}`, pos.x, pos.y - 4);
		ctx.restore();
	}

	function drawStage() {
		ctx.save();
		ctx.scale(camera.scale, camera.scale);
		ctx.translate(-camera.x, -camera.y);
		if (stageId === "orleans") {
			drawGroundPattern("#78945a");
			drawOrleansTownBackdrop();
			drawOrleansGate();
			drawOrleansRoadDetails();
		}
		if (stageId === "reims") {
			drawGroundPattern("#818556");
			ctx.strokeStyle = "#b79b72";
			ctx.lineWidth = 150;
			ctx.beginPath();
			ctx.moveTo(320, 1160);
			ctx.bezierCurveTo(820, 980, 1120, 720, 1860, 320);
			ctx.stroke();
			drawTerrainSprite("blueRoofHouse", 1900, 438, 2.2);
			drawTerrainSprite("redChapel", 1774, 392, 1.2);
			drawTreeCluster([
				{ sprite: "smallPine", x: 1560, y: 460, scale: 0.9 },
				{ sprite: "smallPine", x: 1680, y: 400, scale: 0.82 }
			]);
		}
		if (stageId === "picardy") {
			drawGroundPattern("#6f7350");
			ctx.strokeStyle = "#a98a5b";
			ctx.lineWidth = 140;
			ctx.beginPath();
			ctx.moveTo(220, 860);
			ctx.bezierCurveTo(740, 820, 1100, 820, 2220, 700);
			ctx.stroke();
			ctx.strokeStyle = "#8d724e";
			ctx.lineWidth = 96;
			ctx.beginPath();
			ctx.moveTo(1240, 140);
			ctx.lineTo(1240, 1260);
			ctx.stroke();
			ctx.fillStyle = "#473d31";
			for (const obstacle of state.obstacles) ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
			ctx.fillStyle = "#7b2d2b";
			ctx.fillRect(1980, 300, 26, 120);
			ctx.fillRect(320, 980, 26, 120);
		}
		if (stageId === "england") {
			drawGroundPattern("#4d403c");
			if (!fillWallRegion(0, 0, state.worldW, 240, { scale: 2, seed: 41, opacity: 0.95 })) {
				ctx.fillStyle = "#3a2f2b";
				ctx.fillRect(0, 0, state.worldW, 240);
			}
			if (!fillWallRegion(0, 1160, state.worldW, 240, { scale: 2, seed: 43, opacity: 0.95 })) {
				ctx.fillStyle = "#3a2f2b";
				ctx.fillRect(0, 1160, state.worldW, 240);
			}
			ctx.fillStyle = "#6a5848";
			ctx.fillRect(980, 860, 440, 110);
			ctx.fillStyle = "#7b684f";
			ctx.fillRect(1120, 710, 160, 150);
			ctx.fillStyle = "#4f3e33";
			ctx.fillRect(1188, 580, 24, 280);
			ctx.fillRect(1220, 580, 24, 280);
			ctx.fillStyle = "#2a2421";
			for (let i = 0; i < 18; i += 1) {
				const x = 180 + i * 110;
				ctx.beginPath();
				ctx.arc(x, 190, 16, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillRect(x - 12, 206, 24, 40);
				ctx.beginPath();
				ctx.arc(x, 1210, 16, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillRect(x - 12, 1226, 24, 40);
			}
			drawTerrainSprite("redRoofHouse", 820, 420, 1.1, 0.9);
			drawTerrainSprite("blueRoofHouse", 1580, 438, 0.96, 0.88);
			ctx.fillStyle = "#442522";
			ctx.fillRect(1130, 728, 140, 120);
			for (let i = 0; i < 8; i += 1) {
				const flameX = 1080 + i * 34;
				const flameH = 24 + Math.sin((state.stageTimer + i) * 3.4) * 8 + state.fireProgress * 0.7;
				ctx.fillStyle = `rgba(255, ${140 + i * 8}, 70, ${0.16 + state.fireProgress / 170})`;
				ctx.beginPath();
				ctx.moveTo(flameX, 860);
				ctx.quadraticCurveTo(flameX + 12, 860 - flameH, flameX + 24, 860);
				ctx.closePath();
				ctx.fill();
			}
		}
		if (stageId === "rouen") {
			drawGroundPattern("#40454e");
			for (const obstacle of state.obstacles) {
				if (!fillTerrainRegion("rock", obstacle.x, obstacle.y, obstacle.w, obstacle.h, { scale: 2, seed: 51, opacity: 0.96 })) {
					ctx.fillStyle = "#22262d";
					ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
				}
			}
			ctx.fillStyle = "#2a4a5c";
			ctx.fillRect(2040, 980, 360, 420);
			drawTerrainSprite("stoneChapel", 2210, 1245, 1.8, 0.82);
		}
		if (stageId === "spain") {
			ctx.fillStyle = "#2f6988";
			ctx.fillRect(0, 0, 560, state.worldH);
			ctx.fillStyle = "#c3a15e";
			ctx.fillRect(480, 0, state.worldW - 480, state.worldH);
			ctx.fillStyle = "rgba(255,241,199,0.26)";
			for (let i = 0; i < 18; i += 1) {
				ctx.beginPath();
				ctx.arc(520 + i * 16, 150 + i * 70, 26, 0, Math.PI * 2);
				ctx.fill();
			}
			drawTerrainSprite("longHut", 1870, 690, 2.7);
			drawTerrainSprite("redChapel", 1865, 332, 1.45);
			drawTerrainSprite("roundBarn", 920, 1040, 1.5, 0.88);
			drawTreeCluster([
				{ sprite: "pineGreen", x: 1320, y: 520, scale: 0.62 },
				{ sprite: "smallPine", x: 1460, y: 580, scale: 0.78 },
				{ sprite: "smallPine", x: 1180, y: 1180, scale: 0.88 }
			]);
		}
		if (stageId === "portugal") {
			ctx.fillStyle = "#2c6f8a";
			ctx.fillRect(0, 0, 720, state.worldH);
			ctx.fillStyle = "#bda06e";
			ctx.fillRect(640, 0, state.worldW - 640, state.worldH);
			ctx.fillStyle = "#6d5637";
			for (let i = 0; i < 5; i += 1) ctx.fillRect(680 + i * 120, 820 - i * 20, 340, 44);
			drawTerrainSprite("blueRoofHouse", 1830, 860, 2.2);
			drawTerrainSprite("redChapel", 1810, 560, 1.25);
			drawTreeCluster([
				{ sprite: "smallPine", x: 1340, y: 760, scale: 0.86 },
				{ sprite: "smallPine", x: 1500, y: 720, scale: 0.82 },
				{ sprite: "pineGreen", x: 2170, y: 520, scale: 0.56 }
			]);
		}
		if (stageId === "brazilCoast") {
			ctx.fillStyle = "#2ea0be";
			ctx.fillRect(0, 0, 640, state.worldH);
			ctx.fillStyle = "#d1b56e";
			ctx.fillRect(520, 0, 480, state.worldH);
			ctx.fillStyle = "#3d8a49";
			ctx.fillRect(900, 0, state.worldW - 900, state.worldH);
			ctx.fillStyle = "rgba(255,255,255,0.14)";
			for (let i = 0; i < 22; i += 1) {
				ctx.beginPath();
				ctx.arc(540 + i * 12, 120 + i * 54, 22, 0, Math.PI * 2);
				ctx.fill();
			}
			drawTerrainSprite("goldHall", 1080, 962, 1.08);
			drawTreeCluster([
				{ sprite: "pineGreen", x: 1240, y: 680, scale: 0.74 },
				{ sprite: "pineGold", x: 1410, y: 760, scale: 0.72 },
				{ sprite: "tallPine", x: 1510, y: 630, scale: 1.05 },
				{ sprite: "smallPine", x: 1640, y: 840, scale: 0.92 },
				{ sprite: "pineGreen", x: 1780, y: 720, scale: 0.68 }
			]);
		}
		if (stageId === "brazilJungle") {
			drawGroundPattern("#2f6e44");
			ctx.strokeStyle = "#8e7645";
			ctx.lineWidth = 96;
			ctx.beginPath();
			ctx.moveTo(220, 1140);
			ctx.bezierCurveTo(720, 980, 980, 760, 1320, 620);
			ctx.bezierCurveTo(1600, 500, 1800, 420, 2060, 280);
			ctx.stroke();
			ctx.fillStyle = "rgba(12, 56, 24, 0.42)";
			for (let i = 0; i < 26; i += 1) {
				ctx.beginPath();
				ctx.arc(260 + (i * 73) % 2100, 160 + (i * 119) % 1080, 70 + (i % 4) * 18, 0, Math.PI * 2);
				ctx.fill();
			}
			drawTerrainSprite("woodHouse", 1980, 352, 1.55);
			drawTreeCluster([
				{ sprite: "pineGreen", x: 560, y: 820, scale: 0.9, opacity: 0.95 },
				{ sprite: "pineGold", x: 820, y: 620, scale: 0.88, opacity: 0.92 },
				{ sprite: "pineGreen", x: 1120, y: 460, scale: 0.82, opacity: 0.95 },
				{ sprite: "tallPine", x: 1520, y: 320, scale: 1.1, opacity: 0.96 },
				{ sprite: "smallPine", x: 1710, y: 520, scale: 0.92, opacity: 0.9 },
				{ sprite: "smallPine", x: 360, y: 980, scale: 0.95, opacity: 0.9 }
			]);
		}
		if (stageId === "brazilRise") {
			drawGroundPattern("#8ea05a");
			ctx.fillStyle = "#2e7390";
			ctx.fillRect(0, 1080, state.worldW, 320);
			ctx.fillStyle = "#7a5e39";
			ctx.fillRect(state.gate.x - state.gate.w * 0.5, state.gate.y - state.gate.h * 0.5, state.gate.w, state.gate.h);
			drawTerrainSprite("redRoofHouse", 430, 690, 1.18);
			drawTerrainSprite("goldHall", 430, 1080, 0.96);
			drawTerrainSprite("timberHall", 1800, 930, 2.25);
			drawTerrainSprite("redChapel", 1810, 520, 1.28);
			drawTreeCluster([
				{ sprite: "smallPine", x: 860, y: 640, scale: 0.95 },
				{ sprite: "pineGreen", x: 980, y: 520, scale: 0.7 },
				{ sprite: "smallPine", x: 1180, y: 980, scale: 0.86 },
				{ sprite: "tallPine", x: 1450, y: 1090, scale: 1.0 }
			]);
		}
		if (stageId === "mali") {
			drawGroundPattern("#a7884d");
			ctx.fillStyle = "rgba(235, 207, 122, 0.22)";
			ctx.fillRect(260, 520, 1360, 430);
			ctx.fillStyle = "#6c5232";
			for (let i = 0; i < 5; i += 1) ctx.fillRect(420 + i * 220, 650 + (i % 2) * 40, 260, 36);
			if (!fillTerrainRegion("rock", 1750, 220, 430, 540, { scale: 2, seed: 95, opacity: 0.95 })) {
				ctx.fillStyle = "#6a5848";
				ctx.fillRect(1750, 220, 430, 540);
			}
			drawTerrainSprite("goldHall", 1180, 930, 1.2, 0.92);
			drawTerrainSprite("timberHall", 2020, 770, 1.75, 0.88);
			drawTreeCluster([
				{ sprite: "pineGold", x: 840, y: 430, scale: 0.72 },
				{ sprite: "pineGreen", x: 980, y: 390, scale: 0.68 },
				{ sprite: "smallPine", x: 1510, y: 1040, scale: 0.82 }
			]);
		}

		if (state.goalZone) {
			ctx.strokeStyle = "rgba(255, 229, 157, 0.9)";
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.arc(state.goalZone.x, state.goalZone.y, state.goalZone.r, 0, Math.PI * 2);
			ctx.stroke();
		}
		if (state.captureZone) {
			ctx.strokeStyle = `rgba(255, 229, 157, ${0.42 + state.captureProgress * 0.5})`;
			ctx.lineWidth = 8;
			ctx.beginPath();
			ctx.arc(state.captureZone.x, state.captureZone.y, state.captureZone.r, 0, Math.PI * 2);
			ctx.stroke();
		}
		if (state.escapeZone) {
			ctx.strokeStyle = "rgba(138, 223, 255, 0.86)";
			ctx.lineWidth = 5;
			ctx.strokeRect(state.escapeZone.x, state.escapeZone.y, state.escapeZone.w, state.escapeZone.h);
		}
		ctx.restore();
	}

	function drawHealthBar(unit) {
		const pos = screenFromWorld(unit.x, unit.y - unit.radius - 18);
		const w = unit.isCommander ? 50 : 38;
		ctx.fillStyle = "rgba(0,0,0,0.46)";
		ctx.fillRect(pos.x - w * 0.5, pos.y, w, 5);
		ctx.fillStyle = unit.team === "enemy" ? "#ff7f69" : "#8de0ac";
		ctx.fillRect(pos.x - w * 0.5 + 1, pos.y + 1, (w - 2) * clamp(unit.hp / unit.maxHp, 0, 1), 3);
		if (unit.isPlayer && unit.level) {
			ctx.save();
			ctx.font = "800 11px Microsoft YaHei";
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#ffe08a";
			ctx.fillText(`Lv.${unit.level}`, pos.x - w * 0.5 - 6, pos.y + 2.5);
			ctx.restore();
		}
	}

	function drawLabel(unit) {
		const pos = screenFromWorld(unit.x, unit.y - unit.radius - 28);
		if (unit.isPlayer) return;
		ctx.font = unit.isCommander ? "700 13px Microsoft YaHei" : "600 12px Microsoft YaHei";
		ctx.textAlign = "center";
		ctx.fillStyle = "#fff3d6";
		ctx.fillText(unit.label, pos.x, pos.y);
	}

	function drawSkillBadge(unit) {
		const badge = getUnitSkillBadge(unit);
		if (!badge) return;
		const yOffset = 42;
		const pos = screenFromWorld(unit.x, unit.y - unit.radius - yOffset);
		const width = badge.ready ? 92 : 48;
		const height = 28;
		const left = pos.x - width * 0.5;
		const top = pos.y - height * 0.5;
		skillBadgeHitboxes.push({ x: left, y: top, w: width, h: height, action: badge.action });

		ctx.save();
		ctx.fillStyle = badge.ready ? "rgba(121, 72, 21, 0.96)" : "rgba(58, 56, 52, 0.94)";
		ctx.strokeStyle = badge.ready ? "rgba(255, 226, 152, 0.98)" : "rgba(189, 192, 196, 0.7)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.roundRect(left, top, width, height, 12);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.roundRect(left + 3, top + 3, width - 6, height - 6, 10);
		ctx.strokeStyle = badge.ready ? "rgba(255, 239, 196, 0.45)" : "rgba(230, 232, 235, 0.18)";
		ctx.lineWidth = 1.2;
		ctx.stroke();
		ctx.font = badge.ready ? "900 12px Microsoft YaHei" : "800 12px Microsoft YaHei";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = badge.ready ? "#ffefbf" : "rgba(236, 238, 242, 0.94)";
		ctx.fillText(badge.label, pos.x, pos.y + 0.5);
		ctx.restore();
	}

	function drawHuman(unit) {
		const pos = screenFromWorld(unit.x, unit.y);
		ctx.save();
		ctx.translate(pos.x, pos.y);
		ctx.fillStyle = "rgba(0,0,0,0.18)";
		ctx.beginPath();
		ctx.ellipse(0, unit.radius + 6, unit.radius * 0.9, unit.radius * 0.34, 0, 0, Math.PI * 2);
		ctx.fill();
		if (unit.isPlayer && playerSpriteIdle.complete && playerSpriteMove.complete) {
			const moving = keys.up || keys.down || keys.left || keys.right || state.moveTarget || (isMobileUI && mobileStick.magnitude > 0.08);
			let sprite = moving ? playerSpriteMove : playerSpriteIdle;
			if (unit.attackAnim > 0 && playerAttackFrames.length > 0) {
				const progress = 1 - unit.attackAnim / 0.42;
				const attackIndex = Math.max(0, Math.min(playerAttackFrames.length - 1, Math.floor(progress * playerAttackFrames.length)));
				sprite = playerAttackFrames[attackIndex] || playerAttackFrames[0] || sprite;
			}
			ctx.save();
			ctx.scale(Math.cos(unit.dir || 0) >= 0 ? -1 : 1, 1);
			if (unit.attackAnim <= 0 && moving) {
				drawAnimatedWalkSprite(unit);
			} else {
				ctx.drawImage(sprite, jeanneSprite.offsetX || -32, jeanneSprite.offsetY || -44, jeanneSprite.width || 64, jeanneSprite.height || 72);
			}
			ctx.restore();
		} else if (unit.appearance) {
			const look = unit.appearance;
			const facing = Math.cos(unit.dir || 0) >= 0 ? 1 : -1;
			const scale = unit.isCommander ? 1.18 : unit.isVip ? 1.08 : 1;
			ctx.save();
			ctx.scale(facing, 1);
			ctx.scale(scale, scale);
			if (unit.mounted) {
				ctx.fillStyle = look.horseBody || "#786251";
				ctx.beginPath();
				ctx.ellipse(-1, 9, 15, 8.5, 0, 0, Math.PI * 2);
				ctx.fill();
				ctx.beginPath();
				ctx.ellipse(12, 4, 5.2, 4.2, -0.2, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillStyle = look.horseMane || "#46362d";
				ctx.fillRect(8.4, -0.5, 3, 8.2);
				ctx.fillStyle = look.horseArmor || look.accent || "#cfd6de";
				ctx.fillRect(-9.5, 3.5, 13.5, 7.5);
				ctx.fillStyle = look.trim || unit.stroke || "#3a2c24";
				ctx.fillRect(-11.8, 13, 2.2, 8.5);
				ctx.fillRect(-2.8, 13, 2.2, 8.5);
				ctx.fillRect(5.2, 13, 2.2, 8.5);
				ctx.fillRect(13.8, 13, 2.2, 8.5);
			}
			ctx.fillStyle = look.cape || "#6b5a46";
			ctx.beginPath();
			ctx.moveTo(-9, 7);
			ctx.quadraticCurveTo(-13, -1, -7, -13);
			ctx.lineTo(4, -11);
			ctx.quadraticCurveTo(2, 2, 8, 11);
			ctx.closePath();
			ctx.fill();
			ctx.fillStyle = unit.hitFlash > 0 ? "#fff2c1" : (look.body || unit.color || "#a58b6f");
			ctx.fillRect(-7, -11, 14, 18);
			ctx.fillStyle = look.accent || "#ddd5c1";
			ctx.fillRect(-4.2, -8.8, 8.4, 13);
			if (look.surcoat) {
				ctx.fillStyle = look.surcoat;
				ctx.fillRect(-3.1, -6.4, 6.2, 12.2);
			}
			ctx.fillStyle = look.trim || unit.stroke || "#3a2c24";
			ctx.fillRect(-8, unit.mounted ? 1 : 6, 3.2, unit.mounted ? 6 : 11);
			ctx.fillRect(4.8, unit.mounted ? 1 : 6, 3.2, unit.mounted ? 6 : 11);
			ctx.fillStyle = look.head || "#efcfb1";
			ctx.beginPath();
			ctx.arc(0, -16, unit.isCommander ? 5.8 : 5.1, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = look.hair || "#4b3528";
			ctx.beginPath();
			ctx.arc(-0.5, -17.2, unit.isCommander ? 5.7 : 5, Math.PI, Math.PI * 2);
			ctx.fill();
			if (look.beard) {
				ctx.beginPath();
				ctx.moveTo(-2.6, -12.5);
				ctx.lineTo(0, -9.2);
				ctx.lineTo(2.6, -12.5);
				ctx.closePath();
				ctx.fill();
			}
			if (look.helmet) {
				ctx.fillStyle = look.accent || "#cfd6de";
				ctx.fillRect(-5.1, -21.2, 10.2, 3.4);
				ctx.fillStyle = look.plume || look.trim || "#a34c3f";
				ctx.fillRect(-1.2, -25.5, 2.4, 5.4);
			} else if (look.plume) {
				ctx.fillStyle = look.plume;
				ctx.beginPath();
				ctx.moveTo(0, -23);
				ctx.lineTo(3.4, -18.3);
				ctx.lineTo(-1, -18);
				ctx.closePath();
				ctx.fill();
			}
			ctx.strokeStyle = look.weapon || "#dfe5ec";
			ctx.lineWidth = unit.isCommander ? 3 : 2.4;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(2, -5);
			ctx.lineTo(14, -15);
			ctx.stroke();
			ctx.fillStyle = look.weapon || "#dfe5ec";
			ctx.fillRect(12, -17.5, 4, 2.4);
			ctx.fillStyle = look.trim || unit.stroke || "#3a2c24";
			ctx.fillRect(-8.2, -4.2, 2.2, 11);
			ctx.fillRect(6, -4.2, 2.2, 11);
			ctx.restore();
		} else {
			ctx.fillStyle = unit.hitFlash > 0 ? "#fff2c1" : unit.color;
			ctx.beginPath();
			ctx.arc(0, 0, unit.radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.strokeStyle = unit.stroke;
			ctx.lineWidth = 3;
			ctx.stroke();
			ctx.fillStyle = unit.team === "enemy" ? "#5e241c" : "#f7e7c0";
			ctx.beginPath();
			ctx.arc(0, -unit.radius - 4, unit.radius * 0.62, 0, Math.PI * 2);
			ctx.fill();
		}
		if (unit.isVip) {
			ctx.fillStyle = "#ffe18a";
			ctx.beginPath();
			ctx.moveTo(-8, -unit.radius - 16);
			ctx.lineTo(0, -unit.radius - 28);
			ctx.lineTo(8, -unit.radius - 16);
			ctx.closePath();
			ctx.fill();
		}
		ctx.restore();
		drawHealthBar(unit);
		drawLabel(unit);
	}

	function drawVisionCones() {
		if (stageId !== "rouen") return;
		for (const enemy of state.enemies) {
			if (enemy.dead || !enemy.patrol) continue;
			const pos = screenFromWorld(enemy.x, enemy.y);
			ctx.fillStyle = enemy.alerted > 0 || state.alarm ? "rgba(255, 110, 110, 0.16)" : "rgba(220, 230, 255, 0.14)";
			ctx.beginPath();
			ctx.moveTo(pos.x, pos.y);
			ctx.arc(pos.x, pos.y, enemy.visionRange, enemy.dir - enemy.visionArc, enemy.dir + enemy.visionArc);
			ctx.closePath();
			ctx.fill();
		}
	}

	function drawEffects() {
		for (const burst of state.mistBursts) {
			const pos = screenFromWorld(burst.x, burst.y);
			const alpha = Math.max(0, burst.life / burst.maxLife);
			ctx.save();
			ctx.globalAlpha = alpha;
			const gradient = ctx.createRadialGradient(pos.x, pos.y, burst.r * 0.18, pos.x, pos.y, burst.r);
			gradient.addColorStop(0, "rgba(215, 245, 255, 0.65)");
			gradient.addColorStop(0.45, "rgba(118, 196, 230, 0.26)");
			gradient.addColorStop(1, "rgba(118, 196, 230, 0)");
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, burst.r, 0, Math.PI * 2);
			ctx.fill();
			ctx.strokeStyle = `rgba(176, 233, 255, ${0.72 * alpha})`;
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, burst.r * 0.86, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}
		for (const ring of state.shockwaves) {
			const pos = screenFromWorld(ring.x, ring.y);
			ctx.strokeStyle = `rgba(255, 230, 124, ${ring.life * 0.9})`;
			ctx.lineWidth = 6 * ring.life;
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, ring.r, 0, Math.PI * 2);
			ctx.stroke();
		}
		for (const sweep of state.swordSweeps) {
			const pos = screenFromWorld(sweep.x, sweep.y);
			const progress = 1 - sweep.life / sweep.maxLife;
			const span = 0.92 + progress * 0.42;
			const start = sweep.dir - 1.2 + progress * 0.55;
			const end = start + span;
			ctx.save();
			ctx.globalAlpha = Math.max(0, sweep.life / sweep.maxLife);
			ctx.strokeStyle = "rgba(255, 241, 167, 0.95)";
			ctx.lineWidth = 15;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, sweep.radius, start, end);
			ctx.stroke();
			ctx.strokeStyle = "rgba(255, 178, 90, 0.72)";
			ctx.lineWidth = 7;
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, sweep.radius - 6, start + 0.05, end - 0.05);
			ctx.stroke();
			ctx.restore();
		}
		for (const tracer of state.tracers) {
			const start = screenFromWorld(tracer.x1, tracer.y1);
			const end = screenFromWorld(tracer.x2, tracer.y2);
			const alpha = Math.max(0, tracer.life / tracer.maxLife);
			ctx.save();
			ctx.globalAlpha = alpha;
			ctx.strokeStyle = "rgba(255, 232, 180, 0.95)";
			ctx.lineWidth = 3.8;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(start.x, start.y);
			ctx.lineTo(end.x, end.y);
			ctx.stroke();
			ctx.strokeStyle = "rgba(255, 146, 88, 0.85)";
			ctx.lineWidth = 1.4;
			ctx.beginPath();
			ctx.moveTo(start.x, start.y);
			ctx.lineTo(end.x, end.y);
			ctx.stroke();
			ctx.restore();
		}
		for (const flash of state.muzzleFlashes) {
			const pos = screenFromWorld(flash.x, flash.y);
			const alpha = Math.max(0, flash.life / flash.maxLife);
			ctx.save();
			ctx.translate(pos.x, pos.y);
			ctx.rotate(flash.dir);
			ctx.globalAlpha = alpha;
			const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flash.radius);
			gradient.addColorStop(0, "rgba(255, 246, 204, 0.95)");
			gradient.addColorStop(0.45, "rgba(255, 190, 110, 0.82)");
			gradient.addColorStop(1, "rgba(255, 120, 72, 0)");
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(0, 0, flash.radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "rgba(255, 225, 144, 0.92)";
			ctx.beginPath();
			ctx.moveTo(2, 0);
			ctx.lineTo(flash.radius + 7, -flash.radius * 0.34);
			ctx.lineTo(flash.radius * 0.62, 0);
			ctx.lineTo(flash.radius + 7, flash.radius * 0.34);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
		for (const spark of state.hitSparks) {
			const pos = screenFromWorld(spark.x, spark.y);
			ctx.save();
			ctx.globalAlpha = Math.max(0, spark.life / spark.maxLife);
			ctx.strokeStyle = spark.color;
			ctx.lineWidth = 2.6;
			ctx.beginPath();
			ctx.moveTo(pos.x, pos.y);
			ctx.lineTo(pos.x - spark.vx * 0.022, pos.y - spark.vy * 0.022);
			ctx.stroke();
			ctx.restore();
		}
		for (const particle of state.particles) {
			const pos = screenFromWorld(particle.x, particle.y);
			ctx.globalAlpha = Math.max(0, particle.life * 1.8);
			ctx.fillStyle = particle.color;
			ctx.fillRect(pos.x, pos.y, 3, 3);
		}
		ctx.globalAlpha = 1;
		ctx.textAlign = "center";
		for (const shout of state.shouts) {
			const pos = screenFromWorld(shout.x, shout.y);
			ctx.save();
			ctx.globalAlpha = Math.min(1, shout.life);
			ctx.font = "900 28px Microsoft YaHei";
			ctx.lineWidth = 5;
			ctx.strokeStyle = "rgba(72, 38, 0, 0.76)";
			ctx.strokeText(shout.text, pos.x, pos.y);
			ctx.fillStyle = "#ffe27f";
			ctx.fillText(shout.text, pos.x, pos.y);
			ctx.restore();
		}
		if (state.screenShout) {
			ctx.save();
			ctx.globalAlpha = Math.min(1, state.screenShout.life);
			ctx.font = "900 40px Microsoft YaHei";
			ctx.textAlign = "center";
			ctx.lineWidth = 7;
			ctx.strokeStyle = "rgba(68, 32, 0, 0.78)";
			ctx.strokeText(state.screenShout.text, canvas.width * 0.5, canvas.height * 0.16);
			ctx.fillStyle = "#fff0a0";
			ctx.fillText(state.screenShout.text, canvas.width * 0.5, canvas.height * 0.16);
			ctx.restore();
		}
	}

	function drawStageUi() {
		objectiveEl.textContent = state.objectiveText || stage.goalText;
		if (playerHpEl) playerHpEl.textContent = `贞德 ${Math.max(0, Math.ceil(state.player.hp))} / ${state.player.maxHp}`;
		if (stageInfoEl) stageInfoEl.textContent = stage.infoText(state);
		if (isMobileUI) {
			if (skillBtn) skillBtn.textContent = state.player.skillCd > 0 ? `战吼 ${state.player.skillCd.toFixed(1)}s` : "战吼";
			pauseBtn.textContent = state.paused ? "继续" : "暂停";
		} else {
			if (skillBtn) skillBtn.textContent = state.player.skillCd > 0 ? `Q 为了自由！ ${state.player.skillCd.toFixed(1)}s` : "Q 为了自由！";
			pauseBtn.textContent = state.paused ? "空格继续" : "空格暂停";
		}
	}

	function render() {
		skillBadgeHitboxes.length = 0;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawStage();
		drawVisionCones();
		for (const unit of state.enemies) if (!unit.dead) drawHuman(unit);
		for (const unit of state.allies) if (!unit.dead) drawHuman(unit);
		drawHuman(state.player);
		drawSkillBadge(state.player);
		drawEffects();
		if (state.whiteFlash > 0) {
			ctx.save();
			ctx.fillStyle = `rgba(255,255,255,${Math.min(1, state.whiteFlash)})`;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.restore();
		}
		if (state.paused) {
			ctx.save();
			ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.font = "800 38px Microsoft YaHei";
			ctx.textAlign = "center";
			ctx.fillStyle = "#fff2c5";
			ctx.fillText("已暂停", canvas.width * 0.5, canvas.height * 0.5);
			ctx.font = "600 16px Microsoft YaHei";
			ctx.fillStyle = "rgba(255, 244, 214, 0.9)";
			ctx.fillText("按空格继续", canvas.width * 0.5, canvas.height * 0.5 + 34);
			ctx.restore();
		}
		if (state.gate) {
			drawGateHealthBar();
			const pos = screenFromWorld(state.gate.x, state.gate.y - state.gate.h * 0.5 - 18);
			ctx.textAlign = "center";
			ctx.font = "700 13px Microsoft YaHei";
			ctx.fillStyle = "#fff3d8";
			ctx.fillText(stage.gateLabel || "奥尔良城门", pos.x, pos.y);
		}
		drawStageUi();
	}

	function showDialog(title, text, buttonText) {
		state.dialogOpen = true;
		resetMobileStick();
		dialogTitleEl.textContent = title;
		dialogTextEl.textContent = text;
		dialogBtn.textContent = buttonText;
		dialogEl.classList.remove("hidden");
	}

	function closeDialog() {
		state.dialogOpen = false;
		dialogEl.classList.add("hidden");
	}

	function togglePause() {
		if (state.resultOpen || state.dialogOpen) return;
		resetMobileStick();
		state.paused = !state.paused;
	}

	function currentPagePath() {
		return stageId === "orleans" ? "index.html" : `${stageId}.html`;
	}

	function showResult(victory, title, text, nextPage, nextLabel, advanceOnDefeat) {
		if (state.resultOpen) return;
		resetMobileStick();
		state.over = true;
		state.resultOpen = true;
		resultTitleEl.textContent = title;
		resultTextEl.textContent = text;
		if (victory || advanceOnDefeat) {
			nextStageBtn.href = nextPage;
			nextStageBtn.textContent = nextLabel || stage.nextLabel;
		} else {
			nextStageBtn.href = currentPagePath();
			nextStageBtn.textContent = "再试一次";
		}
		resultEl.classList.remove("hidden");
	}

	function tick(timestamp) {
		if (!state.lastTime) state.lastTime = timestamp;
		const dt = Math.min(0.033, (timestamp - state.lastTime) / 1000);
		state.lastTime = timestamp;
		if (!state.dialogOpen && !state.resultOpen && !state.paused) {
			updatePlayer(dt);
			updateAllies(dt);
			updateEnemies(dt);
			updateEffects(dt);
			updateStageLogic(dt);
			updateCamera();
		} else {
			updateEffects(dt);
			updateCamera();
		}
		render();
		requestAnimationFrame(tick);
	}

	window.addEventListener("resize", resize);
	resize();
	seedStage();
	updateCamera();
	renderUpgradePanel();
	showDialog(stage.briefingTitle, stage.briefing, dialogBtn.textContent || "开始");

	window.addEventListener("keydown", (event) => {
		const key = event.key.toLowerCase();
		if (event.code === "Space") {
			event.preventDefault();
			togglePause();
			return;
		}
		if (state.paused) return;
		if (key === "w" || event.key === "ArrowUp") keys.up = true;
		if (key === "s" || event.key === "ArrowDown") keys.down = true;
		if (key === "a" || event.key === "ArrowLeft") keys.left = true;
		if (key === "d" || event.key === "ArrowRight") keys.right = true;
		if (key === "q") {
			event.preventDefault();
			castFreedomCry();
		}
		if (event.key === "Escape" && state.dialogOpen) closeDialog();
	});

	window.addEventListener("keyup", (event) => {
		const key = event.key.toLowerCase();
		if (event.code === "Space") return;
		if (key === "w" || event.key === "ArrowUp") keys.up = false;
		if (key === "s" || event.key === "ArrowDown") keys.down = false;
		if (key === "a" || event.key === "ArrowLeft") keys.left = false;
		if (key === "d" || event.key === "ArrowRight") keys.right = false;
	});

	canvas.addEventListener("pointerdown", (event) => {
		if (state.paused || state.dialogOpen || state.resultOpen) return;
		const rect = canvas.getBoundingClientRect();
		const pointerX = event.clientX - rect.left;
		const pointerY = event.clientY - rect.top;
		for (let index = skillBadgeHitboxes.length - 1; index >= 0; index -= 1) {
			const hitbox = skillBadgeHitboxes[index];
			if (pointerX >= hitbox.x && pointerX <= hitbox.x + hitbox.w && pointerY >= hitbox.y && pointerY <= hitbox.y + hitbox.h) {
				event.preventDefault();
				hitbox.action();
				return;
			}
		}
		if (isMobileUI) event.preventDefault();
		const point = worldFromClient(event.clientX, event.clientY);
		state.moveTarget = {
			x: clamp(point.x, 0, state.worldW),
			y: clamp(point.y, 0, state.worldH)
		};
	});

	mobileStickEl.addEventListener("pointerdown", (event) => {
		if (!isMobileUI || state.paused || state.dialogOpen || state.resultOpen) return;
		event.preventDefault();
		mobileStick.active = true;
		mobileStick.pointerId = event.pointerId;
		state.moveTarget = null;
		mobileStickEl.setPointerCapture(event.pointerId);
		updateMobileStick(event);
	});

	window.addEventListener("pointermove", (event) => {
		if (!mobileStick.active || event.pointerId !== mobileStick.pointerId) return;
		event.preventDefault();
		updateMobileStick(event);
	});

	function releaseMobileStick(event) {
		if (!mobileStick.active || event.pointerId !== mobileStick.pointerId) return;
		if (mobileStickEl.hasPointerCapture(event.pointerId)) {
			mobileStickEl.releasePointerCapture(event.pointerId);
		}
		resetMobileStick();
	}

	window.addEventListener("pointerup", releaseMobileStick);
	window.addEventListener("pointercancel", releaseMobileStick);

	if (skillBtn) skillBtn.addEventListener("click", castFreedomCry);
	pauseBtn.addEventListener("click", togglePause);
	storyBtn.addEventListener("click", () => showDialog(stage.briefingTitle, stage.briefing, "继续战斗"));
	dialogBtn.addEventListener("click", closeDialog);
	if (chapterNavEl) {
		chapterNavToggleEl.addEventListener("click", () => {
			setUpgradePanelOpen(false);
			setChapterNavOpen(!chapterNavEl.classList.contains("open"));
		});

		upgradeToggleEl.addEventListener("click", () => {
			setChapterNavOpen(false);
			setUpgradePanelOpen(!upgradePanelEl.classList.contains("open"));
		});

		upgradePanelEl.addEventListener("click", (event) => {
			const button = event.target.closest("[data-upgrade]");
			if (!button) return;
			upgradeJeanneSkill(button.getAttribute("data-upgrade"));
		});

		chapterNavEl.addEventListener("click", (event) => {
			const target = event.target;
			if (target && target.closest("a")) setChapterNavOpen(false);
		});

		window.addEventListener("pointerdown", (event) => {
			const navOpen = chapterNavEl.classList.contains("open");
			const upgradeOpen = upgradePanelEl.classList.contains("open");
			if (!navOpen && !upgradeOpen) return;
			if (chapterNavEl.contains(event.target) || chapterNavToggleEl.contains(event.target)) return;
			if (upgradePanelEl.contains(event.target) || upgradeToggleEl.contains(event.target)) return;
			setChapterNavOpen(false);
			setUpgradePanelOpen(false);
		});
	}

	requestAnimationFrame(tick);
})();