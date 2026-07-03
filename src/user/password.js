document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    const userRequest = {
        user_id: sessionStorage.getItem("userId"),
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
            showError("Error al actualizar contraseña");
            return;
        }

        await showSuccess("Actualizacion exitosa");
        document.getElementById("userForm").reset();
        window.location.href = "../user/profile.html";
    } catch (error) {
        showError("Error al actualizar contraseña - " + error.message);
    } finally {
        submitButton.disabled = false;
    }
});