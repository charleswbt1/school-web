const squadId = new URLSearchParams(window.location.search).get('id');

document.addEventListener('DOMContentLoaded', () => {

    loadSquad();
    document
        .getElementById('squadForm')
        .addEventListener('submit', updateSquad);

    const imageInput =
        document.getElementById("squadImage");

    imageInput.addEventListener("change", (event) => {

        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {

            const preview =
                document.getElementById("newLogoPreview");

            preview.src = e.target.result;
            preview.style.display = "block";
        };

        reader.readAsDataURL(file);

    });

});

async function loadSquad() {
    try {
        const response = await fetch(`${apiUrl}/api/squads?id=${squadId}`);
        if (!response.ok) {
            throw new Error('Error al obtener la escuela');
        }

        const jsonResponse = await response.json();
        const squad = jsonResponse[0];

        document.getElementById('name').value = squad.name || '';
        document.getElementById('description').value = squad.description || '';
        document.getElementById('cct').value = squad.cct || '';
        if (squad.logo) {
            document.getElementById('currentLogoContainer').innerHTML = `
                <img
                    src="${squad.logo}"
                    alt="Logo"
                    style="
                        width:150px;
                        height:auto;
                        border-radius:8px;
                        margin-top:10px;
                    "
                >
            `;
        }
    } catch (error) {
        console.error(error);
        alert('Error al cargar la escuela');
    }
}

async function updateSquad(event) {
    event.preventDefault();
    try {
        const response = await fetch(
            `${apiUrl}/api/squads?id=${squadId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    description: document.getElementById('description').value,
                    cct: document.getElementById('cct').value
                })
            }
        );

        if (!response.ok) {
            throw new Error('Error al actualizar');
        }
        alert('Escuela actualizada correctamente');
        window.location.href = 'squads.html';
    } catch (error) {
        console.error(error);
        alert('Error al actualizar la escuela');
    }
}