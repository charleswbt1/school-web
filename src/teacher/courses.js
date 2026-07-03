async function loadCourses() {
    try {
        const teacher_id = sessionStorage.getItem("userId");
        let response = await fetch(`${apiUrl}/api/courses?teacher_id=${teacher_id}`);
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
                <td>
                    <button
                        onclick="viewStudents('${course.id}')">
                        Alumnos
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        document.getElementById('courses-table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los cursos
                </td>
            </tr>
        `;
    }
}
loadCourses();

function viewStudents(id) {
    window.location.href = `students.html?id=${id}`;
}