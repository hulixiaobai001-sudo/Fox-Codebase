const { WebSocketServer } = require('ws');
const http = require('http');

const PORT = process.env.PORT || 3000;

// —— Data ——
const rooms = new Map();   // code -> { players, names, ready, password, state, votes, settings }
const queue = [];          // matchmaking queue
const chatHistory = [];

function genCode() {
  let c;
  do { c = Math.random().toString(36).substring(2,6).toUpperCase(); } while (rooms.has(c));
  return c;
}

function other(ws) {
  const r = rooms.get(ws.roomCode);
  if (!r || ws.spectator) return null;
  return r.players[0] === ws ? r.players[1] : r.players[0];
}

function myIdx(ws) {
  const r = rooms.get(ws.roomCode);
  if (!r) return -1;
  return r.players[0] === ws ? 0 : 1;
}

// —— HTTP ——
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(`🤠 西部对决服务器 v2 🦊\n运行中 · 房间数: ${rooms.size} · 队列: ${queue.length}`);
    return;
  }
  if (req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ rooms: rooms.size, queue: queue.length }));
    return;
  }
  if (req.url === '/leaderboard') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ entries: leaderboard.slice(0, 50) }));
    return;
  }
  res.writeHead(404);
  res.end();
});

// —— Leaderboard / Rank ——
const leaderboard = []; // [{name, score, wins, games, rank, ts}]
const playerStats = new Map(); // name -> {wins, games, score, rank}

function calcScore(wins, games) {
  if (games === 0) return 0;
  return Math.round(wins * 100 + wins/games * 50 + games * 2);
}

function updateLeaderboard(name, won) {
  if (!name) return;
  var s = playerStats.get(name) || {wins: 0, games: 0, score: 0, rank: '未定'};
  s.games++;
  if (won) s.wins++;
  s.score = calcScore(s.wins, s.games);
  // Simple rank system
  var wr = s.games > 0 ? s.wins / s.games : 0;
  if (s.games < 5) s.rank = '新秀';
  else if (wr >= 0.75 && s.games >= 20) s.rank = '西部传说';
  else if (wr >= 0.6 && s.games >= 10) s.rank = '西部枪神';
  else if (wr >= 0.5 || s.games >= 30) s.rank = '赏金猎人';
  else if (wr >= 0.3 || s.games >= 15) s.rank = '牛仔';
  else s.rank = '亡命徒';
  playerStats.set(name, s);

  // Rebuild leaderboard
  leaderboard.length = 0;
  playerStats.forEach((v, k) => {
    leaderboard.push({name: k, score: v.score, wins: v.wins, games: v.games, rank: v.rank, ts: Date.now()});
  });
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 100) leaderboard.length = 100;
}

// —— Friends / Online ——
const onlineUsers = new Map(); // id -> { ws, name }
let onlineIdCounter = 0;

function broadcastOnlineList() {
  const list = [];
  onlineUsers.forEach(u => list.push({ id: u.id, name: u.name }));
  const payload = JSON.stringify({ type: 'online_list', users: list });
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(payload); });
}

