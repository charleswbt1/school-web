const studentId = new URLSearchParams(window.location.search).get('id');

async function loadStudentCourses() {
    try {
        const responseService = await fetch(`${apiUrl}/api/courses/student?student_id=${studentId}`);
        const response = await responseService.json();

        const infoSection = document.getElementById("courseContainer");

        infoSection.innerHTML = "";
        const modules = response.content.modules.map(
            (module, index) => {
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
                        ? `<button onclick="showVideo('${topic.link}')">
                            Ver contenido
                        </button>`
                        : ""
                    }
                            </li>
                        `).join("")}
                    </ul>
                    ${response.student.state === "active" && module.available && module.link && module.link.startsWith("EXA_") && note?.state !== "aprobado"
                        ? `<button onclick="showExam('${response.student.id}', '${response.course.id}', '${module.id}', '${module.link}')">
                            Presentar examen
                        </button>`
                        : ""
                    }
                    ${note?.state === "aprobado"
                        ? `<p class="course-state alert-success">✅ Aprobado</p>`
                        : ""
                    }
                </div>
            `}).join("");

        const documents = response.student.documents.map(
            (document, index) => `
                <a href="${document.url}" target="_blank" rel="noopener noreferrer">${document.type}</a>
            `
        ).join("");

        infoSection.innerHTML += `
                <div class="student-course-card">

                    <img
                        src="${response.course.image}"
                        alt="${response.course.course_name}"
                        class="course-image"
                    >

                    <div class="course-info">

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
                     <p class="
                        course-state
                        ${response.student.state === "inactive" ? "alert-danger" : ""}
                        ${response.student.state === "pending" ? "alert-warning" : ""}
                    ">
                        ${response.student.state === "inactive"
                ? "❌ Este módulo no está disponible. Comunícate con tu coordinador."
                : response.student.state === "pending"
                    ? "⚠️ Este módulo no está disponible. Comunícate con tu asesor."
                    : ""
            }
                         </p>

                        <div class="course-actions">
                            ${response.student.state === "active" && response.course.call_link && response.course.call_link.startsWith("http")
                ? `<a href="${response.course.call_link}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                            Clase en línea
                            </a>`
                : ""
            }
                            ${response.student.state === "active" && response.course.class_link && response.course.class_link.startsWith("http")
                ? `<a href="${response.course.class_link}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                            Clases grabadas
                            </a>`
                : ""
            }

            <div class="loading-container">
                            <div class="loading-bar">
                                    <div class="loading-fill" id="loadingFill">
                                        <span id="loadingText">0%</span>
                                    </div>

                                </div>

                            </div>
                            
                        </div>

                        <div class="modules-container">
                            ${documents}
                        </div>

                        <div id="videoContainer"></div>

                        <div class="modules-container">
                            ${modules}
                        </div>

                    </div>

                </div>
            `;

        // Barra de progreso
        const fill = document.getElementById("loadingFill");
        const text = document.getElementById("loadingText");

        const totalModules = response.content.modules.length;
        const completedModules = response.student.notes?.length || 0;

        const finalProgress = Math.round((completedModules / totalModules) * 100);

        let progress = 0;

        const interval = setInterval(() => {

            progress++;

            fill.style.width = progress + "%";
            text.textContent = progress + "%";

            if (progress >= finalProgress) {
                clearInterval(interval);
            }

        }, 20);
    } catch (error) {
        alert(error);
    }
}

loadStudentCourses();

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

    document.getElementById("videoContainer").innerHTML = `
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
