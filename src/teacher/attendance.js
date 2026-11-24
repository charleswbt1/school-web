
const ENDPOINTS = {
  courses: '/api/courses',
  students: courseId => `/api/students/data?course_id=${encodeURIComponent(courseId)}`,
  attendance: (courseId, date) => `/api/attendances?course_id=${encodeURIComponent(courseId)}&date=${encodeURIComponent(date)}`,
  save: '/api/attendances'
};

const STATUS = Object.freeze({ P: 'Presente', F: 'Falta', R: 'Retardo', J: 'Justificado' });
const els = {
  course: document.querySelector('#courseSelect'), date: document.querySelector('#dateInput'),
  reload: document.querySelector('#reloadBtn'), search: document.querySelector('#searchInput'),
  body: document.querySelector('#studentsBody'), save: document.querySelector('#saveBtn'),
  feedback: document.querySelector('#feedback'), description: document.querySelector('#listDescription')
};
let students = [];
let statuses = new Map();
let isSaving = false;
let requestVersion = 0;

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
function setFeedback(message) { els.feedback.textContent = message; }
function validId(id) { return typeof id === 'string' && id.trim().length > 0; }
async function api(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error(`Error HTTP ${response.status} al consultar el servidor`);
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
function getArray(payload, key) {
  // Adapta este método si tus endpoints devuelven otra estructura.
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  if (payload == null && key === 'attendances') return [];
  throw new Error(`La respuesta del servidor no contiene un arreglo de ${key}`);
}
function updateStats() {
  const counts = { P: 0, F: 0, R: 0, J: 0 };
  students.forEach(student => { const status = statuses.get(student.id); if (status) counts[status]++; });
  const values = {
    totalCount: students.length, presentCount: counts.P, absentCount: counts.F,
    lateCount: counts.R, justifiedCount: counts.J,
    pendingCount: students.length - Object.values(counts).reduce((a, b) => a + b, 0)
  };
  Object.entries(values).forEach(([id, value]) => { document.getElementById(id).textContent = value; });
  els.save.disabled = isSaving || !els.course.value || !els.date.value || !students.length;
}
function render() {
  els.body.replaceChildren();
  const term = els.search.value.trim().toLocaleLowerCase('es');
  const filtered = students.filter(student => student.name.toLocaleLowerCase('es').includes(term));
  els.description.textContent = `${filtered.length} de ${students.length} estudiantes`;
  if (!filtered.length) {
    const row = els.body.insertRow(); const cell = row.insertCell(); cell.colSpan = 2;
    cell.className = 'empty'; cell.textContent = students.length ? 'No hay coincidencias.' : 'No hay estudiantes para mostrar.';
  }
  filtered.forEach(student => {
    const row = els.body.insertRow();
    const nameCell = row.insertCell();
    const name = document.createElement('div'); name.className = 'student-name'; name.textContent = student.name;
    const id = document.createElement('div'); id.className = 'student-id'; id.textContent = student.id;
    nameCell.append(name, id);
    const attendanceCell = row.insertCell();
    const group = document.createElement('div'); group.className = 'options'; group.setAttribute('role', 'group');
    group.setAttribute('aria-label', `Asistencia de ${student.name}`);
    Object.entries(STATUS).forEach(([code, label]) => {
      const option = document.createElement('label'); option.className = 'option'; option.dataset.status = code;
      const input = document.createElement('input'); input.type = 'radio'; input.name = `attendance-${student.id}`;
      input.value = code; input.checked = statuses.get(student.id) === code;
      input.addEventListener('change', () => { statuses.set(student.id, code); updateStats(); setFeedback('Hay cambios sin guardar.'); });
      const text = document.createElement('span'); text.textContent = label;
      option.append(input, text); group.append(option);
    });
    attendanceCell.append(group);
  });
  updateStats();
}
async function loadCourses() {
  setFeedback('Cargando cursos...');
  try {
    const courses = getArray(await api(ENDPOINTS.courses), 'courses');
    courses.forEach(course => {
      const id = course.id ?? course.course_id;
      if (!validId(id)) return;
      const option = new Option(course.name ?? course.title ?? id, id);
      els.course.add(option);
    });
    setFeedback('Selecciona un curso para consultar las asistencias.');
  } catch (error) { console.error('Error al cargar cursos:', error); setFeedback(error.message); }
}
async function loadAttendance() {
  const version = ++requestVersion;
  students = []; statuses = new Map(); render();
  const courseId = els.course.value, date = els.date.value;
  if (!courseId || !date) { setFeedback('Selecciona un curso y una fecha.'); return; }
  setFeedback('Cargando estudiantes y asistencias...');
  try {
    const [studentsPayload, attendancePayload] = await Promise.all([
      api(ENDPOINTS.students(courseId)), api(ENDPOINTS.attendance(courseId, date))
    ]);
    if (version !== requestVersion) return;
    students = getArray(studentsPayload, 'students').map(student => ({
      id: student.user_id ?? student.id,
      name: student.name
    })).filter(student => validId(student.id));
    // Se espera un arreglo de {user_id, status} o registros completos.
    const attendanceRecords = getArray(attendancePayload, 'attendances');
    const studentIds = new Set(students.map(student => student.id));
    attendanceRecords.forEach(record => {
      if (studentIds.has(record.user_id) && Object.hasOwn(STATUS, record.status)) statuses.set(record.user_id, record.status);
    });
    render(); setFeedback('Asistencias cargadas.');
  } catch (error) {
    if (version !== requestVersion) return;
    console.error('Error al cargar asistencias:', error);
    students = []; statuses = new Map(); render(); setFeedback(error.message);
  }
}
async function saveAttendance() {
  if (isSaving || !els.course.value || !els.date.value || !students.length) return;
  const pending = students.filter(student => !statuses.has(student.id));
  if (pending.length) {
    setFeedback(`Faltan ${pending.length} estudiantes por registrar. Completa todos antes de guardar.`);
    return;
  }
  const courseId = els.course.value, date = els.date.value;
  const payload = {
    course_id: courseId, date,
    attendances: students.map(student => ({ user_id: student.id, status: statuses.get(student.id) }))
  };
  isSaving = true; updateStats(); setFeedback('Guardando asistencias...');
  try {
    const response = await api(ENDPOINTS.save, { method: 'POST', body: JSON.stringify(payload) });
    setFeedback('Asistencias guardadas correctamente.');
    await showSuccess(response.message || 'Asistencias registradas correctamente.');
  } catch (error) {
    console.error('Error al guardar asistencias:', error);
    setFeedback(error.message);
    await showError(error.message || 'Fallo al registrar asistencias.');
  }
  finally { isSaving = false; updateStats(); }
}

els.course.addEventListener('change', loadAttendance);
els.date.addEventListener('change', loadAttendance);
els.reload.addEventListener('click', loadAttendance);
els.search.addEventListener('input', render);
els.save.addEventListener('click', saveAttendance);
els.date.value = localToday();
loadCourses();
