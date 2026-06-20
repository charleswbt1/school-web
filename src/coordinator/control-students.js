const documentTypes = [
    "curp",
    "acta",
    "certificado",
    "titulo",
    "cedula",
    "ine"
];

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

        const courseId =
            new URLSearchParams(
                window.location.search
            ).get("id");

        const response = await fetch(
            `${apiUrl}/api/students/control?course_id=${courseId}`
        );

        const data = await response.json();

        const months = getMonths(
            data.date_init,
            data.date_end
        );

        const table =
            document.getElementById(
                "studentsTable"
            );

        table.innerHTML = `
            <thead>

                <tr>

                    <th rowspan="2">
                        Alumno
                    </th>

                    <th rowspan="2">
                        CURP
                    </th>

                    <th rowspan="2">
                        Teléfono
                    </th>

                    <th colspan="${documentTypes.length}">
                        Documentos
                    </th>

                    <th colspan="${months.length}">
                        Pagos
                    </th>

                </tr>

                <tr>

                    ${documentTypes.map(type => `
                        <th>
                            ${type.toUpperCase()}
                        </th>
                    `).join("")}

                    ${months.map(month => `
                        <th>
                            ${month.month}
                            ${month.year}
                        </th>
                    `).join("")}

                </tr>

            </thead>

            <tbody>

                ${data.students.map(student => {

                    const documents =
                        documentTypes.map(type => {

                            const exists =
                                student.documents.some(
                                    document =>
                                        document.type.toLowerCase() === type
                                );

                            return `
                                <td style="text-align:center">
                                    <input
                                        type="checkbox"
                                        ${exists ? "checked" : ""}
                                        disabled
                                    >
                                </td>
                            `;
                        }).join("");

                    const payments =
                        months.map(period => {

                            const totalPaid =
                                student.payments
                                    .filter(payment =>
                                        payment.year === period.year &&
                                        payment.month === period.month
                                    )
                                    .reduce(
                                        (sum, payment) =>
                                            sum + Number(payment.amount || 0),
                                        0
                                    );

                            return `
                                <td style="text-align:right">
                                    ${totalPaid > 0
                                        ? `$${totalPaid.toLocaleString()}`
                                        : "-"
                                    }
                                </td>
                            `;
                        }).join("");

                    return `
                        <tr>

                            <td>
                                ${student.name}
                            </td>

                            <td>
                                ${student.curp}
                            </td>

                            <td>
                                ${student.phone}
                            </td>

                            ${documents}

                            ${payments}

                        </tr>
                    `;

                }).join("")}

            </tbody>
        `;

    } catch (error) {

        console.error(error);

    }
}

loadStudents();