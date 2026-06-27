const courseId = new URLSearchParams(window.location.search).get('id');

async function loadStudents() {
    try {
        const response = await fetch(`${apiUrl}/api/students/data?course_id=${courseId}`);
        const students = await response.json();

        const tbody = document.getElementById("studentsTableBody");

        if (!students.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9">
                        No hay alumnos registrados
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = students.map(student => {
            return `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.course_name}</td>
                    <td>${student.notes?.length ?? 0} / ${student.modulesTotal}</td>
                      <td>
                        <button
                            onclick="viewStudent('${student.id}','${student.content_id}')">
                            Calificaciones
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error(error);
        document.getElementById("studentsTableBody").innerHTML = `
            <tr>
                <td colspan="9">
                    Error al cargar alumnos
                </td>
            </tr>
        `;
    }
}

function viewStudent(id, contentId) {
    window.location.href = `qualification.html?id=${id}&content_id=${contentId}`;
}


loadStudents();