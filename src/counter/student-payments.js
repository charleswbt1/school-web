const roleSession = sessionStorage.getItem('role');
const courseId = new URLSearchParams(window.location.search).get("id");
let studentId;
let type;
let students;

async function loadModals() {
    const receiptModalFile = await fetch("../template/receipt-template.html");
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
                    <span class="button-icon"
                        onclick="viewImage('${payment.url}')"
                        title="Ver comprobante $${payment.amount}">
                        🔍
                    </span>
                    <span class="button-icon" ${btnView}
                        onclick="viewReceipt('${student.id}','${payment.id}')"
                        title="Recibo $${payment.amount}">
                        🧾
                    </span>                    
                `).join("");

                return `<td style="text-align:center">
                    <div>${formatAmount(totalPaid)}</div>
                    <div class="payment-images">${images}</div>
                    <span class="button-icon" ${btnView}
                        onclick="viewPayment('${studentIndex}','${period.year}','${period.month}','cuota')"
                        title="Registrar pago">
                        ⬆️
                    </span>
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
                    onclick="viewReceipt('${student.id}','${payment.id}')"
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
                                onclick="viewPayment('${studentIndex}','${months.at(-1).year}','${months.at(-1).month}','titulo')"
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

function formatAmount(amount) {
    if (amount) {
        return `$${amount.toLocaleString()}`;
    }
    return '';
}

function formatDate(value) {
    if (!value) return "";
    if (value.toDate) {
        return value.toDate().toISOString().split("T")[0];
    }
    if (value._seconds || value.seconds) {
        return new Date((value._seconds ?? value.seconds) * 1000)
            .toISOString()
            .split("T")[0];
    }
    if (typeof value === "string") {
        return value.split("T")[0];
    }
    if (value instanceof Date) {
        return value.toISOString().split("T")[0];
    }
    return "";
}

const modalImage = document.getElementById("imageModal");
const payImage = document.getElementById("payImage");

modalImage.addEventListener("click", () => {
    payImage.src = '';
    modalImage.style.display = "none";
});

function viewImage(imageUrl) {
    if (!imageUrl) return;
    payImage.src = imageUrl;
    modalImage.style.display = "flex";
}

const modalPay = document.getElementById("contentModal");
modalPay.addEventListener("click", (e) => {
    if (e.target === modalPay) {
        closePaymentModal();
    }
});

function viewPayment(index, y, m, t) {
    studentId = students[index].id;
    document.getElementById("bill-year").textContent = y;
    document.getElementById("bill-month").textContent = m;
    document.getElementById("student-name").textContent = students[index].name;
    type = t;
    modalPay.style.display = "flex";
}

const preview = document.getElementById("previewImage");
const invoiceImage = document.getElementById("invoiceImage");
let previewUrl = null;
invoiceImage.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }
    previewUrl = URL.createObjectURL(file);
    preview.src = previewUrl;
    preview.style.display = "block";
    preview.onclick = () => viewImage(previewUrl);
});

const payForm = document.getElementById("payForm");
payForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    try {
        submitButton.disabled = true;
        submitButton.style.opacity = ".7";
        const file = invoiceImage.files[0];
        if (!file) {
            throw new Error("Selecciona un comprobante.");
        }
        const amount = Number(document.getElementById("amount").value);
        if (!amount || amount <= 0) {
            throw new Error("Ingresa un monto válido.");
        }
        /* SUBIR ARCHIVO */
        const formData = new FormData();
        formData.append("reqFile", file);
        formData.append("directory", `courses/${courseId}/${studentId}/payment`);

        const uploadResponse = await fetch(
            `${apiUrl}/api/files`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!uploadResponse.ok) {
            throw new Error("Fallo al subir imagen");
        }
        const uploadData = await uploadResponse.json();

        /* CREAR FACTURA */
        const billRequest = {
            url: uploadData.url,
            student_id: studentId,
            amount,
            year: document.getElementById("bill-year").textContent,
            month: document.getElementById("bill-month").textContent,
            type,
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
        if (!invoiceResponse.ok) {
            throw new Error("No se pudo registrar el pago");
        }
        closePaymentModal();
        await showSuccess("Registro Exitoso");
        await loadStudents();
    } catch (error) {
        showError(`Error al Registrar - ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
    }
});

function closePaymentModal() {
    modalPay.style.display = "none";
    payForm.reset();

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
    }
    preview.src = "";
    preview.style.display = "none";

    studentId = null;
    type = null;
}

const modalReceipt = document.getElementById("receiptModal");
modalReceipt.addEventListener("click", (e) => {
    if (e.target === modalReceipt) {
        closeReceiptModal();
    }
});

function viewReceipt(studentId, paymentId) {
    const student = students.find(student => student.id === studentId);
    const payment = student.payments.find(payment => payment.id === paymentId);
    document.getElementById("receiptNumber").textContent = payment.id.replace('PAY_', '') ?? "000000";
    document.getElementById("date").textContent = formatDate(payment.date);
    document.getElementById("total").textContent = `$${Number(payment.amount).toLocaleString()}`;
    document.getElementById("customer").textContent = student.name;
    document.getElementById("document").textContent = student.curp;
    document.getElementById("code").textContent = student.school_id ?? '';
    document.getElementById("concept").textContent = payment.type === 'cuota' ? 'Colegiatura' : 'Documento'
    document.getElementById("program").textContent = document.getElementById("course-name").textContent;
    document.getElementById("paymentTable").innerHTML = `
            <tr>
                <td>Colegiatura</td>
                <td>$${Number(payment.amount).toLocaleString()}</td>
            </tr>
            `;
    modalReceipt.style.display = "flex";
}

function downloadReceipt() {
    const receipt = document.getElementById("receiptContainer");
    html2canvas(receipt, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff"
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = "Recibo.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}

function closeReceiptModal() {
    modalReceipt.style.display = "none";
}