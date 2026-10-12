# Local-First CRDT State Sync

Local-first collaborative task application with offline persistence and CRDT sync using TypeScript, Yjs, and WebSockets.

## Features

- **Offline-First Storage**: Instant local state loading and persistence via IndexedDB (`y-indexeddb`).
- **Conflict-Free Replication**: Real-time multi-peer sync powered by CRDTs (`yjs` + `y-websocket`).
- **Presence & Awareness**: Real-time peer count indicator.
- **Zero Server Latency**: Optimistic local updates with eventual consistency across all peers.

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Yjs](https://github.com/yjs/yjs) (CRDT framework)
- [y-websocket](https://github.com/yjs/y-websocket) (WebSocket provider & sync server)
- [y-indexeddb](https://github.com/yjs/y-indexeddb) (IndexedDB persistence)
- [ws](https://github.com/websockets/ws) (Node.js WebSocket server)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start the sync server

```bash
npm run server
```

The WebSocket sync server will start at `ws://localhost:1234`.

### 3. Start the client application

In a separate terminal:

```bash
npm run dev
```

Open `http://localhost:5173` in multiple browser tabs or windows to test real-time synchronization and offline functionality.
