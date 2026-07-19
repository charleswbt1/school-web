const teamIdSession = sessionStorage.getItem("team_id");
const yearSelect = document.getElementById("reviewYear");
const monthSelect = document.getElementById("reviewMonth");

const months = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE"
];

function loadPage() {
    const today = new Date();
    months.forEach(month => monthSelect.innerHTML += `<option value="${month}">${month}</option>`);
    monthSelect.value = months[today.getMonth()];
    for (let year = today.getFullYear() + 1; year >= 2023; year--) {
        yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    }
    yearSelect.value = today.getFullYear();
}
loadPage();

async function loadReview() {
    try {

        const response = await fetch(
            `${apiUrl}/api/courses/review?year=${yearSelect.value}&month=${monthSelect.value}&team=${teamIdSession}`
        );

        const reviews = await response.json();

        const showTitleColumns = reviews.some(review =>
            review.courses.some(course =>
                Number(course.titlePaymentStudents) > 0 ||
                Number(course.titleAmount) > 0
            )
        );

        const thead = document.getElementById("review-table-head");
        thead.innerHTML = `
            <tr>
                <th>Coordinador</th>
                <th>Curso</th>
                <th>Cuotas</th>
                <th>Monto Cuotas</th>

                ${showTitleColumns ? `
                    <th>Títulos</th>
                    <th>Monto Títulos</th>
                ` : ""}
            </tr>
        `;

        const tbody = document.getElementById("review-table-body");

        let html = "";

        reviews.forEach(review => {

            if (review.courses.length === 0) {

                html += `
                    <tr>
                        <td>${review.coordinator_name}</td>
                        <td colspan="${showTitleColumns ? 5 : 3}" style="text-align:center;">
                            Sin cursos
                        </td>
                    </tr>
                `;

                return;
            }

            const groups = Object.values(
                review.courses.reduce((acc, course) => {

                    const key = `${course.year}-${course.month}`;

                    if (!acc[key]) {
                        acc[key] = {
                            year: course.year,
                            month: course.month,
                            courses: [],
                            students: 0,
                            paymentStudents: 0,
                            amount: 0,
                            titlePaymentStudents: 0,
                            titleAmount: 0
                        };
                    }

                    acc[key].courses.push(course);
                    acc[key].students += course.students;
                    acc[key].paymentStudents += course.paymentStudents;
                    acc[key].amount += course.amount;
                    acc[key].titlePaymentStudents += course.titlePaymentStudents;
                    acc[key].titleAmount += course.titleAmount;

                    return acc;

                }, {})
            );

            const totalRows = groups.reduce(
                (sum, group) => sum + group.courses.length + 1,
                0
            ) + 1;

            const totalStudents = groups.reduce(
                (sum, group) => sum + group.students,
                0
            );

            const totalPayments = groups.reduce(
                (sum, group) => sum + group.paymentStudents,
                0
            );

            const totalAmount = groups.reduce(
                (sum, group) => sum + group.amount,
                0
            );

            const totalTitlePayments = groups.reduce(
                (sum, group) => sum + group.titlePaymentStudents,
                0
            );

            const totalTitleAmount = groups.reduce(
                (sum, group) => sum + group.titleAmount,
                0
            );

            groups.forEach((group, index) => {

                html += `
                    <tr class="row-active">

                        ${index === 0 ? `
                            <td rowspan="${totalRows}">
                                <strong>${review.coordinator_name}</strong>
                            </td>
                        ` : ""}

                        <td>
                            <strong>${group.month} ${group.year}</strong>
                        </td>

                        <td style="text-align:center;">
                            <strong>${group.paymentStudents} / ${group.students}</strong>
                        </td>

                        <td style="text-align:right;">
                            <strong>$${group.amount.toLocaleString("es-MX")}</strong>
                        </td>

                        ${showTitleColumns ? `
                            <td style="text-align:center;">
                                <strong>${group.titlePaymentStudents}</strong>
                            </td>

                            <td style="text-align:right;">
                                <strong>$${group.titleAmount.toLocaleString("es-MX")}</strong>
                            </td>
                        ` : ""}

                    </tr>
                `;

                group.courses.forEach(course => {

                    html += `
                        <tr>

                            <td>${course.course_name}</td>

                            <td style="text-align:center;">
                                ${course.paymentStudents} / ${course.students}
                            </td>

                            <td style="text-align:right;">
                                $${course.amount.toLocaleString("es-MX")}
                            </td>

                            ${showTitleColumns ? `
                                <td style="text-align:center;">
                                    ${course.titlePaymentStudents}
                                </td>

                                <td style="text-align:right;">
                                    $${course.titleAmount.toLocaleString("es-MX")}
                                </td>
                            ` : ""}

                        </tr>
                    `;
                });

            });

            html += `
                <tr class="row-active">

                    <td>
                        <strong>TOTAL GENERAL</strong>
                    </td>

                    <td style="text-align:center;">
                        <strong>${totalPayments} / ${totalStudents}</strong>
                    </td>

                    <td style="text-align:right;">
                        <strong>$${totalAmount.toLocaleString("es-MX")}</strong>
                    </td>

                    ${showTitleColumns ? `
                        <td style="text-align:center;">
                            <strong>${totalTitlePayments}</strong>
                        </td>

                        <td style="text-align:right;">
                            <strong>$${totalTitleAmount.toLocaleString("es-MX")}</strong>
                        </td>
                    ` : ""}

                </tr>
            `;
        });

        tbody.innerHTML = html;

    } catch (error) {

        document.getElementById("review-table-body").innerHTML = `
            <tr>
                <td colspan="6">
                    Error al cargar la información
                </td>
            </tr>
        `;

        console.error(error);
    }
}

loadReview();

document
    .getElementById("searchBtn")
    .addEventListener("click", loadReview);