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
                <option value="${student.course_id}#${student.id}">
                    ${student.curp} - ${student.name} - ${student.course_name}
                </option>
            `;
        });
    } catch (error) {
        alert("Error cargando estudiantes:", error);
    }
}

loadStudents();

document.getElementById("studentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const [courseId, studentId] = document.getElementById("studentId").value.split("#");
    const response = await fetch(`${apiUrl}/api/students?id=${studentId}`);

    const students = await response.json();
    const student = students[0];
    const userResponse = await fetch(`${apiUrl}/api/users?id=${student.user_id}`);
    const users = await userResponse.json();
    const user = users[0];

    const payment = student.payments[student.payments.length - 1];


    document.getElementById("logo").src =
        "https://storage.googleapis.com/school-source/web/iucHeader.png"

    document.getElementById("receiptNumber").textContent =
        student.receipt_number ?? "000000";

    document.getElementById("date").textContent =
        payment.date;

    document.getElementById("total").textContent =
        `$${Number(payment.amount).toLocaleString()}`;

    document.getElementById("customer").textContent =
        `${user.first_name} ${user.last_name} ${user.second_last_name}`;

    document.getElementById("document").textContent =
        user.curp;

    document.getElementById("code").textContent =
        student.school_id ?? '';

    document.getElementById("program").textContent =
        student.course_name;

    document.getElementById("concept").textContent =
        "Colegiatura";

    document.getElementById("status").textContent = "PAGADO";

    document.getElementById("paymentTable").innerHTML = `
            <tr>
                <td>Colegiatura</td>
                <td>$${Number(payment.amount).toLocaleString()}</td>
            </tr>
`;
});


