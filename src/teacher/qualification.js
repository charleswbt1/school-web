const studentId = new URLSearchParams(window.location.search).get('id');
const contentId = new URLSearchParams(window.location.search).get('content_id');

async function loadQualifications() {
    try {
        const response = await fetch(`${apiUrl}/api/students?id=${studentId}`);
        const jsonResponse = await response.json();
        const student = jsonResponse[0];

        const contentResponse = await fetch(`${apiUrl}/api/contents?id=${contentId}`);
        const contentJsonResponse = await contentResponse.json();
        const content = contentJsonResponse[0];

        const tbody = document.getElementById('qualificationsTableBody');
        const jobTable = document.getElementById('jobsTableBody');
        tbody.innerHTML = '';
        jobTable.innerHTML = '';

        content.modules.forEach(async (module, index) => {
            const note = student.notes?.find(
                note => note.module_id === module.id
            );

            tbody.innerHTML += `
                <tr>
                    <td>${module.name}</td>

                    <td>
                        <input
                            type="number"
                            id="qualification-${index}"
                            value="${note?.value ?? 0}"
                            min="0"
                            max="10"
                        >
                    </td>

                    <td>
                        <button
                            onclick="saveQualification('${module.id}', ${module.qualification}, ${index}, this)">
                            Guardar
                        </button>
                    </td>
                </tr>
            `;

            const classesResponse = await fetch(`${apiUrl}/api/classes?course_id=${student.course_id}&module_id=${module.id}`);
            const classesData = await classesResponse.json();
            if (classesData.length > 0) {
                classesData[0].jobs?.forEach(job => {
                    const studentJob = student.jobs?.find(
                        studentJob => studentJob.id === job.id
                    );
                    jobTable.innerHTML += `
                    <tr>
                        <td>${module.name}</td>
                        <td>${job.description || "Trabajo no especificado"}</td>
                        <td>${studentJob
                            ? `<button onclick="viewImage('${studentJob.link}')">
                                    Ver
                                </button>`
                            : `Sin evidencia`
                        }

                        </td>
                        <td>
                            <input
                                type="number"
                                id="score-${job.id}"
                                value="${studentJob?.score ?? 0}"
                                min="0"
                                max="10"
                            >
                        </td>
                        <td>
                            ${studentJob
                            ? `<button
                                onclick="saveJobQualification('${student.id}', '${studentJob.id}', this)">
                                Guardar
                            </button>`
                            : `<span>No hay evidencia</span>`
                        }                            
                        </td>
                    </tr>
                `;
                });
            }
        });
    } catch (error) {
        document.getElementById('qualificationsTableBody').innerHTML = `
            <tr>
                <td colspan="4">
                    Error al cargar calificaciones
                </td>
            </tr>
        `;
    }
}

loadQualifications();

async function saveQualification(moduleId, umbral, index) {

    if (!await showConfirm("¿Confirmar calificación?")) {
        return;
    }

    const qualification = Number(
        document.getElementById(`qualification-${index}`).value
    );
    if (qualification < 0 || qualification > 10) {
        showError("La calificación debe estar entre 0 y 10.");
        return;
    }

    try {
        const response = await fetch(
            `${apiUrl}/api/students/qualification`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    module_id: moduleId,
                    qualification: Number(qualification),
                    student_id: studentId,
                    state: qualification >= umbral ? "aprobado" : "fallo"
                })
            }
        );

        if (!response.ok) {
            throw new Error();
        }
        await showSuccess("Actualizacion exitosa");
    } catch (error) {
        showError("No fue posible guardar la calificación");
    }
}

async function saveJobQualification(studentId, jobId) {

    if (!await showConfirm("¿Confirmar calificación?")) {
        return;
    }

    const qualification = Number(
        document.getElementById(`score-${jobId}`).value
    );

    try {
        const response = await fetch(
            `${apiUrl}/api/students/job-qualification`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    student_id: studentId,
                    job_id: jobId,
                    qualification: Number(qualification)
                })
            }
        );

        if (!response.ok) {
            throw new Error();
        }
        await showSuccess("Actualizacion exitosa");
    } catch (error) {
        showError("No fue posible guardar la calificación");
    }
}

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