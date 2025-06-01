// URL base del servidor JSON donde se almacenan las tareas
const API_URL = 'http://localhost:3000/tareas';

// Función asincrónica para obtener todas las tareas desde la API
const getTareas = async () => {
  try {
    const res = await fetch(API_URL);             // Realiza una petición GET
    return await res.json();                      // Convierte la respuesta en JSON
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    await mostrarMensaje('Error al cargar tareas');
    return [];                                    // Retorna un array vacío si hay error
  }
};

// Función para crear una nueva tarea en la API
const crearTarea = async (tarea) => {
  try {
    await fetch(API_URL, {
      method: 'POST',                             // Método HTTP POST para crear
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarea)                 // Convierte el objeto tarea a JSON
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    await mostrarMensaje('No se pudo crear la tarea');
  }
};

// Función para eliminar una tarea por ID
const eliminarTarea = async (id) => {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'                            // Método HTTP DELETE para eliminar
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    await mostrarMensaje('Error al eliminar la tarea');
  }
};

// Función para actualizar una tarea existente
const actualizarTarea = async (id, tarea) => {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',                              // Método HTTP PUT para actualizar
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarea)
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    await mostrarMensaje('No se pudo actualizar la tarea');
  }
};

// Función auxiliar para esperar cierto tiempo (en ms)
const esperar = (ms) => new Promise(res => setTimeout(res, ms));

// Muestra un mensaje temporal en pantalla durante 3 segundos
const mostrarMensaje = async (msg) => {
  const div = document.getElementById('mensaje');
  div.textContent = msg;
  div.style.display = 'block';
  await esperar(3000);                            // Espera 3 segundos
  div.style.display = 'none';
};

// Carga y muestra las tareas desde la API en el DOM
const renderTareas = async () => {
  const tareas = await getTareas();               // Espera la lista de tareas

  // Limpia el contenido de todas las columnas de tareas
  document.querySelectorAll('.tareas').forEach(div => div.innerHTML = '');

  // Obtiene los valores de los filtros
  const estadoFiltro = document.getElementById('filtro-estado').value;
  const responsableFiltro = document.getElementById('filtro-responsable').value.toLowerCase();

  // Filtra y muestra tareas según los filtros aplicados
  tareas
    .filter(t => 
      (!estadoFiltro || t.estado === estadoFiltro) &&
      (!responsableFiltro || t.responsable.toLowerCase().includes(responsableFiltro))
    )
    .forEach(t => {
      const tareaEl = document.createElement('div');
      tareaEl.className = 'tarea';

      // Genera el contenido HTML de la tarea
      tareaEl.innerHTML = `
        <strong>${t.titulo}</strong><br/>
        <small>${t.descripcion}</small><br/>
        <em>${t.responsable}</em><br/>
        <button onclick="editar(${t.id})">Editar</button>
        <button onclick="borrar(${t.id})">Eliminar</button>
      `;

      // Agrega la tarea en la columna correspondiente a su estado
      document.getElementById(t.estado).appendChild(tareaEl);
    });
};

// Evento para manejar la creación de nuevas tareas desde el formulario
document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();                             // Previene que se recargue la página

  // Obtiene los valores del formulario
  const titulo = document.getElementById('titulo').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const estado = document.getElementById('estado').value;
  const responsable = document.getElementById('responsable').value.trim();

  // Valida los campos antes de crear la tarea
  if (titulo.length < 3 || descripcion.length < 5 || responsable.length < 3) {
    await mostrarMensaje('Todos los campos deben tener contenido válido');
    return;
  }

  // Crea la tarea y actualiza la vista
  await crearTarea({ titulo, descripcion, estado, responsable });
  await mostrarMensaje('Tarea creada con éxito');
  e.target.reset();                              // Limpia el formulario
  renderTareas();                                // Recarga la lista de tareas
});

// Función global para borrar una tarea (usada desde el botón)
window.borrar = async (id) => {
  if (confirm('¿Estás seguro de eliminar esta tarea?')) {
    await eliminarTarea(id);
    await mostrarMensaje('Tarea eliminada');
    renderTareas();
  }
};

// Función global para editar una tarea
window.editar = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const tarea = await res.json();

    // Solicita nuevos valores al usuario
    const nuevoTitulo = prompt('Nuevo título:', tarea.titulo);
    const nuevaDesc = prompt('Nueva descripción:', tarea.descripcion);
    const nuevoEstado = prompt('Nuevo estado (pendiente, en progreso, terminada):', tarea.estado);
    const nuevoResp = prompt('Nuevo responsable:', tarea.responsable);

    // Si el usuario no canceló ningún campo, actualiza la tarea
    if (nuevoTitulo && nuevaDesc && nuevoEstado && nuevoResp) {
      await actualizarTarea(id, {
        titulo: nuevoTitulo,
        descripcion: nuevaDesc,
        estado: nuevoEstado,
        responsable: nuevoResp
      });

      await mostrarMensaje('Tarea actualizada');
      renderTareas();
    }
  } catch (error) {
    console.error('Error al editar tarea:', error);
    await mostrarMensaje('No se pudo cargar la tarea para editar');
  }
};

// Eventos para aplicar filtros en tiempo real
document.getElementById('filtro-responsable').addEventListener('input', renderTareas);
document.getElementById('filtro-estado').addEventListener('change', renderTareas);

// Carga inicial de tareas al cargar la página
renderTareas();
