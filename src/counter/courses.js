const params = new URLSearchParams(window.location.search);

async function loadCourses() {
    try {
        const year = params.get('year');
        const month = params.get('month');
        let response = await fetch(`${apiUrl}/api/courses?year=${year}&month=${month}`);
        if (!response.ok) {
            throw new Error('Error al obtener cursos');
        }

        const courses = await response.json();
        const tbody = document.getElementById('courses-table-body');
        if (!courses.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">No hay cursos registrados</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = courses.map(course => `
            <tr>
                <td>${course.name}</td>
                <td>${course.description}</td>                
                <td>${course.date_init}</td>
                <td>${course.date_end}</td>
                <td>${course.state}</td>
                <td>
                    <div class="button-container">
                        <button
                            onclick="viewPayments('${course.id}')">
                            Pagos
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error(error);

        document.getElementById('courses-table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los cursos
                </td>
            </tr>
        `;
    }
}
loadCourses();


function viewPayments(id) {
    window.location.href = `student-payments.html?id=${id}`;
}
