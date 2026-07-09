const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get("student_id");
const examId = urlParams.get("id");
const courseId = urlParams.get("course_id");
const moduleId = urlParams.get("module_id");

async function loadExam() {
    const response = await fetch(
        `${apiUrl}/api/exams/questions?exam_id=${examId}`
    );
    const exam = await response.json();

    document.getElementById("moduleName").innerHTML = exam.name;
    return exam;
}

function showQuestion() {
    const question = exam.questions[current];
    document.getElementById("questionCounter").innerHTML = `Pregunta ${current + 1} / ${exam.questions.length}`;
    document.getElementById("questionText").innerHTML = question.question;
    document.getElementById("nextBtn").textContent =
        current === exam.questions.length - 1
            ? "Finalizar examen"
            : "Siguiente";

    const answers = document.getElementById("answersContainer");
    answers.innerHTML = "";

    question.answers.forEach((answer, index) => {
        answers.innerHTML += `
        <label class="answer">
            <input
                type="radio"
                name="answer"
                value="${index}"
            >
            ${answer.answer}
        </label>
    `;
    });

    if (selectedAnswers[current]) {
        const radio = document.querySelector(
            `input[value="${selectedAnswers[current].selected}"]`
        );
        if (radio) {
            radio.checked = true;
        }
    }
}

function updateJourney() {
    const percent = ((current + 1) / exam.questions.length) * 100;
    document.getElementById("progressBar").style.width = percent + "%";
    document.getElementById("player").style.left = `calc(${percent}% - 20px)`;
}

function updateBackground() {
    const stage = Math.min(Math.floor(current / 4) + 1, 5);
    document.body.style.backgroundImage = `url('../images/exam/bosque.png')`;
}

document.getElementById("nextBtn").addEventListener("click", nextQuestion);

let exam;
let current = 0;
const selectedAnswers = [];

async function init() {
    exam = await loadExam();

    updateJourney();
    setTimeout(() => {
        showQuestion();
        updateBackground();
    }, 400);
}

init();

document.getElementById("prevBtn").onclick = () => {

    if (current === 0) return;

    current--;

    updateJourney();
    setTimeout(() => {
        showQuestion();
        updateBackground();
    }, 400);
};

async function nextQuestion() {

    const selected = document.querySelector(
        "input[name='answer']:checked"
    );

    if (!selected) {
        showError("Selecciona una respuesta.");
        return;
    }

    selectedAnswers[current] = {
        selected: Number(selected.value)
    };

    current++;

    if (current >= exam.questions.length) {

        finishExam();
        return;
    }

    updateJourney();
    setTimeout(() => {
        showQuestion();
        updateBackground();
    }, 400);
}

async function finishExam() {
    const btn = document.getElementById("nextBtn");
    btn.disabled = true;
    try {

        const response = await fetch(
            `${apiUrl}/api/exams/evaluate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({

                    exam_id: examId,
                    answers: selectedAnswers

                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            await showError("Error al evaluar el examen.");
            return;
        }

        await fetch(
            `${apiUrl}/api/students/qualification`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    module_id: moduleId,
                    qualification: Number(result.average),
                    student_id: studentId,
                    state: result.approved ? "aprobado" : "fallo"
                })
            }
        );

        if (!result.approved) {
            await showError(`
                Obtuviste ${result.score} de ${exam.questions.length}
                <br>
                Calificación: ${result.average.toFixed(1)}
            `);
        } else {
            await showSuccess(`
                Obtuviste ${result.score} de ${exam.questions.length}
                <br>
                Calificación: ${result.average}
            `);
        }
        window.location.href = `course.html?id=${studentId}`;
    } finally {
        btn.disabled = false;
    }
}