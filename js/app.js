// Define la clase principal de la aplicación To Do
class TodoApp {
  // Constructor: se ejecuta automáticamente al crear una instancia
  constructor() {
    // Inicializa array vacío para almacenar todas las tareas
    this.tasks = [];
    // Variable para controlar qué tarea se está editando (null = ninguna)
    this.currentEditingId = null;
    // Obtiene referencias a elementos del DOM
    this.initializeElements();
    // Configura los eventos globales de la aplicación
    this.bindEvents();
    // Renderiza la lista inicial (vacía)
    this.renderTasks();
  }

  // Método para obtener referencias a elementos HTML del DOM
  initializeElements() {
    // Guarda referencia al input donde se escriben nuevas tareas
    this.taskInput = document.getElementById('taskInput');
    // Guarda referencia al botón "Add"
    this.addButton = document.getElementById('addButton');
    // Guarda referencia al contenedor <ul> donde se muestran las tareas
    this.taskList = document.getElementById('taskList');
  }

  // Configura los eventos principales de la aplicación
  bindEvents() {
    // Cuando se hace click en "Add", ejecuta handleAddTask
    this.addButton.addEventListener('click', () => this.handleAddTask());
    // Escucha teclas presionadas en el input principal
    this.taskInput.addEventListener('keypress', (e) => {
      // Si se presiona Enter, ejecuta handleAddTask
      if (e.key === 'Enter') this.handleAddTask();
    });
  }

  // Genera un ID único combinando timestamp y número aleatorio
  generateId() {
    // Date.now() da milisegundos desde 1970, Math.random() da decimal 0-1
    return Date.now() + Math.random();
  }

  // Maneja el proceso de agregar una nueva tarea
  handleAddTask() {
    // Obtiene el texto del input y elimina espacios al inicio/final
    const taskText = this.taskInput.value.trim();
    // Si el texto está vacío, no hace nada (return temprano)
    if (!taskText) return;

    // Llama al método que agrega la tarea al array
    this.addTask(taskText);
    // Limpia el input después de agregar
    this.taskInput.value = '';
    // Pone el cursor de vuelta en el input para seguir escribiendo
    this.taskInput.focus();
  }

  // Agrega una nueva tarea al array y actualiza la vista
  addTask(text) {
    // Crea objeto tarea con ID único, texto y fecha de creación
    const newTask = {
      id: this.generateId(),        // ID único generado
      text: text,                   // Texto de la tarea
      createdAt: new Date()         // Timestamp de cuándo se creó
    };
    
    // Agrega la nueva tarea al final del array
    this.tasks.push(newTask);
    // Redibuja toda la lista con la nueva tarea incluida
    this.renderTasks();
  }

  // Edita el texto de una tarea existente
  editTask(id, newText) {
    // Busca el índice de la tarea en el array usando su ID
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    // Si encuentra la tarea (índice diferente de -1)
    if (taskIndex !== -1) {
      // Actualiza el texto de la tarea, eliminando espacios extra
      this.tasks[taskIndex].text = newText.trim();
      // Redibuja la lista con los cambios
      this.renderTasks();
    }
  }

  // Elimina una tarea del array
  deleteTask(id) {
    // Crea nuevo array excluyendo la tarea con el ID especificado
    this.tasks = this.tasks.filter(task => task.id !== id);
    // Redibuja la lista sin la tarea eliminada
    this.renderTasks();
  }

  // Crea el elemento HTML completo para una tarea
  createTaskElement(task) {
    // Crea elemento <li> que contendrá toda la tarea
    const listItem = document.createElement('li');
    // Asigna clase CSS para estilos
    listItem.className = 'task-item';
    // Guarda el ID de la tarea como atributo data-id
    listItem.dataset.id = task.id;

    // Crea input de texto para mostrar/editar la tarea
    const taskText = document.createElement('input');
    // Define que es un input de texto
    taskText.type = 'text';
    // Asigna clase CSS
    taskText.className = 'task-text';
    // Pone el texto de la tarea como valor
    taskText.value = task.text;
    // Lo hace solo lectura inicialmente (no editable)
    taskText.readOnly = true;

    // Crea contenedor div para los botones de acción
    const actionsDiv = document.createElement('div');
    // Asigna clase CSS para estilos
    actionsDiv.className = 'task-actions';

    // Crea botón de editar
    const editButton = document.createElement('button');
    // Asigna clase CSS
    editButton.className = 'edit-button';
    // Pone texto "Edit" en el botón
    editButton.textContent = 'Edit';

    // Crea botón de eliminar
    const deleteButton = document.createElement('button');
    // Asigna clase CSS
    deleteButton.className = 'delete-button';
    // Pone texto "Delete" en el botón
    deleteButton.textContent = 'Delete';

    // Configura todos los eventos específicos de esta tarea
    this.bindTaskEvents(taskText, editButton, deleteButton, task.id);

    // Agrega botón Edit al contenedor de acciones
    actionsDiv.appendChild(editButton);
    // Agrega botón Delete al contenedor de acciones
    actionsDiv.appendChild(deleteButton);
    // Agrega el input de texto al elemento principal
    listItem.appendChild(taskText);
    // Agrega el contenedor de acciones al elemento principal
    listItem.appendChild(actionsDiv);

    // Retorna el elemento completo listo para agregar al DOM
    return listItem;
  }

