// Зчитуємо задачі з LocalStorage або створюємо пустий масив
let tasks = JSON.parse(localStorage.getItem('kanban_tasks')) || [];

const board = document.querySelector('.board');
const modal = document.getElementById('modal');
const taskForm = document.getElementById('taskForm');
const addBtn = document.getElementById('addBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Збереження в пам'ять
const saveTasks = () => localStorage.setItem('kanban_tasks', JSON.stringify(tasks));

// Відображення всіх задач
const renderBoard = () => {
    document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');
    
    const counts = { todo: 0, 'in-progress': 0, done: 0 };

    tasks.forEach(task => {
        const list = document.querySelector(`.column[data-status="${task.status}"] .task-list`);
        if (!list) return;

        counts[task.status]++;
        
        const card = document.createElement('div');
        card.className = `task priority-${task.priority}`;
        card.draggable = true;
        card.dataset.id = task.id;
        
        card.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.desc}</p>
            <button class="delete-btn">×</button>
        `;

        // Видалення
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderBoard();
        });

        // Редагування (подвійний клік)
        card.addEventListener('dblclick', () => openModal(task));

        // Drag events
        card.addEventListener('dragstart', () => card.classList.add('dragging'));
        card.addEventListener('dragend', () => card.classList.remove('dragging'));

        list.appendChild(card);
    });

    // Оновлення лічильників
    document.querySelectorAll('.column').forEach(col => {
        const status = col.dataset.status;
        col.querySelector('.count').textContent = counts[status];
    });
};

// Drag & Drop логіка для колонок
document.querySelectorAll('.column').forEach(column => {
    column.addEventListener('dragover', e => {
        e.preventDefault();
        column.classList.add('drag-over');
        const draggingTask = document.querySelector('.dragging');
        column.querySelector('.task-list').appendChild(draggingTask);
    });

    column.addEventListener('dragleave', () => column.classList.remove('drag-over'));

    column.addEventListener('drop', e => {
        column.classList.remove('drag-over');
        const draggingTask = document.querySelector('.dragging');
        const taskId = Number(draggingTask.dataset.id);
        const newStatus = column.dataset.status;

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            tasks[taskIndex].status = newStatus;
            saveTasks();
            renderBoard();
        }
    });
});

// Робота з модальним вікном
const openModal = (task = null) => {
    modal.classList.remove('hidden');
    if (task) {
        document.getElementById('modalTitle').textContent = 'Редагувати задачу';
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDesc').value = task.desc;
        document.getElementById('taskPriority').value = task.priority;
    } else {
        document.getElementById('modalTitle').textContent = 'Нова задача';
        taskForm.reset();
        document.getElementById('taskId').value = '';
    }
};

addBtn.addEventListener('click', () => openModal());
cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

// Додавання / Оновлення задачі
taskForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const id = document.getElementById('taskId').value;
    const newTask = {
        id: id ? Number(id) : Date.now(),
        title: document.getElementById('taskTitle').value,
        desc: document.getElementById('taskDesc').value,
        priority: document.getElementById('taskPriority').value,
        status: id ? tasks.find(t => t.id == id).status : 'todo'
    };

    if (id) {
        const index = tasks.findIndex(t => t.id == id);
        tasks[index] = newTask;
    } else {
        tasks.push(newTask);
    }

    saveTasks();
    renderBoard();
    modal.classList.add('hidden');
});

// Перший запуск
renderBoard();