// —— WS ——
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.roomCode = null;
  ws.onlineId = null;

  // Register online after a short delay (when we get the name)
  function registerOnline(name) {
    if (ws.onlineId) return;
    onlineIdCounter++;
    const id = 'U' + onlineIdCounter.toString(16).toUpperCase();
    ws.onlineId = id;
    onlineUsers.set(id, { id, name: name || '旅者', ws });
    broadcastOnlineList();
  }

  function unregisterOnline() {
    if (ws.onlineId) {
      onlineUsers.delete(ws.onlineId);
      ws.onlineId = null;
      broadcastOnlineList();
    }
  }

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    switch (msg.type) {

      // ====== ROOM ======
      // ====== FRIENDS ======
      case 'register_online': {
        registerOnline(msg.name);
        ws.send(JSON.stringify({ type: 'registered', id: ws.onlineId }));
        break;
      }
      case 'get_online': {
        const list = [];
        onlineUsers.forEach(u => list.push({ id: u.id, name: u.name }));
        ws.send(JSON.stringify({ type: 'online_list', users: list }));
        break;
      }
      case 'friend_invite': {
        const target = onlineUsers.get(msg.toId);
        if (target && target.ws.readyState === 1) {
          target.ws.send(JSON.stringify({ type: 'friend_invite', fromId: ws.onlineId, fromName: msg.fromName, roomCode: msg.roomCode }));
          ws.send(JSON.stringify({ type: 'invite_sent', toName: target.name }));
        } else {
          ws.send(JSON.stringify({ type: 'invite_failed', reason: '对方不在线' }));
        }
        break;
      }

      // ====== LEADERBOARD ======
      case 'submit_score': {
        updateLeaderboard(msg.name, msg.won);
        var s = playerStats.get(msg.name);
        // Return player's updated stats
        ws.send(JSON.stringify({ type: 'score_updated', stats: s }));
        // Broadcast updated leaderboard
        var payload = JSON.stringify({ type: 'leaderboard', entries: leaderboard.slice(0, 50) });
        wss.clients.forEach(c => { if (c.readyState === 1 && c.onlineId) c.send(payload); });
        break;
      }
      case 'get_leaderboard': {
        ws.send(JSON.stringify({ type: 'leaderboard', entries: leaderboard.slice(0, 50) }));
        break;
      }

      // ====== ROOM ======
      case 'create_room': {
        const code = genCode();
        // Register online with name
        registerOnline(msg.name);
        rooms.set(code, {
          players: [ws, null],
          names: [msg.name || '治安官', null],
          password: msg.password || '',
          spectators: [],
          state: 'waiting',
          votes: {},
          settings: null,
          gameState: null
        });
        ws.roomCode = code;
        ws.send(JSON.stringify({ type: 'room_created', code, hasPassword: !!msg.password }));
        updateRoomList();
        break;
      }

      case 'join_room': {
        const code = (msg.code || '').toUpperCase();
        const r = rooms.get(code);
        if (!r) { ws.send(JSON.stringify({ type: 'error', text: '❌ 房间不存在' })); break; }
        if (r.password && msg.password !== r.password) {
          ws.send(JSON.stringify({ type: 'error', text: '🔒 密码错误' })); break;
        }
        if (r.players[1]) { ws.send(JSON.stringify({ type: 'error', text: '房间已满' })); break; }
        r.players[1] = ws;
        r.names[1] = msg.name || '旅者';
        ws.roomCode = code;
        registerOnline(msg.name);
        ws.send(JSON.stringify({ type: 'room_joined', code, myName: r.names[1], opponentName: r.names[0] }));
        r.players[0].send(JSON.stringify({ type: 'opponent_joined', name: r.names[1], myName: r.names[0] }));
        updateRoomList();
        break;
      }

      case 'spectate_room': {
        const code = (msg.code || '').toUpperCase();
        const r = rooms.get(code);
        if (!r) { ws.send(JSON.stringify({ type: 'error', text: '房间不存在' })); break; }
        ws.roomCode = code;
        ws.spectator = true;
        if (!r.spectators) r.spectators = [];
        r.spectators.push(ws);
        ws.send(JSON.stringify({ type: 'spectating', code, names: r.names }));
        r.players.forEach(p => { if (p && p.readyState === 1) p.send(JSON.stringify({ type: 'spectator_joined', name: msg.name || '观战者' })); });
        break;
      }

      case 'leave_room': {
        leaveRoom(ws, '对方离开了房间');
        break;
      }

      case 'list_rooms': {
        const list = [];
        rooms.forEach((r, code) => {
          if (r.state === 'waiting' && r.players[0] && !r.players[1]) {
            list.push({ code, host: r.names[0], hasPassword: !!r.password });
          }
        });
        ws.send(JSON.stringify({ type: 'room_list', rooms: list }));
        break;
      }

      // ====== MATCHMAKING ======
      case 'join_queue': {
        if (ws.roomCode) { ws.send(JSON.stringify({ type: 'error', text: '已在房间中' })); break; }
        // Check if someone is waiting
        const idx = queue.findIndex(q => q !== ws && q.readyState === 1);
        if (idx >= 0) {
          const other = queue.splice(idx, 1)[0];
          const code = genCode();
          rooms.set(code, {
            players: [other, ws],
            names: [msg.name || '玩家A', msg.name2 || '玩家B'],
            password: '',
            state: 'waiting',
            votes: {},
            settings: null,
            gameState: null
          });
          ws.roomCode = code; other.roomCode = code;
          ws.send(JSON.stringify({ type: 'matched', code, myName: rooms.get(code).names[1], opponentName: rooms.get(code).names[0], myIndex: 1 }));
          other.send(JSON.stringify({ type: 'matched', code, myName: rooms.get(code).names[0], opponentName: rooms.get(code).names[1], myIndex: 0 }));
          updateRoomList();
        } else {
          queue.push(ws);
          ws.send(JSON.stringify({ type: 'in_queue', position: queue.length }));
        }
        break;
      }

      case 'leave_queue': {
        const qi = queue.indexOf(ws);
        if (qi >= 0) queue.splice(qi, 1);
        ws.send(JSON.stringify({ type: 'left_queue' }));
        break;
      }

      // ====== VOTING ======
      case 'vote_settings': {
        const r = rooms.get(ws.roomCode);
        if (!r) { ws.send(JSON.stringify({ type: 'error', text: '不在房间中' })); break; }
        if (!r.votes) r.votes = {};
        r.votes[myIdx(ws)] = msg.settings;
        // Check if both voted
        if (r.votes[0] && r.votes[1]) {
          // Merge settings (use host's as base, override with joiner's if no conflict)
          const final = Object.assign({}, r.votes[0], r.votes[1]);
          r.settings = final;
          r.players[0].send(JSON.stringify({ type: 'settings_agreed', settings: final }));
          r.players[1].send(JSON.stringify({ type: 'settings_agreed', settings: final }));
        } else {
          const otherP = other(ws);
          if (otherP) otherP.send(JSON.stringify({ type: 'opponent_voted', who: myIdx(ws) }));
        }
        break;
      }

      // ====== ANTI-CHEAT ======
      case 'validate_action': {
        const r = rooms.get(ws.roomCode);
        if (!r) { ws.send(JSON.stringify({ type: 'validation', valid: false, reason: '不在房间' })); break; }
        const idx = myIdx(ws);
        // Basic validation: is it your turn?
        if (r.gameState && r.gameState.currentPlayer !== idx) {
          ws.send(JSON.stringify({ type: 'validation', valid: false, reason: '还没到你的回合' }));
          break;
        }
        // Update game state on server
        if (msg.gameState) r.gameState = msg.gameState;
        ws.send(JSON.stringify({ type: 'validation', valid: true }));
        break;
      }

      case 'game_over': {
        const r = rooms.get(ws.roomCode);
        if (r) {
          r.state = 'ended';
          const o = other(ws);
          if (o) o.send(JSON.stringify({ type: 'opponent_game_over', winner: msg.winner }));
        }
        break;
      }

      // ====== GLOBAL CHAT ======
      case 'global_chat': {
        const text = (msg.text || '').trim().slice(0, 100);
        if (!text) break;
        const name = msg.name || '匿名';
        const entry = { name, text, time: Date.now() };
        chatHistory.push(entry);
        if (chatHistory.length > 100) chatHistory.shift();
        // Broadcast to all connected clients
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: 'global_chat', ...entry }));
          }
        });
        break;
      }

      case 'get_chat_history': {
        ws.send(JSON.stringify({ type: 'chat_history', messages: chatHistory.slice(-50) }));
        break;
      }

      // ====== RELAY ======
      default: {
        if (ws.spectator) {
          // Spectators can't send game messages to players
          ws.send(JSON.stringify({ type: 'error', text: '观战模式不能操作' }));
          break;
        }
        // Relay to the other player
        const o = other(ws);
        if (o && o.readyState === 1) o.send(raw.toString());
        // Also relay to spectators
        const r = rooms.get(ws.roomCode);
        if (r && r.spectators) {
          r.spectators.forEach(s => {
            if (s.readyState === 1) s.send(raw.toString());
          });
        }
        break;
      }
  });

  ws.on('close', () => {
    unregisterOnline();
    leaveRoom(ws, '对方断线了');
    const qi = queue.indexOf(ws);
    if (qi >= 0) queue.splice(qi, 1);
  });

  ws.on('error', () => {});
});

