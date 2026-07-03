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

        tbody.innerHTML = content.modules.map((module, index) => {
            const note = student.notes?.find(
                note => note.module_id === module.id
            );

            return `
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
        }).join('');
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

    if (!confirm("¿Confirmar calificación?")) {
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