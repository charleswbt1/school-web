document.getElementById("adviserForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nick_name = document.getElementById("nick_name").value;
    const password = document.getElementById("password").value;
    const first_name = document.getElementById("first_name").value;
    const last_name = document.getElementById("last_name").value;
    const second_last_name = document.getElementById("second_last_name").value;
    const curp = document.getElementById("curp").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    try {
        const emailResponse = await fetch(`${apiUrl}/api/users/valid-item?email=${user.email}`);
        const emailBody = await emailResponse.json();
        if (!emailBody.valid) {
            throw new Error(`Error ${emailBody.message}`);
        }

        const nicknameResponse = await fetch(`${apiUrl}/api/users/valid-item?nick_name=${user.nick_name}`);
        const nicknameBody = await nicknameResponse.json();
        if (!nicknameBody.valid) {
            throw new Error(`Error ${nicknameBody.message}`);
        }

        const invoiceResponse = await fetch(
            `${apiUrl}/api/users`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nick_name,
                    password,
                    first_name,
                    last_name,
                    second_last_name,
                    curp,
                    email,
                    phone,
                    role: "adviser"
                })
            }
        );
        alert("Asesor creado correctamente");
        document.getElementById("adviserForm").reset();
        window.location.href = "../coordinator/advisers.html";
    } catch (error) {
        alert("Error al registrar asesor - " + error.message);
    }
});