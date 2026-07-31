const roleRegister = new URLSearchParams(window.location.search).get('roleRegister');
const roleSession = sessionStorage.getItem("role");
const teamSession = sessionStorage.getItem("team_id");
const userSession = sessionStorage.getItem("userId");

async function loadCourses() {
    try {
        const select = document.getElementById("courseId");
        if (roleRegister) {
            return;
        }
        if (roleSession === 'coordinator') {
            const response = await fetch(`${apiUrl}/api/courses?coordinator_id=${userSession}`);
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

document.getElementById("downloadTemplate").addEventListener("click", () => {

    const csv = [
        "firstName,lastName,secondLastName,curp,phone,email",
        "Juan Jose,Pérez,López,PELJ950101HDFXXX01,5512345678,juan@email.com",
        "María Fernanda,Gómez,Ramírez,GORM020202MDFXXX02,5511122233,maria@email.com"
    ].join("\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla_alumnos.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
});

document.getElementById("csvForm").addEventListener("submit", async e => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.style.opacity = ".7";
    try {
        const file = document.getElementById("csvFile").files[0];
        const formData = new FormData();

        formData.append("reqFile", file);
        formData.append("course_id", document.getElementById("courseId").value);
        formData.append("team_id", teamSession);

        const response = await fetch(
            `${apiUrl}/api/users/import/students`,
            {
                method: "POST",
                body: formData
            }
        );
        const result = await response.json();

        if (!response.ok) {
            throw new Error(`Error al registrar ${result.message}`);
        }
        await showSuccess("Registro Exitoso");
    } catch (error) {
        await showError(`Error al registrar ${error}`);
    } finally {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
    }
});