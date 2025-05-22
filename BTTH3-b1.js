// Quản lý Todo List Application
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadTasksFromLocalStorage();
        this.updateDisplay();
    }

    // Khởi tạo các phần tử DOM
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasks = document.getElementById('totalTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    // Gắn các sự kiện
    attachEventListeners() {
        // Thêm công việc
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Lọc công việc
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Event delegation cho danh sách công việc
        this.taskList.addEventListener('click', (e) => this.handleTaskAction(e));
        this.taskList.addEventListener('change', (e) => this.handleTaskAction(e));
        this.taskList.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('edit-input')) {
                this.saveTask(e.target.closest('.task-item').dataset.id);
            }
        });
    }

    // Thêm công việc mới
    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (!taskText) {
            this.showNotification('Vui lòng nhập nội dung công việc!', 'error');
            return;
        }

        if (taskText.length > 100) {
            this.showNotification('Nội dung công việc quá dài (tối đa 100 ký tự)!', 'error');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask); // Thêm vào đầu danh sách
        this.taskInput.value = '';
        this.saveTasksToLocalStorage();
        this.updateDisplay();
        this.showNotification('Đã thêm công việc thành công!', 'success');
    }

    // Xử lý các hành động trên công việc
    handleTaskAction(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        const taskId = taskItem.dataset.id;

        if (e.target.classList.contains('task-checkbox')) {
            this.toggleTask(taskId);
        } else if (e.target.classList.contains('delete-btn')) {
            this.deleteTask(taskId);
        } else if (e.target.classList.contains('edit-btn')) {
            this.editTask(taskId);
        } else if (e.target.classList.contains('save-btn')) {
            this.saveTask(taskId);
        } else if (e.target.classList.contains('cancel-btn')) {
            this.cancelEdit();
        } else if (e.target.classList.contains('task-text')) {
            this.toggleTask(taskId);
        }
    }

    // Đánh dấu hoàn thành/chưa hoàn thành
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasksToLocalStorage();
            this.updateDisplay();
            
            const status = task.completed ? 'hoàn thành' : 'chưa hoàn thành';
            this.showNotification(`Đã đánh dấu công việc ${status}!`, 'success');
        }
    }

    // Xóa công việc
    deleteTask(taskId) {
        if (confirm('Bạn có chắc muốn xóa công việc này?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasksToLocalStorage();
            this.updateDisplay();
            this.showNotification('Đã xóa công việc!', 'success');
        }
    }

    // Chỉnh sửa công việc
    editTask(taskId) {
        this.editingTaskId = taskId;
        this.updateDisplay();
    }

    // Lưu chỉnh sửa
    saveTask(taskId) {
        const taskItem = document.querySelector(`[data-id="${taskId}"]`);
        const editInput = taskItem.querySelector('.edit-input');
        const newText = editInput.value.trim();

        if (!newText) {
            this.showNotification('Nội dung công việc không được trống!', 'error');
            return;
        }

        if (newText.length > 100) {
            this.showNotification('Nội dung công việc quá dài (tối đa 100 ký tự)!', 'error');
            return;
        }

        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.text = newText;
            this.editingTaskId = null;
            this.saveTasksToLocalStorage();
            this.updateDisplay();
            this.showNotification('Đã cập nhật công việc!', 'success');
        }
    }

    // Hủy chỉnh sửa
    cancelEdit() {
        this.editingTaskId = null;
        this.updateDisplay();
    }

    // Đặt bộ lọc
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Cập nhật trạng thái nút lọc
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.updateDisplay();
    }

    // Lấy danh sách công việc đã lọc
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    // Cập nhật hiển thị
    updateDisplay() {
        this.updateTaskList();
        this.updateStats();
    }

    // Cập nhật danh sách công việc
    updateTaskList() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.style.display = 'none';
            this.emptyState.style.display = 'block';
        } else {
            this.taskList.style.display = 'block';
            this.emptyState.style.display = 'none';
            
            this.taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        }
    }

    // Tạo HTML cho một công việc
    createTaskHTML(task) {
        const isEditing = this.editingTaskId === task.id;
        
        if (isEditing) {
            return `
                <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} disabled>
                    <input type="text" class="edit-input" value="${task.text}" maxlength="100">
                    <div class="task-actions">
                        <button class="save-btn">💾 Lưu</button>
                        <button class="cancel-btn">❌ Hủy</button>
                    </div>
                </li>
            `;
        }
        
        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn">✏️ Sửa</button>
                    <button class="delete-btn">🗑️ Xóa</button>
                </div>
            </li>
        `;
    }

    // Cập nhật thống kê
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        this.pendingTasks.textContent = pending;
    }

    // Lưu vào Local Storage
    saveTasksToLocalStorage() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu:', error);
            this.showNotification('Lỗi khi lưu dữ liệu!', 'error');
        }
    }

    // Tải từ Local Storage
    loadTasksFromLocalStorage() {
        try {
            const savedTasks = localStorage.getItem('todoTasks');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            this.showNotification('Lỗi khi tải dữ liệu đã lưu!', 'error');
            this.tasks = [];
        }
    }

    // Hiển thị thông báo
    showNotification(message, type = 'success') {
        // Xóa thông báo cũ nếu có
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Tự động xóa sau 3 giây
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Xử lý beforeunload để cảnh báo nếu có dữ liệu chưa lưu
window.addEventListener('beforeunload', (e) => {
    const todoApp = document.querySelector('.container');
    if (todoApp && localStorage.getItem('todoTasks')) {
        // Không cần cảnh báo vì dữ liệu đã được lưu tự động
        return;
    }
});