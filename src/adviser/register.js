const studentForm = document.getElementById("studentForm");

studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData(studentForm);
        const response = await fetch(
            "http://localhost:3000/api/students",
            {
                method: "POST",
                body: formData
            }
        );
        if (!response.ok) {
            throw new Error("Error registering student");
        }
        const data = await response.json();
        alert("Alumno inscrito correctamente");
        studentForm.reset();
    } catch (error) {
        alert("Error al registrar alumno");
    }
});