async function loadStudents() {
    try {
        const adviserId = localStorage.getItem("userId");
        const response = await fetch(`${apiUrl}/api/students`);
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
                    <td>${student.id}</td>
                    <td>${student.course_name}</td>
                    <td>${student.modulesCompleted} / ${student.totalModules}</td>
                    <td>$${Number(student.totalCost).toLocaleString()}</td>
                    <td>$${Number(student.costCompleted).toLocaleString()}</td>
                    <td>$${debt.toLocaleString()}</td>
                    <td>${student.state}</td>
                    <td>
                        <button
                            onclick="viewStudent('${student.id}')">
                            Ver
                        </button>
                        <button
                            onclick="paymentsStudent('${student.id}')">
                            Pagos
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
    window.location.href = `student-view.html?id=${id}`;
}

function paymentsStudent(id) {
    window.location.href = `student-payments.html?id=${id}`;
}

loadStudents();