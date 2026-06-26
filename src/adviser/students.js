async function loadStudents() {
    try {
        const adviserId = localStorage.getItem('userId');
        const response = await fetch(`${apiUrl}/api/students/data?adviser_id=${adviserId}`);

        if (!response.ok) {
            throw new Error('Error al obtener alumnos');
        }

        const students = await response.json();

        const tbody = document.getElementById('students-table-body');

        if (!students.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">No hay alumnos registrados</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = students.map(student => {
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
                    <td>${student.curp}</td>
                    <td>${student.name}</td>
                    <td>${student.course_name}</td>
                    <td>${student.phone}</td>
                    <td>${student.total_paid}</td>                
                </tr>
            `
        }).join('');

    } catch (error) {
        console.error(error);

        document.getElementById('students-table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los alumnos
                </td>
            </tr>
        `;
    }
}

loadStudents();

document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    const btnAdd = document.getElementById('btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            window.location.href = '../user/register.html';
        });
    }
});