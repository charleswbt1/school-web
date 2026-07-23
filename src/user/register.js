const roleRegister = new URLSearchParams(window.location.search).get('roleRegister');
const roleSession = sessionStorage.getItem("role");
const teamSession = sessionStorage.getItem("team_id");

async function loadRoles() {
    try {
        const roleSelect = document.getElementById("role");
        roleSelect.innerHTML = `
            <option value="">Selecciona Rol</option>            
            <option value="student">Estudiante</option>
            <option value="teacher">Docente</option>
            <option value="adviser">Asesor</option>
            <option value="counter">Contador</option>
            <option value="coordinator">Coordinador</option>
        `;
        roleSelect.value = roleRegister || "student";
        if (roleSession === 'coordinator') {
            roleSelect.style.display = "block";
        }
    } catch (error) {
        alert("Error cargando: ", error);
    }
}
loadRoles();

async function loadCourses() {
    try {
        const select = document.getElementById("courseId");
        if (roleRegister) {
            return;
        }
        if (roleSession === 'adviser' || roleSession === 'coordinator') {
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
        }
    } catch (error) {
        alert("Error cargando cursos:", error);
    }
}
loadCourses();

async function loadAdvisers() {
    try {
        const adviserSelect = document.getElementById("adviserId");
        if (roleSession === 'adviser' || roleSession === 'coordinator') {
            const response = await fetch(`${apiUrl}/api/users?role=adviser`);
            const advisers = await response.json();

            adviserSelect.innerHTML = `
                <option value="">
                    Seleccionar Asesor
                </option>
            `;
            advisers.forEach(adviser => {
                adviserSelect.innerHTML += `
                <option value="${adviser.id}">
                    ${adviser.first_name} ${adviser.last_name} ${adviser.second_last_name}
                </option>
            `;
            });
        }
    } catch (error) {
        alert("Error cargando cursos:", error);
    }
}
loadAdvisers();

document.getElementById("role").addEventListener("change", toggleStudentFields);
function toggleStudentFields() {
    const role = document.getElementById("role").value;
    const course = document.getElementById("courseId");
    const adviser = document.getElementById("adviserId");

    if (role === "student") {
        course.style.display = "block";
        adviser.style.display = "block";
    } else {
        course.style.display = "none";
        adviser.style.display = "none";
        course.value = "";
        adviser.value = "";
    }
}
toggleStudentFields();

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.style.opacity = ".7";

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
        role: roleSelected,
        team_id: teamSession
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
            showError(`Error al registrar ${userData.message}`);
            return;
        }

        if (roleSelected === 'student' && (roleSession === 'adviser' || roleSession === 'coordinator')) {
            const student = {
                user_id: userData.id,
                course_id: document.getElementById("courseId").value,
                adviser_id: document.getElementById("adviserId").value
            }
            const studentResponse = await fetch(`${apiUrl}/api/students`, {
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

        await showSuccess("Registro exitoso");
        registerForm.reset();
    } catch (error) {
        showError(`Error al registrar ${error}`);
    } finally {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
    }
});