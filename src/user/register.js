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

async function loadCourses() {
    try {
        const role = localStorage.getItem("role");
        const select = document.getElementById("courseId");
        select.style.display = "none";

        if (role === 'adviser' || role === 'coordinator') {
            const response = await fetch(`${apiUrl}/api/courses`);
            const courses = await response.json();

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
            select.style.display = "block";
        }
    } catch (error) {
        console.error("Error cargando cursos:", error);
    }
}

loadCourses();

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const roleSelected = document.getElementById("role").value;
    const userRequest = {
        nick_name: document.getElementById("nick_name").value,
        password: document.getElementById("password").value,
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        second_last_name: document.getElementById("second_last_name").value,
        curp: document.getElementById("curp").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        role: roleSelected
    }
    try {
        const userResponse = await fetch(
            `${apiUrl}/api/users`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userRequest)
            }
        );
        const userData = await userResponse.json();

        if (!userResponse.ok) {
            alert("Error al registrar usuario - " + userData.message);
            return;
        }

        const role = localStorage.getItem("role");
        if (roleSelected === 'student' && (role === 'adviser' || role === 'coordinator')) {
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
            const studentData = await studentResponse.json();

            if (!studentResponse.ok) {
                alert("Se registra usuario pero Error al registrar estudiante - " + studentData.message);
                return;
            }
        }

        alert("Registro exitoso");
        registerForm.reset();
    } catch (error) {
        alert("Error al registrar - " + error.message);
    }
});