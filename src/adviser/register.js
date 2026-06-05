async function loadStudents() {

    try {
        const adviserId = localStorage.getItem("userId");
        const response = await fetch(
            "http://localhost:3000/api/students/adviser?adviser_id=" + adviserId
        );

        const students = await response.json();

        const select =
            document.getElementById("studentCourse");

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

        console.error(
            "Error cargando estudiantes:",
            error
        );

    }
}

loadStudents();

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

document.getElementById("studentForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const file =
            document.getElementById("invoiceImage").files[0];

        const amount =
            document.getElementById("amount").value;

        const studentId =
            document.getElementById("studentId").value;

        try {

            /* SUBIR ARCHIVO */

            const formData = new FormData();

            formData.append("reqFile", file);
            formData.append("directory", "student/payment");

            const uploadResponse = await fetch(
                "http://localhost:3000/api/files",
                {
                    method: "POST",
                    body: formData

                }
            );

            const uploadData =
                await uploadResponse.json();

            const imageUrl = uploadData.url;

            /* CREAR FACTURA */

            const invoiceResponse = await fetch(
                "http://localhost:3000/api/students/bill",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        image: imageUrl,
                        amount,
                        student_id: studentId
                    })
                }
            );

            const invoice =
                await invoiceResponse.json();

            console.log(invoice);

            alert("Factura creada correctamente");

        } catch (error) {

            console.error(error);
            alert("Error al crear factura");

        }

    });