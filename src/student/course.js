async function loadStudentCourses() {
    try {
        const studentId = localStorage.getItem("studentId");
        const response = await fetch(
            `${apiUrl}/api/students?id=${studentId}`
        );

        const courses = await response.json();
        const infoSection = document.querySelector(".info-section");

        infoSection.innerHTML = "";
        courses.forEach(course => {
            const modules = course.content.modules.map(
                (module, index) => `
                <div class="module-card">
                    <h4>Módulo ${index + 1}: ${module.name}</h4>

                    <p>
                        <strong>Calificación:</strong>
                        ${module.qualification}
                    </p>

                    <ul>
                        ${module.topics.map(topic => `
                            <li>
                                <strong>${topic.name}</strong><br>
                                ${topic.description}
                                ${topic.multimedia
                        ? `<a href="${topic.multimedia}" target="_blank">Ver recurso</a>`
                        : ""
                    }                            
                            </li>
                        `).join("")}
                    </ul>
                </div>
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

                        <h2>${course.course_name}</h2>

                        <p>
                            <strong>Contenido:</strong>
                            ${course.content.name}
                        </p>

                        <p>
                            ${course.content.description}
                        </p>

                        <p>
                            <strong>Módulos:</strong>
                            ${course.total_modules}
                        </p>

                        <p>
                            <strong>Completados:</strong>
                            ${course.modules_completed}
                        </p>

                        <p>
                            <strong>Estado:</strong>
                            ${course.state}
                        </p>

                        <div class="modules-container">
                            ${modules}
                        </div>

                    </div>

                </div>
            `;
        });

    } catch (error) {
        console.error(error);
    }
}

loadStudentCourses();