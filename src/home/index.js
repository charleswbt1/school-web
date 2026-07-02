async function loadCourses() {
    try {
        localStorage.clear();
        sessionStorage.clear();
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
                    <h2>${course.name}</h2>
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
                        class="login-btn open-login-btn"
                        data-content="${course.id}">
                        Registrate
                    </button>
                    </div>
                </div>
            </div>
            `;
        });

    } catch (error) {
        alert("Error loading courses:", error);
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
            <h2>Plan de estudios</h2>
            <div class="modules-container">${modules}</div>
            `;

            document.getElementById("contentModal").style.display = "flex";
        } catch (error) {
            alert("Error loading content:", error);
        }
    }
    const modal = document.getElementById("contentModal");

    modal.addEventListener("click", (e) => {

        if (e.target === modal) {
            modal.style.display = "none";
        }

    });
    
    if (button.classList.contains("open-login-btn")) {
        const courseId = button.dataset.content;
        localStorage.setItem("courseId", courseId);

        document.getElementById("loginModal").style.display = "flex";

        return;
    }
});

/* ===================== CLOSE MODALS ===================== */

document.getElementById("closeContentModal")
    .addEventListener("click", () => {
        document.getElementById("contentModal").style.display = "none";
    });