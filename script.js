(() => {
  "use strict";

  const STORAGE_KEY = "xeneon-edge-todos-v1";

  const clockElement = document.getElementById("clock");
  const secondsElement = document.getElementById("seconds");
  const weekdayElement = document.getElementById("weekday");
  const dateElement = document.getElementById("date");
  const progressLabel = document.getElementById("progressLabel");
  const progressBar = document.getElementById("progressBar");
  const todoList = document.getElementById("todoList");
  const emptyState = document.getElementById("emptyState");
  const saveStatus = document.getElementById("saveStatus");
  const addBtn = document.getElementById("addBtn");
  const clearDoneBtn = document.getElementById("clearDoneBtn");
  const taskDialog = document.getElementById("taskDialog");
  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const closeDialogBtn = document.getElementById("closeDialogBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const todoTemplate = document.getElementById("todoTemplate");

  let todos = loadTodos();
  let draggedId = null;
  let saveTimer = null;

  function createId() {
    if (crypto && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function loadTodos() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(stored)) return stored;
    } catch (error) {
      console.warn("無法讀取待辦資料：", error);
    }

    return [
      { id: createId(), text: "點這段文字即可修改內容", completed: false },
      { id: createId(), text: "按右上角新增自己的待辦", completed: false },
      { id: createId(), text: "完成後點左側方框", completed: true }
    ];
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      saveStatus.textContent = "已自動儲存";
    } catch (error) {
      saveStatus.textContent = "儲存失敗";
      console.error("無法儲存待辦資料：", error);
    }
  }

  function scheduleSave() {
    saveStatus.textContent = "儲存中…";
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveTodos, 180);
  }

  function updateClock() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).formatToParts(now);

    const get = type => parts.find(part => part.type === type)?.value ?? "00";

    clockElement.textContent = `${get("hour")}:${get("minute")}`;
    secondsElement.textContent = get("second");
    weekdayElement.textContent = new Intl.DateTimeFormat("zh-TW", {
      weekday: "long"
    }).format(now);
    dateElement.textContent = new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(now).replaceAll("/", " / ");
  }

  function updateProgress() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const percentage = total ? (completed / total) * 100 : 0;

    progressLabel.textContent = `${completed} / ${total}`;
    progressBar.style.width = `${percentage}%`;
  }

  function renderTodos() {
    todoList.replaceChildren();
    emptyState.hidden = todos.length !== 0;

    for (const todo of todos) {
      const item = todoTemplate.content.firstElementChild.cloneNode(true);
      const checkbox = item.querySelector(".todo-check");
      const textInput = item.querySelector(".todo-text");
      const deleteButton = item.querySelector(".delete-button");

      item.dataset.id = todo.id;
      item.classList.toggle("completed", todo.completed);
      checkbox.checked = todo.completed;
      textInput.value = todo.text;

      checkbox.addEventListener("change", () => {
        todo.completed = checkbox.checked;
        item.classList.toggle("completed", todo.completed);
        scheduleSave();
        updateProgress();
      });

      textInput.addEventListener("input", () => {
        todo.text = textInput.value;
        scheduleSave();
      });

      textInput.addEventListener("blur", () => {
        todo.text = todo.text.trim() || "未命名待辦";
        textInput.value = todo.text;
        saveTodos();
      });

      textInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          textInput.blur();
        }
      });

      deleteButton.addEventListener("click", () => {
        todos = todos.filter(entry => entry.id !== todo.id);
        saveTodos();
        renderTodos();
      });

      item.addEventListener("dragstart", event => {
        draggedId = todo.id;
        item.classList.add("dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", todo.id);
      });

      item.addEventListener("dragend", () => {
        draggedId = null;
        item.classList.remove("dragging");
      });

      item.addEventListener("dragover", event => {
        event.preventDefault();
        if (!draggedId || draggedId === todo.id) return;

        const draggedIndex = todos.findIndex(entry => entry.id === draggedId);
        const targetIndex = todos.findIndex(entry => entry.id === todo.id);

        if (draggedIndex < 0 || targetIndex < 0) return;

        const [moved] = todos.splice(draggedIndex, 1);
        todos.splice(targetIndex, 0, moved);
        renderTodos();
      });

      item.addEventListener("drop", event => {
        event.preventDefault();
        saveTodos();
      });

      todoList.appendChild(item);
    }

    updateProgress();
  }

  function openDialog() {
    taskInput.value = "";
    taskDialog.showModal();
    window.setTimeout(() => taskInput.focus(), 50);
  }

  function closeDialog() {
    taskDialog.close();
  }

  addBtn.addEventListener("click", openDialog);
  closeDialogBtn.addEventListener("click", closeDialog);
  cancelBtn.addEventListener("click", closeDialog);

  taskDialog.addEventListener("click", event => {
    if (event.target === taskDialog) closeDialog();
  });

  taskForm.addEventListener("submit", event => {
    event.preventDefault();
    const text = taskInput.value.trim();
    if (!text) {
      taskInput.focus();
      return;
    }

    todos.push({
      id: createId(),
      text,
      completed: false
    });

    saveTodos();
    renderTodos();
    closeDialog();

    window.setTimeout(() => {
      todoList.scrollTop = todoList.scrollHeight;
    }, 0);
  });

  clearDoneBtn.addEventListener("click", () => {
    const completedCount = todos.filter(todo => todo.completed).length;
    if (!completedCount) return;

    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
  });

  updateClock();
  window.setInterval(updateClock, 1000);
  renderTodos();
})();
