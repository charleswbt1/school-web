const params = new URLSearchParams(window.location.search);

async function loadCourses() {
    try {
        const coordinator_id = localStorage.getItem("userId");
        const year = params.get('year');
        const month = params.get('month');
        let response;
        if (year && month) {
            response = await fetch(`${apiUrl}/api/courses?year=${year}&month=${month}&coordinator_id=${coordinator_id}`);
        } else {
            response = await fetch(`${apiUrl}/api/courses`);
        }
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
                            onclick="viewStudents('${course.id}')">
                            Control
                        </button>
                        <button
                            onclick="viewCount('${course.id}')">
                            Conteo
                        </button>
                        <button
                            onclick="updateLinks('${course.id}')">
                            Editar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        alert(error);

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
            window.location.href = 'course-create.html';
        });
    }
});

function viewStudents(id) {
    window.location.href = `control-students.html?id=${id}`;
}

function viewCount(id) {
    window.location.href = `count-advisers.html?id=${id}`;
}

function updateLinks(id) {
    window.location.href = `course-edit.html?id=${id}`;
}
