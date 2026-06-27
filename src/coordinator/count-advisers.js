const courseId = new URLSearchParams(window.location.search).get("id");

async function loadTable() {
    try {
        const usersResponse = await fetch(`${apiUrl}/api/users?role=adviser`);
        const advisers = await usersResponse.json();
        const controlResponse = await fetch(`${apiUrl}/api/students/control?course_id=${courseId}`);
        const control = await controlResponse.json();

        document.getElementById('title-course').textContent =
            `Asesores - ${control.course_name}`;

        const statsByAdviser = control.students.reduce((acc, { adviser_id, state }) => {
            if (!acc[adviser_id]) {
                acc[adviser_id] = {
                    active: 0,
                    inactive: 0,
                    pending: 0
                };
            }
            if (acc[adviser_id][state] !== undefined) {
                acc[adviser_id][state]++;
            }
            return acc;
        }, {});

        const tbody = document.getElementById('table-body');

        let totalActive = 0;
        let totalPending = 0;
        let totalInactive = 0;
        const rows = advisers.map(element => {
            const stats = statsByAdviser[element.id];
            if (!stats) {
                return '';
            }
            totalActive += stats.active;
            totalPending += stats.pending;
            totalInactive += stats.inactive;
            return `
                <tr>
                    <td>${element.first_name} ${element.last_name} ${element.second_last_name}</td>
                    <td>${element.phone}</td>
                    <td>${stats.active}</td>
                    <td>${stats.pending}</td>
                    <td>${stats.inactive}</td>
                </tr>
            `
        });
        rows.push(`
            <tr class="total-row">
                <td colspan="2"><strong>Total</strong></td>
                <td><strong>${totalActive}</strong></td>
                <td><strong>${totalPending}</strong></td>
                <td><strong>${totalInactive}</strong></td>
            </tr>
        `);
        tbody.innerHTML = rows.join('');
    } catch (error) {
        document.getElementById('table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los asesores ${error}
                </td>
            </tr>
        `;
    }
}

loadTable();