async function loadStudents() {
    try {
        const response = await fetch(`${apiUrl}/api/students/data`);
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

        const documentSelect = document.getElementById("documentType");
        documentSelect.innerHTML = `
            <option value="">
                Selecciona tipo de documento
            </option>
            <option value="curp">CURP</option>
            <option value="acta">Acta de Nacimiento</option>
            <option value="ine">INE</option>
            <option value="certificado">Certificado Requerido</option>
            <option value="titulo">Titulo Requerido</option>
            <option value="cedula">Cedula Requerida</option>
            <option value="certificado-curso">Certificado Entregado</option>
            <option value="titulo-curso">Titulo Entregado</option>
            <option value="cedula-curso">Cedula Entregado</option>
        `;
    } catch (error) {
        console.error("Error cargando estudiantes:", error);
    }
}

loadStudents();

document.getElementById("invoiceImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = document.getElementById("previewImage");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
});


document.getElementById("documentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = document.getElementById("invoiceImage").files[0];
    const studentId = document.getElementById("studentId").value;

    try {
        /* SUBIR ARCHIVO */
        const formData = new FormData();
        formData.append("reqFile", file);
        formData.append("directory", `student/${studentId}/documents`);

        const uploadResponse = await fetch(
            `${apiUrl}/api/files`,
            {
                method: "POST",
                body: formData
            }
        );
        const uploadData = await uploadResponse.json();
        const imageUrl = uploadData.url;

        /* CREAR FACTURA */
        const documentRequest = {
            url: imageUrl,
            student_id: studentId,
            type: document.getElementById("documentType").value
        }
        const invoiceResponse = await fetch(
            `${apiUrl}/api/students/document`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(documentRequest)
            }
        );
        alert("Documento cargado correctamente");
        document.getElementById("documentForm").reset();
        document.getElementById("previewImage").style.display = "none";
    } catch (error) {
        alert("Error al cargar documento");
    }
});