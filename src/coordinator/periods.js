async function loadPeriods() {
    try {
        const coordinator_id = localStorage.getItem("userId");
        const response = await fetch(`${apiUrl}/api/courses/periods?coordinator_id=${coordinator_id}`);
        if (!response.ok) {
            throw new Error('Error al obtener periodos');
        }
        const jsonResponse = await response.json();
        const tbody = document.getElementById('courses-table-body');

        if (!jsonResponse.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">No hay cursos registrados</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = jsonResponse.map(item => {
            const courseName = item.courses
                .map(course => course)
                .join('<br>');
            return `
                <tr>
                    <td>${item.year}</td>
                    <td>${item.month}</td>
                    <td>${courseName}</td>
                    <td>
                        <button
                            class="btn-edit"
                            onclick="viewCourses('${item.year}', '${item.month}')">
                            Cursos
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        document.getElementById('courses-table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los periodos
                </td>
            </tr>
        `;
    }
}

loadPeriods();

function viewCourses(year, month) {
    window.location.href = `courses.html?year=${year}&month=${month}`;
}
