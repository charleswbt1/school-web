const documentTypes = [
    "curp",
    "acta",
    "certificado",
    "titulo",
    "cedula",
    "ine"
];

async function loadStudents() {
    try {
        const courseId = new URLSearchParams(window.location.search).get("id");
        const response = await fetch(`${apiUrl}/api/students/control?course_id=${courseId}`);
        const data = await response.json();

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
                const exists = student.documents.some(
                    document => document.type.toLowerCase() === type
                );
                return `
                        <td style="text-align:center">
                            <input
                                type="checkbox"
                                ${exists ? "checked" : ""}
                                disabled
                            >
                        </td>
                    `;
            }).join("");

            let rowClass = '';

            switch (student.state?.toLowerCase()) {
                case 'active':
                    rowClass = 'row-active';
                    break;

                case 'inactive':
                    rowClass = 'row-inactive';
                    break;

                case 'pending':
                    rowClass = 'row-pending';
                    break;
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