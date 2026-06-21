async function loadRoles() {
    try {
        const role = localStorage.getItem("role");
        const roleSelect = document.getElementById("role");
        roleSelect.style.display = "none";

        roleSelect.innerHTML = `
            <option value="">
                Selecciona Rol
            </option>
            <option value="adviser">Asesor</option>
            <option value="student" selected>Estudiante</option>
            <option value="teacher">Docente</option>
            <option value="coordinator">Coordinador</option>
        `;
        if (role === 'coordinator') {
            roleSelect.style.display = "block";
        }
    } catch (error) {
        console.error("Error cargando: ", error);
    }
}

loadRoles();

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const userRequest = {
        nick_name: document.getElementById("nick_name").value,
        password: document.getElementById("password").value,
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        second_last_name: document.getElementById("second_last_name").value,
        curp: document.getElementById("curp").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        role: document.getElementById("role").value
    }
    try {
        const invoiceResponse = await fetch(
            `${apiUrl}/api/users`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userRequest)
            }
        );

        if (invoiceResponse.ok) {
            alert("Registro creado correctamente");
            document.getElementById("registerForm").reset();
            window.location.href = "../user/register.html";
        } else {
            alert("Error al registrar - " + invoiceResponse.message);
        }
    } catch (error) {
        alert("Error al registrar - " + error.message);
    }
});