async function loadTable() {
    try {
        const response = await fetch(`${apiUrl}/api/users/role?role=teacher`);
        if (!response.ok) {
            throw new Error('Error al obtener docentes');
        }
        const jsonResponse = await response.json();
        const tbody = document.getElementById('table-body');

        if (!jsonResponse.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">No hay docentes registrados</td>
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
                        onclick="editRegister('${element.id}')">
                        Editar
                    </button>

                    <button
                        class="btn-delete"
                        onclick="deleteRegister('${element.id}')">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error(error);

        document.getElementById('table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los docentes
                </td>
            </tr>
        `;
    }
}

function editRegister(id) {
    window.location.href = `teacher-edit.html?id=${id}`;
}

async function deleteRegister(id) {
    const confirmDelete = confirm(
        '¿Deseas eliminar este docente?'
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `${apiUrl}/api/users?id=${id}`,
            {
                method: 'DELETE'
            }
        );

        if (!response.ok) {
            throw new Error('Error al eliminar');
        }

        alert('Docente eliminado correctamente');

        loadTable();

    } catch (error) {
        console.error(error);
        alert('No fue posible eliminar el docente');
    }
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