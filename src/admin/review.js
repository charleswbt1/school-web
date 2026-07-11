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
        const response = await fetch(`${apiUrl}/api/courses/review?year=${yearSelect.value}&month=${monthSelect.value}`);
        const reviews = await response.json();

        const tbody = document.getElementById("review-table-body");
        tbody.innerHTML = "";

        reviews.forEach(review => {

            if (review.courses.length === 0) {

                tbody.innerHTML += `
                    <tr>
                        <td>${review.coordinator_name}</td>
                        <td colspan="3" style="text-align:center;">
                            Sin cursos
                        </td>
                    </tr>
                `;

                return;
            }

            const totalStudents = review.courses.reduce(
                (sum, course) => sum + course.paymentStudents,
                0
            );

            const totalAmount = review.courses.reduce(
                (sum, course) => sum + course.amount,
                0
            );

            review.courses.forEach((course, index) => {

                tbody.innerHTML += `
                    <tr>

                        ${index === 0 ? `
                            <td rowspan="${review.courses.length + 1}">
                                <strong>${review.coordinator_name}</strong>
                            </td>
                        ` : ""}

                        <td>${course.course_name}</td>

                        <td style="text-align:center;">
                            ${course.paymentStudents} / ${course.students}
                        </td>

                        <td style="text-align:right;">
                            $${course.amount.toLocaleString("es-MX")}
                        </td>

                    </tr>
                `;
            });

            tbody.innerHTML += `
                <tr class="row-active">

                    <td>
                        <strong>TOTAL</strong>
                    </td>

                    <td style="text-align:center;">
                        <strong>${totalStudents}</strong>
                    </td>

                    <td style="text-align:right;">
                        <strong>$${totalAmount.toLocaleString("es-MX")}</strong>
                    </td>

                </tr>
            `;

        });

    } catch (error) {

        document.getElementById("review-table-body").innerHTML = `
            <tr>
                <td colspan="4">
                    Error al cargar información
                </td>
            </tr>
        `;

        console.error(error);

    }
}
loadReview();

document.getElementById("searchBtn").addEventListener("click", loadReview);