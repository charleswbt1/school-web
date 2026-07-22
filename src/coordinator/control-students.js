const courseId = new URLSearchParams(window.location.search).get("id");
const documentTypes = [
    "curp",
    "acta",
    "certificado",
    "titulo",
    "cedula",
    "ine",
    "certificado-curso",
    "titulo-curso",
    "cedula-curso",
    "TODO"
];
let students;

async function loadStudents() {
    try {
        const response = await fetch(`${apiUrl}/api/students/control?course_id=${courseId}`);
        const data = await response.json();
        students = data.students;
        const table = document.getElementById("studentsTable");

        table.innerHTML = `
            <thead>
                <tr>
                    <th rowspan="2">
                        #
                    </th>
                    <th rowspan="2">
                        Alumno
                    </th>

                    <th rowspan="2">
                        CURP
                    </th>

                    <th rowspan="2">
                        Teléfono
                    </th>

                    <th rowspan="2">
                        clave
                    </th>

                    <th rowspan="2">
                        IUC
                    </th>

                    <th colspan="${documentTypes.length}">
                        Documentos
                    </th>
                </tr>
                <tr>
                    ${documentTypes.map(type => `
                        <th>
                            ${type.toUpperCase()}
                        </th>
                    `).join("")}
                </tr>
            </thead>
            <tbody>

                ${data.students.map((student, index) => {

            const documents = documentTypes.map(type => {
                const document = student.documents.find(document => document.type === type);
                return `<td>
                ${document ?
                        `<span class="button-icon"
                        onclick="viewImage('${document.url}')"
                        title="Ver Documento ${type}">
                        🔍
                    </span>
                    <span class="button-icon"
                        onclick="deleteDocument('${student.id}','${type}',this)"
                        title="Eliminar Documento ${type}">
                        ❌
                    </span>` : ``

                    }
                    <span class="button-icon"
                        onclick="viewDocument('${student.id}','${type}')"
                        title="Registrar Documento">
                        ⬆️
                    </span>
                    </td>`;


            }).join("");


            let rowClass = '';
            switch (student.state?.toLowerCase()) {
                case 'active': rowClass = 'row-active'; break;
                case 'inactive': rowClass = 'row-inactive'; break;
                case 'pending': rowClass = 'row-pending'; break;
            }

            return `
                        <tr class="${rowClass}">
                            <td>
                                ${index + 1}
                            </td>
                            <td>
                                ${student.name}
                            </td>
                            <td>
                                ${student.curp}
                            </td>
                            <td>
                                ${student.phone}
                            </td>
                            <td>
                                ${student.school_id || '-'}
                            </td>

                             <td class="iuc-cell">
                                <div class="iuc-actions">
                                    <span
                                        class="button-icon credential-icon"
                                        onclick="generateCredential('${student.id}', this)"
                                        title="Credencial">
                                        🪪
                                    </span>
                                    <span
                                        class="button-icon certificate-icon"
                                        onclick="generateCertificate('${student.id}', this)"
                                        title="Constancia">
                                        📄
                                    </span>
                                    <span
                                        class="button-icon"
                                        onclick="editStudent('${student.id}')"
                                        title="Editar Alumno">
                                        ✏️
                                    </span>
                                </div>
                            </td>
                            ${documents}
                        </tr>
                    `;
        }).join("")}
            </tbody>
        `;
    } catch (error) {
        alert("Error al Registrar");
    }
}
loadStudents();


const modalImage = document.getElementById("imageModal");
const payImage = document.getElementById("payImage");
function closeImage() {
    payImage.src = '';
    modalImage.style.display = "none";
}
function viewImage(imageUrl) {
    if (!imageUrl) return;
    if (imageUrl.endsWith(".pdf")) {
        window.open(imageUrl, "_blank");
    } else {
        payImage.src = imageUrl;
        modalImage.style.display = "flex";
    }
}


