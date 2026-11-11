const roleRegister = new URLSearchParams(window.location.search).get('roleRegister');
const roleSession = sessionStorage.getItem("role");
const userSession = sessionStorage.getItem("userId");
const teamSession = sessionStorage.getItem("team_id");

async function loadRoles() {
    try {
        const roleSelect = document.getElementById("role");
        const btnBulk = document.getElementById('btn-bulk');

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
            btnBulk.style.display = "block";
        }
    } catch (error) {
        console.error('Error al cargar roles:', {
            message: error?.message ?? String(error),
            stack: error?.stack
        });
        await showError("Error al cargar roles. Por favor, inténtalo de nuevo más tarde.");
    }
}
loadRoles();

async function loadCourses() {
    try {
        if (roleRegister) {
            return;
        }
        const select = document.getElementById("courseId");
        if (roleSession === 'adviser' || roleSession === 'coordinator') {
            const query = roleSession === 'adviser'
                ? `?available=true&adviser_id=${userSession}`
                : `?available=true&coordinator_id=${userSession}`;
            const response = await fetch(`${apiUrl}/api/courses${query}`,
                {
                    credentials: 'include'
                }
            );
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
        console.error('Error al cargar cursos:', {
            message: error?.message ?? String(error),
            stack: error?.stack
        });
        await showError("Error al cargar cursos. Por favor, inténtalo de nuevo más tarde.");
    }
}
loadCourses();

async function loadAdvisers() {
    try {
        if (roleSession === 'adviser' || roleSession === 'coordinator') {
            const adviserSelect = document.getElementById("adviserId");
            const response = await fetch(`${apiUrl}/api/users?role=adviser`,
                {
                    credentials: 'include'
                }
            );
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
        console.error('Error al cargar asesores:', {
            message: error?.message ?? String(error),
            stack: error?.stack
        });
        await showError("Error al cargar asesores. Por favor, inténtalo de nuevo más tarde.");
    }
}
loadAdvisers();

document.getElementById("role").addEventListener("change", toggleStudentFields);
function toggleStudentFields() {
    const role = document.getElementById("role").value;
    const course = document.getElementById("courseId");
    const adviser = document.getElementById("adviserId");

    if (role === "student" && (roleSession === 'adviser' || roleSession === 'coordinator')) {
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
    const nick_name = document.getElementById("register_nick_name").value.trim();
    try {
        submitButton.disabled = true;
        submitButton.style.opacity = ".7";
        const roleSelected = document.getElementById("role").value;
        if (roleSelected === 'student' && (roleSession === 'adviser' || roleSession === 'coordinator')) {
            if (!document.getElementById("courseId").value) {
                showError("Selecciona un curso para el estudiante");
                return;
            }
            if (!document.getElementById("adviserId").value) {
                showError("Selecciona un asesor para el estudiante");
                return;
            }
        }

        const userRequest = {
            nick_name,
            password: document.getElementById("register_password").value.trim(),
            first_name: document.getElementById("first_name").value,
            last_name: document.getElementById("last_name").value,
            second_last_name: document.getElementById("second_last_name").value,
            curp: document.getElementById("curp").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            role: roleSelected,
            team_id: teamSession
        }
        const userResponse = await fetch(
            `${apiUrl}/api/users`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
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
                credentials: 'include',
                body: JSON.stringify(student)
            });
            const studentData = await studentResponse.json();

            if (!studentResponse.ok) {
                console.error('Error al registrar estudiante:', {
                    message: studentData.message,
                    stack: studentData.stack
                });
                await showError("Usuario registrado pero ERROR al registrar estudiante");
                return;
            }
        }
        await showSuccess("Registro exitoso");
        registerForm.reset();
    } catch (error) {
        console.error('Error al registrar:', {
            nick_name,
            message: error?.message ?? String(error),
            stack: error?.stack
        });
        await showError(`Error al registrar ${error}`);
    } finally {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const btnBulk = document.getElementById('btn-bulk');
    if (btnBulk) {
        btnBulk.addEventListener('click', () => {
            window.location.href = '../coordinator/bulk-register.html';
        });
    }
});

function togglePassword() {
    const password = document.getElementById("register_password");
    const icon = document.getElementById("togglePassword");

    if (password.type === "password") {
        password.type = "text";
        icon.textContent = "🙈";
    } else {
        password.type = "password";
        icon.textContent = "👁️";
    }
}