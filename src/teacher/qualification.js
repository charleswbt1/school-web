const studentId = new URLSearchParams(window.location.search).get('id');

async function loadQualifications() {
    try {
        const response = await fetch(`${apiUrl}/api/students?id=${studentId}`);
        const jsonResponse = await response.json();
        const student = jsonResponse[0];

        const tbody = document.getElementById('qualificationsTableBody');

        if (!student.content.modules || !student.content.modules.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No hay calificaciones registradas
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = student.content.modules.map(module => `
                    <tr>
                        <td>${module.name}</td>
                        <td>
                            <input type="text" id="qualification" placeholder="${module.qualification}">
                        </td> 
                        <td>
                            <button
                                class="btn-edit"qualification
                                onclick="saveQualification('${module.name}')">
                                Guardar
                            </button>
                        </td>                     
                       
                    </tr>
                `)
            .join('');
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

async function saveQualification(name) {
    const confirmDelete = confirm(
        '¿Confirmar Calificacion?'
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `${apiUrl}/api/students/qualification`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    module_name: name,
                    qualification: document.getElementById('qualification').value,
                    student_id: studentId
                })
            }
        );

        if (!response.ok) {
            throw new Error('Error al guardar calificacion');
        }

        alert('Calificacion guardada correctamente');
        loadQualifications();
    } catch (error) {
        alert('No fue posible guardar la calificacion');
    }
}