async function loadSquads() {
    try {
        const response = await fetch(`${apiUrl}/api/squads`);
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
        console.error("Error cargando escuelas:", error);
    }
}

async function loadContents() {
    try {
        const response = await fetch(`${apiUrl}/api/contents`);
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
        console.error("Error cargando contenidos:", error);
    }
}

async function loadAdvisers() {
    try {
        const response = await fetch(`${apiUrl}/api/users/role?role=adviser`);
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
        console.error("Error cargando asesores:", error);
    }
}

async function loadTeachers() {
    try {
        const response = await fetch(`${apiUrl}/api/users/role?role=teacher`);
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
        console.error("Error cargando docentes:", error);
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

    const squadId = document.getElementById("squadId").value;
    const response = await fetch(`${apiUrl}/api/squads?id=${squadId}`);
    const squads = await response.json();
    const body = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        squad_id: squadId,
        content_id: document.getElementById("contentId").value,
        adviser_id: document.getElementById("adviserId").value,
        coordinator_id: localStorage.getItem("userId"),
        teacher_id: document.getElementById("teacherId").value,
        image: squads[0].logo,
        cost: Number(document.getElementById("cost").value),
        cost_inscription: Number(document.getElementById("costInscription").value),
        offer_cost_inscription: Number(document.getElementById("offerCostInscription").value),
        cost_quota: Number(document.getElementById("costQuota").value),
        offer_cost_quota: Number(document.getElementById("offerCostQuota").value),
        cost_reinscription: Number(document.getElementById("costReinscription").value),
        offer_cost_reinscription: Number(document.getElementById("offerCostReinscription").value),
        cost_title: Number(document.getElementById("costTitle").value),
        offer_cost_title: Number(document.getElementById("offerCostTitle").value),
        number_quota: Number(document.getElementById("numberQuota").value),
        offer: true,
        rvoe: document.getElementById("rvoe").value,
        date_init: document.getElementById("dateInit").value,
        date_end: document.getElementById("dateEnd").value,
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
        alert("Curso creado correctamente");
        document.getElementById("courseForm").reset();
        window.location.href = '../coordinator/courses.html';
    } catch (error) {
        alert("Error al crear curso");
    } finally {
        submitButton.disabled = false;
    }
});