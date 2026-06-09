const studentId = new URLSearchParams(window.location.search).get('id');

async function loadPayments() {
    try {
        const response = await fetch(`${apiUrl}/api/students?id=${studentId}`);
        const jsonResponse = await response.json();
        const student = jsonResponse[0];

        const tbody = document.getElementById('paymentsTableBody');

        if (!student.payments || !student.payments.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No hay pagos registrados
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = student.payments.map((payment, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${new Date(payment.date).toLocaleString()}</td>
                        <td>$${Number(payment.amount).toLocaleString()}</td>                        
                        <td>
                            <img
                                src="${payment.url}"
                                alt="Comprobante"
                                style="
                                    width:auto;
                                    height:auto;
                                    border-radius:8px;
                                    cursor:pointer;
                                "
                                onclick="window.open('${payment.url}', '_blank')"
                            >
                        </td>
                    </tr>
                `)
            .join('');
    } catch (error) {
        document.getElementById('paymentsTableBody').innerHTML = `
            <tr>
                <td colspan="4">
                    Error al cargar pagos
                </td>
            </tr>
        `;
    }
}

loadPayments();