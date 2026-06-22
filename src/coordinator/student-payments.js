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
                            <div class="view-image-container" id="frame-image"> 
                                <img id="previewImage" class="view-bill-image" src="${payment.url}" onclick="window.open('${payment.url}', '_blank')">
                            </div> 
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