  // Configura todos los eventos específicos de una tarea individual
  bindTaskEvents(taskText, editButton, deleteButton, taskId) {
    // Evento click en botón Edit
    editButton.addEventListener('click', () => {
      // Si esta tarea ya se está editando
      if (this.currentEditingId === taskId) {
        // Guarda los cambios
        this.saveEdit(taskText, editButton, taskId);
      } else {
        // Si no se está editando, inicia modo edición
        this.startEdit(taskText, editButton, taskId);
      }
    });

    // Evento click en botón Delete
    deleteButton.addEventListener('click', () => {
      // Elimina la tarea directamente
      this.deleteTask(taskId);
    });

    // Evento cuando se presiona una tecla en el input de la tarea
    taskText.addEventListener('keypress', (e) => {
      // Si se presiona Enter Y el input no está en modo solo lectura
      if (e.key === 'Enter' && !taskText.readOnly) {
        // Guarda los cambios
        this.saveEdit(taskText, editButton, taskId);
      }
    });

    // Evento cuando el input pierde el foco (blur)
    taskText.addEventListener('blur', () => {
      // Si el input no está en modo solo lectura (se está editando)
      if (!taskText.readOnly) {
        // Guarda los cambios automáticamente
        this.saveEdit(taskText, editButton, taskId);
      }
    });
  }

  // Inicia el modo de edición para una tarea
  startEdit(taskText, editButton, taskId) {
    // Si hay otra tarea editándose
    if (this.currentEditingId !== null) {
      // Cancela la edición actual
      this.cancelCurrentEdit();
    }

    // Marca esta tarea como la que se está editando
    this.currentEditingId = taskId;
    // Permite editar el input (quita solo lectura)
    taskText.readOnly = false;
    // Agrega clase CSS para estilos de edición
    taskText.classList.add('editing');
    // Pone el cursor en el input
    taskText.focus();
    // Selecciona todo el texto para fácil reemplazo
    taskText.select();
    // Cambia el texto del botón a "Save"
    editButton.textContent = 'Save';
  }

  // Guarda los cambios de una edición
  saveEdit(taskText, editButton, taskId) {
    // Obtiene el nuevo texto eliminando espacios extra
    const newText = taskText.value.trim();
    // Si el texto está vacío
    if (!newText) {
      // Cancela la edición (no permite tareas vacías)
      this.cancelEdit(taskText, editButton);
      // Sale de la función
      return;
    }

    // Actualiza la tarea en el array con el nuevo texto
    this.editTask(taskId, newText);
    // Termina el modo de edición
    this.finishEdit(taskText, editButton);
  }

  // Cancela una edición y restaura el texto original
  cancelEdit(taskText, editButton) {
    // Busca la tarea original en el array
    const originalTask = this.tasks.find(task => task.id === this.currentEditingId);
    // Si encuentra la tarea original
    if (originalTask) {
      // Restaura el texto original en el input
      taskText.value = originalTask.text;
    }
    // Termina el modo de edición
    this.finishEdit(taskText, editButton);
  }

  // Termina el modo de edición y restaura el estado normal
  finishEdit(taskText, editButton) {
    // Vuelve a poner el input en modo solo lectura
    taskText.readOnly = true;
    // Quita la clase CSS de edición
    taskText.classList.remove('editing');
    // Cambia el texto del botón de vuelta a "Edit"
    editButton.textContent = 'Edit';
    // Marca que no hay ninguna tarea editándose
    this.currentEditingId = null;
  }

  // Cancela cualquier edición que esté en progreso
  cancelCurrentEdit() {
    // Busca el elemento que tiene la clase 'editing'
    const currentEditingElement = document.querySelector('.task-text.editing');
    // Si encuentra un elemento editándose
    if (currentEditingElement) {
      // Busca el botón Edit de ese elemento
      const editButton = currentEditingElement.parentNode.querySelector('.edit-button');
      // Cancela la edición de ese elemento
      this.cancelEdit(currentEditingElement, editButton);
    }
  }

  // Redibuja toda la lista de tareas en el DOM
  renderTasks() {
    // Limpia completamente el contenido del contenedor de tareas
    this.taskList.innerHTML = '';

    // Si no hay tareas en el array
    if (this.tasks.length === 0) {
      // Crea elemento para mostrar mensaje de lista vacía
      const emptyState = document.createElement('li');
      // Asigna clase CSS para estilos
      emptyState.className = 'empty-state';
      // Pone mensaje informativo
      emptyState.textContent = 'No tasks yet. Add one above!';
      // Agrega el mensaje al contenedor
      this.taskList.appendChild(emptyState);
      // Sale de la función (no hay más que hacer)
      return;
    }

    // Para cada tarea en el array
    this.tasks.forEach(task => {
      // Crea el elemento HTML completo para la tarea
      const taskElement = this.createTaskElement(task);
      // Agrega el elemento al contenedor de tareas
      this.taskList.appendChild(taskElement);
    });
  }
}

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  // Crea una nueva instancia de la aplicación (inicia todo)
  new TodoApp();
});