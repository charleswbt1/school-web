async function loadCourses() {
    try {
        const response = await fetch("http://localhost:3000/api/course");
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
                    <p>${course.squad_name}</p>
                    <p>${course.description}</p>
                    <p>${course.date_init} - ${course.date_end}</p>
                    <p>$ ${course.cost}</p>

                    <div class="course-actions">
                        <button 
                            class="info-btn content-btn"
                            data-content="${course.content_id}">
                            Temario
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

    /* ===================== SQUAD ===================== */

    if (button.classList.contains("squad-btn")) {
        const squadId = button.dataset.squad;

        try {
            const response = await fetch(
                `http://localhost:3000/api/squad/${squadId}`
            );

            const data = await response.json();

            document.getElementById("squadContent").innerHTML = `
                <div class="school-info">
                    <img src="${data.logo}" class="school-logo">
                    <h2>${data.name}</h2>
                </div>
            `;

            document.getElementById("squadModal").style.display = "flex";

        } catch (error) {
            console.error("Error loading squad:", error);
        }
    }

    /* ===================== CONTENT ===================== */

    if (button.classList.contains("content-btn")) {
        const contentId = button.dataset.content;

        try {
            const response = await fetch(
                `http://localhost:3000/api/content/${contentId}`
            );

            const data = await response.json();

            const modules = data.modules.map(module => {
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
            <h2>${data.name}</h2>
            <div class="modules-container">${modules}</div>
            `;

            document.getElementById("contentModal").style.display = "flex";
        } catch (error) {
            console.error("Error loading content:", error);
        }
    }
});

/* ===================== CLOSE MODALS ===================== */

document.getElementById("closeSquadModal")
    .addEventListener("click", () => {
        document.getElementById("squadModal").style.display = "none";
    });

document.getElementById("closeContentModal")
    .addEventListener("click", () => {
        document.getElementById("contentModal").style.display = "none";
    });