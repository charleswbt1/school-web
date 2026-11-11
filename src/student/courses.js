async function loadCourses() {
    try {
        const response = await fetch(`${apiUrl}/api/students/courses`,
            { credentials: 'include' }
        );
        const courses = await response.json();
        if (!response.ok) {
            throw new Error(courses.message || "Error fetching courses");
        }
        const container = document.getElementById("coursesContainer");
        container.innerHTML = "";
        courses.forEach(course => {
            container.innerHTML += `
            <div class="course-card">
                <div class="course-image-container">
                    <img
                        src="${course.image}"
                        alt="${course.course_name}"
                        class="course-image">
                </div>
                <div class="course-body">
                    <h3>${course.course_name}</h3>
                </div>
                <div class="course-actions">
                    <button 
                        class="info-btn content-btn"
                        data-content="${course.id}">
                        Entrar
                    </button>
                </div>
            </div>
            `;
        });
    } catch (error) {
        console.error('Cargar cursos:', {
            message: error?.message ?? String(error),
            stack: error?.stack
        });
        await showError("Error al cargar los cursos. Por favor, inténtalo de nuevo más tarde.");
    }
}
loadCourses();


/* ===================== EVENTS ===================== */
document.addEventListener("click", async (event) => {
    const button = event.target;
    if (button.classList.contains("content-btn")) {
        const courseId = button.dataset.content;
        window.location.href = `../student/course.html?id=${courseId}`;
    }
});