const userId = localStorage.getItem("userId");

async function loadSquad() {
    try {
        const response = await fetch(`${apiUrl}/api/users?id=${userId}`);
        if (!response.ok) {
            throw new Error('Error al obtener perfil');
        }

        const jsonResponse = await response.json();
        const squad = jsonResponse[0];

        document.getElementById('first_name').value = squad.first_name || '';
        document.getElementById('last_name').value = squad.last_name || '';
        document.getElementById('second_last_name').value = squad.second_last_name || '';
        document.getElementById('curp').value = squad.curp || '';
        document.getElementById('email').value = squad.email || '';
        document.getElementById('phone').value = squad.phone || '';
        document.getElementById('previewImage').src = squad.image || 'https://storage.googleapis.com/school-source/web/perfil.jpg';
    } catch (error) {
        alert('Error en el perfil');

    }
}

loadSquad();

document.getElementById("changePassword").addEventListener("click", () => {
    window.location.href = "../user/password.html"
});

document.addEventListener('DOMContentLoaded', () => {
    loadSquad();
    document
        .getElementById('userForm')
        .addEventListener('submit', updateSquad);
});

async function updateSquad(event) {
    event.preventDefault();
    try {
        const request = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            second_last_name: document.getElementById('second_last_name').value,
            curp: document.getElementById('curp').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
        }
        /* SUBIR ARCHIVO */
        const file = document.getElementById("invoiceImage").files[0];
        if (file) {
            const formData = new FormData();
            formData.append("reqFile", file);
            formData.append("directory", `student/${userId}/documents`);

            const uploadResponse = await fetch(
                `${apiUrl}/api/files`,
                {
                    method: "POST",
                    body: formData

                }
            );
            const uploadData = await uploadResponse.json();
            request.image = uploadData.url;
        }

        const response = await fetch(
            `${apiUrl}/api/users?id=${userId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            }
        );

        if (!response.ok) {
            throw new Error('Error al actualizar');
        }
        alert('Perfil actualizado correctamente');
        window.location.href = 'profile.html';
    } catch (error) {
        console.error(error);
        alert('Error al actualizar el perfil');
    }
}

const previewImage = document.getElementById("previewImage");
const invoiceImage = document.getElementById("invoiceImage");
previewImage.addEventListener("click", () => {
    invoiceImage.click();
});

invoiceImage.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    previewImage.src = URL.createObjectURL(file);
});
