import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import * as utils from 'y-websocket/bin/utils';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Yjs Sync Server Running');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  utils.setupWSConnection(ws, req);
});

const PORT = 1234;
server.listen(PORT, () => {
  console.log(`[Sync Server] Listening on ws://localhost:${PORT}`);
});
