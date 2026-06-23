document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    const userRequest = {
        user_id: localStorage.getItem("userId"),
        new_password: document.getElementById("new_password").value
    }
    try {
        const userResponse = await fetch(
            `${apiUrl}/api/users/password`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userRequest)
            }
        );
        if (!userResponse.ok) {
            alert("Error al actualizar contraseña");
        } else {
            alert("Contraseña actualizada correctamente");
            document.getElementById("userForm").reset();
            window.location.href = "../user/profile.html";
        }
    } catch (error) {
        alert("Error al actualizar contraseña - " + error.message);
    } finally {
        submitButton.disabled = false;
    }
});