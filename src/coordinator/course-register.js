const userId = sessionStorage.getItem("userId");
const courseId = new URLSearchParams(window.location.search).get('id');

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

async function loadCourse() {
    try {
        if (!courseId) {
            return;
        }
        document.getElementById('courseBtn').textContent = 'Actualizar Curso';
        document.getElementById('costInscription').style.display = 'block';
        document.getElementById('costQuota').style.display = 'block';
        document.getElementById('costReinscription').style.display = 'block';
        document.getElementById('costReinscription').style.display = 'block';
        document.getElementById('costTitle').style.display = 'block';
        document.getElementById('costTitleTwo').style.display = 'block';
        document.getElementById('costInscriptionText').style.display = 'block';
        document.getElementById('costQuotaText').style.display = 'block';
        document.getElementById('costReinscriptionText').style.display = 'block';
        document.getElementById('costReinscriptionText').style.display = 'block';
        document.getElementById('costTitleText').style.display = 'block';
        document.getElementById('costTitleTwoText').style.display = 'block';

        const response = await fetch(`${apiUrl}/api/courses?id=${courseId}`);
        if (!response.ok) {
            throw new Error('Error al obtener el curso');
        }

        const jsonResponse = await response.json();
        const course = jsonResponse[0];

        document.getElementById("name").value = course.name
        document.getElementById("description").value = course.description
        document.getElementById("type").value = course.type
        document.getElementById("squadId").value = course.squad_id
        document.getElementById("contentId").value = course.content_id
        document.getElementById("adviserId").value = course.adviser_id
        document.getElementById("teacherId").value = course.teacher_id
        document.getElementById("offerCostInscription").value = course.offer_cost_inscription
        document.getElementById("offerCostQuota").value = course.offer_cost_quota
        document.getElementById("offerCostReinscription").value = course.offer_cost_reinscription
        document.getElementById("offerCostTitle").value = course.offer_cost_title
        document.getElementById("offerCostTitleTwo").value = course.offer_cost_title_two
        document.getElementById("costInscription").value = course.cost_inscription
        document.getElementById("costQuota").value = course.cost_quota
        document.getElementById("costReinscription").value = course.cost_reinscription
        document.getElementById("costTitle").value = course.cost_title
        document.getElementById("costTitleTwo").value = course.cost_title_two
        document.getElementById("numberQuota").value = course.number_quota
        document.getElementById("rvoe").value = course.rvoe
        document.getElementById("dateInit").value = course.date_init
        document.getElementById("dateEnd").value = course.date_end
        document.getElementById("hours_week").value = course.hours_week
        document.getElementById("call_link").value = course.call_link
        document.getElementById("class_link").value = course.class_link

    } catch (error) {
        alert('Error al cargar la escuela', error);
    }
}

async function init() {
    await Promise.all([
        loadSquads(),
        loadContents(),
        loadAdvisers(),
        loadTeachers()
    ]);
    await loadCourse();
}
init();

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
        cost_inscription: Number(document.getElementById("costInscription").value),
        cost_quota: Number(document.getElementById("costQuota").value),
        cost_reinscription: Number(document.getElementById("costReinscription").value),
        cost_title: Number(document.getElementById("costTitle").value),
        cost_title_two: Number(document.getElementById("costTitleTwo").value),
        number_quota: Number(document.getElementById("numberQuota").value),
        rvoe: document.getElementById("rvoe").value,
        date_init: document.getElementById("dateInit").value,
        date_end: document.getElementById("dateEnd").value,
        hours_week: document.getElementById("hours_week").value,
        call_link: document.getElementById("call_link").value,
        class_link: document.getElementById("class_link").value
    };

    try {
        const query = courseId ? `?id=${courseId}` : ``;
        const response = await fetch(
            `${apiUrl}/api/courses${query}`,
            {
                method: courseId ? 'PATCH' : "POST",
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