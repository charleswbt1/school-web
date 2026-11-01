var userData;
async function loadPage() {
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
        userData = json[0];

        document.getElementById('credential-photo').src = userData.image || 'https://storage.googleapis.com/school-source/web/perfil.jpg';
        document.getElementById('credential-name').textContent = `${userData.first_name} ${userData.last_name} ${userData.second_last_name}`;
        document.getElementById('credential-curp').textContent = userData.curp;
        document.getElementById('credential-email').textContent = userData.email;
        document.getElementById('credential-phone').textContent = userData.phone;
    } catch (error) {
        alert('Error en el perfil');

    }
}

loadPage();

/*Editar Alumno*/
const editStudentModal = document.getElementById("editStudentModal");
function editStudent() {
    document.getElementById("editFirstName").value = userData.first_name;
    document.getElementById("editLastName").value = userData.last_name;
    document.getElementById("editSecondLastName").value = userData.second_last_name;
    document.getElementById("editCurp").value = userData.curp;
    document.getElementById("editPhone").value = userData.phone;
    editStudentModal.style.display = "flex";

    const buttonPassword = document.getElementById("button-password");
    buttonPassword.addEventListener("click", (e) => {
        if (e.target === buttonPassword) {
            editPassword();
        }
    });
}
function closeEditStudent() {
    editStudentModal.style.display = "none";
}
editStudentModal.addEventListener("click", (e) => {
    if (e.target === editStudentModal) {
        closeEditStudent();
    }
});
document.getElementById("editStudentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const userBody = {
        first_name: document.getElementById("editFirstName").value,
        last_name: document.getElementById("editLastName").value,
        second_last_name: document.getElementById("editSecondLastName").value,
        curp: document.getElementById("editCurp").value,
        phone: document.getElementById("editPhone").value
    };

    const response = await fetch(
        `${apiUrl}/api/users?id=${userData.id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify(userBody)
        }
    );

    if (!response.ok) {
        await showError("No se pudo actualizar");
        return;
    }
    closeEditStudent();
    await showSuccess("Registro actualizado");
    loadPage();
});
/*Editar Pass*/
const editPasswordModal = document.getElementById("editPasswordModal");
function editPassword() {
    closeEditStudent();
    document.getElementById("password").value = '';
    document.getElementById("confirmPassword").value = '';
    document.getElementById("passwordMessage").textContent = '';
    editPasswordModal.style.display = "flex";
}
function closeEditPassword() {
    editPasswordModal.style.display = "none";
}
editPasswordModal.addEventListener("click", (e) => {
    if (e.target === editPasswordModal) {
        closeEditPassword();
    }
});
document.getElementById("editPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    if (password != confirmPassword || password.length < 4) {
        document.getElementById("passwordMessage").textContent = "Confirma correctamente tu nueva contraseña (no menor de 4 caracteres)";
        return;
    }
    const requestBody = {
        new_password: password
    };

    const response = await fetch(
        `${apiUrl}/api/users/password`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        }
    );
    const json = await response.json();
    if (!response.ok) {
        await showError(json.message || "No se pudo actualizar");
        return;
    }
    closeEditPassword();
    await showSuccess(json.message);
    loadPage();
});