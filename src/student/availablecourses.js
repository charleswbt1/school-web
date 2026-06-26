async function loadCourses() {
    try {
        const response = await fetch(`${apiUrl}/api/courses?available=true`);
        const courses = await response.json();

        const container = document.getElementById("coursesContainer");
        container.innerHTML = "";

        courses.forEach(course => {
            container.innerHTML += `
            <div class="course-card">
                <img
                    src="${course.image}"
                    alt="${course.name}"
                    class="course-image">
                <div class="course-body">
                    <h3>${course.name}</h3>
                    <p>${course.description}</p>
                    <p>Clases: ${course.date_init} - ${course.date_end}</p>
                    <p>
                        Aprovecha de
                        <span style="text-decoration: line-through; color: #999;">
                            $${course.cost_quota}
                        </span>
                        a: 
                        <strong>
                            $${course.offer_cost_quota}
                        </strong>
                    </p>
                    <div class="course-actions">
                        <button 
                            class="info-btn content-btn"
                            data-content="${course.content_id}">
                            Detalles
                        </button>

                    <button 
                        class="info-btn register-btn"
                        data-content="${course.id}">
                        regiistrate
                    </button>
                    </div>
                </div>
            </div>
            `;
        });

    } catch (error) {
        console.error("Error loading courses:", error);
    }
}

loadCourses();

/* ===================== EVENTS ===================== */

document.addEventListener("click", async (event) => {
    const button = event.target;

    /* ===================== CONTENT ===================== */

    if (button.classList.contains("content-btn")) {
        const contentId = button.dataset.content;

        try {
            const response = await fetch(
                `${apiUrl}/api/contents?id=${contentId}`
            );

            const data = await response.json();

            const modules = data[0].modules.map(module => {
                const topics = module.topics.map(topic => `
                    <li>${topic.name}</li>
                `)
                    .join("");
                return `
                    <div class="module-card">
                    <h3>${module.name}</h3>
                    <ul class="topics-list">${topics}</ul>
                    </div>
                    `;
            })
                .join("");

            document.getElementById("contentData").innerHTML = `
            <h2>${data[0].name}</h2>
            <div class="modules-container">${modules}</div>
            `;

            document.getElementById("contentModal").style.display = "flex";
        } catch (error) {
            console.error("Error loading content:", error);
        }
    }

    if (button.classList.contains("register-btn")) {
        const userId = localStorage.getItem("userId");
        const courseId = button.dataset.content;
        const student = await fetch(
            `${apiUrl}/api/students`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    course_id: courseId
                })
            }
        );
        window.location.href = "../student/courses.html";
    }
});

/* ===================== CLOSE MODALS ===================== */

document.getElementById("closeContentModal").addEventListener("click", () => {
    document.getElementById("contentModal").style.display = "none";
});