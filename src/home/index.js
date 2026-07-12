async function loadCourses() {
    try {
        const response = await fetch(`${apiUrl}/api/courses?available=true`);
        const courses = await response.json();

        const container = document.getElementById("coursesContainer");

        const categorias = [
            { nombre: "BACHILLERATO", icono: "📘" },
            { nombre: "LICENCIATURA", icono: "🎓" },
            { nombre: "ESPECIALIDAD", icono: "🏥" },
            { nombre: "ESPECIALIDAD MAESTRÍA", icono: "🎖️" }
        ];

        container.innerHTML = "";

        categorias.forEach(categoria => {
            const cursos = courses.filter(course =>
                course.type.toUpperCase() === categoria.nombre
            );
            if (cursos.length === 0) return;

            container.innerHTML += `
        <section class="category-section">
            <h2 class="category-title">${categoria.icono} ${categoria.nombre}</h2>
            <div class="category-grid" id="cat-${categoria.nombre}"></div>
        </section>
    `;

            const grid = document.getElementById(`cat-${categoria.nombre}`);

            cursos.forEach(course => {

                grid.innerHTML += `
            <div class="course-card">

                <div class="course-image-container">
                    <img src="${course.image}" class="course-image">
                </div>

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
                    </div>

            </div>
        `;
            });

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
        sessionStorage.setItem("courseId", courseId);

        document.getElementById("loginModal").style.display = "flex";

        return;
    }
});

/* ===================== CLOSE MODALS ===================== */

document.getElementById("closeContentModal")
    .addEventListener("click", () => {
        document.getElementById("contentModal").style.display = "none";
    });