const roleSession = sessionStorage.getItem('role');
const courseId = new URLSearchParams(window.location.search).get("id");
let studentId;
let year;
let month;
let type;

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

        const months = getMonths(data.date_init, data.date_end);
        const table = document.getElementById("studentsTable");

        const paymentTotals = months.map(period => {
            return data.students.reduce((sum, student) => {
                const totalPaid = (student.payments || [])
                    .filter(payment => payment.year === period.year && payment.month === period.month)
                    .reduce((subtotal, payment) => subtotal + Number(payment.amount || 0), 0);
                return sum + totalPaid;
            }, 0);
        });

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
                    <th colspan="${months.length}">
                        Pagos
                    </th>
                </tr>
                <tr>
                    ${months.map(month => `
                        <th>
                            ${month.month}
                            ${month.year}
                        </th>
                    `).join("")}
                </tr>
            </thead>

            <tbody>
                ${data.students.map((student, index) => {

            const payments = months.map(period => {

                const monthPayments = student.payments.filter(payment =>
                    payment.year === period.year &&
                    payment.month === period.month
                );

                const totalPaid = monthPayments.reduce(
                    (sum, payment) => sum + Number(payment.amount || 0), 0
                );

                const images = monthPayments.map(payment => `
                    <span class="button-icon"
                        onclick="viewImage('${payment.url}')"
                        title="Ver comprobante">
                        🔍
                    </span>
                `).join("");

                return `
        <td style="text-align:center">
            ${totalPaid > 0 ? `
                <div>$${totalPaid.toLocaleString()}</div>
                <div class="payment-images">${images}</div>
            ` : ``}
            ${roleSession === "coordinator" ? `
                <span class="button-icon"
                    onclick="viewPayment('${student.id}','${period.year}','${period.month}','cuota')"
                    title="Registrar pago">
                    ⬆️
                </span>
            ` : ``}
        </td>
    `;

            }).join("");

            let rowClass = '';
            switch (student.state?.toLowerCase()) {
                case 'active': rowClass = 'row-active'; break;
                case 'inactive': rowClass = 'row-inactive'; break;
                case 'pending': rowClass = 'row-pending'; break;
            }

            return `
                    <tr class="${rowClass}">
                        <td>
                            ${index + 1}
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
                </tr>
            </tbody>
        `;
    } catch (error) {
        alert(error);
    }
}

loadStudents();


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

function viewPayment(si, y, m, t) {
    studentId = si;
    year = y;
    month = m;
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
        submitButton.textContent = "Subiendo...";
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
            year,
            month,
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
        submitButton.textContent = "Crear Factura";
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
    year = null;
    month = null;
    type = null;
}