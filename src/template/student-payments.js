const roleSession = sessionStorage.getItem('role');
let students;

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
function closeImage() {
    payImage.src = '';
    modalImage.style.display = "none";
}
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
function viewPayment(courseId, studentId, y, m, t) {
    const student = students.find(student => student.id === studentId);
    document.getElementById("bill-year").textContent = y;
    document.getElementById("bill-month").textContent = m;
    document.getElementById("student-name").textContent = student.name;
    document.getElementById("bill-type").textContent = t;
    document.getElementById("student-id-pay").textContent = studentId;
    document.getElementById("course-id").textContent = courseId;
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
        const studentId = document.getElementById("student-id-pay").textContent;
        const courseId = document.getElementById("course-id").textContent;

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

        const billRequest = {
            url: uploadData.url,
            student_id: studentId,
            amount,
            year: document.getElementById("bill-year").textContent,
            month: document.getElementById("bill-month").textContent,
            type: document.getElementById("bill-type").textContent,
            source: roleSession
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
}

const modalReceipt = document.getElementById("receiptModal");
modalReceipt.addEventListener("click", (e) => {
    if (e.target === modalReceipt) {
        modalReceipt.style.display = "none";
    }
});
function viewReceipt(studentId, paymentId, courseName) {
    const student = students.find(student => student.id === studentId);
    const payment = student.payments.find(payment => payment.id === paymentId);
    document.getElementById("receiptNumber").textContent = payment.id.replace('PAY_', '') ?? "000000";
    document.getElementById("date").textContent = formatDate(payment.date);
    document.getElementById("total").textContent = `$${Number(payment.amount).toLocaleString()}`;
    document.getElementById("customer").textContent = student.name;
    document.getElementById("document").textContent = student.curp;
    document.getElementById("code").textContent = student.school_id ?? '';
    document.getElementById("concept").textContent = payment.type === 'cuota' ? 'Colegiatura' : 'Documento'
    document.getElementById("program").textContent = courseName;
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