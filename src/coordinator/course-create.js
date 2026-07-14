const userId = sessionStorage.getItem("userId");
async function loadSquads() {
    try {
        const response = await fetch(`${apiUrl}/api/squads?state=active`);
        const squads = await response.json();
        const select = document.getElementById("squadId");

        select.innerHTML = `
            <option value="">
                Seleccionar Escuela
            </option>
        `;
        squads.forEach(squad => {
            select.innerHTML += `
                <option value="${squad.id}">
                    ${squad.cct} - ${squad.name}
                </option>
            `;
        });
    } catch (error) {
        alert("Error cargando escuelas:", error);
    }
}

async function loadContents() {
    try {
        const response = await fetch(`${apiUrl}/api/contents?state=active&coordinator_id=${userId}`);
        const contents = await response.json();
        const select = document.getElementById("contentId");

        select.innerHTML = `
            <option value="">
                Seleccionar Contenido
            </option>
        `;
        contents.forEach(content => {
            select.innerHTML += `
                <option value="${content.id}">
                    ${content.name}
                </option>
            `;
        });
    } catch (error) {
        alert("Error cargando contenidos:", error);
    }
}

async function loadAdvisers() {
    try {
        const response = await fetch(`${apiUrl}/api/users?role=adviser&state=active`);
        const advisers = await response.json();
        const select = document.getElementById("adviserId");

        select.innerHTML = `
            <option value="">
                Seleccionar Asesor
            </option>
        `;
        advisers.forEach(adviser => {
            select.innerHTML += `
                <option value="${adviser.id}">
                    ${adviser.first_name} ${adviser.last_name} ${adviser.second_last_name}
                </option>
            `;
        });
    } catch (error) {
        alert("Error cargando asesores:", error);
    }
}

async function loadTeachers() {
    try {
        const response = await fetch(`${apiUrl}/api/users?role=teacher&state=active`);
        const teachers = await response.json();
        const select = document.getElementById("teacherId");

        select.innerHTML = `
            <option value="">
                Seleccionar Docente
            </option>
        `;
        teachers.forEach(teacher => {
            select.innerHTML += `
                <option value="${teacher.id}">
                    ${teacher.first_name} ${teacher.last_name} ${teacher.second_last_name}
                </option>
            `;
        });
    } catch (error) {
        alert("Error cargando docentes:", error);
    }
}

loadSquads();
loadContents();
loadAdvisers();
loadTeachers();

document.getElementById("courseForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.style.opacity = ".7";

    const body = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        type: document.getElementById("type").value,
        squad_id: document.getElementById("squadId").value,
        content_id: document.getElementById("contentId").value,
        adviser_id: document.getElementById("adviserId").value,
        coordinator_id: userId,
        teacher_id: document.getElementById("teacherId").value,
        offer_cost_inscription: Number(document.getElementById("offerCostInscription").value),
        offer_cost_quota: Number(document.getElementById("offerCostQuota").value),
        offer_cost_reinscription: Number(document.getElementById("offerCostReinscription").value),
        offer_cost_title: Number(document.getElementById("offerCostTitle").value),
        offer_cost_title_two: Number(document.getElementById("offerCostTitleTwo").value),
        number_quota: Number(document.getElementById("numberQuota").value),
        rvoe: document.getElementById("rvoe").value,
        date_init: document.getElementById("dateInit").value,
        date_end: document.getElementById("dateEnd").value
    };

    try {
        const response = await fetch(
            `${apiUrl}/api/courses`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        if (!response.ok) {
            throw new Error("Error al crear curso");
        }
        await showSuccess("Registro Exitoso");
        document.getElementById("courseForm").reset();
        window.location.href = '../control/periods.html';
    } catch (error) {
        showError("Error al Registrar");
    } finally {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
    }
});