const examId = new URLSearchParams(window.location.search).get("id");
const questionsContainer = document.getElementById("questionsContainer");
const userId = sessionStorage.getItem("userId");
const role = sessionStorage.getItem("role");

async function loadExam() {
    document.getElementById("examTitle").textContent = examId ? "Editar Examen" : "Crear Examen";
    document.getElementById("examBtn").textContent = examId ? "Actualizar Examen" : "Guardar Examen";
    document.getElementById("deleteExamBtn").style.display = examId ? "block" : "none";
    if (!examId) {
        return;
    }
    const response = await fetch(`${apiUrl}/api/exams?id=${examId}`);
    const exam = (await response.json())[0];

    document.getElementById("examName").value = exam.name;
    document.getElementById("examDescription").value = exam.description;
    document.getElementById("theme").value = exam.theme;
    questionsContainer.innerHTML = "";
    exam.questions.forEach(question => {
        addQuestion(question);
    });
}

function addQuestion(questionData = null) {
    const template = document.getElementById("questionTemplate");
    const question = template.content.firstElementChild.cloneNode(true);
    const answersContainer = question.querySelector(".answers-container");

    question.querySelector(".add-answer-btn").addEventListener("click", () => {
        addAnswer(answersContainer);
    });

    question.querySelector(".remove-question-btn").addEventListener("click", () => {
        question.remove();
    });

    if (questionData) {
        question.querySelector(".question-text").value = questionData.question;
        questionData.answers.forEach(answer => {
            addAnswer(answersContainer, answer);
        });
    } else {
        for (let i = 0; i < 3; i++) {
            addAnswer(answersContainer);
        }
    }

    questionsContainer.appendChild(question);
}

function addAnswer(container, answerData = null) {
    const template = document.getElementById("answerTemplate");
    const answer = template.content.firstElementChild.cloneNode(true);

    answer.querySelector(".remove-answer-btn").addEventListener("click", () => {
        answer.remove();
    });

    if (answerData) {
        answer.querySelector(".answer-text").value = answerData.answer;
        answer.querySelector(".answer-correct").checked = answerData.is_correct;
    }

    container.appendChild(answer);
}

document.getElementById("addQuestionBtn").addEventListener("click", () => addQuestion());

document.getElementById("examForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = e.target.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.style.opacity = ".7";

    const exam = {
        coordinator_id: role === "coordinator" ? sessionStorage.getItem("userId") : "",
        teacher_id: role === "teacher" ? sessionStorage.getItem("userId") : "",
        name: document.getElementById("examName").value,
        description: document.getElementById("examDescription").value,
        theme: document.getElementById("theme").value,
        questions: []
    };

    document.querySelectorAll(".question-card").forEach(questionCard => {
        const question = {
            question: questionCard.querySelector(".question-text").value,
            answers: []
        };

        questionCard.querySelectorAll(".answer-card").forEach(answerCard => {
            question.answers.push({
                answer: answerCard.querySelector(".answer-text").value,
                is_correct: answerCard.querySelector(".answer-correct").checked
            });
        });

        exam.questions.push(question);
    });

    try {
        const path = examId ? `?id=${examId}` : ``;
        const serverMethod = examId ? "PATCH" : "POST";
        const response = await fetch(
            `${apiUrl}/api/exams${path}`,
            {
                method: serverMethod,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(exam)
            }
        );

        if (!response.ok) {
            throw new Error();
        }

        await showSuccess("Examen registrado correctamente");
        window.location.href = "exams.html";
    } catch (error) {
        console.error("teacher exam-create: Error al registrar el examen:", error);
        showError("Fallo al registrar el examen");
    } finally {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
    }
});

document.getElementById("deleteExamBtn").addEventListener("click", async (e) => {
    const submitButton = e.currentTarget;
    submitButton.disabled = true;
    submitButton.style.opacity = ".7";
    try {
        if (!await showConfirm("¿Deseas eliminar este examen?")) {
            return;
        }
        const response = await fetch(
            `${apiUrl}/api/exams?id=${examId}`,
            {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        if (!response.ok) {
            throw new Error();
        }
        await showSuccess("Examen eliminado correctamente");
        window.location.href = "exams.html";
    } catch (error) {
        console.error("teacher exam-delete: Error al eliminar el examen:", error);
        showError("Fallo al eliminar el examen");
    } finally {
        submitButton.disabled = false;
        submitButton.style.opacity = "1";
    }
});

loadExam();