const userId = sessionStorage.getItem('userId');

async function loadModals() {
    const receiptModalFile = await fetch("../template/receipt.html");
    const receiptModalHtml = await receiptModalFile.text();
    document.getElementById("receiptModalTemplate").innerHTML = receiptModalHtml;
}
loadModals();

async function loadStudents() {
    try {
        const tbody = document.getElementById('students-table-body');
        const result = await fetch(`${apiUrl}/api/students/data?adviser_id=${userId}`);
        const response = await result.json();
        if (!result.ok) {
            throw new Error('Error al obtener alumnos');
        }
        if (!response.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">No hay alumnos registrados</td>
                </tr>
            `;
            return;
        }

        students = response;
        const advisersResponse = await fetch(`${apiUrl}/api/users?role=adviser`);
        const advisers = await advisersResponse.json();

        tbody.innerHTML = response.map(student => {
            let rowClass = '';
            switch (student.state?.toLowerCase()) {
                case 'active': rowClass = 'row-active'; break;
                case 'inactive': rowClass = 'row-inactive'; break;
                case 'pending': rowClass = 'row-pending'; break;
            }
            const adviser = advisers.find(adviser => adviser.id === student.adviser_id);

            const current = new Date(student.date_init);
            const year = String(current.getFullYear());
            const month = current.toLocaleString("es-MX", { month: "long" }).toUpperCase();

            const monthPayments = student.payments.filter(payment =>
                payment.year === year &&
                payment.month === month &&
                payment.type === 'cuota'
            );

            const totalPaid = monthPayments.reduce(
                (sum, payment) => sum + Number(payment.amount || 0), 0
            );

            const images = `
                    <div>${formatAmount(totalPaid)}</div>
                    <div class="payment-images">
                    ${monthPayments.map(payment => `
                        <span class="button-icon"
                            onclick="viewImage('${payment.url}')"
                            title="Ver comprobante $${payment.amount}">
                            🔍
                        </span>
                        <span class="button-icon"
                            onclick="viewReceipt('${student.id}','${payment.id}','${student.course_name}')"
                            title="Recibo $${payment.amount}">
                            🧾
                        </span>                    
                    `).join("")}
                    </div>
                    <span class="button-icon"
                        onclick="viewPayment('${student.course_id}','${student.id}','${year}','${month}','cuota')"
                        title="Registrar pago">
                        ⬆️
                    </span>
                `;
            return `
                <tr class="${rowClass}">
                    <td>${student.curp}</td>
                    <td>${student.name}</td>
                    <td>${student.course_name}</td>
                    <td>${student.phone}</td>                    
                    <td>${adviser.first_name} ${adviser.last_name} ${adviser.second_last_name}</td>
                    <td>${images}</td>
                </tr>
            `
        }).join('');

    } catch (error) {
        alert(error);

        document.getElementById('students-table-body').innerHTML = `
            <tr>
                <td colspan="7">
                    Error al cargar los alumnos
                </td>
            </tr>
        `;
    }
}

loadStudents();

document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    const btnAdd = document.getElementById('btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            window.location.href = '../user/register.html';
        });
    }
});
