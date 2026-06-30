const API_BASE = '/api/todos';

// DOM elements
const form = document.getElementById('todoForm');
const input = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Fetch and display all todos
async function fetchTodos() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const todos = await res.json();
    renderTodos(todos);
    updateStats(todos);
    setConnected(true);
  } catch (err) {
    console.error('Failed to fetch todos:', err);
    setConnected(false);
    showToast('Failed to connect to server');
  }
}

// Render todos to the DOM
function renderTodos(todos) {
  if (todos.length === 0) {
    todoList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  todoList.innerHTML = todos
    .map((todo) => {
      const hasSubItems = todo.subItems && todo.subItems.length > 0;
      return `
      <li class="todo-item" data-id="${todo._id}">
        <button class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                onclick="toggleTodo('${todo._id}', ${!todo.completed})"
                aria-label="${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}">
        </button>
        <span class="todo-title ${todo.completed ? 'completed' : ''}" 
              ondblclick="startEditTitle('${todo._id}', this)"
              title="Double-click to edit">${escapeHtml(todo.title)}</span>
        <span class="todo-date">${formatDate(todo.createdAt)}</span>
        <button class="todo-delete" onclick="deleteTodo('${todo._id}')" aria-label="Delete todo">✕</button>
      </li>
      <li class="sub-items-wrapper" data-parent-id="${todo._id}">
        <div class="add-sub-item-form">
          <input
            type="text"
            class="sub-item-input"
            placeholder="Add sub-item to &quot;${escapeHtml(todo.title)}&quot;..."
            data-parent-id="${todo._id}"
          />
          <button class="btn-add-sub" onclick="addSubItem('${todo._id}')">+</button>
        </div>
        ${hasSubItems ? `
        <ul class="sub-items-list">
          ${todo.subItems.map((item) => `
            <li class="sub-item" data-item-id="${item._id}" data-parent-id="${todo._id}">
              <button class="sub-item-checkbox ${item.completed ? 'checked' : ''}" 
                      onclick="toggleSubItem('${todo._id}', '${item._id}', ${!item.completed})"
                      aria-label="${item.completed ? 'Mark as incomplete' : 'Mark as complete'}">
              </button>
              <span class="sub-item-title ${item.completed ? 'completed' : ''}"
                    ondblclick="startEditSubItemTitle('${todo._id}', '${item._id}', this)"
                    title="Double-click to edit">${escapeHtml(item.title)}</span>
              <button class="sub-item-delete" onclick="deleteSubItem('${todo._id}', '${item._id}')" aria-label="Delete sub-item">✕</button>
            </li>
          `).join('')}
        </ul>
        ` : ''}
      </li>
    `;
    })
    .join('');

  // Attach enter-key listeners for sub-item inputs
  document.querySelectorAll('.sub-item-input').forEach((el) => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const parentId = el.dataset.parentId;
        addSubItem(parentId);
      }
    });
  });
}

// Update stats display
function updateStats(todos) {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const pending = total - completed;

  totalCount.textContent = `${total} total`;
  completedCount.textContent = `${completed} completed`;
  pendingCount.textContent = `${pending} pending`;
}

// Create a new todo
async function addTodo(title) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create todo');
    }

    input.value = '';
    await fetchTodos();
  } catch (err) {
    showToast(err.message);
  }
}

// Toggle todo completion
async function toggleTodo(id, completed) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });

    if (!res.ok) throw new Error('Failed to update todo');
    await fetchTodos();
  } catch (err) {
    showToast(err.message);
  }
}

// Delete a todo
async function deleteTodo(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete todo');
    await fetchTodos();
  } catch (err) {
    showToast(err.message);
  }
}

// ===== Inline editing for parent todo title =====

let activeEdit = null; // track active edit element

function startEditTitle(id, titleEl) {
  // If already editing something, cancel it
  if (activeEdit) cancelEdit();

  const currentText = titleEl.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'inline-edit-input';
  input.value = currentText;
  input.setAttribute('data-todo-id', id);

  titleEl.replaceWith(input);
  input.focus();
  input.select();

  activeEdit = { element: input, type: 'title', id };

  function save() {
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== currentText) {
      updateTodoTitle(id, newTitle);
    } else {
      // Re-render to restore original
      activeEdit = null;
      fetchTodos();
    }
    activeEdit = null;
  }

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      activeEdit = null;
      fetchTodos();
    }
  });
}

async function updateTodoTitle(id, title) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to update title');
    activeEdit = null;
    await fetchTodos();
  } catch (err) {
    showToast(err.message);
    activeEdit = null;
    await fetchTodos();
  }
}

function cancelEdit() {
  if (activeEdit) {
    activeEdit = null;
    fetchTodos();
  }
}

// ===== Inline editing for sub-item title =====

function startEditSubItemTitle(todoId, itemId, titleEl) {
  if (activeEdit) cancelEdit();

  const currentText = titleEl.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'inline-edit-input';
  input.value = currentText;
  input.setAttribute('data-todo-id', todoId);
  input.setAttribute('data-item-id', itemId);

  titleEl.replaceWith(input);
  input.focus();
  input.select();

  activeEdit = { element: input, type: 'subitem', id: todoId, itemId };

  function save() {
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== currentText) {
      updateSubItemTitle(todoId, itemId, newTitle);
    } else {
      activeEdit = null;
      fetchTodos();
    }
    activeEdit = null;
  }

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      activeEdit = null;
      fetchTodos();
    }
  });
}

async function updateSubItemTitle(todoId, itemId, title) {
  try {
    const res = await fetch(`${API_BASE}/${todoId}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to update sub-item');
    activeEdit = null;
    await fetchTodos();
  } catch (err) {
    showToast(err.message);
    activeEdit = null;
    await fetchTodos();
  }
}

// ===== Sub-item CRUD =====

async function addSubItem(todoId) {
  const input = document.querySelector(`.sub-item-input[data-parent-id="${todoId}"]`);
  const title = input.value.trim();
  if (!title) return;

  try {
    const res = await fetch(`${API_BASE}/${todoId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error('Failed to add sub-item');

    input.value = '';
    await fetchTodos();
  } catch (err) {
    showToast(err.message);
  }
}

async function toggleSubItem(todoId, itemId, completed) {
  try {
    const res = await fetch(`${API_BASE}/${todoId}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });

    if (!res.ok) throw new Error('Failed to update sub-item');
    await fetchTodos();
  } catch (err) {
    showToast(err.message);
  }
}

async function deleteSubItem(todoId, itemId) {
  try {
    const res = await fetch(`${API_BASE}/${todoId}/items/${itemId}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete sub-item');
    await fetchTodos();
  } catch (err) {
    showToast(err.message);
  }
}

// Form submit handler
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (title) {
    addTodo(title);
  }
});

// Helper: set connection status
function setConnected(connected) {
  statusDot.className = 'status-dot';
  if (connected) {
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected to MongoDB';
  } else {
    statusDot.classList.add('disconnected');
    statusText.textContent = 'Disconnected';
  }
}

// Helper: show error toast
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Helper: escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Helper: format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Initial fetch
fetchTodos();
