const courseId = new URLSearchParams(window.location.search).get("id");

async function loadModals() {
    const receiptModalFile = await fetch("../template/receipt.html");
    const receiptModalHtml = await receiptModalFile.text();
    document.getElementById("receiptModalTemplate").innerHTML = receiptModalHtml;
}
loadModals();

function getMonths(dateInit, dateEnd) {
    const months = [];
    const start = new Date(dateInit);
    const end = new Date(dateEnd);
    const current = new Date(start);

    while (current <= end) {
        months.push({
            year: String(current.getFullYear()),
            month: current.toLocaleString("es-MX", { month: "long" }).toUpperCase()
        });
        current.setMonth(current.getMonth() + 1);
    }
    return months;
}

async function loadStudents() {
    try {
        const response = await fetch(`${apiUrl}/api/students/control?course_id=${courseId}`);
        const data = await response.json();
        students = data.students;
        document.getElementById("course-name").textContent = data.course_name;
        const btnView = roleSession != "coordinator" ? 'hidden' : '';

        const months = getMonths(data.date_init, data.date_end);
        const paymentTotals = months.map(period => {
            return data.students.reduce((sum, student) => {
                const totalPaid = (student.payments || [])
                    .filter(payment =>
                        payment.year === period.year &&
                        payment.month === period.month &&
                        payment.type === 'cuota'
                    ).reduce((subtotal, payment) => subtotal + Number(payment.amount || 0), 0);
                return sum + totalPaid;
            }, 0);
        });
        const titlePaymentTotals = data.students.reduce((sum, student) => {
            const totalPaid = (student.payments || [])
                .filter(payment =>
                    payment.type === 'titulo'
                ).reduce((subtotal, payment) => subtotal + Number(payment.amount || 0), 0);
            return sum + totalPaid;
        }, 0);


        const table = document.getElementById("studentsTable");
        table.innerHTML = `
            <thead>
                <tr>
                    <th rowspan="2">
                        #
                    </th>
                    <th rowspan="2">
                        Alumno
                    </th>
                    <th rowspan="2">
                        CURP
                    </th>
                    <th rowspan="2">
                        Teléfono
                    </th>
                    <th colspan="${months.length + 1}">
                        Pagos
                    </th>
                </tr>
                <tr>
                    ${months.map(month => `<th>${month.month} ${month.year}</th>`).join("")}
                    <th>
                        Pagos Título
                    </th>
                </tr>
            </thead>
            <tbody>
                ${data.students.map((student, studentIndex) => {
            const payments = months.map(period => {

                const monthPayments = student.payments.filter(payment =>
                    payment.year === period.year &&
                    payment.month === period.month &&
                    payment.type === 'cuota'
                );

                const totalPaid = monthPayments.reduce(
                    (sum, payment) => sum + Number(payment.amount || 0), 0
                );

                const images = monthPayments.map(payment => `
                    <div class="iuc-actions">
                        <span class="button-icon"
                            onclick="viewImage('${payment.url}')"
                            title="Ver comprobante $${payment.amount}">
                            ${payment.amount > 0 ? `🔍` : `⚠️`}
                        </span>
                        <span class="button-icon" ${btnView}
                            onclick="viewReceipt('${student.id}','${payment.id}','${data.course_name}')"
                            title="Recibo $${payment.amount}">
                            ${payment.amount > 0 ? `🧾` : ``}
                        </span>  
                        <span class="button-icon" ${btnView}
                            onclick="deletePayment('${student.id}','${payment.id}',this)"
                            title="Eliminar $${payment.amount}">
                            ✖️
                        </span>
                    </div>
                `).join("");

                return `<td style="text-align:center">
                    <div>${formatAmount(totalPaid)}</div>
                    ${images}
                    <div class="iuc-actions">
                        <span class="button-icon" ${btnView}
                            onclick="viewPayment('${courseId}','${student.id}','${period.year}','${period.month}','cuota')"
                            title="Registrar pago">
                            ⬆️
                        </span>
                    </div>
                </td>`;
            }).join("");

            const titlePayments = student.payments.filter(payment => payment.type === 'titulo');
            const totalTitlePaid = titlePayments.reduce(
                (sum, payment) => sum + Number(payment.amount || 0), 0
            );
            const titleImages = titlePayments.map(payment => `
                <span class="button-icon"
                    onclick="viewImage('${payment.url}')"
                    title="Ver comprobante $${payment.amount}">
                    🔍
                </span>
                <span class="button-icon" ${btnView}
                    onclick="viewReceipt('${student.id}','${payment.id}','${data.course_name}')"
                    title="Recibo $${payment.amount}">
                    🧾
                </span>                    
            `).join("");

            let rowClass = '';
            switch (student.state?.toLowerCase()) {
                case 'active': rowClass = 'row-active'; break;
                case 'inactive': rowClass = 'row-inactive'; break;
                case 'pending': rowClass = 'row-pending'; break;
            }

            return `
                    <tr class="${rowClass}">
                        <td>
                            ${studentIndex + 1}
                        </td>
                        <td>
                            ${student.name}
                        </td>
                        <td>
                            ${student.curp}
                        </td>
                        <td>
                            ${student.phone}
                        </td>
                        ${payments}
                        <td style="text-align:center">
                            <div>${formatAmount(totalTitlePaid)}</div>
                            <div class="payment-images">${titleImages}</div>
                            <span class="button-icon" ${btnView}
                                onclick="viewPayment('${courseId}','${student.id}','${months.at(-1).year}','${months.at(-1).month}','titulo')"
                                title="Registrar pago">
                                ⬆️
                            </span>
                        </td>
                    </tr>
                    `;
        }).join("")}
                <tr style="font-weight:bold; background:#f5f5f5;">
                    <td colspan="4">
                        TOTAL
                    </td>
                    ${paymentTotals.map(total => `
                        <td style="text-align:right">
                            $${total.toLocaleString()}
                        </td>
                    `).join("")}
                    <td style="background:#17c669;">
                        ${formatAmount(titlePaymentTotals)}
                    </td>
                </tr>
            </tbody>
        `;
    } catch (error) {
        alert(error);
    }
}
loadStudents();


async function deletePayment(studentId, paymentId, button) {
    button.style.pointerEvents = "none";
    button.style.opacity = ".5";
    try {
        if (!await showConfirm("¿Deseas eliminar este pago?")) {
            return;
        }
        const response = await fetch(
            `${apiUrl}/api/students/bill`,
            {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_id: studentId,
                    payment_id: paymentId
                })
            }
        );
        if (!response.ok) {
            throw new Error();
        }
        await showSuccess("Pago eliminado correctamente");
        loadStudents();
    } catch (error) {
        console.error("student payment delete: Error al eliminar el pago:", error);
        showError("Fallo al eliminar el pago");
    } finally {
        button.style.pointerEvents = "auto";
        button.style.opacity = "1";
    }
}