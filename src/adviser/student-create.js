async function loadCourses() {
    try {
        const response = await fetch(`${apiUrl}/api/courses`);
        const courses = await response.json();
        const select = document.getElementById("courseId");

        select.innerHTML = `
            <option value="">
                Seleccionar Curso
            </option>
        `;
        courses.forEach(course => {
            select.innerHTML += `
                <option value="${course.id}">
                    ${course.name} - ${course.description}
                </option>
            `;
        });
    } catch (error) {
        console.error("Error cargando cursos:", error);
    }
}

loadCourses();

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

            const userResponse = await fetch(`${apiUrl}/api/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            if (!userResponse.ok) {
                throw new Error(`Error ${userResponse.status}`);
            }
            const userData = await userResponse.json();

            const student = {
                user_id: userData.id,
                course_id: document.getElementById("courseId").value,
                adviser_id: localStorage.getItem("userId")
            }
            const studentResponse = await fetch(`${apiUrl}/api/students/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            });

            alert("Alumno registrado correctamente");
            form.reset();
            window.location.href = "../adviser/students.html";
        } catch (error) {
            alert("Error al registrar el alumno - " + error.message);
        }
    });
});