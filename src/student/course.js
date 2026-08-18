const studentId = new URLSearchParams(window.location.search).get('id');
const students = [];
async function loadPage() {
    try {
        const responseService = await fetch(`${apiUrl}/api/courses/student?student_id=${studentId}`);
        const response = await responseService.json();

        response.student.name = response.name;
        students.push(response.student);
        const paymentTitle = response.student.payments.filter(payment => payment.type === 'titulo');
        const totalModules = response.content.modules.length;
        const approvedModules = response.student.notes?.filter(
            note => note.state === "aprobado"
        ).length || 0;
        const finalProgress = Math.round((approvedModules / totalModules) * 100);

        const studentCourseImage = document.getElementById("studentCourseImage");
        studentCourseImage.src = response.course.image;
        studentCourseImage.alt = response.course.name;

        const studentCourseInfo = document.getElementById("studentCourseInfo");
        studentCourseInfo.innerHTML = `
            <h2>${response.course.name}</h2>
            <p>
                <strong>Contenido:</strong>
                ${response.content.description}
            </p>
            <p>
                <strong>Módulos:</strong>
                ${response.student.notes?.length ?? 0} / ${response.content.modules.length}
            </p>
            <p>
                <strong>Promedio:</strong>
                ${response.student.average}
            </p>
            ${response.course.model === "sync"
                ? response.student.state === "inactive"
                    ? `<p class="course-state alert-danger">❌ Este módulo no está disponible. Comunícate con tu coordinador.</p>`
                    : response.student.state === "pending"
                        ? `<p class="course-state alert-warning">⚠️ Este módulo no está disponible. Comunícate con tu asesor.</p>`
                        : response.student.state === "active" && response.course.call_link && response.course.call_link.startsWith("http")
                            ? `<a href="${response.course.call_link}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                                Clase en línea
                            </a>`
                            : ''
                : response.course.model === "async"
                    ? `<button class="btn-primary" onclick="openInfoModal()">
                        📢 Informes
                    </button>`
                    : ""
            }
        `;

        createDocumentTable(response.student);
        animateProgressBar(finalProgress);

        const studentModulesContainer = document.getElementById("studentModulesContainer");
        studentModulesContainer.innerHTML = await getModules(response);

        if (paymentTitle.length === 0 && finalProgress > 99) {
            const studentPaymentContainer = document.getElementById("studentPaymentContainer");
            studentPaymentContainer.innerHTML = `
                <button onclick="paymentLink('${response.student.id}', '0', 'titulo')">
                    Pagar Certificación
                </button>`;
        }
    } catch (error) {
        alert(error);
    }
}

loadPage();

function createDocumentTable(student) {
    const documentTypes = [
        "curp",
        "acta",
        "certificado",
        "titulo",
        "cedula",
        "ine",
        "certificado-curso",
        "titulo-curso",
        "cedula-curso"
    ];
    const studentDocumentTable = document.getElementById("studentDocumentTable");
    studentDocumentTable.innerHTML = `
        <table class="style-table">
            <thead>
                <tr>
                    <th>Documento</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                ${documentTypes.map(type => {
        const document = student.documents.find(document => document.type === type);
        return `<tr>
                    <td>
                        ${type.toUpperCase()}
                    </td>
                    <td>
                ${document
                ? `<span class="button-icon"
                        onclick="viewImage('${document.url}')"
                        title="Ver Documento ${type}">
                        🔍
                    </span>
                    <span class="button-icon"
                        onclick="deleteDocument('${student.id}','${type}',this)"
                        title="Eliminar Documento ${type}">
                        ❌
                    </span>`
                : `<span class="button-icon"
                        onclick="viewDocument('${student.id}', '${type}')"
                        title="Registrar Documento">
                        ⬆️
                    </span>`
            }
                    </td>
                    </tr>`;
    }).join("")}
            </tbody>
        </table>
    `;
}

function animateProgressBar(finalProgress) {
    const studentLoadingContainer = document.getElementById("studentLoadingContainer");
    studentLoadingContainer.innerHTML = `
        <div class="loading-bar">
            <div id="loadingFill" class="loading-fill">
                <span id="loadingText">0%</span>
            </div>
        </div>`;

    const fill = document.getElementById("loadingFill");
    const text = document.getElementById("loadingText");

    let progress = 0;
    const interval = setInterval(() => {
        progress++;
        fill.style.width = progress + "%";
        text.textContent = progress + "%";
        if (progress >= finalProgress) {
            clearInterval(interval);
        }
    }, 20);
}

