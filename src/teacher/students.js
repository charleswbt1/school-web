async function loadStudents() {
    try {
        const adviserId = localStorage.getItem("userId");
        const response = await fetch(`${apiUrl}/api/students/data`);
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

            const debt = Number(student.totalCost || 0) - Number(student.costCompleted || 0);

            return `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.course_name}</td>
                    <td>${student.average}</td>
                      <td>
                        <button
                            onclick="viewStudent('${student.id}')">
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

function viewStudent(id) {
    window.location.href = `qualification.html?id=${id}`;
}


loadStudents();