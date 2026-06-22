async function loadTable() {
    try {
        const response = await fetch(`${apiUrl}/api/users/role?role=adviser`);
        if (!response.ok) {
            throw new Error('Error al obtener asesores');
        }
        const jsonResponse = await response.json();
        const tbody = document.getElementById('table-body');

        if (!jsonResponse.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">No hay asesores registrados</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = jsonResponse.map(element => `
            <tr>
                <td>${element.nick_name}</td>
                <td>${element.first_name} ${element.last_name} ${element.second_last_name}</td>
                <td>${element.phone}</td>
                <td>${element.email}</td>
                <td>${element.state}</td>
                <td>
                    <button
                        class="btn-edit"
                        onclick="editSquad('${element.id}')">
                        Editar
                    </button>
                    
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error(error);

        document.getElementById('table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los asesores
                </td>
            </tr>
        `;
    }
}

function editSquad(id) {
    // Redirige a la pantalla de edición
    window.location.href = `squad-edit.html?id=${id}`;
}


document.addEventListener('DOMContentLoaded', () => {
    loadTable();

    const btnAdd = document.getElementById('btn-add');

    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            window.location.href = '../user/register.html';
        });
    }
});