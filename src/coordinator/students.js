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

            const debt = Number(student.total_cost || 0) - Number(student.cost_completed || 0);

            return `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.course_name}</td>
                    <td>${student.modules_completed} / ${student.total_modules}</td>
                    <td>$${Number(student.total_cost).toLocaleString()}</td>
                    <td>$${Number(student.cost_completed).toLocaleString()}</td>
                    <td>$${debt.toLocaleString()}</td>
                    <td>${student.state}</td>
                    <td>
                        
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


function paymentsStudent(id) {
    window.location.href = `student-payments.html?id=${id}`;
}

loadStudents();