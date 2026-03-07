(function () {
    const state = {
        initialized: false,
        visible: false,
        active: false,
        won: false,
        playerHp: 0,
        playerMaxHp: 0,
        playerAtk: 0,
        enemyHp: 0,
        enemyMaxHp: 0,
        enemyAtk: 0,
        enemyTimer: null,
        lockUntil: 0,
        panel: null,
        playerFill: null,
        enemyFill: null,
        playerText: null,
        enemyText: null,
        statusText: null,
        startBtn: null,
        attackBtn: null,
        getPlayerStats: null,
        onWin: null,
        onLose: null
    };

    function ensurePanel() {
        if (state.panel) return;
        const panel = document.createElement('div');
        panel.style.cssText = [
            'position:fixed',
            'left:50%',
            'bottom:126px',
            'transform:translateX(-50%)',
            'width:min(520px,92vw)',
            'background:rgba(8,14,28,0.93)',
            'border:1px solid rgba(248,113,113,0.4)',
            'border-radius:12px',
            'padding:0.65rem 0.75rem',
            'z-index:1600',
            'backdrop-filter:blur(8px)',
            'box-shadow:0 10px 28px rgba(0,0,0,0.35)',
            'display:none',
            'color:#e2e8f0',
            'font-family:system-ui,-apple-system,"Segoe UI",sans-serif'
        ].join(';');

        panel.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.55rem;">
                <div style="font-weight:800;font-size:0.9rem;color:#fca5a5;">⚔️ 火星战斗</div>
                <div id="battleStatus" style="font-size:0.75rem;color:#cbd5e1;">准备交战</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.55rem;margin-bottom:0.6rem;">
                <div>
                    <div style="font-size:0.72rem;color:#93c5fd;margin-bottom:0.2rem;">我方军团</div>
                    <div style="height:10px;background:rgba(15,23,42,0.85);border-radius:999px;overflow:hidden;">
                        <div id="battlePlayerFill" style="height:100%;width:100%;background:linear-gradient(90deg,#3b82f6,#22d3ee);"></div>
                    </div>
                    <div id="battlePlayerText" style="font-size:0.72rem;color:#bfdbfe;margin-top:0.15rem;">0 / 0</div>
                </div>
                <div>
                    <div style="font-size:0.72rem;color:#fda4af;margin-bottom:0.2rem;">火星地底军</div>
                    <div style="height:10px;background:rgba(15,23,42,0.85);border-radius:999px;overflow:hidden;">
                        <div id="battleEnemyFill" style="height:100%;width:100%;background:linear-gradient(90deg,#ef4444,#f59e0b);"></div>
                    </div>
                    <div id="battleEnemyText" style="font-size:0.72rem;color:#fecdd3;margin-top:0.15rem;">0 / 0</div>
                </div>
            </div>
            <div style="display:flex;gap:0.55rem;">
                <button id="battleStartBtn" style="flex:1;border:none;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;border-radius:9px;padding:0.5rem;font-weight:800;cursor:pointer;">开始战斗</button>
                <button id="battleAttackBtn" style="flex:1;border:none;background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;border-radius:9px;padding:0.5rem;font-weight:800;cursor:pointer;">攻击</button>
            </div>
        `;

        document.body.appendChild(panel);

        state.panel = panel;
        state.playerFill = panel.querySelector('#battlePlayerFill');
        state.enemyFill = panel.querySelector('#battleEnemyFill');
        state.playerText = panel.querySelector('#battlePlayerText');
        state.enemyText = panel.querySelector('#battleEnemyText');
        state.statusText = panel.querySelector('#battleStatus');
        state.startBtn = panel.querySelector('#battleStartBtn');
        state.attackBtn = panel.querySelector('#battleAttackBtn');

        state.startBtn.addEventListener('click', () => startBattle());
        state.attackBtn.addEventListener('click', () => playerAttack());
    }

    function updateBars() {
        if (!state.panel) return;
        const playerRatio = state.playerMaxHp > 0 ? Math.max(0, state.playerHp / state.playerMaxHp) : 0;
        const enemyRatio = state.enemyMaxHp > 0 ? Math.max(0, state.enemyHp / state.enemyMaxHp) : 0;
        state.playerFill.style.width = `${Math.max(0, Math.min(100, playerRatio * 100))}%`;
        state.enemyFill.style.width = `${Math.max(0, Math.min(100, enemyRatio * 100))}%`;
        state.playerText.textContent = `${Math.max(0, Math.floor(state.playerHp))} / ${Math.max(0, Math.floor(state.playerMaxHp))}`;
        state.enemyText.textContent = `${Math.max(0, Math.floor(state.enemyHp))} / ${Math.max(0, Math.floor(state.enemyMaxHp))}`;
        state.startBtn.style.display = state.active ? 'none' : 'inline-block';
        state.attackBtn.disabled = !state.active;
        state.attackBtn.style.opacity = state.active ? '1' : '0.5';
    }

    function setVisible(visible) {
        ensurePanel();
        if (!visible && state.active) {
            return;
        }
        state.visible = !!visible;
        state.panel.style.display = state.visible ? 'block' : 'none';
        if (!state.visible) {
            stopEnemyAttack();
            state.active = false;
        }
    }

    function stopEnemyAttack() {
        if (state.enemyTimer) {
            clearInterval(state.enemyTimer);
            state.enemyTimer = null;
        }
    }

    function startEnemyAttackLoop() {
        stopEnemyAttack();
        state.enemyTimer = setInterval(() => {
            if (!state.active) return;
            state.playerHp -= state.enemyAtk;
            if (state.playerHp <= 0) {
                state.playerHp = 0;
                state.active = false;
                state.statusText.textContent = '战斗失败，正在重整...';
                stopEnemyAttack();
                state.lockUntil = Date.now() + 2200;
                if (typeof state.onLose === 'function') {
                    state.onLose('mars');
                }
            }
            updateBars();
        }, 1100);
    }

    function startBattle() {
        ensurePanel();
        state.visible = true;
        state.panel.style.display = 'block';
        if (Date.now() < state.lockUntil) {
            state.statusText.textContent = '重整中，请稍后再战';
            return;
        }
        if (typeof state.getPlayerStats !== 'function') return;

        const stats = state.getPlayerStats() || {};
        state.playerMaxHp = Math.max(80, Number(stats.maxHp) || 260);
        state.playerHp = state.playerMaxHp;
        state.playerAtk = Math.max(6, Number(stats.atk) || 28);
        state.enemyMaxHp = Math.max(160, Number(stats.enemyMaxHp) || 900);
        state.enemyHp = state.enemyMaxHp;
        state.enemyAtk = Math.max(8, Number(stats.enemyAtk) || 22);
        state.active = true;
        state.statusText.textContent = '交战中：点击攻击按钮输出';
        updateBars();
        startEnemyAttackLoop();
    }

    function playerAttack() {
        if (!state.active) return;
        const variance = 0.86 + Math.random() * 0.32;
        const damage = Math.max(1, Math.floor(state.playerAtk * variance));
        state.enemyHp -= damage;
        if (state.enemyHp <= 0) {
            state.enemyHp = 0;
            state.active = false;
            state.statusText.textContent = '已获胜：火星防线瓦解';
            stopEnemyAttack();
            if (typeof state.onWin === 'function') {
                state.onWin('mars');
            }
        }
        updateBars();
    }

    function init(options) {
        if (state.initialized) return;
        state.initialized = true;
        state.getPlayerStats = options?.getPlayerStats || null;
        state.onWin = options?.onWin || null;
        state.onLose = options?.onLose || null;
        ensurePanel();
        updateBars();
    }

    window.BattleSystem = {
        init,
        setVisible,
        startBattle,
        playerAttack,
        isActive: () => state.active
    };
})();
