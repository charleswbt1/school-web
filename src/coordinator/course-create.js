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
    const squadId = document.getElementById("squadId").value;
    const response = await fetch(`${apiUrl}/api/squads?id=${squadId}`);
    const squads = await response.json();
    const body = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        squad_id: squadId,
        content_id: document.getElementById("contentId").value,
        adviser_id: document.getElementById("adviserId").value,
        teacher_id: document.getElementById("teacherId").value,
        image: squads[0].logo,
        cost: Number(document.getElementById("cost").value),
        costInscription: Number(document.getElementById("costInscription").value),
        offerCostInscription: Number(document.getElementById("offerCostInscription").value),
        costQuota: Number(document.getElementById("costQuota").value),
        offerCostQuota: Number(document.getElementById("offerCostQuota").value),
        costReinscription: Number(document.getElementById("costReinscription").value),
        offerCostReinscription: Number(document.getElementById("offerCostReinscription").value),
        costTitle: Number(document.getElementById("costTitle").value),
        offerCostTitle: Number(document.getElementById("offerCostTitle").value),
        offer: false,
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
    }
});