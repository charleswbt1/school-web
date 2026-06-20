async function loadStudents() {
    try {
        const adviserId = localStorage.getItem("userId");
        const response = await fetch(
            `${apiUrl}/api/students/data?adviser_id=${adviserId}`
        );

        const students = await response.json();
        const select = document.getElementById("studentId");

        select.innerHTML = `
            <option value="">
                Seleccionar Alumno
            </option>
        `;

        students.forEach(student => {
            select.innerHTML += `
                <option value="${student.id}">
                    ${student.curp} - ${student.course_name}
                </option>
            `;
        });
    } catch (error) {
        console.error("Error cargando estudiantes:", error);
    }
}

loadStudents();

document.getElementById("invoiceImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = document.getElementById("previewImage");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
});

document.getElementById("amount").addEventListener("keydown", (e) => {
    const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab"
    ];

    if (e.key === "." && e.target.value.includes(".")) {
        e.preventDefault();
        return;
    }
    if (
        allowedKeys.includes(e.key) ||
        /^[0-9.]$/.test(e.key)
    ) {
        return;
    }
    e.preventDefault();
});


document.getElementById("studentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = document.getElementById("invoiceImage").files[0];
    const amount = document.getElementById("amount").value;
    const studentId = document.getElementById("studentId").value;
    const year = document.getElementById("year").value;
    const month = document.getElementById("month").value;

    try {
        /* SUBIR ARCHIVO */
        const formData = new FormData();
        formData.append("reqFile", file);
        formData.append("directory", `student/${studentId}/payment`);

        const uploadResponse = await fetch(
            `${apiUrl}/api/files`,
            {
                method: "POST",
                body: formData

            }
        );
        const uploadData = await uploadResponse.json();
        const imageUrl = uploadData.url;

        /* CREAR FACTURA */
        const invoiceResponse = await fetch(
            `${apiUrl}/api/students/bill`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: imageUrl,
                    amount,
                    year,
                    month,
                    student_id: studentId,
                    source: "adviser"
                })
            }
        );

        alert("Factura creada correctamente");
        document.getElementById("studentForm").reset();
        document.getElementById("previewImage").style.display = "none";
    } catch (error) {
        alert("Error al crear factura");
    }
});