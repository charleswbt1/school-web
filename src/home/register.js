document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("studentForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const userRequest = {
            nick_name: document.getElementById("nick_name").value,
            password: document.getElementById("password").value,
            first_name: document.getElementById("first_name").value,
            last_name: document.getElementById("last_name").value,
            second_last_name: document.getElementById("second_last_name").value,
            role: "student",
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            curp: document.getElementById("curp").value
        };

        try {
            const response = await fetch(`${apiUrl}/api/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userRequest)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            alert("Usuario registrado correctamente");
            form.reset();
            window.location.href = "../home/index.html";
        } catch (error) {
            alert("Error al registrar el usuario - " + error.message);
        }
    });
});