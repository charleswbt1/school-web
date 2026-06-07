async function loadCourses() {
    try {
        const response = await fetch(`${apiUrl}/api/courses`);

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
                <td>$${Number(course.cost).toLocaleString()}</td>
                <td>${course.date_init}</td>
                <td>${course.date_end}</td>
                <td>${course.state}</td>
                <td>
                    <button
                        class="btn-edit"
                        onclick="editCourse('${course.id}')">
                        Editar
                    </button>

                    <button
                        class="btn-delete"
                        onclick="deleteCourse('${course.id}')">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error(error);

        document.getElementById('courses-table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los cursos
                </td>
            </tr>
        `;
    }
}

function editCourse(id) {
    // Redirige a la pantalla de edición
    window.location.href = `course-edit.html?id=${id}`;
}

async function deleteCourse(id) {
    const confirmDelete = confirm(
        '¿Deseas eliminar este curso?'
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `${apiUrl}/api/courses/${id}`,
            {
                method: 'DELETE'
            }
        );

        if (!response.ok) {
            throw new Error('Error al eliminar');
        }

        alert('Curso eliminado correctamente');

        loadCourses();

    } catch (error) {
        console.error(error);
        alert('No fue posible eliminar el curso');
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