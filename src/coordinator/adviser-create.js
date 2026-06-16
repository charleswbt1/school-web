document.getElementById("adviserForm").addEventListener("submit", async (e) => {
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
        role: "adviser"
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
            alert("Asesor creado correctamente");
            document.getElementById("adviserForm").reset();
            window.location.href = "../coordinator/advisers.html";
        } else {
            alert("Error al registrar asesor - " + invoiceResponse.message);
        }
    } catch (error) {
        alert("Error al registrar asesor - " + error.message);
    }
});