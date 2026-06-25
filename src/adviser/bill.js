async function loadStudents() {
    try {
        const userId = localStorage.getItem("userId");
        const role = localStorage.getItem("role");
        let query = `adviser_id=${userId}`;
        if (role === "coordinator") {
            query = `coordinator_id=${userId}`;
        }
        const response = await fetch(`${apiUrl}/api/students/data?${query}`);

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
                    ${student.curp} - ${student.name} - ${student.course_name}
                </option>
            `;
        });

        const yearSelect = document.getElementById("year");
        yearSelect.innerHTML = `
            <option value="">
                Año
            </option>
            <option value="2025">2025</option>
            <option value="2026" selected>2026</option>
            <option value="2027">2027</option>
        `;

        const monthSelect = document.getElementById("month");
        monthSelect.innerHTML = `
            <option value="">
                Mes
            </option>

            <option value="ENERO">ENERO</option>
            <option value="FEBRERO">FEBRERO</option>
            <option value="MARZO">MARZO</option>
            <option value="ABRIL">ABRIL</option>
            <option value="MAYO">MAYO</option>
            <option value="JUNIO">JUNIO</option>
            <option value="JULIO">JULIO</option>
            <option value="AGOSTO">AGOSTO</option>
            <option value="SEPTIEMBRE">SEPTIEMBRE</option>
            <option value="OCTUBRE">OCTUBRE</option>
            <option value="NOVIEMBRE">NOVIEMBRE</option>
            <option value="DICIEMBRE">DICIEMBRE</option>
        `;
    } catch (error) {
        console.error("Error cargando estudiantes:", error);
    }
}

loadStudents();
document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("invoiceImage");
    const preview = document.getElementById("previewImage");
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");

    input.addEventListener("change", (e) => {

        const file = e.target.files[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);

        preview.src = imageUrl;
        preview.style.display = "block";

        preview.addEventListener("click", () => {
            modalImage.src = imageUrl;
            modal.style.display = "flex";
        });

    });

    modal.addEventListener("click", () => {
        modal.style.display = "none";
    });

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
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    const file = document.getElementById("invoiceImage").files[0];
    const studentId = document.getElementById("studentId").value;

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
        const billRequest = {
            url: imageUrl,
            student_id: studentId,
            amount: document.getElementById("amount").value,
            year: document.getElementById("year").value,
            month: document.getElementById("month").value,
            source: "coordinator"
        }
        const invoiceResponse = await fetch(
            `${apiUrl}/api/students/bill`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(billRequest)
            }
        );

        alert("Factura creada correctamente");
        document.getElementById("studentForm").reset();
        document.getElementById("previewImage").style.display = "none";
    } catch (error) {
        alert("Error al crear factura");
    } finally {
        submitButton.disabled = false;
    }
});