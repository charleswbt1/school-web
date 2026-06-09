document.addEventListener('DOMContentLoaded', () => {
    loadContents();

    document.getElementById('btn-add').addEventListener('click', () => {
        window.location.href = 'content-create.html';
    });
});

async function loadContents() {
    try {
        const response = await fetch(`${apiUrl}/api/contents`);

        if (!response.ok) {
            throw new Error('Error al obtener contenidos');
        }

        const contents = await response.json();
        const tbody = document.getElementById('contentsTableBody');

        if (!contents.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No hay contenidos registrados
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = contents.map(content => `
            <tr>
                <td>${content.name}</td>
                <td>${content.description || ''}</td>
                <td>${content.modules?.length || 0}</td>
                <td>${content.state}</td>
                <td>
                    <button
                        class="btn-edit"
                        onclick="editContent('${content.id}')">
                        Editar
                    </button>
                    <button
                        class="btn-delete"
                        onclick="deleteContent('${content.id}')">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        document.getElementById(
            'contentsTableBody'
        ).innerHTML = `
            <tr>
                <td colspan="5">
                    Error al cargar contenidos
                </td>
            </tr>
        `;
    }
}

function editContent(id) {
    window.location.href = `content-edit.html?id=${id}`;
}

async function deleteContent(id) {
    if (!confirm('¿Eliminar contenido?')) {
        return;
    }

    try {
        const response = await fetch(
            `${apiUrl}/api/contents?id=${id}`,
            {
                method: 'DELETE'
            }
        );
        if (!response.ok) {
            throw new Error('Error al eliminar');
        }
        loadContents();
    } catch (error) {
        alert('No fue posible eliminar el contenido');
    }
}