/**
 * 🤠 西部对决 · 存档系统 save.js
 * 
 * 用法：在 roulette.html 的 </body> 前加上：
 *   <script src="save.js"></script>
 * 
 * 不动原 HTML 一行代码，纯外挂式存档。
 */

(function() {
  'use strict';

  // ======= 样式 =======
  const style = document.createElement('style');
  style.textContent = `
    .wd-save-ui {
      position: fixed;
      bottom: 12px;
      left: 12px;
      z-index: 9999;
      display: flex;
      gap: 6px;
      opacity: 0.5;
      transition: opacity 0.3s;
    }
    .wd-save-ui:hover { opacity: 1; }
    .wd-save-btn {
      background: rgba(30,15,10,0.85);
      border: 1px solid #6b3a2a;
      border-radius: 8px;
      padding: 5px 12px;
      color: #c0a090;
      font-size: 0.75em;
      cursor: pointer;
      transition: 0.2s;
      font-family: inherit;
      backdrop-filter: blur(4px);
    }
    .wd-save-btn:hover {
      background: rgba(255,107,53,0.15);
      border-color: #ff6b35;
      color: #f0e6d3;
    }
    .wd-toast {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      background: rgba(0,0,0,0.88);
      color: #ff6b35;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 1.15em;
      z-index: 99999;
      border: 1px solid #8b4513;
      backdrop-filter: blur(8px);
      pointer-events: none;
      animation: wdFade 1.5s ease forwards;
    }
    @keyframes wdFade {
      0% { opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
      15% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
      75% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
    }
    .wd-slot-info {
      position: fixed;
      bottom: 50px;
      left: 12px;
      z-index: 9998;
      font-size: 0.6em;
      color: #5a4030;
    }
  `;
  document.head.appendChild(style);

  // ======= 存档键名 =======
  const SAVE_KEY = 'wd_guild_save';
  const SAVE_META_KEY = 'wd_guild_saves';

  // ======= Toast =======
  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'wd-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  // ======= 序列化游戏状态 =======
  function captureState() {
    if (typeof S === 'undefined') return null;
    
    const state = {
      v: 2,
      t: Date.now(),
      mode: S.mode,
      diff: S.diff,
      phase: S.phase,
      flagOk: S.flagOk,
      guildMode: S.guildMode,
      mult: S.mult,
      rd: S.rd,
      tr: S.tr,
      cp: S.cp,
      ld: S.ld,
      bp: S.bp,
      cc: S.cc,
      br: S.br,
      rs: S.rs,
      bf: S.bf,
      de: S.de,
      da: S.da,
      st: S.st,
      ps: S.ps,
      certShown: S.certShown,
      p: JSON.parse(JSON.stringify(S.p)),
      log: (S.log || []).slice(-30)
    };
    return state;
  }

  // ======= 恢复游戏状态 =======
  function restoreState(state) {
    if (typeof S === 'undefined') return false;

    S.mode = state.mode || 'local';
    S.diff = state.diff || 'medium';
    S.phase = state.phase || 'setup';
    S.flagOk = !!state.flagOk;
    S.guildMode = !!state.guildMode;
    S.mult = state.mult || 1;
    S.rd = state.rd || 0;
    S.tr = state.tr || 0;
    S.cp = state.cp || 0;
    S.ld = state.ld || 0;
    S.bp = state.bp != null ? state.bp : -1;
    S.cc = state.cc || 0;
    S.br = !!state.br;
    S.rs = !!state.rs;
    S.bf = !!state.bf;
    S.de = !!state.de;
    S.da = !!state.da;
    S.st = state.st || 0;
    S.ps = state.ps || 0;
    S.certShown = !!state.certShown;

    if (state.p && state.p.length === 2) {
      for (let i = 0; i < 2; i++) {
        const src = state.p[i];
        const dst = S.p[i];
        dst.n = src.n || '';
        dst.hp = src.hp != null ? src.hp : 5;
        dst.mx = src.mx || 5;
        dst.al = src.al !== false;
        dst.ai = !!src.ai;
        dst.it = JSON.parse(JSON.stringify(src.it || {watch:1,book:1,check:1,flag:0}));
        dst.wa = !!src.wa;
        dst.wp = src.wp || 0;
        dst.ba = !!src.ba;
        dst.bu = !!src.bu;
        dst.fa = !!src.fa;
        dst.fc = src.fc || 0;
        dst.ft = src.ft || 0;
      }
    }

    if (state.log) S.log = state.log.slice();

    updatePhaseUI();
    return true;
  }

  // ======= 根据阶段更新UI =======
  function updatePhaseUI() {
    const phase = S.phase;

    if (phase === 'setup') {
      document.getElementById('setupScreen').style.display = 'block';
      document.getElementById('gameBoard').style.display = 'none';
      return;
    }

    if (phase === 'go' || phase === 'gameover') {
      document.getElementById('setupScreen').style.display = 'block';
      document.getElementById('gameBoard').style.display = 'none';
      S.phase = 'setup';
      return;
    }

    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'block';
    document.getElementById('goOverlay')?.classList.remove('on');
    document.getElementById('blindOverlay')?.classList.remove('on');

    document.getElementById('rdInfo').textContent = `第 ${S.rd} 回合`;
    document.getElementById('multI').textContent = `💥 ×${S.mult}${S.da ? ' ⚔️决斗' : ''}`;

    if (typeof rdAll === 'function') rdAll();
    if (typeof enActs === 'function') enActs();
    if (typeof upBan === 'function') upBan();

    if (phase === 'duel_prompt' && typeof upDuel === 'function') upDuel();

    if (phase === 'loading' && S.bp >= 0) {
      S.phase = 'play';
      S.rs = true;
      if (typeof rdAll === 'function') rdAll();
      if (typeof enActs === 'function') enActs();
      if (typeof upBan === 'function') upBan();
    }
  }

  // ======= 存档 =======
  function saveGame() {
    if (typeof S === 'undefined') { toast('❌ 游戏未加载'); return; }
    if (S.phase === 'setup') { toast('❌ 还没开始呢'); return; }

    const state = captureState();
    if (!state) { toast('❌ 存档失败'); return; }

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      const saves = JSON.parse(localStorage.getItem(SAVE_META_KEY) || '[]');
      saves.unshift({ t: Date.now(), rd: S.rd, p1: S.p[0]?.n, p2: S.p[1]?.n });
      if (saves.length > 10) saves.length = 10;
      localStorage.setItem(SAVE_META_KEY, JSON.stringify(saves));
      toast(`✅ 已存档 (第${S.rd}回合)`);
    } catch(e) {
      toast('❌ 存档失败: ' + e.message);
    }
  }

  // ======= 读档 =======
  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) { toast('❌ 没有存档'); return; }
      const state = JSON.parse(raw);
      if (state.v !== 2) { toast('❌ 存档版本不兼容'); return; }
      if (typeof S === 'undefined') { toast('❌ 游戏未加载'); return; }
      if (restoreState(state)) {
        const timeAgo = formatTimeAgo(state.t);
        toast(`✅ 已读档 (第${state.rd}回合 · ${timeAgo})`);
      } else {
        toast('❌ 读档失败');
      }
    } catch(e) {
      toast('❌ 读档失败: ' + e.message);
    }
  }

  // ======= 删除存档 =======
  function delSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SAVE_META_KEY);
      toast('🗑️ 存档已删除');
    } catch(e) {}
  }

  // ======= 时间格式化 =======
  function formatTimeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return mins + '分钟前';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + '小时前';
    const days = Math.floor(hours / 24);
    return days + '天前';
  }

  // ======= 检查存档信息 =======
  function updateSlotInfo() {
    const info = document.getElementById('wdSlotInfo');
    if (!info) return;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) { info.textContent = ''; return; }
      const state = JSON.parse(raw);
      const p1 = state.p?.[0]?.n || '?';
      const p2 = state.p?.[1]?.n || '?';
      const timeAgo = formatTimeAgo(state.t);
      info.textContent = `💾 ${p1} vs ${p2} · 第${state.rd}回合 · ${timeAgo}`;
    } catch(e) {
      info.textContent = '';
    }
  }

  // ======= 构建UI =======
  function buildUI() {
    const ui = document.createElement('div');
    ui.className = 'wd-save-ui';
    ui.id = 'wdSaveUI';

    const btnSave = document.createElement('button');
    btnSave.className = 'wd-save-btn';
    btnSave.textContent = '💾 存档';
    btnSave.title = '保存当前游戏进度';
    btnSave.onclick = saveGame;

    const btnLoad = document.createElement('button');
    btnLoad.className = 'wd-save-btn';
    btnLoad.textContent = '📂 读档';
    btnLoad.title = '读取上次存档';
    btnLoad.onclick = loadGame;

    const btnDel = document.createElement('button');
    btnDel.className = 'wd-save-btn';
    btnDel.textContent = '🗑️';
    btnDel.title = '删除存档';
    btnDel.onclick = delSave;

    ui.appendChild(btnSave);
    ui.appendChild(btnLoad);
    ui.appendChild(btnDel);

    const info = document.createElement('div');
    info.className = 'wd-slot-info';
    info.id = 'wdSlotInfo';

    document.body.appendChild(ui);
    document.body.appendChild(info);

    updateSlotInfo();
  }

  // ======= 初始化 =======
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(buildUI, 500));
    } else {
      setTimeout(buildUI, 500);
    }
    setInterval(updateSlotInfo, 10000);
  }

  init();

})();