function getMonths(dateInit, dateEnd) {
    const months = [];
    const start = new Date(dateInit);
    const end = new Date(dateEnd);
    const current = new Date(start);

    while (current <= end) {
        months.push({
            year: String(current.getFullYear()),
            month: current
                .toLocaleString("es-MX", {
                    month: "long"
                })
                .toUpperCase()
        });
        current.setMonth(current.getMonth() + 1);
    }

    return months;
}

async function loadStudents() {
    try {
        const courseId = new URLSearchParams(window.location.search).get("id");
        const response = await fetch(`${apiUrl}/api/students/control?course_id=${courseId}`);
        const data = await response.json();

        const months = getMonths(data.date_init, data.date_end);
        const table = document.getElementById("studentsTable");

        const paymentTotals = months.map(period => {
            return data.students.reduce((sum, student) => {
                const totalPaid = (student.payments || [])
                    .filter(payment =>
                        payment.year === period.year &&
                        payment.month === period.month
                    )
                    .reduce(
                        (subtotal, payment) =>
                            subtotal + Number(payment.amount || 0),
                        0
                    );
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
                    (sum, payment) => sum + Number(payment.amount || 0),
                    0
                );

                const images = monthPayments.map(payment => `
                    <div class="button-container">
                        <button
                            onclick="viewImage('${payment.url}')">
                            Pago
                        </button>
                    </div>
                `).join("");

                return `
        <td style="text-align:center">
            ${totalPaid > 0
                        ? `
                    <div>$${totalPaid.toLocaleString()}</div>
                    <div class="payment-images">
                        ${images}
                    </div>
                `
                        : "-"
                    }
        </td>
    `;

            }).join("");

            let rowClass = '';

            switch (student.state?.toLowerCase()) {
                case 'active':
                    rowClass = 'row-active';
                    break;

                case 'inactive':
                    rowClass = 'row-inactive';
                    break;

                case 'pending':
                    rowClass = 'row-pending';
                    break;
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

function viewImage(imageUrl) {
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");

    modalImage.src = imageUrl;
    modal.style.display = "flex";

    modal.addEventListener("click", () => {
        modal.style.display = "none";
        const modalImage = document.getElementById("modalImage");
        modalImage.src = '';
    });
}