async function getModules(response) {
    let paymentButtonShown = false;
    const modules = await Promise.all(
        response.content.modules.map(async (module, index) => {
            const note = response.student.notes?.find(note => (note.module_id === module.id || note.module === module.name));
            return `
                <div class="module-card">
                    <h4>Módulo ${index + 1}: ${module.name} (${note?.value ?? 0})</h4>
                    <ul>
                        ${module.topics.map(topic => `
                        <li>
                            <strong>${topic.name}</strong>
                            <br>
                            ${topic.description}
                            <br>
                            ${response.student.state === "active" && topic.link && topic.link.startsWith("http")
                    ? `<button onclick="showVideo('${topic.link}')">Ver contenido</button>`
                    : ""
                }
                        </li>
                        `).join("")}
                    </ul>
                    ${await getClassesMediaSync(response, module.id)}
                    ${(() => {
                    const showButton =
                        !paymentButtonShown &&
                        (response.student.state !== "active" || !module.available) &&
                        module.link &&
                        module.link.startsWith("EXA_");

                    if (showButton) {
                        paymentButtonShown = true;
                        return `
                                <button onclick="paymentLink('${response.student.id}', '${index}', 'couta')">
                                    Realizar Pago
                                </button>
                            `;
                    }

                    return "";
                })()}                 
                    ${note?.state === "aprobado"
                    ? `<p class="course-state alert-success">✅ Aprobado</p>`
                    : response.student.state === "active" && module.available && module.link && module.link.startsWith("EXA_")
                        ? `<button onclick="showExam('${response.student.id}', '${response.course.id}', '${module.id}', '${module.link}')">
                                Presentar Examen
                            </button>`
                        : ``
                }
                </div>
            `;
        })
    );
    return modules.join("");
}

async function getClassesMediaSync(data, moduleId) {
    if (data.student.state === "active") {
        const classesResponse = await fetch(`${apiUrl}/api/classes?course_id=${data.course.id}&module_id=${moduleId}`);
        const classesJson = await classesResponse.json();
        if (!classesResponse.ok || classesJson.length < 1) {
            return '';
        }

        const classesMedia = classesJson[0].medias.filter(media => media.link.startsWith("http"));
        const mediaButtons = classesMedia.map(media => `
            <button onclick="showVideo('${media.link}')">
                Ver Clase
            </button>
        `).join("")
        const classesJob = classesJson[0].jobs.filter(job => job.link.startsWith("http"));
        const jobButtons = classesJob.map(job => `
            <button onclick="showVideo('${job.link}')">
                Ver Trabajo
            </button>
        `).join("")
        return `
            <div class="class-media-container">
                ${mediaButtons}
                ${jobButtons}
            </div>
        `;
    }
    return '';
}

const infoModal = document.getElementById("infoModal");
function openInfoModal() {
    infoModal.style.display = "flex";
}
infoModal.addEventListener("click", (e) => {
    if (e.target === infoModal) {
        infoModal.style.display = "none";
    }
});


function showVideo(url) {
    if (url.includes(".pdf")) {
        window.open(url, "_blank");
        return;
    }
    let videoId = "";

    if (url.includes("youtube.com/watch?v=")) {
        videoId = new URL(url).searchParams.get("v");
    } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    videoId = `https://www.youtube.com/embed/${videoId}`;

    document.getElementById("studentVideoContainer").innerHTML = `
    <iframe
        width="100%"
        height="450"
        src="${videoId}"
        title="Video"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
    </iframe>
`;
}

function showExam(studentId, courseId, moduleId, examId) {
    window.location.href = `exam.html?student_id=${studentId}&course_id=${courseId}&module_id=${moduleId}&id=${examId}`;
}

async function paymentLink(studentId, moduleIndex, paymentType) {
    const index = Number(moduleIndex);
    const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO'];
    const cuota = paymentType === 'titulo' ? 6000 : index === 0 ? 1000 : 500;
    const month = paymentType === 'titulo' ? 'MAYO' : months[index];

    const response = await fetch(
        `${apiUrl}/api/payments/checkout`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                student_id: studentId,
                amount: cuota,
                year: '2030',
                month: month,
                type: paymentType
            })
        }
    );
    const result = await response.json();
    if (!response.ok) {
        await showError(`No se genero la liga correctamente comunicate con tu asesor ${result.message}`)
        return;
    }

    window.location.href = result.url;
}