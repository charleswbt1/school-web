async function loadCourses() {
    try {
        const response = await fetch(`${apiUrl}/api/courses/availables`);
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
        <section class="category-section" id="${categoria.nombre}">
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
                ${course.model === 'sync'
                        ? `<p>Clases: ${course.date_init} - ${course.date_end}</p>`
                        : ``
                    }                
                <p style="display: ${showPrice ? 'block' : 'none'};">
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
                        data-content="${course.id}">
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

document.addEventListener("click", async (event) => {
    const button = event.target;
    if (button.classList.contains("content-btn")) {
        const courseId = button.dataset.content;

        try {
            const response = await fetch(`${apiUrl}/api/courses/detail?id=${courseId}`);
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

            const adviserPhone = data.adviser.phone.replace(/\D/g, '');
            document.getElementById("contentData").innerHTML = `
            <h2>Plan de estudios</h2>
            <div class="modules-container">
                ${modules}
                <div class="module-card">
                    <h3>Inscripción</h3>
                    <p>Para poder incribirte es necesario que te pongas en contacto con el asesor:</p>
                    <p><strong>${adviserPhone}</strong></p>
                    <br>
                    <button class="info-btn" onclick="openWhatsApp('${adviserPhone}')">
                        Contactar por WhatsApp
                    </button>
                </div>
            </div>
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
});