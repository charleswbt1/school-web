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

async function loadPage() {
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
                        NickName
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
                        onclick="deleteDocument('${student.id}','${type}','',this)"
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
                                ${student.nick_name}
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
loadPage();

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
const editStudentModal = document.getElementById("editStudentModal");
function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);

    document.getElementById("editStudentId").value = student.id;
    document.getElementById("editUserId").value = student.user_id;
    document.getElementById("editName").value = student.name;
    document.getElementById("editCurp").value = student.curp;
    document.getElementById("editPhone").value = student.phone;
    document.getElementById("editSchoolId").value = student.school_id;
    document.getElementById("studentState").value = student.state;
    editStudentModal.style.display = "flex";
}
function closeEditStudent() {
    editStudentModal.style.display = "none";
}
editStudentModal.addEventListener("click", (e) => {
    if (e.target === editStudentModal) {
        closeEditStudent();
    }
});
document.getElementById("editStudentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const studentId = document.getElementById("editStudentId").value;
    const userId = document.getElementById("editUserId").value;

    const userBody = {
        name: document.getElementById("editName").value,
        curp: document.getElementById("editCurp").value,
        phone: document.getElementById("editPhone").value
    };

    const studentBody = {
        school_id: document.getElementById("editSchoolId").value,
        state: document.getElementById("studentState").value
    }

    const response = await fetch(
        `${apiUrl}/api/students?id=${studentId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentBody)
        }
    );

    const userResponse = await fetch(
        `${apiUrl}/api/users?id=${userId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userBody)
        }
    );

    if (!response.ok) {
        await showError("No se pudo actualizar");
        return;
    }
    closeEditStudent();
    loadPage();
});