const modalDocument = document.getElementById("contentModal");
modalDocument.addEventListener("click", (e) => {
    if (e.target === modalDocument) {
        closeDocumentModal();
    }
});
function viewDocument(studentId, type) {
    const student = students.find(student => student.id === studentId);
    document.getElementById("document-type").textContent = type;
    document.getElementById("student-name").textContent = student.name;
    document.getElementById("student-id").textContent = studentId;
    modalDocument.style.display = "flex";
}
const preview = document.getElementById("previewImage");
const invoiceImage = document.getElementById("invoiceImage");
let previewUrl = null;
invoiceImage.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }
    previewUrl = URL.createObjectURL(file);
    if (file.type === "application/pdf") {
        preview.src = "../components/pdf-icon.png"; // o un icono de PDF
        preview.style.display = "block";
        preview.onclick = () => window.open(previewUrl, "_blank");
    } else {
        preview.src = previewUrl;
        preview.style.display = "block";
        preview.onclick = () => viewImage(previewUrl);
    }
});
const documentForm = document.getElementById("documentForm");
documentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    try {
        submitButton.disabled = true;
        submitButton.style.opacity = ".7";
        const file = invoiceImage.files[0];
        if (!file) {
            throw new Error("Selecciona un documento.");
        }
        const studentId = document.getElementById("student-id").textContent;

        const formData = new FormData();
        formData.append("reqFile", file);
        formData.append("directory", `courses/${courseId}/${studentId}/document`);
        const uploadResponse = await fetch(
            `${apiUrl}/api/files`,
            {
                method: "POST",
                body: formData
            }
        );
        if (!uploadResponse.ok) {
            throw new Error("Fallo al subir documento");
        }
        const uploadData = await uploadResponse.json();
        const imageUrl = uploadData.url;
        const documentRequest = {
            url: imageUrl,
            student_id: studentId,
            type: document.getElementById("document-type").textContent
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
        if (!invoiceResponse.ok) {
            throw new Error("No se pudo registrar el documento");
        }
        closeDocumentModal();
        await showSuccess("Registro Exitoso");
        await loadStudents();
    } catch (error) {
        showError(`Error al Registrar - ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
    }
});
function closeDocumentModal() {
    modalDocument.style.display = "none";
    documentForm.reset();

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
    }
    preview.src = "";
    preview.style.display = "none";
}

/*CREDENCIAL/CONSTANCIA*/
async function generateCredential(studentId, button) {
    try {
        button.style.pointerEvents = "none";
        button.style.opacity = ".5";
        const response = await fetch(
            `${apiUrl}/api/files/pdf`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    student_id: studentId,
                    type: "credential"
                })
            }
        );

        if (!response.ok) {
            throw new Error((await response.json()).message);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "credencial.pdf";
        a.click();

        URL.revokeObjectURL(url);

    } catch (error) {
        showError(`Error al Generar Credencial - ${error.message}`);
    } finally {
        button.style.pointerEvents = "auto";
        button.style.opacity = "1";
    }
}


async function generateCertificate(studentId, button) {
    try {
        button.style.pointerEvents = "none";
        button.style.opacity = ".5";
        const response = await fetch(
            `${apiUrl}/api/files/pdf`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    student_id: studentId,
                    type: "constancy"
                })
            }
        );
        if (!response.ok) {
            throw new Error((await response.json()).message);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "constancia.pdf";
        a.click();

        URL.revokeObjectURL(url);
    } catch (error) {
        showError(`Error al Generar Constancia - ${error.message}`);
    } finally {
        button.style.pointerEvents = "auto";
        button.style.opacity = "1";
    }
}

/*Editar Alumno*/
function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);

    document.getElementById("editStudentId").value = student.id;
    document.getElementById("editName").value = student.name;
    document.getElementById("editCurp").value = student.curp;
    document.getElementById("editPhone").value = student.phone;
    document.getElementById("editSchoolId").value = student.school_id;
    document.getElementById("editStudentModal").style.display = "flex";
}
function closeEditStudent() {
    document.getElementById("editStudentModal").style.display = "none";
}
document.getElementById("editStudentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const studentId = document.getElementById("editStudentId").value;

    const body = {
        name: document.getElementById("editName").value,
        curp: document.getElementById("editCurp").value,
        phone: document.getElementById("editPhone").value,
        school_id: document.getElementById("editSchoolId").value
    };

    const response = await fetch(
        `${apiUrl}/api/students?id=${studentId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
    );

    if (!response.ok) {
        await showError("No se pudo actualizar");
        return;
    }

    closeEditStudent();
    loadStudents();
});

/*ELIMINAR DOCUMENTO*/
async function deleteDocument(studentId, type, button) {
    if (!await showConfirm("¿Deseas eliminar este Documento?")) {
        return;
    }

    try {
        button.style.pointerEvents = "none";
        button.style.opacity = ".5";
        const response = await fetch(
            `${apiUrl}/api/students/document`,
            {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_id: studentId,
                    type: type
                })
            }
        );

        if (!response.ok) {
            throw new Error("No se pudo eliminar el documento");
        }

        await showSuccess("Documento eliminado");
        loadStudents();
    } catch (error) {
        showError(error.message);
    } finally {
        button.style.pointerEvents = "auto";
        button.style.opacity = "1";
    }
}