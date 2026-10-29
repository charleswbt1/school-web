async function loadSquad() {
    try {
        const result = await fetch(`${apiUrl}/api/users`,
            {
                credentials: 'include'
            }
        );
        if (!result.ok) {
            throw new Error('Error al obtener perfil');
        }
        const json = await result.json();
        const response = json[0];

        document.getElementById('credential-photo').src = response.image || 'https://storage.googleapis.com/school-source/web/perfil.jpg';
        document.getElementById('credential-name').textContent = `${response.first_name} ${response.last_name} ${response.second_last_name}`;
        document.getElementById('credential-curp').textContent = response.curp;
        document.getElementById('credential-email').textContent = response.email;
        document.getElementById('credential-phone').textContent = response.phone;
    } catch (error) {
        alert('Error en el perfil');

    }
}

loadSquad();
