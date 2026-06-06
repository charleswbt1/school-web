async function loadSquads() {
    try {
        const response = await fetch('http://localhost:3000/api/squads');

        if (!response.ok) {
            throw new Error('Error al obtener escuelas');
        }

        const squads = await response.json();

        const tbody = document.getElementById('squads-table-body');

        if (!squads.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">No hay escuelas registradas</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = squads.map(squad => `
            <tr>
                <td>${squad.name}</td>
                <td>${squad.description}</td>
                <td>${squad.cct}</td>
                <td>${squad.state}</td>
                <td>
                    <button
                        class="btn-edit"
                        onclick="editSquad('${squad.id}')">
                        Editar
                    </button>

                    <button
                        class="btn-delete"
                        onclick="deleteSquad('${squad.id}')">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error(error);

        document.getElementById('squads-table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar las escuelas
                </td>
            </tr>
        `;
    }
}

function editSquad(id) {
    // Redirige a la pantalla de edición
    window.location.href = `squad-edit.html?id=${id}`;
}

async function deleteSquad(id) {
    const confirmDelete = confirm(
        '¿Deseas eliminar esta escuela?'
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/api/squads?id=${id}`,
            {
                method: 'DELETE'
            }
        );

        if (!response.ok) {
            throw new Error('Error al eliminar');
        }

        alert('Escuela eliminada correctamente');

        loadSquads();

    } catch (error) {
        console.error(error);
        alert('No fue posible eliminar la escuela');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSquads();

    const btnAdd = document.getElementById('btn-add-squad');

    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            window.location.href = 'squad-create.html';
        });
    }
});