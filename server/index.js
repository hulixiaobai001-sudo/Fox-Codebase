const { WebSocketServer } = require('ws');
const http = require('http');

const PORT = process.env.PORT || 3000;
const rooms = new Map(); // code -> [ws_host, ws_guest, name_host, name_guest]

function genCode() {
  let c;
  do { c = Math.random().toString(36).substring(2,6).toUpperCase(); } while (rooms.has(c));
  return c;
}

function other(ws) {
  const r = rooms.get(ws.roomCode);
  if (!r) return null;
  return r[0] === ws ? r[1] : r[0];
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('西部对决服务器运行中 🦊');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.roomCode = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    switch (msg.type) {

      case 'create_room': {
        const code = genCode();
        rooms.set(code, [ws, null, msg.name || '治安官', null]);
        ws.roomCode = code;
        ws.send(JSON.stringify({ type: 'room_created', code }));
        break;
      }

      case 'join_room': {
        const code = (msg.code || '').toUpperCase();
        const r = rooms.get(code);
        if (!r) { ws.send(JSON.stringify({ type: 'error', text: '房间不存在' })); break; }
        if (r[1]) { ws.send(JSON.stringify({ type: 'error', text: '房间已满' })); break; }
        r[1] = ws; r[3] = msg.name || '旅者';
        ws.roomCode = code;
        ws.send(JSON.stringify({ type: 'room_joined', code, myName: r[3], opponentName: r[2] }));
        r[0].send(JSON.stringify({ type: 'opponent_joined', name: r[3], myName: r[2] }));
        break;
      }

      case 'leave_room': {
        const r = rooms.get(ws.roomCode);
        if (r) {
          const o = r[0] === ws ? r[1] : r[0];
          if (o && o.readyState === 1) o.send(JSON.stringify({ type: 'opponent_left' }));
          rooms.delete(ws.roomCode);
        }
        ws.roomCode = null;
        break;
      }

      default: {
        // Relay everything else to the other player
        const o = other(ws);
        if (o && o.readyState === 1) o.send(raw.toString());
        break;
      }
    }
  });

  ws.on('close', () => {
    const r = rooms.get(ws.roomCode);
    if (r) {
      const o = r[0] === ws ? r[1] : r[0];
      if (o && o.readyState === 1) o.send(JSON.stringify({ type: 'opponent_left' }));
      rooms.delete(ws.roomCode);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🤠 西部对决服务器启动 :${PORT}`);
});
