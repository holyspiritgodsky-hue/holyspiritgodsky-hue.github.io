(function () {
	"use strict";

	const config = window.CampaignInterludeConfig;
	if (!config) return;

	const store = window.WarHeroes;
	const body = document.body;
	const title = document.getElementById("pageTitle");
	const eyebrow = document.getElementById("pageEyebrow");
	const lead = document.getElementById("pageLead");
	const recruitBtn = document.getElementById("recruitBtn");
	const nextStageBtn = document.getElementById("nextStageBtn");
	const sceneBanner = document.getElementById("sceneBanner");
	const mugStrip = document.getElementById("mugStrip");
	const sceneCast = document.getElementById("sceneCast");
	const cardsGrid = document.getElementById("cardsGrid");
	let recruitCardTitle = document.getElementById("recruitCardTitle");
	let recruitFlavor = document.getElementById("recruitFlavor");
	const statsTitle = document.getElementById("statsTitle");
	const statusLabel = document.getElementById("recruitStatusLabel");
	const recruitStatus = document.getElementById("recruitStatus");
	const heroCount = document.getElementById("heroCount");
	const level = document.getElementById("restLevel");
	const xp = document.getElementById("restXp");
	const planTitle = document.getElementById("planTitle");
	const planList = document.getElementById("planList");
	const dialog = document.getElementById("interludeDialog");
	const dialogTitle = document.getElementById("interludeDialogTitle");
	const dialogText = document.getElementById("interludeDialogText");
	const dialogBtn = document.getElementById("interludeDialogBtn");
	const chapterNavEl = document.querySelector(".chapterNav");
	const chapterNavToggleEl = document.createElement("button");
	const animationTimers = [];
	const SKILL_SUMMARIES = {
		freedom: "振奋周围友军，同时对近身敌人造成范围冲击。",
		slash: "骑士突进后重斩单体目标，适合先手破阵。",
		lightning: "召唤雷击轰击远处敌群，并附带溅射伤害。",
		charge: "高速突击前线，短时间内打穿敌方站位。",
		arrow: "向前方泼洒箭雨，适合压制中远距离目标。",
		goldAura: "提升全队资源运转，让战线越拖越有利。",
		charm: "扰乱敌方心神，打乱近距离包夹节奏。",
		healAura: "为附近同伴持续赐福，稳住拉锯战血线。",
		kiteVolley: "边走边射，持续牵制远处敌人。",
		saber: "主将近身挥斩，适合贴脸抢先手。"
	};

	const recruitHero = config.recruitHero || null;

	chapterNavToggleEl.type = "button";
	chapterNavToggleEl.className = "chapterNavToggle";
	chapterNavToggleEl.setAttribute("aria-expanded", "false");
	chapterNavToggleEl.setAttribute("aria-label", "展开章节导航");
	chapterNavToggleEl.textContent = "章节";

	function asParagraphText(value) {
		if (Array.isArray(value)) return value.join("\n\n");
		return value || "";
	}

	function getFlags() {
		if (!store || !store.loadFlags) return {};
		return store.loadFlags();
	}

	function getHeroTotal(flags) {
		return Object.keys(flags || {}).filter(function (key) {
			return !!flags[key];
		}).length;
	}

	function isHeroJoined(flags) {
		if (!recruitHero) return false;
		return !!flags[recruitHero.id];
	}

	function closeDialog() {
		dialog.classList.add("hidden");
	}

	function setChapterNavOpen(open) {
		if (!chapterNavEl) return;
		chapterNavEl.classList.toggle("open", open);
		chapterNavToggleEl.classList.toggle("open", open);
		chapterNavToggleEl.setAttribute("aria-expanded", open ? "true" : "false");
		chapterNavToggleEl.setAttribute("aria-label", open ? "收起章节导航" : "展开章节导航");
	}

	function showDialog(titleText, bodyText, buttonText) {
		dialogTitle.textContent = titleText || "酒馆对话";
		dialogText.textContent = asParagraphText(bodyText);
		dialogBtn.textContent = buttonText || "继续";
		dialog.classList.remove("hidden");
	}

	function startSpriteAnimation(image, frames, frameDuration) {
		if (!image || !Array.isArray(frames) || frames.length <= 1) return;
		let frameIndex = 0;
		image.src = frames[frameIndex];
		const timerId = window.setInterval(function () {
			frameIndex = (frameIndex + 1) % frames.length;
			image.src = frames[frameIndex];
		}, Math.max(60, frameDuration || 90));
		animationTimers.push(timerId);
	}

	function buildMugs(count) {
		mugStrip.innerHTML = "";
		for (let index = 0; index < count; index += 1) {
			const mug = document.createElement("div");
			mug.className = "tavernMug";
			mugStrip.appendChild(mug);
		}
	}

	function buildCards(cards) {
		cardsGrid.innerHTML = "";
		(cards || []).forEach(function (card) {
			const article = document.createElement("article");
			article.className = "restCard" + (card.recruitCard ? " recruitCard" : "");

			const heading = document.createElement("h2");
			heading.textContent = card.title || "";
			article.appendChild(heading);

			const text = document.createElement("p");
			text.textContent = asParagraphText(card.text);
			if (card.recruitCard) {
				heading.id = "recruitCardTitle";
				text.id = "recruitFlavor";
			}
			article.appendChild(text);

			cardsGrid.appendChild(article);
		});

		recruitCardTitle = document.getElementById("recruitCardTitle");
		recruitFlavor = document.getElementById("recruitFlavor");
	}

	function buildPlan(items) {
		planList.innerHTML = "";
		(items || []).forEach(function (item) {
			const li = document.createElement("li");
			li.textContent = item;
			planList.appendChild(li);
		});
	}

	function getFigureSkillData(figure) {
		if (!figure) return null;

		if (figure.skillLabel || figure.skillText) {
			return {
				name: figure.skillLabel || "技能",
				detail: figure.skillText || "",
				heroName: figure.name || "英雄",
				skill: figure.skill || null
			};
		}

		if (!figure.heroId || !store || !store.getHeroDefinition) return null;
		const heroDef = store.getHeroDefinition(figure.heroId);
		if (!heroDef || !heroDef.skill) return null;
		return {
			name: heroDef.skill.label || "技能",
			detail: SKILL_SUMMARIES[heroDef.skill.key] || "点击后可查看这位英雄的核心战斗能力。",
			heroName: heroDef.name || figure.name || "英雄",
			skill: heroDef.skill
		};
	}

	function formatSkillDialog(skillData) {
		if (!skillData) return [];
		const lines = [];
		if (skillData.detail) lines.push(skillData.detail);
		const statBits = [];
		const skill = skillData.skill || {};
		if (typeof skill.damage === "number" && skill.damage > 0) statBits.push("伤害 " + skill.damage);
		if (typeof skill.range === "number" && skill.range > 0) statBits.push("范围 " + skill.range);
		if (typeof skill.splash === "number" && skill.splash > 0) statBits.push("溅射 " + skill.splash);
		if (typeof skill.cooldown === "number" && skill.cooldown > 0) statBits.push("冷却 " + skill.cooldown + "s");
		if (skill.shout) statBits.push("战吼「" + skill.shout + "」");
		if (statBits.length) lines.push(statBits.join(" · "));
		lines.push("点击人物可看剧情，点击头顶技能牌可专门查看技能。")
		return lines;
	}

	function openFigureSkill(figure) {
		const skillData = getFigureSkillData(figure);
		if (!skillData) return;
		showDialog(skillData.heroName + " · " + skillData.name, formatSkillDialog(skillData), "知道了");
	}

	function openFigureDialogue(figure) {
		const flags = getFlags();
		const joined = isHeroJoined(flags);
		if (figure.heroId && recruitHero && figure.heroId === recruitHero.id) {
			showDialog(
				figure.dialogueTitle || recruitHero.name,
				joined ? (figure.joinedDialogue || recruitHero.joinedDialogue || recruitHero.dialogue) : (figure.dialogue || recruitHero.dialogue),
				joined ? "知道了" : "继续"
			);
			return;
		}

		showDialog(figure.dialogueTitle || figure.name, figure.dialogue || [], "继续");
	}

	function buildFigures(figures) {
		sceneCast.innerHTML = "";
		(figures || []).forEach(function (figure) {
			const skillData = getFigureSkillData(figure);
			const node = document.createElement("div");
			node.className = "tavernFigure " + (figure.variant || "soldierFigure") + " " + (figure.slot || "");
			if (figure.heroId || figure.dialogue) node.classList.add("isInteractive");
			if (recruitHero && figure.heroId === recruitHero.id) node.classList.add("isRecruitable");
			if (figure.image || (figure.frames && figure.frames.length)) node.classList.add("hasImage");
			if (skillData) node.classList.add("hasSkillBadge");

			if (figure.image || (figure.frames && figure.frames.length)) {
				const image = document.createElement("img");
				image.className = "figureSprite";
				image.src = figure.image || figure.frames[0];
				image.alt = figure.name || "角色立绘";
				image.loading = "eager";
				node.appendChild(image);
				startSpriteAnimation(image, figure.frames, figure.frameDuration);
			}

			const label = document.createElement("span");
			label.className = "figureName";
			label.textContent = figure.name || "";
			node.appendChild(label);

			if (skillData) {
				const skillBadge = document.createElement("button");
				skillBadge.type = "button";
				skillBadge.className = "figureSkillBadge";
				skillBadge.setAttribute("aria-label", (skillData.heroName || figure.name || "英雄") + "技能：" + skillData.name);
				skillBadge.innerHTML = '<span class="figureSkillHint">技能</span><span class="figureSkillName">' + skillData.name + '</span>';
				skillBadge.addEventListener("click", function (event) {
					event.stopPropagation();
					openFigureSkill(figure);
				});
				skillBadge.addEventListener("keydown", function (event) {
					if (event.key === "Enter" || event.key === " ") {
						event.stopPropagation();
					}
				});
				node.appendChild(skillBadge);
			}

			if (figure.heroId || figure.dialogue) {
				node.tabIndex = 0;
				node.setAttribute("role", "button");
				node.setAttribute("aria-label", (figure.name || "角色") + "对话");
				node.addEventListener("click", function () {
					openFigureDialogue(figure);
				});
				node.addEventListener("keydown", function (event) {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						openFigureDialogue(figure);
					}
				});
			}

			sceneCast.appendChild(node);
		});
	}

	function renderStats() {
		const state = store && store.loadPlayerState ? store.loadPlayerState() : null;
		const flags = getFlags();
		const joined = isHeroJoined(flags);

		level.textContent = "Level " + ((state && state.jeanneLevel) || 1);
		xp.textContent = String((state && typeof state.jeanneTotalXp === "number" ? state.jeanneTotalXp : 0));
		heroCount.textContent = String(getHeroTotal(flags));

		if (!recruitHero) {
			recruitBtn.classList.add("hidden");
			recruitStatus.textContent = "无";
			return;
		}

		recruitStatus.textContent = joined ? (recruitHero.joinedStatus || "已入队") : (recruitHero.pendingStatus || "待招募");

		if (joined) {
			recruitBtn.disabled = true;
			recruitBtn.textContent = recruitHero.joinedLabel || (recruitHero.name + "已入队");
			recruitBtn.classList.add("isJoined");
			if (recruitFlavor) {
				recruitFlavor.textContent = asParagraphText(recruitHero.joinedFlavor);
			}
			return;
		}

		recruitBtn.disabled = false;
		recruitBtn.textContent = recruitHero.recruitLabel || ("免费招募" + recruitHero.name);
		recruitBtn.classList.remove("isJoined");
		if (recruitFlavor) {
			recruitFlavor.textContent = asParagraphText(recruitHero.flavor);
		}
	}

	function recruitHeroNow() {
		if (!store || !store.saveFlags || !recruitHero) return;
		store.saveFlags({ [recruitHero.id]: true });
		renderStats();
		showDialog(recruitHero.name, recruitHero.joinedDialogue || recruitHero.dialogue || [], "出发");
	}

	function renderPage() {
		document.title = config.pageTitle || document.title;
		if (config.themeClass) body.classList.add(config.themeClass);

		eyebrow.textContent = config.eyebrow || "Interlude";
		title.textContent = config.title || "章节休整";
		lead.textContent = asParagraphText(config.lead);
		sceneBanner.textContent = config.banner || "今夜免战";
		nextStageBtn.textContent = config.nextLabel || "继续前进";
		nextStageBtn.href = config.nextHref || "index.html";
		statsTitle.textContent = config.statsTitle || "休整状态";
		planTitle.textContent = config.planTitle || "休整安排";
		statusLabel.textContent = (recruitHero && recruitHero.name) || "招募状态";

		buildMugs(config.mugCount || 3);
		buildCards(config.cards);
		if (recruitCardTitle) {
			recruitCardTitle.textContent = (recruitHero && recruitHero.name) || "可招募英雄";
		}
		buildPlan(config.planItems);
		buildFigures(config.figures);
		renderStats();

		document.querySelectorAll("[data-stage-link]").forEach(function (link) {
			if (link.getAttribute("data-stage-link") === config.stageId) link.classList.add("active");
		});
	}

	if (chapterNavEl) {
		chapterNavEl.id = chapterNavEl.id || "chapterNavMenu";
		chapterNavToggleEl.setAttribute("aria-controls", chapterNavEl.id);
		chapterNavEl.parentNode.insertBefore(chapterNavToggleEl, chapterNavEl);

		chapterNavToggleEl.addEventListener("click", function () {
			setChapterNavOpen(!chapterNavEl.classList.contains("open"));
		});

		chapterNavEl.addEventListener("click", function (event) {
			const target = event.target;
			if (target && target.closest("a")) setChapterNavOpen(false);
		});

		window.addEventListener("pointerdown", function (event) {
			if (!chapterNavEl.classList.contains("open")) return;
			if (chapterNavEl.contains(event.target) || chapterNavToggleEl.contains(event.target)) return;
			setChapterNavOpen(false);
		});
	}

	if (recruitBtn) {
		recruitBtn.addEventListener("click", recruitHeroNow);
	}

	if (dialogBtn) {
		dialogBtn.addEventListener("click", closeDialog);
	}

	window.addEventListener("beforeunload", function () {
		animationTimers.forEach(function (timerId) {
			window.clearInterval(timerId);
		});
	});

	if (dialog) {
		dialog.addEventListener("click", function (event) {
			if (event.target === dialog) closeDialog();
		});
	}

	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape" && dialog && !dialog.classList.contains("hidden")) {
			closeDialog();
		}
	});

	renderPage();
}());