async function loadCourses() {
    try {
        const userId = sessionStorage.getItem("userId");
        const response = await fetch(`${apiUrl}/api/students/courses?user_id=${userId}`);
        const courses = await response.json();
        const container = document.getElementById("studentCoursesContainer");
        container.innerHTML = "";
        courses.forEach(course => {
            container.innerHTML += `
            <div class="course-card">
                <img
                    src="${course.image}"
                    alt="${course.course_name}"
                    class="course-image">
                <div class="course-body">
                    <h3>${course.course_name}</h3>

                    <div class="course-actions">
                        <button 
                            class="info-btn content-btn"
                            data-content="${course.id}">
                            Entrar
                        </button>
                    </div>
                </div>
            </div>
            `;
        });
    } catch (error) {
        alert(error);
    }
}
loadCourses();


/* ===================== EVENTS ===================== */

document.addEventListener("click", async (event) => {
    const button = event.target;

    /* ===================== CONTENT ===================== */

    if (button.classList.contains("content-btn")) {
        const courseId = button.dataset.content;
        try {
            window.location.href = `../student/course.html?id=${courseId}`;
        } catch (error) {
            alert("Error setting student ID:", error);
        }
    }
  
});