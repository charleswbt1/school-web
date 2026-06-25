async function loadStudentCourses() {
    try {
        const studentId = localStorage.getItem("studentId");
        const studentResponse = await fetch(`${apiUrl}/api/students?id=${studentId}`);
        const student = (await studentResponse.json())[0];

        const courseResponse = await fetch(`${apiUrl}/api/courses?id=${student.course_id}`);
        const course = (await courseResponse.json())[0];

        const contentResponse = await fetch(`${apiUrl}/api/contents?id=${course.content_id}`);
        const content = (await contentResponse.json())[0];

        const infoSection = document.querySelector(".info-section");
        infoSection.innerHTML = "";
        const modules = content.modules.map(
            (module, index) => `
                <div class="module-card">
                    <h4>Módulo ${index + 1}: ${module.name} (${student.notes?.find(note => note.module === module.name)?.value ?? 0})</h4>
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

        const documents = student.documents.map(
            (document, index) => `
                <a href="${document.url}" target="_blank" rel="noopener noreferrer">${document.type}</a>
            `
        ).join("");

        infoSection.innerHTML += `
                <div class="student-course-card">

                    <img
                        src="${course.image}"
                        alt="${course.course_name}"
                        class="course-image"
                    >

                    <div class="course-info">

                        <h2>${course.name}</h2>

                        <p>
                            <strong>Contenido:</strong>
                            ${course.content.description}
                        </p>

                        <p>
                            <strong>Módulos:</strong>
                            ${student.notes.length} / ${content.modules.length}
                        </p>

                        <p>
                        <br>
                            <strong>Promedio:</strong>
                            ${student.average}
                        </p>

                        <p>
                            <a href="${course.call_link}" target="_blank" rel="noopener noreferrer">Clase en linea</a>
                            <a href="${course.class_link}" target="_blank" rel="noopener noreferrer">Clases grabadas</a>
                        </p>

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