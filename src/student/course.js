async function loadCourses() {
    try {
        const studentId = localStorage.getItem("studentId");
        const response = await fetch(`http://localhost:3000/api/student-dashboard/course/${studentId}`);
        const courses = await response.json();
        const container = document.getElementById("studentCoursesContainer");
        container.innerHTML = "";
        courses.forEach(course => {
            const div = document.createElement("div");
            div.className = "course-card";
            div.innerHTML = `
                <h3>${course.course_name}</h3>
                <p>${course.status}</p>
                <p>${course.percentage}</p>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error(error);
    }
}

loadCourses();