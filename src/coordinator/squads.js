async function loadSquads() {
    try {
        const response = await fetch(`${apiUrl}/api/squads`);

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

document.addEventListener('DOMContentLoaded', () => {
    loadSquads();

    const btnAdd = document.getElementById('btn-add-squad');

    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            window.location.href = 'squad-create.html';
        });
    }
});