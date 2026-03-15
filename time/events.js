function ensureMoonEvacuationLine() {
    const moonBridge = game.upgrades.tech.find(item => item.id === 't1');
    if (moonBridge && !moonBridge.unlocked) {
        moonBridge.unlocked = true;
    }
    game.techLevel = Math.max(1, Number(game.techLevel) || 0);
    if (!game.unlockedPlanets.includes('moon')) {
        game.unlockedPlanets.push('moon');
    }
    const techNames = ['🌍 行星文明', '🌙 地月文明', '☀️ 太阳系文明', '🌠 星际文明', '🌌 银河文明'];
    document.getElementById('civLevel').textContent = techNames[game.techLevel] || techNames[0];
    updateSolarOverlay();
    renderUpgradeCategory('tech');
    renderUpgradeCategory('mining');
    renderUpgradeCategory('energy');
}

function playEarthSplitCinematic(onComplete = null) {
    const earthSplitImgUrl = typeof window.__resolveWorldAssetUrl === 'function'
        ? window.__resolveWorldAssetUrl('img/earth2.jpg')
        : 'img/earth2.jpg';
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(255,255,255,1);
        opacity: 0;
        z-index: 5800;
        pointer-events: none;
        transition: opacity 0.14s ease;
    `;
    document.body.appendChild(flash);
    requestAnimationFrame(() => {
        flash.style.opacity = '1';
    });
    setTimeout(() => {
        flash.style.opacity = '0';
    }, 120);
    setTimeout(() => {
        flash.remove();
    }, 420);

    const modal = document.createElement('div');
    modal.className = 'milestone-overlay';
    modal.innerHTML = `
        <div class="milestone-box" style="max-width:640px;border-color:rgba(248,113,113,0.85);box-shadow:0 0 80px rgba(239,68,68,0.45);">
            <div class="milestone-emoji">☢️</div>
            <div class="milestone-heading" style="background:linear-gradient(135deg,#fca5a5,#f87171);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">核大战爆发</div>
            <div class="milestone-description">全球核打击链路失控，地表秩序瞬间崩解。</div>
            <img src="${earthSplitImgUrl}" alt="地球裂变" style="width:min(360px,80vw);max-height:220px;object-fit:cover;border-radius:12px;border:1px solid rgba(248,113,113,0.65);margin:0 auto 1.2rem;display:block;" />
            <button class="milestone-cta" style="background:linear-gradient(135deg,#ef4444,#f97316);">继续</button>
        </div>
    `;
    setTimeout(() => {
        document.body.appendChild(modal);
        const btn = modal.querySelector('button');
        if (btn) {
            btn.onclick = () => {
                modal.remove();
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            };
        }
    }, 220);
}

function triggerEarthCatastrophe(forceCinematic = false) {
    if (game.earthCatastropheTriggered || !game.earthDoomed) return;
    const fromCondemnationPath = !!game.condemnationPendingCollapse;
    const shouldCollapseToThreeSlots = fromCondemnationPath || !!game.earthCollapseThreeSlotsPending;
    game.earthCatastropheTriggered = true;
    if (shouldCollapseToThreeSlots) {
        game.earthPermanentThreeSlots = true;
        applyEarthThreeSlotLock();
        game.earthCollapseThreeSlotsPending = false;
    }
    if (fromCondemnationPath) {
        game.condemnationPendingCollapse = false;
        game.condemnationBaseClicks = 0;
    }
    game.moonEvacuationReady = false;
    game.ore = Math.max(0, Math.floor(game.ore * 0.35));
    game.energy = Math.max(0, Math.floor(game.energy * 0.25));
    game.tech = Math.max(0, Math.floor(game.tech * 0.6));
    if (fromCondemnationPath || forceCinematic) {
        const afterCinematic = forceCinematic
            ? () => {
                if (typeof window.showStoryEvent === 'function') {
                    window.showStoryEvent(
                        '📡 月球“阿耳忒弥斯-庚辰”联合基地——最后的全球广播',
                        '警告：地壳稳定性传感器已离线。<br><br>' +
                        '播报员（声音颤抖）：“……这里是月球统一指挥部。正如你们在观测窗看到的……地球，我们的母星，在三分钟前由于富士山深层地核武器的链式反应，已经……彻底崩裂。<br><br>' +
                        '大气层正在迅速逃逸，由于地心熔岩直接暴露，全球海洋已蒸发 60% 以上。我们监测到地磁场已完全消失。月球轨道正在受不规则引力波影响发生偏移。<br><br>' +
                        '幸存的公民们，请放弃一切幻想。地球已成炼狱，人类文明的倒计时……现在开始。所有动力系统立刻转向维持基地生命支持，我们要……寻找新的家园了。”',
                        '转入生存模式'
                    );
                }
            }
            : null;
        playEarthSplitCinematic(afterCinematic);
    }
    updateProduction();
    updateUI();
    checkStageProgress();
}

function schedulePostWarRetaliation() {
    if (game.postWarRetaliationPending) return;
    if (game.earthCatastropheTriggered) return;
    game.postWarRetaliationPending = true;
    game.postWarRetaliationStartMonth = Math.max(0, Number(game.calendarMonthsElapsed) || 0);
}

function checkPostWarRetaliation() {
    if (!game.postWarRetaliationPending) return;
    if (game.earthCatastropheTriggered) {
        game.postWarRetaliationPending = false;
        return;
    }
    const months = Math.max(0, Number(game.calendarMonthsElapsed) || 0);
    const startMonth = Math.max(0, Number(game.postWarRetaliationStartMonth) || 0);
    if (months - startMonth < 6) return;

    game.postWarRetaliationPending = false;
    game.earthDoomed = true;
    game.earthCollapseThreeSlotsPending = true;

    if (typeof window.showStoryEvent === 'function') {
        window.showStoryEvent(
            '☢️ 核反击',
            '战败者不甘于失败，发动了核反击！',
            '进入灾变',
            () => {
                triggerEarthCatastrophe(true);
            }
        );
    } else {
        alert('战败者不甘于失败，发动了核反击！');
        triggerEarthCatastrophe(true);
    }
}

function checkMoonEvacuationPreparation() {
    if (!game.earthCatastropheTriggered || game.moonEvacuationReady) return;
    const moonBridge = game.upgrades.tech.find(item => item.id === 't1');
    const researchCenterCount = getResearchCenterCount();
    const energyStationCount = getBuildingCount('energyStation');
    const requiredOre = 1200;
    if (!moonBridge?.unlocked || researchCenterCount < 1 || energyStationCount < 2 || game.ore < requiredOre) {
        return;
    }
    game.ore -= requiredOre;
    game.moonEvacuationReady = true;
    ensureMoonEvacuationLine();
    if (typeof window.showStoryEvent === 'function') {
        window.showStoryEvent(
            '🚀 月球撤离准备完成',
            '你完成了方舟准备并发射首批月球撤离舰队。<br>现在正式进入地月生存线。',
            '进入地月线'
        );
    }
    updateProduction();
    updateUI();
    checkStageProgress();
}

function checkNarrativePacing() {
    if (!game.country || game.nuclearEventResolved) return;
    const earthClicks = Math.max(0, Number(game.earthClickCount) || 0);

    if (!game.crisisSignal1Shown && earthClicks >= 8) {
        game.crisisSignal1Shown = true;
        if (typeof window.showStoryEvent === 'function') {
            window.showStoryEvent(
                '无事发生',
                '以色列占领加沙，在地球尺度下无事发生。',
                '继续发展'
            );
        }
        return;
    }

    if (!game.aiSingularitySignalShown && earthClicks >= 13) {
        game.aiSingularitySignalShown = true;
        if (typeof window.showStoryEvent === 'function') {
            window.showStoryEvent(
                '🧠 AI时代冲击',
                'AI智力全面超越人类，全球下岗潮爆发。泰国占领缅甸。',
                '继续发展'
            );
        }
        return;
    }

    if (!game.crisisSignal2Shown && earthClicks >= 18) {
        game.crisisSignal2Shown = true;
        if (typeof window.showStoryEvent === 'function') {
            window.showStoryEvent(
                '📰 机器人替代人类',
                'AI和机器人大量代替人类，人类对世界的控制力仅剩能源和矿产。俄罗斯占领乌克兰。',
                '保持警戒'
            );
        }
        return;
    }

    if (!game.terminalProducerSignalShown && earthClicks >= 23) {
        game.terminalProducerSignalShown = true;
        if (typeof window.showStoryEvent === 'function') {
            window.showStoryEvent(
                '🏭 终产者时代',
                '能源和矿产持续20多年上涨，人类终产者出现，1%的人控制地球99%的能源和矿产。美国附庸伊朗，巴基斯坦占领阿富汗，土耳其和以色列平分叙利亚。',
                '继续发展'
            );
        }
        return;
    }

    if (!game.nuclearEventTriggered && earthClicks >= 28) {
        game.nuclearEventTriggered = true;
        triggerNuclearCrisisEvent();
    }
}

function checkCondemnationCollapse() {
    if (!game.condemnationPendingCollapse) return;
    if (game.earthCatastropheTriggered || !game.earthDoomed) return;
    const earthClicks = Math.max(0, Number(game.earthClickCount) || 0);
    const baseClicks = Math.max(0, Number(game.condemnationBaseClicks) || 0);
    if (earthClicks - baseClicks >= 5) {
        triggerEarthCatastrophe();
    }
}

function checkChinaTerritoryWarline() {
    if (game.country !== 'china') return;
    if (!game.chinaInvasionFactoryBuilt || game.chinaWarResolved) return;

    const months = Math.max(0, Number(game.calendarMonthsElapsed) || 0);
    const startMonth = Math.max(0, Number(game.chinaInvasionStartMonth) || 0);
    const elapsed = months - startMonth;

    if (!game.chinaWarDeclared && elapsed >= 6) {
        game.chinaWarDeclared = true;
        if (typeof window.showStoryEvent === 'function') {
            window.showStoryEvent(
                '⚔️ 战争爆发',
                '欧盟联合美国对中国宣战。',
                '迎战'
            );
        }
        return;
    }

    if (!game.chinaWarFrontlineWarningShown && elapsed >= 12) {
        game.chinaWarFrontlineWarningShown = true;
        if (typeof window.showStoryEvent === 'function') {
            window.showStoryEvent(
                '🚨 前线告急',
                '前线顶不住了，快增加机器人军团。',
                '立刻增援'
            );
        }
        return;
    }

    if (elapsed < 18) return;

    const robotCount = typeof getBuildingCount === 'function'
        ? Math.max(0, Number(getBuildingCount('robotLegion')) || 0)
        : 0;
    game.chinaWarResolved = true;

    if (robotCount >= 3) {
        schedulePostWarRetaliation();
        if (typeof window.showStoryEvent === 'function') {
            window.showStoryEvent(
                '🏆 战争胜利',
                `中国机器人军团规模达到 ${robotCount}，成功赢得战争。`,
                '继续扩张'
            );
        }
        return;
    }

    if (typeof window.showStoryEvent === 'function') {
        window.showStoryEvent(
            '🏳️ 国家灭亡',
            '中国主战线崩溃，中国灭亡。',
            '重新开始',
            () => {
                try {
                    localStorage.removeItem('spaceEmpireV5');
                    sessionStorage.setItem('resetFlag', 'true');
                } catch (_) {}
                location.reload(true);
            }
        );
    } else {
        alert('中国灭亡（国家结局）。');
        try {
            localStorage.removeItem('spaceEmpireV5');
            sessionStorage.setItem('resetFlag', 'true');
        } catch (_) {}
        location.reload(true);
    }
}

function checkEuTerritoryWarline() {
    if (game.country !== 'eu') return;
    if (!game.euInvasionFactoryBuilt || game.euWarResolved) return;

    const months = Math.max(0, Number(game.calendarMonthsElapsed) || 0);
    const startMonth = Math.max(0, Number(game.euInvasionStartMonth) || 0);
    const elapsed = months - startMonth;

    if (!game.euWarDeclared && elapsed >= 6) {
        game.euWarDeclared = true;
        if (typeof window.showStoryEvent === 'function') {
            window.showStoryEvent(
                '⚔️ 战争爆发',
                '多国对欧盟宣战。',
                '迎战'
            );
        }
        return;
    }

    if (!game.euWarFrontlineWarningShown && elapsed >= 12) {
        game.euWarFrontlineWarningShown = true;
        if (typeof window.showStoryEvent === 'function') {
            window.showStoryEvent(
                '🚨 前线告急',
                '前线顶不住了，快增加机器人军团。',
                '立刻增援'
            );
        }
        return;
    }

    if (elapsed < 18) return;

    const robotCount = typeof getBuildingCount === 'function'
        ? Math.max(0, Number(getBuildingCount('robotLegion')) || 0)
        : 0;
    game.euWarResolved = true;

    if (robotCount >= 3) {
        schedulePostWarRetaliation();
        if (typeof window.showStoryEvent === 'function') {
            window.showStoryEvent(
                '🏆 战争胜利',
                `欧盟机器人军团规模达到 ${robotCount}，成功赢得战争。`,
                '继续扩张'
            );
        }
        return;
    }

    if (typeof window.showStoryEvent === 'function') {
        window.showStoryEvent(
            '🏳️ 国家灭亡',
            '欧盟主战线崩溃，欧盟灭亡。',
            '重新开始',
            () => {
                try {
                    localStorage.removeItem('spaceEmpireV5');
                    sessionStorage.setItem('resetFlag', 'true');
                } catch (_) {}
                location.reload(true);
            }
        );
    } else {
        alert('欧盟灭亡（国家结局）。');
        try {
            localStorage.removeItem('spaceEmpireV5');
            sessionStorage.setItem('resetFlag', 'true');
        } catch (_) {}
        location.reload(true);
    }
}

function checkGlobalCrisis() {
    if (!game.nuclearEventResolved) return;
    if (!game.earthDoomed) return;
    if (game.earthCatastropheTriggered) return;
    if (game.condemnationPendingCollapse) return;
    if ((Number(game.calendarMonthsElapsed) || 0) >= 28) {
        triggerEarthCatastrophe();
    }
}

function triggerNuclearCrisisEvent() {
    if (game.nuclearEventResolved) return;
    game.nuclearEventTriggered = true;

    if (game.country === 'usa') {
        showDecisionEvent(
            '☢️ 日本开始军事化核武',
            '动荡的世界局势下，日本决定开始核工业全面军事化。你将决定是否支持该请求。',
            [
                {
                    label: '不同意（外交施压，避免大战）',
                    onClick: () => {
                        game.nuclearEventResolved = true;
                        game.earthDoomed = false;
                        game.diplomacyShield = true;
                        if (typeof window.showStoryEvent === 'function') {
                            window.showStoryEvent(
                                '🕊️ 外交阻断成功',
                                '你否决了军事化核武议案，全球冲突烈度下降，地球保全线开启。',
                                '继续发展'
                            );
                        }
                    }
                },
                {
                    label: '同意（高风险升级）',
                    danger: true,
                    onClick: () => {
                        game.nuclearEventResolved = true;
                        game.earthDoomed = true;
                        game.diplomacyShield = false;
                        if (typeof window.showStoryEvent === 'function') {
                            window.showStoryEvent(
                                '🔥 军备升级失控',
                                '军事化核武竞赛加速，战争风险被锁定。地球将在未来进入灾变期。',
                                '准备撤离'
                            );
                        }
                    }
                }
            ]
        );
        return;
    }

    if (game.country === 'china') {
        showDecisionEvent(
            '☢️ 日本提出军事化核武请求',
            '动荡的世界局势下，日本决定开始核工业全面军事化。',
            [
                {
                    label: '谴责',
                    danger: true,
                    onClick: () => {
                        game.nuclearEventResolved = true;
                        game.earthDoomed = true;
                        game.condemnationPendingCollapse = true;
                        game.condemnationBaseClicks = Math.max(0, Number(game.earthClickCount) || 0);
                        game.earthCollapseThreeSlotsPending = true;
                        if (typeof window.showStoryEvent === 'function') {
                            window.showStoryEvent(
                                '📢 外交谴责失效',
                                '你发出最严厉的公开谴责，但各方并未收手，地球进入核风险时代。',
                                '进入战备'
                            );
                        }
                    }
                },
                {
                    label: '直接宣战',
                    danger: true,
                    onClick: () => {
                        game.nuclearEventResolved = true;
                        game.earthDoomed = true;
                        game.condemnationPendingCollapse = false;
                        game.calendarMonthsElapsed = Math.max(24, Number(game.calendarMonthsElapsed) || 0);
                        if (typeof window.showStoryEvent === 'function') {
                            window.showStoryEvent(
                                '⚔️ 战争全面升级',
                                '你下令直接开战，地区冲突迅速外溢为全面对抗。',
                                '准备迎战'
                            );
                        }
                        triggerEarthCatastrophe();
                    }
                }
            ]
        );
        return;
    }

    showDecisionEvent(
        '☢️ 日本军事化核武事件',
        '欧盟未能形成统一决策，事件进入自动失控分支。你将被迫承担后果。',
        [
            {
                label: '接受现实',
                danger: true,
                onClick: () => {
                    game.nuclearEventResolved = true;
                    game.earthDoomed = true;
                    game.earthCollapseThreeSlotsPending = true;
                    if (typeof window.showStoryEvent === 'function') {
                        window.showStoryEvent(
                            '🎭 躺枪线启动',
                            '你没有改变冲突的能力，地球灾变倒计时已开启。',
                            '维持文明火种'
                        );
                    }
                }
            }
        ]
    );
}
