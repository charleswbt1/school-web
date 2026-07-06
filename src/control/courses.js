const params = new URLSearchParams(window.location.search);
const user_id = sessionStorage.getItem("userId");
const role = sessionStorage.getItem("role");

async function loadCourses() {
    try {
        const year = params.get('year');
        const month = params.get('month');
        let query = year && month ? `?year=${year}&month=${month}` : "";
        query = role === "coordinator" ? `${query}&coordinator_id=${user_id}` : query;
        const btnView = role != "coordinator" ? 'hidden' : '';
        document.getElementById('btn-add-course').style.display = role === 'coordinator' ? 'block' : 'none';

        const response = await fetch(`${apiUrl}/api/courses${query}`);
        if (!response.ok) {
            throw new Error('Error al obtener cursos');
        }
        const courses = await response.json();
        const tbody = document.getElementById('courses-table-body');
        if (!courses.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">No hay cursos registrados</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = courses.map(course => `
            <tr>
                <td>${course.name}</td>
                <td>${course.description}</td>                
                <td>${course.date_init}</td>
                <td>${course.date_end}</td>
                <td>${course.state}</td>
                <td>
                    <div class="button-container">
                        <button
                            onclick="viewPayments('${course.id}')">
                            Pagos
                        </button>
                        <button
                            onclick="viewStudents('${course.id}')" ${btnView}>
                            Control
                        </button>
                        <button
                            onclick="viewCount('${course.id}')" ${btnView}>
                            Conteo
                        </button>
                        <button
                            onclick="update('${course.id}')" ${btnView}>
                            Editar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('control courses: Error al cargar los cursos', error);
        document.getElementById('courses-table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los cursos
                </td>
            </tr>
        `;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadCourses();

    const btnAdd = document.getElementById('btn-add-course');

    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            window.location.href = '../coordinator/course-create.html';
        });
    }
});

function viewStudents(id) {
    window.location.href = `../coordinator/control-students.html?id=${id}`;
}

function viewCount(id) {
    window.location.href = `../coordinator/count-advisers.html?id=${id}`;
}

function viewPayments(id) {
    window.location.href = `../counter/student-payments.html?id=${id}`;
}

function update(id) {
    window.location.href = `../coordinator/course-edit.html?id=${id}`;
}