function leaveRoom(ws, msg) {
  if (!ws.roomCode) return;
  const r = rooms.get(ws.roomCode);
  if (!r) { ws.roomCode = null; return; }
  
  // Handle spectator leave
  if (ws.spectator && r.spectators) {
    const idx = r.spectators.indexOf(ws);
    if (idx >= 0) r.spectators.splice(idx, 1);
    r.players.forEach(p => {
      if (p && p.readyState === 1) p.send(JSON.stringify({ type: 'spectator_left' }));
    });
    ws.roomCode = null;
    return;
  }
  
  const o = r.players[0] === ws ? r.players[1] : r.players[0];
  if (o && o.readyState === 1) {
    o.send(JSON.stringify({ type: 'opponent_left', reason: msg }));
  }
  // Notify spectators
  if (r.spectators) {
    r.spectators.forEach(s => {
      if (s.readyState === 1) s.send(JSON.stringify({ type: 'game_ended' }));
    });
  }
  rooms.delete(ws.roomCode);
  ws.roomCode = null;
  updateRoomList();
}

function updateRoomList() {
  const list = [];
  rooms.forEach((r, code) => {
    if (r.state === 'waiting' && r.players[0] && !r.players[1]) {
      list.push({ code, host: r.names[0], hasPassword: !!r.password });
    }
  });
  const payload = JSON.stringify({ type: 'room_list', rooms: list });
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(payload);
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🤠 西部对决服务器 v2 启动 :${PORT}`);
});
