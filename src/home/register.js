document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("studentForm");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const user = {
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
            const emailResponse = await fetch("http://localhost:3000/api/users/valid-item?email=" + user.email);
            const emailBody = await emailResponse.json();
            if (!emailBody.valid) {
                throw new Error(`Error ${emailBody.message}`);
            }

            const nicknameResponse = await fetch("http://localhost:3000/api/users/valid-item?nick_name=" + user.nick_name);
            const nicknameBody = await nicknameResponse.json();
            if (!nicknameBody.valid) {
                throw new Error(`Error ${nicknameBody.message}`);
            }

            const response = await fetch("http://localhost:3000/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            const data = await response.json();

            alert("Usuario registrado correctamente");

            console.log(data);

            form.reset();

            window.location.href = "../home/index.html";

        } catch (error) {

            console.error(error);

            alert("Error al registrar el usuario - " + error.message);

        }

    });

});