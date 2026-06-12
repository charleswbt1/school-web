document.getElementById("teacherForm").addEventListener("submit", async (e) => {
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
        role: "teacher"
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
        alert("Docente creado correctamente");
        document.getElementById("teacherForm").reset();
        window.location.href = "../coordinator/teachers.html";
    } catch (error) {
        alert("Error al registrar docente - " + error.message);
    }
});