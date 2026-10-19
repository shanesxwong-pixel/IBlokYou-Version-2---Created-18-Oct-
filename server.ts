import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { RoomManager } from './src/server/roomManager.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize WebSocket server on /ws path
const wss = new WebSocketServer({ server, path: '/ws' });
const roomManager = new RoomManager();

wss.on('connection', (ws) => {
  roomManager.registerClient(ws);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'iBlokYou', version: '2.0.0' });
});

// Room check endpoint
app.get('/api/rooms/:code', (req, res) => {
  const room = roomManager.getRoomInfo(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const activePlayers = room.turnOrder.map((pid) => room.players[pid]).filter(Boolean);
  res.json({
    roomCode: room.roomCode,
    status: room.status,
    playerCount: activePlayers.length,
    maxPlayers: 4,
    settings: room.settings,
  });
});

// Standalone HTML game endpoint & direct download for examiner submission
app.get('/iblokyou.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'iblokyou.html'));
});

app.get('/download/iblokyou.html', (req, res) => {
  res.download(path.join(__dirname, 'public', 'iblokyou.html'), 'iBlokYou_Conflict_Management_Edition.html');
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middleware in development mode
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware mounted in dev mode');
    } catch (err) {
      console.error('Failed to mount Vite middleware, falling back to static dist:', err);
      const distPath = path.join(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    // Serve production build
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`iBlokYou server & WebSocket running on port ${PORT}`);
  });
}

startServer();
