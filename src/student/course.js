const studentId = new URLSearchParams(window.location.search).get('id');

async function loadStudentCourses() {
    try {
        const responseService = await fetch(`${apiUrl}/api/courses/student?student_id=${studentId}`);
        const response = await responseService.json();

        const infoSection = document.querySelector(".info-section");
        infoSection.innerHTML = "";
        const modules = response.content.modules.map(
            (module, index) => `
                <div class="module-card">
                    <h4>Módulo ${index + 1}: ${module.name} (${response.student.notes?.find(note => note.module === module.name)?.value ?? 0})</h4>
                    <ul>
                        ${module.topics.map(topic => `
                            <li>
                                <strong>${topic.name}</strong>
                                <br>
                                ${topic.description}                                
                            </li>
                        `).join("")}
                    </ul>
                </div>
            `
        ).join("");

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
                            ${response.course.content.description}
                        </p>

                        <p>
                            <strong>Módulos:</strong>
                            ${response.student.notes.length} / ${response.content.modules.length}
                        </p>

                        <p>
                        <br>
                            <strong>Promedio:</strong>
                            ${response.student.average}
                        </p>

                        <div class="course-actions">

                            <a href="${response.course.call_link}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                            Clase en línea
                            </a>

                            <a href="${response.course.class_link}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                            Clases grabadas
                            </a>

                        </div>

                        <div class="modules-container">
                            ${documents}
                        </div>

                        <div class="modules-container">
                            ${modules}
                        </div>

                    </div>

                </div>
            `;
    } catch (error) {
        console.error(error);
    }
}

loadStudentCourses();