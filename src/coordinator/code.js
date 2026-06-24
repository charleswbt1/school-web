async function loadStudents() {
    try {
        const coordinator_id = localStorage.getItem("userId");
        const response = await fetch(`${apiUrl}/api/students/data?coordinator_id=${coordinator_id}`);
        const students = await response.json();

        const select = document.getElementById("studentId");
        select.innerHTML = `
            <option value="">
                Seleccionar Alumno
            </option>
        `;
        students.forEach(student => {
            select.innerHTML += `
                <option value="${student.id}">
                    ${student.curp} - ${student.course_name}
                </option>
            `;
        });

        const documentSelect = document.getElementById("state");
        documentSelect.innerHTML = `
            <option value="">
                Selecciona estado
            </option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="pending">Pendiente</option>
        `;
    } catch (error) {
        console.error("Error cargando estudiantes:", error);
    }
}
loadStudents();

document.getElementById("documentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
        const request = {};
        if (document.getElementById("state").value) {
            request.state = document.getElementById("state").value;
        }
        if (document.getElementById("schoolId").value) {
            request.school_id = document.getElementById("schoolId").value;
        }
        const studentId = document.getElementById("studentId").value;
        const invoiceResponse = await fetch(
            `${apiUrl}/api/students?id=${studentId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            }
        );
        if (!invoiceResponse.ok) {
            const response = invoiceResponse.json();
            alert(`No se actualizo alumno - ${response.message}`);
            return;
        }
        alert("Alumno actualizado correctamente");
        document.getElementById("documentForm").reset();
    } catch (error) {
        alert("Error al cargar documento");
    } finally {
        submitButton.disabled = false;
    }
});