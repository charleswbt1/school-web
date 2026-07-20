const user_id = sessionStorage.getItem("userId");
const role = sessionStorage.getItem("role");

async function loadPeriods() {
    try {
        const query = role === 'coordinator' ? `?coordinator_id=${user_id}` : '';
        document.getElementById('btn-add-course').style.display = role === 'coordinator' ? 'block' : 'none';

        const response = await fetch(`${apiUrl}/api/courses/periods${query}`);
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
                            onclick="viewCourses('${item.year}', '${item.month}')">
                            Cursos
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('control periods: Error al cargar los periodos', error);
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

document.addEventListener('DOMContentLoaded', () => {
    const btnAdd = document.getElementById('btn-add-course');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            window.location.href = '../coordinator/course-register.html';
        });
    }
});