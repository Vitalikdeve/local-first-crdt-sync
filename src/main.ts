import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

// 1. Initialize single root CRDT document
const doc = new Y.Doc();

// 2. Local persistence layer (IndexedDB)
const indexeddbProvider = new IndexeddbPersistence('local-first-crdt-store', doc);

// 3. Network synchronization layer (WebSockets)
const wsProvider = new WebsocketProvider(
  'ws://localhost:1234',
  'local-first-crdt-room',
  doc
);

// 4. CRDT data structure: Map (Key-Value with conflict-free resolution)
const yTasks = doc.getMap<Task>('tasks');

// DOM elements
const syncStatusEl = document.getElementById('sync-status') as HTMLSpanElement;
const peersStatusEl = document.getElementById('peers-status') as HTMLSpanElement;
const taskForm = document.getElementById('task-form') as HTMLFormElement;
const taskInput = document.getElementById('task-input') as HTMLInputElement;
const taskList = document.getElementById('task-list') as HTMLUListElement;

// Sync status indicator
function updateSyncStatus(connected: boolean) {
  if (connected) {
    syncStatusEl.textContent = 'Synced (Online)';
    syncStatusEl.className = 'status-badge synced';
  } else {
    syncStatusEl.textContent = 'Local Only (Offline)';
    syncStatusEl.className = 'status-badge connecting';
    peersStatusEl.textContent = 'Peers: 1';
  }
}

wsProvider.on('status', (event: { status: string }) => {
  updateSyncStatus(event.status === 'connected');
});

// React to browser network status changes (including DevTools Offline mode)
window.addEventListener('offline', () => {
  wsProvider.disconnect();
  updateSyncStatus(false);
});

window.addEventListener('online', () => {
  wsProvider.connect();
});

// Connected peers tracking (Awareness)
wsProvider.awareness.on('change', () => {
  const count = wsProvider.awareness.getStates().size;
  peersStatusEl.textContent = `Peers: ${count}`;
});

// Render task list on any CRDT change
function renderTasks() {
  taskList.innerHTML = '';
  
  const tasks = Array.from(yTasks.values()).sort((a, b) => a.createdAt - b.createdAt);

  for (const task of tasks) {
    const li = document.createElement('li');
    li.className = 'task-item';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-content';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
      yTasks.set(task.id, {
        ...task,
        completed: checkbox.checked,
      });
    });

    const span = document.createElement('span');
    span.className = `task-text ${task.completed ? 'completed' : ''}`;
    span.textContent = task.text;

    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(span);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.addEventListener('click', () => {
      yTasks.delete(task.id);
    });

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  }
}

// Reactive observer for Yjs data structure mutations
yTasks.observe(() => {
  renderTasks();
});

// Load data from IndexedDB on initial/cold start
indexeddbProvider.on('synced', () => {
  renderTasks();
});

// Add a new task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const id = crypto.randomUUID();
  const newTask: Task = {
    id,
    text,
    completed: false,
    createdAt: Date.now(),
  };

  // Write to CRDT data structure (optimistic UI update, IndexedDB write, and WebSocket broadcast)
  yTasks.set(id, newTask);
  taskInput.value = '';
});
