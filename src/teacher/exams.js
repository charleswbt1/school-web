const userId = sessionStorage.getItem("userId");

async function loadExams() {
    try {
        const response = await fetch(`${apiUrl}/api/exams?teacher_id=${userId}`);
        const exams = await response.json();

        const tbody = document.getElementById("examsTableBody");

        if (!exams.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9">
                        No hay examenes registrados
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = exams.map(exam => {
            return `
                <tr>
                    <td>${exam.id}</td>
                    <td>${exam.name}</td>
                    <td>${exam.description}</td>
                      <td>
                        <button
                            onclick="editExam('${exam.id}')">
                            Editar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('teacher exams: Error al cargar examenes', error);
        document.getElementById("examsTableBody").innerHTML = `
            <tr>
                <td colspan="9">
                    Error al cargar examenes
                </td>
            </tr>
        `;
    }
}

function editExam(id) {
    window.location.href = `exam-register.html?id=${id}`;
}

loadExams();

document.addEventListener('DOMContentLoaded', () => {
    const btnAdd = document.getElementById('btn-add-exam');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            window.location.href = 'exam-register.html';
        });
    }
});