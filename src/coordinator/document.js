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
                <option value="${student.course_id}#${student.id}">
                    ${student.curp} - ${student.name} - ${student.course_name}
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
        alert("Error cargando estudiantes:", error);
    }
}

loadStudents();

document.getElementById("invoiceImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = document.getElementById("previewImage");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

    const frameImage = document.getElementById("frame-image");
    frameImage.style.display = "block";
});


document.getElementById("documentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    const file = document.getElementById("invoiceImage").files[0];
    const [courseId, studentId] = document.getElementById("studentId").value.split("#");

    try {
        /* SUBIR ARCHIVO */
        const formData = new FormData();
        formData.append("reqFile", file);
        formData.append("directory", `courses/${courseId}/${studentId}/documents`);

        const uploadResponse = await fetch(
            `${apiUrl}/api/files`,
            {
                method: "POST",
                body: formData
            }
        );
        const uploadData = await uploadResponse.json();
        const imageUrl = uploadData.url;

        /* CREAR DOCUMENTO */
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
        await showSuccess("Registro Exitoso");
        document.getElementById("documentForm").reset();
        document.getElementById("previewImage").style.display = "none";
    } catch (error) {
        showError("Error al Registrar");
    } finally {
        submitButton.disabled = false;
    }
});